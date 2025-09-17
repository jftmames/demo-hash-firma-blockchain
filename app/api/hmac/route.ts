import { NextRequest } from 'next/server';
import crypto from 'node:crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { message, tag } = await req.json().catch(() => ({ message: '' }));
  const key = process.env.HMAC_KEY || '';
  if (!key) return new Response(JSON.stringify({ error: 'HMAC_KEY not set' }), { status: 500 });

  const serverTag = crypto.createHmac('sha256', key).update(String(message)).digest('hex');

  let valid: boolean | undefined = undefined;
  if (typeof tag === 'string') {
    try {
      const a = Buffer.from(serverTag, 'hex');
      const b = Buffer.from(tag, 'hex');
      valid = a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch { valid = false; }
  }

  return new Response(JSON.stringify({ tag: serverTag, valid }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
