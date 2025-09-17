'use client';
import { useState } from 'react';

const casos = [
  {
    titulo: 'Contrato digital (firma) — ¿No repudio? ',
    pregunta: '¿Qué mecanismo soporta mejor el no repudio?',
    opciones: ['Hash', 'HMAC', 'Firma electrónica (ECDSA)'],
    correcta: 2,
    feedback: [
      'Hash = integridad, no autoría.',
      'HMAC = autenticación compartida, sin no repudio.',
      'Correcto: firma con clave privada verificable por terceros.'
    ]
  },
  {
    titulo: 'Evidencia en juicio (integridad masiva)',
    pregunta: '¿Qué usar para demostrar inclusión sin revelar todo el conjunto?',
    opciones: ['Firma ECDSA', 'Árbol de Merkle', 'HMAC'],
    correcta: 1,
    feedback: [
      'La firma autentica al firmante, pero no prueba inclusión parcial eficiente.',
      'Correcto: Merkle permite prueba de inclusión.',
      'HMAC no es eficiente para conjuntos grandes ni compartible con terceros.'
    ]
  },
  {
    titulo: 'Auditoría de trazabilidad (webhook)',
    pregunta: 'Para autenticar mensajes máquina-a-máquina en un webhook, ¿qué conviene?',
    opciones: ['HMAC', 'Firma ECDSA siempre', 'Solo hash'],
    correcta: 0,
    feedback: [
      'Correcto: secreto compartido y verificación en servidor.',
      'Firma es válida, pero suele ser más compleja de gestionar para webhooks simples.',
      'Hash solo no autentica.'
    ]
  }
];

export default function Casos() {
  const [sel, setSel] = useState<number[]>(Array(casos.length).fill(-1));
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Casos legales + micro-quiz</h1>
      {casos.map((c, i) => (
        <div key={i} className="card">
          <h2 className="font-semibold">{c.titulo}</h2>
          <p className="text-sm">{c.pregunta}</p>
          <div className="mt-2 flex flex-col gap-2">
            {c.opciones.map((o, j) => (
              <label key={j} className="flex items-center gap-2">
                <input type="radio" name={`q${i}`} onChange={() => setSel(prev => prev.map((x,k)=>k===i?j:x))} />
                <span>{o}</span>
              </label>
            ))}
          </div>
          {sel[i]!==-1 && (
            <p className="mt-2 text-sm">
              {sel[i]===c.correcta ? '✅ ' : '❌ '}
              {c.feedback[sel[i]]}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
