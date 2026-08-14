import React, { createContext, useState, useContext, useEffect } from 'react';
import { en } from '../locales/en';
import { hi } from '../locales/hi';
import { mr } from '../locales/mr';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || '';
  });

  const translations = {
    en, hi, mr
  };

  useEffect(() => {
    if (language) {
      localStorage.setItem('app_language', language);
    }
  }, [language]);

  const t = (key) => {
    if (!language) return translations['en'][key] || key;
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
