import connection from '../../utils/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
console.log('🔐 [LOGIN] JWT_SECRET:', JWT_SECRET)
export default defineEventHandler(async (event) => {
  console.log('🔐 [LOGIN] เริ่มต้นกระบวนการ login')
  try {
    const body = await readBody(event)
    const { email, password } = body
    console.log('📧 [LOGIN] รับข้อมูล:', { email, hasPassword: !!password })

    // ตรวจสอบว่ามี email และ password หรือไม่
    if (!email || !password) {
      console.log('❌ [LOGIN] ขาดข้อมูล email หรือ password')
      throw createError({
        statusCode: 400,
        message: 'กรุณากรอก email และ password'
      })
    }

    // ค้นหาผู้ใช้จาก email
    console.log('🔍 [LOGIN] กำลังค้นหาผู้ใช้จาก email:', email)
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      console.log('❌ [LOGIN] ไม่พบผู้ใช้ที่มี email:', email)
      throw createError({
        statusCode: 401,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      })
    }

    const user = users[0]
    console.log('✅ [LOGIN] พบผู้ใช้:', { id: user.id, email: user.email, status: user.status })

    // ตรวจสอบสถานะผู้ใช้
    if (user.status !== 'active') {
      console.log('⚠️ [LOGIN] บัญชีถูกปิดการใช้งาน:', user.status)
      throw createError({
        statusCode: 403,
        message: 'บัญชีของคุณถูกปิดการใช้งาน'
      })
    }

    // ตรวจสอบรหัสผ่าน
    console.log('🔑 [LOGIN] กำลังตรวจสอบรหัสผ่าน...')
    let isPasswordValid = false
    
    // ตรวจสอบว่า password ถูก hash แล้วหรือยัง (bcrypt hash ขึ้นต้นด้วย $2)
    if (user.password.startsWith('$2')) {
      console.log('🔐 [LOGIN] Password ถูก hash แล้ว ใช้ bcrypt.compare')
      isPasswordValid = await bcrypt.compare(password, user.password)
    } else {
      console.log('⚠️ [LOGIN] Password ยังไม่ถูก hash เปรียบเทียบตรงๆ')
      isPasswordValid = password === user.password
      
      // ถ้า password ถูกต้อง ให้ hash และอัปเดตในฐานข้อมูล
      if (isPasswordValid) {
        console.log('🔄 [LOGIN] Password ถูกต้อง กำลัง hash และอัปเดตในฐานข้อมูล...')
        const hashedPassword = await bcrypt.hash(password, 10)
        await connection.query(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id]
        )
        console.log('✅ [LOGIN] Hash และอัปเดต password สำเร็จ')
      }
    }

    if (!isPasswordValid) {
      console.log('❌ [LOGIN] รหัสผ่านไม่ถูกต้อง')
      throw createError({
        statusCode: 401,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      })
    }

    console.log('✅ [LOGIN] รหัสผ่านถูกต้อง กำลังสร้าง JWT token...')
    // สร้าง JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    console.log('✅ [LOGIN] สร้าง JWT token สำเร็จ')

    // อัปเดต updated_at
    console.log('🔄 [LOGIN] กำลังอัปเดต updated_at...')
    await connection.query(
      'UPDATE users SET updated_at = NOW() WHERE id = ?',
      [user.id]
    )

    // ส่งข้อมูลผู้ใช้กลับไป (ไม่ส่ง password)
    const { password: _, ...userWithoutPassword } = user

    // ตั้งค่า cookie
    console.log('🍪 [LOGIN] กำลังตั้งค่า cookie...')
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 วัน
    })

    console.log('✅ [LOGIN] Login สำเร็จ!')
    return {
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        user: userWithoutPassword,
        token
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
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      data: {
        error: error.message
      }
    })
  }
})

