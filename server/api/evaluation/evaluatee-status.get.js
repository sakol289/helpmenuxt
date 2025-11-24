import connection from '../../utils/db.js'

export default defineEventHandler(async () => {
  const [rows] = await connection.query(`
    SELECT
      evaluatee.id AS evaluatee_id,
      evaluatee.firstname AS evaluatee_firstname,
      evaluatee.lastname AS evaluatee_lastname,
      COUNT(ca.id) AS committee_count,
      SUM(CASE WHEN er.status = 'final' THEN 1 ELSE 0 END) AS completed_count,
      SUM(CASE WHEN er.status IS NULL OR er.status = 'draft' THEN 1 ELSE 0 END) AS pending_count,
      AVG(er.total_score) AS avg_score
    FROM users evaluatee
    LEFT JOIN committee_assignments ca ON ca.evaluatee_id = evaluatee.id
    LEFT JOIN evaluation_results er
      ON er.evaluator_id = ca.evaluator_id
      AND er.evaluatee_id = ca.evaluatee_id
    WHERE evaluatee.role = 'ผู้ถูกประเมิน'
    GROUP BY evaluatee.id, evaluatee.firstname, evaluatee.lastname
    ORDER BY evaluatee.firstname
  `)

  return {
    status: 'success',
    data: rows
  }
})

