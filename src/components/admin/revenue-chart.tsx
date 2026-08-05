'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function RevenueChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No revenue data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#888888' }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rs ${value}`}
          tick={{ fill: '#888888' }}
        />
        <Tooltip
          cursor={{ fill: '#ffffff10' }}
          contentStyle={{ backgroundColor: '#0f1a16', borderColor: '#d4af3740', color: '#fff' }}
          itemStyle={{ color: '#d4af37' }}
          formatter={(value: number) => [`Rs ${value}`, 'Revenue']}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-gold"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
