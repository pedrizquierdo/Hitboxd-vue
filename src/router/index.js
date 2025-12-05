import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Auth',
      component: LandingPage,
    },
  ],
})


router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem(import.meta.env.VITE_KEY_STORAGE)

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Auth' })
  }

  if (to.name === 'Auth' && isAuthenticated) {
    next({ name: 'Home' })
  }

  next()
})

export default router
