interface ModelResponse {
  model_name: string;
  response: string;
}

interface EvaluationResult {
  model1_response: ModelResponse;
  model2_response: ModelResponse;
  winner: string;
  reasoning: string;
  metrics: {
    length_ratio: number;
    response1_length: number;
    response2_length: number;
  };
}

export async function evaluatePrompt(prompt: string): Promise<EvaluationResult> {
  const response = await fetch('http://localhost:8000/api/evaluate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
} 