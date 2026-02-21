import Vue from 'vue'
import Root from './Root.vue'
import router from './router'

new Vue({
  router,
  render: h => h(Root)
}).$mount('#app')
