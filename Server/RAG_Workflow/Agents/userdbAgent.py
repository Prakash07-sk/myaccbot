from database.chroma_setup_database import query_with_prompt
class UserdbAgent:
    """
    UserdbAgent receives a state dict, extracts the user input,
    and passes it to the chromadb_database for further processing.
    """

    def __init__(self):
        """
        Initialize the agent with a reference to the chromadb_database.
        """
        self.chromadb_database = query_with_prompt

    
    async def __call__(self, state: dict):
        """
        Receives the state, extracts the user input, and passes it to the chromadb_database.
        Returns the result from the database.
        """
        user_input = state.get("input", "")
        # Pass the user input to the chromadb_database and get the result
        result = await self.run(user_input)
        return {"messages": [result]}

        
    async def run(self, user_input: str):
            """
            Receives the user input, and passes it to the chromadb_database.
            Returns the result from the database.
            """
            result = await self.chromadb_database(user_input)
            return result
