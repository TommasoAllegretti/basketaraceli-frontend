import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'https://basketaraceli.it/api',
  withCredentials: true,
})

console.log(axios)
console.log(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'https://basketaraceli.it/api')

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

export default api
