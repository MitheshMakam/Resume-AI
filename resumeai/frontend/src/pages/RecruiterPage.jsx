import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, CheckCircle, TrendingUp, Clock } from 'lucide-react'
import { getDashboard } from '../utils/api'

const DEMO_DASHBOARD = {
  total_applicants: 247,
  ats_qualified: 38,
  high_match: 22,
  avg_ats_score: 64,
  pipeline: { all: 247, ats_pass: 38, phone_screen: 14, onsite: 6, offer: 2 },
  skill_frequency: [
    { skill: 'Python', pct: 91 }, { skill: 'AWS', pct: 76 }, { skill: 'Docker', pct: 68 },
    { skill: 'SQL', pct: 65 }, { skill: 'React', pct: 58 }, { skill: 'Kubernetes', pct: 44 },
    { skill: 'Kafka', pct: 32 }, { skill: 'Terraform', pct: 28 }, { skill: 'Spark', pct: 21 },
  ],
  top_candidates: []
}

function StatCard({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
          <Icon size={15} className="text-zinc-400" />
        </div>
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <div className={`text-3xl font-semibold ${color}`}>{value ?? 0}</div>
    </div>
  )
}

const FUNNEL_COLORS = {
  all:'#3f3f46',
  ats_pass:'#1D9E75',
  phone_screen:'#0F6E56',
  onsite:'#085041',
  offer:'#04342C'
}

const FUNNEL_LABELS = {
  all:'All Applicants',
  ats_pass:'ATS Pass',
  phone_screen:'Phone Screen',
  onsite:'Onsite',
  offer:'Offer'
}

export default function RecruiterPage() {
  const [data, setData] = useState(DEMO_DASHBOARD)
  const [minAts, setMinAts] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboard()
        console.log("API:", res.data)

        if (res.data) {
          setData(res.data)
        }
      } catch (err) {
        console.error("API FAILED → using demo data", err)
        setData(DEMO_DASHBOARD) // fallback
      }
    }

    fetchData()
  }, [])

  const candidates = (data.top_candidates || []).filter(c => c.ats_score >= minAts)

  const pipelineData = Object.entries(data.pipeline || {}).map(([k, v]) => ({
    name: FUNNEL_LABELS[k] || k,
    value: v,
    key: k
  }))

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Recruiter Dashboard</h1>
        <p className="text-zinc-500 text-sm">
          Candidate pipeline, ATS ranking, and skill intelligence.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Applicants" value={data.total_applicants} />
        <StatCard icon={CheckCircle} label="ATS Qualified" value={data.ats_qualified} color="text-brand-500" />
        <StatCard icon={TrendingUp} label="High Match (>80%)" value={data.high_match} color="text-amber-400" />
        <StatCard icon={Clock} label="Avg ATS Score" value={data.avg_ats_score} />
      </div>

      {/* Funnel */}
      <div className="card p-6 mb-8">
        <div className="label mb-4">Hiring Funnel</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={pipelineData} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Bar dataKey="value">
              {pipelineData.map((entry) => (
                <Cell key={entry.key} fill={FUNNEL_COLORS[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}