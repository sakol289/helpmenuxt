import db from './app/db/connect.js'

async function testDatabase() {
  try {
    console.log('🔌 กำลังเชื่อมต่อฐานข้อมูล...\n')
    
    // ทดสอบการเชื่อมต่อ
    const [result] = await db.query('SELECT 1 as test')
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ!')
    console.log('📊 ผลลัพธ์:', result, '\n')
    
    // แสดงตารางทั้งหมด
    console.log('📋 กำลังดึงรายชื่อตาราง...')
    const [tables] = await db.query('SHOW TABLES')
    console.log('📊 ตารางทั้งหมด:')
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0]
      console.log(`   ${index + 1}. ${tableName}`)
    })
    console.log('')
    
    // ถ้ามีตาราง users ให้ดึงข้อมูล
    if (tables.length > 0) {
      const firstTable = Object.values(tables[0])[0]
      console.log(`📊 กำลังดึงข้อมูลจากตาราง "${firstTable}"...`)
      const [rows] = await db.query(`SELECT * FROM ${firstTable} LIMIT 5`)
      console.log(`✅ พบข้อมูล ${rows.length} แถว:`)
      console.log(JSON.stringify(rows, null, 2))
    }
    
    // ปิดการเชื่อมต่อ
    await db.end()
    console.log('\n✅ ปิดการเชื่อมต่อเรียบร้อย')
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message)
    console.error('รายละเอียด:', error)
    process.exit(1)
  }
}

testDatabase()

