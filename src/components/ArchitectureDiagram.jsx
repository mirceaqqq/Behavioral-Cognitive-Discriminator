import React from 'react'
import { Cpu, Network, Database, BrainCircuit, ActivitySquare } from 'lucide-react'

const icons = {
  input: ActivitySquare,
  encoder: Database,
  fusion: Network,
  discriminator: BrainCircuit,
  output: Cpu,
}

/**
 * Lightweight architecture diagram with connection hints.
 */
const ArchitectureDiagram = ({ stages }) => {
  return (
    <div className="glass rounded-2xl border border-border/70 p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">System Architecture</p>
      <div className="mt-3 grid gap-3 md:grid-cols-5">
        {stages.map((stage) => {
          const Icon = icons[stage.kind] ?? Cpu
          return (
            <div
              key={stage.title}
              className="relative flex h-full flex-col gap-2 overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 p-3"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
              <div className="relative flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{stage.title}</p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">{stage.subtitle}</p>
                </div>
              </div>
              <div className="relative flex flex-wrap gap-2">
                {stage.nodes.map((node) => (
                  <span
                    key={node}
                    className="rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-emerald-400/30 px-3 py-1 text-[11px] text-slate-100"
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(ArchitectureDiagram)
