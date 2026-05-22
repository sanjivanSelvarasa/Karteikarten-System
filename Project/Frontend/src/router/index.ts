import { createRouter, createWebHistory } from 'vue-router'
import Landingpage from '@/page/Landingpage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landingpage',
      component: Landingpage,
    },
  ],
})

export default router
