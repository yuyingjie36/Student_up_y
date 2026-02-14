<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px" class="aside">
      <div class="logo">学生管理系统</div>
      <el-menu 
        :default-active="active" 
        class="el-menu-vertical-demo" 
        @select="handleSelect"
        background-color="#2d3748"
        text-color="#e2e8f0"
        active-text-color="#4299e1"
        unique-opened
      >
        <el-menu-item index="students">
        
    <img src="../../src/icon/xsgl.png" style="width: 25px; height: 25px; margin-right: 10px;" />
        
          <template #title>学生管理</template>
        </el-menu-item>
        
        <!-- 学院管理子菜单：包含班级和专业 -->
        <el-sub-menu index="academy">
  <template #title>
    <img src="../../src/icon/xygl.png" style="width: 25px; height: 25px; margin-right: 10px;" />
    学院管理
  </template>
  <el-menu-item index="classes">
    <img src="../../src/icon/bjgl.png" style="width: 25px; height: 25px; margin-right: 10px;" />
    班级管理
  </el-menu-item>
  <el-menu-item index="major">
    <img src="../../src/icon/zygl.png" style="width: 23px; height: 23px; margin-right: 10px;" />
    专业管理
  </el-menu-item>
</el-sub-menu>

        <el-menu-item index="courses">
          <img src="../../src/icon/kcgl.png" style="width: 27px; height: 25px; margin-right: 10px;" />
          <template #title>课程管理</template>
        </el-menu-item>
        
        <el-menu-item index="teachers">
          <img src="../../src/icon/jsgl.png" style="width: 25px; height: 25px; margin-right: 12px;" />
          <template #title>教师管理</template>
        </el-menu-item>
        
        <el-menu-item index="score">
          <img src="../../src/icon/cjgl.png" style="width: 25px; height: 25px; margin-right: 12px;" />
          <template #title>成绩管理</template>
        </el-menu-item>
        
        <el-menu-item index="users">
          <img src="../../src/icon/yhgl.png" style="width: 25px; height: 25px; margin-right: 12px;" />
          <template #title>用户管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-right">
          <el-button type="danger" @click="logout" plain>退出登录</el-button>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
const router = useRouter()
const route = useRoute()
let active = ref('students')

// 路由名称与菜单索引的映射
const routeToMenuMap = {
  StudentManage: 'students',
  CourseManage: 'courses',
  TeacherManage: 'teachers',
  MajorManage: 'major',
  ClassManage: 'classes',
  ScoreManage: 'score',
  AcademyManage: 'academy',
  UsersManage: 'users'
}

// 初始化激活的菜单
const initActiveMenu = () => {
  const currentMenu = routeToMenuMap[route.name] || 'students'
  active.value = currentMenu
  // 子菜单激活时，同时激活父菜单
  if (['major', 'classes'].includes(currentMenu)) {
    active.value = 'academy'
  }
}

// 初始化执行
initActiveMenu()

// 监听路由变化，更新激活菜单
watch(
  () => route.name,
  () => {
    initActiveMenu()
  }
)

function handleSelect(key) {
  active.value = key
  const menuToRouteMap = {
    students: 'StudentManage',
    courses: 'CourseManage',
    teachers: 'TeacherManage',
    academy: 'AcademyManage',
    score: 'ScoreManage',
    classes: 'ClassManage',
    major: 'MajorManage',
    users: 'UsersManage'
  }
  router.push({ name: menuToRouteMap[key] })
}

async function logout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
    // 清除token
    localStorage.removeItem('token')
    ElMessage.success('已退出登录')
    router.push({ name: 'Login' })
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped>
/* 侧边栏样式 - 无多余空白，对齐工整 */
.aside {
  background-color: #2d3748;
  color: #fff;
  padding: 0;
  margin: 0;
}

/* Logo样式 - 居中对齐，高度统一 */
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  border-bottom: 1px solid #4a5568;
  margin: 0;
  padding: 0;
}

/* 垂直菜单样式 - 去除边框，高度适配 */
.el-menu-vertical-demo {
  border-right: none;
  height: calc(100vh - 56px);
  padding: 0;
  margin: 0;
}

/* 菜单项样式 - 统一高度，对齐工整 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  margin: 0;
  transition: all 0.2s ease;
}

/* 菜单项hover效果 - 视觉增强 */
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #4a5568 !important;
  color: #4299e1 !important;
}

/* 菜单项选中效果 - 强视觉提示 */
:deep(.el-menu-item.is-active) {
  background-color: #4299e1 !important;
  color: #fff !important;
  border-left: 3px solid #90cdf4;
}

/* 子菜单样式 - 缩进统一，无多余空白 */
:deep(.el-sub-menu .el-menu-item) {
  padding-left: 40px !important;
  height: 45px;
  line-height: 45px;
}

/* 头部样式 - 对齐工整，无多余空白 */
.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #fff;
  height: 56px;
  padding: 0 20px;
  margin: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-right {
  margin: 0;
  padding: 0;
}

/* 主内容区域 - 无多余空白，对齐工整 */
.main-content {
  padding: 16px;
  background-color: #f8f9fa;
  height: calc(100vh - 56px);
  margin: 0;
  overflow-y: auto;
}

/* 滚动条优化 - 提升视觉体验 */
.main-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.main-content::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-track {
  background-color: #f8f9fa;
}
</style>