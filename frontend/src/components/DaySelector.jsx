/** Date picker restricted to January 2026 */
export default function DaySelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-600">Delivery date:</label>
      <input
        type="date"
        min="2026-01-01"
        max="2026-01-31"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      />
      <span className="text-xs text-gray-400">(January 2026)</span>
    </div>
  )
}
