import xmltodict
from pathlib import Path
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict, Annotated
from operator import add

# Import DynamicAgent from the agents module
from RAG_Workflow.Agents import DynamicAgent, RouterNode
from RAG_Workflow.Agents.routerNode import router_function

class GraphState(TypedDict):
    input: str
    messages: Annotated[list, add]
    prompt: str  # Add prompt to the state

class GraphFlow:
    def __init__(self, config_path="../../prompt_config/rag_config.poml"):
        # --- Load POML file ---
        config_file = Path(__file__).parent / config_path
        if not config_file.exists():
            print(f"POML config not found: {config_file}")
            raise FileNotFoundError(f"POML config not found: {config_file}")

        with open(config_file, "r") as f:
            raw = f.read()

        # Parse POML
        parsed = xmltodict.parse(raw)
        self.config = parsed.get("graph")
        if not self.config:
            raise ValueError("Invalid POML: missing <graph> root element")

        # --- Extract metadata ---
        meta = self.config.get("meta")
        if not isinstance(meta, dict):
            raise ValueError(f"<meta> section must be a dict, got: {meta}")

        self.initial_node = meta.get("initial_node")
        self.end_node = meta.get("end_node")

        # --- Extract nodes ---
        nodes = self.config.get("nodes", {}).get("node")
        if not nodes:
            raise ValueError("No nodes found in POML")
        self.nodes = nodes if isinstance(nodes, list) else [nodes]

        # --- Extract flow lines ---
        flow_raw = self.config.get("flow")
        if isinstance(flow_raw, dict) and "#text" in flow_raw:
            self.flow = flow_raw["#text"].splitlines()
        elif isinstance(flow_raw, str):
            self.flow = flow_raw.splitlines()
        else:
            self.flow = []

        # --- Prepare DynamicAgents for each node ---
        self.dynamic_agents = {}
        self.node_prompts = {}  # Store prompt for each node
        for node in self.nodes:
            node_id = node.get("@id")
            node_type = node.get("@type", "generic")
            system_prompt = node.get("system", "")
            self.node_prompts[node_id] = system_prompt
            # For demonstration, use node_id as name, system_prompt as description, and a dummy tools dict
            # In a real scenario, tools should be meaningful functions or objects
            initial_state = {"input": "", "messages": [], "prompt": system_prompt}
            self.dynamic_agents[node_id] = DynamicAgent(initial_state)

        # --- Initialize workflow ---
        self.workflow = StateGraph(GraphState)
        self._build_graph()

    def make_agent(self, node_id, system_prompt, node_type):
        def agent(state):
            # Always pass the current state to the agent, updating prompt and messages as needed
            node_prompt = self.node_prompts.get(node_id, "")
            state_with_prompt = dict(state)
            state_with_prompt["prompt"] = node_prompt

            if node_type == "router":
                # Pass the state as-is to RouterNode
                router = RouterNode(state_with_prompt)
                return router(state_with_prompt)
            else:
                dynamic_agent = self.dynamic_agents.get(node_id)
                if dynamic_agent:
                    # Pass the state (with updated prompt) to the DynamicAgent
                    dynamic_agent.state = state_with_prompt
                    result = dynamic_agent.run()
                    # Update messages in the state
                    messages = list(state.get("messages", []))
                    messages.append(f"[{node_id}] {result}")
                    return {"messages": messages, "prompt": node_prompt}
                else:
                    messages = list(state.get("messages", []))
                    messages.append(f"[{node_id}] No DynamicAgent found")
                    return {"messages": messages, "prompt": node_prompt}

        return agent

    def _build_graph(self):
        # --- Add nodes dynamically ---
        for node in self.nodes:
            node_id = node.get("@id")
            node_type = node.get("@type", "generic")
            system_prompt = node.get("system", "")
            self.workflow.add_node(node_id, self.make_agent(node_id, system_prompt, node_type))

        # --- Add edges dynamically ---
        router_nodes = set()
        for node in self.nodes:
            if node.get("@type") == "router":
                router_nodes.add(node.get("@id"))
        
        # Collect possible destinations for router nodes
        router_destinations = {}
        for edge in self.flow:
            if "->" in edge:
                src, dst = [e.strip() for e in edge.split("->")]
                if src in router_nodes:
                    if src not in router_destinations:
                        router_destinations[src] = []
                    router_destinations[src].append(dst)
                else:
                    self.workflow.add_edge(src, dst)
        
        # Add conditional edges for router nodes
        for router_node, destinations in router_destinations.items():
            if router_node == "supervisor":  # Our main router
                self.workflow.add_conditional_edges(
                    router_node,
                    router_function,
                    destinations
                )

        # Entry & exit points
        self.workflow.set_entry_point(self.initial_node)
        self.workflow.set_finish_point(self.end_node)

        # Compile
        self.app = self.workflow.compile()

    def run(self, state: dict):
        # Attach the initial node's prompt to the state before running
        initial_prompt = self.node_prompts.get(self.initial_node, "")
        state_with_prompt = dict(state)
        state_with_prompt["prompt"] = initial_prompt
        return self.app.invoke(state_with_prompt)
