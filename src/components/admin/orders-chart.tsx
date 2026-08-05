'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function OrdersChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No orders data available
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
          tick={{ fill: '#888888' }}
        />
        <Tooltip
          cursor={{ fill: '#ffffff10' }}
          contentStyle={{ backgroundColor: '#0f1a16', borderColor: '#a855f740', color: '#fff' }}
          itemStyle={{ color: '#a855f7' }}
          formatter={(value: number) => [`${value}`, 'Orders']}
        />
        <Bar
          dataKey="total"
          fill="#a855f7"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
