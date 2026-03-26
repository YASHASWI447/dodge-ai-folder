from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pickle
import os
import time
import networkx as nx

# ---------------- FASTAPI INIT ----------------
app = FastAPI()

# Allow frontend dev servers to call the API during development
# Accept any localhost origin to avoid mismatched dev ports (3000/3001/3002...)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- LOAD GRAPH ----------------
def load_graph(path="graph.pkl", retries: int = 5, delay: float = 1.0):
    """Attempt to load `graph.pkl` safely.

    - Retries on common unpickle errors (file being written).
    - If missing or final retry fails, attempts to import `graph_builder`
      (which rebuilds the graph) and reload.
    - Falls back to an empty `networkx.DiGraph()` to keep the API running.
    """
    for attempt in range(retries):
        try:
            with open(path, "rb") as f:
                return pickle.load(f)
        except (pickle.UnpicklingError, EOFError):
            # likely being written/corrupted; wait and retry
            if attempt < retries - 1:
                time.sleep(delay)
                continue
            # last resort: try rebuilding via graph_builder
            try:
                import graph_builder  # module builds and writes graph.pkl on import
                with open(path, "rb") as f:
                    return pickle.load(f)
            except Exception:
                return nx.DiGraph()
        except FileNotFoundError:
            # try to build graph if missing
            try:
                import graph_builder
                with open(path, "rb") as f:
                    return pickle.load(f)
            except Exception:
                return nx.DiGraph()
        except Exception:
            return nx.DiGraph()


ROOT_DIR = os.path.dirname(__file__)
G = load_graph(path=os.path.join(ROOT_DIR, "graph.pkl"))

# ---------------- REQUEST MODEL ----------------
class QueryRequest(BaseModel):
    question: str


# ---------------- HOME ----------------
@app.get("/")
def home():
    return {"message": "Graph API Running 🚀"}


# ---------------- GRAPH API ----------------
@app.get("/graph")
def get_graph():

    import os
    import pickle

    path = os.path.join(os.path.dirname(__file__), "graph.pkl")

    print("Loading graph from:", path)

    with open(path, "rb") as f:
        G = pickle.load(f)

    print("Graph nodes:", G.number_of_nodes())

    nodes = []
    links = []

    for n in G.nodes():
        nodes.append({"id": n})

    for u, v in G.edges():
        links.append({"source": u, "target": v})

    return {
        "nodes": nodes,
        "links": links
    }


# ---------------- QUERY API ----------------
@app.post("/query")
def query_graph(req: QueryRequest):

    try:

        question = req.question.lower()
        print("Received query:", question)

        allowed_words = [
            "order", "billing", "customer",
            "sales", "invoice", "product",
            "trace", "revenue", "sold"
        ]

        if not any(word in question for word in allowed_words):
            return {"answer": "Only dataset related questions allowed"}

        # ⭐ HIGHEST BILLING PRODUCTS
        if "highest billing" in question:

            billing_count = {}

            for node, data in G.nodes(data=True):
                if data.get("type") == "BillingItem":
                    material = data.get("material")
                    billing_count[material] = billing_count.get(material, 0) + 1

            top = sorted(
                billing_count.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]

            readable = [
                f"Material {m} billed {c} times"
                for m, c in top
            ]

            return {"answer": readable}

        # ⭐ CUSTOMER WITH MOST ORDERS
        if "most order" in question:

            customer_orders = {}

            for node, data in G.nodes(data=True):
                if data.get("type") == "SalesOrder":

                    customers = list(G.predecessors(node))

                    for cust in customers:
                        customer_orders[cust] = customer_orders.get(cust, 0) + 1

            top = sorted(
                customer_orders.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]

            readable = [
                f"{cust} has {count} orders"
                for cust, count in top
            ]

            return {"answer": readable}

        # ⭐ CUSTOMER WITH HIGHEST REVENUE
        if "revenue" in question:

            customer_revenue = {}

            for u, v, data in G.edges(data=True):

                # direct billing mapping
                if data.get("relation") == "BILLED_TO":

                    customer = u
                    billing_node = v

                    billing_data = G.nodes[billing_node]

                    amount = (
                        billing_data.get("amount")
                        or billing_data.get("netAmount")
                        or 0
                    )

                    try:
                        amount = float(amount)
                    except:
                        amount = 0

                    customer_revenue[customer] = (
                        customer_revenue.get(customer, 0) + amount
                    )

            if len(customer_revenue) == 0:
                return {"answer": "Revenue data not found"}

            top = sorted(
                customer_revenue.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]

            readable = [
                f"{cust} generated revenue {round(rev,2)}"
                for cust, rev in top
            ]

            return {"answer": readable}
        # ⭐ TRACE BILLING FLOW
        if "trace" in question:

            flows = []

            for u, v, data in G.edges(data=True):
                if data.get("relation") == "BILLED_AS":
                    flows.append(f"{u} → {v}")

            return {"answer": flows[:15]}

        # ⭐ MOST SOLD PRODUCT (WOW QUERY)
        if "sold" in question or "top product" in question:

            product_count = {}

            for node, data in G.nodes(data=True):

                if data.get("type") == "SalesOrderItem":
                    material = data.get("material")

                    product_count[material] = product_count.get(material, 0) + 1

            top = sorted(
                product_count.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]

            readable = [
                f"Material {m} sold {c} times"
                for m, c in top
            ]

            return {"answer": readable}

        return {"answer": "Query not supported"}

    except Exception as e:
        return {"answer": str(e)}


# ---------------- STATIC FRONTEND ----------------
# Serve a simple prebuilt frontend placed in `../simple_frontend`.
# API routes above take precedence; static files are served for other paths.
try:
    app.mount("/", StaticFiles(directory="../simple_frontend", html=True), name="spa")
except Exception:
    # In some environments the relative path may fail; ignore so API stays up
    pass