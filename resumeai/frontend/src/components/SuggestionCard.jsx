import { AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

const config = {
  critical: { icon: AlertTriangle, bg: 'bg-red-950/50', border: 'border-red-900', text: 'text-red-400', label: 'Critical' },
  warning:  { icon: AlertCircle,  bg: 'bg-amber-950/50', border: 'border-amber-900', text: 'text-amber-400', label: 'Warning' },
  tip:      { icon: Info,         bg: 'bg-blue-950/50', border: 'border-blue-900', text: 'text-blue-400', label: 'Tip' },
  positive: { icon: CheckCircle,  bg: 'bg-brand-500/5', border: 'border-brand-500/20', text: 'text-brand-500', label: 'Good' },
}

export default function SuggestionCard({ type = 'tip', title, body }) {
  const c = config[type] || config.tip
  const Icon = c.icon
  return (
    <div className={clsx('rounded-xl border p-4 flex gap-3', c.bg, c.border)}>
      <Icon size={16} className={clsx('flex-shrink-0 mt-0.5', c.text)} />
      <div>
        <div className="text-sm font-medium text-white mb-0.5">{title}</div>
        <div className="text-xs text-zinc-400 leading-relaxed">{body}</div>
      </div>
    </div>
  )
}
