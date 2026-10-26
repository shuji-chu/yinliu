<template>
  <div class="qt-shell">
    <div class="qt-bg" aria-hidden="true"></div>
    <NavBar v-if="route.name !== 'auth'" />
    <router-view />
    <footer class="qt-footer">
      <img :src="logoUrl" alt="" class="f-logo" />
      <div>
        <b>晴天 · 服务中心</b>
        <p>虚拟资源自动发货 · 支付宝 / USDT 双通道 · 极速到账</p>
        <p class="sign">© 2026 晴天 ☀️</p>
      </div>
    </footer>
    <div class="toast" :class="{ show: toast.show, err: toast.err }">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { toast } from './store/ui'

const route = useRoute()
const logoUrl = '/yinliu/logo.png'
</script>
