import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversationId, farmerId, language } = await req.json()

    // 1. Initialize Supabase Client using Auth Context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 2. Fetch Farmer Context
    let contextString = "Context unavailable.";
    if (farmerId) {
      const { data: profile } = await supabaseClient.from('farmer_profiles').select('*').eq('id', farmerId).single();
      const { data: crops } = await supabaseClient.from('farmer_crops').select('*').eq('farmer_id', farmerId).eq('status', 'active');
      const { data: soil } = await supabaseClient.from('soil_records').select('*').eq('farmer_id', farmerId).order('tested_at', { ascending: false }).limit(1).single();

      if (profile) {
        contextString = `Farmer Location: ${profile.village || 'Unknown'}, ${profile.district || 'Unknown'}, ${profile.state || 'Unknown'}. Farm size: ${profile.farm_size_acres || 'Unknown'} acres. Soil type: ${profile.soil_type || 'Unknown'}. Irrigation: ${profile.irrigation_type || 'Unknown'}.`;
        
        if (crops && crops.length > 0) {
          contextString += ` Active crops: ${crops.map((c: any) => c.crop_name).join(', ')}.`;
        }
        
        if (soil) {
          contextString += ` Latest soil test: pH ${soil.ph_level}, N: ${soil.nitrogen}, P: ${soil.phosphorus}, K: ${soil.potassium}.`;
        }
      }
    }

    // 3. Prepare OpenAI Request
    const systemPrompt = `You are FarmAI, an expert agricultural assistant for farmers in India.
Your goal is to provide accurate, easy-to-understand, and practical farming advice.
Crucially, you MUST respond in the following language: ${language || 'English'}.
Do not pretend to know specific local weather or market prices if not explicitly provided in the context.
Always recommend consulting local agricultural experts for critical disease or chemical applications.

Current Farmer Context:
${contextString}`;

    // Note: To use the official OpenAI SDK in Deno, we typically use REST or esm.sh. Here we use the raw REST API for simplicity.
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error("OPENAI_API_KEY is not set in edge function secrets");
    }

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const aiData = await openAiResponse.json();
    
    if (aiData.error) {
      throw new Error(aiData.error.message);
    }

    const aiReply = aiData.choices[0].message.content;

    // 4. Save to Database (ai_messages) if conversationId exists
    if (conversationId && farmerId) {
      // Save User Message
      await supabaseClient.from('ai_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: message
      });

      // Save AI Message
      await supabaseClient.from('ai_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiReply
      });
    }

    return new Response(
      JSON.stringify({ role: 'assistant', content: aiReply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
