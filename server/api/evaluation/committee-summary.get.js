import connection from '../../utils/db.js'

export default defineEventHandler(async () => {
  const [rows] = await connection.query(`
    SELECT
      ca.id AS assignment_id,
      evaluator.id AS evaluator_id,
      evaluator.firstname AS evaluator_firstname,
      evaluator.lastname AS evaluator_lastname,
      evaluatee.id AS evaluatee_id,
      evaluatee.firstname AS evaluatee_firstname,
      evaluatee.lastname AS evaluatee_lastname,
      ca.role,
      er.total_score,
      er.status AS evaluation_status
    FROM committee_assignments ca
    LEFT JOIN users evaluator ON evaluator.id = ca.evaluator_id
    LEFT JOIN users evaluatee ON evaluatee.id = ca.evaluatee_id
    LEFT JOIN evaluation_results er
      ON er.evaluator_id = ca.evaluator_id
      AND er.evaluatee_id = ca.evaluatee_id
    ORDER BY evaluator.firstname, evaluatee.firstname
  `)

  return {
    status: 'success',
    data: rows
  }
})

