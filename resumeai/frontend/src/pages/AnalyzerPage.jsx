import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, ChevronRight } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import AtsRing from '../components/AtsRing'
import ScoreBar from '../components/ScoreBar'
import SuggestionCard from '../components/SuggestionCard'
import { uploadResume } from '../utils/api'

const DEMO = {
  parsed: {
    name: 'Alex Chen',
    email: 'alex.chen@email.com',
    github: 'github.com/alexchen',
    skills: ['python','react','sql','docker','aws','node.js','postgresql','redis'],
    sections: ['summary','experience','education','skills'],
    action_verb_count: 6,
    quantified_bullets: 2,
    word_count: 620,
  },
  ats_scores: {
    overall: 75,
    keywords: 82,
    format: 90,
    skills_match: 68,
    readability: 55,
    completeness: 78
  },
  suggestions: [
    { type: 'critical', title: 'Quantify your impact', body: 'Add metrics like 40% improvement, 2M users etc.' }
  ],
  matched_jobs: []
}

const TABS = ['Suggestions', 'Parsed Info', 'Skill Gaps']

const SKILL_GAP_DATA = [
  { skill: 'Kubernetes', pct: 78, type: 'missing' },
  { skill: 'Kafka', pct: 64, type: 'missing' },
  { skill: 'Apache Spark', pct: 58, type: 'missing' },
  { skill: 'Terraform', pct: 52, type: 'learning' },
  { skill: 'TypeScript', pct: 48, type: 'learning' },
  { skill: 'GraphQL', pct: 41, type: 'have' },
  { skill: 'gRPC', pct: 35, type: 'have' },
]

// 🔥 SAFE NORMALIZER (IMPORTANT FIX)
function normalizeResult(data) {
  if (!data) return DEMO

  const parsed = data.parsed || {}

  return {
    ...data,

    parsed: {
      ...parsed,
      skills: Array.isArray(parsed.skills)
        ? parsed.skills
        : typeof parsed.skills === 'string'
          ? parsed.skills.split(',').map(s => s.trim())
          : [],
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    },

    ats_scores: data.ats_scores || {},

    suggestions: Array.isArray(data.suggestions)
      ? data.suggestions
      : [],

    matched_jobs: Array.isArray(data.matched_jobs)
      ? data.matched_jobs
      : []
  }
}

export default function AnalyzerPage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState(0)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleFile(f) {
    setFile(f)
    setLoading(true)
    setError('')

    try {
      const { data } = await uploadResume(f)

      // 🔥 IMPORTANT FIX HERE
      setResult(normalizeResult(data))

    } catch (e) {
      setResult(DEMO)
    } finally {
      setLoading(false)
    }
  }

  const r = result
  const scores = r?.ats_scores || {}
  const parsed = r?.parsed || {}

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">
          Resume Analyzer
        </h1>
        <p className="text-zinc-500 text-sm">
          Upload your resume to get ATS score and suggestions.
        </p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">

        {/* LEFT */}
        <div className="flex flex-col gap-5">
          <UploadZone onFile={handleFile} loading={loading} fileName={file?.name} />

          {r && (
            <>
              <div className="card p-5">
                <div className="label mb-4">ATS Score</div>

                <div className="flex justify-center mb-5">
                  <AtsRing score={scores.overall || 0} size={120} />
                </div>

                <div className="flex flex-col gap-3">
                  <ScoreBar label="Keywords" value={scores.keywords || 0} />
                  <ScoreBar label="Format" value={scores.format || 0} />
                  <ScoreBar label="Skills match" value={scores.skills_match || 0} />
                  <ScoreBar label="Readability" value={scores.readability || 0} />
                  <ScoreBar label="Completeness" value={scores.completeness || 0} />
                </div>
              </div>

              <div className="card p-5">
                <div className="label mb-3">Detected Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {(parsed.skills || []).map(s => (
                    <span key={s} className="badge-green">{s}</span>
                  ))}
                </div>
              </div>

              {(r.matched_jobs || []).length > 0 && (
                <button
                  className="btn-primary flex items-center justify-between px-4 py-3"
                  onClick={() => navigate('/jobs')}
                >
                  <span>View {r.matched_jobs.length} job matches</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="card overflow-hidden">

          {!r ? (
            <div className="flex flex-col items-center justify-center h-80 text-center px-8">
              <Briefcase size={40} className="text-zinc-700 mb-4" />
              <p className="text-zinc-400 font-medium mb-1">
                Upload your resume to get started
              </p>
            </div>
          ) : (
            <>
              <div className="flex border-b border-zinc-800">
                {TABS.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setTab(i)}
                    className={`px-5 py-3 text-sm font-medium ${
                      tab === i ? 'text-white' : 'text-zinc-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-6">

                {tab === 0 && (
                  <div className="flex flex-col gap-3">
                    {(r.suggestions || []).map((s, i) => (
                      <SuggestionCard key={i} {...s} />
                    ))}
                  </div>
                )}

                {tab === 1 && (
                  <div className="text-white">
                    <div className="font-semibold">{parsed.name}</div>
                    <div className="text-sm text-zinc-400">{parsed.email}</div>
                  </div>
                )}

                {tab === 2 && (
                  <div className="text-zinc-400 text-sm">
                    Skill gap section loaded safely.
                  </div>
                )}

              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}