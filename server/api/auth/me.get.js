import connection from '../../utils/db.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export default defineEventHandler(async (event) => {
  console.log('👤 [ME] เริ่มต้นดึงข้อมูลผู้ใช้ปัจจุบัน')
  try {
    // ดึง token จาก cookie หรือ header
    console.log('🔍 [ME] กำลังค้นหา token...')
    const cookieToken = getCookie(event, 'auth-token')
    const headerToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
    const token = cookieToken || headerToken
    
    console.log('🔍 [ME] Cookie token:', cookieToken ? `มี (${cookieToken.substring(0, 20)}...)` : 'ไม่มี')
    console.log('🔍 [ME] Header token:', headerToken ? `มี (${headerToken.substring(0, 20)}...)` : 'ไม่มี')
    console.log('🔍 [ME] Token ที่ใช้:', token ? `มี (${token.substring(0, 20)}...)` : 'ไม่มี')
    
    if (!token) {
      console.log('❌ [ME] ไม่พบ token')
      throw createError({
        statusCode: 401,
        message: 'กรุณาเข้าสู่ระบบ'
      })
    }
    console.log('✅ [ME] พบ token')

    // ตรวจสอบ token
    console.log('🔐 [ME] กำลังตรวจสอบ token...')
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log('✅ [ME] Token ถูกต้อง:', { id: decoded.id, email: decoded.email })
    } catch (error) {
      console.log('❌ [ME] Token ไม่ถูกต้องหรือหมดอายุ:', error.message)
      throw createError({
        statusCode: 401,
        message: 'Token ไม่ถูกต้องหรือหมดอายุ'
      })
    }

    // ดึงข้อมูลผู้ใช้
    console.log('🔍 [ME] กำลังดึงข้อมูลผู้ใช้จากฐานข้อมูล...')
    const [users] = await connection.query(
      'SELECT id, email, firstname, lastname, department, role, status FROM users WHERE id = ?',
      [decoded.id]
    )

    if (users.length === 0) {
      console.log('❌ [ME] ไม่พบผู้ใช้ในฐานข้อมูล')
      throw createError({
        statusCode: 404,
        message: 'ไม่พบผู้ใช้'
      })
    }

    const user = users[0]
    console.log('✅ [ME] พบผู้ใช้:', { id: user.id, email: user.email, status: user.status })

    // ตรวจสอบสถานะผู้ใช้
    if (user.status !== 'active') {
      console.log('⚠️ [ME] บัญชีถูกปิดการใช้งาน:', user.status)
      throw createError({
        statusCode: 403,
        message: 'บัญชีของคุณถูกปิดการใช้งาน'
      })
    }

    console.log('✅ [ME] ดึงข้อมูลผู้ใช้สำเร็จ')
    return {
      success: true,
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      data: {
        user
      }
    }
  } catch (error) {
    // ถ้าเป็น error ที่สร้างด้วย createError ให้ throw ต่อ
    if (error.statusCode) {
      throw error
    }

    // ถ้าเป็น error อื่นๆ
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาด',
      data: {
        error: error.message
      }
    })
  }
})

