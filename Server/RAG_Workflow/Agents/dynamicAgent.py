

from database.llm_setup import LLMContainer

class DynamicAgent:
    def __init__(self, state):
        self.state = state
        self.llm = LLMContainer()

    def run(self):
        print("\033[94m[DynamicAgent] State:\033[0m", self.state)
        
        # Get the prompt and input from state - let the POML file define everything
        prompt = self.state.get("prompt", "")
        user_input = self.state.get("input", "")
        
        # If there's no prompt in state, just use the input directly
        if not prompt:
            prompt = user_input
        
        try:
            # Let the LLM handle everything based on the dynamic prompt from POML
            response = self.llm.get_prompt_response(prompt)
            print("\033[92m[DynamicAgent] LLM Response:\033[0m", response)
            
            # Handle empty or invalid responses
            cleaned_response = response.strip()
            if not cleaned_response or len(cleaned_response) < 2:
                print("\033[93m[DynamicAgent] Empty/invalid response, using fallback\033[0m")
                return "fallback_agent"
            
            return cleaned_response
            
        except Exception as e:
            print(f"\033[91m[DynamicAgent] LLM Error: {e}\033[0m")
            # If LLM fails, return a generic fallback
            return "fallback_agent"