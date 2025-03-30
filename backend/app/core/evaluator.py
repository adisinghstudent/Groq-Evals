from inspect_ai import *
from typing import Tuple, Dict

class ModelEvaluator:
    def __init__(self):
        self.inspector = Inspector()

    async def evaluate_responses(self, prompt: str, response1: str, response2: str) -> Tuple[str, str, Dict]:
        # Create evaluation prompt
        eval_prompt = f"""Given the following prompt and two model responses, evaluate which response is better:

Prompt: {prompt}

Response 1:
{response1}

Response 2:
{response2}

Evaluate based on:
1. Accuracy and factual correctness
2. Relevance to the prompt
3. Clarity and coherence
4. Completeness of the answer
5. Conciseness without sacrificing quality

Choose the better response and explain why."""

        # Use inspect-ai's choice scorer
        result = await self.inspector.choice(
            options=[response1, response2],
            prompt=eval_prompt,
            criteria=[
                "accuracy",
                "relevance",
                "clarity",
                "completeness",
                "conciseness"
            ]
        )

        # Get the winner and explanation
        winner_idx = result.choice
        winner = "Model 1" if winner_idx == 0 else "Model 2"
        reasoning = result.explanation

        # Calculate additional metrics
        metrics = {
            "confidence": result.confidence,
            "response1_score": result.scores[0],
            "response2_score": result.scores[1],
            "response1_length": len(response1.split()),
            "response2_length": len(response2.split()),
            "length_ratio": min(len(response1.split()), len(response2.split())) / 
                          max(len(response1.split()), len(response2.split()))
        }

        return winner, reasoning, metrics 