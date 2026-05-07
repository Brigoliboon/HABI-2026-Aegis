/**
 * OpenRouter AI Client Configuration
 *
 * OpenRouter provides unified access to multiple AI models.
 * For deployment: set NEXT_PUBLIC_OPENROUTER_API_KEY
 * For model selection: set NEXT_PUBLIC_OPENROUTER_MODEL (optional, defaults to gpt-4o-mini)
 *
 * Available models: https://openrouter.ai/models
 */

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterChatRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GenerateSummaryParams {
  location: string;
  hazardData: {
    faultDistance: number | null;
    floodDistance: number | null;
    landslideIntensity: number | null;
    volcanoCount: number;
    activeVolcanoes: Array<{ name: string; distanceKm: number; risk: number }>;
  };
  incomeData: {
    avgIncome: number;
    percentChange: number;
    incomeInequality: number;
    lowestDecile: number;
    highestDecile: number;
  } | null;
  educationInfo?: string;
}

export async function generateAISummary({
  location,
  hazardData,
  incomeData,
  educationInfo,
}: GenerateSummaryParams): Promise<string> {
  const model = process.env.NEXT_PUBLIC_OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (!OPENROUTER_API_KEY) {
    console.error("[OpenRouter] API key not configured");
    return "AI summary currently unavailable. Please configure OpenRouter API key.";
  }

  const hazardInfo = [
    hazardData.faultDistance !== null ? `Active Fault: ${(hazardData.faultDistance * 1000).toFixed(0)}m away` : null,
    hazardData.floodDistance !== null ? `Flood Zone: ${(hazardData.floodDistance * 1000).toFixed(0)}m away` : null,
    hazardData.landslideIntensity !== null ? `Landslide Risk: ${hazardData.landslideIntensity}% intensity` : null,
    hazardData.volcanoCount > 0 ? `Volcanoes within 50km: ${hazardData.volcanoCount}` : null,
  ].filter(Boolean).join(", ");

  const incomeInfo = incomeData
    ? `Average Income: ₱${incomeData.avgIncome.toLocaleString()}/month, Growth: ${incomeData.percentChange > 0 ? "+" : ""}${incomeData.percentChange.toFixed(1)}%, Inequality: ${incomeData.incomeInequality.toFixed(1)}×`
    : "Income data not available";

  const systemPrompt = `You are a helpful AI assistant for the AGEIS (Agricultural and Geospatial Information System) platform in the Philippines. Your role is to analyze hazard risks, economic conditions, and educational accessibility to provide concise, actionable insights for communities.

Interpret numerical data and translate it into clear, non-technical terms focused on:
1. Overall risk assessment in relation to education (e.g., "high risk to schooling due to frequent flooding")
2. Economic factors affecting education access (e.g., "income levels may limit families' ability to afford private schooling")
3. Educational facility accessibility (e.g., "distant schools may pose challenges for daily attendance")

Do not echo raw numbers or scores. Instead, provide clear statements about implications for education access and community resilience. Consider all provided data holistically to give balanced insights.

Format your response using markdown with the following structure:
## Summary
[2-3 sentence summary of the key points]

## Risk Factors
- [Bullet points about hazard risks affecting education]

## Economic Context
- [Bullet points about economic factors affecting education]

## Education Access
- [Bullet points about accessibility of educational institutions]

## Recommendations
- [2-3 priority recommendations for improving education access and community resilience]

Additional context on Philippine education:
- Elementary education is typically the nearest school
- Higher education refers to colleges/universities which may require travel
- Access to quality education affects long-term economic mobility`;

  const userPrompt = `Provide a concise AI summary for ${location}, with a focus on education access and community resilience. Format your response using markdown as specified in the system prompt.

Hazard Information: ${hazardInfo || "No significant hazard data"}
Economic Data: ${incomeInfo}
Education Facilities: ${educationInfo}

Please address:
1. How hazard risks might impact access to education (e.g., flooding disrupting school attendance)
2. Whether economic conditions support educational opportunities for residents
3. Accessibility of key educational institutions and any barriers to reaching them
4. Top 2-3 priority recommendations for improving education access and community resilience`;

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
        "X-Title": "AGEIS AI Assistant",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      } as OpenRouterChatRequest),
    });

    if (!response.ok) {
      console.error("[OpenRouter] API error:", response.status, await response.text());
      return "AI summary currently unavailable. Please try again later.";
    }

    const data: OpenRouterChatResponse = await response.json();
    return data.choices[0]?.message?.content || "AI summary currently unavailable.";
  } catch (error) {
    console.error("[OpenRouter] Request failed:", error);
    return "AI summary currently unavailable. Please try again later.";
  }
}