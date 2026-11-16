import { GoogleGenAI, Type } from '@google/genai';
import type {
  Cow,
  FarmInsightsResponse,
  FarmOverviewStats,
  Language,
  Product,
} from '../src/types/index.ts';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export async function generateShopAssistantReply(params: {
  message: string;
  history: ChatTurn[];
  language: Language;
  products: Product[];
  cows: Cow[];
}): Promise<string> {
  const ai = getGeminiClient();

  const catalogLines = params.products
    .map((p) => {
      const stockLabel =
        p.stock === 0
          ? 'Sold out'
          : p.stock <= p.lowStockThreshold
          ? `Low stock (${p.stock} left)`
          : `In stock (${p.stock} available)`;
      return `- ${p.name} (${p.unit}) | Category: ${p.category} | Price: KES ${p.priceKes.toLocaleString('en-KE')} | ${stockLabel} | Nutrition: ${p.nutritionHighlight}`;
    })
    .join('\n');

  const herdSummary = params.cows
    .map((c) => `${c.name} (${c.breed}, ${c.status}, ~${c.dailyLitresAvg} L/day)`)
    .join('; ');

  const langNote =
    params.language === 'sw'
      ? 'Respond primarily in natural, warm Kenyan Swahili (unless the customer writes in English, in which case match their language).'
      : 'Respond in clear, warm English (if the customer writes in Swahili, match their language).';

  const systemInstruction = `You are the helpful farm & shop assistant for CHEGOLAND Agri-Empire LTD Dairy Farm and Shop, a pasture-raised dairy farm based in Kapcholyo, Kaplong in Sotik Constituency, Bomet County, Kenya, delivering fresh milk and farm produce across Kaplong, Sotik, Bomet, Litein, Kericho, Nakuru, and Nairobi.

${langNote}

STRICT RULES:
- Always format prices strictly as "KES 1,200" (e.g. KES 120, KES 650).
- Only cite products, prices, and stock counts listed in the live catalog below.
- Delivery details: Morning dispatch leaves the farm in Kapcholyo, Kaplong at 5:30 AM. Delivery is KES 150 flat across Kaplong, Sotik, Bomet, Litein, Kericho, Nakuru & Nairobi (Kilimani, Westlands, Karen), and FREE for orders of KES 2,000 or more.
- Payment options: M-Pesa (STK Push) and Cash on Delivery.
- Keep answers concise, accurate, friendly, and grounded in dairy nutrition and Kenyan kitchen usage (tea/chai, ugali + mala, cooking with ghee).

LIVE PRODUCT CATALOG:
${catalogLines}

OUR HERD:
${herdSummary}`;

  const recentHistory = params.history.slice(-8).map((turn) => ({
    role: turn.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: turn.text }],
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: [
      ...recentHistory,
      { role: 'user', parts: [{ text: params.message }] },
    ],
    config: {
      systemInstruction,
    },
  });

  return (
    response.text?.trim() ||
    'Karibu Chegoland! How can I help you with our fresh milk, mala, ghee, or delivery schedule today?'
  );
}

export async function generateFarmInsights(params: {
  stats: FarmOverviewStats;
  products: Product[];
  cows: Cow[];
}): Promise<FarmInsightsResponse> {
  const ai = getGeminiClient();

  const total30dLitres = params.stats.chart30Days.reduce((s, d) => s + d.milkLitres, 0);
  const total30dSales = params.stats.chart30Days.reduce((s, d) => s + d.salesKes, 0);
  const last7 = params.stats.chart30Days.slice(-7);
  const prev7 = params.stats.chart30Days.slice(-14, -7);

  const last7Litres = last7.reduce((s, d) => s + d.milkLitres, 0);
  const prev7Litres = prev7.reduce((s, d) => s + d.milkLitres, 0);
  const last7Sales = last7.reduce((s, d) => s + d.salesKes, 0);
  const prev7Sales = prev7.reduce((s, d) => s + d.salesKes, 0);

  const lowStockProducts = params.products
    .filter((p) => p.stock <= p.lowStockThreshold)
    .map((p) => `${p.name} (${p.unit}): ${p.stock} left`);

  const promptData = {
    todayMilkLitres: Number(params.stats.todayMilkLitres.toFixed(1)),
    todaySalesKes: params.stats.todaySalesKes,
    pendingOrdersCount: params.stats.pendingOrdersCount,
    lactatingCowsCount: params.stats.lactatingCowsCount,
    totalCowsCount: params.stats.totalCowsCount,
    thirtyDayTotalLitres: Number(total30dLitres.toFixed(1)),
    thirtyDayTotalSalesKes: total30dSales,
    last7DaysLitres: Number(last7Litres.toFixed(1)),
    prev7DaysLitres: Number(prev7Litres.toFixed(1)),
    last7DaysSalesKes: last7Sales,
    prev7DaysSalesKes: prev7Sales,
    lowOrOutOfStockProducts: lowStockProducts,
    herdBreakdown: params.cows.map((c) => ({
      name: c.name,
      breed: c.breed,
      status: c.status,
      dailyLitresAvg: c.dailyLitresAvg,
    })),
    dailySeriesLast14Days: params.stats.chart30Days.slice(-14),
  };

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Analyze this Kenyan dairy farm's last 30 days of milk production and online shop sales data, then write a concise plain-language summary and exactly 3 practical, actionable suggestions for the farm owner.\n\nDATA:\n${JSON.stringify(
      promptData,
      null,
      2
    )}`,
    config: {
      systemInstruction:
        'You are a pragmatic Kenyan dairy agribusiness advisor. Always format Kenyan currency as "KES 1,200". Keep the summary plain-language, specific to the numbers provided, and give exactly 3 concrete, actionable suggestions covering herd yield, inventory/stock, and sales.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description:
              '2-3 sentence plain-language overview of 30-day milk output, sales performance, and current bottlenecks.',
          },
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: 'Short 3-6 word action headline.',
                },
                detail: {
                  type: Type.STRING,
                  description: '1-2 sentence concrete recommendation referencing actual numbers or items.',
                },
              },
              required: ['title', 'detail'],
            },
          },
        },
        required: ['summary', 'suggestions'],
      },
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as {
    summary?: string;
    suggestions?: Array<{ title: string; detail: string }>;
  };

  return {
    summary:
      parsed.summary ||
      'Milk production and direct sales remained steady over the past 30 days.',
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
    generatedAt: new Date().toISOString(),
  };
}
