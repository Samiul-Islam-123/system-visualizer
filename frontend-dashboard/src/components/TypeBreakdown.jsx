import React from 'react';

export function TypeBreakdown({ metrics }) {
  const endpoints = metrics.endpoints || {};

  return (
    <div className="rounded-xl border border-border bg-card p-5 max-h-[400px] overflow-y-auto">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
        Endpoint Traffic Breakdown
      </div>
      <div className="space-y-4">
        {Object.keys(endpoints).length === 0 && (
          <div className="text-xs text-muted-foreground">No traffic yet.</div>
        )}
        {Object.entries(endpoints).map(([url, data]) => {
          const avg = data.success > 0 ? Math.round(data.totalTime / data.success) : 0;
          return (
            <div key={url} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-end mb-1 gap-2">
                <span className="text-sm font-semibold text-foreground truncate" title={url}>
                  {url}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{data.count} reqs</span>
              </div>
              <div className="flex gap-4 text-xs mt-2">
                <span className="text-[oklch(var(--success))]">{data.success} OK</span>
                <span className="text-[oklch(var(--danger))]">{data.failed} ERR</span>
                <span className="text-muted-foreground">{avg}ms avg</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
