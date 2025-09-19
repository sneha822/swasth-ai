import { getGeminiModel } from "./client";
import { HealthMode, getHealthMode, suggestHealthMode, detectEmergencyKeywords } from "../health-modes";
import { 
  getUserHealthProfile, 
  getUserHealthSuggestions, 
  getUserEmergencyContacts,
  HealthSuggestion,
  EmergencyContact 
} from "../health-profile-service";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  healthMode?: HealthMode;
  imageUrl?: string;
};

// TODO: Helper function to extract health suggestions from AI response
// function extractHealthSuggestions(response: string, userId: string): Promise<void> {
//   // This is a placeholder for future implementation
//   // Could use AI to identify actionable health suggestions in the response
//   // and automatically save them to the user's health suggestions
//   return Promise.resolve();
// }

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
    
    // Get comprehensive user health data for personalized responses
    let userProfile = null;
    let healthSuggestions: HealthSuggestion[] = [];
    let emergencyContacts: EmergencyContact[] = [];
    
    if (userId && healthMode === 'personalized') {
      // Fetch all health-related data in parallel
      const [profile, suggestions, contacts] = await Promise.all([
        getUserHealthProfile(userId),
        getUserHealthSuggestions(userId),
        getUserEmergencyContacts(userId)
      ]);
      
      userProfile = profile;
      healthSuggestions = suggestions;
      emergencyContacts = contacts;
    }

    // Prepare the health-specific prompt
    const healthPrompt = language === 'hi' ? modeConfig.promptHindi : modeConfig.prompt;
    
    // Build comprehensive context for personalized mode
    let contextualPrompt = healthPrompt;
    if (userProfile && healthMode === 'personalized') {
      contextualPrompt += `\n\n=== COMPREHENSIVE USER HEALTH PROFILE ===
      
PERSONAL INFORMATION:
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Height: ${userProfile.height ? `${userProfile.height} cm` : 'Not specified'}
- Weight: ${userProfile.weight ? `${userProfile.weight} kg` : 'Not specified'}
- Blood Group: ${userProfile.bloodGroup || 'Not specified'}

MEDICAL INFORMATION:
- Medical Conditions: ${userProfile.medicalConditions?.join(', ') || 'None specified'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None specified'}
- Current Medications: ${userProfile.medications?.join(', ') || 'None specified'}

LIFESTYLE PREFERENCES:
- Diet Type: ${userProfile.preferences?.dietType || 'Not specified'}
- Exercise Level: ${userProfile.preferences?.exerciseLevel || 'Not specified'}
- Sleep Hours: ${userProfile.preferences?.sleepHours || 'Not specified'}
- Stress Level: ${userProfile.preferences?.stressLevel || 'Not specified'}

EMERGENCY CONTACTS:
${emergencyContacts.length > 0 ? emergencyContacts.map(contact => 
  `- ${contact.name} (${contact.relation}): ${contact.phone}${contact.isPrimary ? ' [PRIMARY]' : ''}`
).join('\n') : 'No emergency contacts specified'}

ACTIVE HEALTH SUGGESTIONS:
${healthSuggestions.filter(s => !s.completed).length > 0 ? 
  healthSuggestions.filter(s => !s.completed).map(suggestion => 
    `- ${suggestion.title} (${suggestion.type}, Priority: ${suggestion.priority})${suggestion.dueDate ? ` - Due: ${suggestion.dueDate.toLocaleDateString()}` : ''}`
  ).join('\n') : 'No active health suggestions'}

RECENTLY COMPLETED SUGGESTIONS:
${healthSuggestions.filter(s => s.completed).slice(0, 3).length > 0 ? 
  healthSuggestions.filter(s => s.completed).slice(0, 3).map(suggestion => 
    `- ${suggestion.title} (Completed: ${suggestion.completedAt?.toLocaleDateString()})`
  ).join('\n') : 'No recently completed suggestions'}

=== INSTRUCTIONS FOR PERSONALIZED RESPONSES ===
1. Use ALL the above information to provide highly personalized health advice
2. Reference specific medical conditions, allergies, and medications when relevant
3. Consider the user's lifestyle preferences (diet, exercise, sleep, stress levels)
4. Acknowledge and build upon their existing health suggestions
5. Suggest new health recommendations based on their profile
6. Use emergency contact information when discussing emergency preparedness
7. Track progress on existing suggestions and provide encouragement
8. Adapt all advice to their specific age, gender, and health conditions
9. Consider their blood group and physical measurements for relevant advice
10. Be mindful of their stress level and provide appropriate stress management tips

Remember: This is a comprehensive health profile - use every piece of information to provide the most personalized and relevant health guidance possible.`;
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

    // TODO: Extract and save health suggestions if in personalized mode and user is logged in
    // if (healthMode === 'personalized' && userId) {
    //   try {
    //     await extractHealthSuggestions(response, userId);
    //   } catch (error) {
    //     console.error("Error extracting health suggestions:", error);
    //     // Don't throw error here as it shouldn't break the main response
    //   }
    // }

    return response;
  } catch (error) {
    console.error("Error in Gemini API:", error);
    throw error;
  }
}

