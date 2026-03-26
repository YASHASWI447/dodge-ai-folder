import os
import json
import pandas as pd
import networkx as nx
import pickle


# -------------------------------
# LOAD JSONL FILES
# -------------------------------
def load_jsonl_folder(folder_path):
    data = []

    for file in os.listdir(folder_path):
        if file.endswith(".jsonl"):
            full_path = os.path.join(folder_path, file)

            with open(full_path, "r", encoding="utf-8") as f:
                for line in f:
                    data.append(json.loads(line))

    return pd.DataFrame(data)


# -------------------------------
# PATH
# -------------------------------
BASE = "../Data/sap-o2c-data"


# -------------------------------
# LOAD DATA
# -------------------------------
sales_orders = load_jsonl_folder(
    os.path.join(BASE, "sales_order_headers")
)

sales_items = load_jsonl_folder(
    os.path.join(BASE, "sales_order_items")
)

billing_items = load_jsonl_folder(
    os.path.join(BASE, "billing_document_items")
)

billing_headers = load_jsonl_folder(
    os.path.join(BASE, "billing_document_headers")
)


print("Sales Orders:", sales_orders.shape)
print("Sales Items:", sales_items.shape)
print("Billing Items:", billing_items.shape)
print("Billing Headers:", billing_headers.shape)


# -------------------------------
# CREATE GRAPH
# -------------------------------
G = nx.DiGraph()


def node_id(t, i):
    return f"{t}_{i}"


# -------------------------------
# ADD SALES ORDER NODES
# -------------------------------
for _, row in sales_orders.iterrows():
    so = row["salesOrder"]

    G.add_node(
        node_id("SalesOrder", so),
        type="SalesOrder",
        customer=row["soldToParty"],
        amount=row["totalNetAmount"]
    )


# -------------------------------
# ADD CUSTOMER NODES
# -------------------------------
for _, row in sales_orders.iterrows():
    customer = row["soldToParty"]
    so = row["salesOrder"]

    G.add_node(
        node_id("Customer", customer),
        type="Customer"
    )

    # EDGE: Customer → SalesOrder
    G.add_edge(
        node_id("Customer", customer),
        node_id("SalesOrder", so),
        relation="PLACED_ORDER"
    )


# -------------------------------
# ADD SALES ORDER ITEM NODES
# -------------------------------
for _, row in sales_items.iterrows():
    so = row["salesOrder"]
    item = row["salesOrderItem"]

    so_item_id = f"{so}_{item}"

    G.add_node(
        node_id("SalesOrderItem", so_item_id),
        type="SalesOrderItem",
        material=row["material"],
        quantity=row["requestedQuantity"]
    )

    # EDGE: SalesOrder → SalesOrderItem
    G.add_edge(
        node_id("SalesOrder", so),
        node_id("SalesOrderItem", so_item_id),
        relation="HAS_ITEM"
    )


# -------------------------------
# ADD BILLING ITEM NODES
# -------------------------------
for _, row in billing_items.iterrows():
    bill = row["billingDocument"]
    bill_item = row["billingDocumentItem"]

    ref_so = row["referenceSdDocument"]
    ref_item = row["referenceSdDocumentItem"]

    bill_item_id = f"{bill}_{bill_item}"
    so_item_id = f"{ref_so}_{ref_item}"

    # find sold-to/customer from billing headers when available
    sold_to = None
    try:
        sold_to = billing_headers.loc[billing_headers["billingDocument"] == bill, "soldToParty"].tolist()
        sold_to = sold_to[0] if sold_to else None
    except Exception:
        sold_to = None

    G.add_node(
        node_id("BillingItem", bill_item_id),
        type="BillingItem",
        material=row.get("material"),
        amount=row.get("netAmount"),
        sold_to=sold_to
    )

    # If sold_to found, ensure Customer node exists and link Customer -> BillingItem
    if sold_to:
        cust_node = node_id("Customer", sold_to)
        if cust_node not in G:
            G.add_node(cust_node, type="Customer")
        # EDGE: Customer → BillingItem (direct billing link)
        G.add_edge(cust_node, node_id("BillingItem", bill_item_id), relation="BILLED_TO")

    # EDGE: SalesOrderItem → BillingItem
    # Ensure SalesOrderItem exists (some billing entries reference SO items not present in sales_items)
    so_node = node_id("SalesOrderItem", so_item_id)
    if so_node not in G:
        # add a minimal SalesOrderItem node so edges are consistent
        G.add_node(
            so_node,
            type="SalesOrderItem",
            material=row.get("material"),
            quantity=row.get("quantity")
        )
        # try to link SalesOrder -> SalesOrderItem when possible
        cand_so = node_id("SalesOrder", ref_so)
        if cand_so in G:
            G.add_edge(cand_so, so_node, relation="HAS_ITEM")

    G.add_edge(
        so_node,
        node_id("BillingItem", bill_item_id),
        relation="BILLED_AS"
    )


# -------------------------------
# PRINT GRAPH STATS
# -------------------------------
print("\nGraph Built Successfully")
print("Total Nodes:", G.number_of_nodes())
print("Total Edges:", G.number_of_edges())


# -------------------------------
# SAVE GRAPH
# -------------------------------
with open("graph.pkl", "wb") as f:
    pickle.dump(G, f)

print("\nGraph saved as graph.pkl")