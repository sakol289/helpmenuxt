<template>
  <nav class="bg-blue-600 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <h1 class="text-xl font-semibold">Love You</h1>
        </div>

        <div class="flex items-center space-x-4">
          <!-- เมนูตาม role -->
          <template v-if="auth.isAuthenticated && auth.user">
            <!-- เมนูสำหรับ Admin -->
            <template v-if="auth.user.role === 'admin'">
              <NuxtLink
                to="/"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                active-class="bg-blue-700"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink
                to="/admin/users"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                active-class="bg-blue-700"
              >
                จัดการผู้ใช้
              </NuxtLink>
              <NuxtLink
                to="/admin/settings"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                active-class="bg-blue-700"
              >
                ตั้งค่า
              </NuxtLink>
            </template>

            <!-- เมนูสำหรับ Manager -->
            <template v-else-if="auth.user.role === 'manager'">
              <NuxtLink
                to="/"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                active-class="bg-blue-700"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink
                to="/manager/reports"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                active-class="bg-blue-700"
              >
                รายงาน
              </NuxtLink>
              <NuxtLink
                to="/manager/team"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                active-class="bg-blue-700"
              >
                ทีมงาน
              </NuxtLink>
            </template>

            <!-- เมนูสำหรับ User ทั่วไป -->
            <template v-else>
              <NuxtLink
                to="/"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                active-class="bg-blue-700"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink
                to="/profile"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                active-class="bg-blue-700"
              >
                โปรไฟล์
              </NuxtLink>
            </template>

            <!-- แสดงข้อมูลผู้ใช้ -->
            <div class="flex items-center space-x-3 ml-4 pl-4 border-l border-blue-500">
              <div class="text-sm">
                <p class="font-medium">{{ auth.user.firstname }} {{ auth.user.lastname }}</p>
                <p class="text-blue-200 text-xs">{{ auth.user.role }} • {{ auth.user.department }}</p>
              </div>
              <button
                @click="handleLogout"
                class="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition"
              >
                ออกจากระบบ
              </button>
            </div>
          </template>

          <!-- ถ้ายังไม่ login -->
          <template v-else>
            <NuxtLink
              to="/login"
              class="px-3 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 transition"
            >
              เข้าสู่ระบบ
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

// Init auth ถ้ายังไม่ได้ init
onMounted(() => {
  if (process.client && !auth.isAuthenticated) {
    auth.initAuth()
  }
})

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    auth.clearAuth()
    await navigateTo('/login')
  }
}
</script>

