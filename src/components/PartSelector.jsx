import { useMemo } from 'react'

function PartSelector({ label, type, components, value, onChange, disabled }) {
  const options = useMemo(() => components.filter(c => c.type === type), [components, type])

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">{label}</label>
      <select
        className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value || ''}
        onChange={e => onChange(e.target.value || null)}
        disabled={disabled || options.length === 0}
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>
            {opt.name} — ${opt.price}
          </option>
        ))}
      </select>
      {options.length === 0 && (
        <p className="text-xs text-slate-400">No items available. Try seeding demo data.</p>
      )}
    </div>
  )
}

export default PartSelector
