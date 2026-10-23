export default function MetricsCard({ label, value, unit = 'MW', color = 'blue', subtitle }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800',
  }

  return (
    <div className={`border rounded-xl p-4 ${colors[color] || colors.blue}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-bold">
        {value != null ? `${Math.round(value).toLocaleString('en-GB')} ${unit}` : '—'}
      </p>
      {subtitle && (
        <p className="text-xs mt-1 opacity-60">{subtitle}</p>
      )}
    </div>
  )
}
