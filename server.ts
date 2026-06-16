import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch upcoming corporate actions with search grounding
  app.get("/api/upcoming-ca", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ 
          success: true, 
          source: "local-fallback-no-key",
          data: getFallbackUpcomingCA() 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const todayStr = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric' });

      const prompt = `Get the actual upcoming corporate actions (primarily Bonus Issues, Stock Splits, Dividends, and Rights Issues) for Indian stocks listed on the National Stock Exchange (NSE) / BSE. Today's date is ${todayStr}.
Search for official exchange announcements or trusted stock market sites (e.g. NSE India, BSE India, Moneycontrol, Chittorgarh) to find authentic, real upcoming corporate actions.
Find at least 8 upcoming corporate actions starting from or after June 2026.
Return the structured corporate actions strictly as a JSON object inside a JSON markdown code block.
The JSON object must have a single key "data", which is an array of objects. Each object in "data" must have the following fields:
- "symbol": NSE trading symbol (e.g., ITC, RELIANCE, TATASTEEL, POWERGRID)
- "company": High-resolution official company name (e.g., Tata Steel Limited)
- "type": Corporate action type - strictly one of: "Bonus Issue", "Stock Split", "Dividend", "Rights Issue"
- "purpose": Detail of the event (e.g., "Interim Dividend of ₹10 per share", "Stock Split from ₹10 to ₹2", "Bonus Issue in 1:1 ratio", "Rights issue in 1:9 ratio at ₹104.5")
- "exDate": Ex-date in YYYY-MM-DD format (must be on or after today's date ${new Date().toISOString().split('T')[0]})
- "recordDate": Record date in YYYY-MM-DD format (or "N/A" if unknown)
- "ratioNumerator": numeric value for calculations (e.g., for 1:2 bonus, numerator is 1. For 10-to-2 split, numerator is 5. For dividend, dividend amount (e.g. 10). For rights, shares granted (e.g. 1))
- "ratioDenominator": numeric value for calculations (e.g., for bonus/rights, denominator is 2/9. For split, denominator is 1. For dividend, use the settlement price or existing strike if available, or just omit if dividend amount is enough)

Make sure the data is actual and accurate. Even if there are only a few immediate upcoming events, list them clearly. If some fields are missing, provide your best estimation based on the news search.
Return ONLY the JSON block. Example output format you must follow strictly:
\`\`\`json
{
  "data": [
    {
      "symbol": "ITC",
      "company": "ITC Limited",
      "type": "Dividend",
      "purpose": "Final Dividend of ₹7.50",
      "exDate": "2026-06-25",
      "recordDate": "2026-06-26",
      "ratioNumerator": 7.5,
      "ratioDenominator": 310
    }
  ]
}
\`\`\`
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      let parsedData: any = null;

      // Extract JSON block
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[1].trim());
        } catch (e) {
          console.error("Error parsing grounded regex match:", e);
        }
      }

      if (!parsedData) {
        try {
          parsedData = JSON.parse(text);
        } catch (e) {
          console.error("Error parsing whole response text:", e);
        }
      }

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || chunk.web?.uri || "Exchange Web Source",
        url: chunk.web?.uri || "#"
      })) || [];

      if (parsedData && Array.isArray(parsedData.data)) {
        return res.json({
          success: true,
          source: "gemini-live",
          data: parsedData.data,
          sources: sources
        });
      }

      return res.json({
        success: true,
        source: "gemini-failed-fallback",
        data: getFallbackUpcomingCA(),
        rawText: text,
        sources: sources
      });

    } catch (error: any) {
      console.error("Error in api/upcoming-ca:", error);
      res.json({
        success: false,
        error: error.message || error,
        data: getFallbackUpcomingCA()
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function getFallbackUpcomingCA() {
  return [
    {
      symbol: "TATASTEEL",
      company: "Tata Steel Limited",
      type: "Dividend",
      purpose: "Final dividend of ₹3.60 per equity share",
      exDate: "2026-06-21",
      recordDate: "2026-06-21",
      ratioNumerator: 3.6,
      ratioDenominator: 168.4
    },
    {
      symbol: "LTIM",
      company: "LTIMindtree Limited",
      type: "Dividend",
      purpose: "Final dividend of ₹45.00 per equity share",
      exDate: "2026-06-25",
      recordDate: "2026-06-26",
      ratioNumerator: 45.0,
      ratioDenominator: 4890
    },
    {
      symbol: "POWERGRID",
      company: "Power Grid Corp of India Ltd",
      type: "Bonus Issue",
      purpose: "Bonus issue of shares in 1:3 ratio",
      exDate: "2026-07-03",
      recordDate: "2026-07-04",
      ratioNumerator: 1,
      ratioDenominator: 3
    },
    {
      symbol: "RELIANCE",
      company: "Reliance Industries Limited",
      type: "Dividend",
      purpose: "Interim dividend of ₹15.00 per share",
      exDate: "2026-07-08",
      recordDate: "2026-07-09",
      ratioNumerator: 15,
      ratioDenominator: 2850
    },
    {
      symbol: "INFY",
      company: "Infosys Limited",
      type: "Dividend",
      purpose: "Annual Dividend of ₹28.00 per share",
      exDate: "2026-06-29",
      recordDate: "2026-06-30",
      ratioNumerator: 28,
      ratioDenominator: 1450
    },
    {
      symbol: "HDFCBANK",
      company: "HDFC Bank Limited",
      type: "Stock Split",
      purpose: "Stock Split from face value of ₹10 to ₹2 (5:1)",
      exDate: "2026-07-15",
      recordDate: "2026-07-16",
      ratioNumerator: 5,
      ratioDenominator: 1
    },
    {
      symbol: "BHARTIARTL",
      company: "Bharti Airtel Limited",
      type: "Rights Issue",
      purpose: "Rights issue of 1 Rights share for every 14 held",
      exDate: "2026-07-22",
      recordDate: "2026-07-24",
      ratioNumerator: 1,
      ratioDenominator: 14
    },
    {
      symbol: "WIPRO",
      company: "Wipro Limited",
      type: "Bonus Issue",
      purpose: "Bonus Shares in 1:1 ratio",
      exDate: "2026-08-01",
      recordDate: "2026-08-03",
      ratioNumerator: 1,
      ratioDenominator: 1
    }
  ];
}

startServer();
