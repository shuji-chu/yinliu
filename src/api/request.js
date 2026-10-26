import axios from 'axios'
import { getToken, logout } from '../store/user'

// 线上 API（GitHub Pages 静态托管，统一走 api.lynli.me）
export const API_BASE = 'https://api.lynli.me/api/v1'

const http = axios.create({ baseURL: API_BASE, timeout: 20000 })

http.interceptors.request.use(cfg => {
  const t = getToken()
  if (t) cfg.headers.Authorization = 'Bearer ' + t
  return cfg
})

http.interceptors.response.use(
  res => res.data,
  err => {
    const st = err.response && err.response.status
    if (st === 401) {
      logout()
      if (!location.hash.includes('/auth')) location.hash = '#/auth'
    }
    return Promise.reject(err)
  }
)

export default http
