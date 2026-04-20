import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, ExternalLink, BookOpen } from 'lucide-react'
import JobCard from '../components/JobCard'
import { getJobs } from '../utils/api'

const DEMO_JOBS = [
  { id:'1', title:'Staff Software Engineer', company:'Stripe', location:'Remote', salary:'$220K–$280K', posted:'2d ago', match_score:92, matched_skills:['Python','AWS','Docker','SQL'], gap_skills:['Kafka'], description:'Lead distributed systems engineering for Stripe payments infrastructure.', required_skills:['Python','AWS','Docker','SQL','Kafka','Go'], level:'Staff', type:'Full-time' },
  { id:'2', title:'Senior Backend Engineer', company:'OpenAI', location:'SF / Remote', salary:'$200K–$260K', posted:'5d ago', match_score:87, matched_skills:['Python','React','Docker'], gap_skills:['Kubernetes'], description:'Build infrastructure powering the world\'s leading AI systems.', required_skills:['Python','React','Kubernetes','Docker','PostgreSQL'], level:'Senior', type:'Full-time' },
  { id:'3', title:'Platform Engineer', company:'Databricks', location:'Remote', salary:'$190K–$240K', posted:'1w ago', match_score:74, matched_skills:['Python','AWS'], gap_skills:['Spark','Kafka'], description:'Build and scale the Databricks Lakehouse platform.', required_skills:['Python','Spark','Kafka','AWS','Scala'], level:'Senior', type:'Full-time' },
  { id:'4', title:'Software Engineer, Infrastructure', company:'Figma', location:'San Francisco', salary:'$185K–$230K', posted:'3d ago', match_score:71, matched_skills:['React','SQL'], gap_skills:['Kubernetes','Terraform'], description:'Scale Figma\'s real-time collaboration infrastructure.', required_skills:['React','SQL','Kubernetes','Terraform','TypeScript'], level:'Mid-Senior', type:'Full-time' },
  { id:'5', title:'Senior Engineer, Payments', company:'Shopify', location:'Remote', salary:'$175K–$220K', posted:'1w ago', match_score:66, matched_skills:['Python','SQL'], gap_skills:['Kafka','gRPC'], description:'Own Shopify Payments backend, processing $200B+ GMV annually.', required_skills:['Python','SQL','Kafka','gRPC','Ruby'], level:'Senior', type:'Full-time' },
  { id:'6', title:'ML Platform Engineer', company:'Anthropic', location:'San Francisco', salary:'$210K–$270K', posted:'4d ago', match_score:58, matched_skills:['Python'], gap_skills:['Kubernetes','Spark','Terraform'], description:'Build ML training and inference infrastructure for frontier AI models.', required_skills:['Python','Kubernetes','Spark','Terraform','PyTorch'], level:'Senior-Staff', type:'Full-time' },
  { id:'7', title:'Senior Full Stack Engineer', company:'Linear', location:'Remote', salary:'$160K–$200K', posted:'2d ago', match_score:79, matched_skills:['React','SQL','Docker'], gap_skills:['TypeScript','GraphQL'], description:'Build the product used by engineering teams at thousands of companies.', required_skills:['React','TypeScript','GraphQL','Node.js','PostgreSQL'], level:'Senior', type:'Full-time' },
  { id:'8', title:'Data Engineer', company:'Airbnb', location:'SF / Remote', salary:'$170K–$220K', posted:'6d ago', match_score:63, matched_skills:['Python','SQL','AWS'], gap_skills:['Spark','Airflow','dbt'], description:'Build and maintain data infrastructure processing billions of events daily.', required_skills:['Python','SQL','Spark','Airflow','AWS','dbt'], level:'Senior', type:'Full-time' },
]

export default function JobsPage() {
  const [jobs, setJobs] = useState(DEMO_JOBS)
  const [selected, setSelected] = useState(DEMO_JOBS[0])
  const [search, setSearch] = useState('')
  const [minMatch, setMinMatch] = useState(0)
  const [roleFilter, setRoleFilter] = useState('All')

  useEffect(() => {
    getJobs().then(r => setJobs(r.data?.length ? r.data : DEMO_JOBS)).catch(() => setJobs(DEMO_JOBS))
  }, [])

  const filtered = jobs
    .filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()))
    .filter(j => (j.match_score || 0) >= minMatch)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-1">Job Matches</h1>
        <p className="text-zinc-500 text-sm">{filtered.length} jobs ranked by semantic match to your resume</p>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input className="input pl-9" placeholder="Search jobs or companies…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-zinc-500" />
          <span className="text-xs text-zinc-500">Min match:</span>
          <input type="range" min="0" max="90" step="5" value={minMatch} onChange={e => setMinMatch(+e.target.value)} className="w-24" />
          <span className="text-xs text-zinc-400 w-8">{minMatch}%</span>
        </div>
        <select className="input w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option>All</option>
          <option>Backend</option>
          <option>Full Stack</option>
          <option>Platform</option>
          <option>Data</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Job list */}
        <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {filtered.map(job => (
            <JobCard key={job.id} job={job} selected={selected?.id === job.id} onClick={() => setSelected(job)} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-zinc-500 py-12 text-sm">No jobs match your filters.</div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card p-6 h-fit sticky top-20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{selected.title}</h2>
                <p className="text-zinc-400 text-sm mt-0.5">{selected.company} · {selected.location}</p>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${selected.match_score >= 80 ? 'badge-green' : selected.match_score >= 65 ? 'badge-amber' : 'badge-red'}`}>
                {Math.round(selected.match_score)}% match
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Salary', val: selected.salary },
                { label: 'Type', val: selected.type },
                { label: 'Level', val: selected.level },
              ].map(s => (
                <div key={s.label} className="bg-zinc-800 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-0.5">{s.label}</div>
                  <div className="text-sm font-medium text-white">{s.val}</div>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <div className="label mb-2">Description</div>
              <p className="text-sm text-zinc-400 leading-relaxed">{selected.description}</p>
            </div>

            <div className="mb-5">
              <div className="label mb-2">Required Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {(selected.required_skills || []).map(s => {
                  const matched = (selected.matched_skills || []).includes(s)
                  return <span key={s} className={matched ? 'badge-green' : 'badge-red'}>{s}</span>
                })}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>You have it</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>Gap</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-primary flex items-center gap-2 flex-1 justify-center">
                <ExternalLink size={14} /> Apply Now
              </button>
              <button className="btn-ghost flex items-center gap-2">
                <BookOpen size={14} /> Cover Letter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
