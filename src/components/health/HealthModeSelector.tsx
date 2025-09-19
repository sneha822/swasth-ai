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


export function HealthModeSelector() {
  const { 
    currentHealthMode, 
    setCurrentHealthMode, 
    language, 
    newConversation, 
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
