<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyOrders } from '../api/qt'
import { showToast } from '../store/ui'

const router = useRouter()
const orders = ref([])
const loading = ref(true)

const statusText = s => (Number(s) === 1 ? '已完成' : '待支付')
const statusCls = s => (Number(s) === 1 ? 'ok' : 'warn')

async function load() {
  loading.value = true
  try {
    const { data } = await getMyOrders()
    const d = data?.data || data || {}
    orders.value = d.orders || d || []
  } catch {
    showToast('订单加载失败', true)
  } finally {
    loading.value = false
  }
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToast('卡密已复制')
  } catch {
    showToast('复制失败', true)
  }
}

function payAgain(o) {
  sessionStorage.setItem(
    'qt_order',
    JSON.stringify({ trade_no: o.trade_no, pay_method: o.pay_method || 'alipay', amount: o.amount, name: o.product_name })
  )
  router.push('/pay')
}

onMounted(load)
</script>

<template>
  <main class="page">
    <div class="page-head">
      <div class="eyebrow">MY ORDERS</div>
      <h1>我的订单</h1>
    </div>

    <div v-if="loading" class="empty-tip">加载中…</div>
    <div v-else-if="!orders.length" class="empty-tip">暂无订单，去 <a class="lk" @click="router.push('/')">挑选商品</a></div>

    <div v-else class="glass panel tbl-wrap">
      <table class="tbl">
        <thead>
          <tr><th>订单号</th><th>商品</th><th>数量</th><th>金额</th><th>状态</th><th>卡密 / 操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.trade_no">
            <td><code class="mono">{{ o.trade_no }}</code></td>
            <td>{{ o.product_name }}</td>
            <td>{{ o.qty }}</td>
            <td class="strong-blue">¥{{ o.amount }}</td>
            <td><span class="badge" :class="statusCls(o.status)">{{ statusText(o.status) }}</span></td>
            <td>
              <template v-if="Number(o.status) === 1 && o.card_content">
                <div class="card-inline mono">{{ o.card_content }}</div>
                <button class="btn btn-ghost btn-sm" @click="copy(o.card_content)">复制卡密</button>
              </template>
              <button v-else-if="Number(o.status) !== 1" class="btn btn-primary btn-sm" @click="payAgain(o)">去支付</button>
              <span v-else class="muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
