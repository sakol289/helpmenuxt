import jwt from 'jsonwebtoken'
import connection from '../../utils/db.js'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const SCORE_MIN = 1
const SCORE_MAX = 4

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
    const denominator = SCORE_MAX - SCORE_MIN
    const normalized =
      denominator > 0 ? (Number(value.value_number) - SCORE_MIN) / denominator : 0
    const clamped = Math.min(1, Math.max(0, normalized))
    return {
      points: clamped * weight,
      percent: clamped * 100,
      display: Number(value.value_number)
    }
  }

  if (category.type === 'yes_or_no') {
    const boolVal =
      value.value_boolean === true ||
      value.value_boolean === 'true' ||
      value.value_boolean === 1 ||
      value.value_boolean === '1'
    if (value.value_boolean === null || value.value_boolean === undefined) {
      return { points: null, percent: null, display: null }
    }
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

  if (decoded.role !== 'ผู้ดูแล') {
    return { status: 'error', message: 'เฉพาะผู้ดูแลเท่านั้น', data: null }
  }

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
        evaluatee.id AS evaluatee_id,
        evaluatee.firstname AS evaluatee_firstname,
        evaluatee.lastname AS evaluatee_lastname,
        evaluatee.department AS evaluatee_department,
        evaluator.id AS evaluator_id,
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
      LEFT JOIN users evaluatee ON evaluatee.id = ca.evaluatee_id
      LEFT JOIN users evaluator ON evaluator.id = ca.evaluator_id
      LEFT JOIN evaluation_results er
        ON er.evaluatee_id = ca.evaluatee_id
        AND er.evaluator_id = ca.evaluator_id
      LEFT JOIN evaluation_category_results ecr
        ON ecr.evaluatee_id = ca.evaluatee_id
        AND ecr.evaluator_id = ca.evaluator_id
      ORDER BY evaluatee.firstname, evaluator.firstname
    `
  )

  const evaluateeMap = new Map()

  for (const row of rows) {
    if (!row.evaluatee_id) {
      continue
    }

    if (!evaluateeMap.has(row.evaluatee_id)) {
      evaluateeMap.set(row.evaluatee_id, {
        evaluatee_id: row.evaluatee_id,
        firstname: row.evaluatee_firstname,
        lastname: row.evaluatee_lastname,
        department: row.evaluatee_department,
        evaluatorsMap: new Map()
      })
    }

    const evalEntry = evaluateeMap.get(row.evaluatee_id)
    const evaluatorKey = row.evaluator_id || `unknown-${row.evaluatee_id}-${Math.random()}`

    if (!evalEntry.evaluatorsMap.has(evaluatorKey)) {
      evalEntry.evaluatorsMap.set(evaluatorKey, {
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
      evalEntry.evaluatorsMap.get(evaluatorKey).categoryValues[row.category_id] = {
        value_number: row.value_number,
        value_boolean: row.value_boolean,
        value_text: row.value_text,
        status: row.category_status
      }
    }
  }

  const result = []

  for (const evalEntry of evaluateeMap.values()) {
    const evaluators = []
    let totalPercentSum = 0
    let totalEvaluatorsWithScores = 0

    for (const evaluator of evalEntry.evaluatorsMap.values()) {
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
          type: cat.type,
          weight: cat.weight,
          value: display,
          weighted_points: points !== null ? Number(points.toFixed(2)) : null,
          percent: percent !== null ? Number(percent.toFixed(2)) : null,
          status: value?.status || null
        }
      })

      const weightedPercent =
        totalWeight > 0 ? Number(((weightedPoints / totalWeight) * 100).toFixed(2)) : null

      if (weightedPercent !== null) {
        totalPercentSum += weightedPercent
        totalEvaluatorsWithScores += 1
      }

      evaluators.push({
        ...evaluator,
        weighted_points: Number(weightedPoints.toFixed(2)),
        weighted_percent: weightedPercent,
        categories
      })
    }

    result.push({
      evaluatee_id: evalEntry.evaluatee_id,
      firstname: evalEntry.firstname,
      lastname: evalEntry.lastname,
      department: evalEntry.department,
      total_weight: totalWeight,
      average_percent:
        totalEvaluatorsWithScores > 0
          ? Number((totalPercentSum / totalEvaluatorsWithScores).toFixed(2))
          : null,
      evaluators
    })
  }

  return {
    status: 'success',
    data: result
  }
})

