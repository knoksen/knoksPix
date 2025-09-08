import React, { useEffect, useState } from 'react';

interface Props {
  baseUrl?: string;
  intervalMs?: number;
}

// Access Vite env with loose typing to avoid requiring a custom env.d.ts
const BackendHealthOverlay: React.FC<Props> = ({ baseUrl = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000', intervalMs = 15000 }) => {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${baseUrl}/healthz`, { signal: controller.signal });
        clearTimeout(t);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!cancelled) {
          setHealthy(true);
          setLastError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setHealthy(false);
          setLastError(e?.message || 'Unknown');
        }
      }
    };
    check();
    const id = setInterval(check, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [baseUrl, intervalMs]);

  if (healthy !== false) return null; // show only when unreachable

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-red-600/90 backdrop-blur text-white p-4 rounded-lg shadow-lg animate-pulse">
      <h3 className="font-semibold mb-1">Backend Unreachable</h3>
      <p className="text-sm opacity-90">Attempting to reach <code>{baseUrl}</code>. Edits / AI features may not work.</p>
      {lastError && <p className="text-xs mt-1 opacity-70">Last error: {lastError}</p>}
      <button onClick={() => window.location.reload()} className="mt-3 bg-white/15 hover:bg-white/25 transition text-xs px-3 py-1 rounded">
        Retry Now
      </button>
    </div>
  );
};

export default BackendHealthOverlay;
