function Badge({ status }) {
  const color = status === 'OK' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
  return <span className={`text-xs px-2 py-1 rounded ${color}`}>{status}</span>
}

function BuildSummary({ components, build }) {
  const findById = (id) => components.find(c => c.id === id)

  const items = [
    { key: 'cpu_id', label: 'CPU' },
    { key: 'motherboard_id', label: 'Motherboard' },
    { key: 'ram_id', label: 'RAM' },
    { key: 'gpu_id', label: 'GPU' },
    { key: 'storage_id', label: 'Storage' },
    { key: 'psu_id', label: 'PSU' },
    { key: 'case_id', label: 'Case' },
  ]

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-3">Build Summary</h3>
      <div className="space-y-2">
        {items.map(({ key, label }) => {
          const comp = findById(build[key])
          return (
            <div key={key} className="flex items-center justify-between text-slate-200 text-sm">
              <span className="text-slate-400">{label}</span>
              <span>{comp ? `${comp.name} ($${comp.price})` : '—'}</span>
            </div>
          )
        })}
      </div>
      <div className="h-px bg-slate-700 my-4" />
      <div className="flex items-center justify-between text-white">
        <span>Total Price</span>
        <span className="font-semibold">${(build.total_price ?? 0).toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-slate-300 text-sm mt-1">
        <span>Est. Power</span>
        <span>{build.total_power ?? 0}W</span>
      </div>
      <div className="mt-4 space-y-2">
        {build.compatibility && Object.entries(build.compatibility).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-slate-300 text-xs">
            <span className="capitalize">{k.replaceAll('_',' ')}</span>
            <Badge status={v} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default BuildSummary
