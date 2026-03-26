import { RequestHandler } from "express";

export const handleGraph: RequestHandler = (_req, res) => {
  // Mock graph data representing SAP Order-to-Cash flow
  const graphData = {
    nodes: [
      // Customers
      { id: "Customer_320000083", type: "Customer", data: { name: "ACME Corp" } },
      { id: "Customer_320000082", type: "Customer", data: { name: "TechFlow Inc" } },
      { id: "Customer_320000081", type: "Customer", data: { name: "Global Solutions" } },
      { id: "Customer_320000080", type: "Customer", data: { name: "Future Enterprises" } },

      // Sales Orders
      { id: "SalesOrder_500000001", type: "SalesOrder", data: {} },
      { id: "SalesOrder_500000002", type: "SalesOrder", data: {} },
      { id: "SalesOrder_500000003", type: "SalesOrder", data: {} },
      { id: "SalesOrder_500000004", type: "SalesOrder", data: {} },
      { id: "SalesOrder_500000005", type: "SalesOrder", data: {} },

      // Sales Order Items
      { id: "SalesOrderItem_600000001", type: "SalesOrderItem", data: {} },
      { id: "SalesOrderItem_600000002", type: "SalesOrderItem", data: {} },
      { id: "SalesOrderItem_600000003", type: "SalesOrderItem", data: {} },
      { id: "SalesOrderItem_600000004", type: "SalesOrderItem", data: {} },
      { id: "SalesOrderItem_600000005", type: "SalesOrderItem", data: {} },
      { id: "SalesOrderItem_600000006", type: "SalesOrderItem", data: {} },
      { id: "SalesOrderItem_600000007", type: "SalesOrderItem", data: {} },
      { id: "SalesOrderItem_600000008", type: "SalesOrderItem", data: {} },

      // Billing Items
      { id: "BillingItem_700000001", type: "BillingItem", data: {} },
      { id: "BillingItem_700000002", type: "BillingItem", data: {} },
      { id: "BillingItem_700000003", type: "BillingItem", data: {} },
      { id: "BillingItem_700000004", type: "BillingItem", data: {} },
      { id: "BillingItem_700000005", type: "BillingItem", data: {} },
      { id: "BillingItem_700000006", type: "BillingItem", data: {} },
      { id: "BillingItem_700000007", type: "BillingItem", data: {} },
      { id: "BillingItem_700000008", type: "BillingItem", data: {} },
      { id: "BillingItem_700000009", type: "BillingItem", data: {} },
      { id: "BillingItem_700000010", type: "BillingItem", data: {} },
    ],
    edges: [
      // Customer to Sales Orders
      {
        source: "Customer_320000083",
        target: "SalesOrder_500000001",
        relation: "PLACED_ORDER",
      },
      {
        source: "Customer_320000083",
        target: "SalesOrder_500000002",
        relation: "PLACED_ORDER",
      },
      {
        source: "Customer_320000082",
        target: "SalesOrder_500000003",
        relation: "PLACED_ORDER",
      },
      {
        source: "Customer_320000081",
        target: "SalesOrder_500000004",
        relation: "PLACED_ORDER",
      },
      {
        source: "Customer_320000080",
        target: "SalesOrder_500000005",
        relation: "PLACED_ORDER",
      },

      // Sales Orders to Sales Order Items
      {
        source: "SalesOrder_500000001",
        target: "SalesOrderItem_600000001",
        relation: "CONTAINS_ITEM",
      },
      {
        source: "SalesOrder_500000001",
        target: "SalesOrderItem_600000002",
        relation: "CONTAINS_ITEM",
      },
      {
        source: "SalesOrder_500000002",
        target: "SalesOrderItem_600000003",
        relation: "CONTAINS_ITEM",
      },
      {
        source: "SalesOrder_500000002",
        target: "SalesOrderItem_600000004",
        relation: "CONTAINS_ITEM",
      },
      {
        source: "SalesOrder_500000003",
        target: "SalesOrderItem_600000005",
        relation: "CONTAINS_ITEM",
      },
      {
        source: "SalesOrder_500000004",
        target: "SalesOrderItem_600000006",
        relation: "CONTAINS_ITEM",
      },
      {
        source: "SalesOrder_500000005",
        target: "SalesOrderItem_600000007",
        relation: "CONTAINS_ITEM",
      },
      {
        source: "SalesOrder_500000005",
        target: "SalesOrderItem_600000008",
        relation: "CONTAINS_ITEM",
      },

      // Sales Order Items to Billing Items
      {
        source: "SalesOrderItem_600000001",
        target: "BillingItem_700000001",
        relation: "BILLED_AS",
      },
      {
        source: "SalesOrderItem_600000001",
        target: "BillingItem_700000002",
        relation: "BILLED_AS",
      },
      {
        source: "SalesOrderItem_600000002",
        target: "BillingItem_700000003",
        relation: "BILLED_AS",
      },
      {
        source: "SalesOrderItem_600000003",
        target: "BillingItem_700000004",
        relation: "BILLED_AS",
      },
      {
        source: "SalesOrderItem_600000004",
        target: "BillingItem_700000005",
        relation: "BILLED_AS",
      },
      {
        source: "SalesOrderItem_600000005",
        target: "BillingItem_700000006",
        relation: "BILLED_AS",
      },
      {
        source: "SalesOrderItem_600000006",
        target: "BillingItem_700000007",
        relation: "BILLED_AS",
      },
      {
        source: "SalesOrderItem_600000007",
        target: "BillingItem_700000008",
        relation: "BILLED_AS",
      },
      {
        source: "SalesOrderItem_600000008",
        target: "BillingItem_700000009",
        relation: "BILLED_AS",
      },
      {
        source: "SalesOrderItem_600000008",
        target: "BillingItem_700000010",
        relation: "BILLED_AS",
      },
    ],
  };

  res.json(graphData);
};
