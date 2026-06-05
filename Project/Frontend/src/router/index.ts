import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/page/Landingpage.vue'
<<<<<<< Updated upstream
import Dashboard from '@/page/Dashboard.vue'
=======
import LoginPage from '@/page/Login.vue'
import RegisterPage from '@/page/Register.vue'
>>>>>>> Stashed changes

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage,
    },
    {
<<<<<<< Updated upstream
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
=======
      path: "/login",
      name: "LoginPage",
      component: LoginPage,
    },
    {
      path: "/register",
      name: "RegisterPage",
      component: RegisterPage,
>>>>>>> Stashed changes
    },
  ],
})

export default router
