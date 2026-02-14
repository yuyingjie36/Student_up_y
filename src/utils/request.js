// @ts-nocheck
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8080', // 后端服务地址，根据实际情况修改
  timeout: 10000, // 请求超时时间
  withCredentials: false, // 不发送credentials，避免CORS预检问题
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 从响应头获取token（登录接口）
    const token = response.headers['token'] || response.headers['Token']
    if (token) {
      localStorage.setItem('token', token)
    }

    const res = response.data
    
    // 如果返回的是Result对象（有code字段）
    if (res && typeof res === 'object' && res.code !== undefined) {
      if (res.code === 200) {
        return res
      } else {
        ElMessage.error(res.msg || '请求失败')
        return Promise.reject(new Error(res.msg || '请求失败'))
      }
    }
    
    // 如果没有code字段，直接返回数据（某些接口可能直接返回List或对象）
    // 例如：/getAllAcademy 直接返回 List<Academy>
    //      /api/major/list 直接返回 List<Major>
    //      /api/major/{id} 直接返回 Major对象
    return res
  },
  error => {
    console.error('响应错误:', error)
    
    // CORS错误特殊处理
    if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
      ElMessage.error('跨域请求失败，请检查后端CORS配置。前端地址：' + window.location.origin)
      return Promise.reject(error)
    }
    
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        ElMessage.error('未授权，请重新登录')
        localStorage.removeItem('token')
        router.push('/login')
      } else if (status === 403) {
        ElMessage.error('拒绝访问')
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (status >= 500) {
        ElMessage.error('服务器错误')
      } else {
        ElMessage.error(data?.msg || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接或后端服务是否启动')
    } else {
      ElMessage.error(error.message || '请求失败')
    }
    
    return Promise.reject(error)
  }
)

// 封装一层 request 函数，避免在 TS 中把它推断成 AxiosResponse，
// 这样在各个页面里拿到的 response 就是 any，访问 response.code / response.data 不会再有类型报错。
const request = (config) => {
  // 使用类型断言，让 TypeScript 认为返回值是 any
  return /** @type {Promise<any>} */ (service(config))
}

export default request
