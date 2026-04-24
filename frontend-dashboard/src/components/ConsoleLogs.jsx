import React from 'react';

export function ConsoleLogs({ logs }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 h-[400px] flex flex-col">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
        Live Traffic Logs
      </div>
      <div className="flex-1 min-h-0 bg-black/40 rounded-lg p-3 overflow-y-auto font-mono text-[10px] leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-muted-foreground italic">No logs yet. Waiting for traffic...</div>
        ) : (
          logs.map(log => {
            let colorClass = "text-muted-foreground";
            if (log.status >= 200 && log.status < 400) colorClass = "text-[oklch(var(--success))]";
            else if (log.status >= 400) colorClass = "text-[oklch(var(--warning))]";
            if (log.status === 0 || log.status >= 500) colorClass = "text-[oklch(var(--danger))]";

            return (
              <div key={log.id} className={`${colorClass} break-all mb-1`}>
                {log.text}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
