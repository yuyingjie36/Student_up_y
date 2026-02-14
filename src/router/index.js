import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/Register.vue'),
  },
  {
    path: '/manage',
    name: 'Manage',
    component: () => import('../pages/Students.vue'),
    children: [
      { path: '', redirect: 'students' },
      { path: 'students', name: 'StudentManage', component: () => import('../pages/StudentManage.vue') },
      { path: 'courses', name: 'CourseManage', component: () => import('../pages/Courses.vue') },
      { path: 'teachers', name: 'TeacherManage', component: () => import('../pages/Teachers.vue') },
      { path: 'academy', name: 'AcademyManage', component: () => import('../pages/Academy.vue') },
      { path: 'score', name: 'ScoreManage', component: () => import('../pages/Score.vue') },
      { path: 'classes', name: 'ClassManage', component: () => import('../pages/Classes.vue') },
      { path: 'users', name: 'UsersManage', component: () => import('../pages/User.vue') },
      { path: 'major', name: 'MajorManage', component: () => import('../pages/Major.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
