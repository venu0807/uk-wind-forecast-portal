import { formatMW } from '../utils/formatters'

function biasColor(bias) {
  if (bias == null) return 'text-gray-400'
  if (bias > 300) return 'text-red-600 font-semibold'
  if (bias < -300) return 'text-orange-600 font-semibold'
  if (bias > 100) return 'text-amber-600'
  return 'text-green-700'
}

export default function AccuracyTable({ rows = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b border-gray-200">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">
              MAE
              <span className="normal-case font-normal ml-1 text-gray-400">(mean |error|)</span>
            </th>
            <th className="px-4 py-3">
              RMSE
              <span className="normal-case font-normal ml-1 text-gray-400">(large errors)</span>
            </th>
            <th className="px-4 py-3">
              Bias
              <span className="normal-case font-normal ml-1 text-gray-400">(+over / −under)</span>
            </th>
            <th className="px-4 py-3">Periods</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => (
            <tr key={r.date} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2.5 font-medium text-gray-800">{r.date}</td>
              <td className="px-4 py-2.5">{formatMW(r.mae)}</td>
              <td className="px-4 py-2.5">{formatMW(r.rmse)}</td>
              <td className={`px-4 py-2.5 ${biasColor(r.bias)}`}>{formatMW(r.bias)}</td>
              <td className="px-4 py-2.5 text-gray-500">{r.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
