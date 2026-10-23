import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { toMinutesFromMidnight } from '../utils/formatters'

function minutesToHHMM(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}

/**
 * actuals:  [{startTime: string, generation: number}]
 * forecast: [{startTime: string, generation: number}]
 */
export default function TimeSeriesChart({ actuals = [], forecast = [] }) {
  const actualMap = Object.fromEntries(
    actuals.map((a) => [toMinutesFromMidnight(a.startTime), a.generation])
  )
  const forecastMap = Object.fromEntries(
    forecast.map((f) => [toMinutesFromMidnight(f.startTime), f.generation])
  )
  const allMinutes = [
    ...new Set([...Object.keys(actualMap), ...Object.keys(forecastMap)]),
  ]
    .map(Number)
    .sort((a, b) => a - b)

  const chartData = allMinutes.map((m) => ({
    time: minutesToHHMM(m),
    actual: actualMap[m] ?? null,
    forecast: forecastMap[m] ?? null,
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available for this date
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            interval={5}
            label={{ value: 'UTC Time', position: 'insideBottomRight', offset: -8, fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis
            unit=" MW"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            width={80}
          />
          <Tooltip
            formatter={(v, name) => [
              v != null ? `${Math.round(v).toLocaleString('en-GB')} MW` : '—',
              name,
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={false}
            name="Actual Generation"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            strokeDasharray="6 3"
            name="Decision Forecast"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
