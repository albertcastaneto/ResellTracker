import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import type { MonthlyRevenue } from '../../types'

interface Props { data: MonthlyRevenue[] }

function fmtY(v: number) { return `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(0)}` }

export function RevenueBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="monthName"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={v => v.slice(0, 3)}
        />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={fmtY} width={48} />
        <Tooltip
          formatter={(value: unknown, name: unknown) => [
            `$${(value as number).toFixed(2)}`,
            name === 'totalRevenue' ? 'Revenue' : 'Profit',
          ]}
          labelFormatter={(label: unknown) => label as string}
          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        <Legend
          formatter={v => v === 'totalRevenue' ? 'Revenue' : 'Profit'}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="totalRevenue" fill="#2d6a4f" radius={[3,3,0,0]} maxBarSize={32} />
        <Bar dataKey="totalProfit"  fill="#52b788" radius={[3,3,0,0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
