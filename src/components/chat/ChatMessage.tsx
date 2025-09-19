import React, { useEffect, useRef, useState } from "react";
import { Message } from "../../lib/gemini/service";
import {
  formatTimestamp,
  DESIGN_TOKENS,
  applyCardHoverEffect,
} from "../../lib/utils";
import ReactMarkdown from "react-markdown";
import { Image, AlertCircle, Copy, Check, ClipboardCopy } from "lucide-react";
import { TypingAnimation } from "../ui/typing-animation";

// Import code syntax highlighting components
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import scss from "react-syntax-highlighter/dist/esm/languages/prism/scss";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import ruby from "react-syntax-highlighter/dist/esm/languages/prism/ruby";
import kotlin from "react-syntax-highlighter/dist/esm/languages/prism/kotlin";
import swift from "react-syntax-highlighter/dist/esm/languages/prism/swift";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import html from "react-syntax-highlighter/dist/esm/languages/prism/markup";

// Register languages
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("tsx", typescript);
SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("scss", scss);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("md", markdown);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("py", python);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("c", c);
SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("csharp", csharp);
SyntaxHighlighter.registerLanguage("cs", csharp);
SyntaxHighlighter.registerLanguage("rust", rust);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("ruby", ruby);
SyntaxHighlighter.registerLanguage("rb", ruby);
SyntaxHighlighter.registerLanguage("kotlin", kotlin);
SyntaxHighlighter.registerLanguage("swift", swift);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("html", html);

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [showTyping, setShowTyping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAnimationComplete, setIsAnimationComplete] = useState(
    !isLatest || isUser
  );
  const [imageLoading, setImageLoading] = useState(!!message.imageUrl);
  const [imageError, setImageError] = useState(false);
  const [imageErrorMessage, setImageErrorMessage] = useState("");
  const [messageCopied, setMessageCopied] = useState(false);
  const [codeBlockStates, setCodeBlockStates] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (isLatest && !isUser) {
      setShowTyping(true);
    }
  }, [isLatest, isUser]);

  useEffect(() => {
    // Apply hover effect to AI message cards
    if (cardRef.current && !isUser) {
      return applyCardHoverEffect(cardRef.current);
    }
  }, [isUser]);

  useEffect(() => {
    if (messageCopied) {
      const timer = setTimeout(() => {
        setMessageCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messageCopied]);

  useEffect(() => {
    if (message.imageUrl) {
      // Check if it's an error placeholder image
      const url = new URL(message.imageUrl, window.location.origin);
      if (
        url.pathname === "/placeholder-image.svg" &&
        url.searchParams.has("error")
      ) {
        setImageError(true);
        setImageLoading(false);
        setImageErrorMessage(url.searchParams.get("error") || "");
      }
    }
  }, [message.imageUrl]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text).then(() => {
      if (id) {
        setCodeBlockStates((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => {
          setCodeBlockStates((prev) => ({ ...prev, [id]: false }));
        }, 2000);
      } else {
        setMessageCopied(true);
      }
    });
  };

  const copyMessage = () => {
    copyToClipboard(message.content);
  };

  return (
    <div
      className={`group relative mb-4 flex items-start ${
        isUser ? "justify-end" : "justify-start"
      } ${isLatest ? "animate-fadeIn" : ""}`}
    >
      <div
        className={`flex max-w-[85%] sm:max-w-[80%] md:max-w-[75%] flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          ref={cardRef}
          className={`${
            isUser
              ? "message-bubble rounded-3xl prose dark:prose-invert break-words text-primary min-h-7 prose-p:opacity-95 prose-strong:opacity-100 bg-[#2D2E2F] border border-input-border max-w-[100%]  px-4 py-2.5 rounded-br-lg"
              : DESIGN_TOKENS.cardStyles
          } ${isLatest && !isUser ? "animate-slideUp" : ""} w-full relative`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed text-sm prose-p:opacity-95 prose-strong:opacity-100 text-white">
              {message.content}
            </p>
          ) : showTyping &&
            isLatest &&
            !isAnimationComplete &&
            !message.imageUrl ? (
            <div className="prose prose-invert max-w-none prose-p:text-sm prose-p:leading-relaxed">
              <TypingAnimation
                text={message.content}
                className="whitespace-pre-wrap break-words text-sm"
                speed={3}
                onComplete={() => setIsAnimationComplete(true)}
              />
            </div>
          ) : (
            <div className="prose prose-invert max-w-none prose-p:text-sm prose-p:leading-relaxed !p-0 !m-0 space-y-0 !mb-0">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {children}
                    </p>
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "";
                    const codeContent = String(children).replace(/\n$/, "");
                    const codeId = `code-${language}-${codeContent
                      .slice(0, 20)
                      .replace(/\s/g, "-")}`;
                    const isCopied = codeBlockStates[codeId] || false;

                    // Check for inline code - if it doesn't have language class, it's likely inline
                    if (!match) {
                      return (
                        <code
                          className="rounded bg-[#333] px-1 py-0.5 text-xs font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="rounded-md overflow-hidden my-4 relative group/code">
                        <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-1 text-xs text-white/60">
                          <span>{language || "code"}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                copyToClipboard(codeContent, codeId)
                              }
                              className="p-1 rounded hover:bg-[#333] text-white/70 hover:text-white transition-colors"
                              title="Copy code"
                            >
                              {isCopied ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <span className="text-[10px]">Swasth AI</span>
                          </div>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={language || "text"}
                          PreTag="div"
                          wrapLines={true}
                          wrapLongLines={true}
                          customStyle={{
                            margin: 0,
                            padding: "1rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          {codeContent}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                  pre: ({ children }) => <>{children}</>,
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-4 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-white/90">{children}</li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mt-6 mb-3">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold mt-5 mb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-md font-medium mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-[#89f7fe] pl-4 italic my-3">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {message.imageUrl && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  {imageLoading && (
                    <div className="flex flex-col items-center justify-center bg-[#1a1a1a] p-8 rounded-lg animate-pulse">
                      <Image className="h-12 w-12 text-[#89f7fe] mb-3" />
                      <p className="text-sm text-white/70">
                        Generating image...
                      </p>
                    </div>
                  )}

                  {imageError ? (
                    <div className="flex flex-col items-center justify-center bg-[#1a1a1a] p-8 rounded-lg">
                      <AlertCircle className="h-12 w-12 text-[#89f7fe] mb-3" />
                      <p className="text-sm text-white/70 text-center mb-2">
                        Failed to generate image
                      </p>
                      {imageErrorMessage && (
                        <p className="text-xs text-white/60 text-center max-w-sm">
                          {imageErrorMessage}
                        </p>
                      )}
                    </div>
                  ) : (
                    <img
                      src={message.imageUrl}
                      alt="Generated image"
                      className={`w-full rounded-lg ${
                        imageLoading ? "hidden" : "animate-fadeIn"
                      }`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1 select-none text-[10px] text-muted-foreground">
          {formatTimestamp(message.timestamp)}

          {!isUser && isAnimationComplete && (
            <button
              onClick={copyMessage}
              className="ml-2 flex items-center gap-1 text-white/50 hover:text-white/70 transition-colors"
              title="Copy message"
            >
              {messageCopied ? (
                <>
                  <Check className="h-2.5 w-2.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <ClipboardCopy className="h-2.5 w-2.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
