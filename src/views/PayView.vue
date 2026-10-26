<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderStatus } from '../api/qt'
import { showToast } from '../store/ui'

const router = useRouter()
const order = ref(null)
const info = ref(null) // pay_info: payurl / qrcode / address / network
const cards = ref('')
const status = ref(0)
const copied = ref('')
let timer = null

async function poll() {
  try {
    const { data } = await getOrderStatus(order.value.trade_no)
    const d = data?.data || data || {}
    status.value = d.status
    info.value = d.pay_info || null
    if (d.status === 1) {
      cards.value = d.card_content || ''
      clearInterval(timer)
    }
  } catch (e) {
    if (e?.response?.status === 401) {
      clearInterval(timer)
      showToast('登录已失效，请重新登录', true)
      router.replace('/auth')
    }
  }
}

async function copy(text, tag) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  copied.value = tag
  showToast('已复制')
}

onMounted(() => {
  const raw = sessionStorage.getItem('qt_order')
  if (!raw) return router.replace('/')
  order.value = JSON.parse(raw)
  poll()
  timer = setInterval(poll, 3000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <main class="page">
    <div v-if="order" class="glass cashier">
      <template v-if="status === 1">
        <div class="success-ic">✓</div>
        <div class="pay-state ok">支付成功，已自动发货</div>
        <template v-if="cards">
          <div class="card-box">
            <pre class="mono">{{ cards }}</pre>
          </div>
          <button class="btn btn-primary" @click="copy(cards, 'cards')">
            {{ copied === 'cards' ? '已复制 ✓' : '复制卡密' }}
          </button>
        </template>
        <p v-else class="empty-tip">订单已完成，商品将尽快交付；可在「我的订单」查看。</p>
        <button class="btn btn-ghost" @click="router.push('/orders')">查看我的订单</button>
      </template>

      <template v-else>
        <div class="eyebrow">PAYMENT</div>
        <div class="amt">¥{{ order.amount }}</div>
        <p class="sub mono">{{ order.trade_no }}</p>

        <template v-if="order.pay_method === 'alipay'">
          <p class="empty-tip">请使用支付宝扫码支付</p>
          <div class="qr-box">
            <img
              v-if="info?.qrcode || info?.payurl"
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(info.qrcode || info.payurl)}`"
              alt="支付二维码"
            />
            <div v-else class="empty-tip">等待生成…</div>
          </div>
          <div v-if="info?.payurl" class="addr-box">
            <code>{{ info.payurl }}</code>
            <button class="btn btn-ghost btn-sm" @click="copy(info.payurl, 'url')">复制链接</button>
          </div>
        </template>

        <template v-else>
          <p class="empty-tip">请转账 USDT（{{ info?.network || 'TRC20' }}），到账自动发货</p>
          <div class="addr-box">
            <code>{{ info?.address || '等待生成收款地址…' }}</code>
            <button v-if="info?.address" class="btn btn-ghost btn-sm" @click="copy(info.address, 'addr')">
              {{ copied === 'addr' ? '已复制' : '复制' }}
            </button>
          </div>
        </template>

        <div class="pay-waiting"><span class="spin"></span> 正在等待支付结果…（3 秒自动刷新）</div>
      </template>
    </div>
  </main>
</template>
