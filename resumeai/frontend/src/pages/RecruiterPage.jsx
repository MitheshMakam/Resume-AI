import { useEffect, useState } from 'react'
import axios from 'axios'

export default function RecruiterPage() {
  const [stats, setStats] = useState(null)
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    // dashboard stats
    axios.get('/api/recruiter/dashboard')
      .then(res => setStats(res.data))
      .catch(() => setStats(null))

    // candidate list
    axios.get('/api/recruiter/candidates')
      .then(res => {
        const data = res.data
        setCandidates(Array.isArray(data) ? data : [])
      })
      .catch(() => setCandidates([]))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 text-white">
      <h1 className="text-2xl font-semibold mb-6">Recruiter Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card p-4">Total: {stats.total_applicants}</div>
          <div className="card p-4">ATS Qualified: {stats.ats_qualified}</div>
          <div className="card p-4">High Match: {stats.high_match}</div>
          <div className="card p-4">Avg Score: {stats.avg_ats_score}</div>
        </div>
      )}

      {/* Candidates */}
      <div className="card p-4">
        <h2 className="mb-4">Candidates</h2>

        {candidates.length === 0 && (
          <div className="text-zinc-400">No candidates found</div>
        )}

        {candidates.map(c => (
          <div key={c.id} className="border-b border-zinc-800 py-3">
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-zinc-400">{c.email}</div>
            <div className="text-sm">
              ATS: {c.ats_score} | Match: {c.match_score}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}