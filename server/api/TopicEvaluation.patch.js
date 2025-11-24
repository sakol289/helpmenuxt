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
		if (!body.id || !body.code || !body.name || !body.year || !body.start_date || !body.end_date || !body.description || !body.status) {
			return {
				status: "error",
				message: "Bad Request กรุณากรอกข้อมูลให้ครบ",
				data: {
					details: "กรุณากรอกข้อมูลให้ครบ id, code, name, year, start_date, end_date, description, status"
				}
			}
		}
		const [result] = await connection.query('UPDATE TopicEvaluation SET code = ?, name = ?, year = ?, start_date = ?, end_date = ?, description = ?, status = ? WHERE id = ?', [body.code, body.name, body.year, body.start_date, body.end_date, body.description, body.status, body.id])
		if (result.affectedRows === 0) {
			return {
				status: "error",
				message: "TopicEvaluation not found",
				data: {
					details: "TopicEvaluation not found"
				}
			}
		}
		return {
			status: "success",
			message: "TopicEvaluation updated successfully",
			data: {
				id: body.id,
				code: body.code,
				name: body.name,
				year: body.year,
				start_date: body.start_date,
				end_date: body.end_date,
				description: body.description,
				status: body.status,
				created_at: body.created_at,
				updated_at: body.updated_at
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