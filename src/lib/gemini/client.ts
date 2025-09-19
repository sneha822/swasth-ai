import { GoogleGenerativeAI } from "@google/generative-ai";

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("Missing Gemini API key");
}

export const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash-thinking-exp-01-21",
  });
};

export const getGeminiImageModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",
  });
};
