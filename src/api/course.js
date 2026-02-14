// @ts-nocheck
import request from '../utils/request'

// 分页查询课程列表
export function getCourseList(params) {
  return request({
    url: '/api/course/list',
    method: 'get',
    params
  })
}

// 添加课程
export function addCourse(data) {
  return request({
    url: '/api/course',
    method: 'post',
    data
  })
}

// 查询课程详情
export function getCourse(id) {
  return request({
    url: `/api/course/${id}`,
    method: 'get'
  })
}

// 更新课程
export function updateCourse(id, data) {
  return request({
    url: `/api/course/${id}`,
    method: 'put',
    data
  })
}

// 删除课程
export function deleteCourse(ids) {
  return request({
    url: `/api/course/${ids.join(',')}`,
    method: 'delete'
  })
}
