import Link from "next/link";
import { ArrowRight, BarChart3, TrendingUp, Activity, AlertCircle } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 w-full">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Macro <span className="text-[var(--accent)]">Dashboard</span>
        </h1>
        <p className="text-[var(--muted)] max-w-2xl text-lg font-mono">
          System overview for the CapstoneIQ Integrated Pipeline. Combine real-time Sentiment signals with intrinsic Valuation engines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 glass-panel rounded-xl flex flex-col items-center justify-center text-center space-y-4 hover:border-[var(--accent)] transition-colors cursor-pointer group">
          <div className="w-16 h-16 rounded-full bg-[rgba(0,229,255,0.1)] flex items-center justify-center group-hover:scale-110 transition-transform">
            <BarChart3 className="text-[var(--accent)] w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-xl">Valuation Engine</h3>
            <p className="text-sm text-[var(--muted)] mt-2">Calculate intrinsic value using advanced DCF modeling.</p>
          </div>
        </div>
        
        <div className="card p-6 glass-panel rounded-xl flex flex-col items-center justify-center text-center space-y-4 hover:border-[var(--green)] transition-colors cursor-pointer group card-green">
          <div className="w-16 h-16 rounded-full bg-[rgba(0,217,126,0.1)] flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="text-[var(--green)] w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-xl">Sentiment Analysis</h3>
            <p className="text-sm text-[var(--muted)] mt-2">Real-time market sentiment processing via LLM pipelines.</p>
          </div>
        </div>

        <Link href="/stress-test" className="card p-6 glass-panel rounded-xl flex flex-col items-center justify-center text-center space-y-4 hover:border-[var(--accent2)] transition-colors group card-accent2">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,107,53,0.1)] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity className="text-[var(--accent2)] w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-xl">Scenario Stress Tester</h3>
            <p className="text-sm text-[var(--muted)] mt-2">Test macro shocks and trace downstream effects.</p>
          </div>
        </Link>
      </div>

      <div className="card p-8 rounded-xl border border-[var(--border)] bg-[var(--surface2)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Ready to analyze a ticker?</h2>
          <p className="text-[var(--muted)]">Access the integrated Valuation + Sentiment pipeline.</p>
        </div>
        <Link 
          href="/analyze" 
          className="bg-[var(--accent)] text-black px-8 py-4 rounded-lg font-bold hover:bg-[#33eaff] transition-colors flex items-center gap-2"
        >
          Launch Pipeline <ArrowRight size={20} />
        </Link>
      </div>
      
      {/* System Limitations Warning */}
      <div className="card p-6 rounded-xl border border-[var(--red)] bg-[rgba(255,71,87,0.05)]">
        <h2 className="text-xl font-bold text-[var(--red)] flex items-center gap-2 mb-2">
          <AlertCircle size={20} /> System Limitations
        </h2>
        <p className="text-sm text-[var(--muted)] font-mono leading-relaxed">
          Identifies specific weaknesses: data quality, model assumptions, compounding errors across component. This platform uses simulated inputs and heuristics that are not representative of certified fundamental analysis.
        </p>
      </div>
      
      {/* Market Overview Widget */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-[var(--muted)]" /> Market Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["S&P 500", "NASDAQ", "DOW JONES", "VIX"].map((index, i) => (
            <div key={index} className="glass-panel p-4 rounded-lg border border-[var(--border)]">
              <div className="text-xs font-mono text-[var(--muted)]">{index}</div>
              <div className="text-xl font-bold mt-1">
                {i === 3 ? "14.25" : `+${(Math.random() * 2).toFixed(2)}%`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
