
'use client';
import { useEffect, useState } from 'react';
import { genECDSA, signECDSA, verifyECDSA, exportJWK, importJWK } from '@/lib/crypto';
import { abToBase64, base64ToBytes } from '@/lib/utils';
import CodeBlock from '@/components/CodeBlock';

type PubJwk = JsonWebKey & { kty: 'EC'; crv: 'P-256'; x: string; y: string; };
type PrivJwk = PubJwk & { d: string };

export default function FirmaLab() {
  const [message, setMessage] = useState('Cláusula contractual…');
  const [pair, setPair] = useState<CryptoKeyPair | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [pubJwk, setPubJwk] = useState('');
  const [privJwk, setPrivJwk] = useState('');
  const [importStatus, setImportStatus] = useState<string>(''); // feedback visible

  // Genera un par inicial para que el lab sea interactivo desde el inicio
  useEffect(() => {
    (async () => {
      const kp = await genECDSA();
      setPair(kp);
      setPubJwk(JSON.stringify(await exportJWK(kp.publicKey), null, 2));
      setPrivJwk(JSON.stringify(await exportJWK(kp.privateKey), null, 2));
    })();
  }, []);

  async function sign() {
    if (!pair) return;
    setVerified(null);
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

  function parseJSON<T>(s: string): T {
    // Permite espacios/linebreaks; si falla, lanza error claro
    try { return JSON.parse(s) as T; } catch (e) { throw new Error('JSON inválido. Asegúrate de pegar solo la JWK (sin comillas triples ni texto extra).'); }
  }

  function assertPub(j: any): asserts j is PubJwk {
    if (!j || j.kty !== 'EC' || j.crv !== 'P-256' || typeof j.x !== 'string' || typeof j.y !== 'string') {
      throw new Error('JWK pública incompleta: se requieren kty=EC, crv=P-256, x, y.');
    }
  }
  function assertPriv(j: any): asserts j is PrivJwk {
    assertPub(j);
    if (typeof j.d !== 'string') throw new Error('JWK privada incompleta: falta el campo d.');
  }

  async function importKeys() {
    setImportStatus(''); setSignature(''); setVerified(null);
    try {
      const pub = parseJSON<PubJwk>(pubJwk.trim());
      const prv = parseJSON<PrivJwk>(privJwk.trim());
      assertPub(pub); assertPriv(prv);

      // Importamos usando WebCrypto (nuestros helpers ya rellenan crv/kty si faltan)
      const p = await importJWK(pub, ['verify']);
      const s = await importJWK(prv, ['sign']);
      setPair({ publicKey: p, privateKey: s });

      // Smoke test: firmar/verificar “ok”
      const data = new TextEncoder().encode('ok');
      const sig = await signECDSA(s, data);
      const ok = await verifyECDSA(p, sig, data);

      setImportStatus(ok ? 'Claves importadas correctamente ✓ (prueba de firma/verificación OK)' :
                           'Claves importadas, pero la verificación ha fallado (¿publica y privada no son pareja?)');
    } catch (err: any) {
      setImportStatus(`Error al importar: ${err?.message || String(err)}`);
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Lab 3 — Firma (ECDSA P-256)</h1>
      <p className="text-sm">La firma une el mensaje con la clave privada. Cualquiera puede verificar con la clave pública.</p>

      <div className="card space-y-2">
        <label className="label">Mensaje</label>
        <textarea className="input h-28" value={message} onChange={e => setMessage(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn" onClick={sign} aria-label="Firmar" disabled={!pair}>Firmar</button>
          <button className="btn" onClick={verify} aria-label="Verificar" disabled={!pair || !signature}>Verificar</button>
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
        <button className="btn" onClick={importKeys} aria-live="polite">Importar JWK</button>
        {importStatus && <p className="text-xs text-gray-500 md:col-span-2" role="status">{importStatus}</p>}
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
