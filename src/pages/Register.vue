<template>
  <div class="register-wrap">
    <el-card class="register-card">
      <div class="title">学生信息管理系统</div>
      <div class="subtitle">用户无法注册, 请使用管理员账号进行登录</div>

      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-position="top"
        size="large"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名" 
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="form.email" 
            placeholder="请输入邮箱地址" 
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码" 
            prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleRegister" 
            style="width:100%" 
            :loading="loading"
            :disabled=true
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-section">
        <span>已有账号？</span>
        <el-button 
          type="text" 
          @click="handleLogin"
          class="login-btn"
        >
          立即登录
        </el-button>
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

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addUser } from '../api/user'

const router = useRouter()
const formRef = ref(null)
const form = reactive({ 
  username: '', 
  email: '', 
  password: '', 
  confirmPassword: '' 
})
const error = ref('')
const loading = ref(false)

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '用户名长度在3-15个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/, 
      message: '密码至少包含一个小写字母、一个大写字母和一个数字', 
      trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
}

async function handleRegister() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    error.value = ''
    
    try {
      const response = await addUser({
        adminId: form.username,
        password: form.password,
        phone: form.email // 后端User实体中只有phone字段，没有email，用email字段的值填充phone
      })
      
      if (response.code === 200) {
        ElMessage.success(response.msg || '注册成功，请登录')
        router.push({ name: 'Login' })
      } else {
        error.value = response.msg || '注册失败，请稍后重试'
      }
    } catch (err) {
      error.value = err.message || '注册失败，请稍后重试'
    } finally {
      loading.value = false
    }
  })
}

function handleLogin() {
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.register-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.register-wrap::before {
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

.register-card {
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

.register-card:hover {
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

.login-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.login-btn {
  color: #fff;
  font-weight: 500;
  margin-left: 5px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  color: #409eff;
  transform: scale(1.05);
}

.error-alert {
  margin-top: 15px;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-card {
    width: 90%;
    margin: 0 20px;
    padding: 24px;
  }
  
  .title {
    font-size: 20px;
  }
}
</style>