export const useAuth = () => {
  const user = useState('user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (email, password) => {
    console.log('🔐 [useAuth] เริ่มต้น login')
    try {
      const data = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      console.log('✅ [useAuth] Login response:', data)
      if (data.success && data.data) {
        user.value = data.data.user
        if (data.data.token) {
          localStorage.setItem('auth-token', data.data.token)
          console.log('💾 [useAuth] บันทึก token ใน localStorage')
        }
        return { success: true, data }
      }
    } catch (error) {
      console.error('❌ [useAuth] Login error:', error)
      return { success: false, error: error.data?.message || error.message }
    }
  }

  const logout = async () => {
    console.log('🚪 [useAuth] เริ่มต้น logout')
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      console.error('❌ [useAuth] Logout error:', error)
    } finally {
      user.value = null
      localStorage.removeItem('auth-token')
      console.log('✅ [useAuth] ลบ user และ token แล้ว')
      await navigateTo('/login')
    }
  }

  const fetchUser = async () => {
    console.log('👤 [useAuth] เริ่มต้น fetchUser')
    try {
      // ตรวจสอบ cookie ก่อนเรียก API
      if (process.client) {
        const cookieToken = useCookie('auth-token')
        console.log('🍪 [useAuth] Cookie token ใน client:', cookieToken.value ? `มี (${cookieToken.value.substring(0, 20)}...)` : 'ไม่มี')
      }
      
      const data = await $fetch('/api/auth/me', {
        credentials: 'include' // ส่ง cookie ไปด้วย
      })
      console.log('✅ [useAuth] Me response:', data)
      if (data.success && data.data?.user) {
        user.value = data.data.user
        console.log('✅ [useAuth] ตั้งค่า user:', user.value)
        return data.data.user
      }
    } catch (error) {
      console.error('❌ [useAuth] FetchUser error:', error)
      console.error('❌ [useAuth] Error status:', error.statusCode)
      console.error('❌ [useAuth] Error message:', error.message)
      user.value = null
      return null
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    fetchUser
  }
}

