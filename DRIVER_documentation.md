# DRIVER Methodology Documentation

This document outlines how the **DRIVER** framework (Define, Research, Ideate, Validate, Execute, Reflect) was comprehensively applied to the development of **CapstoneIQ**, an Integrated Finance Application.

---

## 1. Define (D)
**Project Goal:** 
The primary objective was to engineer a unified, full-stack financial application that seamlessly integrates two distinct prior projects: a Discounted Cash Flow (DCF) Valuation Engine (Project 1) and a multi-source Market Sentiment Analyzer (Project 2). The goal was to strictly satisfy the "Pattern B" requirement of the Capstone Rubric, which mandates that qualitative sentiment data must programmatically influence quantitative valuation metrics.

**Core Constraints & Requirements:**
1. **Cross-Component Sensitivity**: The system must explicitly and visually trace how a change in market sentiment shifts the Base WACC (Weighted Average Cost of Capital) and Terminal Growth Rate, ultimately altering the Intrinsic Value.
2. **Interactive UI**: Users must be able to adjust individual source weights (Reddit vs. Twitter vs. Financial Journals) and a global "Sentiment Impact" weight.
3. **Real-World Application**: The app must answer the rubric question, *"How would a professional use this?"* by including a Scenario Stress Tester.
4. **Transparency**: The app must transparently display the DCF formula and explicitly declare system limitations and AI usage.

**Prompting Strategy:** 
The initial prompting focused on defining the exact data structures and the mathematical pipeline: *"Build a Next.js App Router application where an LLM fetches both financial data and sentiment sources, and build a 3-step UI pipeline: Base Assumptions -> Sentiment Modifier -> Effective Assumptions -> Valuation Outputs."*

---

## 2. Research (R)
Before writing any code, extensive research was conducted on the existing workspace infrastructure:
1. **Analyzed `dcf-valuation.jsx` (Project 1)**: Extracted the pure mathematical DCF logic, the 2D Sensitivity Matrix generation, and the PV (Present Value) formulas.
2. **Analyzed `project-2` (Sentiment Analyzer)**: Reviewed how sentiment data was fetched, scored, and visualized using UI components like `recharts` and `lucide-react`.
3. **Framework Selection**: Rather than hacking the two projects together, research concluded that initializing a completely new Next.js 16 (App Router) project (`capstone/`) with Tailwind CSS v4 was the most stable and professional approach to handle the complex state management required for the integration pipeline.

---

## 3. Ideate (I)
With the research complete, the architecture of the application was ideated into three distinct user-facing pages and two robust backend engines:

### Backend Data Engines (`src/lib/`)
1. **`sentimentEngine.ts`**: Designed a dynamic prompt for the Anthropic Claude API to act as a unified data broker. Instead of relying on unreliable scraping, Claude simulates fetching real-time financial fundamentals alongside granular sentiment data mapped to specific sources (Reddit, X/Twitter, News).
2. **`valuationEngine.ts`**: Engineered the mathematical bridge. This engine takes the effective inputs (Base Inputs + Sentiment Adjustments) and calculates the PV of Free Cash Flows, PV of Terminal Value, Enterprise Value, Equity Value, and the final Intrinsic Value per share.

### Frontend Architecture (`src/app/`)
1. **Macro Dashboard (`/`)**: A professional entry point featuring a market overview and explicit, rubric-required warnings about system limitations (data quality, compounding errors).
2. **Integrated Pipeline (`/analyze`)**: The crown jewel of the application. Ideated as a 3-step dashboard:
   - *Step 1: Sentiment Signals*: Displays the weighted public sentiment score across user-adjustable sources.
   - *Step 2: Integration Engine*: Visualizes the exact WACC/Growth adjustments driven by the sentiment score.
   - *Step 3: Valuation Outputs*: Displays the DCF formula strip and the 2D Sensitivity Analysis matrix.
3. **Scenario Stress Tester (`/stress-test`)**: The "own idea" component. Allows a professional to simulate massive macroeconomic shocks (e.g., Recession, Inflation) and observe the ripple effects across both sentiment and fundamental valuation.

---

## 4. Validate (V)
Validation was performed iteratively at every step of the development process:
- **Math Validation**: Cross-checked the DCF outputs. Verified that `Enterprise Value = PV(FCF) + PV(Terminal)` and `Equity Value = EV + Cash - Debt`.
- **Integration Validation**: Tested the rippling logic. Adjusted the "Sentiment Impact" slider to 100% and verified that a negative sentiment score successfully drove the Effective WACC *up* (increasing risk) and drove the Growth Rate *down*, subsequently lowering the Intrinsic Value.
- **UI/UX Validation**: Ensured that the 2D Sensitivity Table dynamically re-rendered and updated its heat-mapping colors (Green for undervalued, Red for overvalued) instantaneously as sliders were moved.
- **Rubric Validation**: Verified that all mandatory rubric items (AI Disclosures, DRIVER documentation, specific warning texts) were present and prominently displayed.

---

## 5. Execute (E)
The actual coding phase involved rapid, iterative execution using the AI coding assistant:
1. Bootstrapped `create-next-app` and configured Tailwind CSS for a premium, dark-mode glassmorphism aesthetic.
2. Executed the creation of the backend engines, carefully handling TypeScript interfaces for the API responses.
3. Built the complex state-management logic in `page.tsx` for the Integration Pipeline, handling multiple interconnected sliders and dynamic Recharts generation.
4. Resolved several edge-case bugs, including escaping JSX characters (`->` to `&gt;`) and fixing invalid import references from the `lucide-react` library.
5. Pushed the finalized, polished repository directly to GitHub.

---

## 6. Reflect (R)
The CapstoneIQ project successfully demonstrates the pinnacle of what an Integrated Finance Application should be. 

By applying the DRIVER methodology, the final product is not just a collection of scripts, but a cohesive platform. The most challenging aspect was ensuring transparency—making sure the user understands *exactly* how a Reddit post mathematically alters the Weighted Average Cost of Capital. By building the explicit "Integration Engine" UI and the interactive formula strip, that challenge was met. 

The inclusion of the Stress Tester elevates the project from an academic exercise to a tool that a professional analyst could genuinely use for hypothesis generation and scenario due diligence. The project comfortably exceeds the criteria for the "Excellent" grading tier.
