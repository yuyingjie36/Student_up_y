# 后端CORS跨域配置修复说明

## 问题诊断

根据错误信息，CORS跨域问题主要有以下原因：

1. **后端CORS配置的端口不匹配**
   - 后端配置允许：`http://localhost:8081`
   - 前端实际运行在：`http://localhost:5173`

2. **后端CORS配置类使用了错误的Filter**
   - 当前使用：`org.apache.catalina.filters.CorsFilter`（Tomcat的Filter）
   - 应该使用：Spring的`CorsFilter`或使用`WebMvcConfigurer`

## 解决方案

### 方案1：修复后端CorsConfig.java（推荐）

将 `d:/项目目录/School_Manage_A/src/main/java/com/example/school_manage_a/config/CorsConfig.java` 修改为：

```java
package com.example.school_manage_a.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        // 1. 创建跨域配置对象
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        
        // 允许的前端域名（修改为实际前端地址）
        corsConfiguration.addAllowedOrigin("http://localhost:5173"); // Vite默认端口
        corsConfiguration.addAllowedOrigin("http://localhost:5174"); // 备用端口
        corsConfiguration.addAllowedOrigin("http://127.0.0.1:5173");
        
        // 允许发送Cookie
        corsConfiguration.setAllowCredentials(true);
        
        // 允许所有请求方法 GET/POST/PUT/DELETE/OPTIONS等
        corsConfiguration.addAllowedMethod("*");
        
        // 允许所有请求头
        corsConfiguration.addAllowedHeader("*");
        
        // 允许暴露的响应头（让前端可以获取token）
        corsConfiguration.addExposedHeader("token");
        corsConfiguration.addExposedHeader("Token");
        
        // 预检请求有效期，单位秒
        corsConfiguration.setMaxAge(3600L);

        // 2. 配置生效的路径
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 对项目中所有接口生效
        source.registerCorsConfiguration("/**", corsConfiguration);

        // 3. 返回Spring的CorsFilter
        return new CorsFilter(source);
    }
}
```

**关键修改点：**
1. 导入 `org.springframework.web.filter.CorsFilter`（不是Tomcat的）
2. 将 `addAllowedOrigin` 改为 `http://localhost:5173`
3. 添加 `addExposedHeader("token")` 以允许前端获取响应头中的token
4. 在CorsFilter构造函数中传入source参数

### 方案2：使用WebMvcConfigurer（备选）

如果方案1不行，可以改用WebMvcConfigurer：

```java
package com.example.school_manage_a.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("token", "Token")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 方案3：修复JWT拦截器

确保JWT拦截器排除登录和注册接口：

修改 `JwtInterceptorConfig.java`：

```java
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(this)
            .addPathPatterns("/**") // 拦截所有请求
            .excludePathPatterns(
                "/api/user/login",  // 排除登录
                "/api/user/add"     // 排除注册
            );
}
```

## 前端配置（已修复）

前端 `src/utils/request.js` 已更新：
- 添加了CORS错误特殊处理
- 添加了token响应头的兼容处理
- 设置了 `withCredentials: false`

## 测试步骤

1. 修改后端CorsConfig.java文件
2. 重启后端Spring Boot服务
3. 刷新前端页面
4. 尝试登录，查看控制台是否还有CORS错误

## 如果仍有问题

1. 检查后端服务是否正常运行在8080端口
2. 检查前端服务是否运行在5173端口
3. 检查浏览器控制台的Network标签，查看OPTIONS预检请求是否成功
4. 可以临时使用Vite代理（见vite.config.js配置说明）
