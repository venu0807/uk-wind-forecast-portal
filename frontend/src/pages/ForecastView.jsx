import { useState, useEffect } from 'react'
import { fetchActuals, fetchForecasts } from '../api/client'
import DaySelector from '../components/DaySelector'
import TimeSeriesChart from '../components/TimeSeriesChart'
import MetricsCard from '../components/MetricsCard'
import { formatDateTime } from '../utils/formatters'

export default function ForecastView() {
  const [date, setDate] = useState('2026-01-15')
  const [actuals, setActuals] = useState([])
  const [forecastData, setForecastData] = useState({ decision: [], all_publish_times: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [act, fc] = await Promise.all([fetchActuals(date), fetchForecasts(date)])
        setActuals(act)
        setForecastData(fc)
      } catch (e) {
        setError('Failed to load data from Elexon BMRS. Please try again.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [date])

  const publishTime = forecastData.decision[0]?.publishTime

  // Compute summary stats
  const avgActual =
    actuals.length > 0
      ? actuals.reduce((s, a) => s + a.generation, 0) / actuals.length
      : null
  const peakActual = actuals.length > 0 ? Math.max(...actuals.map((a) => a.generation)) : null
  const avgForecast =
    forecastData.decision.length > 0
      ? forecastData.decision.reduce((s, f) => s + f.generation, 0) / forecastData.decision.length
      : null
  const peakForecast =
    forecastData.decision.length > 0
      ? Math.max(...forecastData.decision.map((f) => f.generation))
      : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Wind Generation — Forecast vs Actual</h1>
        <p className="text-gray-500 text-sm mt-1">
          Showing the{' '}
          <strong className="text-gray-700">day-ahead decision forecast</strong> — the last WINDFOR
          publish before the N2EX gate closure at{' '}
          <span className="font-mono bg-gray-100 px-1 rounded">09:50 UTC</span> on the day prior to
          delivery.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white border border-gray-200 rounded-xl px-4 py-3">
        <DaySelector value={date} onChange={setDate} />
        {publishTime && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500">Decision forecast issued:</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              {formatDateTime(publishTime)}
            </span>
          </div>
        )}
      </div>

      {/* Loading / Error states */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Loading from Elexon BMRS…
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
          {/* Chart */}
          <TimeSeriesChart actuals={actuals} forecast={forecastData.decision} />

          {/* KPI Cards */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricsCard label="Peak Actual" value={peakActual} color="green" subtitle="Max MW in day" />
            <MetricsCard label="Peak Forecast" value={peakForecast} color="blue" subtitle="Max MW forecast" />
            <MetricsCard label="Avg Actual" value={avgActual} color="green" subtitle="Day average MW" />
            <MetricsCard label="Avg Forecast" value={avgForecast} color="blue" subtitle="Forecast average MW" />
          </div>

          {/* Warning when no decision forecast */}
          {forecastData.decision.length === 0 && actuals.length > 0 && (
            <div className="mt-4 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              ⚠️ <strong>No decision forecast found</strong> for {date}. No WINDFOR forecast was
              published before 09:50 UTC on the preceding day. The team would have had to rely on an
              earlier forecast run.
            </div>
          )}

          {/* Forecast version info */}
          {forecastData.all_publish_times.length > 1 && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500">
              <strong className="text-gray-700">All forecast versions available for {date}:</strong>{' '}
              {forecastData.all_publish_times.map((t) => t.slice(11, 16) + ' UTC').join(', ')} —
              Decision uses the{' '}
              <span className="font-semibold text-blue-600">
                {publishTime ? publishTime.slice(11, 16) + ' UTC' : '—'}
              </span>{' '}
              run (last before 09:50 gate)
            </div>
          )}
        </>
      )}
    </div>
  )
}
