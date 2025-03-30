interface ModelResponse {
  model_name: string;
  response: string;
}

export interface EvaluationResult {
  model1_response: ModelResponse;
  model2_response: ModelResponse;
  winner: string;
  reasoning: string;
  metrics: {
    response1_length: number;
    response2_length: number;
    length_ratio: number;
  };
}

interface ModelsResponse {
  models: string[];
  evaluation_models: string[];
}

export async function setApiKey(apiKey: string): Promise<void> {
  const response = await fetch('https://groq-evals.onrender.com/api/set-key', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ api_key: apiKey }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
}

export async function getAvailableModels(): Promise<ModelsResponse> {
  const response = await fetch('https://groq-evals.onrender.com/api/models');
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}

export async function evaluatePrompt(
  prompt: string,
  model1: string,
  model2: string,
  evaluatorModel: string
): Promise<EvaluationResult> {
  const response = await fetch('https://groq-evals.onrender.com/api/evaluate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model1,
      model2,
      evaluator_model: evaluatorModel,
      sequential: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
} 