import connection from '../server/utils/db.js'
import bcrypt from 'bcryptjs'

async function hashAllPasswords() {
  try {
    console.log('🔐 กำลังดึงข้อมูลผู้ใช้ทั้งหมด...\n')
    
    // ดึงข้อมูลผู้ใช้ทั้งหมด
    const [users] = await connection.query('SELECT id, email, password FROM users')
    
    console.log(`📊 พบผู้ใช้ ${users.length} คน\n`)
    
    for (const user of users) {
      // ตรวจสอบว่า password ถูก hash แล้วหรือยัง
      // bcrypt hash มักจะขึ้นต้นด้วย $2a$, $2b$, หรือ $2y$
      const isHashed = user.password.startsWith('$2')
      
      if (!isHashed) {
        console.log(`🔄 กำลัง hash password สำหรับ: ${user.email}`)
        
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10)
        
        // อัปเดตในฐานข้อมูล
        await connection.query(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id]
        )
        
        console.log(`✅ Hash password สำเร็จสำหรับ: ${user.email}\n`)
      } else {
        console.log(`⏭️  ข้าม ${user.email} (password ถูก hash แล้ว)\n`)
      }
    }
    
    console.log('✅ เสร็จสิ้น!')
    await connection.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message)
    console.error(error)
    await connection.end()
    process.exit(1)
  }
}

hashAllPasswords()

