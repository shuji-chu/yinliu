import { reactive } from 'vue'

// 黑底 Toast 全局状态（红线规范）
export const toast = reactive({ msg: '', show: false, err: false })
let timer = null
export function showToast(msg, err = false) {
  toast.msg = msg
  toast.err = err
  toast.show = true
  clearTimeout(timer)
  timer = setTimeout(() => (toast.show = false), 2600)
}
