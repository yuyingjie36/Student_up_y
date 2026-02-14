// @ts-nocheck
import request from '../utils/request'

// 分页查询学生列表
export function getStudentList(params) {
  return request({
    url: '/findPageStudent',
    method: 'get',
    params
  })
}

// 添加学生
export function insertStudent(data) {
  return request({
    url: '/insertStudent',
    method: 'post',
    data
  })
}

// 根据学生ID查询
export function getStudentById(studentId) {
  return request({
    url: `/findByStudentId/${studentId}`,
    method: 'get'
  })
}

// 更新学生
export function updateStudent(studentId, data) {
  return request({
    url: `/updateStudent/${studentId}`,
    method: 'put',
    data
  })
}

// 批量删除学生（单个删除也使用此接口）
export function deleteBatchByIds(studentIds) {
  // 确保studentIds是数组
  const ids = Array.isArray(studentIds) ? studentIds : [studentIds]
  return request({
    url: `/deleteBatchByIds/${ids.join(',')}`,
    method: 'delete'
  })
}
