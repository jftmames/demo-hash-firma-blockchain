import { bytesToHex } from './utils';

// --- HASH ---
export async function sha256Bytes(data: ArrayBuffer | Uint8Array): Promise<ArrayBuffer> {
  const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
  return crypto.subtle.digest('SHA-256', buf);
}

export async function sha256Hex(input: string | Uint8Array | ArrayBuffer): Promise<string> {
  let data: ArrayBuffer;
  if (typeof input === 'string') data = new TextEncoder().encode(input);
  else if (input instanceof Uint8Array) data = input;
  else data = input;
  const hash = await sha256Bytes(data);
  return bytesToHex(hash);
}

// --- ECDSA (P-256, SHA-256) ---
export async function genECDSA(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
}

export async function signECDSA(privateKey: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> {
  return crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, data);
}

export async function verifyECDSA(publicKey: CryptoKey, sig: ArrayBuffer, data: ArrayBuffer): Promise<boolean> {
  return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, publicKey, sig, data);
}

export async function exportJWK(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key);
}

export async function importJWK(jwk: JsonWebKey, usage: KeyUsage[]): Promise<CryptoKey> {
  const crv = jwk.crv || 'P-256';
  const kty = jwk.kty || 'EC';
  return crypto.subtle.importKey('jwk', { ...jwk, crv, kty }, { name: 'ECDSA', namedCurve: 'P-256' }, true, usage);
}

// --- Merkle tree (simple) ---
export async function merkleRoot(leavesHex: string[]): Promise<string> {
  if (leavesHex.length === 0) return '';
  let level = [...leavesHex];
  while (level.length > 1) {
    if (level.length % 2 === 1) level.push(level[level.length - 1]);
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i];
      const b = level[i + 1];
      const pair = [a, b].sort().join('');
      next.push(await sha256Hex(new TextEncoder().encode(pair)));
    }
    level = next;
  }
  return level[0];
}

export async function merkleProof(leavesHex: string[], index: number): Promise<string[]> {
  const proof: string[] = [];
  let level = [...leavesHex];
  let idx = index;
  while (level.length > 1) {
    if (level.length % 2 === 1) level.push(level[level.length - 1]);
    const sibling = idx % 2 === 0 ? idx + 1 : idx - 1;
    proof.push(level[sibling]);
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i], b = level[i + 1];
      next.push(await sha256Hex(new TextEncoder().encode([a, b].sort().join(''))));
    }
    idx = Math.floor(idx / 2);
    level = next;
  }
  return proof;
}

export async function verifyProof(leaf: string, proof: string[], root: string): Promise<boolean> {
  let hash = leaf;
  for (const sib of proof) {
    const pair = [hash, sib].sort().join('');
    hash = await sha256Hex(new TextEncoder().encode(pair));
  }
  return hash === root;
}

// --- Mini PoW (didáctico) ---
export async function toyMine(dataHex: string, difficulty: number): Promise<{ nonce: number; hash: string; }>{
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;
  while (true) {
    const attempt = `${dataHex}:${nonce}`;
    const h = await sha256Hex(new TextEncoder().encode(attempt));
    if (h.startsWith(prefix)) return { nonce, hash: h };
    nonce++;
  }
}
