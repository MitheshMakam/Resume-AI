import axios from 'axios'

const api = axios.create({
  baseURL: "https://resume-backend-1lqo.onrender.com/api"
})

export const uploadResume = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const analyzeText = (text) => api.post('/resume/analyze-text', { text })

export const getJobs = (params) => api.get('/jobs', { params })

export const searchJobs = (q) => api.get('/jobs/search', { params: { q } })

export const getDashboard = () => api.get('/recruiter/dashboard')

export const getCandidates = (params) => api.get('/recruiter/candidates', { params })

export default api
