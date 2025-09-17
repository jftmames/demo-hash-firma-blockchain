'use client';
import { useEffect, useState } from 'react';

export default function LanguageToggle() {
  const [lang, setLang] = useState<'es'|'en'>(() => (typeof window!=="undefined" && (localStorage.getItem('lang') as 'es'|'en')) || 'es');
  useEffect(() => { localStorage.setItem('lang', lang); document.documentElement.lang = lang; }, [lang]);
  return (
    <button className="btn" aria-label="Idioma / Language" onClick={() => setLang(l => l==='es'?'en':'es')}>
      {lang.toUpperCase()}
    </button>
  );
}
