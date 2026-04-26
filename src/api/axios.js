import router from '../router'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

let refreshPromise = null

const logout = async () => {
  localStorage.removeItem(import.meta.env.VITE_KEY_STORAGE)
  await api.post('auth/logout').catch(() => {})
  router.push('/')
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    const authEndPoints = ['auth/login', 'auth/register']
    const isAuthEndPoint = authEndPoints.some((endPoint) => originalRequest.url.includes(endPoint))

    if (isAuthEndPoint) {
      return Promise.reject(err)
    }

    if (err.response?.status === 401 && originalRequest._retry) {
      await logout()
      return Promise.reject(err)
    }

    if (err.response?.status === 401) {
      originalRequest._retry = true

      if (!refreshPromise) {
        refreshPromise = api.post('auth/refresh').finally(() => {
          refreshPromise = null
        })
      }

      try {
        await refreshPromise
        return api(originalRequest)
      } catch (error) {
        await logout()
        return Promise.reject(error)
      }
    }

    return Promise.reject(err)
  }
)

export default api
