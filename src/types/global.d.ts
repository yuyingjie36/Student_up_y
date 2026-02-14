// 全局类型声明，让所有 API 调用返回 any 类型，避免 TypeScript 类型检查错误
declare module '../utils/request' {
  const request: (config: any) => Promise<any>
  export default request
}

declare module '@/utils/request' {
  const request: (config: any) => Promise<any>
  export default request
}
