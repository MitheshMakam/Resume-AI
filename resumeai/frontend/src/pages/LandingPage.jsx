import { useNavigate } from 'react-router-dom'
import { Zap, Target, TrendingUp, Shield, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Instant ATS Scoring', desc: 'Get your resume scored against real ATS algorithms in seconds. Know exactly where you stand.' },
  { icon: Target, title: 'Semantic Job Matching', desc: 'AI embeddings match your resume to jobs by meaning, not just keywords. Find roles you actually fit.' },
  { icon: TrendingUp, title: 'Skill Gap Detection', desc: 'See exactly which skills are holding you back, with a personalized learning roadmap.' },
  { icon: Shield, title: 'Recruiter Dashboard', desc: 'For hiring teams: rank candidates by match score, detect skill gaps, and speed up screening.' },
]

const stats = [
  { val: '3.2×', label: 'more interviews' },
  { val: '847', label: 'jobs analyzed daily' },
  { val: '94%', label: 'ATS accuracy' },
  { val: '<5s', label: 'parse time' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-brand-500 text-sm font-medium mb-8">
          <Zap size={13} /> Powered by sentence-transformers + spaCy
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold text-white leading-tight mb-6">
          Your resume, <span className="text-brand-500">scored</span>.<br />
          Your next job, <span className="text-brand-500">matched</span>.
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
          Upload your resume and get an instant ATS score, AI-powered improvement suggestions,
          semantic job matches, and a skill gap analysis — all in under 5 seconds.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button className="btn-primary flex items-center gap-2 px-6 py-3 text-base" onClick={() => navigate('/analyzer')}>
            Analyze my resume <ArrowRight size={16} />
          </button>
          <button className="btn-ghost px-6 py-3 text-base" onClick={() => navigate('/recruiter')}>
            Recruiter dashboard
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.val} className="card p-5 text-center">
              <div className="text-3xl font-semibold text-brand-500 mb-1">{s.val}</div>
              <div className="text-sm text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold text-white text-center mb-12">Everything you need to land the job</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map(f => (
            <div key={f.title} className="card p-6 flex gap-4">
              <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <f.icon size={18} className="text-brand-500" />
              </div>
              <div>
                <div className="font-medium text-white mb-1">{f.title}</div>
                <div className="text-sm text-zinc-400 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="border-t border-zinc-800 py-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="label mb-4">Built with</div>
          <div className="flex flex-wrap justify-center gap-3">
            {['React + Vite','Tailwind CSS','FastAPI','sentence-transformers','spaCy','pdfplumber','Recharts','Docker'].map(t => (
              <span key={t} className="badge-zinc px-3 py-1.5 text-xs">{t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
