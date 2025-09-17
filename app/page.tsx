import Link from 'next/link';
import Progress from '@/components/Progress';

export default function Home() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Hash → HMAC → Firma → Merkle/Blockchain</h1>
      <p className="text-gray-700 dark:text-gray-300">Tour guiado de 60–90 min. Entenderás: integridad (hash), autenticación compartida (HMAC), no repudio (firma) y trazabilidad (Merkle/Blockchain).</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold">1) Hash</h2>
          <p>Calcula SHA-256, cambia 1 bit y mide el efecto avalancha.</p>
          <Link className="btn mt-2" href="/labs/hash">Ir al Lab</Link>
        </div>
        <div className="card">
          <h2 className="font-semibold">2) HMAC</h2>
          <p>Autenticación con clave compartida mediante endpoint seguro.</p>
          <Link className="btn mt-2" href="/labs/hmac">Ir al Lab</Link>
        </div>
        <div className="card">
          <h2 className="font-semibold">3) Firma (ECDSA)</h2>
          <p>Genera claves, firma y verifica. Edita el mensaje y observa el fallo.</p>
          <Link className="btn mt-2" href="/labs/firma">Ir al Lab</Link>
        </div>
        <div className="card">
          <h2 className="font-semibold">4) Merkle/Blockchain</h2>
          <p>Merkle root, prueba de inclusión y mini-cadena con PoW didáctico.</p>
          <Link className="btn mt-2" href="/labs/merkle">Ir al Lab</Link>
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold">Casos legales</h2>
        <p>Aplica lo aprendido a contrato, evidencia y trazabilidad con micro-quizzes.</p>
        <Link className="btn mt-2" href="/casos">Abrir casos</Link>
      </div>
      <div className="card">
        <h2 className="font-semibold">QA mínimo</h2>
        <ul className="list-disc ml-5 text-sm">
          <li>Flip 1 bit &gt; 40% de bits diferentes de media.</li>
          <li>HMAC rechaza mensajes manipulados.</li>
          <li>Firma verifica y falla tras editar.</li>
          <li>Merkle root estable; prueba de inclusión ok; mini-cadena se rompe ante cambios.</li>
        </ul>
        <Progress step={1} total={4} />
      </div>
    </section>
  );
}
