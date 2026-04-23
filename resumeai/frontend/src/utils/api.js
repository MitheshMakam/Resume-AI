import axios from 'axios'

const api = axios.create({
  baseURL: "https://resume-backend-1lqo.onrender.com/api",
})

export const uploadResume = async (file) => {
  const form = new FormData()
  form.append("file", file)

  return api.post("/resume/upload", form)
}