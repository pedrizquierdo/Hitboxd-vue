import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import GameDetail from '@/views/GameDetail.vue'
import HomeFeed from '@/views/HomeFeed.vue'
import TinderPage from '@/views/TinderPage.vue'
import Catalogo from '@/views/Catalogo.vue'
import UserProfile from '@/views/UserProfile.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import ListDetail from '@/views/ListDetail.vue'
import ProfileSettings from '@/views/ProfileSettings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Auth',
      component: LandingPage,
    },
    {
      path: '/game/:slug',
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
      path: '/tracker',
      name: 'TinderComponent',
      component: TinderPage,
    },
    {
      path: '/catalogo',
      name: 'catalogo',
      component: Catalogo,
    },
    {
      path: '/profile',
      name: 'UserProfile',
      component: UserProfile,

    },
    {
      path: '/games',
      name: 'catalogo',
      component: Catalogo,
    },

    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard,
    },

        {
      path: '/lists/:listId',
     name: 'ListDetail',
      component: ListDetail,
      props: true,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: ProfileSettings,
    }
  ],
})

// --- GUARDIANES DE NAVEGACIÓN (Se mantienen las correcciones anteriores) ---

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem(import.meta.env.VITE_KEY_STORAGE)
  // Nota: Aquí podrías añadir la lógica para 'requiresAdmin'

  // 1. Redirigir si falta autenticación en ruta protegida
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Auth' })
    return
  }

  // 2. Redirigir si está autenticado y trata de ir a Auth
  if (to.name === 'Auth' && isAuthenticated) {
    next({ name: 'HomeFeed' })
    return
  }

  // 3. Continuar la navegación normal
  next()
})

export default router
