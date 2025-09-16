from openai import OpenAI
from utils import config
import time

class LLMContainer:
    def __init__(self, base_url=config.LLM_SERVER_API_ENDPOINT, api_key="not-needed", model=config.LLM_SERVER_MODEL):
        self.base_url = f"http://{config.LLM_SERVER_HOST}:{config.LLM_SERVER_PORT}{base_url}"
        self.client = OpenAI(base_url=self.base_url, api_key=api_key, timeout=10.0)  # 10 second timeout
        self.model = model
        self.is_server_available = None
        self.last_health_check = 0
        self.health_check_interval = 30  # Check server health every 30 seconds

    def _check_server_health(self):
        """Check if the LLM server is available using OpenAI client"""
        current_time = time.time()
        
        # Only check health if we haven't checked recently
        if current_time - self.last_health_check < self.health_check_interval:
            return self.is_server_available
        
        try:
            # Try a simple API call to check if server is responsive
            # This is more reliable than using requests
            self.client.models.list()
            self.is_server_available = True
            print(f"\033[92m[LLM] Server health check: ✅ Available\033[0m")
        except Exception as e:
            self.is_server_available = False
            print(f"\033[91m[LLM] Server health check failed: {e}\033[0m")
        
        self.last_health_check = current_time
        return self.is_server_available

    def get_prompt_response(self, prompt, system_message=None, max_tokens=50, temperature=0.1):
        """
        Fetches the response from the LLM server with optimizations for routing.
        
        :param prompt: The user prompt string.
        :param system_message: Optional system message for context.
        :param max_tokens: Maximum tokens for response (lower for routing tasks).
        :param temperature: Temperature for response (lower for more deterministic routing).
        :return: The LLM's response as a string.
        """
        
        # Check if server is available
        if not self._check_server_health():
            raise Exception("LLM server is not available")
        
        print(f"\033[92m[LLM] Prompt:\033[0m {prompt[:100]}..." if len(prompt) > 100 else f"\033[92m[LLM] Prompt:\033[0m {prompt}")
        
        # Optimize prompt for routing tasks
        optimized_prompt = self._optimize_routing_prompt(prompt)
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": optimized_prompt})

        try:
            start_time = time.time()
            
            # Model-specific optimizations
            params = {
                "model": self.model,
                "messages": messages,
                "max_tokens": min(max_tokens, 20),  # Even shorter for routing
                "temperature": min(temperature, 0.1),  # Very low temperature
                "timeout": 10.0,
            }
            
            # Add stop sequences for code-generating models like phi-2
            if "phi" in self.model.lower():
                params["stop"] = ["\n", "```", "def ", "class ", "#", "//", "'''", '"""', "import"]
            
            resp = self.client.chat.completions.create(**params)
            
            response_time = time.time() - start_time
            response = resp.choices[0].message.content.strip()
            
            # Clean the response to remove code artifacts
            cleaned_response = self._clean_llm_response(response)
            
            print(f"\033[92m[LLM] Response ({response_time:.2f}s):\033[0m {cleaned_response}")
            return cleaned_response
            
        except Exception as e:
            print(f"\033[91m[LLM] Error: {e}\033[0m")
            # Mark server as unavailable for next health check
            self.is_server_available = False
            raise e
    
    def _optimize_routing_prompt(self, prompt):
        """Optimize prompt specifically for routing tasks"""
        # If the prompt looks like a routing instruction, add emphasis
        if any(keyword in prompt.lower() for keyword in ['respond only', 'return only', 'finance_agent', 'my_docs', 'fallback_agent']):
            # Add explicit instruction to prevent code generation
            return f"{prompt}\n\nIMPORTANT: Respond with ONLY the agent name. Do not write any code or explanations."
        
        return prompt
    
    def _clean_llm_response(self, response):
        """Clean LLM response to remove code artifacts and unwanted content"""
        if not response:
            return response
        
        # First, check if it's already a valid route
        valid_routes = ["finance_agent", "my_docs", "fallback_agent"]
        response_lower = response.strip().lower()
        
        for route in valid_routes:
            if route in response_lower:
                return route
        
        # Remove common code patterns that the model might generate
        lines = response.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue
                
            # Skip lines that look like code
            if any(pattern in line for pattern in ['def ', 'class ', 'import ', '# TODO', 'pass', '"""', "'''", 'Input', 'Output']):
                continue
                
            # Skip lines with only special characters
            if all(c in '"""\'#(){}[]' for c in line):
                continue
            
            # Skip lines that are just comments
            if line.startswith('#') or line.startswith('//'):
                continue
                
            cleaned_lines.append(line)
            
            # For routing, we usually only need the first valid line
            if len(cleaned_lines) >= 1:
                break
        
        cleaned_response = ' '.join(cleaned_lines) if cleaned_lines else ""
        
        # If we have a cleaned response, check if it contains a valid route
        if cleaned_response:
            cleaned_lower = cleaned_response.lower()
            for route in valid_routes:
                if route in cleaned_lower:
                    return route
        
        # If no valid route found and response is very short, return it as-is
        if len(response.strip()) <= 20:
            return response.strip()
            
        # Otherwise return empty string to let DynamicAgent handle fallback
        return ""

# Example usage:
# llm = LLMContainer()
# response = llm.get_prompt_response("Hello! How can I save money on taxes?")
# print(response)
