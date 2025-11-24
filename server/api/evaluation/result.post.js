import jwt from 'jsonwebtoken'
import connection from '../../utils/db.js'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

const ALLOWED_STATUS = ['draft', 'final']

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

    const body = await readBody(event)
    const evaluatorId = Number(decoded.id)
    const evaluateeId = Number(body.evaluatee_id)
    const totalScore =
      body.total_score === null || body.total_score === undefined
        ? null
        : Number(body.total_score)
    const summary = body.summary || null
    const status = ALLOWED_STATUS.includes(body.status) ? body.status : 'draft'

    if (!evaluatorId || !evaluateeId) {
      return {
        status: 'error',
        message: 'ข้อมูลไม่ครบถ้วน',
        data: null
      }
    }

    const [existing] = await connection.query(
      `
        SELECT id
        FROM evaluation_results
        WHERE evaluator_id = ? AND evaluatee_id = ?
        LIMIT 1
      `,
      [evaluatorId, evaluateeId]
    )

    if (existing.length) {
      await connection.query(
        `
          UPDATE evaluation_results
          SET total_score = ?, summary = ?, status = ?
          WHERE id = ?
        `,
        [totalScore, summary, status, existing[0].id]
      )
    } else {
      await connection.query(
        `
          INSERT INTO evaluation_results (
            evaluator_id,
            evaluatee_id,
            total_score,
            summary,
            status
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [evaluatorId, evaluateeId, totalScore, summary, status]
      )
    }

    return {
      status: 'success',
      message: 'บันทึกผลการประเมินสำเร็จ',
      data: {
        evaluator_id: evaluatorId,
        evaluatee_id: evaluateeId,
        total_score: totalScore,
        status
      }
    }
  } catch (error) {
    return { status: 'error', message: error.message, data: null }
  }
})

