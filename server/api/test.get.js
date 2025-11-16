import connection from "../utils/db.js";

export default defineEventHandler(async (event) => {
  console.log('📊 [TEST] เริ่มต้นดึงข้อมูล users')
  
  console.log('🔍 [TEST] กำลัง query ข้อมูลจากฐานข้อมูล...')
  const [rows] = await connection.query('SELECT * FROM users');
  
  console.log('✅ [TEST] ดึงข้อมูลสำเร็จ พบ', rows.length, 'รายการ')
  console.log('📋 [TEST] ข้อมูล:', rows.map(u => ({ id: u.id, email: u.email })))
  
  return {
    success: true,
    message: 'users',
    data: {}
  }
})