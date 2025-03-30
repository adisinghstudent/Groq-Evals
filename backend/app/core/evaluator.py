from typing import Tuple, Dict
import groq

class ModelEvaluator:
    def __init__(self, api_key: str):
        self.client = groq.Groq(api_key=api_key)

    async def evaluate_responses(self, prompt: str, response1: str, response2: str, evaluator_model: str) -> Tuple[str, str, Dict]:
        # Create evaluation prompt
        eval_prompt = f"""You are an expert model response evaluator. Compare these two responses and determine which one is better.

Original Prompt: {prompt}

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

Provide your evaluation in this format:
Winner: [Model 1 or Model 2]
Reasoning: [Your detailed explanation]
"""

        # Get evaluation from the selected model
        evaluation = self.client.chat.completions.create(
            messages=[{"role": "user", "content": eval_prompt}],
            model=evaluator_model,
            temperature=0.3  # Lower temperature for more consistent evaluations
        )
        
        evaluation_text = evaluation.choices[0].message.content

        # Parse the evaluation result
        try:
            # Extract winner and reasoning from the evaluation text
            winner_line = [line for line in evaluation_text.split('\n') if line.startswith('Winner:')][0]
            reasoning_line = [line for line in evaluation_text.split('\n') if line.startswith('Reasoning:')][0]
            
            winner = winner_line.replace('Winner:', '').strip()
            reasoning = reasoning_line.replace('Reasoning:', '').strip()
        except:
            # Fallback if parsing fails
            winner = "Model 1" if len(response1) > len(response2) else "Model 2"
            reasoning = "Evaluation parsing failed. Defaulting to length-based comparison."

        # Calculate metrics
        metrics = {
            "response1_length": len(response1.split()),
            "response2_length": len(response2.split()),
            "length_ratio": min(len(response1.split()), len(response2.split())) / 
                          max(len(response1.split()), len(response2.split()))
        }

        return winner, reasoning, metrics 