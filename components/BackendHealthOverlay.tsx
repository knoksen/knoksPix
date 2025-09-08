import React, { useEffect, useState } from 'react';
import { trackUserAction } from '../telemetry';

interface Props {
  baseUrl?: string;
  intervalMs?: number;
}

// Access Vite env with loose typing to avoid requiring a custom env.d.ts
const BackendHealthOverlay: React.FC<Props> = ({ baseUrl = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000', intervalMs = 15000 }) => {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [samples, setSamples] = useState<number[]>([]); // store recent latencies

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const controller = new AbortController();
        const started = performance.now();
        const t = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${baseUrl}/healthz`, { signal: controller.signal });
        clearTimeout(t);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!cancelled) {
          setHealthy(true);
          setLastError(null);
          const latency = performance.now() - started;
            setLastLatencyMs(latency);
            setSamples(prev => {
              const next = [...prev.slice(-9), latency]; // keep last 10
              return next;
            });
            trackUserAction('backend_health_success', { latencyMs: Math.round(latency) });
        }
      } catch (e: any) {
        if (!cancelled) {
          setHealthy(false);
          setLastError(e?.message || 'Unknown');
          setLastLatencyMs(null);
          trackUserAction('backend_health_failure', { error: e?.message });
        }
      }
    };
    check();
    const id = setInterval(check, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [baseUrl, intervalMs]);

  const avg = samples.length ? samples.reduce((a,b)=>a+b,0) / samples.length : null;
  const degraded = healthy && avg !== null && avg > 1500; // arbitrary threshold

  if (healthy === true && !degraded) return null; // hide when healthy and not degraded

  const statusColor = healthy ? (degraded ? 'bg-amber-600/90' : 'bg-green-600/90') : 'bg-red-600/90';
  const title = healthy ? (degraded ? 'Backend Slow' : 'Backend Healthy') : 'Backend Unreachable';

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${statusColor} backdrop-blur text-white p-4 rounded-lg shadow-lg animate-fade-in`}>      
      <h3 className="font-semibold mb-1">{title}</h3>
      {healthy ? (
        <div className="text-xs space-y-1">
          <p className="opacity-90">Base URL: <code>{baseUrl}</code></p>
          {lastLatencyMs !== null && <p className="opacity-90">Last latency: {Math.round(lastLatencyMs)} ms</p>}
          {avg !== null && <p className="opacity-90">Avg (last {samples.length}): {Math.round(avg)} ms</p>}
        </div>
      ) : (
        <>
          <p className="text-sm opacity-90">Attempting to reach <code>{baseUrl}</code>. Edits / AI features may not work.</p>
          {lastError && <p className="text-xs mt-1 opacity-70">Last error: {lastError}</p>}
          <button onClick={() => { trackUserAction('backend_health_manual_retry'); window.location.reload(); }} className="mt-3 bg-white/15 hover:bg-white/25 transition text-xs px-3 py-1 rounded">
            Retry Now
          </button>
        </>
      )}
    </div>
  );
};

export default BackendHealthOverlay;
