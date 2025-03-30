from typing import Dict, Any
import groq
from app.core.config import get_settings

settings = get_settings()

class ModelEvaluator:
    def __init__(self, api_key: str):
        self.client = groq.Groq(api_key=api_key)

    def evaluate_responses(
        self,
        prompt: str,
        response1: str,
        response2: str,
        model1_name: str,
        model2_name: str,
        evaluator_model: str
    ) -> Dict[str, Any]:
        evaluation_prompt = f"""You are an expert model response evaluator. Compare these two responses to the given prompt and determine which is better.

Prompt: {prompt}

Model 1 ({model1_name}):
{response1}

Model 2 ({model2_name}):
{response2}

Compare the responses based on:
1. Accuracy and relevance to the prompt
2. Clarity and coherence
3. Completeness of the answer
4. Conciseness and efficiency

Provide your evaluation in this format:
Winner: [Model 1 or Model 2]
Reasoning: [Your detailed explanation]
"""

        try:
            completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": evaluation_prompt}],
                model=evaluator_model,
                temperature=0.1,
                max_tokens=1000
            )
            
            response_text = completion.choices[0].message.content
            
            # Parse the response
            lines = response_text.split('\n')
            winner = None
            reasoning = []
            
            for line in lines:
                if line.startswith('Winner:'):
                    winner_text = line.replace('Winner:', '').strip()
                    winner = 'Model 1' if 'model 1' in winner_text.lower() else 'Model 2'
                elif line.startswith('Reasoning:'):
                    reasoning = [line.replace('Reasoning:', '').strip()]
                elif reasoning:  # Collect additional reasoning lines
                    reasoning.append(line.strip())
            
            # If parsing fails, use a simple length-based comparison as fallback
            if not winner:
                winner = 'Model 1' if len(response1) > len(response2) else 'Model 2'
                reasoning = ['Evaluation parsing failed. Using length-based comparison.']

            # Calculate some basic metrics
            response1_words = len(response1.split())
            response2_words = len(response2.split())
            
            return {
                "winner": winner,
                "reasoning": '\n'.join(reasoning),
                "metrics": {
                    "response1_length": response1_words,
                    "response2_length": response2_words,
                    "length_ratio": response1_words / max(response2_words, 1)
                }
            }
            
        except Exception as e:
            raise Exception(f"Evaluation failed: {str(e)}") 