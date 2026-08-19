import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';
import { Bot, Send, Sparkles, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    // Optionally load previous conversation history
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

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.sendMessage(userMsg, {
        conversationId,
        farmerId: user?.id,
        language: language || 'en'
      });
      
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }
      
      setMessages(prev => [...prev, { role: response.role || 'assistant', content: response.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('ai.errorMessage') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
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
      minHeight: '480px',
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
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'Manrope, sans-serif' }}>FarmAI Assistant</h2>
            <span style={{ fontSize: '12px', color: '#dcfce7', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Agricultural AI Copilot
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              cursor: 'pointer' 
            }}
          >
            <Trash2 size={14} />
            <span className="clear-btn-text">{t('ai.clearChat')}</span>
          </button>
        </div>
      </div>

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
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              maxWidth: '80%', 
              padding: '14px 18px', 
              borderRadius: '16px',
              borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
              borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
              background: msg.role === 'user' ? '#15803d' : 'white',
              color: msg.role === 'user' ? 'white' : '#17351f',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: msg.role === 'assistant' ? '1px solid #e5eee7' : 'none',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              fontSize: '15px'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
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
            onClick={() => setInput(s)} 
            style={{ 
              background: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              color: '#166534', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              whiteSpace: 'nowrap', 
              fontSize: '13px', 
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} style={{ padding: '14px 16px', background: 'white', display: 'flex', gap: '10px', borderTop: '1px solid #e5eee7', flexShrink: 0 }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t('ai.placeholder')}
          style={{ flex: 1, padding: '12px 18px', borderRadius: '24px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none' }}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || loading} 
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