export default defineNuxtRouteMiddleware((to, from) => {
  console.log('🛡️ [AUTH MIDDLEWARE] ตรวจสอบการเข้าถึง:', to.path, 'จาก:', from.path)
  
  const authStore = useAuthStore()
  const token = useCookie('auth-token')
  
  // ถ้าเข้าหน้า login ให้เช็คว่า login แล้วหรือยัง
  if (to.path === '/login') {
    // ตรวจสอบ auth store
    if (authStore.isAuthenticated && authStore.user) {
      console.log('✅ [AUTH MIDDLEWARE] Login แล้ว redirect ไปหน้า /')
      return navigateTo('/')
    }
    
    // ตรวจสอบ token จาก cookie
    if (token.value) {
      console.log('✅ [AUTH MIDDLEWARE] พบ token ใน cookie redirect ไปหน้า /')
      return navigateTo('/')
    }
    
    // ตรวจสอบ localStorage (client-side)
    if (process.client) {
      const localToken = localStorage.getItem('auth-token')
      if (localToken) {
        // ถ้ามี token แต่ยังไม่ได้ init ให้ init ก่อน
        if (!authStore.token) {
          authStore.initAuth()
        }
        if (authStore.isAuthenticated) {
          console.log('✅ [AUTH MIDDLEWARE] Login แล้ว (จาก localStorage) redirect ไปหน้า /')
          return navigateTo('/')
        }
      }
    }
    
    console.log('⏭️ [AUTH MIDDLEWARE] ยังไม่ login อนุญาตให้เข้าหน้า login')
    return
  }

  // ตรวจสอบ auth store (Pinia) สำหรับหน้าอื่นๆ
  if (authStore.isAuthenticated && authStore.user) {
    console.log('✅ [AUTH MIDDLEWARE] พบ auth store อนุญาตให้เข้าถึง')
    return
  }

  // ตรวจสอบ token จาก cookie (server-side)
  console.log('🍪 [AUTH MIDDLEWARE] Token จาก cookie:', token.value ? `มี (${token.value.substring(0, 20)}...)` : 'ไม่มี')
  
  // ตรวจสอบ token จาก localStorage (client-side)
  if (process.client) {
    const localToken = localStorage.getItem('auth-token')
    console.log('💾 [AUTH MIDDLEWARE] Token จาก localStorage:', localToken ? `มี (${localToken.substring(0, 20)}...)` : 'ไม่มี')
    
    if (localToken && !authStore.token) {
      // ถ้ามี token ใน localStorage แต่ยังไม่ได้ set ใน store ให้ init
      authStore.initAuth()
      if (authStore.isAuthenticated) {
        console.log('✅ [AUTH MIDDLEWARE] Init auth จาก localStorage สำเร็จ')
        return
      }
    }
  }
  
  // ถ้ามี token ใน cookie ให้ผ่านไป (อาจจะยังไม่ได้ fetch user data)
  if (token.value) {
    console.log('✅ [AUTH MIDDLEWARE] พบ token ใน cookie อนุญาตให้เข้าถึง - รอ fetch user data')
    return
  }
  
  // ถ้าไม่มี token และไม่มี auth state ให้ redirect
  console.log('❌ [AUTH MIDDLEWARE] ไม่พบ token และ auth state redirect ไปหน้า login')
  return navigateTo('/login')
})

