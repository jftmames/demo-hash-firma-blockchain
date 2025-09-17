'use client';
import { useState } from 'react';
import CodeBlock from '@/components/CodeBlock';

export default function HmacLab() {
  const [msg, setMsg] = useState('Mensaje importante');
  const [tag, setTag] = useState<string>('');
  const [verify, setVerify] = useState<string>('');
  const [ok, setOk] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string>('');
  const [raw, setRaw] = useState<string>('');

  async function compute() {
    setStatus(''); setRaw(''); setOk(null);
    try {
      const res = await fetch('/api/hmac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      setStatus(`${res.status} ${res.statusText}`);
      const data = await res.json().catch(() => ({}));
      setRaw(JSON.stringify(data, null, 2));
      if (!res.ok) {
        setTag('');
        return;
      }
      setTag(data.tag || '');
    } catch (e: any) {
      setStatus('REQUEST FAILED');
      setRaw(String(e?.message || e));
      setTag('');
    }
  }

  async function check() {
    setStatus(''); setRaw('');
    try {
      const res = await fetch('/api/hmac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, tag: verify }) // validación en servidor si existe
      });
      setStatus(`${res.status} ${res.statusText}`);
      const data = await res.json().catch(() => ({}));
      setRaw(JSON.stringify(data, null, 2));
      if (!res.ok) { setOk(false); return; }
      // Si el servidor devuelve 'valid', úsalo; si no, comparamos localmente
      if (typeof data.valid === 'boolean') setOk(data.valid);
      else setOk((data.tag || '') === verify);
    } catch (e: any) {
      setStatus('REQUEST FAILED');
      setRaw(String(e?.message || e));
      setOk(false);
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Lab 2 — HMAC</h1>
      <p className="text-sm">HMAC usa <b>clave compartida</b> para autenticar mensajes. A diferencia del hash simple, el receptor sabe si el emisor conocía la clave.</p>

      <div className="card space-y-2">
        <label className="label">Mensaje</label>
        <input className="input" value={msg} onChange={e => setMsg(e.target.value)} />
        <button className="btn" onClick={compute}>Calcular HMAC (servidor)</button>
        {status && <p className="text-xs text-gray-500">HTTP: {status}</p>}
        {raw && <>
          <p className="label">Respuesta del servidor</p>
          <CodeBlock>{raw}</CodeBlock>
        </>}
        {tag && <>
          <p className="label">Tag HMAC (hex)</p>
          <CodeBlock>{tag}</CodeBlock>
        </>}
      </div>

      <div className="card space-y-2">
        <label className="label">Verificar (pega un tag HMAC aquí)</label>
        <input className="input" value={verify} onChange={e => setVerify(e.target.value)} />
        <button className="btn" onClick={check}>Comparar con el servidor</button>
        {ok !== null && <p className="text-sm">Resultado: <b>{ok ? 'VÁLIDO' : 'INVÁLIDO'}</b></p>}
      </div>

      <div className="card">
        <details>
          <summary className="cursor-pointer">¿Por qué importa en Derecho?</summary>
          <ul className="list-disc ml-6 text-sm mt-2">
            <li>Autenticación de remitente con secreto compartido.</li>
            <li>No proporciona <i>no repudio</i> (ambas partes conocen la clave).</li>
            <li>Útil en APIs y webhooks.</li>
          </ul>
        </details>
      </div>
    </section>
  );
}

