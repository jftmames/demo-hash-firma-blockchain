'use client';
import { useEffect, useState, useCallback } from 'react';
import { genECDSA, signECDSA, verifyECDSA, exportJWK, importJWK } from '@/lib/crypto';
import { abToBase64, base64ToBytes } from '@/lib/utils';
import CodeBlock from '@/components/CodeBlock';

type PubJwk = JsonWebKey & { kty: 'EC'; crv: 'P-256'; x: string; y: string };
type PrivJwk = PubJwk & { d: string };

declare global { interface Window { debugImport?: () => Promise<void>; } }

export default function FirmaLab() {
  const [message, setMessage] = useState('Cláusula contractual…');
  const [pair, setPair] = useState<CryptoKeyPair | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [pubJwk, setPubJwk] = useState('');
  const [privJwk, setPrivJwk] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [importing, setImporting] = useState(false);

  // Genera par inicial visible
  useEffect(() => {
    (async () => {
      const kp = await genECDSA();
      setPair(kp);
      setPubJwk(JSON.stringify(await exportJWK(kp.publicKey), null, 2));
      setPrivJwk(JSON.stringify(await exportJWK(kp.privateKey), null, 2));
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
    // Limpia BOM y texto extraño alrededor
    return s.replace(/^\uFEFF/, '').trim().replace(/^[^\{\[]*/, '').replace(/[^\}\]]*$/, '');
  }

  async function doImport(pubStr: string, prvStr: string) {
    setImportStatus('Importando…'); setImporting(true); setSignature(''); setVerified(null);
    try {
      const pub = JSON.parse(cleanJSON(pubStr)) as PubJwk;
      const prv = JSON.parse(cleanJSON(prvStr)) as PrivJwk;

      // Validaciones mínimas sin setState para evitar estados parciales
      if (!pub || pub.kty !== 'EC' || pub.crv !== 'P-256' || !pub.x || !pub.y) {
        alert('JWK pública incompleta: requiere kty=EC, crv=P-256, x, y.');
        setImportStatus('Error: JWK pública incompleta'); return;
      }
      if (!prv || prv.kty !== 'EC' || prv.crv !== 'P-256' || !prv.x || !prv.y || !prv.d) {
        alert('JWK privada incompleta: falta d o campos básicos.');
        setImportStatus('Error: JWK privada incompleta'); return;
      }

      const p = await importJWK(pub, ['verify']);
      const s = await importJWK(prv, ['sign']);
      setPair({ publicKey: p, privateKey: s });

      // Smoke test
      const data = new TextEncoder().encode('ok');
      const ok = await verifyECDSA(p, await signECDSA(s, data), data);
      setImportStatus(ok ? 'Claves importadas ✓ (firma/verificación OK)' :
                           'Claves importadas, pero verificación falló (¿no son pareja?)');
      if (!ok) alert('Importadas, pero verificación falló. ¿x/y/d corresponden al mismo par?');
    } catch (e: any) {
      console.error('[Importar JWK] error', e);
      alert('JSON inválido. Pega únicamente el objeto JWK (empieza por { y termina en }).');
      setImportStatus('Error al importar JWK');
    } finally {
      setImporting(false);
    }
  }

  const importKeys = useCallback(async () => doImport(pubJwk, privJwk), [pubJwk, privJwk]);

  // Exponer función para dispararla desde consola si el click no llega
  useEffect(() => { window.debugImport = importKeys; return () => { delete window.debugImport; }; }, [importKeys]);

  // Atajo de teclado Ctrl/Cmd+Enter para importar
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') importKeys();
    };
    window.addEventListener('keyup', h);
    return () => window.removeEventListener('keyup', h);
  }, [importKeys]);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Lab 3 — Firma (ECDSA P-256)</h1>
      <p className="text-sm">La firma une el mensaje con la clave privada. Cualquiera puede verificar con la clave pública.</p>

      <div className="card space-y-2">
        <label className="label" htmlFor="msg">Mensaje</label>
        <textarea id="msg" className="input h-28" value={message} onChange={e => setMessage(e.target.value)} />
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
          <p className="label" id="publabel">Clave pública (JWK)</p>
          <textarea id="pubjwk" aria-labelledby="publabel" className="input h-48" value={pubJwk} onChange={e => setPubJwk(e.target.value)} />
        </div>
        <div>
          <p className="label" id="privlabel">Clave privada (JWK)</p>
          <textarea id="privjwk" aria-labelledby="privlabel" className="input h-48" value={privJwk} onChange={e => setPrivJwk(e.target.value)} />
        </div>
        <div className="flex gap-2 md:col-span-2">
          <button
            id="importbtn"
            type="button"
            className="btn"
            onClick={importKeys}
            onKeyUp={(e) => { if (e.key === 'Enter') importKeys(); }}
            aria-live="polite"
            disabled={importing}
          >
            {importing ? 'Importando…' : 'Importar JWK'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={async () => {
              // Genera un par nuevo y prueba la importación automática (para comprobar que el handler funciona)
              const kp = await genECDSA();
              const pub = JSON.stringify(await exportJWK(kp.publicKey));
              const prv = JSON.stringify(await exportJWK(kp.privateKey));
              setPubJwk(JSON.stringify(await exportJWK(kp.publicKey), null, 2));
              setPrivJwk(JSON.stringify(await exportJWK(kp.privateKey), null, 2));
              await doImport(pub, prv);
            }}
            title="Usa un par generado para comprobar que el botón funciona"
          >
            Probar importación con claves de ejemplo
          </button>
        </div>
        {importStatus && <p className="text-xs text-gray-500 md:col-span-2" role="status">{importStatus}</p>}
      </div>
    </section>
  );
}


