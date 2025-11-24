import jwt from 'jsonwebtoken'
import connection from '../../utils/db.js'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

const readAuthToken = (event) => {
  const cookieToken = getCookie(event, 'auth-token')
  const headerToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  return cookieToken || headerToken
}

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  return value
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

  const body = await readBody(event)
  const categoryId = Number(body.category_id)
  const evaluateeId = Number(body.evaluatee_id)
  const status = body.status === 'final' ? 'final' : 'draft'

  if (!categoryId || !evaluateeId) {
    return {
      status: 'error',
      message: 'กรุณาระบุ category_id และ evaluatee_id',
      data: null
    }
  }

  const [categories] = await connection.query(
    'SELECT id, type FROM CategoryEvaluation WHERE id = ? LIMIT 1',
    [categoryId]
  )

  if (!categories.length) {
    return { status: 'error', message: 'ไม่พบตัวชี้วัดนี้', data: null }
  }

  const category = categories[0]
  let valueNumber = null
  let valueBoolean = null
  let valueText = null

  if (category.type === 'score') {
    const numeric = Number(body.value)
    if (Number.isNaN(numeric)) {
      return { status: 'error', message: 'ต้องใส่คะแนนเป็นตัวเลข', data: null }
    }
    valueNumber = numeric
  } else if (category.type === 'yes_or_no') {
    if (body.value === undefined || body.value === null) {
      return { status: 'error', message: 'กรุณาเลือกใช่หรือไม่', data: null }
    }
    valueBoolean =
      body.value === true ||
      body.value === 'true' ||
      body.value === 1 ||
      body.value === '1'
  } else {
    const textValue = normalizeValue(body.value)
    if (!textValue) {
      return { status: 'error', message: 'กรุณากรอกข้อมูล', data: null }
    }
    valueText = textValue
  }

  await connection.query(
    `
      INSERT INTO evaluation_category_results (
        evaluator_id,
        evaluatee_id,
        category_id,
        value_number,
        value_boolean,
        value_text,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        value_number = VALUES(value_number),
        value_boolean = VALUES(value_boolean),
        value_text = VALUES(value_text),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      decoded.id,
      evaluateeId,
      categoryId,
      valueNumber,
      valueBoolean,
      valueText,
      status
    ]
  )

  return {
    status: 'success',
    message: 'บันทึกผลหัวข้อนี้สำเร็จ',
    data: {
      category_id: categoryId,
      evaluatee_id: evaluateeId,
      status,
      value: body.value
    }
  }
})

