import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/page/Landingpage.vue'
import Dashboard from '@/page/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage,
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
    },
  ],
})

export default router
