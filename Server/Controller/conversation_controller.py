
import asyncio
from RAG_Workflow.Graphs.graph_flow import GraphFlow
from database.chroma_setup_database import query_with_prompt

# Initialize the graph workflow once at module level
graph_workflow = GraphFlow()

class ConversationController:

    async def chat_data(self, payload):
        try:
            # Extract the latest user query and conversation history
            user_query = payload.query
            # Run the workflow to get routing decision
            result_data = graph_workflow.run({"input": user_query, "messages": []})
            print("\033[92mRAG Workflow Result:\033[0m", result_data)
            
            # Extract the routing decision from the workflow
            workflow_messages = result_data.get("messages", [])
            if workflow_messages:
                # Get the last message which should contain the routing decision or final response
                final_message = workflow_messages[-1]
                print(f"\033[94mFinal workflow message:\033[0m {final_message}")
                
                # If this looks like a routing decision, handle it appropriately
                if any(agent in str(final_message).lower() for agent in ['finance_agent', 'my_docs', 'fallback_agent']):
                    # This is a routing decision, now handle based on the agent
                    if 'my_docs' in str(final_message).lower():
                        # Query user documents
                        result = await query_with_prompt(user_query)
                        return {
                            "answer": result.get("answer", ""),
                            "sources": result.get("sources", [])
                        }
                    elif 'finance_agent' in str(final_message).lower():
                        # Handle finance queries (could be expanded later)
                        return {
                            "answer": "I can help with finance-related queries. However, the finance agent is not fully implemented yet. Please try asking about your documents instead.",
                            "sources": []
                        }
                    else:  # fallback_agent
                        # Handle general queries
                        return {
                            "answer": f"I'm a financial chatbot assistant. I can help you with finance-related questions and search through your uploaded documents. For the query '{user_query}', I don't have specific information, but feel free to ask about your financial documents or tax-related questions.",
                            "sources": []
                        }
                else:
                    # If it's not a routing decision, treat it as a direct response
                    return {
                        "answer": str(final_message),
                        "sources": []
                    }
            else:
                # No workflow output, use fallback
                return {
                    "answer": "I'm sorry, I couldn't process your request. Please try rephrasing your question.",
                    "sources": []
                }
                
        except Exception as e:
            print(f"\033[91mError in chat_data:\033[0m {str(e)}")
            raise Exception(f"An error occurred in chat_data: {str(e)}")

controller = ConversationController()