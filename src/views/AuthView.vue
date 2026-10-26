<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { login, sendCode, register, resetPassword } from '../api/qt'
import { setToken, setUser } from '../store/user'
import { showToast } from '../store/ui'

const router = useRouter()
const tab = ref('login') // login | register | reset
const sending = ref(false)
let cd = 0
const cdText = computed(() => (cd > 0 ? `${cd}s` : '获取验证码'))

const f = reactive({ email: '', code: '', password: '', password2: '' })

function switchTab(t) {
  tab.value = t
  f.code = ''
  f.password = ''
  f.password2 = ''
}

const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

async function onSendCode() {
  if (sending.value || cd > 0) return
  if (!isEmail(f.email)) return showToast('请输入正确的邮箱', true)
  sending.value = true
  try {
    await sendCode(f.email)
    showToast('验证码已发送，请查收邮箱')
    cd = 60
    const t = setInterval(() => { cd--; if (cd <= 0) clearInterval(t) }, 1000)
  } catch (e) {
    showToast(e?.response?.data?.message || '发送失败', true)
  } finally {
    sending.value = false
  }
}

async function onLogin() {
  if (!isEmail(f.email) || !f.password) return showToast('请输入邮箱和密码', true)
  try {
    const { data } = await login(f.email, f.password)
    const d = data?.data || data
    if (!d?.token) throw new Error('登录失败')
    setToken(d.token)
    setUser({ email: f.email, role: d.role })
    showToast('登录成功')
    router.push('/')
  } catch (e) {
    showToast(e?.response?.data?.message || '登录失败', true)
  }
}

async function onRegister() {
  if (!isEmail(f.email)) return showToast('请输入正确的邮箱', true)
  if (!f.code) return showToast('请输入验证码', true)
  if (!f.password || f.password.length < 6) return showToast('密码至少 6 位', true)
  if (f.password !== f.password2) return showToast('两次密码不一致', true)
  try {
    await register({ email: f.email, code: f.code, password: f.password })
    showToast('注册成功，请登录')
    switchTab('login')
  } catch (e) {
    showToast(e?.response?.data?.message || '注册失败', true)
  }
}

async function onReset() {
  if (!isEmail(f.email)) return showToast('请输入正确的邮箱', true)
  if (!f.code) return showToast('请输入验证码', true)
  if (!f.password || f.password.length < 6) return showToast('新密码至少 6 位', true)
  if (f.password !== f.password2) return showToast('两次密码不一致', true)
  try {
    await resetPassword({ email: f.email, code: f.code, password: f.password })
    showToast('密码已重置，请登录')
    switchTab('login')
  } catch (e) {
    showToast(e?.response?.data?.message || '重置失败', true)
  }
}
</script>

<template>
  <main class="page auth-page">
    <div class="glass auth-panel">
      <div class="auth-brand">
        <img :src="'/yinliu/logo.png'" alt="晴天" />
        <h1>晴天 · 服务中心</h1>
        <p>统一账号 · 虚拟资源自动发货</p>
      </div>
      <div class="tabs">
        <span :class="{ on: tab === 'login' }" @click="switchTab('login')">登录</span>
        <span :class="{ on: tab === 'register' }" @click="switchTab('register')">注册</span>
        <span :class="{ on: tab === 'reset' }" @click="switchTab('reset')">找回密码</span>
      </div>

      <template v-if="tab === 'login'">
        <input v-model="f.email" class="input" type="email" placeholder="邮箱地址" @keyup.enter="onLogin" />
        <input v-model="f.password" class="input" type="password" placeholder="密码" @keyup.enter="onLogin" />
        <button class="btn btn-primary btn-full" @click="onLogin">登 录</button>
      </template>

      <template v-else-if="tab === 'register'">
        <input v-model="f.email" class="input" type="email" placeholder="邮箱地址" />
        <div class="code-row">
          <input v-model="f.code" class="input" placeholder="邮箱验证码" />
          <button class="btn btn-ghost btn-sm" :disabled="sending || cd > 0" @click="onSendCode">{{ cdText }}</button>
        </div>
        <input v-model="f.password" class="input" type="password" placeholder="密码（至少 6 位）" />
        <input v-model="f.password2" class="input" type="password" placeholder="确认密码" />
        <button class="btn btn-primary btn-full" @click="onRegister">注 册</button>
      </template>

      <template v-else>
        <input v-model="f.email" class="input" type="email" placeholder="注册邮箱" />
        <div class="code-row">
          <input v-model="f.code" class="input" placeholder="邮箱验证码" />
          <button class="btn btn-ghost btn-sm" :disabled="sending || cd > 0" @click="onSendCode">{{ cdText }}</button>
        </div>
        <input v-model="f.password" class="input" type="password" placeholder="新密码（至少 6 位）" />
        <input v-model="f.password2" class="input" type="password" placeholder="确认新密码" />
        <button class="btn btn-primary btn-full" @click="onReset">重置密码</button>
      </template>
    </div>
  </main>
</template>
