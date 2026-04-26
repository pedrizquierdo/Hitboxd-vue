import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    show: false,
    message: '',
    type: 'success',
  }),
  actions: {
    showToast(message, type = 'success') {
      if (this._dismissTimer) {
        clearTimeout(this._dismissTimer)
      }
      this.message = message
      this.type = type
      this.show = true
      this._dismissTimer = setTimeout(() => {
        this.show = false
      }, 3000)
    },
  },
})
