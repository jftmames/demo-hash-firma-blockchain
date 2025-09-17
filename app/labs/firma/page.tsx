'use client';
import { useEffect, useState } from 'react';
import { genECDSA, signECDSA, verifyECDSA, exportJWK, importJWK } from '@/lib/crypto';
import { abToBase64, base64ToBytes } from '@/lib/utils';

type PubJwk = JsonWebKey & { kty: 'EC'; crv: 'P-256'; x: string; y: string };
type PrivJwk = PubJwk & { d: string };

declare global { interface Window { debugImport?: () => Promise<void>; } }

const VERSION = 'vIMPORT-6';

export default function FirmaLab() {
  const [message, setMessage] = useState('Cláusula contractual…');
  const [pair, setPair] = useState<CryptoKeyPair | null>(null);
  const [signature, setSignature] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [pubJwk, setPubJwk] = useState('');
  const [privJwk, setPrivJwk] = useState('');
  const [status, setStatus] = useState('idle'); // idle | importing | ok | error | notpair
  const [statusText, setStatusText] = useState('');

  // Marca build en consola
  useEffect(() => { console.log('[FirmaLab]', VERSION, 'mounted'); }, []);

  // Par inicial
  useEffect(() => { (async () => {
    const kp = await genECDSA();
    setPair(kp);
    setPubJwk(JSON.stringify(await exportJWK(kp.publicKey), null, 2));
    setPrivJwk(JSON.stringify(await exportJWK(kp.privateKey), null, 2));
  })(); }, []);

  async function handleSign() {
    if (!pair) return;
    setVerified(null);
    const data = new TextEncoder().encode(message);
    const sig = await signECDSA(pair.privateKey, data);
    setSignature(abToBase64(sig));
  }

  async function handleVerify() {
    if (!pair) return;
    const data = new TextEncoder().encode(message);
    const sig = base64ToBytes(signature);
    setVerified(await verifyECDSA(pair.publicKey, sig, data));
  }

  function cleanJSON(s: string) {
    return s.replace(/^\uFEFF/, '').trim().replace(/^[^\{\[]*/, '').replace(/[^\}\]]*$/, '');
  }

  async function doImport(pubStr: string, prvStr: string) {
    setStatus('importing'); setStatusText('Importando…');
    try {
      const pub = JSON.parse(cleanJSON(pubStr)) as PubJwk;
      const prv = JSON.parse(cleanJSON(prvStr)) as PrivJwk;

      if (!pub || pub.kty!=='EC' || pub.crv!=='P-256' || !pub.x || !pub.y) {
        setStatus('error'); setStatusText('JWK pública incompleta (kty=EC, crv=P-256, x, y).'); return;
      }
      if (!prv || prv.kty!=='EC' || prv.crv!=='P-256' || !prv.x || !prv.y || !prv.d) {
        setStatus('error'); setStatusText('JWK privada incompleta (falta d/x/y).'); return;
      }

      const p = await importJWK(pub, ['verify']);
      const s = await importJWK(prv, ['sign']);
      setPair({ publicKey: p, privateKey: s });

      const d = new TextEncoder().encode('ok');
      const ok = await verifyECDSA(p, await signECDSA(s, d), d);
      if (ok) { setStatus('ok'); setStatusText('Claves importadas ✓ (firma/verificación OK)'); }
      else { setStatus('notpair'); setStatusText('Claves importadas, pero NO son pareja (verificación falló)'); }
    } catch (e: any) {
      console.error('[Import JWK] error', e);
      setStatus('error'); setStatusText('JSON inválido: pega solo el objeto {…}');
    }
  }

  async function onImportClick() {
    console.log('[click] Importar JWK');
    await doImport(pubJwk, privJwk);
  }

  // Exponer para consola
  useEffect(() => { window.debugImport = onImportClick; return () => { delete window.debugImport; }; }, [pubJwk, privJwk]);

  return (
    <section className="space-y-4">
      <div className="text-xs text-gray-500">Build: <b>{VERSION}</b></div>

      <h1 className="text-xl font-bold">Lab 3 — Firma (ECDSA P-256)</h1>
      <p className="text-sm">La firma une el mensaje con la clave privada. Cualquiera puede verificar con la clave pública.</p>

      <div className="card space-y-2">
        <label className="label" htmlFor="msg">Mensaje</label>
        <textarea id="msg" className="input h-28" value={message} onChange={e => setMessage(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn" onClick={handleSign} disabled={!pair}>Firmar</button>
          <button className="btn" onClick={handleVerify} disabled={!pair || !signature}>Verificar</button>
        </div>
        {signature && (
          <div>
            <p className="label">Firma (Base64)</p>
            <pre className="whitespace-pre-wrap break-all p-2 bg-black/10 rounded">{signature}</pre>
          </div>
        )}
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
        <div className="md:col-span-2 flex flex-wrap gap-2 items-center">
          <button type="button" className="btn" onClick={onImportClick}>Importar JWK</button>
          <button
            type="button"
            className="btn"
            onClick={async () => {
              const kp = await genECDSA();
              const pub = JSON.stringify(await exportJWK(kp.publicKey), null, 2);
              const prv = JSON.stringify(await exportJWK(kp.privateKey), null, 2);
              setPubJwk(pub); setPrivJwk(prv);
              await doImport(pub, prv);
            }}
          >
            Probar importación con claves de ejemplo
          </button>
          <span className={`text-xs ${status==='ok'?'text-green-600':status==='error'?'text-red-600':status==='notpair'?'text-yellow-600':'text-gray-500'}`}>
            {status==='idle' ? '—' : statusText}
          </span>
        </div>
      </div>
    </section>
  );
}


