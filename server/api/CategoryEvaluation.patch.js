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
		if (!body.id || !body.code || !body.name || !body.weight || !body.type || !body.description || !body.status || !body.topic_evaluation_id) {
			return {
				status: "error",
				message: "Bad Request กรุณากรอกข้อมูลให้ครบ",
				data: {
					details: "กรุณากรอกข้อมูลให้ครบ id, code, name, weight, type, description, status, topic_evaluation_id"
				}
			}
		}
		const [result] = await connection.query(
			'UPDATE CategoryEvaluation SET code = ?, name = ?, weight = ?, type = ?, description = ?, status = ?, topic_evaluation_id = ? WHERE id = ?',
			[body.code, body.name, body.weight, body.type, body.description, body.status, body.topic_evaluation_id, body.id]
		)
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
			message: "CategoryEvaluation updated successfully",
			data: {
				id: body.id,
				code: body.code,
				name: body.name,
				weight: body.weight,
				type: body.type,
				description: body.description,
				status: body.status,
				topic_evaluation_id: body.topic_evaluation_id,
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