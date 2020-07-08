import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

// 防止点击登录按钮报错
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(to) {
  return VueRouterPush.call(this, to).catch(err => err)
}
const routes = [
  {
    path: '/',
    redirect: '/login',
    component: () => import('../components/Login.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../components/Login.vue')
  },
  {
    path: '/home',
    name: 'home',
    redirect: '/welcome',
    component: () => import('../components/Home.vue'),
    children: [
      {
        path: '/welcome',
        name: 'welcome',
        component: () => import('../components/Welcome.vue')
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('../components/users/Users.vue')
      },
      {
        path: '/rights',
        name: 'rights',
        component: () => import('../components/power/rights.vue')
      },
      {
        path: '/roles',
        name: 'roles',
        component: () => import('../components/power/roles.vue')
      }
    ]
  }
]
const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
