'use client';
import { useState } from 'react';
import { sha256Hex, toyMine } from '@/lib/crypto';

type Block = { index: number; data: string; prevHash: string; nonce: number; hash: string; };

export default function ChainLab() {
  const [chain, setChain] = useState<Block[]>([{ index: 0, data: 'Genesis', prevHash: '0'.repeat(64), nonce: 0, hash: '0'.repeat(64) }]);
  const [difficulty, setDifficulty] = useState(3);

  async function addBlock() {
    const prev = chain[chain.length-1];
    const dataHex = await sha256Hex(chain.length + ':' + prev.hash + ':' + Date.now());
    const mined = await toyMine(dataHex, difficulty);
    const hash = mined.hash;
    setChain([...chain, { index: chain.length, data: `Bloque ${chain.length}`, prevHash: prev.hash, nonce: mined.nonce, hash }]);
  }

  async function tamper(i: number) {
    const copy = [...chain];
    copy[i].data += ' *ALTERADO*';
    setChain(copy);
  }

  function valid(): boolean {
    for (let i=1; i<chain.length; i++) if (chain[i].prevHash !== chain[i-1].hash) return false;
    return true;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Mini-Blockchain (didáctica)</h1>
      <p className="text-sm">Cada bloque referencia el hash del anterior. Si alteras un bloque y no rehaces el trabajo/consenso, la cadena se rompe.</p>

      <div className="card space-y-2">
        <label className="label">Dificultad (prefijo de ceros PoW)</label>
        <input className="input" type="range" min={1} max={5} value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value))} />
        <button className="btn" onClick={addBlock}>Añadir bloque</button>
        <p className="text-sm">Cadena válida: <b>{valid() ? 'SÍ' : 'NO'}</b></p>
      </div>

      <div className="grid gap-3">
        {chain.map((b, i) => (
          <div key={i} className="card">
            <p className="text-sm font-semibold">#{b.index}</p>
            <p className="text-xs"><b>prevHash:</b> {b.prevHash}</p>
            <p className="text-xs"><b>nonce:</b> {b.nonce}</p>
            <p className="text-xs"><b>hash:</b> {b.hash}</p>
            {i>0 && <button className="btn mt-2" onClick={() => tamper(i)}>Alterar bloque</button>}
          </div>
        ))}
      </div>

      <div className="card">
        <details>
          <summary className="cursor-pointer">¿Por qué importa en Derecho?</summary>
          <ul className="list-disc ml-6 text-sm mt-2">
            <li>Trazabilidad y evidencia de manipulación.</li>
            <li>Modelo de confianza distribuida (consenso).</li>
            <li>Límites y responsabilidades según jurisdicción y uso.</li>
          </ul>
        </details>
      </div>
    </section>
  );
}
