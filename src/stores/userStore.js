import { defineStore } from 'pinia'
import api from '@/api/axios.js'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoaded: false,
  }),
  actions: {
    async fetchUser() {
      if (this.isLoaded) return
      try {
        const { data } = await api.get('/users/me')
        this.user = data
        this.isLoaded = true
      } catch (error) {
        this.isLoaded = true
        if (error.response?.status === 401) {
          router.push('/login')
        }
      }
    },
    clearUser() {
      this.user = null
      this.isLoaded = false
    },
  },
})
