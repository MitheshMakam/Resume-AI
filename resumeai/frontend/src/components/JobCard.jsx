import { MapPin, Clock, DollarSign } from 'lucide-react'
import clsx from 'clsx'

function MatchBadge({ score }) {
  const cls = score >= 80 ? 'badge-green' : score >= 65 ? 'badge-amber' : 'badge-red'
  return <span className={cls}>{Math.round(score)}% match</span>
}

export default function JobCard({ job, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'card p-5 cursor-pointer transition-all hover:border-zinc-600',
        selected && 'border-brand-500 ring-1 ring-brand-500/30'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-medium text-white text-sm">{job.title}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{job.company}</div>
        </div>
        <MatchBadge score={job.match_score || 0} />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <span className="flex items-center gap-1 text-xs text-zinc-500"><MapPin size={11} />{job.location}</span>
        <span className="flex items-center gap-1 text-xs text-zinc-500"><DollarSign size={11} />{job.salary}</span>
        <span className="flex items-center gap-1 text-xs text-zinc-500"><Clock size={11} />{job.posted}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(job.matched_skills || []).slice(0, 4).map(s => (
          <span key={s} className="badge-zinc text-xs">{s}</span>
        ))}
        {(job.gap_skills || []).slice(0, 3).map(s => (
          <span key={s} className="badge-red text-xs">{s}</span>
        ))}
      </div>
    </div>
  )
}
