import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatMessage } from "./ChatMessage";
import { useChatContext } from "@/hooks/useChatContext";
import { Hand, Lightbulb, Code, ImageIcon } from "lucide-react";
import { DESIGN_TOKENS } from "../../lib/utils";

const getRandomSuggestions = () => {
  const textSuggestions = [
    "Tell me a funny joke about programming",
    "What are some traditional Indian dishes I should try?",
    "Explain quantum computing in simple terms",
    "Give me tips for learning a new language",
    "What are the best places to visit in Mumbai?",
    "Tell me about the history of Bollywood",
    "What are some productivity hacks I can use?",
    "How does artificial intelligence work?",
    "Tell me about the latest smartphone trends",
    "What books would you recommend for beginners in data science?",
  ];

  const codeSuggestions = [
    "Create a simple to-do list app using React",
    "How do I implement dark mode with CSS variables?",
    "Write a function to check if a string is a palindrome",
    "Help me with a basic Express.js server setup",
    "Create a responsive navigation menu with CSS",
    "How do I fetch data from an API in React?",
    "Write a simple animation using CSS",
    "Help me understand async/await in JavaScript",
    "Create a basic login form with validation",
    "How do I implement infinite scroll in React?",
  ];

  const imageSuggestions = [
    "A peaceful mountain village at sunset with floating lanterns",
    "A cyberpunk version of the Taj Mahal",
    "A futuristic Indian street food stall",
    "An elephant decorated for a traditional Indian festival",
    "A serene beach with palm trees and crystal clear water",
    "A modern office space with plants and natural lighting",
    "A robot chef cooking in a traditional Indian kitchen",
    "A magical forest with glowing plants and mythical creatures",
    "A futuristic cityscape with flying cars and holographic billboards",
    "A cozy coffee shop on a rainy day",
  ];

  return {
    text: textSuggestions[Math.floor(Math.random() * textSuggestions.length)],
    code: codeSuggestions[Math.floor(Math.random() * codeSuggestions.length)],
    image:
      imageSuggestions[Math.floor(Math.random() * imageSuggestions.length)],
  };
};

export function ChatContainer() {
  const {
    messages,
    isLoading,
    isGeneratingImage,
    sendMessage,
    generateImageFromPrompt,
  } = useChatContext();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState(getRandomSuggestions());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages]);

  const refreshSuggestions = () => {
    setSuggestions(getRandomSuggestions());
  };

  const handleSampleClick = async (text: string) => {
    const conversationId = await sendMessage(text);
    // Navigate to the conversation page if we're on the new route
    if (window.location.pathname === "/new" && conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  };

  const handleImagePromptClick = async (prompt: string) => {
    const conversationId = await generateImageFromPrompt(prompt);
    // Navigate to the conversation page if we're on the new route
    if (window.location.pathname === "/new" && conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-transparent pb-32 pt-4">
      <div className="mx-auto max-w-3xl px-3 sm:px-4">
        {messages.length === 0 ? (
          <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#222] to-[#111] shadow-xl ring-1 ring-white/10">
              <Hand className="h-7 w-7 sm:h-8 sm:w-8 text-[#e67553]" />
            </div>
            <h2 className="mb-2 text-xl sm:text-3xl font-medium tracking-tight bg-gradient-to-r from-[#e67553] via-[#f7b95b] to-[#e67553] bg-clip-text text-transparent animate-pulse">
              Hi, I'm Swasth AI
            </h2>
            <h3 className="mb-8 text-lg sm:text-xl font-normal bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              How can I assist you today?
            </h3>
            <p className="mb-8 sm:mb-12 max-w-sm text-sm leading-relaxed text-white/60">
              I can help with anything you need - from answering questions to
              providing recommendations, generating images or just having a
              friendly chat.
            </p>

            {showSuggestions && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-6">
                  <div
                    onClick={() => handleSampleClick(suggestions.text)}
                    className={`${DESIGN_TOKENS.cardStyles} cursor-pointer flex flex-col items-center space-y-3 hover:shadow-xl hover:ring-1 hover:ring-white/10 transition-all duration-300`}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#e67553] to-[#d86a4a] ring-2 ring-white/5 shadow-md">
                      <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="font-medium text-white">
                      Ask Me Anything
                    </div>
                    <div className="text-xs text-white/60 px-2">
                      {suggestions.text}
                    </div>
                  </div>

                  <div
                    onClick={() => handleSampleClick(suggestions.code)}
                    className={`${DESIGN_TOKENS.cardStyles} cursor-pointer flex flex-col items-center space-y-3 hover:shadow-xl hover:ring-1 hover:ring-white/10 transition-all duration-300`}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#444] to-[#333] ring-2 ring-white/5 shadow-md">
                      <Code className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="font-medium text-white">
                      Coding Assistant
                    </div>
                    <div className="text-xs text-white/60 px-2">
                      {suggestions.code}
                    </div>
                  </div>

                  <div
                    onClick={() => handleImagePromptClick(suggestions.image)}
                    className={`${DESIGN_TOKENS.cardStyles} cursor-pointer flex flex-col items-center space-y-3 hover:shadow-xl hover:ring-1 hover:ring-white/10 transition-all duration-300`}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#7b61ff] to-[#5b44dd] ring-2 ring-white/5 shadow-md">
                      <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="font-medium text-white">
                      Image Generation
                    </div>
                    <div className="text-xs text-white/60 px-2">
                      {suggestions.image}
                    </div>
                  </div>
                </div>
                <button
                  onClick={refreshSuggestions}
                  className="px-4 py-2 text-sm rounded-full bg-[#222]/80 text-white/70 hover:text-white hover:bg-[#333]/80 transition-colors duration-200 ring-1 ring-white/5"
                >
                  Show Different Suggestions
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
            {(isLoading || isGeneratingImage) && (
              <div className="flex justify-center py-5 animate-fadeIn">
                <div className="flex h-10 items-center justify-center space-x-2 rounded-full bg-[#222]/80 px-5 shadow-md ring-1 ring-white/5">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[#e67553] [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[#e67553] [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[#e67553]"></div>
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
