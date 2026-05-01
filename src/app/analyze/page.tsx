"use client";

import { useState } from "react";
import { fetchCapstoneData, FinancialData, SentimentData } from "@/lib/sentimentEngine";
import { runDCF, buildSensitivity, DCFInputs } from "@/lib/valuationEngine";
import { ArrowRight, Settings, MessageCircle, Hash, BookOpen, AlertCircle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fmtB = (n: number) => {
  if (n == null || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n/1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `$${(n/1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `$${(n/1e6).toFixed(2)}M`;
  return `$${Number(n).toFixed(0)}`;
};

export default function AnalyzePage() {
  const [apiKey, setApiKey] = useState("");
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<{ financial: FinancialData; sentiment: SentimentData } | null>(null);

  const [baseInputs, setBaseInputs] = useState<Partial<DCFInputs>>({
    wacc: 10,
    growthRate: 5,
    terminalGrowth: 2.5,
    projYears: 5,
  });

  const [redditWeight, setRedditWeight] = useState(33);
  const [twitterWeight, setTwitterWeight] = useState(33);
  const [newsWeight, setNewsWeight] = useState(34);
  const [sentimentImpact, setSentimentImpact] = useState(50); // 0 to 100% impact

  const getPublicSentimentScore = () => {
    if (!data || !data.sentiment.sources) return data?.sentiment.score || 0;
    const totalW = redditWeight + twitterWeight + newsWeight;
    if (totalW === 0) return 0;
    const s = data.sentiment.sources;
    return ((s.reddit.score * redditWeight) + (s.twitter.score * twitterWeight) + (s.news.score * newsWeight)) / totalW;
  };

  const getEffectiveInputs = () => {
    if (!data) return { wacc: 10, growthRate: 5, terminalGrowth: 2.5 };
    const score = getPublicSentimentScore(); 
    const weight = sentimentImpact / 100; 

    // Max 2% swing on WACC, 3% swing on Growth, 1% swing on Terminal
    const waccAdjustment = -1 * score * 2.0 * weight; 
    const growthAdjustment = score * 3.0 * weight;
    const terminalAdjustment = score * 1.0 * weight;

    return {
      wacc: (baseInputs.wacc || 10) + waccAdjustment,
      growthRate: (baseInputs.growthRate || 5) + growthAdjustment,
      terminalGrowth: (baseInputs.terminalGrowth || 2.5) + terminalAdjustment,
      waccAdjustment,
      growthAdjustment,
      terminalAdjustment,
    };
  };

  const handleAnalyze = async () => {
    if (!ticker.trim()) return;
    if (!apiKey.trim().startsWith("sk-ant")) {
      setError("Please enter a valid Anthropic API key starting with 'sk-ant'.");
      return;
    }
    
    setLoading(true);
    setError("");
    setData(null);

    try {
      const result = await fetchCapstoneData(ticker.trim(), apiKey);
      setData(result);
      setBaseInputs({
        wacc: result.financial.suggestedWACC ?? 10,
        growthRate: result.financial.suggestedGrowthRate ?? 5,
        terminalGrowth: result.financial.suggestedTerminalGrowth ?? 2.5,
        projYears: 5,
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const effective = getEffectiveInputs();

  let dcfOutput = null;
  let sensitivity = null;

  if (data) {
    const inputs: DCFInputs = {
      fcf: data.financial.freeCashFlow,
      revenue: data.financial.revenue,
      ebitda: data.financial.ebitda,
      cash: data.financial.cash,
      debt: data.financial.totalDebt,
      shares: data.financial.sharesOutstanding,
      wacc: effective.wacc,
      growthRate: effective.growthRate,
      terminalGrowth: effective.terminalGrowth,
      projYears: baseInputs.projYears || 5,
    };
    dcfOutput = runDCF(inputs);
    sensitivity = buildSensitivity(inputs);
  }

  // Sentiment Source Icons
  const sourceIcons: Record<string, any> = {
    reddit: <MessageCircle size={16} className="text-[#FF4500]" />,
    twitter: <Hash size={16} className="text-[#1DA1F2]" />,
    news: <BookOpen size={16} className="text-[var(--gold)]" />
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Search Header */}
      <div className="glass-panel p-6 rounded-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comprehensive Integration Dashboard</h1>
          <p className="text-sm text-[var(--muted)] font-mono mt-1">Sentiment Signals -&gt; DCF Valuation Engine</p>
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
            <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 focus-within:border-[var(--accent)] transition-colors">
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
              className="bg-[var(--accent)] text-black px-8 rounded-lg font-bold tracking-wider uppercase text-sm hover:bg-[#33eaff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <span className="animate-pulse">Loading...</span> : <>Fetch <ArrowRight size={16} /></>}
            </button>
          </div>
        </div>
        {error && <div className="text-[var(--red)] text-sm font-mono bg-[rgba(255,71,87,0.1)] p-3 rounded border border-[rgba(255,71,87,0.3)]">{error}</div>}
      </div>

      {data && dcfOutput && sensitivity && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="card p-6 glass-panel rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold">{data.financial.name} <span className="text-[var(--accent)]">{ticker}</span></h2>
                <p className="font-mono text-sm text-[var(--muted)] mt-1">{data.financial.sector}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-[var(--muted)]">CURRENT PRICE</div>
                <div className="text-2xl font-bold text-[var(--gold)]">${data.financial.currentPrice.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* SECTION A: SENTIMENT SIGNALS DASHBOARD */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><AlertCircle className="text-[var(--accent)]" /> 1. Sentiment Signals</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="md:col-span-1 card p-6 rounded-xl flex flex-col justify-center items-center text-center bg-[var(--surface2)]">
                <div className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase mb-4">Public Sentiment Score</div>
                <div className={`text-5xl font-bold mb-2 ${getPublicSentimentScore() > 0.2 ? 'text-[var(--green)]' : getPublicSentimentScore() < -0.2 ? 'text-[var(--red)]' : 'text-[var(--gold)]'}`}>
                  {getPublicSentimentScore() > 0 ? "+" : ""}{getPublicSentimentScore().toFixed(2)}
                </div>
                <div className="text-sm font-mono">{data.sentiment.label}</div>
                <div className="w-full mt-4 space-y-2 text-left border-t border-[var(--border)] pt-4">
                  <div className="text-[10px] font-mono text-[var(--muted)] mb-2 uppercase">Source Weighting</div>
                  <div>
                    <div className="flex justify-between text-[10px]"><span>Reddit</span><span>{redditWeight}%</span></div>
                    <input type="range" min="0" max="100" value={redditWeight} onChange={e => setRedditWeight(parseInt(e.target.value))} className="w-full h-1 bg-[var(--border)]" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]"><span>X/Twitter</span><span>{twitterWeight}%</span></div>
                    <input type="range" min="0" max="100" value={twitterWeight} onChange={e => setTwitterWeight(parseInt(e.target.value))} className="w-full h-1 bg-[var(--border)]" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px]"><span>Journals</span><span>{newsWeight}%</span></div>
                    <input type="range" min="0" max="100" value={newsWeight} onChange={e => setNewsWeight(parseInt(e.target.value))} className="w-full h-1 bg-[var(--border)]" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 card p-6 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-6">
                {Object.entries(data.sentiment.sources).map(([key, source]) => (
                  <div key={key} className="bg-[var(--surface2)] p-4 rounded-lg border border-[var(--border)]">
                    <div className="flex items-center gap-2 mb-3">
                      {sourceIcons[key]}
                      <span className="font-mono text-xs text-[var(--muted)] uppercase">{source.name}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className={`text-2xl font-bold ${source.score > 0.2 ? 'text-[var(--green)]' : source.score < -0.2 ? 'text-[var(--red)]' : 'text-[var(--text)]'}`}>
                        {source.score > 0 ? "+" : ""}{source.score.toFixed(2)}
                      </div>
                      <div className="text-xs text-[var(--muted)]">Vol: {source.volume.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION B: INTEGRATION ENGINE */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="text-[var(--accent2)]" /> 2. Integration Engine</h2>
            <div className="card p-8 rounded-xl border border-[var(--accent2)] shadow-[0_0_30px_rgba(255,107,53,0.1)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                
                <div className="space-y-4 bg-[var(--surface2)] p-5 rounded-lg border border-[var(--border)]">
                  <div className="text-xs font-mono text-[var(--muted)] tracking-widest border-b border-[var(--border)] pb-2">BASE DCF ASSUMPTIONS</div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Base WACC</span><span className="font-mono">{baseInputs.wacc?.toFixed(1)}%</span></div>
                      <input type="range" min="5" max="20" step="0.5" value={baseInputs.wacc} onChange={e => setBaseInputs({...baseInputs, wacc: parseFloat(e.target.value)})} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Base Growth</span><span className="font-mono">{baseInputs.growthRate?.toFixed(1)}%</span></div>
                      <input type="range" min="-5" max="30" step="0.5" value={baseInputs.growthRate} onChange={e => setBaseInputs({...baseInputs, growthRate: parseFloat(e.target.value)})} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span>Terminal Growth</span><span className="font-mono">{baseInputs.terminalGrowth?.toFixed(1)}%</span></div>
                      <input type="range" min="0" max="5" step="0.5" value={baseInputs.terminalGrowth} onChange={e => setBaseInputs({...baseInputs, terminalGrowth: parseFloat(e.target.value)})} className="w-full" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-[rgba(255,107,53,0.05)] p-5 rounded-lg border border-[rgba(255,107,53,0.2)] text-center relative h-full flex flex-col justify-center">
                  <ArrowRight className="absolute -left-6 top-1/2 -translate-y-1/2 text-[var(--muted)] hidden lg:block" />
                  <ArrowRight className="absolute -right-6 top-1/2 -translate-y-1/2 text-[var(--muted)] hidden lg:block" />
                  
                  <div className="text-xs font-mono text-[var(--accent2)] tracking-widest mb-4">SENTIMENT IMPACT (MAX EDIT)</div>
                  <div className="text-4xl font-bold font-mono text-[var(--accent2)] mb-4">{sentimentImpact}%</div>
                  <div>
                    <input type="range" min="0" max="100" step="5" value={sentimentImpact} onChange={e => setSentimentImpact(parseInt(e.target.value))} className="w-full !bg-[rgba(255,107,53,0.3)] [&::-webkit-slider-thumb]:!bg-[var(--accent2)]" />
                    <p className="text-[10px] text-[var(--muted)] mt-2">Adjust to modify assumptions</p>
                  </div>
                </div>

                <div className="space-y-4 bg-[rgba(0,217,126,0.05)] p-5 rounded-lg border border-[rgba(0,217,126,0.2)]">
                  <div className="text-xs font-mono text-[var(--green)] tracking-widest border-b border-[rgba(0,217,126,0.2)] pb-2">EFFECTIVE ASSUMPTIONS</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Effective WACC</span>
                      <div className="text-right">
                        <span className="text-lg font-bold font-mono">{effective.wacc.toFixed(2)}%</span>
                        <div className={`text-[10px] font-mono ${effective.waccAdjustment < 0 ? 'text-[var(--green)]' : effective.waccAdjustment > 0 ? 'text-[var(--red)]' : 'text-[var(--muted)]'}`}>
                          {effective.waccAdjustment > 0 ? '+' : ''}{effective.waccAdjustment.toFixed(2)}% adj
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Effective Growth</span>
                      <div className="text-right">
                        <span className="text-lg font-bold font-mono">{effective.growthRate.toFixed(2)}%</span>
                        <div className={`text-[10px] font-mono ${effective.growthAdjustment > 0 ? 'text-[var(--green)]' : effective.growthAdjustment < 0 ? 'text-[var(--red)]' : 'text-[var(--muted)]'}`}>
                          {effective.growthAdjustment > 0 ? '+' : ''}{effective.growthAdjustment.toFixed(2)}% adj
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Terminal Growth</span>
                      <div className="text-right">
                        <span className="text-lg font-bold font-mono">{effective.terminalGrowth.toFixed(2)}%</span>
                        <div className={`text-[10px] font-mono ${effective.terminalAdjustment > 0 ? 'text-[var(--green)]' : effective.terminalAdjustment < 0 ? 'text-[var(--red)]' : 'text-[var(--muted)]'}`}>
                          {effective.terminalAdjustment > 0 ? '+' : ''}{effective.terminalAdjustment.toFixed(2)}% adj
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: VALUATION DASHBOARD */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><DollarSign className="text-[var(--green)]" /> 3. Valuation Outputs</h2>
            
            {/* Formula Strip */}
            <div className="bg-[var(--surface2)] border border-[var(--border)] p-4 flex flex-wrap gap-x-2 gap-y-4 items-center font-mono text-xs text-[var(--muted)] mb-6 rounded-lg overflow-x-auto">
              <span className="whitespace-nowrap">Σ PV(FCFs)</span>
              <span className="text-[var(--text)] whitespace-nowrap">{fmtB(dcfOutput.pv)}</span>
              <span className="px-1">+</span>
              <span className="whitespace-nowrap">PV(Terminal Value)</span>
              <span className="text-[var(--text)] whitespace-nowrap">{fmtB(dcfOutput.pvTerminal)}</span>
              <span className="px-1">=</span>
              <span className="whitespace-nowrap">Enterprise Value</span>
              <span className="text-[var(--text)] whitespace-nowrap">{fmtB(dcfOutput.enterpriseValue)}</span>
              <span className="px-1 whitespace-nowrap">+ Cash {fmtB(data.financial.cash)} − Debt {fmtB(data.financial.totalDebt)}</span>
              <span className="px-1">=</span>
              <span className="whitespace-nowrap">Equity Value</span>
              <span className="text-[var(--text)] whitespace-nowrap">{fmtB(dcfOutput.equityValue)}</span>
              <span className="px-1 whitespace-nowrap">÷ {data.financial.sharesOutstanding ? (data.financial.sharesOutstanding/1e6).toFixed(0) : "?"}M shares</span>
              <span className="px-2">→</span>
              <span className="text-[var(--accent)] font-bold whitespace-nowrap">${dcfOutput.perShareValue?.toFixed(2)} / share</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6 rounded-xl border border-[var(--border)] bg-[var(--surface2)]">
                <div className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase mb-2">Enterprise Value</div>
                <div className="text-3xl font-bold text-[var(--accent)]">{fmtB(dcfOutput.enterpriseValue)}</div>
                <div className="text-xs text-[var(--muted)] mt-2">PV FCF + Terminal Value</div>
              </div>
              
              <div className="card p-6 rounded-xl border border-[var(--border)] bg-[var(--surface2)]">
                <div className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase mb-2">Equity Value</div>
                <div className="text-3xl font-bold text-[var(--accent2)]">{fmtB(dcfOutput.equityValue)}</div>
                <div className="text-xs text-[var(--muted)] mt-2">EV + Cash − Debt</div>
              </div>
              
              <div className={`card p-6 rounded-xl border shadow-lg ${dcfOutput.perShareValue && dcfOutput.perShareValue > data.financial.currentPrice ? 'border-[var(--green)]' : 'border-[var(--red)]'}`}>
                <div className="text-xs font-mono text-[var(--muted)] tracking-widest uppercase mb-2">Intrinsic Value / Share</div>
                <div className="text-4xl font-bold text-[var(--text)]">${dcfOutput.perShareValue?.toFixed(2) || "—"}</div>
                
                {dcfOutput.perShareValue && (
                  <div className={`text-sm font-mono mt-2 flex items-center gap-1 ${dcfOutput.perShareValue > data.financial.currentPrice ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                    {dcfOutput.perShareValue > data.financial.currentPrice ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {((dcfOutput.perShareValue - data.financial.currentPrice) / data.financial.currentPrice * 100).toFixed(1)}% Margin
                  </div>
                )}
              </div>
            </div>

            {/* Sensitivity Analysis Table */}
            <div className="card p-6 rounded-xl mt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">2D Sensitivity Analysis</h3>
                  <p className="text-sm text-[var(--muted)]">Intrinsic Value across WACC vs. Growth Rate Ranges</p>
                </div>
                <div className="text-xs font-mono text-[var(--muted)]">Base: {effective.wacc.toFixed(1)}% WACC / {effective.growthRate.toFixed(1)}% Growth</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 text-xs font-mono text-[var(--muted)] border-b border-[var(--border)] bg-[var(--surface2)]">Growth ↓ / WACC →</th>
                      {sensitivity.waccRange.map((w, i) => (
                        <th key={i} className="p-3 text-xs font-mono text-[var(--accent)] border-b border-[var(--border)]">
                          {w.toFixed(1)}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivity.growthRange.map((g, gi) => (
                      <tr key={gi}>
                        <td className="p-3 text-xs font-mono text-[var(--accent2)] bg-[rgba(255,107,53,0.05)] border-b border-[rgba(37,37,53,0.3)] text-left">
                          {g.toFixed(1)}%
                        </td>
                        {sensitivity.waccRange.map((w, wi) => {
                          const val = sensitivity?.matrix[gi][wi];
                          // Determine color intensity based on value relative to current price
                          const isBase = wi === 2 && gi === 2;
                          let cellClass = "border border-[rgba(37,37,53,0.3)] p-3 text-sm font-mono transition-colors ";
                          
                          if (val && val > data.financial.currentPrice * 1.2) cellClass += "bg-[rgba(0,217,126,0.15)] text-[var(--green)]";
                          else if (val && val > data.financial.currentPrice) cellClass += "bg-[rgba(0,217,126,0.05)] text-[var(--green)]";
                          else if (val && val < data.financial.currentPrice * 0.8) cellClass += "bg-[rgba(255,71,87,0.15)] text-[var(--red)]";
                          else if (val && val < data.financial.currentPrice) cellClass += "bg-[rgba(255,71,87,0.05)] text-[var(--red)]";
                          else cellClass += "text-[var(--text)]";

                          if (isBase) cellClass += " outline outline-2 outline-[var(--accent)] outline-offset-[-2px] z-10 relative";

                          return (
                            <td key={wi} className={cellClass}>
                              {val ? `$${val.toFixed(0)}` : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
