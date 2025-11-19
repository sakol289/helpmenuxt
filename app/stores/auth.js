import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  actions: {
    setAuth(token, user) {
      this.token = token
      this.user = user
      this.isAuthenticated = true
      
      // บันทึกใน localStorage
      if (process.client) {
        localStorage.setItem('auth-token', token)
        localStorage.setItem('auth-user', JSON.stringify(user))
      }
    },

    clearAuth() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      
      // ลบจาก localStorage
      if (process.client) {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('auth-user')
      }
    },

    initAuth() {
      // โหลดข้อมูลจาก localStorage เมื่อเริ่มต้น
      if (process.client) {
        const token = localStorage.getItem('auth-token')
        const userStr = localStorage.getItem('auth-user')
        
        if (token && userStr) {
          try {
            this.token = token
            this.user = JSON.parse(userStr)
            this.isAuthenticated = true
          } catch (e) {
            console.error('Error parsing user data:', e)
            this.clearAuth()
          }
        }
      }
    }
  }
})

