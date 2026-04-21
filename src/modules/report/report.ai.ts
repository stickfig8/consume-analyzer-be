import { GoogleGenAI } from "@google/genai";
import { env } from "../../configs/env.js";
import { classifyPrompt, insightPrompt } from "../../configs/prompts.js";
import type { Expense, InsightPayload } from "../../types/types.js";

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

// 마크다운 제거
function parseJsonResponse(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// AI 분류 요청
export async function requestClassification(expenses: Expense[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              classifyPrompt + "\n\n분석 데이터:\n" + JSON.stringify(expenses),
          },
        ],
      },
    ],
  });

  const text = response.text || "";

  console.log("Gemini classify raw text:", text);

  return parseJsonResponse(text);
}

// AI 리포트 생성 요청
export async function requestInsight(payload: InsightPayload) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              insightPrompt +
              "\n\n분석 데이터:\n" +
              JSON.stringify(payload, null, 2),
          },
        ],
      },
    ],
  });

  const text = response.text || "";

  console.log("Gemini insight raw text:", text);

  return parseJsonResponse(text);
}
