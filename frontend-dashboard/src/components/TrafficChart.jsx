import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function TrafficChart({ data }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 h-80 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Traffic Overview</h3>
        <div className="flex gap-4 text-xs text-muted-foreground">
           <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(var(--success))]"/> Success</span>
           <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[oklch(var(--danger))]"/> Failed</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="oklch(var(--muted-foreground))" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickMargin={10}
            />
            <YAxis 
              stroke="oklch(var(--muted-foreground))" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'oklch(var(--popover))', borderColor: 'oklch(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'oklch(var(--foreground))' }}
              itemStyle={{ color: 'oklch(var(--foreground))' }}
            />
            <Line type="monotone" dataKey="success" stroke="oklch(var(--success))" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="failed" stroke="oklch(var(--danger))" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: "oklch(var(--danger))" }} activeDot={{ r: 5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
