import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import axios from "axios";
import { useNotification } from "@/context/NotificationContext";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string | string[];
}

interface ChatPanelProps {
  onQuerySuccess?: (question: string, answer: string | string[]) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onQuerySuccess }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    // Add user message
    const userMsgId = Math.random().toString(36).substr(2, 9);
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, type: "user", content: question },
    ]);

    setLoading(true);
    addNotification("Querying ERP system...", "loading", 0);

    try {
      const response = await axios.post("/query", { question });
      const answer = response.data.answer;

      // Add AI message
      const aiMsgId = Math.random().toString(36).substr(2, 9);
      setMessages((prev) => [...prev, { id: aiMsgId, type: "ai", content: answer }]);

      addNotification("Query successful", "success", 3000);
      onQuerySuccess?.(question, answer);
    } catch (error) {
      console.error("Query error:", error);
      addNotification("Failed to query ERP system", "error", 5000);
      // Add error message
      const errorMsgId = Math.random().toString(36).substr(2, 9);
      setMessages((prev) => [
        ...prev,
        {
          id: errorMsgId,
          type: "ai",
          content: "Sorry, I encountered an error processing your query.",
        },
      ]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const renderMessageContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return (
        <ul className="space-y-1">
          {content.map((item, idx) => (
            <li key={idx} className="text-sm">
              • {item}
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-sm">{content}</p>;
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">ERP Assistant</h2>
        <p className="text-sm text-muted-foreground">Ask questions about your ERP data</p>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-muted-foreground">
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">Start by asking a question about your ERP data</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.type === "user"
                  ? "chat-bubble-user"
                  : "chat-bubble-ai"
              }`}
            >
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about highest revenue, billing flow, etc..."
            disabled={loading}
            className="flex-1 dashboard-input text-sm placeholder-muted-foreground disabled:opacity-50"
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="dashboard-button-primary disabled:opacity-50 disabled:cursor-not-allowed p-2"
            title="Send query"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
