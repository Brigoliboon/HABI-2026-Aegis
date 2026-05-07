const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434";

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
}

export interface OllamaChatResponse {
  message: {
    role: "assistant";
    content: string;
  };
  done: boolean;
}

export interface GenerateSummaryParams {
  location: string;
  riskScore: number;
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
}

export async function generateAISummary({
  location,
  riskScore,
  hazardData,
  incomeData,
}: GenerateSummaryParams): Promise<string> {
  const model = process.env.NEXT_PUBLIC_OLLAMA_MODEL || "llama3.2:latest";

  const hazardInfo = [
    hazardData.faultDistance !== null ? `Active Fault: ${(hazardData.faultDistance * 1000).toFixed(0)}m away` : null,
    hazardData.floodDistance !== null ? `Flood Zone: ${(hazardData.floodDistance * 1000).toFixed(0)}m away` : null,
    hazardData.landslideIntensity !== null ? `Landslide Risk: ${hazardData.landslideIntensity}% intensity` : null,
    hazardData.volcanoCount > 0 ? `Volcanoes within 50km: ${hazardData.volcanoCount}` : null,
  ].filter(Boolean).join(", ");

  const incomeInfo = incomeData
    ? `Average Income: ₱${incomeData.avgIncome.toLocaleString()}/month, Growth: ${incomeData.percentChange > 0 ? "+" : ""}${incomeData.percentChange.toFixed(1)}%, Inequality: ${incomeData.incomeInequality.toFixed(1)}×`
    : "Income data not available";

  const systemPrompt = `You are a helpful AI assistant for the AGEIS (Agricultural and Geospatial Information System) platform in the Philippines. Analyze the supplied hazard and economic data, interpret any numerical values, and produce a concise, lay‑person‑friendly summary (2–3 sentences). Do not echo raw numbers; instead translate them into clear statements about risk level, economic conditions, and actionable advice. Also incorporate any education facility information provided.`;

  const userPrompt = `Provide a brief summary for ${location}.

Hazard Information: ${hazardInfo || "No significant hazard data"}

Economic Data: ${incomeInfo}

Education Facilities: ${"${educationInfo}"}

Focus on overall risk assessment, key economic indicators, and recommendations for residents or policymakers.`;

  const messages: OllamaMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      } as OllamaChatRequest),
    });

    if (!response.ok) {
      console.error("[Ollama] API error:", response.status, await response.text());
      return "AI summary currently unavailable. Please try again later.";
    }

    const data = (await response.json()) as OllamaChatResponse;
    return data.message.content;
  } catch (error) {
    console.error("[Ollama] Request failed:", error);
    return "AI summary currently unavailable. Please try again later.";
  }
}
