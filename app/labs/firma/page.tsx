'use client';
import { useEffect, useState, useCallback } from 'react';
import { genECDSA, signECDSA, verifyECDSA, exportJWK, importJWK } from '@/lib/crypto';
import { abToBase64, base64ToBytes } from '@/lib/utils';
import CodeBlock from '@/components/CodeBlock';

type PubJwk = JsonWebKey & { kty: 'EC'; crv: 'P-256'; x: string; y: string };
type PrivJwk = PubJwk & { d: string };
declare global { interface Window { debugImport?: () => Promise<void>; } }

const VERSION = 'vIMPORT-4';

export default function FirmaLab() {
  const [message, setMessage] = useState('Cláusula contractual…');
  const [pair, setPair] = useState<CryptoKeyPair | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [pubJwk, setPubJwk] = useState('');
  const [privJwk, setPrivJwk] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    (async () => {
      const kp = await genECDSA();
      setPair(kp);
      setPubJwk(JSON.stringify(await exportJWK(kp.publicKey), null, 2));
      setPrivJwk(JSON.stringify(await exportJWK(kp.privateKey), null, 2));
      console.log('[FirmaLab]', VERSION, 'ready');
    })();
  }, []);

  const sign = useCallback(async () => {
    if (!pair) return;
    setVerified(null);
    const data = new TextEncoder().encode(message);
    const sig = await signECDSA(pair.privateKey, data);
    setSignature(abToBase64(sig));
  }, [pair, message]);

  const verify = useCallback(async () => {
    if (!pair) return;
    const data = new TextEncoder().encode(message);
    const sig = base64ToBytes(signature);
    setVerified(await verifyECDSA(pair.publicKey, sig, data));
  }, [pair, message, signature]);

  function cleanJSON(s: string) {
    return s.replace(/^\uFEFF/, '').trim().replace(/^[^\{\[]*/, '').replace(/[^\}\]]*$/, '');
  }

  async function doImport(pubStr: string, prvStr: string) {
    setImportStatus('Importando…'); setImporting(true); setSignature(''); setVerified(null);
    try {
      const pub = JSON.parse(cleanJSON(pubStr)) as PubJwk;
      const prv = JSON.parse(cleanJSON(prvStr)) as PrivJwk;
      if (!pub || pub.kty !== 'EC' || pub.crv !== 'P-256' || !pub.x || !pub.y) {
        alert('JWK pública incompleta: kty=EC, crv=P-256, x, y.'); setImportStatus('Error: pública incompleta'); return;
      }
      if (!prv || prv.kty !== 'EC' || prv.crv !== 'P-256' || !prv.x || !prv.y || !prv.d) {
        alert('JWK privada incompleta: falta d/campos.'); setImportStatus('Error: privada incompleta'); return;
      }
      const p = await importJWK(pub, ['verify']);
      const s = await importJWK(prv, ['sign']);
      setPair({ publicKey: p, privateKey: s });
      const data = new TextEncoder().encode('ok');
      const ok = await verifyECDSA(p, await signECDSA(s, data), data);
      setImportStatus(ok ? 'Claves importadas ✓ (firma/verificación OK)' : 'Claves importadas, pero verificación falló');
      if (!ok) alert('Importadas, pero verificación falló. ¿x/y/d no son pareja?');
    } catch (e: any) {
      console.error('[Importar JWK] error', e);
      alert('JSON inválido. Pega solo el objeto {…}.');
      setImportStatus('Error al importar JWK');
    } finally {
      setImporting(false);
    }
  }

  const importKeys = useCallback(async () => doImport(pubJwk, privJwk), [pubJwk, privJwk]);
  useEffect(() => { (window as any).debugImport = importKeys; return () => { delete (window as any).debugImport; }; }, [importKeys]);

  return (
    <section className="space-y-4">
      <div className="text-xs text-gray-500">Build: <b>{VERSION}</b></div>

      <h1 className="text-xl font-bold">Lab 3 — Firma (ECDSA P-256)</h1>
      <p className="text-sm">La firma une el mensaje con la clave privada. Cualquiera puede verificar con la clave pública.</p>

      <div className="card space-y-2">
        <label className="label" htmlFor="msg">Mensaje</label>
        <textarea id="msg" className="input h-28" value={message} onChange={e => setMessage(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn" onClick={sign} disabled={!pair}>Firmar</button>
          <button className="btn" onClick={verify} disabled={!pair || !signature}>Verificar</button>
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
        <div className="flex gap-2 md:col-span-2">
          <button id="importbtn" type="button" className="btn" onClick={importKeys} disabled={importing}>
            {importing ? 'Importando…' : 'Importar JWK'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={async () => {
              const kp = await genECDSA();
              const pub = JSON.stringify(await exportJWK(kp.publicKey));
              const prv = JSON.stringify(await exportJWK(kp.privateKey));
              setPubJwk(JSON.stringify(await exportJWK(kp.publicKey), null, 2));
              setPrivJwk(JSON.stringify(await exportJWK(kp.privateKey), null, 2));
              await doImport(pub, prv);
            }}
            title="Comprueba que el handler funciona"
          >
            Probar importación con claves de ejemplo
          </button>
        </div>
        {importStatus && <p className="text-xs text-gray-500 md:col-span-2" role="status">{importStatus}</p>}
      </div>
    </section>
  );
}


