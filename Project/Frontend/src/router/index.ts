import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/page/Landingpage.vue'
import LoginPage from '@/page/Login.vue'
import RegisterPage from '@/page/Register.vue'
import Dashboard from '@/page/Dashboard.vue'
import StudySet from '@/page/StudySet.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage,
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: LoginPage,
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'RegisterPage',
      component: RegisterPage,
      meta: { guestOnly: true },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: '/lernen/:setId',
      name: 'StudySet',
      component: StudySet,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.initialize()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { path: '/dashboard' }
  }

  return true
})

export default router
