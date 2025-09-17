export type Lang = 'es' | 'en';

export const dict = {
  es: {
    title: 'Demo: Hash → HMAC → Firma → Merkle/Blockchain',
    whyLaw: '¿Por qué importa en Derecho?',
    next: 'Siguiente',
    previous: 'Anterior',
    quiz: 'Micro-quiz',
    correct: 'Correcto',
    incorrect: 'Incorrecto',
    hash: {
      title: 'Lab 1 — Hash (integridad y efecto avalancha)',
      keyMsg: 'Un hash verifica integridad, no autoría.',
    },
    hmac: {
      title: 'Lab 2 — HMAC (clave compartida)',
      keyMsg: 'HMAC añade autenticación con clave compartida, pero no no-repudio.',
    },
    sign: {
      title: 'Lab 3 — Firma electrónica (ECDSA P-256)',
      keyMsg: 'La firma electrónica aporta autenticidad y no repudio con clave pública/privada.',
    },
    merkle: {
      title: 'Lab 4 — Merkle & Mini-Blockchain',
      keyMsg: 'Merkle permite pruebas de inclusión eficientes; la cadena se rompe si alteras un bloque.',
    },
  },
  en: {
    title: 'Demo: Hash → HMAC → Signature → Merkle/Blockchain',
    whyLaw: 'Why it matters in Law?',
    next: 'Next',
    previous: 'Previous',
    quiz: 'Micro-quiz',
    correct: 'Correct',
    incorrect: 'Incorrect',
    hash: {
      title: 'Lab 1 — Hash (integrity & avalanche effect)',
      keyMsg: 'A hash checks integrity, not authorship.',
    },
    hmac: {
      title: 'Lab 2 — HMAC (shared key)',
      keyMsg: 'HMAC adds shared-key authentication, not non-repudiation.',
    },
    sign: {
      title: 'Lab 3 — Electronic signature (ECDSA P-256)',
      keyMsg: 'Digital signatures provide authenticity & non-repudiation with public/private keys.',
    },
    merkle: {
      title: 'Lab 4 — Merkle & Mini-Blockchain',
      keyMsg: 'Merkle enables efficient inclusion proofs; the chain breaks if you alter a block.',
    },
  },
} as const;
