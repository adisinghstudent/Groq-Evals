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
    confidence: number;
    response1_score: number;
    response2_score: number;
    length_ratio: number;
    response1_length: number;
    response2_length: number;
  };
}

export async function getAvailableModels(): Promise<string[]> {
  const response = await fetch('http://localhost:8000/api/models');
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  const data = await response.json();
  return data.models;
}

export async function evaluatePrompt(prompt: string, model1: string, model2: string): Promise<EvaluationResult> {
  const response = await fetch('http://localhost:8000/api/evaluate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model1, model2 }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
} 