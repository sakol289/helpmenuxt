import jwt from 'jsonwebtoken'
import connection from '../utils/db.js'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

const REQUIRED_FIELDS = [
  'firstname',
  'lastname',
  'email',
  'password',
  'department',
  'role',
  'status'
]

const ALLOWED_DEPARTMENTS = ['เทคโนโลยีสารสนเทศ', 'โยธา', 'ไฟฟ้ากำลัง']
const ALLOWED_ROLES = ['ผู้ดูแล', 'ผู้ประเมิน', 'ผู้ถูกประเมิน']
const ALLOWED_STATUS = ['active', 'disabled']

const readAuthToken = (event) => {
  const cookieToken = getCookie(event, 'auth-token')
  const headerToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  return cookieToken || headerToken
}

export default defineEventHandler(async (event) => {
  try {
    const token = readAuthToken(event)

    if (!token) {
      return { status: 'error', message: 'Unauthorized', data: null }
    }

    try {
      jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return {
        status: 'error',
        message: 'Token ไม่ถูกต้องหรือหมดอายุ',
        data: { details: error.message }
      }
    }

    const body = await readBody(event)

    for (const field of REQUIRED_FIELDS) {
      if (!body[field]) {
        return {
          status: 'error',
          message:
            'กรุณากรอกให้ครบ firstname lastname email password department role status',
          data: null
        }
      }
    }

    if (!ALLOWED_DEPARTMENTS.includes(body.department)) {
      return {
        status: 'error',
        message: 'กรุณาใส่ชื่อแผนกที่เรามีเท่านั้น',
        data: ALLOWED_DEPARTMENTS
      }
    }

    if (!ALLOWED_ROLES.includes(body.role)) {
      return {
        status: 'error',
        message: 'กรุณาใส่ยศที่เรามีเท่านั้น',
        data: ALLOWED_ROLES
      }
    }

    if (!ALLOWED_STATUS.includes(body.status)) {
      return {
        status: 'error',
        message: 'กรุณาใส่สถานะที่เรามีเท่านั้น',
        data: ALLOWED_STATUS
      }
    }

    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [body.email]
    )

    if (existing.length) {
      return {
        status: 'error',
        message: 'มีผู้ใช้งานที่ใช้อีเมลนี้แล้ว',
        data: null
      }
    }

    const [result] = await connection.query(
      `
        INSERT INTO users (
          firstname,
          lastname,
          email,
          password,
          department,
          role,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        body.firstname,
        body.lastname,
        body.email,
        body.password,
        body.department,
        body.role,
        body.status
      ]
    )

    const newUser = {
      id: result.insertId,
      firstname: body.firstname,
      lastname: body.lastname,
      email: body.email,
      department: body.department,
      role: body.role,
      status: body.status
    }

    return {
      status: 'success',
      message: 'เพิ่มผู้ใช้สำเร็จ',
      data: { user: newUser }
    }
  } catch (error) {
    return { status: 'error', message: error.message, data: null }
  }
})