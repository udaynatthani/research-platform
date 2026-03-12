import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async error => {
    const orig = error.config
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(token => { orig.headers.Authorization = `Bearer ${token}`; return api(orig) })
      }
      orig._retry = true
      isRefreshing = true
      const rt = localStorage.getItem('refreshToken')
      if (!rt) {
        isRefreshing = false
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post('http://localhost:5000/users/refresh-token', { token: rt })
        localStorage.setItem('token', data.token)
        localStorage.setItem('refreshToken', data.refreshToken)
        processQueue(null, data.token)
        orig.headers.Authorization = `Bearer ${data.token}`
        return api(orig)
      } catch (err) {
        processQueue(err, null)
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
