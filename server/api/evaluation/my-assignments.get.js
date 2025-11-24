import jwt from 'jsonwebtoken'
import connection from '../../utils/db.js'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

const readAuthToken = (event) => {
  const cookieToken = getCookie(event, 'auth-token')
  const headerToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  return cookieToken || headerToken
}

export default defineEventHandler(async (event) => {
  const token = readAuthToken(event)

  if (!token) {
    return { status: 'error', message: 'Unauthorized', data: null }
  }

  let decoded
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return {
      status: 'error',
      message: 'Token ไม่ถูกต้องหรือหมดอายุ',
      data: { details: error.message }
    }
  }

  const [rows] = await connection.query(
    `
      SELECT
        ca.id,
        ca.evaluatee_id,
        ca.role,
        evaluatee.firstname AS evaluatee_firstname,
        evaluatee.lastname AS evaluatee_lastname,
        evaluatee.department,
        er.total_score,
        er.summary,
        er.status AS result_status
      FROM committee_assignments ca
      LEFT JOIN users evaluatee ON evaluatee.id = ca.evaluatee_id
      LEFT JOIN evaluation_results er
        ON er.evaluator_id = ca.evaluator_id
        AND er.evaluatee_id = ca.evaluatee_id
      WHERE ca.evaluator_id = ?
      ORDER BY evaluatee.firstname
    `,
    [decoded.id]
  )

  return {
    status: 'success',
    data: rows
  }
})

