'use client';
import { useEffect, useState } from 'react';

export default function ContrastToggle() {
  const [dark, setDark] = useState<boolean>(() => typeof window!=="undefined" && document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setDark(saved === 'dark');
  }, []);
  return <button className="btn" aria-label="Contraste" onClick={() => setDark(d => !d)}>{dark ? '☾' : '☀︎'}</button>;
}
