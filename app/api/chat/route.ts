import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

const genAI = new GoogleGenerativeAI("AIzaSyAx34o31vs5bNBpR8BbftYHU-hC4jqOOJQ");  // API key included
const historyFile = path.join(process.cwd(), "chat_history.json");

async function saveChatHistory(prompt: string, response: string, age?: string) {
  let history = [];
  try {
    const data = await fs.readFile(historyFile, "utf-8");
    history = JSON.parse(data);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.error("Error reading chat history file:", e);
    }
    history = [];
  }
  history.push({ prompt, response, age, timestamp: new Date().toISOString() });
  await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = "AIzaSyAx34o31vs5bNBpR8BbftYHU-hC4jqOOJQ";
    const { userPrompt, age } = await req.json();
    if (!userPrompt?.trim()) {
      return NextResponse.json({ error: "**Input Required for Consultation**" }, { status: 400 });
    }

    let genAI;
    try {
      genAI = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error("Error initializing Google AI:", error);
      return NextResponse.json({ error: "Failed to initialize AI service" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
        topP: 0.9,
        topK: 40,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    });

    const fullPrompt = `
**Professional Consultation Protocol:**
• Provide concise, actionable insights in clear, bulleted format
• For mental health: Include symptoms, causes, coping strategies, and specific medication names (e.g., Sertraline for depression)
• For physical health: Suggest specific, widely available medication names (e.g., Ibuprofen for pain) tailored to the condition and age (if provided: ${age || "not specified"})
• Use bold text for critical information (e.g., **DO THIS NOW**)

**Response Format Requirements:**
1. **Key Symptoms**: List observable signs
2. **Potential Causes**: Identify likely triggers or conditions
3. **Immediate Coping Strategies**: Practical steps to manage the issue now
4. **Recommended Interventions**: Specific medication names and product names (e.g., Acetaminophen, Fluoxetine) with age-adjusted notes if applicable, plus therapies
5. **Suggested Consultation/Referral**: Next steps with professionals

**Detailed Analysis Prompt:**
Analyze the following health/mental health concern with maximum precision:
"${userPrompt}"
${age ? `User age: ${age}. Tailor medication suggestions accordingly (e.g., pediatric doses or adult formulations).` : "Age not provided; use general adult recommendations."}

**Additional Guidelines:**
- Be direct, evidence-based, and solution-focused
- Provide specific product/medicine names relevant to the condition (e.g., "Paracetamol" for fever, "Lorazepam" for anxiety)
- Emphasize that medications require a doctor's prescription and approval
- Prioritize user's immediate well-being
    `.trim();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 15000);
    });

    const responsePromise = model.generateContent(fullPrompt);
    const result = await Promise.race([responsePromise, timeoutPromise]);

    if (!result || typeof result === 'string') {
      throw new Error("Invalid response from AI service");
    }

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: "Empty response received" }, { status: 500 });
    }

    await saveChatHistory(userPrompt, text, age);

    return NextResponse.json({
      text: `**Consultation Insights:**\n\n${text}\n\n**DISCLAIMER: This is AI-generated advice. Medications listed (e.g., Ibuprofen, Sertraline) are examples only and MUST be prescribed and approved by a healthcare professional. Consult your doctor before use.**`,
      status: "success",
    }, { status: 200 });
  } catch (error) {
    console.error("Health Consultation Error:", error);
    const errorResponse = {
      404: { message: "**Service Temporarily Unavailable**", details: "Unable to process health consultation" },
      429: { message: "**Consultation Overload**", details: "Too many requests. Please try again later." },
      default: { message: "**Consultation Processing Error**", details: "Unable to generate health insights" },
    };
    const statusCode = error.status || 500;
    const errorInfo = errorResponse[statusCode] || errorResponse.default;
    return NextResponse.json({ error: errorInfo.message, details: errorInfo.details }, { status: statusCode });
  }
}

export async function GET() {
  try {
    const data = await fs.readFile(historyFile, "utf-8");
    const history = JSON.parse(data);
    return NextResponse.json({ history }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ history: [] }, { status: 200 });
  }
}
