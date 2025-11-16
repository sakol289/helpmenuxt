import connection from '../server/utils/db.js'
import bcrypt from 'bcryptjs'

async function createTestUser() {
  try {
    console.log('👤 กำลังสร้างผู้ใช้ทดสอบ...\n')
    
    const email = 'test@example.com'
    const password = 'password123'
    const firstname = 'Test'
    const lastname = 'User'
    const department = 'เทคโนโลยีสารสนเทศ'
    const role = 'ผู้ดูแล'
    
    // ตรวจสอบว่า email มีอยู่แล้วหรือไม่
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )
    
    if (existingUsers.length > 0) {
      console.log(`⚠️  อีเมล ${email} มีอยู่แล้ว`)
      console.log('🔄 กำลังอัปเดตรหัสผ่าน...\n')
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // อัปเดตรหัสผ่าน
      await connection.query(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?',
        [hashedPassword, email]
      )
      
      console.log(`✅ อัปเดตรหัสผ่านสำเร็จ`)
      console.log(`📧 Email: ${email}`)
      console.log(`🔑 Password: ${password}\n`)
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // สร้างผู้ใช้ใหม่
      const [result] = await connection.query(
        `INSERT INTO users (email, password, firstname, lastname, department, role, status, create, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, 'active', CURDATE(), NOW())`,
        [email, hashedPassword, firstname, lastname, department, role]
      )
      
      console.log(`✅ สร้างผู้ใช้สำเร็จ!`)
      console.log(`📧 Email: ${email}`)
      console.log(`🔑 Password: ${password}`)
      console.log(`🆔 User ID: ${result.insertId}\n`)
    }
    
    await connection.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message)
    console.error(error)
    await connection.end()
    process.exit(1)
  }
}

createTestUser()

