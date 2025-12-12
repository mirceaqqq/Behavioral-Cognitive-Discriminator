import React from 'react'

/**
 * Big Five personality trait bar with adaptive threshold marker.
 */
const PersonalityBar = React.memo(({ trait, score, description, threshold = 50 }) => {
  const displayScore = Math.round(score)
  const thresholdPosition = Math.min(100, Math.max(0, threshold))

  return (
    <div className="space-y-2 rounded-xl border border-border/70 bg-slate-900/60 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-100">{trait}</p>
          <p className="text-xs text-slate-500" title={description}>
            {description}
          </p>
        </div>
        <span className="text-sm font-semibold text-slate-50">{displayScore}/100</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400 transition-all duration-700"
          style={{ width: `${displayScore}%` }}
        />
        <div
          className="absolute top-[-2px] h-6 w-[2px] bg-white/70"
          style={{ left: `${thresholdPosition}%` }}
          title="Adaptive threshold"
        />
      </div>
    </div>
  )
})

export default PersonalityBar
