import React from 'react'

/**
 * Natural language explanation with feature highlights.
 */
const ExplanationPanel = ({ title, summary, highlights = [], badges = [] }) => {
  return (
    <div className="glass rounded-2xl border border-border/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">{title}</p>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-emerald-300"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-200">{summary}</p>
      {highlights.length > 0 && (
        <ul className="mt-3 space-y-2 text-xs text-slate-400">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default React.memo(ExplanationPanel)
