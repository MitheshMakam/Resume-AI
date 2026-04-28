import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, ChevronRight } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import AtsRing from '../components/AtsRing'
import ScoreBar from '../components/ScoreBar'
import SuggestionCard from '../components/SuggestionCard'
import { uploadResume, getJobs } from '../utils/api'

const TABS = ['Suggestions', 'Parsed Info', 'Skill Gaps']

function getSkillGaps(resumeSkills = [], jobs = []) {
  const freq = {}

  jobs.forEach(job => {
    const text = job.description?.toLowerCase() || ''
    const keywords = ['react','node','aws','docker','kubernetes','sql','python']

    keywords.forEach(k => {
      if (text.includes(k)) {
        freq[k] = (freq[k] || 0) + 1
      }
    })
  })

  return Object.entries(freq).map(([skill, count]) => ({
    skill,
    pct: Math.min(100, count * 10),
    type: resumeSkills.includes(skill) ? 'have' : 'missing'
  }))
}

export default function AnalyzerPage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState(0)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // ✅ persist data
  useEffect(() => {
    const saved = localStorage.getItem('resume_result')
    if (saved) setResult(JSON.parse(saved))
  }, [])

  async function handleFile(f) {
    setFile(f)
    setLoading(true)
    setError('')

    try {
      const { data } = await uploadResume(f)

      // 🔥 fetch jobs based on skills
      const skills = data?.parsed?.skills?.join(' ') || 'developer'

      const jobsRes = await getJobs({
        role: skills,
        location: 'india',
        limit: 20
      })

      const finalData = {
        ...data,
        matched_jobs: jobsRes.data
      }

      setResult(finalData)
      localStorage.setItem('resume_result', JSON.stringify(finalData))

    } catch (e) {
      console.error(e)
      setError('Failed to analyze resume. Please try again.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const r = result
  const scores = r?.ats_scores || {}
  const parsed = r?.parsed || {}
  const skillGaps = getSkillGaps(parsed.skills, r?.matched_jobs || [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Resume Analyzer</h1>
        <p className="text-zinc-500 text-sm">Upload your resume to get ATS score, insights, and job matches.</p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        
        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <UploadZone onFile={handleFile} loading={loading} fileName={file?.name} />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-zinc-400 text-sm">Analyzing resume...</div>
          )}

          {r && (
            <>
              <div className="card p-5">
                <div className="label mb-4">ATS Score</div>

                <div className="flex justify-center mb-3">
                  <AtsRing score={scores.overall || 0} size={120} />
                </div>

                {/* 🔥 ATS Label */}
                <div className="text-center text-sm text-zinc-400 mb-4">
                  {scores.overall >= 70 ? 'Strong Resume' :
                   scores.overall >= 40 ? 'Average Resume' :
                   'Needs Improvement'}
                </div>

                <div className="flex flex-col gap-3">
                  <ScoreBar label="Keywords" value={scores.keywords || 0} />
                  <ScoreBar label="Format" value={scores.format || 0} />
                  <ScoreBar label="Skills Match" value={scores.skills_match || 0} />
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

        {/* Main Panel */}
        <div className="card overflow-hidden">
          {!r ? (
            <div className="flex flex-col items-center justify-center h-80 text-center px-8">
              <Briefcase size={40} className="text-zinc-700 mb-4" />
              <p className="text-zinc-400 font-medium mb-1">Upload your resume to get started</p>
              <p className="text-zinc-600 text-sm">We’ll analyze it and match jobs instantly.</p>
            </div>
          ) : (
            <>
              <div className="flex border-b border-zinc-800">
                {TABS.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setTab(i)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px ${
                      tab === i
                        ? 'border-brand-500 text-brand-500'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-6">
                
                {/* Suggestions */}
                {tab === 0 && (
                  <div className="flex flex-col gap-3">
                    {(r.suggestions || []).map((s, i) => (
                      <SuggestionCard key={i} {...s} />
                    ))}
                  </div>
                )}

                {/* Parsed Info */}
                {tab === 1 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <div className="label mb-2">Contact</div>
                      <div className="font-medium text-white">{parsed.name}</div>
                      <div className="text-sm text-zinc-400">{parsed.email}</div>
                    </div>
                  </div>
                )}

                {/* Skill Gaps */}
                {tab === 2 && (
                  <div className="flex flex-col gap-3">
                    {skillGaps.map(({ skill, pct, type }) => (
                      <div key={skill} className="flex items-center gap-3">
                        <span className="text-sm text-zinc-300 w-28">{skill}</span>
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              type === 'missing'
                                ? 'bg-red-500'
                                : 'bg-brand-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400">{pct}%</span>
                      </div>
                    ))}
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