// Configuration for Ollama API
// For local development: set NEXT_PUBLIC_OLLAMA_BASE_URL=http://localhost:11434
// For Ollama Cloud: set NEXT_PUBLIC_OLLAMA_BASE_URL=https://api.ollama.ai
// Also set NEXT_PUBLIC_OLLAMA_API_KEY for cloud authentication
/**
 * AI Service Configuration
 *
 * Options:
 * 1. Local Ollama (default for development):
 *    NEXT_PUBLIC_AI_PROVIDER=ollama
 *    NEXT_PUBLIC_OLLAMA_BASE_URL=http://localhost:11434
 *    NEXT_PUBLIC_OLLAMA_MODEL=llama3.2:latest
 *
 * 2. OpenAI API (recommended for production):
 *    NEXT_PUBLIC_AI_PROVIDER=openai
 *    NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
 *    NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini
 *
 * 3. Ollama-compatible cloud service:
 *    NEXT_PUBLIC_AI_PROVIDER=ollama
 *    NEXT_PUBLIC_OLLAMA_BASE_URL=https://your-ollama-cloud-url
 *    NEXT_PUBLIC_OLLAMA_API_KEY=your_api_key
 *    NEXT_PUBLIC_OLLAMA_MODEL=llama3.1
 */

const AI_PROVIDER = process.env.NEXT_PUBLIC_AI_PROVIDER || "ollama";
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
  educationInfo?: string; // summary of education facilities, may be empty
}

export async function generateAISummary({
  location,
  hazardData,
  incomeData,
  educationInfo,
}: GenerateSummaryParams): Promise<string> {
  if (AI_PROVIDER === "openai") {
    return generateOpenAISummary({ location, hazardData, incomeData, educationInfo });
  }

  // Default to Ollama
  return generateOllamaSummary({ location, hazardData, incomeData, educationInfo });
}

async function generateOpenAISummary({
  location,
  hazardData,
  incomeData,
  educationInfo,
}: GenerateSummaryParams): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const model = process.env.NEXT_PUBLIC_OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    console.error("[OpenAI] API key not configured");
    return "AI summary currently unavailable. Please configure OpenAI API key.";
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

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error("[OpenAI] API error:", response.status, await response.text());
      return "AI summary currently unavailable. Please try again later.";
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "AI summary currently unavailable.";
  } catch (error) {
    console.error("[OpenAI] Request failed:", error);
    return "AI summary currently unavailable. Please try again later.";
  }
}

async function generateOllamaSummary({
  location,
  hazardData,
  incomeData,
  educationInfo,
}: GenerateSummaryParams): Promise<string> {
  const model = process.env.NEXT_PUBLIC_OLLAMA_MODEL || "llama3.2:latest";
  const apiKey = process.env.NEXT_PUBLIC_OLLAMA_API_KEY;

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

  const messages: OllamaMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add API key if configured (required for cloud services)
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (OLLAMA_BASE_URL.includes("api.ollama.ai")) {
      console.warn("[Ollama] API key not configured for Ollama Cloud");
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers,
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
