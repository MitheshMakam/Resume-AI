import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, ChevronRight } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import AtsRing from '../components/AtsRing'
import ScoreBar from '../components/ScoreBar'
import SuggestionCard from '../components/SuggestionCard'
import { uploadResume, getJobs } from '../utils/api'

const TABS = ['Suggestions', 'Parsed Info', 'Skill Gaps']

// ✅ SAFE FUNCTION
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

  // ✅ SAFE LOAD
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

      // ✅ FIX HERE
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
      setError('Failed to analyze resume. Please try again.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const r = result
  const scores = r?.ats_scores || {}
  const parsed = r?.parsed || {}

  // ✅ SAFE CALL
  const skillGaps = getSkillGaps(parsed.skills, r?.matched_jobs)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl text-white mb-4">Resume Analyzer</h1>

      <UploadZone onFile={handleFile} loading={loading} />

      {error && <div className="text-red-400">{error}</div>}

      {r && (
        <>
          <AtsRing score={scores.overall || 0} />

          {(r.matched_jobs || []).length > 0 && (
            <button onClick={() => navigate('/jobs')}>
              View Jobs ({r.matched_jobs.length})
            </button>
          )}

          {tab === 2 && (
            <div>
              {skillGaps.map(s => (
                <div key={s.skill}>{s.skill} - {s.pct}%</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}