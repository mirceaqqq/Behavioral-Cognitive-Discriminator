import React from 'react'
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'

/**
 * Semi-circle gauge for risk-style metrics using Recharts RadialBarChart.
 */
const RiskGauge = React.memo(({ label, value, thresholds = [], color = '#ef4444' }) => {
  const displayValue = Math.round(value)
  const data = [{ name: label, value: displayValue, fill: color }]

  return (
    <div className="glass card-hover relative flex flex-col gap-2 rounded-2xl border border-border/70 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-wide text-slate-400">{label}</p>
        <span className="text-lg font-semibold text-slate-50">{displayValue}%</span>
      </div>
      <div className="relative h-36 w-full">
        <ResponsiveContainer>
          <RadialBarChart
            data={data}
            startAngle={220}
            endAngle={-40}
            innerRadius="60%"
            outerRadius="100%"
            barCategoryGap={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background cornerRadius={12} dataKey="value" />
          </RadialBarChart>
        </ResponsiveContainer>
        {thresholds.map((t, index) => (
          <div
            key={`${label}-${index}`}
            className="absolute inset-0"
            style={{
              transform: `rotate(${(t / 100) * 260 - 130}deg)`,
              transformOrigin: '50% 100%',
            }}
            aria-hidden="true"
          >
            <div className="absolute bottom-[18%] left-1/2 h-6 w-[2px] -translate-x-1/2 rounded-full bg-white/60" />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        {value > (thresholds[thresholds.length - 1] ?? 70)
          ? 'Elevated risk detected'
          : 'Operating within expected bounds'}
      </p>
    </div>
  )
})

export default RiskGauge
