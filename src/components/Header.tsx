import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[rgba(17,17,24,0.8)] backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold tracking-tight text-[var(--accent)] group-hover:text-[var(--text)] transition-colors">
              Capstone<span className="text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">IQ</span>
            </div>
            <div className="font-mono text-[10px] text-[var(--muted)] tracking-widest uppercase border-l border-[var(--border)] pl-2 ml-2 hidden sm:block">
              Integrated Pipeline
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs tracking-wider">
            <Link href="/" className="px-4 py-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[var(--muted)] hover:text-[var(--text)] transition-all">
              Dashboard
            </Link>
            <Link href="/analyze" className="px-4 py-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[var(--muted)] hover:text-[var(--text)] transition-all">
              Valuation Engine
            </Link>
            <Link href="/stress-test" className="px-4 py-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[var(--muted)] hover:text-[var(--text)] transition-all">
              Stress Tester
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
