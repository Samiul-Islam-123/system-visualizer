import React from 'react';

export function ControlPanel({ running, elapsed, settings, setSettings, onStart, onStop, onReset }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : 
              type === 'number' || type === 'range' ? parseFloat(value) : value 
    }));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Control Panel</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Base API URL
            </label>
            <input 
              type="text" 
              name="baseUrl"
              value={settings.baseUrl} 
              onChange={handleChange}
              disabled={running}
              className="w-full bg-[oklch(var(--muted))]/50 border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-[oklch(var(--primary))] transition-colors disabled:opacity-50"
              placeholder="/api"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Target URL (if variation is off)
            </label>
            <input 
              type="text" 
              name="targetUrl"
              value={settings.targetUrl} 
              onChange={handleChange}
              disabled={running || settings.useVariation}
              className="w-full bg-[oklch(var(--muted))]/50 border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-[oklch(var(--primary))] transition-colors disabled:opacity-50"
              placeholder="/api/0/test"
            />
            {!settings.useVariation && (
              <div className="mt-1 text-[10px] text-muted-foreground break-all">
                Preview: {`${settings.baseUrl.replace(/\/$/, '')}${settings.targetUrl.startsWith('/') ? settings.targetUrl : `/${settings.targetUrl}`}`}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              name="useVariation"
              id="useVariation"
              checked={settings.useVariation} 
              onChange={handleChange}
              disabled={running}
              className="accent-[oklch(var(--primary))]"
            />
            <label htmlFor="useVariation" className="text-xs text-foreground cursor-pointer">
              Enable Traffic Variation (Random from list)
            </label>
          </div>

          {settings.useVariation && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                URL List (one per line)
              </label>
              <textarea 
                name="urlList"
                value={settings.urlList} 
                onChange={handleChange}
                disabled={running}
                className="w-full bg-[oklch(var(--muted))]/50 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-[oklch(var(--primary))] transition-colors h-24 resize-none font-mono text-[11px]"
                placeholder="/api/0/light&#10;/api/1/moderate&#10;/api/2/heavy"
              />
              <div className="mt-1 text-[10px] text-muted-foreground max-h-12 overflow-y-auto">
                <div className="font-semibold mb-1">Preview:</div>
                {settings.urlList.split('\n').filter(Boolean).map((url, idx) => (
                  <div key={idx} className="break-all">
                    • {`${settings.baseUrl.replace(/\/$/, '')}${url.trim().startsWith('/') ? url.trim() : `/${url.trim()}`}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground block mb-1 flex justify-between">
              <span>Requests Per Second (RPS)</span>
              <span>{settings.rps}</span>
            </label>
            <input 
              type="range" 
              name="rps"
              min="1" max="100" 
              value={settings.rps} 
              onChange={handleChange}
              disabled={running}
              className="w-full accent-[oklch(var(--primary))]"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1 flex justify-between">
              <span>Duration (Seconds)</span>
              <span>{settings.durationSec}s</span>
            </label>
            <input 
              type="range" 
              name="durationSec"
              min="5" max="120" step="5"
              value={settings.durationSec} 
              onChange={handleChange}
              disabled={running}
              className="w-full accent-[oklch(var(--primary))]"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Simulation Time</span>
          <span className="font-mono">{elapsed}s / {settings.durationSec}s</span>
        </div>
        
        <div className="flex gap-2">
          {!running ? (
            <button 
              onClick={onStart}
              className="flex-1 bg-[oklch(var(--primary))] hover:bg-[oklch(var(--primary))]/90 text-white py-2 rounded-md font-medium transition-colors text-sm"
            >
              Start Load
            </button>
          ) : (
            <button 
              onClick={onStop}
              className="flex-1 bg-[oklch(var(--danger))] hover:bg-[oklch(var(--danger))]/90 text-white py-2 rounded-md font-medium transition-colors text-sm"
            >
              Stop
            </button>
          )}
          <button 
            onClick={onReset}
            disabled={running}
            className="px-4 bg-[oklch(var(--muted))] hover:bg-[oklch(var(--muted-foreground))]/20 text-[oklch(var(--foreground))] py-2 rounded-md font-medium transition-colors text-sm disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
