"use client";

import { useState } from "react";
import { fetchCapstoneData, FinancialData, SentimentData } from "@/lib/sentimentEngine";
import { runDCF } from "@/lib/valuationEngine";
import { ArrowRight, Zap, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

const SCENARIOS = [
  {
    id: "base",
    name: "Base Case",
    icon: <AlertCircle size={18} />,
    color: "var(--muted)",
    sentimentScoreAdj: 0,
    waccAdj: 0,
    growthAdj: 0,
    desc: "Current market conditions and raw inputs."
  },
  {
    id: "bull",
    name: "AI / Tech Boom",
    icon: <TrendingUp size={18} />,
    color: "var(--green)",
    sentimentScoreAdj: +0.6,
    waccAdj: -1.5,
    growthAdj: +3.0,
    desc: "Exuberant market sentiment. Low perceived risk, high growth expectations."
  },
  {
    id: "bear",
    name: "Macro Recession",
    icon: <TrendingDown size={18} />,
    color: "var(--red)",
    sentimentScoreAdj: -0.8,
    waccAdj: +2.5,
    growthAdj: -4.0,
    desc: "Pessimistic sentiment. High risk premiums, contracting growth."
  },
  {
    id: "inflation",
    name: "High Inflation Shock",
    icon: <Zap size={18} />,
    color: "var(--accent2)",
    sentimentScoreAdj: -0.4,
    waccAdj: +1.5,
    growthAdj: +1.0,
    desc: "Higher cost of capital, but nominal growth increases slightly."
  }
];

export default function StressTestPage() {
  const [apiKey, setApiKey] = useState("");
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<{ financial: FinancialData; sentiment: SentimentData } | null>(null);
  
  const [activeScenario, setActiveScenario] = useState("base");

  const handleAnalyze = async () => {
    if (!ticker.trim()) return;
    if (!apiKey.trim().startsWith("sk-ant")) {
      setError("Please enter a valid Anthropic API key starting with 'sk-ant'.");
      return;
    }
    
    setLoading(true);
    setError("");
    setData(null);
    setActiveScenario("base");

    try {
      const result = await fetchCapstoneData(ticker.trim(), apiKey);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const currentScenario = SCENARIOS.find(s => s.id === activeScenario) || SCENARIOS[0];

  let stressedOutputs = null;
  if (data) {
    const baseWacc = data.financial.suggestedWACC ?? 10;
    const baseGrowth = data.financial.suggestedGrowthRate ?? 5;
    
    const stressedWacc = baseWacc + currentScenario.waccAdj;
    const stressedGrowth = baseGrowth + currentScenario.growthAdj;
    const stressedSentiment = Math.max(-1, Math.min(1, data.sentiment.score + currentScenario.sentimentScoreAdj));

    const dcf = runDCF({
      fcf: data.financial.freeCashFlow,
      revenue: data.financial.revenue,
      ebitda: data.financial.ebitda,
      cash: data.financial.cash,
      debt: data.financial.totalDebt,
      shares: data.financial.sharesOutstanding,
      wacc: stressedWacc,
      growthRate: stressedGrowth,
      terminalGrowth: data.financial.suggestedTerminalGrowth ?? 2.5,
      projYears: 5,
    });

    stressedOutputs = { wacc: stressedWacc, growth: stressedGrowth, sentiment: stressedSentiment, dcf };
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      <div className="glass-panel p-6 rounded-xl space-y-6 border-l-4 border-l-[var(--accent2)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scenario Stress Tester</h1>
          <p className="text-sm text-[var(--muted)] font-mono mt-1">Simulate macroeconomic shocks and evaluate downstream pipeline effects.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2 items-center bg-[var(--surface2)] p-2 rounded-lg border border-[var(--border)]">
            <span className="font-mono text-xs text-[var(--muted)] px-2">API KEY</span>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              placeholder="sk-ant-..." 
              className="bg-transparent outline-none text-sm w-full font-mono text-[var(--text)]"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 focus-within:border-[var(--accent2)] transition-colors">
              <input 
                type="text" 
                value={ticker} 
                onChange={e => setTicker(e.target.value.toUpperCase())} 
                onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                placeholder="TICKER" 
                maxLength={6}
                className="bg-transparent outline-none font-mono text-xl w-32 uppercase tracking-widest text-[var(--text)] py-3"
              />
            </div>
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !ticker.trim()}
              className="bg-[var(--accent2)] text-black px-8 rounded-lg font-bold tracking-wider uppercase text-sm hover:bg-[#ff8a66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <span className="animate-pulse">Loading...</span> : <>Fetch <ArrowRight size={16} /></>}
            </button>
          </div>
        </div>
        {error && <div className="text-[var(--red)] text-sm font-mono bg-[rgba(255,71,87,0.1)] p-3 rounded border border-[rgba(255,71,87,0.3)]">{error}</div>}
      </div>

      {data && stressedOutputs && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
          
          {/* Scenario Selector */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-mono text-xs text-[var(--muted)] tracking-widest uppercase mb-4">Select Macro Shock</h3>
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${activeScenario === s.id ? 'bg-[var(--surface2)] shadow-lg scale-105' : 'bg-transparent hover:bg-[rgba(255,255,255,0.02)]'}`}
                style={{ borderColor: activeScenario === s.id ? s.color : 'var(--border)' }}
              >
                <div className="flex items-center gap-3 mb-2" style={{ color: s.color }}>
                  {s.icon}
                  <span className="font-bold">{s.name}</span>
                </div>
                <p className="text-xs text-[var(--muted)]">{s.desc}</p>
              </button>
            ))}
          </div>

          {/* Stressed Outputs */}
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-6 glass-panel rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{data.financial.name} <span className="text-[var(--accent)]">{ticker}</span></h2>
                  <div className="font-mono text-sm text-[var(--muted)] mt-1">Stressed Output: {currentScenario.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-[var(--muted)]">CURRENT PRICE</div>
                  <div className="text-xl font-bold text-[var(--gold)]">${data.financial.currentPrice.toFixed(2)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[var(--surface2)] p-4 rounded-lg border border-[var(--border)]">
                  <div className="text-xs font-mono text-[var(--muted)] mb-2 uppercase">Stressed Sentiment</div>
                  <div className="text-3xl font-bold" style={{ color: currentScenario.color }}>
                    {stressedOutputs.sentiment.toFixed(2)}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-mono">
                    Base: {data.sentiment.score.toFixed(2)} ({currentScenario.sentimentScoreAdj > 0 ? '+' : ''}{currentScenario.sentimentScoreAdj.toFixed(2)})
                  </div>
                </div>

                <div className="bg-[var(--surface2)] p-4 rounded-lg border border-[var(--border)]">
                  <div className="text-xs font-mono text-[var(--muted)] mb-2 uppercase">Stressed WACC</div>
                  <div className="text-3xl font-bold" style={{ color: currentScenario.color }}>
                    {stressedOutputs.wacc.toFixed(1)}%
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-mono">
                    Base: {data.financial.suggestedWACC?.toFixed(1)}% ({currentScenario.waccAdj > 0 ? '+' : ''}{currentScenario.waccAdj.toFixed(1)}%)
                  </div>
                </div>

                <div className="bg-[var(--surface2)] p-4 rounded-lg border border-[var(--border)]">
                  <div className="text-xs font-mono text-[var(--muted)] mb-2 uppercase">Stressed Growth</div>
                  <div className="text-3xl font-bold" style={{ color: currentScenario.color }}>
                    {stressedOutputs.growth.toFixed(1)}%
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-mono">
                    Base: {data.financial.suggestedGrowthRate?.toFixed(1)}% ({currentScenario.growthAdj > 0 ? '+' : ''}{currentScenario.growthAdj.toFixed(1)}%)
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-xl text-center border-t border-[var(--border)]" style={{ background: `linear-gradient(180deg, rgba(26,26,36,0) 0%, ${currentScenario.color}15 100%)` }}>
                <div className="text-sm font-mono text-[var(--muted)] tracking-widest uppercase mb-4">Stressed Intrinsic Value</div>
                <div className="text-7xl font-bold tracking-tighter mb-4" style={{ color: currentScenario.color }}>
                  ${stressedOutputs.dcf.perShareValue?.toFixed(2) || "—"}
                </div>
                
                {stressedOutputs.dcf.perShareValue && (
                  <div className="inline-block px-4 py-2 rounded-full bg-[var(--surface2)] border border-[var(--border)] font-mono text-sm">
                    Margin of Safety: <span className={stressedOutputs.dcf.perShareValue > data.financial.currentPrice ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
                      {((stressedOutputs.dcf.perShareValue - data.financial.currentPrice) / data.financial.currentPrice * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
