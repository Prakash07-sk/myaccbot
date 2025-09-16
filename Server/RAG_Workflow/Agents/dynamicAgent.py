

class DynamicAgent:
    def __init__(self, state):
        self.state = state

    def run(self):
        print("\033[94m[DynamicAgent] State:\033[0m", self.state)
        return "fallback_agent"