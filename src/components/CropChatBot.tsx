import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFarmPreferences } from "@/hooks/useLocalStorage";
import { functions } from "@/integrations/firebase/client";
import { httpsCallable } from "firebase/functions";
import type { CropPrediction } from "@/pages/Predictions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickQuestions = [
  "Is my crop growing well?",
  "Any disease risks?",
  "How much water does it need?",
  "When should I harvest?",
];

interface Props {
  predictions: CropPrediction[];
}

const CropChatBot = ({ predictions }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [preferences] = useFarmPreferences();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildCropContext = () => {
    const parts: string[] = [];
    parts.push(`Location: ${preferences.locationName || "Unknown"}`);
    parts.push(`Selected crops: ${preferences.selectedCrops.join(", ")}`);

    if (predictions.length > 0) {
      parts.push("\nCurrent predictions:");
      predictions.forEach((p) => {
        parts.push(
          `- ${p.cropName}: ${p.growthStage}, ${p.growthPercentage}% grown, ${p.daysToHarvest} days to harvest, health ${p.healthScore}/100`,
        );
        if (p.diseaseRisks?.length) {
          parts.push(
            `  Disease risks: ${p.diseaseRisks.map((d) => `${d.name} (${d.likelihood})`).join(", ")}`,
          );
        }
        if (p.irrigationAdvice) {
          parts.push(
            `  Irrigation: ${p.irrigationAdvice.recommendedMethod}, ${p.irrigationAdvice.frequencyAdvice}`,
          );
        }
      });
    }

    Object.entries(preferences.cropDetails || {}).forEach(
      ([cropId, details]) => {
        const d = details as any;
        const info = [`Crop: ${cropId}`];
        if (d.fieldArea)
          info.push(`Area: ${d.fieldArea} ${d.fieldAreaUnit || "acres"}`);
        if (d.irrigationFrequency)
          info.push(`Irrigation: ${d.irrigationFrequency}`);
        if (d.cropStage) info.push(`Stage: ${d.cropStage}`);
        if (d.plantingDate) info.push(`Planted: ${d.plantingDate}`);
        parts.push(info.join(", "));
      },
    );

    return parts.join("\n");
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const cropChat = httpsCallable(functions, "crop-chat");
      const response = await cropChat({
        messages: [...messages, userMsg],
        cropContext: buildCropContext(),
      });

      const data = response.data as any;

      if (data?.error) {
        throw new Error(data.error);
      }

      const assistantReply =
        data?.reply || "I couldn't process that. Please try again.";
      const assistantMsg: Message = {
        role: "assistant",
        content: assistantReply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      console.error("Chat error:", e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process your question right now. Please try again.",
        },
      ]);
    }
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-2xl gradient-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Farm Assistant
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Ask anything about your crops
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-3">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">
              Hi! I'm your farm assistant
            </h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-[250px]">
              Ask me about your crops, diseases, irrigation, or harvesting.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] px-3 py-1.5 rounded-xl bg-primary/8 text-primary font-medium hover:bg-primary/15 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === "user" ? "bg-primary/10" : "gradient-primary"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-primary-foreground" />
              )}
            </div>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-md"
                  : "bg-muted/80 text-foreground rounded-tl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="bg-muted/80 px-3 py-2 rounded-2xl rounded-tl-md">
              <div className="flex gap-1">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions when chatting */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 pb-2">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground font-medium whitespace-nowrap hover:bg-muted transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border bg-card safe-bottom">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask about your crops..."
            className="flex-1 bg-muted/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="h-10 w-10 rounded-xl gradient-primary"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CropChatBot;
