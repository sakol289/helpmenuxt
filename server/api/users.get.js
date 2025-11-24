import connection from '../utils/db.js'

export default defineEventHandler(async () => {
  const [rows] = await connection.query(
    `
      SELECT id, firstname, lastname, email, department, role, status
      FROM users
      ORDER BY id DESC
      LIMIT 50
    `
  )

  return {
    status: 'success',
    data: rows
  }
})
