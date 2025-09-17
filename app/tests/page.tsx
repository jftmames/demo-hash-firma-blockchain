'use client';
import { useEffect, useState } from 'react';
import { sha256Hex, genECDSA, signECDSA, verifyECDSA, merkleRoot, merkleProof, verifyProof } from '@/lib/crypto';
import { base64ToBytes, abToBase64, hexToBytes, percentDiffBits } from '@/lib/utils';

// Pequeño runner de pruebas en el navegador

type Test = { name: string; run: () => Promise<boolean>; };

const tests: Test[] = [
  {
    name: 'SHA-256("abc") == ba7816bf...f20015ad',
    run: async () => {
      const h = await sha256Hex('abc');
      return h === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
    }
  },
  {
    name: 'ECDSA sign/verify (P-256) sobre "hola"',
    run: async () => {
      const kp = await genECDSA();
      const data = new TextEncoder().encode('hola');
      const sig = await signECDSA(kp.privateKey, data);
      return await verifyECDSA(kp.publicKey, sig, data);
    }
  },
  {
    name: 'Base64 helpers: roundtrip',
    run: async () => {
      const buf = new TextEncoder().encode('ok');
      const b64 = abToBase64(buf);
      const back = base64ToBytes(b64);
      return back[0] === buf[0] && back[1] === buf[1];
    }
  },
  {
    name: 'Efecto avalancha > 40% de bits cambiados (flip 1 bit)',
    run: async () => {
      const orig = new TextEncoder().encode('Avalanche test');
      const flipped = new Uint8Array(orig);
      flipped[0] = flipped[0] ^ 1; // flip 1 bit
      const h1 = await sha256Hex(orig);
      const h2 = await sha256Hex(flipped);
      const pct = percentDiffBits(hexToBytes(h1), hexToBytes(h2));
      return pct > 40;
    }
  },
  {
    name: 'Merkle proof válida e inválida',
    run: async () => {
      const docs = ['A','B','C','D'];
      const leaves = await Promise.all(docs.map(d => sha256Hex(d)));
      const root = await merkleRoot(leaves);
      const idx = 2; // 'C'
      const proof = await merkleProof(leaves, idx);
      const ok = await verifyProof(leaves[idx], proof, root);
      const bad = await verifyProof(leaves[0], proof, root);
      return ok && !bad;
    }
  }
];

export default function TestsPage(){
  const [results, setResults] = useState<boolean[]>([]);

  useEffect(() => { (async () => {
    const outs: boolean[] = [];
    for (const t of tests) outs.push(await t.run());
    setResults(outs);
  })(); }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Tests automáticos (navegador)</h1>
      <ul className="space-y-2">
        {tests.map((t, i) => (
          <li key={i} className="card flex items-center justify-between">
            <span className="text-sm">{t.name}</span>
            <span>{results[i] === undefined ? '…' : results[i] ? '✅ OK' : '❌ FALLO'}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-500">Si algo falla, revisa rutas, `HMAC_KEY` y que **no exista** un `index.tsx` en la raíz.</p>
    </section>
  );
}
