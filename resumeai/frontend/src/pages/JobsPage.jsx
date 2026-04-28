import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, ExternalLink, BookOpen } from 'lucide-react'
import JobCard from '../components/JobCard'
import { getJobs } from '../utils/api'

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [minMatch, setMinMatch] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      try {
        // 🔥 get resume text from localStorage
        const resumeText = localStorage.getItem('resume_text') || ''

        const res = await getJobs({
          role: 'developer',
          location: 'india',
          resume: resumeText
        })

        // ✅ SAFE PARSE (no more filter/forEach errors)
        const data = res?.data

        const safeJobs = Array.isArray(data)
          ? data
          : Array.isArray(data?.jobs)
          ? data.jobs
          : []

        setJobs(safeJobs)
        setSelected(safeJobs[0] || null)

      } catch (err) {
        console.error("Jobs fetch error:", err)
        setJobs([])
        setSelected(null)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const safeJobs = Array.isArray(jobs) ? jobs : []

  const filtered = safeJobs
    .filter(j =>
      !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(j => (j.match_score || 0) >= minMatch)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      <h1 className="text-2xl font-semibold text-white mb-4">Job Matches</h1>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="input pl-9"
            placeholder="Search jobs or companies…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-zinc-500" />
          <span className="text-xs text-zinc-500">Min match:</span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minMatch}
            onChange={e => setMinMatch(+e.target.value)}
          />
          <span className="text-xs text-zinc-400 w-8">{minMatch}%</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-zinc-400 text-sm">Loading jobs...</div>
      )}

      {/* Main */}
      {!loading && (
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">

          {/* LEFT LIST */}
          <div className="flex flex-col gap-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                selected={selected?.id === job.id}
                onClick={() => setSelected(job)}
              />
            ))}

            {filtered.length === 0 && (
              <div className="text-center text-zinc-500 py-10 text-sm">
                No jobs match your filters.
              </div>
            )}
          </div>

          {/* RIGHT DETAIL */}
          {selected && (
            <div className="card p-6 sticky top-20 h-fit">

              <div className="flex justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {selected.title}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {selected.company} · {selected.location}
                  </p>
                </div>

                <span className="badge-green">
                  {Math.round(selected.match_score || 0)}%
                </span>
              </div>

              <p className="text-sm text-zinc-400 mb-5">
                {selected.description}
              </p>

              {/* Skills */}
              <div className="mb-5">
                <div className="label mb-2">Matched Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.matched_skills || []).map(s => (
                    <span key={s} className="badge-green">{s}</span>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <div className="label mb-2">Missing Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.gap_skills || []).map(s => (
                    <span key={s} className="badge-red">{s}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary flex items-center gap-2"
                >
                  <ExternalLink size={14} /> Apply
                </a>

                <button className="btn-ghost flex items-center gap-2">
                  <BookOpen size={14} /> Cover Letter
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  )
}