import React, { useState, useEffect } from 'react';
import type { ApiSettings } from '../types';
import { Key, ShieldCheck, X, Cpu, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiSettings: ApiSettings;
  onSaveSettings: (settings: ApiSettings) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiSettings,
  onSaveSettings
}) => {
  const [provider, setProvider] = useState<ApiSettings['provider']>(apiSettings.provider);
  const [apiKey, setApiKey] = useState(apiSettings.apiKey);
  const [modelName, setModelName] = useState(apiSettings.modelName);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });

  useEffect(() => {
    if (isOpen) {
      setProvider(apiSettings.provider);
      setApiKey(apiSettings.apiKey);
      setModelName(apiSettings.modelName);
      setTestResult({ status: 'idle', message: '' });
    }
  }, [isOpen, apiSettings]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult({ status: 'idle', message: '' });

    if (provider === 'mock') {
      setIsTesting(false);
      setTestResult({ status: 'success', message: 'Built-in RAG Intelligence Engine active.' });
      return;
    }

    if (!apiKey || !apiKey.trim()) {
      setIsTesting(false);
      setTestResult({ status: 'error', message: 'API Key is required to test connection.' });
      return;
    }

    try {
      if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` }
        });
        if (res.ok) {
          setTestResult({ status: 'success', message: 'Connection Successful! OpenAI API is valid & reachable.' });
        } else {
          const errData = await res.json().catch(() => ({}));
          setTestResult({ status: 'error', message: `OpenAI Error (${res.status}): ${errData?.error?.message || 'Invalid API key or network error'}` });
        }
      } else if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
        if (res.ok) {
          setTestResult({ status: 'success', message: 'Connection Successful! Gemini API is valid & reachable.' });
        } else {
          const errData = await res.json().catch(() => ({}));
          setTestResult({ status: 'error', message: `Gemini Error (${res.status}): ${errData?.error?.message || 'Invalid API key'}` });
        }
      } else {
        setTestResult({ status: 'success', message: `Configured provider: ${provider}` });
      }
    } catch (err: any) {
      setTestResult({ status: 'error', message: `Network error testing connection: ${err?.message || 'Failed'}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const finalModel = modelName || (provider === 'openai' ? 'gpt-4o-mini' : provider === 'gemini' ? 'gemini-1.5-flash' : 'mock-engine');
    const newSettings: ApiSettings = {
      provider,
      apiKey: apiKey.trim(),
      modelName: finalModel,
      apiUrl: apiSettings.apiUrl || 'http://localhost:8000'
    };
    onSaveSettings(newSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-5 border border-indigo-500/30 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">LLM API Settings</h3>
            <p className="text-xs text-slate-400">Configure custom AI providers or use built-in engine</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Select Intelligence Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ApiSettings['provider'])}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
            >
              <option value="mock">Built-in RAG Intelligence Engine (Default / Hackathon Offline)</option>
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="gemini">Google Gemini API</option>
              <option value="anthropic">Anthropic Claude API</option>
            </select>
          </div>

          {provider !== 'mock' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Model Name</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder={provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash'}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Testing Connection...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Test API Connection</span>
                    </>
                  )}
                </button>
              </div>

              {testResult.status !== 'idle' && (
                <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                  testResult.status === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                }`}>
                  {testResult.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </>
          )}

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Crash Hackathon Guarantee</span>
            </div>
            <p>If no API key is provided, the platform uses its built-in precision RAG engine so the demo will always work smoothly without external network latency.</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

