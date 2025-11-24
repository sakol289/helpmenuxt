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

  const evaluateeId = Number(getQuery(event).evaluatee_id)

  if (!evaluateeId) {
    return { status: 'error', message: 'กรุณาระบุ evaluatee_id', data: null }
  }

  const [assignmentCheck] = await connection.query(
    `
      SELECT id
      FROM committee_assignments
      WHERE evaluator_id = ? AND evaluatee_id = ?
      LIMIT 1
    `,
    [decoded.id, evaluateeId]
  )

  if (!assignmentCheck.length) {
    return {
      status: 'error',
      message: 'คุณไม่ได้รับมอบหมายให้ประเมินบุคคลนี้',
      data: null
    }
  }

  const [evaluatees] = await connection.query(
    `
      SELECT id, firstname, lastname, department, role
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [evaluateeId]
  )

  const evaluateeInfo = evaluatees[0] || null

  const [categories] = await connection.query(
    `
      SELECT
        ce.id,
        ce.code,
        ce.name,
        ce.type,
        ce.weight,
        ce.topic_evaluation_id,
        ecr.value_number,
        ecr.value_boolean,
        ecr.value_text,
        ecr.status AS result_status
      FROM CategoryEvaluation ce
      LEFT JOIN evaluation_category_results ecr
        ON ecr.category_id = ce.id
        AND ecr.evaluatee_id = ?
        AND ecr.evaluator_id = ?
      WHERE ce.status = 'active'
      ORDER BY ce.topic_evaluation_id, ce.code
    `,
    [evaluateeId, decoded.id]
  )

  return {
    status: 'success',
    data: {
      evaluatee: evaluateeInfo,
      categories
    }
  }
})

