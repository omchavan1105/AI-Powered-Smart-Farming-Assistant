/**
 * WhatsApp & SMS Sharing Service — KrishiSetu
 * Provides 1-tap WhatsApp sharing for disease diagnoses, weather alerts, and market prices.
 */

export const whatsappService = {
  /**
   * Formats a crop disease diagnosis into a structured WhatsApp message.
   */
  formatDiseaseShareMessage: (prediction, language = 'en') => {
    if (!prediction) return '';

    const crop = prediction.crop || 'Crop';
    const disease = prediction.disease || 'Unknown';
    const confidence = prediction.confidence ? `${prediction.confidence}%` : 'N/A';
    const severity = prediction.severity || 'Moderate';
    const action = prediction.recommendedAction || prediction.recommendations?.[0] || 'Consult local Krishi Vigyan Kendra (KVK).';
    const prevention = prediction.prevention || '';

    if (language === 'mr') {
      return `🌿 *कृषीसेतू पीक रोग निदान अहवाल* 🌿\n\n` +
        `🌱 *पीक:* ${crop}\n` +
        `🔍 *निदान:* ${disease}\n` +
        `🎯 *अचूकता (Confidence):* ${confidence}\n` +
        `⚠️ *तीव्रता (Severity):* ${severity}\n\n` +
        `💊 *शिफारस केलेला उपाय (Treatment):*\n${action}\n\n` +
        (prevention ? `🛡️ *प्रतिबंधात्मक काळजी:*\n${prevention}\n\n` : '') +
        `📱 _कृषीसेतू - स्मार्ट शेती सहाय्यक द्वारे विश्लेषित_`;
    }

    if (language === 'hi') {
      return `🌿 *कृषिसेतु फसल रोग निदान रिपोर्ट* 🌿\n\n` +
        `🌱 *फसल:* ${crop}\n` +
        `🔍 *निदान:* ${disease}\n` +
        `🎯 *सटीकता (Confidence):* ${confidence}\n` +
        `⚠️ *गंभीरता (Severity):* ${severity}\n\n` +
        `💊 *अनुशंसित उपचार (Treatment):*\n${action}\n\n` +
        (prevention ? `🛡️ *बचाव के उपाय:*\n${prevention}\n\n` : '') +
        `📱 _कृषिसेतु - स्मार्ट फार्मिंग असिस्टेंट द्वारा विश्लेषित_`;
    }

    // Default English
    return `🌿 *KrishiSetu Crop Health Diagnosis Report* 🌿\n\n` +
      `🌱 *Crop:* ${crop}\n` +
      `🔍 *Diagnosis:* ${disease}\n` +
      `🎯 *Confidence:* ${confidence}\n` +
      `⚠️ *Severity:* ${severity}\n\n` +
      `💊 *Recommended Treatment:*\n${action}\n\n` +
      (prevention ? `🛡️ *Prevention:*\n${prevention}\n\n` : '') +
      `📱 _Analyzed by KrishiSetu — Smart Farming Assistant_`;
  },

  /**
   * Formats a weather advisory alert into a WhatsApp message.
   */
  formatWeatherAlertMessage: (alertMessage, language = 'en') => {
    if (language === 'mr') {
      return `🌦️ *कृषीसेतू हवामान सूचना* 🌦️\n\n⚠️ ${alertMessage}\n\n📱 _कृषीसेतू द्वारे सतर्कता_`;
    }
    if (language === 'hi') {
      return `🌦️ *कृषिसेतु मौसम अलर्ट* 🌦️\n\n⚠️ ${alertMessage}\n\n📱 _कृषिसेतु द्वारा सतर्कता_`;
    }
    return `🌦️ *KrishiSetu Weather Alert* 🌦️\n\n⚠️ ${alertMessage}\n\n📱 _Broadcast by KrishiSetu_`;
  },

  /**
   * Generates a direct WhatsApp web/app deep link.
   */
  getWhatsAppShareUrl: (message, phoneNumber = '') => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    if (cleanPhone) {
      return `https://wa.me/${cleanPhone}?text=${encoded}`;
    }
    return `https://api.whatsapp.com/send?text=${encoded}`;
  },

  /**
   * Opens WhatsApp with the formatted advisory message.
   */
  shareToWhatsApp: (message, phoneNumber = '') => {
    const url = whatsappService.getWhatsAppShareUrl(message, phoneNumber);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return url;
  }
};
