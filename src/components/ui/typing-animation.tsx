import React, { useState, useEffect, useRef } from "react";

interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
  showCursor?: boolean;
  onComplete?: () => void;
}

export function TypingAnimation({
  text,
  className = "",
  speed = 8, // Faster default speed
  showCursor = true,
  onComplete,
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const charIndexRef = useRef<number>(0);

  useEffect(() => {
    setDisplayText("");
    setIsComplete(false);
    charIndexRef.current = 0;
    lastUpdateTimeRef.current = 0;

    if (!text) return;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (timestamp: number) => {
      // Initialize lastUpdateTime on first frame
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp;
      }

      // Calculate delta time since last frame
      const deltaTime = timestamp - lastUpdateTimeRef.current;

      // Progressive acceleration: start slower and get faster
      let currentSpeed = speed;
      const textProgress = charIndexRef.current / text.length;

      // Start at 1.5x speed and gradually reduce to 0.6x speed for longer texts
      if (text.length > 100) {
        // Faster at the beginning, slow down for the conclusion
        currentSpeed = speed * (textProgress < 0.8 ? 0.6 : 1.5);
      }

      // Variable timing for natural feel
      const randomVariance = Math.random() * 8 - 4; // -4 to +4 ms variance

      if (deltaTime > currentSpeed + randomVariance) {
        // For longer texts, add larger chunks at the beginning
        let chunkSize = 1;

        if (text.length > 200) {
          // Use bigger chunks for longer text
          if (textProgress < 0.7) {
            chunkSize = Math.floor(Math.random() * 5) + 2; // 2-6 chars for bulk of text
          } else {
            chunkSize = Math.floor(Math.random() * 2) + 1; // 1-2 chars near the end
          }
        } else {
          // Normal chunk size for shorter text
          chunkSize = Math.floor(Math.random() * 3) + 1; // 1-3 chars
        }

        const newIndex = Math.min(
          charIndexRef.current + chunkSize,
          text.length
        );
        const newText = text.substring(0, newIndex);

        setDisplayText(newText);
        charIndexRef.current = newIndex;

        // Record the time of this update
        lastUpdateTimeRef.current = timestamp;

        // Check if we're done
        if (newIndex >= text.length) {
          setIsComplete(true);
          if (onComplete) onComplete();
          return; // Stop animation
        }
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [text, speed, onComplete]);

  return (
    <div className={className}>
      <span>{displayText}</span>
      {showCursor && !isComplete && (
        <span className="ml-0.5 inline-block h-4 w-[2px] animate-blink bg-white/70" />
      )}
    </div>
  );
}
