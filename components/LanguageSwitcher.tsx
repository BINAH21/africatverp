'use client';

import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: 'en' | 'am' | 'ar') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLang.flag}</span>
        <span className="text-sm font-medium">{currentLang.name}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl overflow-hidden z-50 min-w-[150px]"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as 'en' | 'am' | 'ar')}
                className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-primary-50 transition-colors ${
                  language === lang.code ? 'bg-primary-100 text-primary-700' : ''
                }`}
                whileHover={{ x: 4 }}
              >
                <span>{lang.flag}</span>
                <span className="text-sm">{lang.name}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

