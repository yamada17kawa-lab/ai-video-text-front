import Vue from 'vue'
import VueRouter from 'vue-router'
import App from '../App.vue'
import Chat from '../Chat.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
