from utils import logger
from .dynamicAgent import DynamicAgent

def router_function(state: dict):
    """
    Router function for the supervisor node.
    Determines which agent to route to based on input content,
    following the logic in the rag_config.poml.
    """
    user_input = state.get("input", "").lower()
    print("\033[92mstate:\033[0m", state)
    logger.info(f"RouterNode: processing input=", state)

    # Supervisor node logic as per rag_config.poml:
    # - If the query is related to finance, tax, or account details → return "finance_agent"
    # - If the query is related to personal info or document-related data → return "my_docs"
    # - Otherwise → return "fallback_agent"
    getDynamicAgent = DynamicAgent(state)
    goto = getDynamicAgent.run()
    logger.info(f"RouterNode: routing to {goto}")
    return goto

# For backward compatibility, keep the class but make it simpler
class RouterNode:
    def __init__(self, state: dict):
        self.state = state

    def __call__(self, state: dict):
        user_input = state.get("input", "")
        logger.info(f"RouterNode: supervisor processing input='{user_input}'")
        return {"messages": [f"[supervisor] Routing request: {user_input}"]}