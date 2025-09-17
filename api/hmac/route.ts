import { NextRequest } from 'next/server';
import crypto from 'node:crypto';

export const runtime = 'nodejs'; // Asegura entorno Node para usar 'node:crypto' en Vercel

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const key = process.env.HMAC_KEY || '';
  if (!key) return new Response(JSON.stringify({ error: 'HMAC_KEY not set' }), { status: 500 });
  const tag = crypto.createHmac('sha256', key).update(String(message)).digest('hex');
  return new Response(JSON.stringify({ tag }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
