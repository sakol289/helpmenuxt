export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'users',
    data: {
      name: 'John Doe',
      age: 20
    }
  }    
})
