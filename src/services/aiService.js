import { supabase } from '../lib/supabase';

export const aiService = {
  sendMessage: async (message, context) => {
    try {
      // Ensure we have a conversation ID. If not, create one.
      let { conversationId, farmerId, language } = context;

      if (!conversationId && farmerId) {
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({ farmer_id: farmerId, title: message.substring(0, 30) + '...' })
          .select()
          .single();
          
        if (error) throw error;
        conversationId = data.id;
      }

      // Invoke Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('farm_ai_chat', {
        body: { 
          message, 
          conversationId, 
          farmerId,
          language: language || 'English'
        }
      });

      if (error) throw error;
      
      // The function returns the assistant's message object directly
      return {
        role: data.role,
        content: data.content,
        conversationId: conversationId // Return it so the frontend can save it to state
      };
    } catch (err) {
      console.error("AI Service Error:", err);
      // Fallback/Error response
      return {
        role: 'assistant',
        content: "I'm sorry, I am currently unable to process your request. Please check your internet connection or try again later.",
        error: true
      };
    }
  },

  getConversationHistory: async (conversationId) => {
    if (!conversationId) return [];
    
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error("Error fetching history:", error);
      return [];
    }
    return data;
  },
  
  getRecentConversations: async (farmerId) => {
    if (!farmerId) return [];
    
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
    return data;
  }
};
