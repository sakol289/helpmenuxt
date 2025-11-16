export default defineEventHandler(async (event) => {
  console.log('🚪 [LOGOUT] เริ่มต้นกระบวนการ logout')
  
  // ลบ cookie
  console.log('🍪 [LOGOUT] กำลังลบ cookie...')
  deleteCookie(event, 'auth-token')
  
  console.log('✅ [LOGOUT] Logout สำเร็จ')
  return {
    success: true,
    message: 'ออกจากระบบสำเร็จ',
    data: {}
  }
})

