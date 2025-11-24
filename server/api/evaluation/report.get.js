import connection from '../../utils/db.js'

export default defineEventHandler(async () => {
  const [rows] = await connection.query(`
    SELECT
      er.evaluation_id,
      er.evaluatee_id,
      evaluatee.firstname AS evaluatee_firstname,
      evaluatee.lastname AS evaluatee_lastname,
      SUM(er.total_score) AS total_score,
      COUNT(er.id) AS committee_count
    FROM evaluation_results er
    LEFT JOIN users evaluatee ON evaluatee.id = er.evaluatee_id
    GROUP BY er.evaluation_id, er.evaluatee_id
    ORDER BY evaluatee.firstname
  `)

  return {
    status: 'success',
    data: rows
  }
})

