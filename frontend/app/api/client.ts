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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://groq-evals.onrender.com';
const API_BASE_URL = `${BASE_URL}/api`;

export async function setApiKey(apiKey: string): Promise<void> {
  try {
    console.log('Setting API key at:', `${API_BASE_URL}/set-key`);
    const response = await fetch(`${API_BASE_URL}/set-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ api_key: apiKey }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error setting API key:', error, 'Status:', response.status);
      throw new Error(error);
    }
  } catch (error) {
    console.error('Network error setting API key:', error);
    throw error;
  }
}

export async function getAvailableModels(): Promise<ModelsResponse> {
  try {
    const url = `${API_BASE_URL}/models`;
    console.log('Fetching models from:', url);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching models:', error, 'Status:', response.status);
      throw new Error(error);
    }
    const data = await response.json();
    console.log('Received models data:', data);
    return data;
  } catch (error) {
    console.error('Network error fetching models:', error);
    throw error;
  }
}

export async function evaluatePrompt(
  prompt: string,
  model1: string,
  model2: string,
  evaluatorModel: string
): Promise<EvaluationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluate`, {
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
      console.error('Error evaluating prompt:', error);
      throw new Error(error);
    }

    return response.json();
  } catch (error) {
    console.error('Network error evaluating prompt:', error);
    throw error;
  }
} 