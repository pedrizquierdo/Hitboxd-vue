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
      component: () => import('@/views/HomeFeed.vue'), 
      meta: { requiresAuth: true }
    },
    {
      path: '/game/:slug',
      name: 'GameDetail',
      component: () => import('@/views/GameDetail.vue'),
      props: true,
    },
    {
      path: '/tracker',
      name: 'TinderComponent',
      component: () => import('@/views/TinderPage.vue'),
    },
    {
      path: '/catalogo',
      name: 'Catalogo',
      component: () => import('@/views/Catalogo.vue'),
    },
    {
      path: '/profile',
      name: 'MyProfile',
      component: () => import('@/views/UserProfile.vue'), 
      meta: { requiresAuth: true }
    },
    {
      path: '/u/:username', 
      name: 'PublicProfile',
      component: () => import('@/views/PublicProfile.vue'),
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: () => import('@/views/AdminDashboard.vue'),
      meta: { requiresAuth: true } 
    },
    {
      path: '/lists/:listId',
      name: 'ListDetail',
      component: () => import('@/views/ListDetail.vue'),
      props: true,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/ProfileSettings.vue'),
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