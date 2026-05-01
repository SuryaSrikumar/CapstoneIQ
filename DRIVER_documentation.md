# DRIVER Methodology Documentation

This document outlines how the **DRIVER** workflow was comprehensively applied to the development of **CapstoneIQ**, an Integrated Finance Application.

## Tools Used
- **Antigravity (Gemini 3.1 Pro)**: Acted as the primary autonomous pair programmer, generating the Next.js frontend code, component architecture, and the Tailwind CSS styling.
- **Anthropic Claude API**: Acted as the simulated backend data provider, feeding both financial inputs and sentiment scores into the pipeline.
- **DRIVER Plugin**: Structured the workflow and iterative prompting sequence utilized to guide the AI.

---

## DRIVER Workflow

### 1. `/driver:define` (Define)
**Project Goal:** 
The primary objective was to engineer a unified, full-stack financial application that seamlessly integrates two distinct prior projects: a Discounted Cash Flow (DCF) Valuation Engine and a Sentiment Analyzer. 
Using the `/driver:define` command, I defined the system boundaries and constraints: The system must explicitly and visually trace how a change in qualitative market sentiment shifts the quantitative Base WACC and Terminal Growth Rate, ultimately altering the Intrinsic Value. I prompted the AI to design an "Integration Pipeline UI" where the user can drag a "Sentiment Impact Weight" slider to see real-time downstream effects.

### 2. Research (R) & Ideate (I)
Before writing any code, extensive research was conducted on the existing workspace infrastructure by analyzing `dcf-valuation.jsx` (Project 1) and `project-2` (Sentiment Analyzer). I ideated the architecture into three distinct user-facing pages:
1. **Macro Dashboard**: A professional entry point.
2. **Integrated Pipeline**: The crown jewel, a 3-step dashboard (Sentiment Signals -> Integration Engine -> Valuation Outputs).
3. **Scenario Stress Tester**: The "own idea" component, allowing professional simulation of macroeconomic shocks.

### 3. Validate (V)
Validation was performed iteratively at every step:
- **Math Validation**: Cross-checked the DCF outputs (`Enterprise Value = PV(FCF) + PV(Terminal)`).
- **Integration Validation**: Tested the rippling logic. Adjusted the "Sentiment Impact" slider to 100% and verified that a negative sentiment score successfully drove the Effective WACC *up* (increasing risk).

### 4. `/driver:evolve` (Execute / Evolve)
During the execution phase, I utilized `/driver:evolve` to iterate on the initial design. The AI successfully scaffolded the Next.js App Router, but the UI was initially too basic. I explicitly prompted the AI to *evolve* the Analyze page by breaking out the Sentiment Score into three specific source sliders (Reddit, X/Twitter, Financial Journals) and re-introducing the PV FCF formula strip from Project 1. This evolution explicitly achieved the rubric's "Excellent" criteria by "showing the math".

### 5. `/driver:reflect` (Reflect)
Using `/driver:reflect`, I analyzed the final architecture against the rubric. The explicit "Integration Engine" UI makes it incredibly easy to demonstrate the cross-component sensitivity required for the final video presentation. 

However, reflection also identified the system's core limitation: relying on a probabilistic LLM (Claude) for both the financial data and the sentiment score means the final deterministic DCF output is heavily biased by the LLM's hallucination potential. The system serves as a brilliant demonstration of a *pipeline*, but is not fit for certified fundamental analysis.
