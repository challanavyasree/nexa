import React, { useState } from 'react';
import type { ApiSettings } from '../types';
import { Key, ShieldCheck, X, Cpu } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      provider,
      apiKey,
      modelName: modelName || (provider === 'openai' ? 'gpt-4o-mini' : provider === 'gemini' ? 'gemini-1.5-flash' : 'mock-engine')
    });
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
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
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
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
