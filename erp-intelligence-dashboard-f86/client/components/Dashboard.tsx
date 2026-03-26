import React, { useRef, useState } from "react";
import { ChatPanel } from "./ChatPanel";
import { GraphPanel } from "./GraphPanel";
import { KpiCards } from "./KpiCards";
import { HistoryPanel } from "./HistoryPanel";
import { Zap } from "lucide-react";

export const Dashboard: React.FC = () => {
  const historyPanelRef = useRef<any>(null);
  const [queryCount, setQueryCount] = useState(0);

  const handleQuerySuccess = (question: string, answer: string | string[]) => {
    // Add to history
    if ((window as any).__historyAddItem) {
      (window as any).__historyAddItem(question, answer);
      setQueryCount((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ERP Incident Intelligence Dashboard</h1>
              <p className="text-sm opacity-90">AI-powered insights into your SAP Order-to-Cash flow</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">Key Performance Indicators</h2>
            <p className="text-sm text-muted-foreground">Real-time metrics from your ERP system</p>
          </div>
          <KpiCards />
        </section>

        {/* Main Grid Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Chat Panel */}
          <div className="lg:col-span-1 min-h-96 lg:min-h-screen lg:sticky lg:top-6">
            <ChatPanel onQuerySuccess={handleQuerySuccess} />
          </div>

          {/* Center: Graph Visualization */}
          <div className="lg:col-span-2 min-h-96">
            <GraphPanel />
          </div>

          {/* Right Sidebar: Query History */}
          <div className="lg:col-span-1 min-h-96">
            <HistoryPanel onQuerySuccess={handleQuerySuccess} />
          </div>
        </section>

        {/* Footer */}
        <section className="border-t border-border pt-6 mt-12">
          <div className="text-center text-sm text-muted-foreground">
            <p>ERP Intelligence Dashboard powered by AI Graph Analysis</p>
            <p className="mt-1">Total queries executed: {queryCount}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
