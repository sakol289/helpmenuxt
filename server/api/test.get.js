import db from '../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    // ทดสอบดึงข้อมูลจากตาราง (เปลี่ยนชื่อตารางตามที่คุณมี)
    const [rows] = await db.query('SHOW TABLES')
    
    return {
      success: true,
      message: 'เชื่อมต่อฐานข้อมูลสำเร็จ',
      tables: rows,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      data: {
        error: error.message
      }
    })
  }
})

