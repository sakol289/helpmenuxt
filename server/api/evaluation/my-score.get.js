import jwt from 'jsonwebtoken'
import connection from '../../utils/db.js'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

const readAuthToken = (event) => {
  const cookieToken = getCookie(event, 'auth-token')
  const headerToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  return cookieToken || headerToken
}

const computeCategoryScore = (category, value) => {
  const weight = Number(category.weight) || 0
  if (!value) {
    return { points: null, percent: null, display: null }
  }

  if (category.type === 'score') {
    if (value.value_number === null || value.value_number === undefined) {
      return { points: null, percent: null, display: null }
    }
    const numValue = Number(value.value_number)
    const normalized = numValue > 0 ? Math.min(numValue, 4) / 4 : 0
    const clamped = Math.min(1, Math.max(0, normalized))
    return {
      points: clamped * weight,
      percent: clamped * 100,
      display: numValue
    }
  }

  if (category.type === 'yes_or_no') {
    if (value.value_boolean === null || value.value_boolean === undefined) {
      return { points: null, percent: null, display: null }
    }
    const boolVal =
      value.value_boolean === true ||
      value.value_boolean === 'true' ||
      value.value_boolean === 1 ||
      value.value_boolean === '1'
    return {
      points: boolVal ? weight : 0,
      percent: boolVal ? 100 : 0,
      display: boolVal ? 'ใช่' : 'ไม่ใช่'
    }
  }

  const textValue = (value.value_text || '').trim()
  if (!textValue) {
    return { points: null, percent: null, display: null }
  }
  return { points: weight, percent: 100, display: textValue }
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

  const evaluateeId = decoded.id

  const [categoryDefs] = await connection.query(
    `
      SELECT
        id,
        code,
        name,
        type,
        weight,
        topic_evaluation_id
      FROM CategoryEvaluation
      WHERE status = 'active'
      ORDER BY topic_evaluation_id, code
    `
  )

  const totalWeight =
    categoryDefs.reduce((sum, cat) => sum + (Number(cat.weight) || 0), 0) || 100

  const [rows] = await connection.query(
    `
      SELECT
        ca.evaluator_id,
        evaluator.firstname AS evaluator_firstname,
        evaluator.lastname AS evaluator_lastname,
        er.total_score,
        er.status AS result_status,
        er.summary,
        ecr.category_id,
        ecr.value_number,
        ecr.value_boolean,
        ecr.value_text,
        ecr.status AS category_status
      FROM committee_assignments ca
      LEFT JOIN users evaluator ON evaluator.id = ca.evaluator_id
      LEFT JOIN evaluation_results er
        ON er.evaluator_id = ca.evaluator_id
        AND er.evaluatee_id = ca.evaluatee_id
      LEFT JOIN evaluation_category_results ecr
        ON ecr.evaluator_id = ca.evaluator_id
        AND ecr.evaluatee_id = ca.evaluatee_id
      WHERE ca.evaluatee_id = ?
      ORDER BY evaluator.firstname
    `,
    [evaluateeId]
  )

  const evaluatorMap = new Map()

  for (const row of rows) {
    if (!row.evaluator_id) {
      continue
    }

    if (!evaluatorMap.has(row.evaluator_id)) {
      evaluatorMap.set(row.evaluator_id, {
        evaluator_id: row.evaluator_id,
        firstname: row.evaluator_firstname,
        lastname: row.evaluator_lastname,
        total_score: row.total_score,
        status: row.result_status,
        summary: row.summary,
        categoryValues: {}
      })
    }

    if (row.category_id) {
      evaluatorMap.get(row.evaluator_id).categoryValues[row.category_id] = {
        value_number: row.value_number,
        value_boolean: row.value_boolean,
        value_text: row.value_text,
        status: row.category_status
      }
    }
  }

  const evaluators = []

  for (const evaluator of evaluatorMap.values()) {
    let weightedPoints = 0
    const categories = categoryDefs.map((cat) => {
      const value = evaluator.categoryValues[cat.id]
      const { points, percent, display } = computeCategoryScore(cat, value)
      if (points !== null && points !== undefined) {
        weightedPoints += points
      }
      return {
        id: cat.id,
        code: cat.code,
        name: cat.name,
        weight: cat.weight,
        type: cat.type,
        value: display,
        weighted_points: points !== null ? Number(points.toFixed(2)) : null,
        percent: percent !== null ? Number(percent.toFixed(2)) : null,
        status: value?.status || null
      }
    })

    const weightedPercent =
      totalWeight > 0 ? Number(((weightedPoints / totalWeight) * 100).toFixed(2)) : null

    evaluators.push({
      ...evaluator,
      weighted_points: Number(weightedPoints.toFixed(2)),
      weighted_percent: weightedPercent,
      categories
    })
  }

  return {
    status: 'success',
    data: {
      total_weight: totalWeight,
      evaluators
    }
  }
})
