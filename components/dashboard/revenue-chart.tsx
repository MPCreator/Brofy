"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart, CartesianGrid } from "recharts"

const data = [
    { name: "Ene", total: 1200 },
    { name: "Feb", total: 2100 },
    { name: "Mar", total: 1800 },
    { name: "Abr", total: 2400 },
    { name: "May", total: 1600 },
    { name: "Jun", total: 2800 },
    { name: "Jul", total: 3200 },
]

export function RevenueChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#078EAD" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#078EAD" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                />
                <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#078EAD"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
