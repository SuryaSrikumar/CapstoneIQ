# CapstoneIQ: Sentiment-Enhanced Valuation Pipeline

CapstoneIQ is the culmination of Project 1 (Valuation Engine) and Project 2 (Sentiment Analyzer) into a unified, integrated finance application. It demonstrates how subjective market signals (sentiment) can mathematically drive fundamental valuation models (DCF).

## Project Goals
1. **Integrated Pipeline (Pattern B)**: Establish a clear data flow where the output of the Sentiment Analyzer acts as a direct modifier to the inputs of the Valuation Engine.
2. **Cross-Component Sensitivity**: Allow users to explicitly trace how adjusting the "Sentiment Impact Weight" alters the effective WACC and Growth Rate, ultimately changing the Intrinsic Value per share.
3. **Scenario Testing**: Introduce a Scenario Stress Tester to evaluate the pipeline under massive macroeconomic shocks (e.g., Recession, High Inflation).

## Instructions for Running the Application

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- An Anthropic API Key (`sk-ant-...`) for fetching real-time simulated financial and sentiment data.

### Setup Steps
1. Navigate to the project directory:
   \`\`\`bash
   cd capstone
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open your browser and navigate to \`http://localhost:3000\`.
5. Navigate to the **Valuation Engine** or **Stress Tester** tabs, enter a valid stock ticker (e.g., \`AAPL\`), and paste your Anthropic API Key into the top configuration bar.

## Data Sources
- **Financial Data**: Baseline financial inputs (FCF, WACC, Beta) and Analyst Targets are fetched dynamically via an LLM agent simulation.
- **Sentiment Data**: Market sentiment scores (-1.0 to 1.0) and key drivers are simulated in real-time based on the provided ticker.

## Included Documentation
- \`AI_Disclosure.md\`: Detailed reflection on the use of Generative AI tools in building this application.
- \`DRIVER_documentation.md\`: A breakdown of how the DRIVER methodology was utilized throughout the development lifecycle.
