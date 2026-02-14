// @ts-nocheck
import request from '../utils/request'

// 分页查询教师列表
export function getTeacherList(params) {
  return request({
    url: '/api/teacher/list',
    method: 'get',
    params
  })
}

// 添加教师
export function addTeacher(data) {
  return request({
    url: '/api/teacher',
    method: 'post',
    data
  })
}

// 查询教师详情
export function getTeacher(id) {
  return request({
    url: `/api/teacher/get/${id}`,
    method: 'get'
  })
}

// 更新教师
export function updateTeacher(id, data) {
  return request({
    url: `/api/teacher/put/${id}`,
    method: 'put',
    data
  })
}

// 删除教师
export function deleteTeacher(ids) {
  return request({
    url: `/api/teacher/del/${ids.join(',')}`,
    method: 'delete'
  })
}

// 获取部门列表（假设后端有该接口，如果没有可以改为硬编码）
export function getDeptList() {
  return request({
    url: '/api/dept/list',
    method: 'get'
  })
}
