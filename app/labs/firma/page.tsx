'use client';
import { useEffect, useState } from 'react';
import { genECDSA, signECDSA, verifyECDSA, exportJWK, importJWK } from '@/lib/crypto';
import { abToBase64, base64ToBytes } from '@/lib/utils';
import CodeBlock from '@/components/CodeBlock';

export default function FirmaLab() {
  const [message, setMessage] = useState('Cláusula contractual…');
  const [pair, setPair] = useState<CryptoKeyPair | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [pubJwk, setPubJwk] = useState('');
  const [privJwk, setPrivJwk] = useState('');

  useEffect(() => { (async () => {
    const kp = await genECDSA(); 
    setPair(kp);
    setPubJwk(JSON.stringify(await exportJWK(kp.publicKey), null, 2));
    setPrivJwk(JSON.stringify(await exportJWK(kp.privateKey), null, 2));
  })(); }, []);

  async function sign() {
    if (!pair) return;
    const data = new TextEncoder().encode(message);
    const sig = await signECDSA(pair.privateKey, data);
    setSignature(abToBase64(sig));
  }

  async function verify() {
    if (!pair) return;
    const data = new TextEncoder().encode(message);
    const sig = base64ToBytes(signature);
    const ok = await verifyECDSA(pair.publicKey, sig, data);
    setVerified(ok);
  }

  async function importKeys() {
    try {
      const p = await importJWK(JSON.parse(pubJwk), ['verify']);
      const s = await importJWK(JSON.parse(privJwk), ['sign']);
      setPair({ publicKey: p, privateKey: s });
    } catch { alert('JWK inválido'); }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Lab 3 — Firma (ECDSA P-256)</h1>
      <p className="text-sm">La firma une el mensaje con la clave privada. Cualquiera puede verificar con la clave pública.</p>

      <div className="card space-y-2">
        <label className="label">Mensaje</label>
        <textarea className="input h-28" value={message} onChange={e => setMessage(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn" onClick={sign}>Firmar</button>
          <button className="btn" onClick={verify}>Verificar</button>
        </div>
        {signature && <>
          <p className="label">Firma (Base64)</p>
          <CodeBlock>{signature}</CodeBlock>
        </>}
        {verified !== null && <p className="text-sm">Verificación: <b>{verified ? 'VÁLIDA' : 'INVÁLIDA'}</b></p>}
      </div>

      <div className="card grid md:grid-cols-2 gap-3">
        <div>
          <p className="label">Clave pública (JWK)</p>
          <textarea className="input h-48" value={pubJwk} onChange={e => setPubJwk(e.target.value)} />
        </div>
        <div>
          <p className="label">Clave privada (JWK)</p>
          <textarea className="input h-48" value={privJwk} onChange={e => setPrivJwk(e.target.value)} />
        </div>
        <button className="btn" onClick={importKeys}>Importar JWK</button>
      </div>

      <div className="card">
        <details>
          <summary className="cursor-pointer">¿Por qué importa en Derecho?</summary>
          <ul className="list-disc ml-6 text-sm mt-2">
            <li>Autenticidad y no repudio (modelo PKI / eIDAS).</li>
            <li>Separación emisor/verificador sin compartir secretos.</li>
            <li>Validez sujeta a políticas, certificados y contexto.</li>
          </ul>
        </details>
      </div>
    </section>
  );
}
