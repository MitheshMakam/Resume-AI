import axios from 'axios'

const api = axios.create({
  baseURL: "https://resume-backend-1lqo.onrender.com/api",
})

// ✅ Upload Resume
export const uploadResume = async (file) => {
  const form = new FormData()
  form.append('file', file)

  return api.post('/resume/upload', form)
}

// ✅ Analyze Text
export const analyzeText = (text) =>
  api.post('/resume/analyze-text', { text })

// ✅ Get Jobs
export const getJobs = (params) =>
  api.get('/jobs', { params })

// ✅ Search Jobs
export const searchJobs = (q) =>
  api.get('/jobs/search', { params: { q } })

// ✅ Recruiter Dashboard
export const getDashboard = () =>
  api.get('/recruiter/dashboard')

// ✅ Get Candidates
export const getCandidates = (params) =>
  api.get('/recruiter/candidates', { params })

export default api
