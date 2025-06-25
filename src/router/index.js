import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import UserAgreement from '@/views/UserAgreement.vue'
import Disclaimer from '@/views/Disclaimer.vue'
import Copyright from '@/views/Copyright.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/user-agreement',
      name: 'user-agreement',
      component: UserAgreement
    },
    {
      path: '/disclaimer',
      name: 'disclaimer',
      component: Disclaimer
    },
    {
      path: '/copyright',
      name: 'copyright',
      component: Copyright
    }
  ]
})

export default router
