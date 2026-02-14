// @ts-nocheck
import request from '../utils/request'

// 获取专业列表
export function getMajorList() {
  return request({
    url: '/api/major/list',
    method: 'get'
  })
}

// 查询专业详情
export function getMajorById(id) {
  return request({
    url: `/api/major/${id}`,
    method: 'get'
  })
}

// 添加专业
export function addMajor(data) {
  return request({
    url: '/api/addMajor',
    method: 'post',
    data
  })
}

// 更新专业
export function updateMajor(majorId, data) {
  return request({
    url: `/api/major/${majorId}`,
    method: 'put',
    data
  })
}

// 删除专业
export function deleteMajor(majorId) {
  return request({
    url: `/api/major/${majorId}`,
    method: 'delete'
  })
}
