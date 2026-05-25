import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, LabelList, Cell,
} from 'recharts'
import type { SupplierROI } from '../../types'

interface Props { data: SupplierROI[] }

function barColor(roi: number) {
  if (roi >= 50) return '#2d6a4f'
  if (roi >= 20) return '#52b788'
  return '#95d5b2'
}

export function SupplierROIBarChart({ data }: Props) {
  const top5 = [...data]
    .sort((a, b) => b.roiPercentage - a.roiPercentage)
    .slice(0, 5)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={top5} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="supplierName"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={v => v.length > 10 ? v.slice(0, 10) + '…' : v}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={v => `${v}%`}
        />
        <Tooltip
          formatter={(value: unknown) => [`${(value as number).toFixed(1)}%`, 'ROI']}
          contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        <Bar dataKey="roiPercentage" maxBarSize={40} radius={[3, 3, 0, 0]}>
          <LabelList
            dataKey="roiPercentage"
            position="top"
            formatter={(v: unknown) => `${(v as number).toFixed(0)}%`}
            style={{ fontSize: 11, fill: '#374151' }}
          />
          {top5.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.roiPercentage)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
