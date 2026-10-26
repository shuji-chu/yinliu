<template>
  <header class="nav glass">
    <router-link to="/" class="brand">
      <img :src="'/yinliu/logo.png'" alt="晴天" class="brand-logo" />
      <span class="brand-txt">晴天<i>服务中心</i></span>
    </router-link>
    <nav class="links">
      <router-link to="/" exact-active-class="on">商品</router-link>
      <router-link to="/orders" active-class="on">我的订单</router-link>
    </nav>
    <div class="nav-right">
      <span v-if="user" class="who">{{ user.email }}</span>
      <button v-else class="btn btn-primary btn-sm" @click="goAuth">登录</button>
      <button v-if="user" class="btn btn-ghost btn-sm" @click="out">退出</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getUser, logout } from '../store/user'
import { showToast } from '../store/ui'

const router = useRouter()
const user = computed(() => getUser())
function out() {
  logout()
  showToast('已退出登录')
  router.push('/auth')
}
function goAuth() { router.push('/auth') }
</script>
