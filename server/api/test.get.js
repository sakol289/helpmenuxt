import connection from "../utils/db.js";

export default defineEventHandler(async (event) => {
  const [rows] = await connection.query('SELECT * FROM users');
  return {
    success: true,
    message: 'users',
    data: rows
  }
})