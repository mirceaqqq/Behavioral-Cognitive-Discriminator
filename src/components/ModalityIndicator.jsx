import React from 'react'

/**
 * Shows activation status and confidence for a sensing modality.
 */
const ModalityIndicator = React.memo(({ name, active, confidence, description, icon: Icon, onToggle }) => {
  const statusColor = active ? 'text-emerald-400' : 'text-slate-400'
  const pulseClass = active ? 'shadow-[0_0_12px_rgba(16,185,129,0.8)]' : ''
  const displayConfidence = Math.round(confidence)

  return (
    <div className="glass card-hover flex flex-col gap-3 rounded-2xl border border-border/70 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ${pulseClass}`}>
            <span
              className={`absolute -right-1 -top-1 h-3 w-3 rounded-full ${
                active ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'
              }`}
              aria-hidden="true"
            />
            {Icon && <Icon className={`h-6 w-6 ${statusColor}`} />}
          </div>
          <div>
            <p className="font-medium text-slate-100">{name}</p>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
        {onToggle && (
          <button
            aria-label={`Toggle ${name}`}
            className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-300"
            onClick={onToggle}
          >
            {active ? 'Active' : 'Paused'}
          </button>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-slate-400">Confidence</span>
        <span className="text-sm font-semibold text-slate-50">{displayConfidence}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 transition-all duration-700"
          style={{ width: `${Math.max(5, Math.min(100, displayConfidence))}%` }}
        />
      </div>
    </div>
  )
})

export default ModalityIndicator
