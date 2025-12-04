import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://api-proyecto-production-519c.up.railway.app',
  withCredentials: true,
})

export default axiosInstance
