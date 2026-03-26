import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNotification } from "@/context/NotificationContext";

interface Node {
  id: string;
  type: string;
  data?: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface Edge {
  source: string;
  target: string;
  relation?: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export const GraphPanel: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Map<string, Node>>(new Map());
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await axios.get("/graph");
        setGraphData(response.data);
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
        addNotification("Failed to load graph data", "error", 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [addNotification]);

  const getNodeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      Customer: "#0066cc",
      SalesOrder: "#2d9d78",
      SalesOrderItem: "#ff9500",
      BillingItem: "#cc0000",
    };
    return colorMap[type] || "#999";
  };

  // Simple force-directed layout simulation
  useEffect(() => {
    if (!graphData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Initialize node positions if not set
    const nodes = graphData.nodes.map((node, idx) => ({
      ...node,
      x: node.x ?? Math.random() * width,
      y: node.y ?? Math.random() * height,
      vx: node.vx ?? 0,
      vy: node.vy ?? 0,
    }));

    nodesRef.current.clear();
    nodes.forEach((node) => nodesRef.current.set(node.id, node));

    const edges = graphData.edges;

    // Animation loop with simple force simulation
    let running = true;
    const animate = () => {
      if (!running) return;

      // Clear canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Apply forces
      nodes.forEach((node) => {
        node.vx = node.vx || 0;
        node.vy = node.vy || 0;

        // Gravity to center
        const dx = width / 2 - node.x;
        const dy = height / 2 - node.y;
        node.vx += dx * 0.0001;
        node.vy += dy * 0.0001;

        // Repulsion between nodes
        nodes.forEach((other) => {
          if (node.id === other.id) return;
          const ddx = node.x - other.x;
          const ddy = node.y - other.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
          const force = 500 / (dist * dist);
          node.vx += (ddx / dist) * force * 0.0001;
          node.vy += (ddy / dist) * force * 0.0001;
        });

        // Damping
        node.vx *= 0.98;
        node.vy *= 0.98;

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounds checking
        if (node.x < 20) node.x = 20;
        if (node.x > width - 20) node.x = width - 20;
        if (node.y < 20) node.y = 20;
        if (node.y > height - 20) node.y = height - 20;
      });

      // Draw edges
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 1;
      edges.forEach((edge) => {
        const source = nodesRef.current.get(edge.source);
        const target = nodesRef.current.get(edge.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach((node) => {
        const size = hoveredNode === node.id ? 8 : 5;
        ctx.fillStyle = getNodeColor(node.type);
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw label for hovered node
        if (hoveredNode === node.id) {
          ctx.fillStyle = "#333";
          ctx.font = "11px Inter";
          ctx.textAlign = "center";
          ctx.fillText(node.id, node.x, node.y - 12);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Handle mouse move for hover
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let hovered: string | null = null;
      nodes.forEach((node) => {
        const dx = node.x - mx;
        const dy = node.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) {
          hovered = node.id;
        }
      });

      setHoveredNode(hovered);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      running = false;
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [graphData, hoveredNode]);

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">ERP Graph Visualization</h2>
        <p className="text-sm text-muted-foreground">Interactive Order-to-Cash flow graph</p>
      </div>

      {/* Graph Area */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading graph data...</p>
            </div>
          </div>
        ) : graphData && graphData.nodes.length > 0 ? (
          <>
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-default"
            />
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-background/95 border border-border rounded-lg p-3 shadow-sm">
              <p className="text-xs font-semibold text-foreground mb-2">Legend</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#0066cc" }} />
                  <span>Customer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#2d9d78" }} />
                  <span>SalesOrder</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff9500" }} />
                  <span>SalesOrderItem</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#cc0000" }} />
                  <span>BillingItem</span>
                </div>
              </div>
            </div>
            {hoveredNode && (
              <div className="absolute top-4 right-4 bg-background/95 border border-border rounded-lg px-3 py-2 shadow-sm max-w-xs">
                <p className="text-xs font-semibold text-foreground">Node Info</p>
                <p className="text-xs text-muted-foreground break-all">{hoveredNode}</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-muted-foreground">
              <p className="font-medium">No graph data available</p>
              <p className="text-sm mt-1">Graph data will appear once loaded</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphPanel;
