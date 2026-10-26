const TOKEN_KEY = 'qt_token'
export function getToken() { return localStorage.getItem(TOKEN_KEY) || '' }
export function setToken(t) { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) }
export function getUser() {
  try { return JSON.parse(localStorage.getItem('qt_user') || 'null') } catch { return null }
}
export function setUser(u) { u ? localStorage.setItem('qt_user', JSON.stringify(u)) : localStorage.removeItem('qt_user') }
export function logout() { setToken(''); setUser(null) }
