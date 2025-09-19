import { getGeminiModel } from "./client";
import { HealthMode, getHealthMode, suggestHealthMode, detectEmergencyKeywords } from "../health-modes";
import { getUserHealthProfile } from "../health-profile-service";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  healthMode?: HealthMode;
  imageUrl?: string;
};

export async function getChatResponse(
  messages: Message[],
  healthMode: HealthMode = 'general',
  language: 'en' | 'hi' = 'en',
  userId?: string
): Promise<string> {
  try {
    const latestMessage = messages[messages.length - 1];
    
    // Auto-detect emergency situations
    if (detectEmergencyKeywords(latestMessage.content)) {
      healthMode = 'emergency';
    } else if (healthMode === 'general') {
      // Auto-suggest appropriate mode based on message content
      healthMode = suggestHealthMode(latestMessage.content);
    }

    const model = getGeminiModel();
    const modeConfig = getHealthMode(healthMode);
    
    // Get user health profile for personalized responses
    let userProfile = null;
    if (userId && healthMode === 'personalized') {
      userProfile = await getUserHealthProfile(userId);
    }

    // Prepare the health-specific prompt
    const healthPrompt = language === 'hi' ? modeConfig.promptHindi : modeConfig.prompt;
    
    // Add user profile context for personalized mode
    let contextualPrompt = healthPrompt;
    if (userProfile && healthMode === 'personalized') {
      contextualPrompt += `\n\nUser Profile Context:
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Medical Conditions: ${userProfile.medicalConditions?.join(', ') || 'None specified'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None specified'}
- Diet Type: ${userProfile.preferences?.dietType || 'Not specified'}
- Exercise Level: ${userProfile.preferences?.exerciseLevel || 'Not specified'}

Use this information to provide highly personalized health advice.`;
    }

    // Map our roles to Gemini roles
    const mappedHistory = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Initialize the chat with our health-specific prompt
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: contextualPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: language === 'hi' 
                ? "Bilkul! Main aapki health ke saath help karunga. Swasth AI ke roop mein, main aapko best health advice dunga Hinglish mein."
                : "Absolutely! I'll help you with your health as Swasth AI. I'll provide you the best health advice in Hinglish.",
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

