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
import PublicProfile from '@/views/PublicProfile.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Auth',
      component: LandingPage,
    },
    {
      path: '/home',
      name: 'HomeFeed',
      component: HomeFeed,
      meta: { requiresAuth: true }
    },
    {
      path: '/game/:slug',
      name: 'GameDetail',
      component: GameDetail,
      props: true,
    },
    {
      path: '/tracker',
      name: 'TinderComponent',
      component: TinderPage,
    },
    {
      path: '/games',
      name: 'Catalogo',
      component: Catalogo,
    },
    {
      path: '/profile',
      name: 'MyProfile',
      component: UserProfile,
      meta: { requiresAuth: true }
    },
    {
      path: '/u/:username',
      name: 'PublicProfile',
      component: PublicProfile,
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true }
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
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})


router.beforeEach((to, from, next) => {

  const storageKey = import.meta.env.VITE_KEY_STORAGE || 'isAuthenticated';
  const isAuthenticated = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Auth' });
  }
  else if (to.name === 'Auth' && isAuthenticated) {
    next({ name: 'HomeFeed' });
  }

  else {
    next();
  }
})

export default router
