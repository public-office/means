import 'vite/dynamic-import-polyfill'
import './css/global.css'

import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import App from './components/App.vue'
import store from './store'

Vue.use(VueRouter)
Vue.use(Vuex)

const router = new VueRouter({
  mode: 'history',
  routes: [{path: '*', component: {template: '<span />'}}]
})

new Vue({
  router,
  render: h => h(App),
  store: new Vuex.Store(store)
}).$mount('#app')