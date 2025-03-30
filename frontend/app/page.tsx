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
    <main className="min-h-screen p-8 bg-[#f8f8f8]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Groq Model Evaluator
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Model 1</label>
              <select
                value={model1}
                onChange={(e) => setModel1(e.target.value)}
                className="w-full p-2 rounded-lg bg-white/70 text-gray-800 border border-gray-200 focus:ring-2 focus:ring-brown-200 focus:outline-none shadow-sm backdrop-blur-sm"
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
              <label className="block text-gray-700 mb-2 text-sm font-medium">Model 2</label>
              <select
                value={model2}
                onChange={(e) => setModel2(e.target.value)}
                className="w-full p-2 rounded-lg bg-white/70 text-gray-800 border border-gray-200 focus:ring-2 focus:ring-brown-200 focus:outline-none shadow-sm backdrop-blur-sm"
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
              <label className="block text-gray-700 mb-2 text-sm font-medium">Evaluator Model</label>
              <select
                value={evaluatorModel}
                onChange={(e) => setEvaluatorModel(e.target.value)}
                className="w-full p-2 rounded-lg bg-white/70 text-gray-800 border border-gray-200 focus:ring-2 focus:ring-brown-200 focus:outline-none shadow-sm backdrop-blur-sm"
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
            <label className="block text-gray-700 mb-2 text-sm font-medium">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full h-32 p-4 rounded-lg bg-white/70 text-gray-800 placeholder-gray-400 border border-gray-200 focus:ring-2 focus:ring-brown-200 focus:outline-none shadow-sm backdrop-blur-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !model1 || !model2 || !evaluatorModel}
            className={`w-full py-3 rounded-lg font-medium text-gray-800 transition-colors shadow-sm ${
              loading || !model1 || !model2 || !evaluatorModel
                ? 'bg-[#E6D5C3] cursor-not-allowed opacity-50'
                : 'bg-[#E6D5C3] hover:bg-[#D4C3B1] hover:shadow-md'
            }`}
          >
            {loading ? 'Evaluating...' : 'Compare Models'}
          </button>
        </form>

        {error && (
          <div className="p-4 mb-8 rounded-lg bg-red-50/80 border border-red-200 text-red-600 backdrop-blur-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model 1 Response */}
              <div className="p-6 rounded-lg bg-white/70 border border-gray-200 shadow-sm backdrop-blur-sm">
                <h2 className="text-xl font-medium text-gray-800 mb-4">
                  {result.model1_response.model_name}
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {result.model1_response.response}
                </p>
              </div>

              {/* Model 2 Response */}
              <div className="p-6 rounded-lg bg-white/70 border border-gray-200 shadow-sm backdrop-blur-sm">
                <h2 className="text-xl font-medium text-gray-800 mb-4">
                  {result.model2_response.model_name}
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {result.model2_response.response}
                </p>
              </div>
            </div>

            {/* Evaluation Results */}
            <div className="p-6 rounded-lg bg-[#E6D5C3]/20 border border-[#D4C3B1] shadow-sm backdrop-blur-sm">
              <h2 className="text-xl font-medium text-gray-800 mb-4">
                Evaluation Results (by {evaluatorModel})
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[#8B7355] font-medium text-sm">Winner:</p>
                  <p className="text-gray-800">{result.winner} ({result.winner === 'Model 1' ? model1 : model2})</p>
                </div>
                <div>
                  <p className="text-[#8B7355] font-medium text-sm">Reasoning:</p>
                  <p className="text-gray-800">{result.reasoning}</p>
                </div>
                <div>
                  <p className="text-[#8B7355] font-medium text-sm">Response Statistics:</p>
                  <ul className="text-gray-800 space-y-1 mt-2">
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
