import React from 'react'

/**
 * Displays a single cognitive metric with gradient progress, pulse, and context.
 */
const CognitiveStateCard = React.memo(
  ({
    title,
    value,
    gradient,
    accent,
    icon: Icon,
    description,
    privacyMode,
    trend = 'stable',
  }) => {
    const displayValue = privacyMode ? '•••' : `${Math.round(value)}%`
    const trendColor =
      trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'

    return (
      <div
        className="glass card-hover relative overflow-hidden rounded-2xl border border-border/70 p-4"
        aria-label={`${title} card`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-40" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${accent}`}
            >
              {Icon && <Icon className="h-6 w-6 text-white" aria-hidden="true" />}
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">{title}</p>
              <p className="text-3xl font-semibold text-slate-50">{displayValue}</p>
            </div>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className={`text-xs font-medium ${trendColor}`}>
              {trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable'}
            </span>
            <span className="text-xs text-slate-500">{description}</span>
          </div>
        </div>

        <div className="relative mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-800/80">
          <div
            className={`h-full ${gradient} transition-all duration-700`}
            style={{ width: `${Math.max(1, Math.min(100, value))}%` }}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(value)}
            role="progressbar"
          />
          <div className="absolute inset-0 animate-pulse bg-white/5" style={{ opacity: 0.05 }} />
        </div>
      </div>
    )
  },
)

export default CognitiveStateCard
