import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/page/Dashboard.vue'
import Login from '@/page/Login.vue'
import Register from '@/page/Register.vue'
import CreateSetView from '@/page/CreateSetView.vue'
import LearnView from '@/page/LearnView.vue'
import SetCardsView from '@/page/SetCardsView.vue'
import Landingpage from '@/page/Landingpage.vue'

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
      path: '/sets/:id/cards',
      name: 'set-cards',
      component: SetCardsView,
    },
    {
      path: '/learn/:id',
      name: 'learn',
      component: LearnView,
    },
  ],
})

router.beforeEach((to) => {
  const protectedRoutes = ['dashboard', 'create-set', 'set-cards', 'learn']
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
