import React, { useEffect, useState } from "react";
import { Clock, Trash2 } from "lucide-react";

interface HistoryItem {
  id: string;
  question: string;
  answer: string | string[];
  timestamp: Date;
}

interface HistoryPanelProps {
  onQuerySuccess?: (question: string, answer: string | string[]) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onQuerySuccess }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("queryHistory");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(
          parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        );
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    }
  }, []);

  const addToHistory = (question: string, answer: string | string[]) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      question,
      answer,
      timestamp: new Date(),
    };

    const updated = [newItem, ...history];
    setHistory(updated);
    localStorage.setItem("queryHistory", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("queryHistory");
  };

  const removeItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("queryHistory", JSON.stringify(updated));
  };

  // Expose addToHistory to parent
  useEffect(() => {
    (window as any).__historyAddItem = addToHistory;
  }, [history]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const renderAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.slice(0, 2).join("; ") + (answer.length > 2 ? "..." : "");
    }
    return answer.substring(0, 100) + (answer.length > 100 ? "..." : "");
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Query History</h2>
          <p className="text-sm text-muted-foreground">{history.length} queries</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No query history</p>
              <p className="text-sm mt-1">Your queries will appear here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {item.question}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {renderAnswer(item.answer)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(item.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
