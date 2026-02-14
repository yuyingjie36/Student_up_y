// @ts-nocheck
import request from '../utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

// 新增用户（注册）
export function addUser(data) {
  return request({
    url: '/api/user/add',
    method: 'post',
    data
  })
}

// 获取用户列表
export function getUserList() {
  return request({
    url: '/api/user/list',
    method: 'get'
  })
}

// 更新用户
export function updateUser(adminId, data) {
  return request({
    url: `/api/user/${adminId}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(adminId) {
  return request({
    url: `/api/user/${adminId}`,
    method: 'delete'
  })
}
