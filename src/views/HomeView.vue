<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProducts } from '../api/qt'
import { showToast } from '../store/ui'

const router = useRouter()
const products = ref([])
const cats = ref([])
const activeCat = ref(0) // 0 = 全部
const kw = ref('')
const loading = ref(true)

const list = computed(() =>
  products.value.filter(p => {
    if (activeCat.value && p.category_id !== activeCat.value) return false
    if (kw.value && !(p.name || '').toLowerCase().includes(kw.value.toLowerCase())) return false
    return true
  })
)

onMounted(async () => {
  try {
    const { data } = await getProducts()
    const d = data?.data || data || {}
    products.value = d.products || []
    cats.value = d.categories || []
  } catch {
    showToast('商品加载失败', true)
  } finally {
    loading.value = false
  }
})

const stockText = p => (p.type === 'card' ? `库存 ${p.stock ?? '∞'}` : '自动处理')
</script>

<template>
  <main class="page">
    <div class="page-head">
      <div class="eyebrow">QINGTIAN MALL</div>
      <h1>虚拟资源 · 自动发货</h1>
      <p>晴天服务，7×24h 秒级到账，支付宝 / USDT 安全支付</p>
    </div>

    <div class="cat-strip">
      <button class="cat-chip" :class="{ on: activeCat === 0 }" @click="activeCat = 0">全部</button>
      <button v-for="c in cats" :key="c.id" class="cat-chip" :class="{ on: activeCat === c.id }" @click="activeCat = c.id">
        {{ c.name }}
      </button>
    </div>

    <div class="search-row">
      <input v-model="kw" class="input" placeholder="搜索商品名称…" />
    </div>

    <div v-if="loading" class="empty-tip">加载中…</div>
    <div v-else-if="!list.length" class="empty-tip">暂无商品</div>

    <div class="prod-grid">
      <a v-for="p in list" :key="p.id" class="prod-card glass" @click="router.push(`/product/${p.id}`)">
        <h3>{{ p.name }}</h3>
        <p class="desc">{{ p.description || '—' }}</p>
        <div class="meta">
          <span class="price">¥{{ p.price }}<small>/ 件</small></span>
          <span class="muted sm">{{ stockText(p) }}</span>
        </div>
      </a>
    </div>
  </main>
</template>
