import { RequestHandler } from "express";

export const handleQuery: RequestHandler = (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  // Mock responses based on question content
  const lowerQuestion = question.toLowerCase();

  let answer: string | string[];

  if (
    lowerQuestion.includes("highest revenue") ||
    lowerQuestion.includes("top revenue")
  ) {
    answer = [
      "Customer_320000083 generated revenue 55337.76",
      "Customer_320000082 generated revenue 4769.30",
      "Customer_320000081 generated revenue 3452.15",
    ];
  } else if (lowerQuestion.includes("billing")) {
    answer = [
      "Total billing items: 1250",
      "Pending billing items: 145",
      "Completed billing items: 1105",
    ];
  } else if (lowerQuestion.includes("order")) {
    answer = [
      "Total sales orders: 450",
      "Orders from Customer_320000083: 85",
      "Average order value: 12,345.67",
    ];
  } else if (lowerQuestion.includes("customer")) {
    answer = [
      "Total active customers: 320",
      "Customers with pending orders: 42",
      "Top customer by transaction count: Customer_320000001",
    ];
  } else {
    answer =
      "I found relevant information in the ERP system. To get more specific results, try asking about customers, billing items, sales orders, or revenue metrics.";
  }

  res.json({ answer });
};
