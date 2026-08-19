import { supabase } from '../lib/supabase';

// Local Multilingual Agricultural Knowledge Base for offline/unconfigured Edge Function fallback
const AGRI_KNOWLEDGE_BASE = {
  en: [
    {
      keywords: ["blight", "fungus", "spot", "disease", "yellow leaf", "leaf spot"],
      response: "For fungal and bacterial leaf diseases like Early Blight or Leaf Spot, apply a protective spray of Mancozeb (2.5 g/L) or Copper Oxychloride (3 g/L). For organic control, spray 5% Neem Seed Kernel Extract (NSKE) or Trichoderma viride. Ensure good plant spacing to improve airflow."
    },
    {
      keywords: ["fertilizer", "npk", "urea", "dap", "potash", "nitrogen", "soil"],
      response: "A standard balanced fertilizer regimen for vegetables is 100:50:50 kg NPK/hectare. Apply full Phosphorus (SSP/DAP) and Potassium (MOP) as basal dose during sowing. Split Nitrogen into 2-3 top dressings at 30 and 50 days after transplanting."
    },
    {
      keywords: ["irrigation", "water", "drip", "watering"],
      response: "During vegetative and flowering stages, crops require consistent moisture. Avoid waterlogging which promotes root rot. Water early in the morning or late evening. Drip irrigation saves 40-50% water while maintaining optimal root zone moisture."
    },
    {
      keywords: ["scheme", "subsidy", "pm kisan", "pmfby", "loan", "kcc"],
      response: "Key government farming schemes include PM-KISAN (₹6,000/year direct support), PMFBY (Pradhan Mantri Fasal Bima Yojana for crop insurance with 1.5-2% premium), and Kisan Credit Card (KCC) for subsidized 4% crop loans. Visit your nearest CSC or state agriculture portal."
    },
    {
      keywords: ["pest", "insect", "worm", "caterpillar", "borer", "aphid"],
      response: "For sucking pests (aphids, whiteflies), install yellow sticky traps (10/acre) and spray Imidacloprid (0.5 ml/L) or 5% Neem oil. For fruit and shoot borers, install pheromone traps (5/acre) and apply Emamectin Benzoate 5% SG (0.4 g/L)."
    },
    {
      keywords: ["tomato", "onion", "soybean", "cotton", "wheat"],
      response: "For your crop, ensure timely weeding in the first 30 days, monitor soil moisture around flowering, and avoid excess nitrogen which can attract sucking pests. Check the 'Crop Intelligence' tab for detailed soil and water requirements."
    }
  ],
  hi: [
    {
      keywords: ["झुलसा", "फफूंद", "रोग", "पीली पत्ती", "धब्बा", "disease", "blight"],
      response: "पत्तियों के झुलसा (अर्ली ब्लाइट) व धब्बा रोग के लिए मेंकोजेब (2.5 ग्राम/लीटर) या कॉपर ऑक्सीक्लोराइड (3 ग्राम/लीटर) का छिड़काव करें। जैविक उपाय हेतु 5% नीम तेल या ट्राइकोडर्मा विरिडी का प्रयोग करें।"
    },
    {
      keywords: ["खाद", "उर्वरक", "यूरिया", "डीएपी", "पोटाश", "fertilizer", "npk"],
      response: "संतुलित पोषण हेतु बुवाई के समय फास्फोरस व पोटाश की पूरी मात्रा बेसल रूप में दें। यूरिया (नाइट्रोजन) को 2 से 3 भागों में बांटकर बुवाई के 30 व 50 दिनों बाद टॉप ड्रेसिंग के रूप में डालें।"
    },
    {
      keywords: ["सिंचाई", "पानी", "ड्रिप", "irrigation", "water"],
      response: "फूल आने और फल बनने की अवस्था में खेत में पर्याप्त नमी बनाए रखें। जलभराव से बचें जिससे जड़ गलन का खतरा रहता है। सुबह या शाम के समय सिंचाई करना सर्वोत्तम होता है।"
    },
    {
      keywords: ["योजना", "सब्सिडी", "पीएम किसान", "बीमा", "scheme", "kcc"],
      response: "मुख्य सरकारी योजनाओं में पीएम-किसान (₹6,000/वर्ष), पीएम फसल बीमा योजना (PMFBY), और किसान क्रेडिट कार्ड (KCC 4% ब्याज) शामिल हैं। अधिक जानकारी के लिए सरकारी योजनाएं टैब देखें।"
    }
  ],
  mr: [
    {
      keywords: ["करपा", "रोग", "बुरशी", "पानांवर डाग", "disease", "blight"],
      response: "करपा आणि पानांवरील ठिपक्यांच्या नियंत्रणासाठी मॅन्कोझेब (२.५ ग्रॅम/लिटर) किंवा कॉपर ऑक्सिक्लोराईड (३ ग्रॅम/लिटर) फवारावे. सेंद्रिय नियंत्रणासाठी ५% निंबोळी अर्क किंवा ट्रायकोडर्मा वापरावे."
    },
    {
      keywords: ["खत", "युरिया", "डीएपी", "पोटॅश", "fertilizer", "npk"],
      response: "पिकांसाठी संतुलित खत व्यवस्थापन करा. फॉस्फरस आणि पोटॅशची पूर्ण मात्रा पेरणीवेळी द्यावी, तर नत्र (युरिया) ३० व ५० दिवसांनी दोन हप्त्यांत विभागून द्यावे."
    },
    {
      keywords: ["पाणी", "सिंचन", "ठिबक", "irrigation", "water"],
      response: "फुलधारणा आणि फळधारणेच्या काळात जमिनीत पुरेशी ओल ठेवा. जास्त पाणी साचू देऊ नका. ठिबक सिंचनाचा वापर केल्यास ४०-५०% पाण्याची बचत होते."
    },
    {
      keywords: ["योजना", "अनुदान", "पीएम किसान", "विमा", "scheme", "kcc"],
      response: "शासनाच्या प्रमुख योजनांमध्ये पीएम-किसान (₹६,०००/वर्ष), पंतप्रधान पीक विमा योजना (PMFBY), आणि किसान क्रेडिट कार्ड (KCC) यांचा समावेश आहे."
    }
  ]
};

function getLocalAgriculturalAdvice(message, language = 'en') {
  const langKey = (language || 'en').toLowerCase().startsWith('mr') ? 'mr' : (language || 'en').toLowerCase().startsWith('hi') ? 'hi' : 'en';
  const query = (message || '').toLowerCase();
  const rules = AGRI_KNOWLEDGE_BASE[langKey] || AGRI_KNOWLEDGE_BASE['en'];

  for (const rule of rules) {
    if (rule.keywords.some(k => query.includes(k.toLowerCase()))) {
      return rule.response;
    }
  }

  if (langKey === 'mr') {
    return "आपल्या कृषी प्रश्नासाठी: पिकांची नियमित पाहणी करा, शिफारसीनुसार खते आणि पाणी व्यवस्थापन करा. अधिक माहितीसाठी शेती सल्लागार किंवा स्थानिक कृषी अधिकाऱ्यांशी संपर्क साधा.";
  } else if (langKey === 'hi') {
    return "आपके कृषि प्रश्न हेतु: फसल की नियमित निगरानी रखें, संतुलित खाद व जल प्रबंधन अपनाएं। गंभीर कीट या रोग के लिए नजदीकी कृषि विज्ञान केंद्र से संपर्क करें।";
  }
  return "For your agricultural query: maintain balanced soil nutrition, monitor regular irrigation schedules, and adhere to integrated pest management. For specific disease identification, please use the Disease Detection tool.";
}

export const aiService = {
  sendMessage: async (message, context) => {
    let { conversationId, farmerId, language } = context;

    // Ensure conversation exists in DB
    if (!conversationId && farmerId) {
      try {
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({ farmer_id: farmerId, title: message.substring(0, 30) + '...' })
          .select()
          .single();
        if (!error && data) conversationId = data.id;
      } catch (err) {
        console.warn("Could not create conversation in DB:", err);
      }
    }

    try {
      // 1. Try Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('farm_ai_chat', {
        body: { 
          message, 
          conversationId, 
          farmerId,
          language: language || 'English'
        }
      });

      if (!error && data && data.content) {
        return {
          role: data.role || 'assistant',
          content: data.content,
          conversationId,
          isOnlineAI: true
        };
      }
    } catch (edgeErr) {
      console.warn("Supabase Edge Function offline or unconfigured, using agronomic knowledge engine:", edgeErr.message);
    }

    // 2. Intelligent local agricultural knowledge assistant
    const localReply = getLocalAgriculturalAdvice(message, language);

    // Save interaction to Supabase DB if authenticated
    if (conversationId && farmerId) {
      try {
        await supabase.from('ai_messages').insert([
          { conversation_id: conversationId, role: 'user', content: message },
          { conversation_id: conversationId, role: 'assistant', content: localReply }
        ]);
      } catch (dbErr) {
        console.warn("Could not persist local chat to DB:", dbErr);
      }
    }

    return {
      role: 'assistant',
      content: localReply,
      conversationId,
      isOnlineAI: false
    };
  },

  getConversationHistory: async (conversationId) => {
    if (!conversationId) return [];
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching history:", err);
      return [];
    }
  },
  
  getRecentConversations: async (farmerId) => {
    if (!farmerId) return [];
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching conversations:", err);
      return [];
    }
  }
};
