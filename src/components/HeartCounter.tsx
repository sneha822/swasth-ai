import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { incrementHeartCount, subscribeToHeartCount } from "../lib/firebase";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function HeartCounter() {
  const [count, setCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPulse, setShowPulse] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToHeartCount((newCount) => {
      setCount(newCount);
    });

    // Cleanup subscription when component unmounts
    return () => unsubscribe();
  }, []);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setIsLiked(true);
    setShowPulse(true);

    try {
      await incrementHeartCount();
    } catch (error) {
      console.error("Error incrementing heart count:", error);
    } finally {
      setIsLoading(false);
      // Reset like state after a short delay for animation
      setTimeout(() => {
        setIsLiked(false);
        setShowPulse(false);
      }, 500);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full group bg-gradient-to-br from-[#222] to-[#1a1a1a] hover:from-[#333] hover:to-[#222] transition-all duration-300 shadow-md hover:shadow-[#E96071]/20"
        onClick={handleLike}
        disabled={isLoading}
      >
        <AnimatePresence>
          {showPulse && (
            <motion.div
              className="absolute inset-0 rounded-full bg-[#E96071]/20"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        <Heart
          className={`h-5 w-5 transition-all duration-300 ${
            isLiked
              ? "fill-[#E96071] stroke-[#E96071] scale-125"
              : "text-gray-400 group-hover:text-[#E96071] group-hover:scale-110"
          }`}
        />
        <span className="sr-only">Like</span>
      </Button>

      {count > 0 && (
        <motion.div
          className="absolute -top-2 -right-2 bg-gradient-to-r from-[#E96071] to-[#d86a4a] text-[10px] text-white rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center font-medium shadow-lg"
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          {count > 999 ? "999+" : count}
        </motion.div>
      )}
    </div>
  );
}
