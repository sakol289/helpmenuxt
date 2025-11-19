import connection from '../../utils/db.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export default defineEventHandler(async (event) => {
  try {
    // ดึง token จาก cookie หรือ header
    const cookieToken = getCookie(event, 'auth-token')
    const headerToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
    const token = cookieToken || headerToken
    
    if (!token) {
      return {
        status: "error",
        message: 'กรุณาเข้าสู่ระบบ',
        data: {
          details: 'ไม่พบ token'
        }
      }
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return {
        status: "error",
        message: 'Token ไม่ถูกต้องหรือหมดอายุ',
        data: {
          details: error.message
        }
      }
    }

    // ดึงข้อมูลผู้ใช้
    const [users] = await connection.query(
      'SELECT id, email, firstname, lastname, department, role, status FROM users WHERE id = ?',
      [decoded.id]
    )

    if (users.length === 0) {
      return {
        status: "error",
        message: 'ไม่พบผู้ใช้',
        data: {
          details: 'ไม่พบผู้ใช้ในฐานข้อมูล'
        }
      }
    }

    const user = users[0]

    // ตรวจสอบสถานะผู้ใช้
    if (user.status !== 'active') {
      return {
        status: "error",
        message: 'บัญชีของคุณถูกปิดการใช้งาน',
        data: {
          details: 'บัญชีของคุณถูกปิดการใช้งาน'
        }
      }
    }
  
    return {
      status: "success",
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      data: {
        user
      }
    }
  } catch (error) {
    return {
      status: "error",
      message: 'เกิดข้อผิดพลาด',
      data: {
        details: error.message
      }
    }
  }
})

