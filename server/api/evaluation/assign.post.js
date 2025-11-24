import jwt from 'jsonwebtoken'
import connection from '../../utils/db.js'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

const ALLOWED_ROLES = ['ประธาน', 'กรรมการ']

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
    const evaluatorId = Number(body.evaluator_id)
    const evaluateeId = Number(body.evaluatee_id)
    const selectedRole = ALLOWED_ROLES.includes(body.role)
      ? body.role
      : 'กรรมการ'

    if (!evaluatorId || !evaluateeId) {
      return {
        status: 'error',
        message: 'กรุณาใส่ evaluator_id และ evaluatee_id',
        data: null
      }
    }

    const [existing] = await connection.query(
      `
        SELECT id
        FROM committee_assignments
        WHERE evaluator_id = ? AND evaluatee_id = ?
        LIMIT 1
      `,
      [evaluatorId, evaluateeId]
    )

    if (existing.length) {
      await connection.query(
        'UPDATE committee_assignments SET role = ? WHERE id = ?',
        [selectedRole, existing[0].id]
      )
    } else {
      await connection.query(
        'INSERT INTO committee_assignments (evaluator_id, evaluatee_id, role) VALUES (?, ?, ?)',
        [evaluatorId, evaluateeId, selectedRole]
      )
    }

    return {
      status: 'success',
      message: 'มอบหมายกรรมการสำเร็จ',
      data: {
        evaluator_id: evaluatorId,
        evaluatee_id: evaluateeId,
        role: selectedRole
      }
    }
  } catch (error) {
    return { status: 'error', message: error.message, data: null }
  }
})

