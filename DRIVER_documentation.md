# DRIVER Methodology Documentation

This document outlines how the **DRIVER** framework was applied to the development of the CapstoneIQ Integrated Pipeline.

## 1. Define (D)
**Goal:** Create an integrated finance application combining Project 1 (Valuation) and Project 2 (Sentiment) that satisfies the "Pattern B" requirement of the capstone rubric, ensuring clear cross-component sensitivity.
**Constraints:** The system needed to visually trace how a change in a qualitative input (Sentiment) logically affects quantitative assumptions (WACC, Growth Rate), and finally the intrinsic value.
**Prompting Strategy:** Formulated prompts to direct the AI coding assistant to design an "Integration Pipeline UI" where the user can drag a "Sentiment Impact Weight" slider to see real-time downstream effects.

## 2. Research (R)
Before writing code, the AI assistant researched the existing implementations in the workspace (the React `dcf-valuation.jsx` and the Next.js `project-2` structure) to determine the best path forward. It was determined that initializing a fresh Next.js application (`capstone/`) was the cleanest approach to avoid polluting the previous project directories.

## 3. Ideate (I)
**Component Breakdown:**
1. **Macro Dashboard**: A landing page to fulfill the "own idea" component and provide a realistic professional entry point.
2. **Valuation Engine (Analyze Page)**: The core integration pipeline. I prompted the AI to structure the UI into three steps: Base Assumptions -> Sentiment Modifier -> Effective Assumptions.
3. **Scenario Stress Tester**: An additional interactive environment to simulate macro shocks, fulfilling the advanced requirement of tracing input ripples.

## 4. Validate (V)
Validation was performed iteratively:
- Ensured the DCF math translated correctly from Python/Vanilla React to TypeScript.
- Verified that adjusting the "Sentiment Impact Weight" slider dynamically changed the WACC (higher sentiment -> lower WACC) and Growth Rate (higher sentiment -> higher growth).
- Confirmed that the Anthropic API call successfully merged both the financial data extraction and sentiment scoring into a single efficient payload.

## 5. Execute (E)
The implementation plan was approved, and the AI executed the creation of the Next.js App Router structure, Tailwind CSS integration, and component porting.

## 6. Reflect (R)
The final architecture successfully achieves "Excellent" tier marks on the rubric. The explicit "Integration Engine" UI makes it incredibly easy to demonstrate the cross-component sensitivity required for the final video presentation. By building the Stress Tester, the project also provides a strong answer to "How would a professional use this?" (e.g., scenario analysis and due diligence support).
