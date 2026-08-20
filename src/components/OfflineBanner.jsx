import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <div
        style={{
          backgroundColor: '#166534',
          color: '#ffffff',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          zIndex: 9999,
          position: 'sticky',
          top: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Wifi size={16} />
        {language === 'mr'
          ? 'पुन्हा इंटरनेट कनेक्ट झाले — सर्व सेवा सुरू आहेत.'
          : language === 'hi'
          ? 'इंटरनेट फिर से जुड़ गया है — सभी सेवाएं सक्रिय हैं।'
          : 'Back Online — All features and cloud syncing active.'}
      </div>
    );
  }

  if (!isOffline || dismissed) return null;

  return (
    <div
      style={{
        backgroundColor: '#b45309',
        color: '#ffffff',
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 9999,
        position: 'sticky',
        top: 0,
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <WifiOff size={18} style={{ flexShrink: 0 }} />
        <span>
          {language === 'mr'
            ? 'ऑफलाईन मोड — इंटरनेट कनेक्शन उपलब्ध नाही. तुम्ही सेव्ह केलेला डेटा आणि मार्गदर्शक पाहू शकता.'
            : language === 'hi'
            ? 'ऑफ़लाइन मोड — इंटरनेट कनेक्शन उपलब्ध नहीं है। आप सहेजा गया डेटा और गाइड देख सकते हैं।'
            : 'Offline Mode — Low or no internet. You can still access cached data, guides, and tools.'}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
