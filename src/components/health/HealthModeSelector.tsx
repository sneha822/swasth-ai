import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  
  ChevronDown,
  Sparkles,
  Zap,
  X
} from 'lucide-react';
import { HealthMode, HEALTH_MODES } from '../../lib/health-modes';
import { useChatContext } from '../../hooks/useChatContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "../ui/alert-dialog";

// Welcome messages for each health mode
const WELCOME_MESSAGES: Record<HealthMode, { en: string; hi: string }> = {
  symptoms_checker: {
    en: "Hello! I'm here to help you understand your symptoms. Please describe what you're experiencing - any pain, discomfort, or changes you've noticed. I'll ask follow-up questions to better understand your situation.",
    hi: "Namaste! Main aapke symptoms samjhane mein help karunga. Batayiye ki aap kya experience kar rahe hain - koi pain, discomfort ya changes jo aapne notice kiye hain. Main aur questions puchunga taaki better samajh saku."
  },
  health_tips: {
    en: "Welcome to Health Tips! I'm here to share practical, evidence-based health advice to help you live better. What area of health would you like tips about - nutrition, exercise, sleep, mental wellness, or something else?",
    hi: "Health Tips mein aapka swagat hai! Main practical, evidence-based health advice share karunga jo aapki life better banaye. Kis health area ke baare mein tips chahiye - nutrition, exercise, sleep, mental wellness, ya kuch aur?"
  },
  myth_fact: {
    en: "Hi! I'm your Myth vs Fact health detective. I'll help you separate health myths from scientific facts. Share any health claim, remedy, or belief you've heard about, and I'll give you the real truth behind it!",
    hi: "Hi! Main aapka Myth vs Fact health detective hun. Main health myths aur scientific facts ko alag karne mein help karunga. Koi bhi health claim, remedy, ya belief jo aapne suni hai, batayiye - main aapko real truth bataunga!"
  },
  proactive_suggestions: {
    en: "Hello! I'm here to give you proactive health suggestions to prevent problems before they start. Tell me about your lifestyle, age, or any health concerns, and I'll suggest preventive measures you can take.",
    hi: "Hello! Main aapko proactive health suggestions dunga jo problems ko shuru hone se pehle hi prevent kar dein. Apni lifestyle, age, ya koi health concerns batayiye, main preventive measures suggest karunga."
  },
  emergency: {
    en: "🚨 EMERGENCY MODE ACTIVATED 🚨\n\nI'm here to help with urgent health situations. If this is a life-threatening emergency, please call emergency services immediately (911/108). For urgent but non-life-threatening issues, describe your situation and I'll guide you on next steps.",
    hi: "🚨 EMERGENCY MODE ACTIVATED 🚨\n\nMain urgent health situations mein help ke liye hun. Agar ye life-threatening emergency hai, turant emergency services ko call kariye (911/108). Urgent lekin non-life-threatening issues ke liye, apni situation describe kariye, main next steps guide karunga."
  },
  personalized: {
    en: "Welcome to your Personalized Health Assistant! I'll provide advice tailored specifically to your health profile, medical history, and lifestyle. The more you share about yourself, the better I can help you with customized recommendations.",
    hi: "Aapke Personalized Health Assistant mein aapka swagat hai! Main aapke health profile, medical history, aur lifestyle ke according specially tailored advice dunga. Jitna zyada aap apne baare mein batayenge, utni better customized recommendations de paunga."
  },
  general: {
    en: "Hello! I'm Swasth AI, your general health companion. I can help with health questions, provide wellness tips, explain medical concepts, or just have a health-focused conversation. What would you like to know about today?",
    hi: "Hello! Main Swasth AI hun, aapka general health companion. Main health questions mein help kar sakta hun, wellness tips de sakta hun, medical concepts explain kar sakta hun, ya sirf health-focused conversation kar sakta hun. Aaj kya jaanna chahte hain?"
  }
};

export function HealthModeSelector() {
  const { 
    currentHealthMode, 
    setCurrentHealthMode, 
    language, 
    newConversation, 
    sendMessage 
  } = useChatContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentMode = HEALTH_MODES[currentHealthMode];

  const handleModeSelect = async (mode: HealthMode) => {
    if (mode === currentHealthMode) {
      setIsOpen(false);
      return;
    }

    setIsTransitioning(true);
    setIsOpen(false);

    try {
      // Set the new health mode
      setCurrentHealthMode(mode);

      // Start a new conversation
      newConversation();

      // Navigate to new chat
      navigate('/new');

      // Send welcome message as AI message
      setTimeout(async () => {
        const welcomeMessage = WELCOME_MESSAGES[mode];
        const message = language === 'hi' ? welcomeMessage.hi : welcomeMessage.en;

        // Use sendMessage to properly add the AI welcome message
        await sendMessage(message, mode);
      }, 800);

    } catch (error) {
      console.error('Error switching health mode:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={isTransitioning}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 border text-sm group relative overflow-hidden",
          isTransitioning 
            ? "bg-gradient-to-r from-[#89f7fe]/30 to-[#66a6ff]/30 border-[#89f7fe]/60 cursor-not-allowed" 
            : "bg-[#1e3a5f]/15 hover:bg-[#1e3a5f]/25 border-[#1e3a5f]/30 hover:border-[#89f7fe]/40"
        )}
        title="Change Health Mode"
      >
        {isTransitioning && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#89f7fe]/10 to-[#66a6ff]/10 animate-pulse" />
        )}
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="relative">
            <span className="text-lg">{currentMode.icon}</span>
            {isTransitioning && (
              <div className="absolute -top-1 -right-1 w-3 h-3">
                <Sparkles className="w-3 h-3 text-[#89f7fe] animate-pulse" />
              </div>
            )}
          </div>
          
          <span className="hidden sm:inline text-xs text-gray-400">
            {isTransitioning ? "Switching..." : "Change Mode"}
          </span>
          
          {!isTransitioning && (
            <ChevronDown className="h-3 w-3 text-white/60 group-hover:text-[#89f7fe] transition-all duration-200" />
          )}
          
          {isTransitioning && (
            <div className="w-3 h-3 border-2 border-[#89f7fe]/30 border-t-[#89f7fe] rounded-full animate-spin" />
          )}
        </div>
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-gradient-to-b from-[#0f1629] to-[#0a1121] border border-[#1e3a5f]/60 shadow-xl max-w-4xl p-4 sm:p-5">
          <AlertDialogHeader>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <AlertDialogTitle className="text-white text-base font-semibold">Choose Health Mode</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#89f7fe]/80 text-xs">
                    Select the type of health assistance you need
                  </AlertDialogDescription>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 rounded-lg bg-[#1e3a5f]/20 hover:bg-[#1e3a5f]/40 border border-[#1e3a5f]/40"
              >
                <X className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {Object.entries(HEALTH_MODES).map(([modeId, mode]) => (
                <button
                  key={modeId}
                  onClick={() => handleModeSelect(modeId as HealthMode)}
                  disabled={isTransitioning}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-150 text-left group relative overflow-hidden",
                    currentHealthMode === modeId 
                      ? "bg-gradient-to-r from-[#89f7fe]/10 to-[#66a6ff]/10 border-[#89f7fe]/40 shadow" 
                      : "bg-[#1e3a5f]/10 border-[#1e3a5f]/30 hover:bg-[#1e3a5f]/20 hover:border-[#89f7fe]/30"
                  )}
                >
                  {currentHealthMode === modeId && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#89f7fe]/5 to-[#66a6ff]/5" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150",
                        currentHealthMode === modeId 
                          ? "bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] shadow-md shadow-[#89f7fe]/20" 
                          : "bg-[#1e3a5f]/40 group-hover:bg-[#1e3a5f]/60 group-hover:scale-[1.02]"
                      )}>
                        <span className="text-lg text-white">{mode.icon}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {mode.emergencyLevel === 'critical' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                        {currentHealthMode === modeId && (
                          <div className="w-6 h-6 bg-[#89f7fe]/20 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#89f7fe] rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className={cn(
                      "font-semibold mb-1 transition-colors text-sm",
                      currentHealthMode === modeId ? "text-[#89f7fe]" : "text-white group-hover:text-[#89f7fe]"
                    )}>
                      {language === 'hi' ? mode.nameHindi : mode.name}
                    </h3>
                    
                    <p className="text-xs text-white/70 leading-relaxed">
                      {language === 'hi' ? mode.descriptionHindi : mode.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gradient-to-r from-[#89f7fe]/5 to-[#66a6ff]/5 rounded-lg border border-[#89f7fe]/20">
              <p className="text-xs text-white/70 text-center leading-relaxed">
                💡 Selecting a different mode will start a new conversation with specialized AI assistance for that health area
              </p>
            </div>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
