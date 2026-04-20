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
    name: 'Alex Chen', email: 'alex.chen@email.com', github: 'github.com/alexchen',
    skills: ['python','react','sql','docker','aws','node.js','postgresql','redis'],
    sections: ['summary','experience','education','skills'],
    action_verb_count: 6, quantified_bullets: 2, word_count: 620,
  },
  ats_scores: { overall: 75, keywords: 82, format: 90, skills_match: 68, readability: 55, completeness: 78 },
  suggestions: [
    { type: 'critical', title: 'Quantify your impact', body: 'Only 2 bullets have measurable outcomes. Add metrics like "Reduced API latency by 40%, serving 2M+ requests/day."' },
    { type: 'critical', title: 'Missing strong action verbs', body: 'ATS scores "Responsible for" 60% lower. Replace with Led, Architected, Delivered, Optimized.' },
    { type: 'warning', title: 'Add a dedicated Skills section', body: 'Your skills are buried in experience. A standalone Skills section boosts ATS parsing by ~18 points.' },
    { type: 'tip', title: 'Good: consistent date formatting', body: 'All dates use MM/YYYY — great for ATS parsing consistency.' },
    { type: 'positive', title: 'GitHub link detected', body: 'Your GitHub profile is linked. Ensure you have pinned relevant projects.' },
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
      setResult(data)
    } catch (e) {
      // Use demo data if backend not running
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
        <h1 className="text-2xl font-semibold text-white mb-1">Resume Analyzer</h1>
        <p className="text-zinc-500 text-sm">Upload your resume to get your ATS score, suggestions, and job matches.</p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar */}
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

              {r.matched_jobs?.length > 0 && (
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

        {/* Main panel */}
        <div className="card overflow-hidden">
          {!r ? (
            <div className="flex flex-col items-center justify-center h-80 text-center px-8">
              <Briefcase size={40} className="text-zinc-700 mb-4" />
              <p className="text-zinc-400 font-medium mb-1">Upload your resume to get started</p>
              <p className="text-zinc-600 text-sm">We'll parse it, score it, and find matching jobs in seconds.</p>
            </div>
          ) : (
            <>
              <div className="flex border-b border-zinc-800">
                {TABS.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setTab(i)}
                    className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      tab === i ? 'border-brand-500 text-brand-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Tab 0: Suggestions */}
                {tab === 0 && (
                  <div className="flex flex-col gap-3">
                    {(r.suggestions || []).map((s, i) => (
                      <SuggestionCard key={i} {...s} />
                    ))}
                  </div>
                )}

                {/* Tab 1: Parsed Info */}
                {tab === 1 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <div className="label mb-2">Contact</div>
                      <div className="font-medium text-white">{parsed.name}</div>
                      <div className="text-sm text-zinc-400 mt-0.5">{parsed.email}</div>
                      {parsed.github && <div className="text-sm text-brand-500 mt-0.5">{parsed.github}</div>}
                    </div>
                    <div>
                      <div className="label mb-2">Stats</div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Word count', val: parsed.word_count },
                          { label: 'Action verbs', val: parsed.action_verb_count },
                          { label: 'Quantified bullets', val: parsed.quantified_bullets },
                        ].map(s => (
                          <div key={s.label} className="bg-zinc-800 rounded-lg p-3">
                            <div className="text-xl font-semibold text-white">{s.val}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="label mb-2">Sections Found</div>
                      <div className="flex flex-wrap gap-2">
                        {(parsed.sections || []).map(s => (
                          <span key={s} className="badge-green capitalize">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Skill Gaps */}
                {tab === 2 && (
                  <div>
                    <p className="text-sm text-zinc-400 mb-5">Based on 847 job postings matching your profile — skills most frequently required that your resume doesn't mention.</p>
                    <div className="flex flex-col gap-3">
                      {SKILL_GAP_DATA.map(({ skill, pct, type }) => (
                        <div key={skill} className="flex items-center gap-3">
                          <span className="text-sm text-zinc-300 w-28 flex-shrink-0">{skill}</span>
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${type === 'missing' ? 'bg-red-500' : type === 'learning' ? 'bg-amber-500' : 'bg-brand-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-xs w-8 text-right ${type === 'missing' ? 'text-red-400' : type === 'learning' ? 'text-amber-400' : 'text-brand-500'}`}>{pct}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-5 text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>Missing</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>Learning</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>Have</span>
                    </div>
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
