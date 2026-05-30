'use client';
import { useEffect, ReactNode } from 'react';

export function RTLWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Language / RTL
    const lang = localStorage.getItem('ra_language') || 'en';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // Dark mode
    const dark = localStorage.getItem('ra_dark_mode') === 'true';
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Listen for changes
  useEffect(() => {
    const handleUpdate = () => {
      const lang = localStorage.getItem('ra_language') || 'en';
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;

      const dark = localStorage.getItem('ra_dark_mode') === 'true';
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(handleUpdate, 1000);
    return () => { window.removeEventListener('storage', handleUpdate); clearInterval(interval); };
  }, []);

  return <>{children}</>;
}
