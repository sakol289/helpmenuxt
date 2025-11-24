<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-sm bg-white p-6 rounded-lg shadow">
      <h2 class="text-2xl font-bold text-center mb-4">เข้าสู่ระบบ</h2>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="อีเมล"
          class="w-full border rounded p-2"
          required
        />

        <input
          v-model="password"
          type="password"
          placeholder="รหัสผ่าน"
          class="w-full border rounded p-2"
          required
        />

        <p v-if="errorMsg" class="text-red-600 text-sm">{{ errorMsg }}</p>

        <button
          type="submit"
          class="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const auth = useAuthStore()
const { fetchUser } = useAuth()

// เช็คว่า login แล้วหรือยังเมื่อโหลดหน้า
onMounted(() => {
  // Init auth จาก localStorage ถ้ายังไม่ได้ init
  if (process.client && !auth.isAuthenticated) {
    auth.initAuth()
  }
  
  // ถ้า login แล้วให้ redirect
  if (auth.isAuthenticated && auth.user) {
    console.log('✅ [LOGIN PAGE] Login แล้ว redirect ไปหน้า /')
    navigateTo('/')
    return
  }
  
  // ตรวจสอบ cookie
  const token = useCookie('auth-token')
  if (token.value) {
    console.log('✅ [LOGIN PAGE] พบ token ใน cookie redirect ไปหน้า /')
    navigateTo('/')
    return
  }
  
  console.log('🔍 [LOGIN PAGE] Auth store state:', auth.isAuthenticated, auth.user, auth.token)
})

const email = ref('')
const password = ref('')
const errorMsg = ref('')

const onSubmit = async () => {
  errorMsg.value = ''

  try {
    const result = await $fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      body: {
        email: email.value,
        password: password.value
      }
    })
    console.log('🔄 [LOGIN PAGE] Login response:', result)

    if (!result || result.status !== 'success') {
      errorMsg.value = result?.message || 'เข้าสู่ระบบไม่สำเร็จ'
      return
    }

    // เก็บ token + user ไว้ใน Pinia
    auth.setAuth(result.data.token, result.data.user)
    console.log('✅ [LOGIN PAGE] Set auth:', { token: result.data.token, user: result.data.user })
    console.log('✅ [LOGIN PAGE] Auth store state:', { isAuthenticated: auth.isAuthenticated, hasUser: !!auth.user, hasToken: !!auth.token })

    // sync กับ useAuth (state กลาง) และยืนยัน session จากเซิร์ฟเวอร์
    await fetchUser()
    
    // ใช้ navigateTo แทน router.push และรอให้ state ถูก set ก่อน
    await nextTick()
    await navigateTo('/')
  } catch (err) {
    errorMsg.value = err?.data?.message || 'เกิดข้อผิดพลาด'
  }
}
</script>
