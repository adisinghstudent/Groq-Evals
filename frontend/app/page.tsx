'use client';

import { useState } from 'react';
import { evaluatePrompt } from './api/client';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await evaluatePrompt(prompt);
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
          <div className="mb-4">
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
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
              loading
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
              <h2 className="text-xl font-semibold text-white mb-4">Evaluation Results</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-blue-400 font-medium">Winner:</p>
                  <p className="text-white">{result.winner}</p>
                </div>
                <div>
                  <p className="text-blue-400 font-medium">Reasoning:</p>
                  <p className="text-white">{result.reasoning}</p>
                </div>
                <div>
                  <p className="text-blue-400 font-medium">Metrics:</p>
                  <ul className="text-white space-y-2">
                    <li>Length Ratio: {result.metrics.length_ratio.toFixed(2)}</li>
                    <li>Response 1 Length: {result.metrics.response1_length} words</li>
                    <li>Response 2 Length: {result.metrics.response2_length} words</li>
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
