import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import VerifyTest from '@/views/VerifyTest.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/verify-test',
      name: 'verify-test',
      component: VerifyTest
    }
  ]
})

export default router
