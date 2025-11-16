import db from '../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    // ดึงข้อมูล users (เปลี่ยนชื่อตารางตามที่คุณมี)
    const [rows] = await db.query('SELECT * FROM users LIMIT 10')
    
    return {
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    // ถ้าไม่มีตาราง users ให้แสดงตารางที่มี
    if (error.code === 'ER_NO_SUCH_TABLE') {
      const [tables] = await db.query('SHOW TABLES')
      throw createError({
        statusCode: 404,
        statusMessage: 'ไม่พบตาราง users',
        data: {
          availableTables: tables,
          hint: 'กรุณาเปลี่ยนชื่อตารางในโค้ดให้ตรงกับตารางที่มี'
        }
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      data: {
        error: error.message
      }
    })
  }
})

