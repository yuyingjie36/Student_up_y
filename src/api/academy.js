// @ts-nocheck
import request from '../utils/request'

// 获取所有学院
export function getAllAcademy() {
  return request({
    url: '/getAllAcademy',
    method: 'get'
  })
}

// 添加学院
export function insertAcademy(data) {
  return request({
    url: '/insertAcademy',
    method: 'post',
    data
  })
}

// 根据ID查询学院
export function getAcademyById(academyId) {
  return request({
    url: `/findByAcademyId/${academyId}`,
    method: 'get'
  })
}

// 更新学院
export function updateAcademy(academyId, data) {
  return request({
    url: `/updateAcademy/${academyId}`,
    method: 'put',
    data
  })
}

// 删除学院
export function deleteAcademy(academyId) {
  return request({
    url: `/deleteById/${academyId}`,
    method: 'delete'
  })
}
