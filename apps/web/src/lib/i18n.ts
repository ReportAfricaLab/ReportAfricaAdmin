'use client';
import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const COUNTRY_DEFAULT_LANGUAGE: Record<string, string> = {
  NG: 'en', GH: 'en', KE: 'en', ZA: 'en', UG: 'en', RW: 'en',
  TZ: 'sw', ET: 'en', SN: 'fr', CM: 'fr', EG: 'ar', MA: 'ar',
  DZ: 'ar', TN: 'ar', CI: 'fr', AO: 'pt', MZ: 'pt', CD: 'fr',
  SD: 'ar', LY: 'ar', ZW: 'en', ZM: 'en', MW: 'en', BJ: 'fr',
  TG: 'fr', ML: 'fr', BF: 'fr', NE: 'fr', SL: 'en', LR: 'en',
  SO: 'ar', MG: 'fr',
};

// Global singleton state
let globalLanguage = 'en';
let globalTranslations: Record<string, string> = {};
let listeners: Set<() => void> = new Set();
let initialized = false;

function notify() {
  listeners.forEach((l) => l());
}

async function loadTranslations(lang: string) {
  try {
    const res = await fetch(`${API_URL}/localization/translations?lang=${lang}`);
    globalTranslations = await res.json();
    initialized = true;
    notify();
  } catch {}
}

// Initialize on first client load
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('ra_language');
  if (saved) {
    globalLanguage = saved;
    loadTranslations(saved);
  } else {
    const user = JSON.parse(localStorage.getItem('ra_user') || '{}');
    const defaultLang = COUNTRY_DEFAULT_LANGUAGE[user.country] || 'en';
    globalLanguage = defaultLang;
    loadTranslations(defaultLang);
  }
}

export function useI18n() {
  const [, forceUpdate] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const setLanguage = (lang: string) => {
    globalLanguage = lang;
    localStorage.setItem('ra_language', lang);
    loadTranslations(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    notify();
  };

  // Only use translations after mount to avoid hydration mismatch
  const t = useCallback((key: string, fallback?: string): string => {
    if (!mounted || !initialized) return fallback || key.split('.').pop() || key;
    return globalTranslations[key] || fallback || key.split('.').pop() || key;
  }, [mounted]);

  return {
    language: globalLanguage,
    setLanguage,
    t,
    isRTL: globalLanguage === 'ar',
    translations: globalTranslations,
  };
}
