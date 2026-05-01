export interface FinancialData {
  name: string;
  sector: string;
  currentPrice: number;
  revenue: number;
  ebitda: number;
  freeCashFlow: number;
  netIncome: number;
  totalDebt: number;
  cash: number;
  sharesOutstanding: number;
  beta: number;
  revenueGrowth3yr: number;
  ebitdaMargin: number;
  analystTargetPrice: number | null;
  suggestedWACC: number;
  suggestedGrowthRate: number;
  suggestedTerminalGrowth: number;
  waccComponents: any;
}

export interface SentimentSource {
  name: string;
  score: number;
  volume: number;
}

export interface SentimentData {
  score: number; // -1 to 1 (Public Sentiment Score)
  label: string;
  summary: string;
  keyDrivers: string[];
  sources: {
    reddit: SentimentSource;
    twitter: SentimentSource;
    news: SentimentSource;
  };
}

export async function fetchCapstoneData(ticker: string, apiKey: string): Promise<{ financial: FinancialData; sentiment: SentimentData }> {
  if (!ticker || !apiKey) throw new Error("Missing ticker or API key");

  const prompt = `You are a financial data API powering an integrated Valuation and Sentiment pipeline. Return ONLY a valid JSON object (no markdown, no backticks, no explanation) for the stock ticker: ${ticker.toUpperCase()}

Return this exact JSON structure with real estimated numbers and current market sentiment:
{
  "financial": {
    "name": "Company Full Name",
    "sector": "Sector / Industry",
    "currentPrice": 0,
    "revenue": 0,
    "ebitda": 0,
    "freeCashFlow": 0,
    "netIncome": 0,
    "totalDebt": 0,
    "cash": 0,
    "sharesOutstanding": 0,
    "beta": 0,
    "revenueGrowth3yr": 0,
    "ebitdaMargin": 0,
    "analystTargetPrice": null,
    "suggestedWACC": 0,
    "suggestedGrowthRate": 0,
    "suggestedTerminalGrowth": 2.5,
    "waccComponents": {
      "riskFreeRate": 4.5,
      "equityRiskPremium": 5.5,
      "costOfDebt": 4.0,
      "taxRate": 0.21,
      "debtWeight": 0.2,
      "equityWeight": 0.8
    }
  },
  "sentiment": {
    "score": 0.5, // Float between -1.0 (extreme bearish) to 1.0 (extreme bullish)
    "label": "Bullish", // Bullish, Neutral, or Bearish
    "summary": "1-2 sentence summary of current market sentiment",
    "keyDrivers": ["Driver 1", "Driver 2", "Driver 3"],
    "sources": {
      "reddit": { "name": "Reddit (r/stocks, r/wallstreetbets)", "score": 0.6, "volume": 12500 },
      "twitter": { "name": "X/Twitter (FinTwit)", "score": 0.4, "volume": 45000 },
      "news": { "name": "Financial Journals (WSJ, Bloomberg)", "score": 0.2, "volume": 1200 }
    }
  }
}

All monetary values must be raw USD numbers (not in billions). Return ONLY the JSON object, nothing else.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey.trim(),
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-opus-4-6", 
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const raw = await res.json();
  const text = raw.content?.map((c: any) => c.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
