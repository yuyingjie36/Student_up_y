<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <div class="title">学生信息管理系统</div>
      <div class="subtitle">欢迎登录</div>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名" 
            size="default"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            size="default"
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            style="width:100%" 
            size="large"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-section">
        <span>没有账号？请联系管理员</span>
        <!-- <el-button 
          type="text" 
          @click="handleRegister"
          class="register-btn"
        >
          立即注册
        </el-button> -->
      </div>

      <el-alert 
        v-if="error" 
        :title="error" 
        type="error" 
        show-icon 
        class="error-alert"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api/user'
import { User, Lock } from '@element-plus/icons-vue'
const router = useRouter()
const formRef = ref<any>(null)
const form = reactive({ username: '', password: '' })
const error = ref('')
const loading = ref(false)

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '用户名长度在3-15个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
}

async function handleLogin() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    
    loading.value = true
    error.value = ''
    
    try {
      const response = await login({
        adminId: form.username,
        password: form.password
      })
      
      // 后端返回 Result.success(token)，所以 response.data 是 token 字符串
      // token 也会在响应头中，request.js 的响应拦截器会自动保存
      if (response && response.code === 200) {
        // 确保 token 已保存（响应拦截器已处理，但这里做双重检查）
        if (response.data && typeof response.data === 'string') {
          localStorage.setItem('token', response.data)
        }
        ElMessage.success(response.msg || '登录成功')
        router.push({ name: 'Manage' })
      } else {
        error.value = response?.msg || '登录失败，请检查用户名和密码'
      }
    } catch (err: any) {
      console.error('登录失败:', err)
      error.value = err.message || '登录失败，请检查用户名和密码'
    } finally {
      loading.value = false
    }
  })
}

function handleRegister() {
  router.push({ name: 'Register' })
}
</script>

<style scoped>
.login-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-wrap::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-card {
  width: 420px;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.subtitle {
  font-size: 14px;
  text-align: center;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.8);
}

.el-form {
  margin-bottom: 20px;
}

.register-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.register-btn {
  color: #fff;
  font-weight: 500;
  margin-left: 5px;
  transition: all 0.3s ease;
}

.register-btn:hover {
  color: #409eff;
  transform: scale(1.05);
}

.error-alert {
  margin-top: 15px;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    width: 90%;
    margin: 0 20px;
    padding: 24px;
  }
  
  .title {
    font-size: 20px;
  }
}
</style>