<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          เข้าสู่ระบบ
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">อีเมล</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="อีเมล"
            />
          </div>
          <div>
            <label for="password" class="sr-only">รหัสผ่าน</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="รหัสผ่าน"
            />
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-800">{{ error }}</div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">กำลังเข้าสู่ระบบ...</span>
            <span v-else>เข้าสู่ระบบ</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: false
})

const loading = ref(false)
const error = ref('')

const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value
    })

    console.log('✅ [LOGIN PAGE] Login response:', data)
    if (data.success && data.data) {
      // บันทึก token ใน localStorage (ถ้าต้องการ)
      if (data.data.token) {
        localStorage.setItem('auth-token', data.data.token)
        console.log('💾 [LOGIN PAGE] บันทึก token ใน localStorage')
      }

      // Redirect ไปหน้า dashboard หรือหน้าหลัก
      console.log('🔄 [LOGIN PAGE] Redirect ไปหน้า /')
      await navigateTo('/')
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
  } finally {
    loading.value = false
  }
}
</script>

