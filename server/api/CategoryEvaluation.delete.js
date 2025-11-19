import connection from '../utils/db.js'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	try {
		const cookieToken = getCookie(event, 'auth-token')
		const headerToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
		const token = cookieToken || headerToken
		if (!token) {
			return {
				status: "error",
				message: "Unauthorized",
				data: null
			}
		}
		let decoded
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET)
		} catch (error) {
			return {
				status: "error",
				message: 'Token ไม่ถูกต้องหรือหมดอายุ',
				data: {
					details: error.message
				}
			}
		}
		console.log(decoded)		
		const body = await readBody(event)
		const { id } = body
		const [result] = await connection.query('DELETE FROM CategoryEvaluation WHERE id = ?', [id])
		if (result.affectedRows === 0) {
			return {
				status: "error",
				message: "CategoryEvaluation not found",
				data: {
					details: "CategoryEvaluation not found"
				}
			}
		}
		return {
			status: "success",
			message: "CategoryEvaluation deleted successfully",
			data: {
			}
		}
	} catch (error) {
		return {
			status: "error",
			message: error.message,
			data: null
		}
	}
})