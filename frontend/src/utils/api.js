import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

// ImageKit config
export const IMAGEKIT_URL = 'https://ik.imagekit.io/a6nimk99z'
export const IMAGEKIT_PUBLIC_KEY = 'public_hrrprMOZn+x28WWxfrcQkhlzJ5U='