<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            @click="logout"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            ออกจากระบบ
          </button>
        </div>

        <div v-if="pending" class="text-center py-8">
          <p class="text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600 mb-4">{{ error.data?.message || error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล' }}</p>
          <button
            @click="logout"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            กลับไปหน้า Login
          </button>
        </div>

        <div v-else-if="user" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">ชื่อ-นามสกุล</p>
              <p class="text-lg font-semibold">{{ user.firstname }} {{ user.lastname }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">อีเมล</p>
              <p class="text-lg font-semibold">{{ user.email }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">แผนก</p>
              <p class="text-lg font-semibold">{{ user.department }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">บทบาท</p>
              <p class="text-lg font-semibold">{{ user.role }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <p class="text-gray-500">ไม่พบข้อมูลผู้ใช้</p>
          <button
            @click="logout"
            class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            กลับไปหน้า Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watchEffect } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const { user, logout } = useAuth()

// ดึงข้อมูลผู้ใช้จาก API โดยใช้ useFetch เพื่อให้ cookie ถูกส่งไปอัตโนมัติ
const { data: userData, error, pending } = await useFetch('/api/auth/me', {
  credentials: 'include',
  server: true,
  onResponse({ response }) {
    console.log('✅ [INDEX] API Response:', response._data)
  },
  onResponseError({ response }) {
    console.error('❌ [INDEX] API Error:', response._data)
    if (response.status === 401) {
      console.log('⚠️ [INDEX] Token หมดอายุหรือไม่ถูกต้อง - ไม่ redirect ที่นี่ ให้ middleware จัดการ')
      // ไม่ redirect ที่นี่ ให้ middleware จัดการ
    }
  }
})

// ตั้งค่า user state จาก userData
watchEffect(() => {
  if (userData.value?.success && userData.value?.data?.user) {
    const userState = useState('user')
    if (userState.value !== userData.value.data.user) {
      userState.value = userData.value.data.user
      console.log('✅ [INDEX] ตั้งค่า user state จาก userData:', userState.value)
    }
  }
})

// ตั้งค่า user state ทันทีถ้ามีข้อมูล
if (userData.value?.success && userData.value?.data?.user) {
  const userState = useState('user')
  userState.value = userData.value.data.user
  console.log('✅ [INDEX] ตั้งค่า user state ทันที:', userState.value)
}

console.log('✅ [INDEX] ดึงข้อมูลผู้ใช้สำเร็จ:', userData.value)
console.log('📊 [INDEX] User state:', user.value)

</script>

