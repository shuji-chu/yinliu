import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken } from '../store/user'

const routes = [
  { path: '/auth', name: 'auth', component: () => import('../views/AuthView.vue') },
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/product/:id', name: 'product', component: () => import('../views/ProductDetailView.vue') },
  { path: '/checkout', name: 'checkout', component: () => import('../views/CheckoutView.vue') },
  { path: '/pay', name: 'pay', component: () => import('../views/PayView.vue') },
  { path: '/orders', name: 'orders', component: () => import('../views/OrdersView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  // GitHub Pages 子路径部署用 hash 模式，避免 404
  history: createWebHashHistory('/yinliu/'),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// 全局路由守卫：未登录一律跳 /auth
router.beforeEach(to => {
  if (to.name !== 'auth' && !getToken()) return { name: 'auth' }
  if (to.name === 'auth' && getToken()) return { name: 'home' }
  return true
})

export default router
