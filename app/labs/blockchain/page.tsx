'use client';
import { useEffect, useMemo, useState } from 'react';
import { sha256Hex } from '@/lib/crypto'; // usamos el helper del proyecto

type Block = {
  index: number;
  timestamp: number;
  data: string;
  prevHash: string;
  nonce: number;
  hash: string;
};

const DIFF_MIN = 0;
const DIFF_MAX = 5;

function prefixZeros(hash: string, n: number) {
  return hash.startsWith('0'.repeat(n));
}

async function calcHash(b: Omit<Block,'hash'>): Promise<string> {
  // Hash “canónico” del bloque (sin el propio hash)
  const payload = `${b.index}|${b.timestamp}|${b.data}|${b.prevHash}|${b.nonce}`;
  return await sha256Hex(payload);
}

async function mine(b: Block, difficulty: number): Promise<Block> {
  // Toy PoW: incrementa nonce hasta cumplir prefijo de ceros
  let nonce = 0;
  while (true) {
    const h = await calcHash({ index: b.index, timestamp: b.timestamp, data: b.data, prevHash: b.prevHash, nonce });
    if (difficulty === 0 || prefixZeros(h, difficulty)) {
      return { ...b, nonce, hash: h };
    }
    nonce++;
    // Evita bloquear UI en dificultades altas
    if (nonce % 2000 === 0) await new Promise(r => setTimeout(r));
  }
}

function now() { return Date.now(); }

export default function BlockchainLab() {
  const [difficulty, setDifficulty] = useState(2);
  const [chain, setChain] = useState<Block[]>([]);

  // Inicializa con bloque génesis + un par más
  useEffect(() => {
    (async () => {
      const genesisBase = { index: 0, timestamp: now(), data: 'Génesis', prevHash: '0'.repeat(64), nonce: 0 };
      const genesis = { ...genesisBase, hash: await calcHash(genesisBase) };
      const b1Base = { index: 1, timestamp: now(), data: 'Contrato #1', prevHash: genesis.hash, nonce: 0 };
      const b1 = await mine({ ...b1Base, hash: '' }, Math.min(difficulty, 2)); // minado rápido de arranque
      const b2Base = { index: 2, timestamp: now(), data: 'Factura #1001', prevHash: b1.hash, nonce: 0 };
      const b2 = await mine({ ...b2Base, hash: '' }, Math.min(difficulty, 2));
      setChain([genesis, b1, b2]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Valida sin mutar
  const status = useMemo(() => {
    if (chain.length === 0) return { valid: true, errors: [] as number[] };
    const errors: number[] = [];
    chain.forEach((b, i) => {
      // 1) hash coherente con contenido
      const should = `${b.index}|${b.timestamp}|${b.data}|${b.prevHash}|${b.nonce}`;
      // Nota: sha256Hex es async; aquí hacemos una validación “optimista” en UI comparando cadena;
      // para exactitud marcamos error si no coincide en un recompute asincrónico abajo.
      // (Más abajo, en recomputeStatus, hacemos el recompute real cuando algo cambia.)
      if (!prefixZeros(b.hash, Math.max(0, Math.min(difficulty, DIFF_MAX))) && difficulty > 0) {
        errors.push(i);
      }
      // 2) enlace con bloque anterior
      if (i > 0 && b.prevHash !== chain[i - 1].hash) {
        if (!errors.includes(i)) errors.push(i);
      }
      // 3) estructura básica
      if (b.index !== i) {
        if (!errors.includes(i)) errors.push(i);
      }
    });
    return { valid: errors.length === 0, errors };
  }, [chain, difficulty]);

  // Recompute preciso de hashes al vuelo para colorear bien (sin bloquear)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const errs = new Set<number>();
      for (let i = 0; i < chain.length; i++) {
        const b = chain[i];
        const expected = await calcHash({ index: b.index, timestamp: b.timestamp, data: b.data, prevHash: b.prevHash, nonce: b.nonce });
        if (cancelled) return;
        const needZeros = Math.max(0, Math.min(difficulty, DIFF_MAX));
        if (expected !== b.hash || (needZeros > 0 && !prefixZeros(b.hash, needZeros))) {
          errs.add(i);
        }
        if (i > 0 && b.prevHash !== chain[i - 1].hash) errs.add(i);
      }
      if (!cancelled) {
        // Guardamos “errores calculados” en data-attr para colorear filas
        const rows = document.querySelectorAll<HTMLDivElement>('[data-row]');
        rows.forEach((el) => {
          const i = Number(el.dataset.row);
          el.dataset.invalid = errs.has(i) ? '1' : '0';
        });
      }
    })();
    return () => { cancelled = true; };
  }, [chain, difficulty]);

  async function addBlock() {
    const last = chain[chain.length - 1];
    const base = { index: chain.length, timestamp: now(), data: `Nuevo #${chain.length}`, prevHash: last.hash, nonce: 0 };
    const mined = await mine({ ...base, hash: '' }, difficulty);
    setChain(prev => [...prev, mined]);
  }

  async function alterBlock(i: number, newData: string) {
    // 1) Cambiamos SOLO el bloque i (inmutable)
    const copy = chain.map(b => ({ ...b }));
    copy[i].data = newData;
    // 2) Recalculamos SU hash con el mismo nonce (probable invalidez)
    const newHash = await calcHash({
      index: copy[i].index,
      timestamp: copy[i].timestamp,
      data: copy[i].data,
      prevHash: copy[i].prevHash,
      nonce: copy[i].nonce,
    });
    copy[i].hash = newHash;
    // 3) ¡No tocamos prevHash de los siguientes! (debe romperse la cadena)
    setChain(copy);
  }

  async function reMineFrom(i: number) {
    // Re-mina desde i en adelante, encadenando prevHash correctamente
    const copy = chain.map(b => ({ ...b }));
    for (let k = i; k < copy.length; k++) {
      if (k > 0) copy[k].prevHash = copy[k - 1].hash;
      const mined = await mine(copy[k], difficulty);
      copy[k] = mined;
      setChain(curr => {
        const tmp = curr.map((b, idx) => (idx === k ? mined : b));
        return tmp;
      });
      // cedemos el hilo para que la UI respire
      await new Promise(r => setTimeout(r));
    }
  }

  function rowInvalid(el: HTMLDivElement | null) {
    if (!el) return '';
    return el.dataset.invalid === '1' ? 'ring-2 ring-red-500/60 bg-red-500/5' : '';
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Lab 4 — Mini-Blockchain (PoW)</h1>
      <p className="text-sm">
        Cada bloque = <b>datos</b> + <b>hash del anterior</b> + <b>nonce</b>. Cambiar un bloque rompe la cadena hasta re-minar.
      </p>

      <div className="card flex items-center gap-4">
        <label htmlFor="diff" className="label">Dificultad (ceros iniciales)</label>
        <input id="diff" type="range" min={DIFF_MIN} max={DIFF_MAX} value={difficulty}
          onChange={e => setDifficulty(Number(e.target.value))} />
        <span className="text-sm tabular-nums">{difficulty}</span>
        <button className="btn" onClick={addBlock}>Añadir bloque</button>
        <span className={`text-sm ${status.valid ? 'text-green-700' : 'text-red-700'}`}>
          Cadena: <b>{status.valid ? 'VÁLIDA' : 'NO VÁLIDA'}</b>
        </span>
      </div>

      <div className="space-y-3">
        {chain.map((b, i) => (
          <div
            key={i}
            data-row={i}
            className={`card ${rowInvalid(document.querySelector(`[data-row="${i}"]`))}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Bloque #{i}</h2>
              <div className="flex gap-2">
                <button className="btn" onClick={() => reMineFrom(i)} aria-label={`Re-minar desde ${i}`}>Re-minar desde aquí</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <label className="label">Datos</label>
                <input
                  className="input"
                  value={b.data}
                  onChange={(e) => alterBlock(i, e.target.value)}
                  aria-label={`Editar datos del bloque ${i}`}
                />
              </div>
              <div>
                <label className="label">Nonce</label>
                <input className="input" value={b.nonce} readOnly aria-readonly />
              </div>
              <div className="md:col-span-2">
                <label className="label">PrevHash</label>
                <textarea className="input h-16" value={b.prevHash} readOnly aria-readonly />
              </div>
              <div className="md:col-span-2">
                <label className="label">Hash</label>
                <textarea className="input h-16" value={b.hash} readOnly aria-readonly />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Regla de validez: hash actual correcto + prevHash coincide con el hash del anterior + {difficulty} ceros iniciales.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
