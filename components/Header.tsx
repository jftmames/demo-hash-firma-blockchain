'use client';
import Link from 'next/link';
import Image from 'next/image';
import LanguageToggle from './LanguageToggle';
import ContrastToggle from './ContrastToggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
        <Image src="/logo.svg" alt="logo" width={120} height={36} priority />
        <nav className="ml-auto flex items-center gap-3">
          <Link className="btn" href="/">Home</Link>
          <Link className="btn" href="/labs/hash">Hash</Link>
          <Link className="btn" href="/labs/hmac">HMAC</Link>
          <Link className="btn" href="/labs/firma">Firma</Link>
          <Link className="btn" href="/labs/merkle">Merkle</Link>
          <Link className="btn" href="/labs/blockchain">Blockchain</Link>
          <Link className="btn" href="/casos">Casos</Link>
          <Link className="btn" href="/tests">Tests</Link>
          <LanguageToggle />
          <ContrastToggle />
        </nav>
      </div>
    </header>
  );
}
