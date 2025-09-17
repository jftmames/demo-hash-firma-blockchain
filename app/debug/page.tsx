'use client';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [clicks, setClicks] = useState(0);
  useEffect(() => { console.log('[Debug] mounted'); }, []);
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Debug de eventos</h1>
      <p>Clicks: <b>{clicks}</b></p>
      <button
        className="btn"
        onClick={() => { console.log('[Debug] click'); setClicks(c => c + 1); }}
        onKeyUp={(e) => { if (e.key === 'Enter') { console.log('[Debug] keyEnter'); setClicks(c => c + 1); } }}
      >
        Probar click
      </button>
      <p className="text-xs text-gray-500">Si este botón no incrementa, tu entorno (extensión/caché) está bloqueando eventos.</p>
    </section>
  );
}
