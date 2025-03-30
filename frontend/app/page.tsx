'use client';

import { useState, useEffect } from 'react';
import { evaluatePrompt, getAvailableModels, setApiKey } from './api/client';
import type { EvaluationResult } from './api/client';

export default function Home() {
  const [apiKey, setApiKeyState] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loadingState, setLoadingState] = useState<'idle' | 'models' | 'evaluating'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);
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
        
        // Set default models
        const defaultModel1 = response.models.find(m => m === "gemma2-9b-it") || response.models[0];
        const defaultModel2 = response.models.find(m => m === "llama-3.1-8b-instant") || response.models[1];
        const defaultEvaluator = response.evaluation_models.find(m => m === "deepseek-r1-distill-llama-70b") || response.evaluation_models[0];
        
        setModel1(defaultModel1);
        setModel2(defaultModel2);
        setEvaluatorModel(defaultEvaluator);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch available models');
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    const keySet = localStorage.getItem('groqApiKeySet');
    const storedKey = localStorage.getItem('groqApiKey');
    if (keySet === 'true' && storedKey) {
      setIsKeySet(true);
      setMaskedKey(storedKey.slice(0, 30) + '...');
    }
  }, []);

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState('models');
    setError(null);
    
    try {
      await setApiKey(apiKey);
      setIsKeySet(true);
      localStorage.setItem('groqApiKeySet', 'true');
      localStorage.setItem('groqApiKey', apiKey);
      setMaskedKey(apiKey.slice(0, 30) + '...');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set API key');
    } finally {
      setLoadingState('idle');
    }
  };

  const handleDeleteKey = () => {
    localStorage.removeItem('groqApiKeySet');
    localStorage.removeItem('groqApiKey');
    setIsKeySet(false);
    setApiKeyState('');
    setMaskedKey('');
    setShowSettings(false);
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState('models');
    setError(null);
    try {
      const response = await evaluatePrompt(prompt, model1, model2, evaluatorModel);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingState('idle');
    }
  };

  // Settings Modal Component
  const SettingsModal = () => {
    if (!showSettings) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
          <button
            onClick={() => setShowSettings(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <h2 className="text-xl text-[#374151] mb-4">Settings</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#374151] mb-1">API Key</p>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                <code className="text-sm text-[#374151]">{maskedKey}</code>
                <button
                  onClick={handleDeleteKey}
                  className="text-sm text-red-600 hover:text-red-700 underline decoration-dotted"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-xs text-[#374151]/70">
              Deleting your API key will sign you out and return you to the login page.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Spinner Component
  const LoadingSpinner = () => (
    <div className="absolute -bottom-6 left-0 w-full flex justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D4C3B1]" />
      <span className="ml-3 text-sm text-[#374151]">
        {loadingState === 'models' ? 'Getting model responses...' : 'Evaluating responses...'}
      </span>
    </div>
  );

  if (!isKeySet) {
    return (
      <main className="min-h-screen p-8 bg-[#f8f8f8]">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-['Söhne'] text-[3.5rem] leading-[1.2] font-[350] text-[#1A2B3B] mb-12 text-center tracking-[-0.03em]">
            Welcome to Groq Evaluator
          </h1>
          
          <form onSubmit={handleApiKeySubmit} className="max-w-lg mx-auto">
            <div className="mb-8">
              <label className="block text-[#374151] mb-2 text-sm">
                Please enter your Groq API key to continue
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                placeholder="sk-xxxxxx..."
                className="w-full p-4 rounded-lg bg-white/70 text-[#374151] placeholder-[#374151]/50 border border-gray-200 focus:ring-2 focus:ring-[#D4C3B1] focus:outline-none shadow-sm backdrop-blur-sm text-sm"
                required
              />
              <div className="mt-2 space-y-2">
                <p className="text-xs text-[#374151]/70">
                  Your API key will be stored securely and used only for model evaluation.
                </p>
                <p className="text-xs text-[#374151]">
                  Don&apos;t have an API key?{" "}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B7355] hover:text-[#6B5335] underline decoration-dotted"
                  >
                    Get one from Groq Console →
                  </a>
                </p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loadingState !== 'idle' || !apiKey}
              className={`w-full py-3 rounded-lg text-[#374151] transition-colors shadow-sm text-sm ${
                loadingState !== 'idle' || !apiKey
                  ? 'bg-[#E6D5C3] cursor-not-allowed opacity-50'
                  : 'bg-[#E6D5C3] hover:bg-[#D4C3B1] hover:shadow-md'
              }`}
            >
              {loadingState !== 'idle' ? 'Setting up...' : 'Continue to Evaluator'}
            </button>
          </form>

          {error && (
            <div className="max-w-lg mx-auto mt-4 p-4 rounded-lg bg-red-50/80 border border-red-200 text-red-600 backdrop-blur-sm text-sm">
              {error}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-[#f8f8f8]">
      <div className="max-w-4xl mx-auto relative">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="absolute -top-2 right-0 p-2 text-[#374151] hover:text-[#8B7355] transition-colors z-10 bg-[#f8f8f8] rounded-full hover:bg-[#E6D5C3]/20"
          title="Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.432l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.432l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
            />
          </svg>
        </button>

        <div className="relative mb-12">
          <h1 className="font-['Söhne'] text-[3.5rem] leading-[1.2] font-[350] text-[#1A2B3B] text-center tracking-[-0.03em]">
            Back at it, Evaluator
          </h1>
          {loadingState !== 'idle' && <LoadingSpinner />}
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
            disabled={loadingState !== 'idle' || !model1 || !model2 || !evaluatorModel}
            className={`w-full py-3 rounded-lg text-[#374151] transition-colors shadow-sm text-sm ${
              loadingState !== 'idle' || !model1 || !model2 || !evaluatorModel
                ? 'bg-[#E6D5C3] cursor-not-allowed opacity-50'
                : 'bg-[#E6D5C3] hover:bg-[#D4C3B1] hover:shadow-md'
            }`}
          >
            {loadingState !== 'idle' ? 
              (loadingState === 'models' ? 'Getting Responses...' : 'Evaluating...') 
              : 'Compare Models'}
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

      {/* Settings Modal */}
      <SettingsModal />
    </main>
  );
}
