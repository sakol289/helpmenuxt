import jwt from 'jsonwebtoken'
import connection from '../../utils/db.js'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

const normalizeInput = (value = '') => value.toString().trim()

const throwBadRequest = (message) => {
  throw createError({ statusCode: 400, message })
}

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)
    const safeEmail = normalizeInput(email)
    const safePassword = normalizeInput(password)

    if (!safeEmail || !safePassword) {
      throwBadRequest('กรุณากรอก email และ password')
    }

    const [rows] = await connection.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [safeEmail]
    )

    if (!rows.length) {
      return {
        status: 'error',
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      }
    }

    const user = rows[0]

    if (user.status !== 'active') {
      throw createError({
        statusCode: 403,
        message: 'บัญชีของคุณถูกปิดการใช้งาน'
      })
    }

    if (user.password !== safePassword) {
      return {
        status: 'error',
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      }
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' })

    await connection.query('UPDATE users SET updated_at = NOW() WHERE id = ?', [
      user.id
    ])


    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7
    })

    return {
      status: 'success',
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        user: user,
        token
      }
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      data: { details: error.message }
    })
  }
})

