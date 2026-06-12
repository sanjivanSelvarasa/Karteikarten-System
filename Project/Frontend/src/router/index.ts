import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/page/Dashboard.vue'
import Login from '@/page/Login.vue'
import Register from '@/page/Register.vue'
import CreateSetView from '@/page/CreateSetView.vue'
import LearnView from '@/page/LearnView.vue'
import SetCardsView from '@/page/SetCardsView.vue'
import Landingpage from '@/page/Landingpage.vue'
import LearningSetsView from '@/page/LearningSetsView.vue'
import ProgressView from '@/page/ProgressView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landingpage',
      component: Landingpage,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/sets/create',
      name: 'create-set',
      component: CreateSetView,
    },
    {
      path: '/sets',
      name: 'learning-sets',
      component: LearningSetsView,
    },
    {
      path: '/sets/:id/cards',
      name: 'set-cards',
      component: SetCardsView,
    },
    {
      path: '/progress',
      name: 'progress',
      component: ProgressView,
    },
    {
      path: '/learn/:id',
      name: 'learn',
      component: LearnView,
    },
  ],
})

router.beforeEach((to) => {
  const protectedRoutes = ['dashboard', 'learning-sets', 'create-set', 'set-cards', 'progress', 'learn']
  const hasToken = Boolean(
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken'),
  )

  if (protectedRoutes.includes(String(to.name)) && !hasToken) {
    return { name: 'login' }
  }

  if (to.name === 'login' && hasToken) {
    return { name: 'dashboard' }
  }
})

export default router
