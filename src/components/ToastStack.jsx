import React from 'react'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'

/**
 * Minimal toast stack for alerts.
 */
const ToastStack = ({ toasts }) => {
  const iconFor = (tone) => {
    if (tone === 'danger') return <AlertTriangle className="h-4 w-4 text-amber-400" />
    if (tone === 'success') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    return <Info className="h-4 w-4 text-blue-400" />
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex w-80 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass pointer-events-auto flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/90 p-3 shadow-xl"
        >
          {iconFor(toast.tone)}
          <div>
            <p className="text-sm font-semibold text-slate-50">{toast.title}</p>
            <p className="text-xs text-slate-300">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default React.memo(ToastStack)
