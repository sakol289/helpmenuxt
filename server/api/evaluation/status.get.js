import connection from '../../utils/db.js'

export default defineEventHandler(async () => {
  const [rows] = await connection.query(`
    SELECT
      ca.id,
      ca.evaluation_id,
      ca.role,
      ca.status,
      evaluator.firstname AS evaluator_firstname,
      evaluator.lastname AS evaluator_lastname,
      evaluatee.firstname AS evaluatee_firstname,
      evaluatee.lastname AS evaluatee_lastname
    FROM committee_assignments ca
    LEFT JOIN users evaluator ON evaluator.id = ca.evaluator_id
    LEFT JOIN users evaluatee ON evaluatee.id = ca.evaluatee_id
    ORDER BY ca.evaluation_id, evaluator.firstname
  `)

  return {
    status: 'success',
    data: rows
  }
})

