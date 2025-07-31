from sys import path
path.append('\\Program Files\\Microsoft.NET\\ADOMD.NET\\160')

from pyadomd import Pyadomd
from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
import os

# -------------------------------
# Configurations
# -------------------------------
conn_str = "Data Source=powerbi://api.powerbi.com/v1.0/myorg/test-workspace;Initial Catalog=PBI_Agent"

# # Google Gemini setup
# os.environ["GOOGLE_API_KEY"] = "AIzaSyDONoOiIGpdtiQIcAmHB6If9ggC6RDhLe8"
# llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0)

# # -------------------------------
# # State definition
# # -------------------------------
# class AgentState(dict):
#     question: str
#     schema: str | None
#     dax_query: str | None
#     result: str | None

# # -------------------------------
# # Step 1: Get semantic model schema
# # -------------------------------
# def fetch_schema(state: AgentState):
#     try:
#         with Pyadomd(conn_str) as conn:
#             with conn.cursor().execute("SELECT * FROM $SYSTEM.TMSCHEMA_COLUMNS") as cur:
#                 rows = cur.fetchall()
#                 schema = "\n".join([f"{row[3]}.{row[2]}" for row in rows])
#         state["schema"] = schema
#         return state
#     except Exception as e:
#         state["schema"] = f"Failed to fetch schema: {e}"
#         return state

# # -------------------------------
# # Step 2: Generate DAX using LLM
# # -------------------------------
# def generate_dax(state: AgentState):
#     prompt = f"""
# You are a DAX expert. Given the following semantic model columns:

# {state['schema']}

# Generate a valid DAX query to answer the user question: "{state['question']}"

# Only return the DAX code, no explanations.
# """
#     dax_query = llm.invoke(prompt).content
#     state["dax_query"] = dax_query
#     return state

# # -------------------------------
# # Step 3: Execute DAX query
# # -------------------------------
# def execute_dax(state: AgentState):
#     try:
#         with Pyadomd(conn_str) as conn:
#             with conn.cursor().execute(state["dax_query"]) as cur:
#                 rows = cur.fetchall()
#                 state["result"] = str(rows)
#     except Exception as e:
#         state["result"] = f"Query failed: {e}"
#     return state

# # -------------------------------
# # Step 4: Finalize result
# # -------------------------------
# def finalize(state: AgentState):
#     state["answer"] = state["result"]
#     return state

# # -------------------------------
# # Build LangGraph workflow
# # -------------------------------
# graph = StateGraph(AgentState)

# graph.add_node("fetch_schema", fetch_schema)
# graph.add_node("generate_dax", generate_dax)
# graph.add_node("execute_dax", execute_dax)
# graph.add_node("finalize", finalize)

# graph.add_edge(START, "fetch_schema")
# graph.add_edge("fetch_schema", "generate_dax")
# graph.add_edge("generate_dax", "execute_dax")
# graph.add_edge("execute_dax", "finalize")
# graph.add_edge("finalize", END)

# app = graph.compile()

# # -------------------------------
# # Run Example
# # -------------------------------
# question = "List all the tables present."
# result = app.invoke({"question": question})
# print("\nAnswer:", result["answer"])

query = "SELECT * FROM $SYSTEM.TMSCHEMA_COLUMNS"

with Pyadomd(conn_str) as conn:
    cur = conn.cursor().execute(query)
    columns = [col[0] for col in cur.description]
    rows = cur.fetchall()
    # for row in rows:
    #     row_dict = dict(zip(columns, row))
    #     print(row_dict)
        # print(f"{row_dict['Name']}: {row_dict['Expression']}\n")

import pandas as pd
df = pd.DataFrame(rows, columns=columns)

# Filter for one specific column
filtered = df[df['ExplicitName'] == 'Sales']
print(filtered)