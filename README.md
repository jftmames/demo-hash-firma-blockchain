# README.md

# Demo Interactiva: Hash → HMAC → Firma electrónica → Merkle/Blockchain

**Stack:** Next.js (App Router) + TypeScript + TailwindCSS. Sin CLI local. Despliegue en **Vercel** importando desde **GitHub**. Criptografía en navegador (Web Crypto API) y endpoint **/api/hmac** con `HMAC_KEY` (entorno Vercel).

> ⚠️ **Evita el error `SyntaxError: /index.tsx: Unexpected token (1:0)`**  
> Este fallo aparece cuando se pega **todo el texto (incluido este README)** en un único fichero llamado `index.tsx`. **No** crees un `index.tsx` con todo dentro. Crea **cada archivo con su ruta exacta** (p. ej., `app/page.tsx`, `app/labs/hash/page.tsx`, etc.).

## 1) Crear el repositorio (GitHub web)
1. En GitHub, pulsa **New** → **Repository name**: `demo-hash-firma-blockchain` → **Public** → **Create repository**.
2. Crea los archivos **con las rutas exactas** que ves más abajo. En cada uno, pega su **contenido correspondiente**.
3. Sube el logo opcional en `/public/logo.svg` (o deja el incluido).

## 2) Importar en Vercel (sin CLI)
1. Ve a **vercel.com** → **Add New** → **Project** → **Import Git Repository** y elige tu repo `demo-hash-firma-blockchain`.
2. Framework preset: **Next.js** (se detecta automáticamente).
3. **Environment Variables**: añade `HMAC_KEY` con un valor secreto (ej.: `demo_super_secreto_32b`).
4. Pulsa **Deploy**. Al terminar verás la **URL pública**.
5. Menú del proyecto → **Deployments** para **logs** y estados. Cada push a GitHub redepliega automático.

## 3) Cómo usar la demo (flujo sugerido en clase)
- **Home**: breve tour y acceso a labs.
- **Lab 1 — Hash**: calcular SHA-256 de textos/archivos. Botón **Flip 1 bit** y comparador **% bits distintos** para efecto avalancha.
- **Lab 2 — HMAC**: enviar mensaje al endpoint; recibir tag HMAC; verificar. Mostrar por qué el hash solo no autentica y HMAC requiere clave compartida.
- **Lab 3 — Firma (ECDSA P-256)**: generar par de claves en el navegador, firmar/verificar. Editar mensaje → ver fallo. Exportar/Importar JWK.
- **Lab 4 — Merkle & Mini-Blockchain**: cargar varios documentos → Merkle root y prueba de inclusión; mini‑cadena con `prevHash` y PoW “toy” (dificultad). Editar bloque → se rompe la cadena.
- **Casos legales**: mini-casos (contrato, evidencia, trazabilidad) + micro‑quizzes con feedback.
- **Tests automáticos**: sección **/tests** para verificar comportamiento esencial en el navegador.

## 4) Guion docente (90–120 min)

### Objetivos
- Comprender **integridad** (hash), **autenticación compartida** (HMAC), **autenticidad y no repudio** (firma), y **trazabilidad/inmutabilidad** (Merkle/Blockchain) con foco jurídico.

### Tiempos
- Intro (10’)
- Lab 1 (15–20’)
- Lab 2 (15’)
- Lab 3 (25–30’)
- Lab 4 (25–30’)
- Casos + cierre (10–15’)

### Preguntas detonantes
- ¿Un hash prueba autoría? ¿Qué falta?  
- ¿En qué se diferencia **HMAC** de **firma electrónica** respecto a **no repudio**?  
- ¿Qué asegura un **árbol de Merkle** en pruebas de integridad masivas?  
- ¿Qué rompe un bloque alterado sin recalcular PoW/consenso?

### Rúbrica breve (0–10)
- Participación activa (0–3)  
- Respuestas en micro‑quizzes (0–3)  
- Explicación del caso legal asignado (0–4)

### Autoevaluación del alumno
- ¿Podrías explicar a un cliente la diferencia entre **hash**, **HMAC** y **firma** en 60 segundos?  
- ¿Sabes comprobar una **prueba de inclusión** Merkle?

## 5) QA y fallos comunes
- **QA**: ver sección *QA mínimo* en la Home; todos los labs deben comportarse como se describe.  
- **Fallo**: `HMAC_KEY` no definida → el Lab 2 mostrará error de verificación. Solución: añadir variable y redeploy.  
- **Fallo**: permisos de lectura de archivos → usar navegador moderno, probar con texto primero.  
- **Fallo**: export/import de claves ECDSA → mantener formato **JWK**.

## 6) Notas técnicas
- **Web Crypto API**: SHA-256 y ECDSA (P‑256, `SHA-256`).  
- **HMAC**: se calcula en el servidor con Node `crypto` usando `HMAC_KEY` para ilustrar el modelo de **clave compartida** (no se expone al cliente).  
- **ECDSA**: clave privada en el cliente; no se persiste por defecto (solo exportación JWK manual).  
- **Merkle**: `hash(pair) = sha256(concat(sorted(h1,h2)))` para estabilidad; hojas impares se duplican (estilo Bitcoin simplificado).  
- **PoW “toy”**: prefijo de ceros configurable por slider; solo didáctico (no seguridad real).  
- **Evitar Buffer en navegador**: utilidades base64 nativas (`btoa/atob`) en `lib/utils.ts`.

## 7) Licencia
MIT. Uso docente.

---
