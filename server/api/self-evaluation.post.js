import jwt from 'jsonwebtoken'
import multer from 'multer'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import connection from '../utils/db.js'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.resolve(__dirname, '../../uploads/self-evaluations')

const storage = multer.memoryStorage()
const upload = multer({ storage })

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        reject(result)
      } else {
        resolve(result)
      }
    })
  })

const readAuthToken = (event) => {
  const cookieToken = getCookie(event, 'auth-token')
  const headerToken = getHeader(event, 'authorization')?.replace('Bearer ', '')
  return cookieToken || headerToken
}

const ensureUploadDir = async () => {
  await fs.mkdir(uploadDir, { recursive: true })
}

export default defineEventHandler(async (event) => {
  const token = readAuthToken(event)

  if (!token) {
    return { status: 'error', message: 'Unauthorized', data: null }
  }

  let decoded
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return {
      status: 'error',
      message: 'Token ไม่ถูกต้องหรือหมดอายุ',
      data: { details: error.message }
    }
  }

  await runMiddleware(
    event.node.req,
    event.node.res,
    upload.single('file')
  ).catch((error) => {
    throw createError({
      statusCode: 400,
      message: error.message || 'อัปโหลดไฟล์ไม่สำเร็จ'
    })
  })

  const body = event.node.req.body || {}
  const file = event.node.req.file

  if (!body.period_id || !body.category_id) {
    return {
      status: 'error',
      message: 'กรุณาเลือกรอบการประเมินและตัวชี้วัด'
    }
  }

  if (!file) {
    return { status: 'error', message: 'กรุณาเลือกไฟล์หลักฐาน' }
  }

  const storedName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}${path.extname(file.originalname || '')}`

  await ensureUploadDir()
  await fs.writeFile(path.join(uploadDir, storedName), file.buffer)

  const [result] = await connection.query(
    `
      INSERT INTO self_upload_port (
        user_id,
        topic_id,
        category_id,
        status,
        file_original_name,
        file_stored_name,
        file_mime,
        file_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      decoded.id,
      Number(body.period_id),
      Number(body.category_id),
      body.status === 'submitted' ? 'submitted' : 'draft',
      file.originalname || null,
      storedName,
      file.mimetype || null,
      file.size
    ]
  )

  return {
    status: 'success',
    message: 'บันทึกข้อมูลและอัปโหลดไฟล์สำเร็จ',
    data: {
      id: result.insertId,
      topic_id: body.period_id,
      category_id: body.category_id,
      status: body.status,
      file: {
        original: file.originalname,
        stored: storedName,
        size: file.size
      }
    }
  }
})

