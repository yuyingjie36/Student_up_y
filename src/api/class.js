// @ts-nocheck
import request from '../utils/request'

// 查询班级列表
export function getClassList() {
  return request({
    url: '/api/class/list',
    method: 'get'
  })
}

// 根据ID查询班级
export function getClassById(id) {
  return request({
    url: `/api/class/list/${id}`,
    method: 'get'
  })
}

// 添加班级
export function addClass(data) {
  return request({
    url: '/api/class/addList',
    method: 'post',
    data
  })
}

// 更新班级（classId是Long类型）
export function updateClass(classId, data) {
  return request({
    url: `/api/class/list/${classId}`,
    method: 'put',
    data
  })
}

// 删除班级（id是Long类型的自增主键，不是classId）
export function deleteClassById(id) {
  return request({
    url: `/api/class/list/${id}`,
    method: 'delete'
  })
}

// 为了兼容，保留原方法名
export const deleteClass = deleteClassById
