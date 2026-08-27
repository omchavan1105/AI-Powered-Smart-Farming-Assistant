import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';
import { Bot, Send, Trash2, Loader2, CheckCircle2, Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { DataBadge } from '../components/ui';

const FarmAI = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('ai.welcomeMessage') }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    // Check browser speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        try {
          const recent = await aiService.getRecentConversations(user.id);
          if (recent && recent.length > 0) {
            setConversationId(recent[0].id);
            const history = await aiService.getConversationHistory(recent[0].id);
            if (history && history.length > 0) {
              setMessages(history.map(m => ({ role: m.role, content: m.content })));
            }
          }
        } catch (err) {
          console.error("Error loading chat history:", err);
        }
      }
    };
    loadHistory();
  }, [user]);

  // TTS Helper
  const speakText = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      en: ['en-IN', 'en-US', 'en'],
      hi: ['hi-IN', 'hi'],
      mr: ['mr-IN', 'mr']
    };
    const candidates = langMap[language] || langMap.en;
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => candidates.some(c => v.lang.startsWith(c.split('-')[0])));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = candidates[0];
    }

    try {
      window.speechSynthesis.speak(utterance);
    } catch {}
  }, [language]);

  const handleSend = async (customText = null) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.sendMessage(textToSend, {
        conversationId,
        farmerId: user?.id,
        language: language || 'en'
      });

      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }

      setMessages(prev => [...prev, { role: response.role || 'assistant', content: response.content }]);

      if (autoSpeak) {
        speakText(response.content);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('ai.errorMessage') }]);
    } finally {
      setLoading(false);
    }
  };

  // STT Handlers
  const toggleListening = () => {
    if (!speechSupported) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      setTimeout(() => setSpeechError(''), 5000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    setSpeechError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // Set language
    const speechLangMap = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      en: 'en-IN'
    };
    recognition.lang = speechLangMap[language] || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInput(transcript);
        handleSend(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setSpeechError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        setSpeechError('No speech detected. Please speak clearly into your microphone.');
      } else {
        setSpeechError(`Voice input issue (${event.error}). You can continue using typed chat.`);
      }
      setTimeout(() => setSpeechError(''), 6000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleClearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([
      { role: 'assistant', content: t('ai.welcomeMessage') }
    ]);
    setConversationId(null);
  };

  const suggestions = [
    t('ai.suggestion1'),
    t('ai.suggestion2'),
    t('ai.suggestion3')
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      minHeight: '520px',
      maxWidth: '900px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      border: '1px solid #e5eee7'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #166534, #14532d)',
        padding: '16px 20px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'Manrope, sans-serif' }}>FarmAI Assistant</h2>
            <span style={{ fontSize: '12px', color: '#dcfce7', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Multilingual Agricultural Voice Copilot
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Auto-TTS Toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            title={autoSpeak ? 'Auto-voice read is ON' : 'Auto-voice read is OFF'}
            aria-label="Toggle auto voice output"
            style={{
              background: autoSpeak ? '#e7f5e9' : 'rgba(255,255,255,0.12)',
              color: autoSpeak ? '#166534' : 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              fontWeight: 600,
              minHeight: '36px'
            }}
          >
            {autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>Voice {autoSpeak ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleClearChat}
            title={t('ai.clearChat')}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              minHeight: '36px'
            }}
          >
            <Trash2 size={14} />
            <span className="clear-btn-text">{t('ai.clearChat')}</span>
          </button>
        </div>
      </div>

      {/* Voice / Mic Error Banner */}
      {speechError && (
        <div style={{
          background: '#fef2f2',
          borderBottom: '1px solid #fecaca',
          padding: '10px 16px',
          color: '#991b1b',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{speechError}</span>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: '#f8fcf8'
      }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
              {!isUser && (
                <button
                  onClick={() => speakText(msg.content)}
                  title="Read response aloud"
                  aria-label="Read response aloud"
                  style={{
                    background: '#e7f5e9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: '#166534',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    marginBottom: '4px'
                  }}
                >
                  <Volume2 size={15} />
                </button>
              )}

              <div style={{
                maxWidth: '80%',
                padding: '14px 18px',
                borderRadius: '16px',
                borderBottomRightRadius: isUser ? '4px' : '16px',
                borderBottomLeftRadius: !isUser ? '4px' : '16px',
                background: isUser ? '#15803d' : 'white',
                color: isUser ? 'white' : '#17351f',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: !isUser ? '1px solid #e5eee7' : 'none',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                fontSize: '15px'
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'white', padding: '12px 18px', borderRadius: '16px', borderBottomLeftRadius: '4px', border: '1px solid #e5eee7', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span className="dot-pulse">●</span>
              <span className="dot-pulse" style={{ animationDelay: '0.2s' }}>●</span>
              <span className="dot-pulse" style={{ animationDelay: '0.4s' }}>●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', overflowX: 'auto', borderTop: '1px solid #e5eee7', background: 'white', flexShrink: 0 }}>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => { setInput(s); handleSend(s); }}
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '6px 14px',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              fontSize: '13px',
              cursor: 'pointer',
              flexShrink: 0,
              minHeight: '36px'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Bar with Mic STT Button */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '14px 16px', background: 'white', display: 'flex', gap: '10px', alignItems: 'center', borderTop: '1px solid #e5eee7', flexShrink: 0 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isListening ? 'Listening to your voice...' : t('ai.placeholder')}
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: '24px',
            border: isListening ? '2px solid #dc2626' : '1px solid #d8e5da',
            fontSize: '15px',
            outline: 'none',
            background: isListening ? '#fef2f2' : 'white'
          }}
        />

        {/* Microphone Button */}
        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? 'Stop listening' : 'Speak to FarmAI'}
          aria-label={isListening ? 'Stop listening' : 'Speak to FarmAI'}
          style={{
            background: isListening ? '#dc2626' : '#e7f5e9',
            color: isListening ? 'white' : '#166534',
            border: 'none',
            borderRadius: '50%',
            width: '46px',
            height: '46px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            animation: isListening ? 'pulse 1s infinite' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send message"
          style={{
            background: '#15803d',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '46px',
            height: '46px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            opacity: (!input.trim() || loading) ? 0.5 : 1,
            flexShrink: 0
          }}
        >
          <Send size={18} />
        </button>
      </form>

      <style>{`
        @media (max-width: 480px) {
          .clear-btn-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default FarmAI;