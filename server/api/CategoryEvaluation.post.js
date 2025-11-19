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
		if (!body.code || !body.name || !body.description) {
			return {
				status: "error",
				message: "Bad Request กรุณากรอกข้อมูลให้ครบ",
				data: {
					details: "กรุณากรอกข้อมูลให้ครบ code, name, description"
				}
			}
		}
		const [result] = await connection.query('INSERT INTO CategoryEvaluation (code, name, description) VALUES (?, ?, ?)', [body.code, body.name, body.description])
		console.log(result)
		return {
			status: "success",
			message: "CategoryEvaluation created successfully",
			data: {
				id: result.insertId,
				code: body.code,
				name: body.name,
				description: body.description
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