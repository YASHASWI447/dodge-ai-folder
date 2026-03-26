#  ERP Incident Intelligence Assistant

An AI-powered enterprise automation dashboard that enables intelligent querying, tracing, and analytics over SAP Order-to-Cash process data using Knowledge Graphs and Natural Language Querying.

---

## 📌 Project Overview

Enterprise ERP systems like SAP generate highly interconnected transactional data across customers, sales orders, items, billing documents, and revenue flows.

This project builds a **Graph-based AI Assistant** that allows users to:

* Trace end-to-end Order-to-Cash flows
* Identify highest billed products
* Detect customers with maximum orders
* Analyze revenue leaders
* Visualize ERP relationships as an interactive knowledge graph

The system reduces manual analysis effort and enables faster enterprise decision-making.

---

##  Architecture

```
Frontend (React Dashboard)
        ↓
FastAPI Backend (AI + Graph Engine)
        ↓
Knowledge Graph (NetworkX)
        ↓
SAP O2C Dataset (JSONL Files)
```

---

## ⚙️ Tech Stack

### Frontend

* React
* Axios
* React Force Graph
* CSS Grid Dashboard Layout

### Backend

* FastAPI
* NetworkX
* Python
* Uvicorn

### Data

* SAP Order-to-Cash dataset
* JSONL transactional data

---

##  Knowledge Graph Design

Entities modeled as graph nodes:

* Customer
* SalesOrder
* SalesOrderItem
* BillingItem

Relationships:

* Customer → PLACED_ORDER → SalesOrder
* SalesOrder → HAS_ITEM → SalesOrderItem
* SalesOrderItem → BILLED_AS → BillingItem

This enables multi-hop reasoning and traceability.

---

##  AI Query Engine

The backend supports structured reasoning queries:

### Supported Queries

* Which product has highest billing
* Which customer has most orders
* Which customer generated highest revenue
* Trace full order to billing flow

Guardrails ensure only ERP dataset related questions are answered.

---

## Dashboard Features

* KPI Cards (Billing count, Customer count, Revenue leader)
* Natural language query assistant
* Query history panel
* Interactive ERP graph visualization
* Enterprise layout inspired by SAP Fiori / PowerBI

---

##  How to Run Project

### Backend

```
cd Backend
pip install fastapi uvicorn networkx pandas
uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

### Frontend

```
cd erp-dashboard
npm install
npm start
```

Frontend runs at:

```
http://localhost:3000
```

---

##  Future Improvements

* Real LLM integration for semantic querying
* SAP incident prediction models
* Revenue anomaly detection
* Graph embeddings & vector search
* Role-based dashboards
* Databricks / Azure integration


##  Vision

To build an enterprise-grade AI platform that automates ERP analytics, incident resolution, and configuration intelligence using knowledge graphs and AI reasoning.
