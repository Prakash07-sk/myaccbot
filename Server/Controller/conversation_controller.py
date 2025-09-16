
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
            # Optionally, you could use payload.conversation_history for context
            result_data = graph_workflow.run({"input": user_query, "messages": []})
            print("\033[92mRAG Workflow Result:\033[0m", result_data)
            
            # Extract the final message from the workflow
            workflow_output = result_data.get("messages", [])[-1] if result_data.get("messages") else "No output"
            # Call the async ChromaDB query_with_prompt function
            result = await query_with_prompt(user_query)

            # Return the answer and sources as API response
            return {
                "answer": result.get("answer", ""),
                "sources": result.get("sources", [])
            }
        except Exception as e:
            raise Exception(f"An error occurred in chat_data: {str(e)}")

controller = ConversationController()