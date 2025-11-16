export default defineNuxtRouteMiddleware((to, from) => {
  console.log('🛡️ [AUTH MIDDLEWARE] ตรวจสอบการเข้าถึง:', to.path, 'จาก:', from.path)
  
  // ข้าม middleware สำหรับหน้า login
  if (to.path === '/login') {
    console.log('⏭️ [AUTH MIDDLEWARE] ข้าม middleware สำหรับหน้า login')
    return
  }

  // ตรวจสอบ user state ก่อน (ถ้ามี user state แสดงว่ามีการ login แล้ว)
  const userState = useState('user')
  if (userState.value) {
    console.log('✅ [AUTH MIDDLEWARE] พบ user state อนุญาตให้เข้าถึง')
    return
  }

  // ตรวจสอบ token จาก cookie
  const token = useCookie('auth-token')
  console.log('🍪 [AUTH MIDDLEWARE] Token จาก cookie:', token.value ? `มี (${token.value.substring(0, 20)}...)` : 'ไม่มี')
  
  // ถ้ามี token ให้ผ่านไป (อาจจะยังไม่ได้ fetch user data)
  if (token.value) {
    console.log('✅ [AUTH MIDDLEWARE] พบ token อนุญาตให้เข้าถึง - รอ fetch user data')
    return
  }
  
  // ถ้าไม่มี token และไม่มี user state ให้ redirect
  console.log('❌ [AUTH MIDDLEWARE] ไม่พบ token และ user state redirect ไปหน้า login')
  console.trace('📍 [AUTH MIDDLEWARE] Stack trace สำหรับ redirect')
  return navigateTo('/login')
})

