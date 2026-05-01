export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="glass-panel p-5 rounded-lg border-l-4 border-l-[var(--gold)] mb-6">
          <h3 className="text-[var(--gold)] font-bold mb-2">Academic AI Disclosure</h3>
          <p className="text-sm text-[var(--muted)] space-y-2">
            This Capstone project was developed with the assistance of the <strong>DRIVER Plugin</strong> and LLM APIs (Anthropic Claude) to simulate real-time financial data fetching and sentiment analysis. It is designed solely to demonstrate the integration of multiple data pipelines (Valuation + Sentiment -&gt; Stress Testing). Do not use this tool for actual financial decisions.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-[var(--muted)] font-mono">
          <p>CapstoneIQ © 2026</p>
          <p className="mt-2 md:mt-0">Pattern B: Sentiment-Enhanced Valuation Pipeline</p>
        </div>
      </div>
    </footer>
  );
}
