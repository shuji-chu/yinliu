<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '../api/qt'
import { showToast } from '../store/ui'

const route = useRoute()
const router = useRouter()
const p = ref(null)
const qty = ref(1)
const link = ref('')
const payMethod = ref('alipay') // alipay | usdt
const loading = ref(true)

const amount = computed(() => {
  if (!p.value) return '0.00'
  const q = Math.max(Number(qty.value) || 0, 0)
  return (Number(p.value.price) * q).toFixed(2)
})

onMounted(async () => {
  try {
    const { data } = await getProductDetail(route.params.id)
    p.value = data?.data || data
    if (p.value?.min_qty) qty.value = p.value.min_qty
  } catch {
    showToast('商品不存在', true)
    router.replace('/')
  } finally {
    loading.value = false
  }
})

function changeQty(d) {
  const min = p.value?.min_qty || 1
  const max = p.value?.max_qty || 9999
  qty.value = Math.min(max, Math.max(min, (Number(qty.value) || min) + d))
}

function goCheckout() {
  if (!p.value) return
  const q = Number(qty.value)
  if (!q || q < 1) return showToast('请填写购买数量', true)
  if (p.value.type === 'card' && p.value.stock != null && q > p.value.stock)
    return showToast('库存不足', true)
  if (!link.value) return showToast('请填写接收链接 / 联系方式', true)
  const draft = {
    product_id: p.value.id,
    name: p.value.name,
    price: p.value.price,
    qty: q,
    link: link.value,
    pay_method: payMethod.value,
  }
  sessionStorage.setItem('qt_draft', JSON.stringify(draft))
  router.push('/checkout')
}
</script>

<template>
  <main class="page">
    <div v-if="loading" class="empty-tip">加载中…</div>
    <template v-else-if="p">
      <div class="crumb"><span @click="router.push('/')">商品列表</span> › {{ p.name }}</div>

      <div class="detail-grid">
        <div class="glass panel detail-main">
          <h1>{{ p.name }}</h1>
          <p class="sub">{{ p.description || '暂无说明' }}</p>
          <table class="tbl">
            <tbody>
              <tr><th>单价</th><td class="strong-blue">¥{{ p.price }}</td></tr>
              <tr><th>数量范围</th><td>{{ p.min_qty || 1 }} ~ {{ p.max_qty || '不限' }}</td></tr>
              <tr><th>类型</th><td>{{ p.type === 'card' ? '卡密 · 自动发货' : '服务 · 人工处理' }}</td></tr>
              <tr v-if="p.type === 'card'"><th>库存</th><td>{{ p.stock ?? '充足' }}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="glass panel detail-side">
          <h2>购买</h2>
          <label class="f">
            <span>接收链接 / 联系方式</span>
            <textarea v-model="link" class="input" rows="3" placeholder="例如账号链接、QQ、TG 等"></textarea>
          </label>

          <label class="f">
            <span>数量</span>
            <div class="qty-row">
              <button class="btn btn-ghost btn-sm" @click="changeQty(-1)">−</button>
              <input v-model.number="qty" class="input qty" type="number" />
              <button class="btn btn-ghost btn-sm" @click="changeQty(1)">＋</button>
            </div>
          </label>

          <div class="calc">
            <span>合计</span>
            <b>¥{{ amount }}</b>
          </div>

          <div class="pay-methods">
            <button class="pm" :class="{ on: payMethod === 'alipay' }" @click="payMethod = 'alipay'">支付宝</button>
            <button class="pm" :class="{ on: payMethod === 'usdt' }" @click="payMethod = 'usdt'">USDT</button>
          </div>

          <button class="btn btn-primary btn-full" @click="goCheckout">立即购买</button>
        </div>
      </div>
    </template>
  </main>
</template>
