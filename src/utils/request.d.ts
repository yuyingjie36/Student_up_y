declare module '@/utils/request' {
  const request: (config: any) => Promise<any>
  export default request
}

declare module './utils/request' {
  const request: (config: any) => Promise<any>
  export default request
}
