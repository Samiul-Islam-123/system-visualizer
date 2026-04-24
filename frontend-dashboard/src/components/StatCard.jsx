import React from 'react';

export function StatCard({ label, value, accent, hint }) {
  let colorClass = "text-foreground";
  
  if (accent === 'success') colorClass = "text-[oklch(var(--success))]";
  else if (accent === 'danger') colorClass = "text-[oklch(var(--danger))]";
  else if (accent === 'warning') colorClass = "text-[oklch(var(--warning))]";
  else if (accent === 'primary') colorClass = "text-[oklch(var(--primary))]";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </div>
      <div className={`text-3xl font-semibold tabular-nums ${colorClass}`}>
        {value}
      </div>
      {hint && (
        <div className="mt-2 text-[11px] text-muted-foreground">
          {hint}
        </div>
      )}
    </div>
  );
}
