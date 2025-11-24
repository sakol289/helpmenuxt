import connection from '../../utils/db.js'

export default defineEventHandler(async () => {
  const [rows] = await connection.query(`
    SELECT
      evaluator.id AS evaluator_id,
      evaluator.firstname AS evaluator_firstname,
      evaluator.lastname AS evaluator_lastname,
      COUNT(ca.id) AS assigned_count,
      SUM(CASE WHEN er.status = 'final' THEN 1 ELSE 0 END) AS completed_count,
      SUM(CASE WHEN er.status IS NULL OR er.status = 'draft' THEN 1 ELSE 0 END) AS pending_count
    FROM committee_assignments ca
    LEFT JOIN users evaluator ON evaluator.id = ca.evaluator_id
    LEFT JOIN evaluation_results er
      ON er.evaluator_id = ca.evaluator_id
      AND er.evaluatee_id = ca.evaluatee_id
    GROUP BY evaluator.id, evaluator.firstname, evaluator.lastname
    ORDER BY evaluator.firstname
  `)

  return {
    status: 'success',
    data: rows
  }
})

