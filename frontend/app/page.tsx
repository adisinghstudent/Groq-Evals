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
        <div className="relative mb-12">
          <h1 className="font-['Söhne'] text-[3.5rem] leading-[1.2] font-[350] text-[#1A2B3B] text-center tracking-[-0.03em]">
            Back at it, Evaluator
          </h1>
          {loading && (
            <div className="absolute -bottom-6 left-0 w-full flex justify-center space-x-1">
              <div className="h-0.5 w-1/3 bg-[#D4C3B1] animate-strobe-left rounded-full" />
              <div className="h-0.5 w-1/3 bg-[#D4C3B1] animate-strobe-right rounded-full" />
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[#374151] mb-2 text-sm">Model 1</label>
              <select
                value={model1}
                onChange={(e) => setModel1(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#E6D5C3]/20 text-[#374151] border border-[#D4C3B1] focus:ring-2 focus:ring-[#D4C3B1] focus:outline-none shadow-sm backdrop-blur-sm"
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
              <label className="block text-[#374151] mb-2 text-sm">Model 2</label>
              <select
                value={model2}
                onChange={(e) => setModel2(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#E6D5C3]/20 text-[#374151] border border-[#D4C3B1] focus:ring-2 focus:ring-[#D4C3B1] focus:outline-none shadow-sm backdrop-blur-sm"
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
              <label className="block text-[#374151] mb-2 text-sm">Evaluator Model</label>
              <select
                value={evaluatorModel}
                onChange={(e) => setEvaluatorModel(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#E6D5C3]/20 text-[#374151] border border-[#D4C3B1] focus:ring-2 focus:ring-[#D4C3B1] focus:outline-none shadow-sm backdrop-blur-sm"
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
            <label className="block text-[#374151] mb-2 text-sm">How can I help you today?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full h-32 p-4 rounded-lg bg-white/70 text-[#374151] placeholder-[#374151]/50 border border-gray-200 focus:ring-2 focus:ring-[#D4C3B1] focus:outline-none shadow-sm backdrop-blur-sm text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !model1 || !model2 || !evaluatorModel}
            className={`w-full py-3 rounded-lg text-[#374151] transition-colors shadow-sm text-sm ${
              loading || !model1 || !model2 || !evaluatorModel
                ? 'bg-[#E6D5C3] cursor-not-allowed opacity-50'
                : 'bg-[#E6D5C3] hover:bg-[#D4C3B1] hover:shadow-md'
            }`}
          >
            {loading ? 'Evaluating...' : 'Compare Models'}
          </button>
        </form>

        {error && (
          <div className="p-4 mb-8 rounded-lg bg-red-50/80 border border-red-200 text-red-600 backdrop-blur-sm text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model 1 Response */}
              <div className="p-6 rounded-lg bg-white/70 border border-gray-200 shadow-sm backdrop-blur-sm">
                <h2 className="text-lg text-[#374151] mb-4">
                  {result.model1_response.model_name}
                </h2>
                <p className="text-[#374151] whitespace-pre-wrap text-sm">
                  {result.model1_response.response}
                </p>
              </div>

              {/* Model 2 Response */}
              <div className="p-6 rounded-lg bg-white/70 border border-gray-200 shadow-sm backdrop-blur-sm">
                <h2 className="text-lg text-[#374151] mb-4">
                  {result.model2_response.model_name}
                </h2>
                <p className="text-[#374151] whitespace-pre-wrap text-sm">
                  {result.model2_response.response}
                </p>
              </div>
            </div>

            {/* Evaluation Results */}
            <div className="p-6 rounded-lg bg-[#E6D5C3]/20 border border-[#D4C3B1] shadow-sm backdrop-blur-sm">
              <h2 className="text-lg text-[#374151] mb-4">
                Evaluation Results (by {evaluatorModel})
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[#8B7355] text-sm">Winner:</p>
                  <p className="text-[#374151] text-sm">{result.winner} ({result.winner === 'Model 1' ? model1 : model2})</p>
                </div>
                <div>
                  <p className="text-[#8B7355] text-sm">Reasoning:</p>
                  <p className="text-[#374151] text-sm whitespace-pre-wrap">{result.reasoning || 'No reasoning provided'}</p>
                </div>
                <div>
                  <p className="text-[#8B7355] text-sm">Response Statistics:</p>
                  <ul className="text-[#374151] space-y-1 mt-2 text-sm">
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
