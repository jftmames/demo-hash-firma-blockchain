import '@/styles/globals.css'; // ← corregido el import
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Hash • Firma • Blockchain — Demo',
  description: 'Demo docente para Derecho: hash, HMAC, firma ECDSA y Merkle/Blockchain',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
