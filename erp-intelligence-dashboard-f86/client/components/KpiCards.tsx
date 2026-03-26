import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNotification } from "@/context/NotificationContext";
import { TrendingUp, Users, DollarSign } from "lucide-react";

interface KpiData {
  totalBillingItems: number;
  activeCustomers: number;
  topRevenueCustomer: string;
}

export const KpiCards: React.FC = () => {
  const [kpiData, setKpiData] = useState<KpiData>({
    totalBillingItems: 0,
    activeCustomers: 0,
    topRevenueCustomer: "",
  });
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        // Fetch graph data for counting billing items and customers
        const graphResponse = await axios.get("/graph");
        const { nodes } = graphResponse.data;

        const billingItems = nodes.filter(
          (n: any) => n.type === "BillingItem"
        ).length;
        const customers = nodes.filter((n: any) => n.type === "Customer").length;

        // Fetch top revenue customer
        let topCustomer = "N/A";
        try {
          const queryResponse = await axios.post("/query", {
            question: "Which customer generated highest revenue",
          });
          const answer = queryResponse.data.answer;
          
          // Parse the answer to extract customer name
          if (Array.isArray(answer) && answer.length > 0) {
            const firstAnswer = answer[0];
            const match = firstAnswer.match(/^(Customer_\d+)/);
            if (match) {
              topCustomer = match[1];
            }
          } else if (typeof answer === "string") {
            const match = answer.match(/^(Customer_\d+)/);
            if (match) {
              topCustomer = match[1];
            }
          }
        } catch {
          // If query fails, keep N/A
        }

        setKpiData({
          totalBillingItems: billingItems,
          activeCustomers: customers,
          topRevenueCustomer: topCustomer,
        });
      } catch (error) {
        console.error("Failed to fetch KPI data:", error);
        addNotification("Failed to load KPI data", "error", 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchKpiData();
  }, [addNotification]);

  const kpis = [
    {
      label: "Total Billing Items",
      value: kpiData.totalBillingItems,
      icon: DollarSign,
      color: "text-red-600",
    },
    {
      label: "Active Customers",
      value: kpiData.activeCustomers,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Top Revenue Customer",
      value: kpiData.topRevenueCustomer,
      icon: TrendingUp,
      color: "text-green-600",
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="kpi-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="kpi-label">{kpi.label}</p>
                <p className="kpi-value">
                  {loading ? (
                    <span className="text-muted-foreground text-sm">Loading...</span>
                  ) : kpi.isText ? (
                    kpi.value
                  ) : (
                    kpi.value
                  )}
                </p>
              </div>
              <Icon className={`w-6 h-6 ${kpi.color} opacity-70`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiCards;
