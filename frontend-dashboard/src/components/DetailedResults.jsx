import React from 'react';

export function DetailedResults({ metrics }) {
  const endpoints = metrics.endpoints || {};
  const entries = Object.entries(endpoints);

  return (
    <div className="rounded-xl border border-border bg-card p-5 overflow-hidden flex flex-col">
      <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Detailed API Results
      </div>
      
      {entries.length === 0 ? (
        <div className="text-sm text-muted-foreground italic">No endpoint data available yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pl-2 font-medium">Endpoint URL</th>
                <th className="pb-3 px-3 font-medium text-right">Requests</th>
                <th className="pb-3 px-3 font-medium text-right">Success Rate</th>
                <th className="pb-3 px-3 font-medium text-right">Failure Rate</th>
                <th className="pb-3 pr-2 font-medium text-right">Avg Response</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {entries.map(([url, data]) => {
                const total = data.count;
                const successRate = total > 0 ? ((data.success / total) * 100).toFixed(1) : 0;
                const failureRate = total > 0 ? ((data.failed / total) * 100).toFixed(1) : 0;
                const avgTime = data.success > 0 ? Math.round(data.totalTime / data.success) : 0;
                
                return (
                  <tr key={url} className="border-b border-border/10 hover:bg-[oklch(var(--muted))]/30 transition-colors">
                    <td className="py-3 pl-2 font-medium text-foreground max-w-[200px] truncate" title={url}>
                      {url}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
                      {total}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-[oklch(var(--success))]">
                      {successRate}%
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-[oklch(var(--danger))]">
                      {failureRate}%
                    </td>
                    <td className="py-3 pr-2 text-right tabular-nums text-foreground">
                      {avgTime} ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
