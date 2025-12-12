import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/**
 * Collection of heavier charts, separated for lazy loading.
 */
const BehaviorCharts = ({ timeline, reactivity, fingerprint }) => {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass rounded-2xl border border-border/70 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Temporal Behavioral Patterns
          </p>
          <span className="text-xs text-slate-400">Attention vs Stress</span>
        </div>
        <div className="h-52">
          <ResponsiveContainer>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Legend />
              <Line type="monotone" dataKey="attention" stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="stress" stroke="#f59e0b" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border/70 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Emotional Reactivity</p>
          <span className="text-xs text-slate-400">Drift & spikes</span>
        </div>
        <div className="h-52">
          <ResponsiveContainer>
            <AreaChart data={reactivity}>
              <defs>
                <linearGradient id="reactivityGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Area
                type="monotone"
                dataKey="reactivity"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#reactivityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border/70 p-4 lg:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Behavioral Fingerprint</p>
          <span className="text-xs text-slate-400">Radar distribution</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <RadarChart data={fingerprint}>
              <PolarGrid stroke="rgba(148,163,184,0.4)" />
              <PolarAngleAxis dataKey="trait" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar
                name="Pattern"
                dataKey="score"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.35}
                dot={{ fill: '#3b82f6', r: 3 }}
              />
              <Radar
                name="Drift"
                dataKey="drift"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.18}
                dot={{ fill: '#ef4444', r: 3 }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default React.memo(BehaviorCharts)
