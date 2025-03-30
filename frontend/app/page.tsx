'use client';

import { useState, useEffect } from 'react';
import { evaluatePrompt, getAvailableModels } from './api/client';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [evaluationModels, setEvaluationModels] = useState<string[]>([]);
  const [model1, setModel1] = useState<string>('');
  const [model2, setModel2] = useState<string>('');
  const [evaluatorModel, setEvaluatorModel] = useState<string>('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await getAvailableModels();
        setAvailableModels(response.models);
        setEvaluationModels(response.evaluation_models);
        if (response.models.length >= 2) {
          setModel1(response.models[0]);
          setModel2(response.models[1]);
        }
        if (response.evaluation_models.length > 0) {
          setEvaluatorModel(response.evaluation_models[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch available models');
      }
    };
    fetchModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await evaluatePrompt(prompt, model1, model2, evaluatorModel);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Groq Model Evaluator
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-white mb-2">Model 1</label>
              <select
                value={model1}
                onChange={(e) => setModel1(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">Select Model 1</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white mb-2">Model 2</label>
              <select
                value={model2}
                onChange={(e) => setModel2(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">Select Model 2</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white mb-2">Evaluator Model</label>
              <select
                value={evaluatorModel}
                onChange={(e) => setEvaluatorModel(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">Select Evaluator</option>
                {evaluationModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full h-32 p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !model1 || !model2 || !evaluatorModel}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
              loading || !model1 || !model2 || !evaluatorModel
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Evaluating...' : 'Compare Models'}
          </button>
        </form>

        {error && (
          <div className="p-4 mb-8 rounded-lg bg-red-500/10 border border-red-500 text-red-500">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model 1 Response */}
              <div className="p-6 rounded-lg bg-gray-700/50 border border-gray-600">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {result.model1_response.model_name}
                </h2>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {result.model1_response.response}
                </p>
              </div>

              {/* Model 2 Response */}
              <div className="p-6 rounded-lg bg-gray-700/50 border border-gray-600">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {result.model2_response.model_name}
                </h2>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {result.model2_response.response}
                </p>
              </div>
            </div>

            {/* Evaluation Results */}
            <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500">
              <h2 className="text-xl font-semibold text-white mb-4">
                Evaluation Results (by {evaluatorModel})
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-blue-400 font-medium">Winner:</p>
                  <p className="text-white">{result.winner} ({result.winner === 'Model 1' ? model1 : model2})</p>
                </div>
                <div>
                  <p className="text-blue-400 font-medium">Reasoning:</p>
                  <p className="text-white">{result.reasoning}</p>
                </div>
                <div>
                  <p className="text-blue-400 font-medium">Response Statistics:</p>
                  <ul className="text-white space-y-1">
                    <li>Model 1 Length: {result.metrics.response1_length} words</li>
                    <li>Model 2 Length: {result.metrics.response2_length} words</li>
                    <li>Length Ratio: {result.metrics.length_ratio.toFixed(2)}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
