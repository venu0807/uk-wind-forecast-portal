import { useState, useEffect } from 'react'
import { fetchAccuracy } from '../api/client'
import MetricsCard from '../components/MetricsCard'
import AccuracyTable from '../components/AccuracyTable'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts'

export default function AccuracyView() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAccuracy()
      .then(setRows)
      .catch(() => setError('Failed to load accuracy data from Elexon BMRS.'))
      .finally(() => setLoading(false))
  }, [])

  const validRows = rows.filter((r) => r.mae != null)
  const avgMAE =
    validRows.length > 0
      ? validRows.reduce((s, r) => s + r.mae, 0) / validRows.length
      : null
  const avgRMSE =
    validRows.length > 0
      ? validRows.reduce((s, r) => s + r.rmse, 0) / validRows.length
      : null
  const avgBias =
    validRows.length > 0
      ? validRows.reduce((s, r) => s + r.bias, 0) / validRows.length
      : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Forecast Accuracy — January 2026</h1>
        <p className="text-gray-500 text-sm mt-1">
          Daily accuracy metrics comparing the{' '}
          <strong className="text-gray-700">N2EX gate-closure decision forecast</strong> (last
          WINDFOR publish before 09:50 UTC, day prior) against Elexon FUELHH wind actuals. Computed
          across all 48 half-hour settlement periods per delivery day.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Computing January 2026 accuracy metrics…
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Metric explanation cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <MetricsCard
              label="Mean MAE — Jan avg"
              value={avgMAE}
              color="blue"
              subtitle="Average MW error per half-hour"
            />
            <MetricsCard
              label="Mean RMSE — Jan avg"
              value={avgRMSE}
              color="yellow"
              subtitle="Penalises large errors more"
            />
            <MetricsCard
              label="Mean Bias — Jan avg"
              value={avgBias}
              color={avgBias != null && avgBias > 0 ? 'red' : 'green'}
              subtitle={
                avgBias != null
                  ? avgBias > 0
                    ? 'Over-forecast on average (buy less than forecast)'
                    : 'Under-forecast on average (may need spot top-up)'
                  : ''
              }
            />
          </div>

          {/* Metric definitions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-xs text-blue-800 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <strong>MAE</strong> = mean(|forecast − actual|)<br />
              Typical average MW off target per period
            </div>
            <div>
              <strong>RMSE</strong> = √mean((forecast − actual)²)<br />
              Highlights extreme misses — key for grid risk
            </div>
            <div>
              <strong>Bias</strong> = mean(forecast − actual)<br />
              +ve = over-forecast · −ve = under-forecast
            </div>
          </div>

          {/* Bias bar chart */}
          {validRows.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Daily Forecast Bias (MW)
                <span className="text-xs font-normal text-gray-400 ml-2">
                  Red = over-forecast · Blue = under-forecast
                </span>
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={validRows}
                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    tickFormatter={(d) => d.slice(8)} // show day number only
                    label={{
                      value: 'January 2026 (day)',
                      position: 'insideBottomRight',
                      offset: -4,
                      fontSize: 10,
                      fill: '#9ca3af',
                    }}
                  />
                  <YAxis unit=" MW" tick={{ fontSize: 10, fill: '#6b7280' }} width={72} />
                  <Tooltip
                    formatter={(v) => [`${Math.round(v).toLocaleString('en-GB')} MW`, 'Bias']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1.5} />
                  <Bar dataKey="bias" radius={[3, 3, 0, 0]} name="Bias">
                    {validRows.map((entry) => (
                      <Cell
                        key={entry.date}
                        fill={entry.bias >= 0 ? '#ef4444' : '#3b82f6'}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily breakdown table */}
          <AccuracyTable rows={rows} />
        </>
      )}
    </div>
  )
}
