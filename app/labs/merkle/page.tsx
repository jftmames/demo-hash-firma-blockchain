'use client';
import { useState } from 'react';
import { merkleRoot, merkleProof, verifyProof, sha256Hex } from '@/lib/crypto';
import CodeBlock from '@/components/CodeBlock';

export default function MerkleLab() {
  const [docs, setDocs] = useState<string[]>(['Documento A', 'Documento B', 'Documento C']);
  const [root, setRoot] = useState<string>('');
  const [proofOut, setProofOut] = useState<string[]>([]);
  const [verifyIdx, setVerifyIdx] = useState(0);
  const [verifyOk, setVerifyOk] = useState<boolean | null>(null);

  async function computeRoot() {
    const leaves = await Promise.all(docs.map(d => sha256Hex(d)));
    setRoot(await merkleRoot(leaves));
  }

  async function buildProof() {
    const leaves = await Promise.all(docs.map(d => sha256Hex(d)));
    setProofOut(await merkleProof(leaves, verifyIdx));
  }

  async function checkProof() {
    const leaves = await Promise.all(docs.map(d => sha256Hex(d)));
    const leaf = leaves[verifyIdx];
    setVerifyOk(await verifyProof(leaf, proofOut, root));
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Lab 4 — Merkle & Prueba de inclusión</h1>
      <p className="text-sm">Árbol de Merkle: una sola huella (root) representa muchas. Puedes demostrar que un documento está incluido sin revelar todos los demás.</p>

      <div className="card space-y-2">
        {docs.map((d, i) => (
          <input key={i} className="input" value={d} onChange={e => setDocs(prev => prev.map((x, j) => j===i? e.target.value : x))} />
        ))}
        <button className="btn" onClick={() => setDocs(prev => [...prev, `Documento ${String.fromCharCode(65+prev.length)}`])}>Añadir documento</button>
        <button className="btn" onClick={computeRoot}>Calcular Merkle root</button>
        {root && <>
          <p className="label">Merkle root</p>
          <CodeBlock>{root}</CodeBlock>
        </>}
      </div>

      <div className="card space-y-2">
        <label className="label">Índice a probar</label>
        <input className="input" type="number" min={0} max={docs.length-1} value={verifyIdx} onChange={e => setVerifyIdx(parseInt(e.target.value||'0'))} />
        <div className="flex gap-2">
          <button className="btn" onClick={buildProof}>Generar prueba</button>
          <button className="btn" onClick={checkProof}>Verificar prueba</button>
        </div>
        {proofOut.length>0 && <>
          <p className="label">Prueba (hermanos)</p>
          <CodeBlock>{JSON.stringify(proofOut, null, 2)}</CodeBlock>
        </>}
        {verifyOk !== null && <p className="text-sm">Resultado: <b>{verifyOk ? 'VÁLIDA' : 'INVÁLIDA'}</b></p>}
      </div>

      <div className="card">
        <details>
          <summary className="cursor-pointer">¿Por qué importa en Derecho?</summary>
          <ul className="list-disc ml-6 text-sm mt-2">
            <li>Pruebas de integridad masiva (registros, auditorías).</li>
            <li>Privacidad: demuestras inclusión sin revelar todo.</li>
            <li>Base de la trazabilidad en blockchain públicas.</li>
          </ul>
        </details>
      </div>
    </section>
  );
}
