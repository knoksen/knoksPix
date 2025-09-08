import React, { useEffect, useState } from 'react';
import { trackUserAction } from '../telemetry';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const LOCAL_KEY = 'pixshop_settings_v1';

interface SettingsData {
  geminiApiKey?: string;
  latencyWarnMs: number;
}

const defaultSettings: SettingsData = { latencyWarnMs: 1500 };

const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onClose }) => {
  const [data, setData] = useState<SettingsData>(defaultSettings);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (open) {
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) setData({ ...defaultSettings, ...JSON.parse(raw) });
      } catch {}
    }
  }, [open]);

  const update = (p: Partial<SettingsData>) => { setData(d => ({ ...d, ...p })); setDirty(true); };

  const save = () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    trackUserAction('settings_saved');
    setDirty(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-900/90 border border-gray-700 rounded-xl p-6 shadow-2xl animate-fade-in text-gray-100 space-y-5">
        <h2 className="text-xl font-bold">Settings</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Gemini API Key (stored locally)</span>
            <input type="password" value={data.geminiApiKey || ''} onChange={e => update({ geminiApiKey: e.target.value })} className="mt-1 w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="sk-..." />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Latency Warning Threshold (ms)</span>
            <input type="number" min={100} value={data.latencyWarnMs} onChange={e => update({ latencyWarnMs: parseInt(e.target.value, 10) || 100 })} className="mt-1 w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded bg-white/10 hover:bg-white/20">Cancel</button>
          <button disabled={!dirty} onClick={save} className="px-4 py-2 text-sm rounded bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500 font-semibold">Save</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;