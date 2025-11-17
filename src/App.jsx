import { useEffect, useMemo, useState } from 'react'
import PartSelector from './components/PartSelector'
import BuildSummary from './components/BuildSummary'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [buildName, setBuildName] = useState('My First PC')
  const [selection, setSelection] = useState({
    cpu_id: null,
    motherboard_id: null,
    ram_id: null,
    gpu_id: null,
    storage_id: null,
    psu_id: null,
    case_id: null,
  })
  const [result, setResult] = useState({ total_price: 0, total_power: 0, compatibility: {} })

  const fetchComponents = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/components`)
      const data = await res.json()
      setComponents(data)
      setStatus('ready')
    } catch (e) {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const seedIfEmpty = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/components`)
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        await fetch(`${baseUrl}/api/components/seed`, { method: 'POST' })
      }
    } catch {}
  }

  useEffect(() => {
    (async () => {
      await seedIfEmpty()
      await fetchComponents()
    })()
  }, [])

  const updateSelection = (key, value) => {
    setSelection(prev => ({ ...prev, [key]: value }))
  }

  const canSave = useMemo(() => Object.values(selection).some(Boolean), [selection])

  const saveBuild = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/builds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: buildName, ...selection })
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)]" />

      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold">PC</div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">PC Builder</h1>
            <p className="text-slate-300 text-sm -mt-1">Pick parts. Check compatibility. Save your build.</p>
          </div>
        </div>
        <a href="/test" className="text-slate-400 hover:text-white text-sm">System Check</a>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-20 pt-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Choose Your Parts</h2>
                <button
                  onClick={fetchComponents}
                  className="text-xs px-3 py-1 rounded bg-slate-700 text-slate-200 hover:bg-slate-600"
                >Refresh</button>
              </div>

              {loading ? (
                <p className="text-slate-300 text-sm">Loading components...</p>
              ) : status === 'error' ? (
                <div className="text-red-300 text-sm">Could not load components. Ensure backend is running.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PartSelector label="CPU" type="cpu" components={components} value={selection.cpu_id} onChange={v => updateSelection('cpu_id', v)} />
                  <PartSelector label="Motherboard" type="motherboard" components={components} value={selection.motherboard_id} onChange={v => updateSelection('motherboard_id', v)} />
                  <PartSelector label="RAM" type="ram" components={components} value={selection.ram_id} onChange={v => updateSelection('ram_id', v)} />
                  <PartSelector label="GPU" type="gpu" components={components} value={selection.gpu_id} onChange={v => updateSelection('gpu_id', v)} />
                  <PartSelector label="Storage" type="storage" components={components} value={selection.storage_id} onChange={v => updateSelection('storage_id', v)} />
                  <PartSelector label="PSU" type="psu" components={components} value={selection.psu_id} onChange={v => updateSelection('psu_id', v)} />
                  <PartSelector label="Case" type="case" components={components} value={selection.case_id} onChange={v => updateSelection('case_id', v)} />
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <input
                  className="flex-1 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={buildName}
                  onChange={e => setBuildName(e.target.value)}
                />
                <button
                  onClick={saveBuild}
                  disabled={!canSave}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                >Save Build</button>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3">Your Saved Builds</h3>
              <SavedBuilds baseUrl={baseUrl} onLoad={setSelection} />
            </div>
          </div>

          <div>
            <BuildSummary components={components} build={{ ...selection, ...result }} />
          </div>
        </div>
      </main>
    </div>
  )
}

function SavedBuilds({ baseUrl, onLoad }) {
  const [items, setItems] = useState([])

  const load = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/builds`)
      const data = await res.json()
      setItems(data)
    } catch {}
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-slate-400 text-sm">No builds yet. Create one and hit Save.</p>
      ) : items.map(b => (
        <div key={b.id} className="flex items-center justify-between bg-slate-900/40 border border-slate-700 rounded-xl p-3">
          <div>
            <div className="text-slate-200 text-sm font-medium">{b.name}</div>
            <div className="text-slate-400 text-xs">${b.total_price?.toFixed(2)} • {b.total_power}W</div>
          </div>
          <button
            onClick={() => onLoad({
              cpu_id: b.cpu_id, motherboard_id: b.motherboard_id, ram_id: b.ram_id, gpu_id: b.gpu_id,
              storage_id: b.storage_id, psu_id: b.psu_id, case_id: b.case_id
            })}
            className="text-xs px-3 py-1 rounded bg-slate-700 text-slate-200 hover:bg-slate-600"
          >Load</button>
        </div>
      ))}
      <button onClick={load} className="text-xs px-3 py-1 rounded bg-slate-700 text-slate-200 hover:bg-slate-600">Refresh</button>
    </div>
  )
}

export default App
