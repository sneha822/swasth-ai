import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatMessage } from "./ChatMessage";
import { useChatContext } from "@/hooks/useChatContext";
import { 
  Heart, 
  Shield, 
  Brain, 
  Activity, 
  Languages
} from "lucide-react";
import { DESIGN_TOKENS } from "../../lib/utils";
import { HealthMode } from "../../lib/health-modes";

const getHealthSuggestions = () => {
  const symptomsSuggestions = [
    "I have a headache and feeling tired",
    "Chest pain aur breathing problem ho rahi hai",
    "Fever hai 3 din se, kya karna chahiye?",
    "Pet mein dard hai aur nausea feel ho rahi hai",
    "Back pain ho rahi hai sitting ke time",
    "Cough aur sore throat hai 2 weeks se",
  ];

  const healthTipsSuggestions = [
    "Daily morning routine for better health",
    "Healthy breakfast ideas for busy mornings",
    "Simple exercises for office workers",
    "How to improve sleep quality naturally",
    "Best foods for immunity boost",
    "Stress management techniques for students",
  ];

  const mythFactSuggestions = [
    "Is drinking water after meals bad for digestion?",
    "Does cracking knuckles cause arthritis?",
    "Kya raat mein dahi khana harmful hai?",
    "Is it true that we only use 10% of our brain?",
    "Does eating carrots really improve eyesight?",
    "Kya AC mein sona health ke liye bad hai?",
  ];

  const proactiveSuggestions = [
    "Preventive health checkups I should get at my age",
    "How to maintain healthy weight naturally",
    "Best exercises for heart health",
    "Seasonal health precautions for monsoon",
    "How to boost immunity naturally",
    "Mental health tips for working professionals",
  ];

  return {
    symptoms: symptomsSuggestions[Math.floor(Math.random() * symptomsSuggestions.length)],
    tips: healthTipsSuggestions[Math.floor(Math.random() * healthTipsSuggestions.length)],
    mythFact: mythFactSuggestions[Math.floor(Math.random() * mythFactSuggestions.length)],
    proactive: proactiveSuggestions[Math.floor(Math.random() * proactiveSuggestions.length)],
  };
};

export function ChatContainer() {
  const {
    messages,
    isLoading,
    sendMessage,
    setCurrentHealthMode,
    language,
    setLanguage,
  } = useChatContext();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState(getHealthSuggestions());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages]);

  const refreshSuggestions = () => {
    setSuggestions(getHealthSuggestions());
  };

  const handleHealthModeClick = async (text: string, mode: HealthMode) => {
    setCurrentHealthMode(mode);
    const conversationId = await sendMessage(text, mode);
    // Navigate to the conversation page if we're on the new route
    if (window.location.pathname === "/new" && conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  };

  const togglingRef = useRef(false);
  const toggleLanguage = () => {
    if (togglingRef.current) return; // debounce rapid clicks
    togglingRef.current = true;
    const newLanguage = language === 'en' ? 'hi' : 'en';
    setLanguage(newLanguage);
    // brief lock to avoid double-toggles needed previously
    setTimeout(() => {
      togglingRef.current = false;
    }, 250);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-transparent pb-32 pt-4 will-change-transform">
      <div className="mx-auto max-w-3xl px-3 sm:px-4">
        {messages.length === 0 ? (
          <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#0b1220] to-[#0a0f1a] shadow-xl ring-1 ring-white/10">
              <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-[#89f7fe]" />
            </div>
            <h2 className="mb-2 text-xl sm:text-3xl font-medium tracking-tight bg-gradient-to-r from-[#89f7fe] via-[#66a6ff] to-[#89f7fe] bg-clip-text text-transparent animate-pulse">
              {language === 'hi' ? 'Namaste! Main Swasth AI hoon' : 'Hi, I\'m Swasth AI'}
            </h2>
            <h3 className="mb-8 text-lg sm:text-xl font-normal bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              {language === 'hi' ? 'Aapki health mein kaise madad kar sakta hoon?' : 'Your personal health assistant'}
            </h3>
            <p className="mb-4 sm:mb-6 max-w-lg text-sm leading-relaxed text-white/60">
              {language === 'hi' 
                ? 'Main aapki health ke saath help kar sakta hoon - symptoms check karna, health tips dena, myths clear karna aur emergency mein guidance dena.'
                : 'I can help with your health needs - check symptoms, provide health tips, clear health myths, and guide you in emergencies.'
              }
            </p>
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-[#0f1629] text-white/80 hover:text-white hover:bg-[#111b2e] transition-all duration-200 ring-1 ring-white/10 border border-white/10"
            >
              <Languages className="h-4 w-4 text-[#89f7fe]" />
              <span className="text-sm font-medium">
                {language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
              </span>
            </button>

            {showSuggestions && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mb-6">
                  <div
                    onClick={() => handleHealthModeClick(suggestions.symptoms, 'symptoms_checker')}
                    className={`${DESIGN_TOKENS.cardStyles} cursor-pointer flex flex-col items-center space-y-3 hover:shadow-xl hover:ring-1 hover:ring-white/10 transition-all duration-300`}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] ring-2 ring-white/5 shadow-md">
                      <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="font-medium text-white">
                      {language === 'hi' ? 'लक्षण जांच' : 'Symptoms Checker'}
                    </div>
                    <div className="text-xs text-white/60 px-2 text-center">
                      {suggestions.symptoms}
                    </div>
                  </div>

                  <div
                    onClick={() => handleHealthModeClick(suggestions.tips, 'health_tips')}
                    className={`${DESIGN_TOKENS.cardStyles} cursor-pointer flex flex-col items-center space-y-3 hover:shadow-xl hover:ring-1 hover:ring-white/10 transition-all duration-300`}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] ring-2 ring-white/5 shadow-md">
                      <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="font-medium text-white">
                      {language === 'hi' ? 'स्वास्थ्य टिप्स' : 'Health Tips'}
                    </div>
                    <div className="text-xs text-white/60 px-2 text-center">
                      {suggestions.tips}
                    </div>
                  </div>

                  <div
                    onClick={() => handleHealthModeClick(suggestions.mythFact, 'myth_fact')}
                    className={`${DESIGN_TOKENS.cardStyles} cursor-pointer flex flex-col items-center space-y-3 hover:shadow-xl hover:ring-1 hover:ring-white/10 transition-all duration-300`}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] ring-2 ring-white/5 shadow-md">
                      <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="font-medium text-white">
                      {language === 'hi' ? 'मिथक या तथ्य' : 'Myth or Fact'}
                    </div>
                    <div className="text-xs text-white/60 px-2 text-center">
                      {suggestions.mythFact}
                    </div>
                  </div>

                  <div
                    onClick={() => handleHealthModeClick(suggestions.proactive, 'proactive_suggestions')}
                    className={`${DESIGN_TOKENS.cardStyles} cursor-pointer flex flex-col items-center space-y-3 hover:shadow-xl hover:ring-1 hover:ring-white/10 transition-all duration-300`}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] ring-2 ring-white/5 shadow-md">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="font-medium text-white">
                      {language === 'hi' ? 'सुझाव' : 'Proactive Tips'}
                    </div>
                    <div className="text-xs text-white/60 px-2 text-center">
                      {suggestions.proactive}
                    </div>
                  </div>
                </div>
                
                {/* Show fewer modes on /new for simplicity */}
                <button
                  onClick={refreshSuggestions}
                  className="px-4 py-2 text-sm rounded-full bg-[#222]/80 text-white/70 hover:text-white hover:bg-[#333]/80 transition-colors duration-200 ring-1 ring-white/5"
                >
                  {language === 'hi' ? 'अलग सुझाव दिखाएं' : 'Show Different Suggestions'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}
            {isLoading && (
              <div className="flex justify-center py-5 animate-fadeIn">
                <div className="flex h-10 items-center justify-center space-x-2 rounded-full bg-[#222]/80 px-5 shadow-md ring-1 ring-white/5">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[#89f7fe] [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[#60a5fa] [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
