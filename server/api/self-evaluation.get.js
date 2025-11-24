import jwt from 'jsonwebtoken'
import connection from '../utils/db.js'

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
        se.id,
        se.topic_id,
        te.name AS topic_name,
        te.year AS topic_year,
        se.category_id,
        ce.code AS category_code,
        ce.name AS category_name,
        se.status,
        se.file_original_name,
        se.file_stored_name,
        se.file_size,
        se.created_at
      FROM self_upload_port se
      LEFT JOIN TopicEvaluation te ON te.id = se.topic_id
      LEFT JOIN CategoryEvaluation ce ON ce.id = se.category_id
      WHERE se.user_id = ?
      ORDER BY se.created_at DESC
      LIMIT 50
    `,
    [decoded.id]
  )

  return {
    status: 'success',
    data: rows
  }
})

