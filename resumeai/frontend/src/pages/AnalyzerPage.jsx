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
  const safeJobs = Array.isArray(jobs) ? jobs : []
  const freq = {}

  safeJobs.forEach(job => {
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
    type: resumeSkills?.includes(skill) ? 'have' : 'missing'
  }))
}

export default function AnalyzerPage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState(0)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // ✅ Load from localStorage safely
  useEffect(() => {
    const saved = localStorage.getItem('resume_result')
    if (saved) {
      const parsed = JSON.parse(saved)
      parsed.matched_jobs = Array.isArray(parsed.matched_jobs)
        ? parsed.matched_jobs
        : []
      setResult(parsed)
    }
  }, [])

  async function handleFile(f) {
    setFile(f)
    setLoading(true)
    setError('')

    try {
      const { data } = await uploadResume(f)

      const skills = data?.parsed?.skills?.join(' ') || 'developer'

      const jobsRes = await getJobs({
        role: skills,
        location: 'india',
        limit: 20
      })

      // ✅ ALWAYS FORCE ARRAY
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
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const r = result
  const scores = r?.ats_scores || {}
  const parsed = r?.parsed || {}

  const skillGaps = getSkillGaps(parsed.skills, r?.matched_jobs)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">
          Resume Analyzer
        </h1>
        <p className="text-zinc-500 text-sm">
          Upload your resume to get ATS score and job matches
        </p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <UploadZone onFile={handleFile} loading={loading} fileName={file?.name} />

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          {loading && (
            <div className="text-zinc-400 text-sm">Analyzing...</div>
          )}

          {r && (
            <>
              <div className="card p-5">
                <div className="mb-4 text-zinc-400">ATS Score</div>

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

              <div className="card p-5">
                <div className="mb-2 text-zinc-400">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {(parsed.skills || []).map(s => (
                    <span key={s} className="badge-green">{s}</span>
                  ))}
                </div>
              </div>

              {(r.matched_jobs || []).length > 0 && (
                <button
                  className="btn-primary flex justify-between items-center px-4 py-3"
                  onClick={() => navigate('/jobs')}
                >
                  <span>View {r.matched_jobs.length} jobs</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Main */}
        <div className="card p-6">
          {!r ? (
            <div className="text-center text-zinc-400">
              Upload resume to start
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                {TABS.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setTab(i)}
                    className={tab === i ? 'text-white' : 'text-zinc-500'}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === 0 && (
                <div className="flex flex-col gap-3">
                  {(r.suggestions || []).map((s, i) => (
                    <SuggestionCard key={i} {...s} />
                  ))}
                </div>
              )}

              {tab === 1 && (
                <div>
                  <div className="text-white">{parsed.name}</div>
                  <div className="text-zinc-400 text-sm">{parsed.email}</div>
                </div>
              )}

              {tab === 2 && (
                <div className="flex flex-col gap-2">
                  {skillGaps.map(s => (
                    <div key={s.skill}>
                      {s.skill} - {s.pct}%
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}