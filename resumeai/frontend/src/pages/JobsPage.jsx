import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, ExternalLink, BookOpen } from 'lucide-react'
import JobCard from '../components/JobCard'
import { getJobs } from '../utils/api'

const DEMO_JOBS = [
  { id:'1', title:'Staff Software Engineer', company:'Stripe', location:'Remote', salary:'$220K–$280K', posted:'2d ago', match_score:92, matched_skills:['Python','AWS','Docker','SQL'], gap_skills:['Kafka'], description:'Lead distributed systems engineering for Stripe payments infrastructure.', required_skills:['Python','AWS','Docker','SQL','Kafka','Go'], level:'Staff', type:'Full-time' },
  { id:'2', title:'Senior Backend Engineer', company:'OpenAI', location:'SF / Remote', salary:'$200K–$260K', posted:'5d ago', match_score:87, matched_skills:['Python','React','Docker'], gap_skills:['Kubernetes'], description:'Build infrastructure powering the world\'s leading AI systems.', required_skills:['Python','React','Kubernetes','Docker','PostgreSQL'], level:'Senior', type:'Full-time' },
  { id:'3', title:'Platform Engineer', company:'Databricks', location:'Remote', salary:'$190K–$240K', posted:'1w ago', match_score:74, matched_skills:['Python','AWS'], gap_skills:['Spark','Kafka'], description:'Build and scale the Databricks Lakehouse platform.', required_skills:['Python','Spark','Kafka','AWS','Scala'], level:'Senior', type:'Full-time' },
]

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [minMatch, setMinMatch] = useState(0)

  useEffect(() => {
    getJobs()
      .then(res => {
        const data = res.data

        const safeJobs = Array.isArray(data)
          ? data
          : Array.isArray(data?.jobs)
          ? data.jobs
          : []

        const finalJobs = safeJobs.length ? safeJobs : DEMO_JOBS

        setJobs(finalJobs)
        setSelected(finalJobs[0])
      })
      .catch(() => {
        setJobs(DEMO_JOBS)
        setSelected(DEMO_JOBS[0])
      })
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

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="input pl-9"
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <input
          type="range"
          min="0"
          max="90"
          step="5"
          value={minMatch}
          onChange={e => setMinMatch(+e.target.value)}
        />
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <div className="flex flex-col gap-3">
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              selected={selected?.id === job.id}
              onClick={() => setSelected(job)}
            />
          ))}
        </div>

        {selected && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold">{selected.title}</h2>
            <p className="text-sm text-zinc-400">{selected.company}</p>

            <p className="mt-4 text-sm">{selected.description}</p>

            <div className="mt-4 flex gap-2">
              <button className="btn-primary">
                <ExternalLink size={14} /> Apply
              </button>
              <button className="btn-ghost">
                <BookOpen size={14} /> Cover Letter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}