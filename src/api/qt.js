import http from './request'

// 商品（游客可浏览）
export const getProducts = () => http.get('/qt/products')
export const getProductDetail = id => http.get('/qt/product/detail', { params: { id } })

// 订单（需登录）
export const createOrder = data => http.post('/qt/order/create', data)
export const getOrderStatus = tradeNo => http.get('/qt/order/status', { params: { trade_no: tradeNo } })
export const getMyOrders = () => http.get('/qt/orders')

// 登录 / 注册 / 找回（复用主站统一账号体系）
export const login = (email, password) => http.post('/passport/auth/login', { email, password })
export const sendCode = email => http.post('/passport/auth/send-code', { email })
export const register = data => http.post('/passport/auth/register', data)
export const getUserInfo = () => http.get('/user/info')
export const resetPassword = data => http.post('/passport/auth/reset', data)
