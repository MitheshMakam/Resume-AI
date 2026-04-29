import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, ChevronRight } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import AtsRing from '../components/AtsRing'
import ScoreBar from '../components/ScoreBar'
import SuggestionCard from '../components/SuggestionCard'
import { uploadResume, getJobs } from '../utils/api'

const TABS = ['Suggestions', 'Parsed Info', 'Skill Gaps']

function getSkillGaps(resumeSkills = [], jobs = []) {
  const safeJobs = Array.isArray(jobs) ? jobs : []
  const freq = {}

  const keywords = [
    'react','node','aws','docker','kubernetes',
    'sql','python','javascript','typescript','mongodb','express'
  ]

  safeJobs.forEach(job => {
    const text = (job.description || '').toLowerCase()

    keywords.forEach(k => {
      if (text.includes(k)) {
        freq[k] = (freq[k] || 0) + 1
      }
    })
  })

  return keywords.map(skill => ({
    skill,
    pct: freq[skill] ? Math.min(100, freq[skill] * 10) : 10,
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

  async function handleFile(f) {
    setFile(f)
    setResult(null) // 🔥 clear old UI
    localStorage.removeItem('resume_result') // 🔥 clear cache
    setLoading(true)
    setError('')

    try {
      const { data } = await uploadResume(f)

      const skills = data?.parsed?.skills?.join(' ') || 'developer'

      const jobsRes = await getJobs({
        role: skills,
        location: 'india'
      })

      const safeJobs = Array.isArray(jobsRes.data)
        ? jobsRes.data
        : Array.isArray(jobsRes.data?.jobs)
        ? jobsRes.data.jobs
        : []

      const finalData = {
        ...data,
        matched_jobs: safeJobs
      }

      setResult(finalData)
      localStorage.setItem('resume_result', JSON.stringify(finalData))

    } catch (e) {
      console.error(e)
      setError('Failed to analyze resume.')
    } finally {
      setLoading(false)
    }
  }

  const r = result
  const scores = r?.ats_scores || {}
  const parsed = r?.parsed || {}
  const skillGaps = getSkillGaps(parsed.skills || [], r?.matched_jobs || [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">
          Resume Analyzer
        </h1>
        <p className="text-zinc-500 text-sm">
          Upload your resume to get ATS score and job matches
        </p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">

        {/* SIDEBAR */}
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
              {/* ATS CARD */}
              <div className="card p-5">
                <div className="label mb-4">ATS Score</div>

                <div className="flex justify-center mb-3">
                  <AtsRing score={scores.overall || 0} size={120} />
                </div>

                <div className="flex flex-col gap-3">
                  <ScoreBar label="Keywords" value={scores.keywords || 0} />
                  <ScoreBar label="Format" value={scores.format || 0} />
                  <ScoreBar label="Skills Match" value={scores.skills_match || 0} />
                  <ScoreBar label="Readability" value={scores.readability || 0} />
                  <ScoreBar label="Completeness" value={scores.completeness || 0} />
                </div>
              </div>

              {/* SKILLS */}
              <div className="card p-5">
                <div className="label mb-3">Detected Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {(parsed.skills || []).map(s => (
                    <span key={s} className="badge-green">{s}</span>
                  ))}
                </div>
              </div>

              {/* JOB BUTTON */}
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

        {/* MAIN PANEL */}
        <div className="card overflow-hidden">

          {!r ? (
            <div className="flex flex-col items-center justify-center h-80 text-center px-8">
              <Briefcase size={40} className="text-zinc-700 mb-4" />
              <p className="text-zinc-400 font-medium mb-1">
                Upload your resume to get started
              </p>
              <p className="text-zinc-600 text-sm">
                We’ll analyze it and match jobs instantly.
              </p>
            </div>
          ) : (
            <>
              {/* TABS */}
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
                  <div>
                    <div className="text-white font-medium">{parsed.name}</div>
                    <div className="text-zinc-400 text-sm">{parsed.email}</div>
                  </div>
                )}

                {/* Skill Gaps */}
                {tab === 2 && (
                  <div className="flex flex-col gap-3">
                    {skillGaps.length === 0 ? (
                      <div className="text-zinc-500 text-sm">
                        No skill gaps found
                      </div>
                    ) : (
                      skillGaps.map(s => (
                        <div key={s.skill} className="flex justify-between text-sm">
                          <span className={s.type === 'missing' ? 'text-red-400' : 'text-green-400'}>
                            {s.skill}
                          </span>
                          <span className="text-zinc-400">{s.pct}%</span>
                        </div>
                      ))
                    )}
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