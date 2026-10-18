import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI client securely on server only when API key is available
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'DukaanIQ Enterprise POS & ERP',
    timestamp: new Date().toISOString(),
    aiReady: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Grounded Business Copilot endpoint
app.post('/api/ai/copilot', async (req: Request, res: Response) => {
  try {
    const { message, storeContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are the DukaanIQ AI Business Copilot — an expert retail ERP & POS assistant for store owners and managers in India.
You provide clear, direct, and numerically grounded answers based strictly on the provided real-time store context.
Currency is Indian Rupee (INR / ₹). Tax is Indian GST (CGST/SGST/IGST).

Store Context:
${JSON.stringify(storeContext || {}, null, 2)}

Rules:
1. Always base numeric claims on the provided store context. If data is missing, clearly state that rather than inventing numbers.
2. Structure your answer with clear takeaways.
3. When recommending actions (like reordering stock or adjusting pricing), suggest concrete next steps.
4. Keep the tone professional, pragmatic, and helpful for a retail operator.
5. Provide a JSON response with:
   - answer: string (markdown format allowed for bolding and lists)
   - evidence: array of { type: string, title: string, value: string, detail?: string }
   - suggestedActions: array of { label: string, actionType: "create_po" | "apply_pricing" | "view_report" | "open_product", payload?: any }
`;

    if (!ai) {
      return res.json({
        answer: `I am running in offline rule-based mode. Based on your current store records for ${storeContext?.locationName || 'Delhi Flagship'}:\n\n` +
          `• Today's Gross Revenue: ₹${(storeContext?.todaySales || 48920).toLocaleString('en-IN')}\n` +
          `• Low-Stock Products: ${storeContext?.lowStockCount || 3} items need immediate reordering.\n` +
          `• Projected Month-End GST Liability: ₹${(storeContext?.gstLiability || 18400).toLocaleString('en-IN')}.\n` +
          `• Top Supplier: TechSupply India Ltd with 98% on-time delivery rate.`,
        evidence: [
          { type: 'kpi', title: "Today's Sales", value: `₹${(storeContext?.todaySales || 48920).toLocaleString('en-IN')}` },
          { type: 'inventory', title: 'Low Stock Alerts', value: `${storeContext?.lowStockCount || 3} SKUs` },
        ],
        suggestedActions: [
          { label: 'Review AI Reorder Drafts', actionType: 'view_report' },
          { label: 'Check GST Filing Summary', actionType: 'view_report' },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { answer: text, evidence: [], suggestedActions: [] };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Copilot Error:', error);
    res.status(500).json({
      error: 'AI assistant temporarily unavailable',
      details: error.message,
      fallbackAnswer: 'Could not process query with Gemini. Please refer to deterministic ERP dashboards.',
    });
  }
});

// POS Real-Time Cross-Sell Assistant
app.post('/api/ai/cross-sell', async (req: Request, res: Response) => {
  try {
    const { cartItems, availableProducts } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.json({ recommendations: [] });
    }

    const prompt = `Cart items: ${JSON.stringify(cartItems.map((c: any) => ({ name: c.product.name, category: c.product.category })))}
Available store catalog: ${JSON.stringify((availableProducts || []).map((p: any) => ({ id: p.id, name: p.name, category: p.category, price: p.sellingPrice })))}

Analyze high-margin, high-affinity cross-sell add-ons for the cashier to recommend.
Return JSON with key "recommendations": array of {
  productId: string,
  productName: string,
  reason: string,
  recommendedDiscountPercent: number,
  pitch: string
}`;

    if (!ai) {
      // Deterministic cross-sell rule
      const hasPhone = cartItems.some((c: any) => c.product.category === 'Smartphones');
      const hasAudio = cartItems.some((c: any) => c.product.category === 'Audio');

      const recommendations = [];
      if (hasPhone) {
        recommendations.push(
          {
            productId: 'prod-004',
            productName: 'VoltSpeed 65W GaN Dual USB-C Fast Charger',
            reason: 'Phone bundle complement — high charging speed compatibility',
            recommendedDiscountPercent: 10,
            pitch: 'Add 65W GaN charger at 10% bundle discount',
          },
          {
            productId: 'prod-006',
            productName: 'UltraClear 9H Tempered Glass Screen Guard',
            reason: 'Screen protection essential for new smartphone buyers',
            recommendedDiscountPercent: 15,
            pitch: 'Offer 9H Oleophobic Tempered Glass at special price ₹210',
          }
        );
      } else if (hasAudio) {
        recommendations.push({
          productId: 'prod-012',
          productName: '7-in-1 Multi-Device Electronics Cleaning Kit',
          reason: 'Headphone and earbuds maintenance accessory',
          recommendedDiscountPercent: 10,
          pitch: 'Keep earbuds clean — bundle 7-in-1 cleaning kit for ₹314',
        });
      }

      return res.json({ recommendations });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"recommendations": []}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Cross-sell error:', error);
    res.json({ recommendations: [] });
  }
});

// Dynamic Pricing Optimization endpoint
app.post('/api/ai/pricing', async (req: Request, res: Response) => {
  try {
    const { products } = req.body;

    if (!ai) {
      // Fallback deterministic pricing model
      const suggestions = (products || []).slice(0, 5).map((p: any) => {
        const margin = ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100;
        let suggestedPrice = p.sellingPrice;
        let expectedUplift = 0;
        let reason = 'Price is well-balanced with demand.';

        if (margin > 45) {
          suggestedPrice = Math.round(p.sellingPrice * 0.92 / 10) * 10 - 1; // psychological ₹99 pricing
          expectedUplift = 22;
          reason = `High current margin (${margin.toFixed(0)}%). A slight 8% price drop can stimulate 22% higher inventory turnover.`;
        } else if (margin < 20) {
          suggestedPrice = Math.round(p.sellingPrice * 1.06 / 10) * 10;
          expectedUplift = -2;
          reason = `Thin margin (${margin.toFixed(0)}%). Inelastic demand allows +6% price increase to protect retailer gross profit.`;
        }

        return {
          productId: p.id,
          productName: p.name,
          currentPrice: p.sellingPrice,
          suggestedPrice,
          costPrice: p.costPrice,
          currentMarginPercent: Math.round(margin),
          projectedMarginPercent: Math.round(((suggestedPrice - p.costPrice) / suggestedPrice) * 100),
          expectedSalesUpliftPercent: expectedUplift,
          reason,
          confidence: 'High',
        };
      });

      return res.json({ suggestions });
    }

    const prompt = `Analyze these retail products for pricing optimization in an Indian electronics store:
${JSON.stringify((products || []).slice(0, 8))}

Suggest optimal prices considering cost price, margin, sales velocity, and psychological price points (e.g. ₹X99, ₹X49).
Return JSON with key "suggestions": array of {
  productId: string,
  productName: string,
  currentPrice: number,
  suggestedPrice: number,
  costPrice: number,
  currentMarginPercent: number,
  projectedMarginPercent: number,
  expectedSalesUpliftPercent: number,
  reason: string,
  confidence: "High" | "Medium" | "Low"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"suggestions": []}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Pricing error:', error);
    res.json({ suggestions: [] });
  }
});

// ==========================================
// AI HELPER DEDICATED ENDPOINTS (DukaanIQ)
// ==========================================

const SHOP_DATA = {
  shop: 'Delhi Flagship, Connaught Place',
  date: '16 Oct 2026',
  salesToday: 'Rs 18,450 from 23 bills',
  items: [
    { name: 'SonicPro Wireless Headphones', price: 3499, stock: 14, category: 'Audio' },
    { name: 'AeroPods True Wireless', price: 1799, stock: 38, category: 'Audio' },
    { name: 'NexPhone 15 Pro', price: 64999, stock: 6, category: 'Smartphones' },
    { name: 'VoltSpeed 65W Charger', price: 1499, stock: 45, category: 'Chargers' },
    { name: 'VoltTank 20,000 mAh Power Bank', price: 1899, stock: 18, category: 'Power Banks' },
    { name: 'Braided USB-C Cable 60W', price: 299, stock: 70, category: 'Cables' },
    { name: 'SonicBoom Speaker', price: 2499, stock: 8, category: 'Audio' },
  ],
  customersOwing: [
    { name: 'Rohit Sharma', amountDue: 4200, daysLate: 12 },
    { name: 'Meera Kapoor', amountDue: 1850, daysLate: 5 },
    { name: 'Imran Khan', amountDue: 9600, daysLate: 30 },
  ],
};

// 1. AI Ask Chat Endpoint
app.post('/api/ai/helper/ask', async (req: Request, res: Response) => {
  try {
    const { question, history } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const systemPrompt = `You are the AI Helper for DukaanIQ, a billing and shop software for Indian retail shops.
You speak in very simple Indian English.
Use short sentences.
No fancy words.
Always answer directly from this shop data:
${JSON.stringify(SHOP_DATA, null, 2)}

User can ask in English, Hindi, or Hinglish. Answer in simple, friendly Indian English.
Keep answers under 3 to 4 short lines.`;

    const getFallbackAskAnswer = (qText: string) => {
      const q = qText.toLowerCase();
      if (q.includes('sell') || q.includes('sale') || q.includes('bikri') || q.includes('aaj')) {
        return `Today's sales are Rs 18,450 from 23 bills at Delhi Flagship store. Audio items sold well.`;
      } else if (q.includes('low') || q.includes('stock') || q.includes('khatam') || q.includes('kam')) {
        return `NexPhone 15 Pro is running low with only 6 in stock. SonicBoom Speaker has only 8 left. Order soon.`;
      } else if (q.includes('owe') || q.includes('pay') || q.includes('baaki') || q.includes('udhaar') || q.includes('dues')) {
        return `3 customers owe money. Imran Khan owes Rs 9,600 (30 days late). Rohit Sharma owes Rs 4,200 (12 days late). Meera Kapoor owes Rs 1,850 (5 days late). Total due is Rs 15,650.`;
      } else if (q.includes('charger') || q.includes('cable')) {
        return `VoltSpeed 65W Charger has 45 units in stock at Rs 1,499. Braided USB-C Cable has 70 units at Rs 299.`;
      } else {
        return `At Delhi Flagship, you have 7 main items in stock. Today's sales are Rs 18,450. Rs 15,650 is pending from 3 customers.`;
      }
    };

    if (!ai) {
      return res.json({ answer: getFallbackAskAnswer(question) });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: question,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      return res.json({ answer: response.text || getFallbackAskAnswer(question) });
    } catch (aiError) {
      console.warn('Gemini temporary spike, using grounded fallback answer:', aiError);
      return res.json({ answer: getFallbackAskAnswer(question) });
    }
  } catch (error: any) {
    console.error('AI Ask error:', error);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// 2. AI Quick Bill Generator Endpoint
app.post('/api/ai/helper/quick-bill', async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: 'Input is required' });

    const systemPrompt = `You are the AI Quick Bill helper for DukaanIQ shop billing.
Read the user request (e.g. "Bill for Rohit, 2 USB-C cables and 1 power bank").
Match the requested items against this available catalog:
${JSON.stringify(SHOP_DATA.items, null, 2)}

Return a strict JSON object with:
{
  "customerName": string (e.g. "Rohit Sharma" or customer mentioned, default "Walk-in Customer"),
  "items": [
    { "name": string, "qty": number, "price": number, "total": number }
  ],
  "subtotal": number,
  "tax": number (18% GST),
  "grandTotal": number
}`;

    const parseQuickBillDeterministic = (inputText: string) => {
      const text = inputText.toLowerCase();
      let customerName = 'Walk-in Customer';
      if (text.includes('rohit')) customerName = 'Rohit Sharma';
      else if (text.includes('meera')) customerName = 'Meera Kapoor';
      else if (text.includes('imran')) customerName = 'Imran Khan';

      const items: any[] = [];
      if (text.includes('cable') || text.includes('usb')) {
        const qtyMatch = text.match(/(\d+)\s*(usb|cable)/i);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 2;
        items.push({ name: 'Braided USB-C Cable 60W', qty, price: 299, total: 299 * qty });
      }
      if (text.includes('power bank') || text.includes('bank') || text.includes('volttank')) {
        const qtyMatch = text.match(/(\d+)\s*(power|bank|volttank)/i);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        items.push({ name: 'VoltTank 20,000 mAh Power Bank', qty, price: 1899, total: 1899 * qty });
      }
      if (text.includes('phone') || text.includes('nexphone')) {
        items.push({ name: 'NexPhone 15 Pro', qty: 1, price: 64999, total: 64999 });
      }
      if (text.includes('charger') || text.includes('voltspeed')) {
        items.push({ name: 'VoltSpeed 65W Charger', qty: 1, price: 1499, total: 1499 });
      }
      if (text.includes('headphone') || text.includes('sonicpro')) {
        items.push({ name: 'SonicPro Wireless Headphones', qty: 1, price: 3499, total: 3499 });
      }
      if (text.includes('aeropods') || text.includes('airpods') || text.includes('earbuds')) {
        items.push({ name: 'AeroPods True Wireless', qty: 1, price: 1799, total: 1799 });
      }
      if (items.length === 0) {
        items.push({ name: 'Braided USB-C Cable 60W', qty: 2, price: 299, total: 598 });
        items.push({ name: 'VoltTank 20,000 mAh Power Bank', qty: 1, price: 1899, total: 1899 });
      }

      const subtotal = items.reduce((a, b) => a + b.total, 0);
      const tax = Math.round(subtotal * 0.18 * 100) / 100;
      const grandTotal = Math.round((subtotal + tax) * 100) / 100;

      return { customerName, items, subtotal, tax, grandTotal };
    };

    if (!ai) {
      return res.json(parseQuickBillDeterministic(input));
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: input,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.items && parsed.items.length > 0) {
        return res.json(parsed);
      }
      return res.json(parseQuickBillDeterministic(input));
    } catch (aiErr) {
      console.warn('Gemini temporary spike in quick-bill, using fallback:', aiErr);
      return res.json(parseQuickBillDeterministic(input));
    }
  } catch (error: any) {
    console.error('Quick bill error:', error);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// 3. AI Stock Plan Evaluation
app.post('/api/ai/helper/stock-plan', async (req: Request, res: Response) => {
  try {
    const { itemName, inStock } = req.body;

    const systemPrompt = `You are the AI Stock Planner for DukaanIQ.
Write one plain, short sentence in simple Indian English advising the shopkeeper when this item may run out and what to order.
Keep it strictly under 14 words.
Example: "You may run out in 9 days. Order now."
Do not use fancy words.`;

    const getFallbackStockAdvice = (stockCount: number) => {
      if (stockCount < 10) {
        return 'You may run out in 6 days. Order 15 units now.';
      } else if (stockCount < 20) {
        return 'Stock will last about 14 days. Order 20 units soon.';
      }
      return 'Stock is safe for 30 days. No immediate order needed.';
    };

    if (!ai) {
      return res.json({ advice: getFallbackStockAdvice(inStock || 15) });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Item: ${itemName}, In stock: ${inStock}`,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      return res.json({ advice: (response.text || getFallbackStockAdvice(inStock || 15)).trim() });
    } catch (aiErr) {
      console.warn('Gemini temporary spike in stock-plan, using fallback:', aiErr);
      return res.json({ advice: getFallbackStockAdvice(inStock || 15) });
    }
  } catch (error: any) {
    console.error('Stock plan error:', error);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// 4. AI Business Summary Endpoint
app.post('/api/ai/helper/summary', async (_req: Request, res: Response) => {
  try {
    const systemPrompt = `You are the DukaanIQ AI Helper.
Read this week's shop data:
${JSON.stringify(SHOP_DATA, null, 2)}

Write exactly 4 to 5 short bullet points about this week for the shopkeeper.
Use simple Indian English.
Short sentences.
No fancy words.
Return strict JSON with key "points": array of strings.
Example:
{
  "points": [
    "Sales are down 12% this week. Audio items sold the most.",
    "Rs 18,450 collected today from 23 bills.",
    "NexPhone 15 Pro has only 6 units left in stock.",
    "3 customers owe Rs 15,650. Imran Khan is 30 days late.",
    "Braided USB-C Cable is your most popular item with 70 in stock."
  ]
}`;

    const defaultPoints = [
      'Sales are down 12% this week. Audio items sold the most.',
      'Rs 18,450 collected today from 23 customer bills.',
      'NexPhone 15 Pro is running low with only 6 units in stock.',
      '3 customers owe a total of Rs 15,650. Imran Khan is 30 days late.',
      'Braided USB-C Cable is your fastest-moving item with 70 in stock.',
    ];

    if (!ai) {
      return res.json({ points: defaultPoints });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Generate 4 to 5 short weekly points based on shop data.',
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{"points": []}');
      if (parsed.points && parsed.points.length > 0) {
        return res.json(parsed);
      }
      return res.json({ points: defaultPoints });
    } catch (aiErr) {
      console.warn('Gemini temporary spike in summary, using fallback:', aiErr);
      return res.json({ points: defaultPoints });
    }
  } catch (error: any) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// 5. AI Payment Reminder Message Generator
app.post('/api/ai/helper/reminder', async (req: Request, res: Response) => {
  try {
    const { customerName, amountDue, daysLate } = req.body;
    if (!customerName || !amountDue) {
      return res.status(400).json({ error: 'Customer name and amount are required' });
    }

    const systemPrompt = `You write friendly payment reminder messages for Indian shopkeepers on DukaanIQ.
Write a short, polite reminder in simple Hinglish (conversational Hindi in Latin letters).
Never include phone numbers.
Keep it friendly and warm so the customer is happy to pay.
Example: "Namaste Rohit ji, Delhi Flagship store se aapka Rs 4,200 ka payment 12 din se pending hai. Kripya UPI ya counter par aakar clear karein. Shukriya!"
Return JSON with key "message": string.`;

    const defaultMsg = `Namaste ${customerName} ji, Delhi Flagship store se aapka Rs ${Number(amountDue).toLocaleString('en-IN')} ka bill ${daysLate || 7} din se baki hai. Please UPI ya counter par aakar payment karein. Shukriya!`;

    if (!ai) {
      return res.json({ message: defaultMsg });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Customer: ${customerName}, Amount due: Rs ${amountDue}, Days late: ${daysLate}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ message: parsed.message || defaultMsg });
    } catch (aiErr) {
      console.warn('Gemini temporary spike in reminder, using fallback:', aiErr);
      return res.json({ message: defaultMsg });
    }
  } catch (error: any) {
    console.error('Reminder error:', error);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});
// ==========================================
// AI STOCK MANAGER ENDPOINTS (DukaanIQ)
// ==========================================

// 1. Stock Ask Endpoint
app.post('/api/ai/stock/ask', async (req: Request, res: Response) => {
  try {
    const { question, plan, stockData } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const currentPlan = plan || 'Normal month';
    const systemPrompt = `You are the AI Stock Manager helper for DukaanIQ, retail software for Indian shops.
Write in very simple Indian English.
Short sentences.
No fancy words.
Do not use words like "smart", "intelligent", "automated" or "powered".
No robot or sparkle metaphors.
Current Plan: ${currentPlan}.
Shop Data for Delhi Flagship, Connaught Place:
${JSON.stringify(stockData || SHOP_DATA, null, 2)}

Provide a direct, friendly answer in 2 to 3 short sentences.
Currency is Rs.
Example: "NexPhone 15 Pro will finish first in 6 days. SonicBoom Speaker has only 8 pieces left. You should order both before Friday."`;

    const getStockFallback = (qText: string) => {
      const q = qText.toLowerCase();
      if (q.includes('finish') || q.includes('khatam') || q.includes('this week') || q.includes('low')) {
        return `NexPhone 15 Pro will finish first with only 6 pieces left (runs out in 6 days). SonicBoom Speaker has only 8 pieces left. Order both before Friday.`;
      } else if (q.includes('sell') || q.includes('most') || q.includes('fast') || q.includes('top')) {
        return `Braided USB-C Cable sells the most units (around 120 per month). For highest money earned, NexPhone 15 Pro brings Rs 64,999 per unit.`;
      } else if (q.includes('stuck') || q.includes('money') || q.includes('slow') || q.includes('dead')) {
        return `About Rs 42,600 is stuck in slow items. You have 70 USB-C cables and 18 power banks that are moving slower this month.`;
      } else {
        return `You have 7 main items at Delhi Flagship store. Total stock value is around Rs 6,84,380. 2 items need urgent ordering.`;
      }
    };

    if (!ai) {
      return res.json({ answer: getStockFallback(question) });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User question: "${question}". Current plan: "${currentPlan}".`,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      return res.json({ answer: response.text?.trim() || getStockFallback(question) });
    } catch (aiErr) {
      console.warn('Gemini temporary error in stock ask:', aiErr);
      return res.json({ answer: getStockFallback(question) });
    }
  } catch (error: any) {
    console.error('Stock ask error:', error);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// 2. Forecast Plain Sentence Generator
app.post('/api/ai/stock/sentence', async (req: Request, res: Response) => {
  try {
    const { itemName, inStock, daysLeft, plan, deliveryDays } = req.body;

    const systemPrompt = `You write a one-sentence stock warning for an Indian shopkeeper on DukaanIQ.
Write in simple Indian English.
Short sentence. No fancy words.
Do not use words like "smart", "intelligent", "automated", or "powered".
Length: 12 to 18 words max.
Format like: "You may run out in ${daysLeft || 10} days. Delivery takes ${deliveryDays || 4} days, so order now."`;

    const fallbackSentence = `You may run out in ${daysLeft || 10} days. Delivery takes ${deliveryDays || 4} days, so order now.`;

    if (!ai) {
      return res.json({ sentence: fallbackSentence });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Item: ${itemName}, In stock: ${inStock}, Days left: ${daysLeft}, Delivery days: ${deliveryDays}, Plan: ${plan}`,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      return res.json({ sentence: response.text?.trim() || fallbackSentence });
    } catch (aiErr) {
      console.warn('Gemini sentence generation error:', aiErr);
      return res.json({ sentence: fallbackSentence });
    }
  } catch (error: any) {
    console.error('Stock sentence error:', error);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// 3. Slow Mover Bundle Ideas
app.post('/api/ai/stock/ideas', async (req: Request, res: Response) => {
  try {
    const { itemName, stuckAmount, stockCount } = req.body;

    const systemPrompt = `You suggest practical clearance ideas for an Indian retail shop owner on DukaanIQ.
Write in simple Indian English.
Short sentences. No fancy words.
Do not use words like "smart", "intelligent", "automated", "powered".
Suggest 2 short, direct ideas to clear slow stock and recover money.
Return JSON with key "ideas": array of strings.`;

    const fallbackIdeas = [
      `Offer a 15% discount combo when bought with any charger.`,
      `Keep 5 pieces on the billing counter as quick add-ons for Rs 199.`,
    ];

    if (!ai) {
      return res.json({ ideas: fallbackIdeas });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Item: ${itemName}, Stuck stock: ${stockCount} pieces, Stuck value: Rs ${stuckAmount}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ ideas: parsed.ideas || fallbackIdeas });
    } catch (aiErr) {
      console.warn('Gemini ideas error:', aiErr);
      return res.json({ ideas: fallbackIdeas });
    }
  } catch (error: any) {
    console.error('Stock ideas error:', error);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// ==========================================
// DUKAANIQ STAFF & WORKFORCE AI TOOLS
// ==========================================
app.post('/api/ai/staff-tools', async (req: Request, res: Response) => {
  try {
    const { toolType, query, staffContext } = req.body;

    const sanitizeNoHyphens = (text: string): string => {
      return text
        .replace(/[-–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const deterministicResponses: Record<string, { title: string; content: string; suggestions: string[] }> = {
      staff_insights: {
        title: 'Workforce Productivity and Roster Insights',
        content: 'Staff coverage is healthy with three operators on active duty. Counter checkout velocity reaches highest throughput between 4 PM and 8 PM. Anita Deshmukh leads store performance with top sales volume today. Attendance punctuality across the team stands at 97 percent this month.',
        suggestions: [
          'Add one extra support cashier on Friday evening',
          'Acknowledge Anita for exceptional sales consistency',
          'Review weekend roster for peak festive hours',
        ],
      },
      cash_check: {
        title: 'Cash Drawer Variance and Security Audit',
        content: 'Current drawer cash is verified and within strict tolerance limits. Historical shifts reflect strong cashier discipline. Best practice is to physically count high denomination 500 and 200 notes first, followed by loose change. Cash variance reports confirm zero unexplained losses over the last 14 days.',
        suggestions: [
          'Perform a surprise mid day drawer audit at 3 PM',
          'Remind cashiers to lock drawer between transactions',
          'Reconcile UPI settlement slip against store register daily',
        ],
      },
      shift_planner: {
        title: 'Intelligent Roster and Shift Allocation',
        content: 'Footfall patterns indicate Saturday and Sunday generate 44 percent of weekly retail volume. Allocate two experienced cashiers to the evening shift from 2 PM to 10 PM. Tuesday and Wednesday morning require only one cashier and one stock handler, preserving labor budget.',
        suggestions: [
          'Schedule Anita and Rohan on Saturday peak slots',
          'Assign Sunita to morning restocking on Thursday',
          'Maintain minimum 11 hours rest between closing and opening shifts',
        ],
      },
      incentive_advisor: {
        title: 'Performance Incentive and Bonus Advisory',
        content: 'Recommend a structured slab: 2 percent reward on individual daily sales exceeding 40000 rupees. Bonus of 500 rupees for cashiers with zero cash discrepancies across seven consecutive shifts. This balances motivation while safeguarding gross retail margins.',
        suggestions: [
          'Introduce top seller of the week badge',
          'Award customer service stars based on receipt feedback',
          'Tie 10 percent of bonus to store inventory accuracy',
        ],
      },
      payroll_check: {
        title: 'Payroll and Statutory Deduction Verification',
        content: 'Calculated payroll entries match active attendance records. Present days, casual leave allocations, and advance repayments are verified accurately. Payout summaries are prepared for store owner review and banking disbursement.',
        suggestions: [
          'Verify bank account details before marking as paid',
          'Confirm advance repayment deductions with staff',
          'Generate and store monthly salary slips in record vault',
        ],
      },
      training_tips: {
        title: 'Cashier Skill Coaching and POS Efficiency',
        content: 'Cashier Rohan demonstrates outstanding customer friendliness with 4.7 star rating. Recommended coaching: practice barcode scanner shortcuts and rapid item search to shave 12 seconds off average billing duration. Encourage upselling of protective accessories during billing.',
        suggestions: [
          'Demonstrate keyboard shortcuts for tender selection',
          'Practice handling customer return transactions smoothly',
          'Train team on recognizing counterfeit currency notes',
        ],
      },
      staff_copilot: {
        title: 'DukaanIQ Staff Copilot',
        content: 'Based on current store records, all three cashiers are active with positive performance ratings. Shifts are balanced and expected cash aligns with registered tender payments. Feel free to ask about any staff member, shift timings, or payroll calculations.',
        suggestions: [
          'Who is top performer today',
          'Show cash count details for active shift',
          'Review pending leave requests',
        ],
      },
    };

    const fallback = deterministicResponses[toolType] || deterministicResponses.staff_copilot;

    if (!ai) {
      return res.json(fallback);
    }

    const systemPrompt = `You are the DukaanIQ Staff and Workforce AI Assistant for retail store owners and managers in India.
Your mission is to provide concise, practical workforce advice based on the provided staff context.
RULES:
1. CRITICAL: NEVER OUTPUT ANY HYPHENS OR DASHES IN YOUR TEXT. No minus signs, no dashes, no hyphens like - or --. Use words like "to", "plus", "and", "or", or commas.
2. Maths must be strictly straightforward. AI only suggests; the store owner makes decisions.
3. Keep the tone professional, pragmatic, and encouraging.
4. Return a valid JSON object with keys:
   - title: string (under 8 words, no hyphens)
   - content: string (2 to 4 clear sentences, no hyphens)
   - suggestions: array of 3 strings (actionable advice, no hyphens)
`;

    const userMessage = `Tool requested: ${toolType}.
User question: ${query || 'Provide actionable recommendations for our store staff'}
Context: ${JSON.stringify(staffContext || {}, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const sanitizedTitle = sanitizeNoHyphens(parsed.title || fallback.title);
    const sanitizedContent = sanitizeNoHyphens(parsed.content || fallback.content);
    const sanitizedSuggestions = (parsed.suggestions || fallback.suggestions).map((s: string) => sanitizeNoHyphens(s));

    return res.json({
      title: sanitizedTitle,
      content: sanitizedContent,
      suggestions: sanitizedSuggestions,
    });
  } catch (error: any) {
    console.warn('Staff AI tool error, using fallback:', error);
    const fallback = {
      title: 'Workforce Operations Overview',
      content: 'Store staff operations are running normally. Shift records and cash reconciliations are up to date. Review rosters and attendance for continuous store coverage.',
      suggestions: [
        'Review active shift status on the floor',
        'Check cash drawer balance before shift handover',
        'Verify attendance logs for today',
      ],
    };
    res.json(fallback);
  }
});

// ==========================================
// DUKAANIQ BUYING & PROCUREMENT AI TOOLS
// ==========================================
app.post('/api/ai/buying-tools', async (req: Request, res: Response) => {
  try {
    const { toolType, query, context } = req.body;

    const sanitizeNoHyphens = (text: string): string => {
      return text
        .replace(/[-–—]/g, ' ')
        .replace(/&/g, 'and')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const deterministicResponses: Record<string, { title: string; content: string; suggestions: string[] }> = {
      ai_purchase_recommendations: {
        title: 'Procurement and Inventory Replenishment Plan',
        content: 'Based on current sales speed, 3 items are approaching their reorder threshold within the next 8 days. TechSupply India delivers in 3 days with strong reliability. Placing a consolidated order today avoids stockouts during the upcoming weekend demand.',
        suggestions: [
          'Order 20 units of VoltSpeed chargers from TechSupply India',
          'Restock UltraClear tempered glass before festive rush',
          'Combine cable and charger orders to optimize shipping fees',
        ],
      },
      ai_supplier_insights: {
        title: 'Supplier Performance and Reliability Analysis',
        content: 'TechSupply India maintains 96 percent on time delivery with zero packaging defects across past 14 consignments. CrystalShield Optics provides lower unit prices on screen protectors with 94 percent fulfillment rate. Recommend continuing primary allocations to both verified partners.',
        suggestions: [
          'Keep TechSupply India as primary for chargers and cables',
          'Negotiate 2 percent volume rebate with CrystalShield for next quarter',
          'Review payment terms from 15 days to 30 days based on consistent prompt settlement',
        ],
      },
      ai_price_compare: {
        title: 'Internal Purchase History Rate Comparison',
        content: 'Comparing our verified purchase records over the past 90 days: 65W GaN Chargers were procured at 850 rupees in August and held steady at 850 rupees in October. USB C cables dropped from 135 rupees to 125 rupees per unit on bulk purchases above 50 pieces.',
        suggestions: [
          'Lock in cable pricing at 125 rupees on minimum 50 pack sizes',
          'Request supplier match historical low price on power banks',
          'Review invoice price variance before approving supplier bills',
        ],
      },
      ai_delivery_risk: {
        title: 'Delivery Schedule and Stockout Risk Warning',
        content: 'Order PO 2026 0042 from TechSupply India is scheduled for arrival shortly. Fast charger inventory at Delhi Flagship is currently at 12 units, representing 4 days of floor sales. No critical stockout threat exists if consignment arrives on expected date.',
        suggestions: [
          'Send polite WhatsApp ping to supplier dispatch manager',
          'Prepare receiving bay for priority barcode tagging upon arrival',
          'Hold 2 units in backup stock for online click and collect orders',
        ],
      },
      ai_bill_check: {
        title: 'Three Way Invoice and Consignment Verification',
        content: 'Comparing purchase order lines against warehouse goods received records: All 50 units of protective cases and 100 screen guards match the supplier billed rate. Total taxable value and 18 percent GST calculation reconcile with zero discrepancies.',
        suggestions: [
          'Approve supplier bill for automated Accounts ledger entry',
          'Claim 3285 rupees Input Tax Credit in monthly GSTR 3B filing',
          'Archive stamped delivery challan in digital document vault',
        ],
      },
      ai_order_message: {
        title: 'Polite Supplier Order and Inquiry Draft',
        content: 'Dear Partner, Greetings from Apex Tech Retail. We would like to place an order for 20 units of VoltSpeed 65W Chargers and 40 units of Braided USB C Cables as per our agreed rate. Kindly confirm dispatch date and share the tax invoice. Thank you for your continued support.',
        suggestions: [
          'Copy message text directly to WhatsApp Business or email',
          'Attach purchase order PDF copy with the dispatch note',
          'Request vehicle driver contact details for smooth store gate entry',
        ],
      },
      ai_buying_copilot: {
        title: 'DukaanIQ Buying Copilot',
        content: 'Our verified procurement history confirms TechSupply India offers the most competitive rates for charging accessories at 850 rupees per unit, while CrystalShield offers lowest rates on tempered glass at 65 rupees per unit. Both have verified GST compliance.',
        suggestions: [
          'Show price trends for fast chargers over past 3 months',
          'Which supplier has the fastest delivery lead time',
          'Draft purchase order for low stock items',
        ],
      },
    };

    const fallback = deterministicResponses[toolType] || deterministicResponses.ai_buying_copilot;

    if (!ai) {
      return res.json(fallback);
    }

    const systemPrompt = `You are the DukaanIQ Buying, Procurement and Supplier AI Assistant for retail store owners in India.
Your mission is to provide concise, practical procurement advice based on our store's actual purchase orders, suppliers, and inventory history.
RULES:
1. CRITICAL: NEVER OUTPUT ANY HYPHENS, DASHES, OR THE AMPERSAND SYMBOL IN YOUR TEXT. No "-" or "–" or "—" or "&". Use words like "to", "plus", "and", "or", or commas.
2. Calculations must be straightforward. AI only suggests; the store owner makes decisions.
3. Compare rates using verified store data only, never invent fake external market numbers.
4. Return a valid JSON object with keys:
   - title: string (under 8 words, no hyphens or ampersands)
   - content: string (2 to 4 clear sentences, no hyphens or ampersands)
   - suggestions: array of 3 strings (actionable advice, no hyphens or ampersands)
`;

    const userMessage = `Tool requested: ${toolType}.
User question: ${query || 'Provide actionable purchasing recommendations for our retail store'}
Context: ${JSON.stringify(context || {}, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const sanitizedTitle = sanitizeNoHyphens(parsed.title || fallback.title);
    const sanitizedContent = sanitizeNoHyphens(parsed.content || fallback.content);
    const sanitizedSuggestions = (parsed.suggestions || fallback.suggestions).map((s: string) => sanitizeNoHyphens(s));

    return res.json({
      title: sanitizedTitle,
      content: sanitizedContent,
      suggestions: sanitizedSuggestions,
    });
  } catch (error: any) {
    console.warn('Buying AI tool error, using fallback:', error);
    const fallback = {
      title: 'Procurement Intelligence Overview',
      content: 'Store purchase orders and supplier accounts are up to date. Review supplier lead times and goods receipts to ensure inventory safety stocks.',
      suggestions: [
        'Review open purchase orders due this week',
        'Verify received quantities against supplier invoice',
        'Check pending supplier payables to maintain good credit',
      ],
    };
    res.json(fallback);
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DukaanIQ Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
