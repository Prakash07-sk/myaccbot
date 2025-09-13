
import asyncio
from database.chroma_setup_database import query_with_prompt


class ConversationController:

    async def chat_data(self, payload):
        try:
            # Extract the latest user query and conversation history
            user_query = payload.query
            # Optionally, you could use payload.conversation_history for context

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