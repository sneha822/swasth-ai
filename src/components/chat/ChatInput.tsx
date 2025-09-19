import React, {
  useState,
  FormEvent,
  KeyboardEvent,
  useRef,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Textarea } from "../ui/textarea";
import { ArrowUp } from "lucide-react";
import { useChatContext } from "@/hooks/useChatContext";
import { cn } from "@/lib/utils";

export function ChatInput() {
  const [input, setInput] = useState("");
  const { sendMessage } = useChatContext();
  const location = useLocation();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isProcessing) return;

      const message = input.trim();
      setInput(""); // Clear input immediately for better UX

      try {
        if (location.pathname === "/new") {
          setIsProcessing(true);
          const conversationId = await sendMessage(message);

          if (conversationId) {
            navigate(`/chat/${conversationId}`);
          }
        } else {
          await sendMessage(message);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setInput(message); // Restore input only on error
      } finally {
        setIsProcessing(false);
      }
    },
    [input, location.pathname, sendMessage, navigate, isProcessing]
  );

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 56), 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      adjustHeight();
    },
    [adjustHeight]
  );

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const focusInput = React.useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 pb-6 px-2 sm:px-4 z-10 bg-gradient-to-t from-[#080808] to-[#0a0f1a]/5 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        <form
          onClick={focusInput}
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-2"
        >
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Swasth AI anything..."
              className={cn(
                "w-full rounded-3xl pl-4 pr-12 py-4 placeholder:text-white/50 text-white resize-none text-wrap",
                "min-h-[56px] bg-[#0f1629]/95 border border-white/10 focus-visible:border-[#89f7fe]/40 focus-visible:ring-2 focus-visible:ring-[#89f7fe]/40 transition-all duration-200 shadow-md shadow-black/20"
              )}
            />

            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-[#89f7fe] to-[#66a6ff] hover:from-[#89f7fe]/90 hover:to-[#66a6ff]/90 py-2 px-2 shadow-lg shadow-[#89f7fe]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!input.trim() || isProcessing}
            >
              <ArrowUp
                className={cn(
                  "w-4 h-4 transition-opacity text-white",
                  input && !isProcessing ? "opacity-100" : "opacity-70"
                )}
              />
            </button>
          </div>
        </form>
        <div className="mt-2 px-2 sm:px-4 flex items-center justify-center">
          <p className="text-center text-xs text-gray-500">
            Swasth AI may display inaccurate info, including about people, places,
            or facts
          </p>
        </div>
      </div>
    </div>
  );
}
