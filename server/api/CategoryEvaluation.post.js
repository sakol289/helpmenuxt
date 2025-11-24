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
		console.log(body)
		if (
			!body.code ||
			!body.name ||
			body.weight === undefined ||
			!body.type ||
			body.description === undefined ||
			!body.status ||
			body.topic_evaluation_id === undefined
		) {
			return {
				status: "error",
				message: "Bad Request กรุณากรอกข้อมูลให้ครบ",
				data: {
					details: "กรุณากรอกข้อมูลให้ครบ code, name, weight, type, description, status, topic_evaluation_id"
				}
			}
		}
		const [result] = await connection.query(
			'INSERT INTO CategoryEvaluation (code, name, weight, type, description, status, topic_evaluation_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[body.code, body.name, body.weight, body.type, body.description, body.status, body.topic_evaluation_id]
		)
		console.log(result)
		return {
			status: "success",
			message: "CategoryEvaluation created successfully",
			data: {
				id: result.insertId,
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