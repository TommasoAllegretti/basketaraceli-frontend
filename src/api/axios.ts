import axios from 'axios'

const api = axios.create({
  baseURL: window.location.origin.includes('localhost')
    ? 'http://localhost:8000/api/'
    : 'https://basketaraceli.it/api/',
  withCredentials: true,
})

api.interceptors.request.use(
  config => {
    console.log('Final request URL:', config.baseURL ?? '' + config.url)
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
