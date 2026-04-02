import axios from 'axios'

const apiClient = axios.create({
  // Replace with your Node.js API base URL when backend is ready.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
