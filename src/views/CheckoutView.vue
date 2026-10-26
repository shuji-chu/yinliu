<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createOrder } from '../api/qt'
import { showToast } from '../store/ui'

const router = useRouter()
const draft = ref(null)
const submitting = ref(false)

const amount = computed(() =>
  draft.value ? (Number(draft.value.price) * draft.value.qty).toFixed(2) : '0.00'
)

onMounted(() => {
  const raw = sessionStorage.getItem('qt_draft')
  if (!raw) return router.replace('/')
  draft.value = JSON.parse(raw)
})

async function submit() {
  if (submitting.value || !draft.value) return
  submitting.value = true
  try {
    const { data } = await createOrder({
      product_id: draft.value.product_id,
      qty: draft.value.qty,
      link: draft.value.link,
      pay_method: draft.value.pay_method,
    })
    const d = data?.data || data || {}
    if (!d.trade_no) throw new Error('下单失败')
    sessionStorage.removeItem('qt_draft')
    sessionStorage.setItem(
      'qt_order',
      JSON.stringify({ trade_no: d.trade_no, pay_method: draft.value.pay_method, amount: amount.value, name: draft.value.name })
    )
    router.push('/pay')
  } catch (e) {
    showToast(e?.response?.data?.message || '下单失败', true)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="page">
    <div v-if="draft" class="glass panel checkout-panel">
      <div class="page-head">
        <div class="eyebrow">CHECKOUT</div>
        <h1>确认订单</h1>
      </div>
      <table class="tbl">
        <tbody>
          <tr><th>商品</th><td>{{ draft.name }}</td></tr>
          <tr><th>单价</th><td>¥{{ draft.price }}</td></tr>
          <tr><th>数量</th><td>{{ draft.qty }}</td></tr>
          <tr><th>接收链接</th><td class="mono sm">{{ draft.link }}</td></tr>
          <tr><th>支付方式</th><td>{{ draft.pay_method === 'alipay' ? '支付宝' : 'USDT' }}</td></tr>
          <tr class="sum"><th>应付</th><td><strong class="strong-blue">¥{{ amount }}</strong></td></tr>
        </tbody>
      </table>
      <button class="btn btn-primary btn-full" :disabled="submitting" @click="submit">
        {{ submitting ? '创建订单中…' : '提交订单并支付' }}
      </button>
    </div>
  </main>
</template>
