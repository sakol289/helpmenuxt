import connection from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const evaluationId = body.evaluation_id || 1
  const evaluatorId = body.evaluator_id
  const evaluateeId = body.evaluatee_id
  const role = body.role || 'member'

  await connection.query(
    `
      INSERT INTO committee_assignments (
        evaluation_id,
        evaluator_id,
        evaluatee_id,
        role
      )
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `,
    [evaluationId, evaluatorId, evaluateeId, role]
  )

  return {
    status: 'success',
    message: 'assigned',
    data: {
      evaluation_id: evaluationId,
      evaluator_id: evaluatorId,
      evaluatee_id: evaluateeId,
      role
    }
  }
})

