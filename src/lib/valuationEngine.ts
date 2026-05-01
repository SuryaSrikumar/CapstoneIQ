export interface DCFInputs {
  fcf: number;
  revenue: number;
  ebitda: number;
  cash: number;
  debt: number;
  shares: number;
  wacc: number;
  growthRate: number;
  terminalGrowth: number;
  projYears: number;
}

export function runDCF({
  fcf,
  revenue,
  ebitda,
  cash,
  debt,
  shares,
  wacc,
  growthRate,
  terminalGrowth,
  projYears,
}: DCFInputs) {
  const w = wacc / 100;
  const g = growthRate / 100;
  const tg = terminalGrowth / 100;
  
  let baseFCF = fcf > 0 ? fcf : ebitda * 0.6;
  if (!baseFCF || baseFCF <= 0) baseFCF = revenue * 0.08;

  const projectedFCF = [];
  let pv = 0;
  for (let i = 1; i <= projYears; i++) {
    const cf = baseFCF * Math.pow(1 + g, i);
    const discounted = cf / Math.pow(1 + w, i);
    projectedFCF.push({ year: `Y${i}`, cf, discounted });
    pv += discounted;
  }
  const terminalFCF = baseFCF * Math.pow(1 + g, projYears) * (1 + tg);
  const terminalValue = terminalFCF / (w - tg);
  const pvTerminal = terminalValue / Math.pow(1 + w, projYears);
  const enterpriseValue = pv + pvTerminal;
  const equityValue = enterpriseValue + (cash || 0) - (debt || 0);
  const perShareValue = shares > 0 ? equityValue / shares : null;

  return {
    projectedFCF,
    pv,
    pvTerminal,
    terminalValue,
    enterpriseValue,
    equityValue,
    perShareValue,
  };
}

export function buildSensitivity(base: DCFInputs) {
  const waccRange = [-2, -1, 0, 1, 2].map((d) => base.wacc + d);
  const growthRange = [-2, -1, 0, 1, 2].map((d) => base.growthRate + d);
  const matrix = growthRange.map((gr) =>
    waccRange.map((wc) => runDCF({ ...base, wacc: wc, growthRate: gr }).perShareValue)
  );
  return { waccRange, growthRange, matrix };
}
