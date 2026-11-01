import { NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  context?: {
    user?: {
      name?: string;
      email?: string;
      coinsBalance?: number;
      pointsTotal?: number;
      streak?: number;
      rank?: number | null;
      organization?: string | null;
    };
    onboarding?: {
      completed?: boolean;
      answers?: Record<string, unknown>;
      baseline?: {
        totalKg?: number;
        transportKg?: number;
        foodKg?: number;
        homeEnergyKg?: number;
        wasteKg?: number;
        waterKg?: number;
      };
    };
    dailyTrack?: {
      date?: string;
      logged?: boolean;
      todayKg?: number;
      baselineTotalKg?: number;
      deltaKg?: number;
      reductionPct?: number;
      answers?: {
        trips?: Array<{ mode: string; km: number }>;
        vegMeals?: number;
        nonVegMeals?: number;
        veganMeals?: number;
        acHoursBucket?: string;
        bathChoice?: string;
        wasteActions?: string[];
      };
    };
    garden?: {
      biome?: string;
      characterSkin?: string;
      treesCount?: number;
      petsCount?: number;
    };
  };
}

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
  'gemini-3.8-flash',
];

function buildSystemInstruction(context?: ChatRequest['context']): string {
  const parts: string[] = [
    `You are EcoLife AI — an encouraging, friendly, and expert sustainability coach inside the EcoLife platform.`,
    `Your goal is to help the user reduce their carbon footprint, adopt sustainable habits, explain their environmental metrics, suggest ways to earn EcoCoins, advise on tree planting, and guide their eco journey.`,
    `You have direct access to the user's live profile, baseline lifestyle data from their 15 onboarding questions, today's daily tracking logs, and virtual garden status.`,
    `Always refer to their specific numbers and answers naturally whenever relevant, but don't just dump raw data unless asked.`,
    `Keep your tone supportive, uplifting, practical, and scientifically accurate. Format your responses with clean markdown (bold highlights, bullet points, concise paragraphs).`,
  ];

  if (context?.user) {
    const u = context.user;
    parts.push(
      `\n### USER PROFILE:\n` +
      `- Name: ${u.name || 'Friend'}\n` +
      `- Email: ${u.email || 'N/A'}\n` +
      `- EcoCoins Balance: ${u.coinsBalance ?? 0} coins (used in marketplace & garden)\n` +
      `- Lifetime Eco Points: ${u.pointsTotal ?? 0}\n` +
      `- Tracking Streak: ${u.streak ?? 0} days\n` +
      (u.rank ? `- Leaderboard Rank: #${u.rank}\n` : '') +
      (u.organization ? `- Organization: ${u.organization}\n` : '')
    );
  }

  if (context?.onboarding) {
    const ob = context.onboarding;
    const a = (ob.answers || {}) as Record<string, any>;
    parts.push(
      `\n### 15 BASELINE LIFESTYLE QUESTIONS & ANSWERS:\n` +
      `1. Household Size: ${a.householdSize ?? 'Not specified'} people\n` +
      `2. City & Region: ${a.city || 'Not specified'} (${a.regionCode || 'N/A'})\n` +
      `3. Cooling Usage: ${a.coolingUsage || 'Not specified'}\n` +
      `4. Diet Type: ${a.dietType || 'Not specified'} (e.g. vegan, vegetarian, non-veg)\n` +
      `5. Food Waste Level: ${a.foodWasteLevel || 'Not specified'}\n` +
      `6. Packaged Food Frequency: ${a.packagedFoodFreq || 'Not specified'}\n` +
      `7. Primary Commute Mode: ${a.primaryCommuteMode || 'Not specified'}\n` +
      `8. Commute Distance (one-way): ${a.commuteDistanceKm ? `${a.commuteDistanceKm} km` : 'Not specified'}\n` +
      `9. Vehicle Fuel Type: ${a.vehicleFuel || 'Not specified'}\n` +
      `10. Flights Per Year: ${a.flightsPerYear ?? 'Not specified'}\n` +
      `11. Monthly Electricity Consumption: ${a.electricityKwhMonth ? `${a.electricityKwhMonth} kWh` : 'Not specified'}\n` +
      `12. Electricity Bill: ${a.electricityBillInr ? `₹${a.electricityBillInr}` : 'Not specified'}\n` +
      `13. Cooking Fuel: ${a.cookingFuel || 'Not specified'}\n` +
      `14. Rooftop Solar: ${a.hasSolar ? 'Yes' : 'No'}\n` +
      `15. Water & Waste Habits: Water level ${a.waterUsageLevel || 'medium'}, Waste habit: ${a.wasteHabit || 'Not specified'}\n` +
      (ob.baseline?.totalKg ? `- Baseline Carbon Footprint: ${ob.baseline.totalKg.toFixed(1)} kg CO2/day (Transport: ${ob.baseline.transportKg?.toFixed(1) || 0} kg, Food: ${ob.baseline.foodKg?.toFixed(1) || 0} kg, Energy: ${ob.baseline.homeEnergyKg?.toFixed(1) || 0} kg, Waste: ${ob.baseline.wasteKg?.toFixed(1) || 0} kg, Water: ${ob.baseline.waterKg?.toFixed(1) || 0} kg)\n` : '')
    );
  }

  if (context?.dailyTrack) {
    const dt = context.dailyTrack;
    const da = dt.answers;
    parts.push(
      `\n### TODAY'S DAILY TRACKING & LOGS:\n` +
      `- Date: ${dt.date || 'Today'}\n` +
      `- Logged Today: ${dt.logged ? 'Yes' : 'Not yet logged'}\n` +
      (dt.todayKg !== undefined ? `- Today's Carbon Footprint: ${dt.todayKg.toFixed(2)} kg CO2 (Baseline: ${dt.baselineTotalKg?.toFixed(2) || 'N/A'} kg)\n` : '') +
      (dt.deltaKg !== undefined ? `- Carbon Delta: ${dt.deltaKg < 0 ? `${Math.abs(dt.deltaKg).toFixed(2)} kg saved!` : `+${dt.deltaKg.toFixed(2)} kg over baseline`}\n` : '') +
      (dt.reductionPct !== undefined ? `- Footprint Change: ${dt.reductionPct.toFixed(1)}%\n` : '') +
      (da ? (
        `- Daily Travel: ${da.trips && da.trips.length > 0 ? da.trips.map(t => `${t.mode} (${t.km} km)`).join(', ') : 'No trips logged'}\n` +
        `- Daily Meals: ${da.vegMeals ?? 0} veg, ${da.veganMeals ?? 0} vegan, ${da.nonVegMeals ?? 0} non-veg\n` +
        `- AC Usage: ${da.acHoursBucket ?? '0'} hours\n` +
        `- Bathing Choice: ${da.bathChoice ?? 'Not specified'}\n` +
        `- Waste Actions: ${da.wasteActions && da.wasteActions.length > 0 ? da.wasteActions.join(', ') : 'None'}\n`
      ) : '')
    );
  }

  if (context?.garden) {
    const g = context.garden;
    parts.push(
      `\n### VIRTUAL GARDEN:\n` +
      `- Garden Biome: ${g.biome || 'Meadow'}\n` +
      `- Character Skin: ${g.characterSkin || 'Gardener'}\n` +
      `- Trees Planted: ${g.treesCount ?? 0}\n` +
      `- Pets in Garden: ${g.petsCount ?? 0}\n`
    );
  }

  return parts.join('\n');
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as ChatRequest;
    const { messages = [], context } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'At least one message is required.' },
        { status: 400 }
      );
    }

    // Retain up to 5 previous turns (up to 10 previous messages) + latest user message
    // A turn is user + assistant. 5 previous turns = 10 previous messages.
    const trimmedMessages = messages.slice(-11);

    const contents = trimmedMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Ensure the conversation starts with a 'user' turn for Gemini API compliance
    while (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    if (contents.length === 0) {
      return NextResponse.json(
        { error: 'Valid user message is required.' },
        { status: 400 }
      );
    }

    const systemInstruction = buildSystemInstruction(context);

    let lastError: Error | null = null;
    let replyText = '';

    // Attempt generation with cheapest models in sequence
    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Gemini API returned status ${response.status}`);
        }

        const data = await response.json();
        replyText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          'I am sorry, but I could not generate a response. Please try again.';
        break; // Success!
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Chat] Model ${model} failed, trying next:`, err?.message);
      }
    }

    if (!replyText) {
      return NextResponse.json(
        { error: lastError?.message || 'Failed to generate response from AI models.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('[AI Chat] Route error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
