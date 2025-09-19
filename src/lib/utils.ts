import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Typing animation delay helper
export function typewriter(
  text: string,
  callback: (text: string) => void,
  speed = 10
) {
  let i = 0;
  const timer = setInterval(() => {
    if (i < text.length) {
      callback(text.substring(0, i + 1));
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);

  return () => {
    clearInterval(timer);
  };
}

// Design tokens - reusable design constants
export const DESIGN_TOKENS = {
  cardStyles:
    "relative rounded-xl border border-white/5 border-t-white/10 bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B] shadow-lg duration-300 space-y-1.5 px-4 py-3",
  inputStyles:
    "flex h-[50px] items-center rounded-full bg-[#191919] border border-white/10 px-2 shadow-md focus-within:ring-1 focus-within:ring-white/20",
  buttonPrimary: "bg-[#e67553] hover:bg-[#e67553]/90 text-white font-medium",
  buttonSecondary: "bg-[#222] hover:bg-[#333] text-white/90 font-medium",
  gradients: {
    primary: "bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B]",
    accent: "bg-gradient-to-r from-[#e67553] to-[#f19270]",
    subtle: "bg-gradient-to-b from-transparent to-black/40",
  },
  animations: {
    fadeIn: "animate-fadeIn",
    slideUp: "animate-slideUp",
    pulse: "animate-pulse",
  },
  spacing: {
    containerPadding: "px-4 py-3",
    sectionGap: "gap-6",
  },
};

// Background effect for cards
export function applyCardHoverEffect(element: HTMLElement) {
  const handleMouseMove = (e: MouseEvent) => {
    const { left, top, width, height } = element.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    element.style.background = `
      radial-gradient(
        circle at ${x * 100}% ${y * 100}%, 
        rgba(255, 255, 255, 0.03), 
        transparent 80%
      ),
      linear-gradient(to top right, #0F0F0F, #0B0B0B)
    `;
  };

  element.addEventListener("mousemove", handleMouseMove);
  element.addEventListener("mouseleave", () => {
    element.style.background =
      "linear-gradient(to top right, #0F0F0F, #0B0B0B)";
  });

  return () => {
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("mouseleave", () => {});
  };
}
