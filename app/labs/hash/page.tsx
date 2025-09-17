'use client';
import { useMemo, useState } from 'react';
import { fileToArrayBuffer, hexToBytes, percentDiffBits } from '@/lib/utils';
import { sha256Hex } from '@/lib/crypto';
import FileDrop from '@/components/FileDrop';
import CodeBlock from '@/components/CodeBlock';

export default function HashLab() {
  const [text, setText] = useState('La firma electrónica requiere integridad del mensaje.');
  const [fileHash, setFileHash] = useState<string>('');
  const [hash1, setHash1] = useState<string>('');
  const [hash2, setHash2] = useState<string>('');

  const flipOneBit = async () => {
    const data = new TextEncoder().encode(text);
    const flipped = new Uint8Array(data);
    if (flipped.length === 0) return;
    const i = 0;
    flipped[i] = flipped[i] ^ 0b00000001;
    const h1 = await sha256Hex(data);
    const h2 = await sha256Hex(flipped);
    setHash1(h1); setHash2(h2);
  };

  const diffPct = useMemo(() => {
    if (!hash1 || !hash2) return 0;
    return percentDiffBits(hexToBytes(hash1), hexToBytes(hash2));
  }, [hash1, hash2]);

  async function onFiles(files: File[]) {
    const f = files[0]; if (!f) return;
    const buf = await fileToArrayBuffer(f);
    const h = await sha256Hex(buf);
    setFileHash(h);
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Lab 1 — Hash</h1>
      <p className="text-sm">Un hash produce una huella fija del contenido. Sirve para <b>integridad</b>. No prueba autoría.</p>

      <div className="card space-y-2">
        <label className="label">Texto</label>
        <textarea className="input h-28" value={text} onChange={e => setText(e.target.value)} />
        <button className="btn" onClick={flipOneBit}>Flip 1 bit y comparar</button>
        {hash1 && (
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <p className="label">Hash original (SHA-256)</p>
              <CodeBlock>{hash1}</CodeBlock>
            </div>
            <div>
              <p className="label">Hash con 1 bit cambiado</p>
              <CodeBlock>{hash2}</CodeBlock>
            </div>
          </div>
        )}
        {hash1 && hash2 && (
          <p className="text-sm">% bits distintos: <b>{diffPct.toFixed(2)}%</b> (efecto avalancha)</p>
        )}
      </div>

      <div className="card space-y-2">
        <FileDrop onFiles={onFiles} />
        {fileHash && <>
          <p className="label">Hash del archivo</p>
          <CodeBlock>{fileHash}</CodeBlock>
        </>}
      </div>

      <div className="card">
        <details>
          <summary className="cursor-pointer">¿Por qué importa en Derecho?</summary>
          <ul className="list-disc ml-6 text-sm mt-2">
            <li>Control de integridad en prueba electrónica.</li>
            <li>Sellado temporal y cadena de custodia.</li>
            <li>Verificación de ficheros en auditorías.</li>
          </ul>
        </details>
      </div>
    </section>
  );
}
