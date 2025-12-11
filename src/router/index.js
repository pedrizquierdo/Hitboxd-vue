import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import GameDetail from '@/views/GameDetail.vue'
import HomeFeed from '@/views/HomeFeed.vue'
import UserProfile from '@/views/UserProfile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Auth',
      component: LandingPage,
    },
    {
      path: '/game/:id',
      name: 'GameDetail',
      component: GameDetail,
      props: true,
    },
    {
      path: '/home',
      name: 'HomeFeed',
      component: HomeFeed,
    },

    {
      path: '/profile',
      name: 'UserProfile',
      component: UserProfile,
}

    

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
