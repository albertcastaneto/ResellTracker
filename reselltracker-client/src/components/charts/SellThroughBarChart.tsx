import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, LabelList,
} from 'recharts'
import type { SellThrough } from '../../types'

interface Props { data: SellThrough[] }

function barColor(rate: number) {
  if (rate >= 70) return '#2d6a4f'
  if (rate >= 40) return '#52b788'
  return '#95d5b2'
}

export function SellThroughBarChart({ data }: Props) {
  const rows = data.filter(d => !d.isOverall).slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 36 + 40)}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 4, right: 56, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={v => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="categoryName"
          tick={{ fontSize: 11, fill: '#374151' }}
          width={96}
        />
        <Tooltip
          formatter={(value: unknown) => [`${(value as number).toFixed(1)}%`, 'Sell-through']}
          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        <Bar dataKey="sellThroughRate" maxBarSize={22} radius={[0, 3, 3, 0]}>
          <LabelList
            dataKey="sellThroughRate"
            position="right"
            formatter={(v: unknown) => `${(v as number).toFixed(0)}%`}
            style={{ fontSize: 11, fill: '#6b7280' }}
          />
          {rows.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.sellThroughRate)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
