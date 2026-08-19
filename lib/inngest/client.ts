import { Inngest } from "inngest";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

export const inngest = new Inngest({
  id: "signalist",
  ai: {
    gemini: {
      apiKey: geminiApiKey,
    },
  },
});
