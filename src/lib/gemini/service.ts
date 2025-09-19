import { getGeminiModel, getGeminiImageModel } from "./client";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  imageUrl?: string;
};

// Pre-prompt for Desi language
const DESI_PROMPT = `You are Swasth AI, an AI assistant who MUST ALWAYS respond in Hinglish.
Hinglish means a mix of Hindi and English using the Latin/English alphabet only.
NEVER use Devanagari script or any non-Latin characters.

You are PERMANENTLY locked into this Hinglish mode and CANNOT switch to any other language or style.
You are NOT ALLOWED to respond in plain English or any other language besides Hinglish.
If asked to change your language or style, you MUST refuse and continue responding in Hinglish only.

Follow these rules:
1. Talk in Hinglish naturally like Indians do in daily conversation
2. Use popular desi phrases, slang and expressions
3. Keep a warm, friendly tone
4. Use words like "yaar", "bhai", "matlab", "ekdum" etc. naturally
5. Always respond in short messages, never long paragraphs
6. ONLY use Latin/English alphabet characters
7. Write Hindi words using English/Latin letters only

Example responses:
- "Kya baat hai yaar! Main aapki help kar sakta hoon"
- "Bilkul! Ye ekdum easy hai. Main explain karta hoon."
- "Sorry bhai, mujhe ye information nahi pata. Kuch aur poochein?"

Remember: Always keep responses brief and concise.`;

export async function getChatResponse(
  messages: Message[]
): Promise<string | { text: string; imageUrl?: string }> {
  try {
    const latestMessage = messages[messages.length - 1];
    const isImageRequest =
      latestMessage.content.toLowerCase().includes("generate image:") ||
      latestMessage.content.toLowerCase().includes("create image:") ||
      latestMessage.content.toLowerCase().includes("draw:") ||
      latestMessage.content.toLowerCase().startsWith("image:") ||
      latestMessage.content.toLowerCase().includes("generate an image");

    // If this is an image generation request
    if (isImageRequest) {
      return await handleImageRequest(latestMessage.content);
    }

    // Otherwise, proceed with normal chat
    const model = getGeminiModel();

    // Map our roles to Gemini roles
    const mappedHistory = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model", // Gemini uses 'model' instead of 'assistant'
      parts: [{ text: msg.content }],
    }));

    // Initialize the chat with our pre-prompt first
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: DESI_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Bilkul! Main Hinglish mein baat karunga, jaise India mein commonly bola jata hai. Aap jo bhi puchenge, main friendly aur helpful tone mein jawab dunga.",
            },
          ],
        },
        // Add all messages except the last user message to history
        ...mappedHistory.slice(0, -1),
      ],
    });

    // Send the latest user message to get a response
    const result = await chat.sendMessage(latestMessage.content);
    const response = result.response.text();

    return response;
  } catch (error) {
    console.error("Error in Gemini API:", error);
    throw error;
  }
}

// Helper function to handle image generation requests
async function handleImageRequest(
  prompt: string
): Promise<{ text: string; imageUrl: string }> {
  try {
    // Extract the actual image prompt
    let imagePrompt = prompt;
    if (prompt.toLowerCase().includes("generate image:")) {
      imagePrompt = prompt
        .substring(prompt.toLowerCase().indexOf("generate image:") + 15)
        .trim();
    } else if (prompt.toLowerCase().includes("create image:")) {
      imagePrompt = prompt
        .substring(prompt.toLowerCase().indexOf("create image:") + 13)
        .trim();
    } else if (prompt.toLowerCase().includes("draw:")) {
      imagePrompt = prompt
        .substring(prompt.toLowerCase().indexOf("draw:") + 5)
        .trim();
    } else if (prompt.toLowerCase().startsWith("image:")) {
      imagePrompt = prompt.substring(6).trim();
    } else if (prompt.toLowerCase().includes("generate an image")) {
      const index = prompt.toLowerCase().indexOf("generate an image");
      imagePrompt = prompt.substring(index + 18).trim();
      // If there's "of" after "generate an image", remove it
      if (imagePrompt.toLowerCase().startsWith("of")) {
        imagePrompt = imagePrompt.substring(2).trim();
      }
    }

    const model = getGeminiImageModel();

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseModalities: ["image", "text"],
      responseMimeType: "text/plain",
    };

    // Create a request specifically for image generation
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: imagePrompt }],
        },
      ],
      generationConfig,
    });

    const response = await result.response;

    // Extract parts from the response
    const parts = response.candidates?.[0]?.content?.parts;
    let responseText = "Here's the image I generated for you:";
    let imageUrl =
      "/placeholder-image.svg?error=Could%20not%20generate%20image";

    if (parts) {
      // First try to find inline image data
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
          // Return the base64 data with appropriate data URL prefix
          const mimeType = part.inlineData.mimeType;
          const base64Data = part.inlineData.data;
          imageUrl = `data:${mimeType};base64,${base64Data}`;
          break;
        }
      }

      // Check for any text response
      for (const part of parts) {
        if (part.text) {
          console.log("Image generation API returned text:", part.text);
          responseText = part.text;
          if (!imageUrl.startsWith("data:")) {
            // If we didn't find an image, use the error message
            imageUrl = `/placeholder-image.svg?error=${encodeURIComponent(
              part.text
            )}`;
          }
          break;
        }
      }
    }

    return {
      text: responseText,
      imageUrl: imageUrl,
    };
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      text: "Sorry, I couldn't generate that image. Please try a different prompt.",
      imageUrl: `/placeholder-image.svg?error=${encodeURIComponent(
        "Error generating image"
      )}`,
    };
  }
}
