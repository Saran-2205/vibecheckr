import OpenAI from "openai";
import { questions } from "../rooms/questionBank";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateQuestions() {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
Create 20 fun and unique decision-based questions for a 2-player compatibility game.

Each question should:
- Be short and engaging
- Have exactly 3 options
- Focus on real-life choices, personality, or behavior

Vary the situations (friends, money, habits, risk, social, random fun).

Return ONLY a JSON array in this format:
[
  {
    "id": "q1",
    "question": "...",
    "options": ["...", "...", "..."],
    "category": "..."
  }
]

Make sure:
- All 20 questions are different
- No repeated ideas
`,
        },
      ],
    });

    const text = response.choices[0].message.content || "[]";

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return parsed;
  } catch (err) {
    console.log("AI failed:", err);
    return questions;
  }
}
