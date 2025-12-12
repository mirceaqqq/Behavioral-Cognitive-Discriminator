import React from 'react'
import { Activity, Brain, Zap, Shield, Users, Network, Settings, Eye, BarChart3 } from 'lucide-react'

const NAV_ICONS = {
  overview: Activity,
  inference: Eye,
  discriminator: Brain,
  fusion: Network,
  ethics: Shield,
  personality: Users,
  behavioral: Zap,
  performance: BarChart3,
}

/**
 * Sidebar navigation for module switching.
 */
const NavigationBar = ({ active, onChange, onOpenSettings }) => {
  const items = [
    { id: 'overview', label: 'System Overview' },
    { id: 'behavioral', label: 'Behavioral Inference' },
    { id: 'discriminator', label: 'Cognitive Discriminator' },
    { id: 'fusion', label: 'Multi-Modal Fusion' },
    { id: 'ethics', label: 'Ethics & Interpretability' },
    { id: 'personality', label: 'Personality Modeling' },
    { id: 'performance', label: 'Performance' },
  ]

  return (
    <nav className="glass sticky top-4 flex h-[calc(100vh-2rem)] flex-col justify-between rounded-2xl border border-border/70 p-4">
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.id] ?? Activity
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                isActive
                  ? 'border-emerald-400/50 bg-white/5 text-white shadow-glow'
                  : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5'
              }`}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
      <button
        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-300"
        onClick={onOpenSettings}
        aria-label="Settings and configuration"
      >
        <Settings className="h-5 w-5" />
        Settings & Configuration
      </button>
    </nav>
  )
}

export default React.memo(NavigationBar)
