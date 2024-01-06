---
title: 'Spring Cloud Alibaba'
author: 婲样的女孩
tags:
  - Spring Cloud
  - Spring Cloud Alibaba
categories: 
  - 学习
cover: alibaba.png
date: 2022-01-14 14:33:25
---

#  微服务环境搭建

**商品微服务**

* 查询商品列表

**订单微服务**

* 创建订单



## 模块设计

| 模块                | 介绍          | 简述         |
| ------------------- | ------------- | ------------ |
| shop-parent         | 父工程        |              |
| shop-product-api    | 商品微服务API | 存放商品实体 |
| shop-product-server | 商品微服务    | 端口:808X    |
| shop-order-api      | 订单微服务API | 存放订单实体 |
| shop-order-server   | 订单微服务    | 端口:809X    |

## 使用版本

| 名称                 | 版本          |
| -------------------- | ------------- |
| Spring Cloud         | Hoxton.SR8    |
| Spring Cloud Alibaba | 2.2.3.RELEASE |
| Spring Boot          | 2.3.2.RELEASE |

# Nacos

​	Nacos提供了一组简单易用的特性集,用户快速实现动态范围发现,服务配置,服务元数据及流量管理,相比Eureka本人觉得Nacos的界面更加的简洁清楚,关键还有中文:)



## 使用Nacos

1. 添加`nacos`依赖

   ```xml
           <dependency>
               <groupId>com.alibaba.cloud</groupId>
               <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
           </dependency>
   ```

2. 主类中添加注解 `@EnableDisoveryClient`

   ```java
   @SpringBootApplication
   @EnableDiscoveryClient
   public class ProductApplication {
       public static void main(String[] args) {
           SpringApplication.run(ProductApplication.class, args);
       }
   }
   ```

3. 在配置文件添加`nacos`服务地址

   ```yml
   server:
     port: 8081
   spring:
     application:
       name: product-service
     cloud:
       nacos:
         server-addr: localhost:8848
   ```

4. 启动 nacos 命令(只启动一个): `startup.cmd -m standalone`

![nacos页面](image-20220114142859268.png)

## 配置中心

1. 创建`bootstrap.yml`在其中配置基础信息,包含`启动端口` , `微服务名称` , `nacos地址` , `配置文件类型` , `配置版本`

   ```yml
   #启动端口
   server:
     port: 8091
   spring:
     application:
     #微服务名称
       name: order-service
     cloud:
       nacos:
       #nacos地址
         server-addr: 127.0.0.1:8848
         config:
         #要从nacos读取的配置文件类型
           file-extension: yaml
     profiles:
     #配置文件版本
       active: dev #dev
   ```

2. 在nacos添加配置

   ![配置关系](nacosConfig.png)



# Gateway网关

1. 导入依赖

   ```xml
           <dependency>
               <groupId>com.alibaba.cloud</groupId>
               <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
           </dependency>
           <dependency>
               <groupId>org.springframework.cloud</groupId>
               <artifactId>spring-cloud-starter-gateway</artifactId>
           </dependency>
   ```

2. 创建主类

   ```java
   @SpringBootApplication
   @EnableDiscoveryClient
   public class ApiGatewayApplication {
       public static void main(String[] args) {
           SpringApplication.run(ApiGatewayApplication.class,args);
       }
   }
   ```

3. 配置gateway

   ```yml
   server:
     port: 9000
   spring:
     application:
       name: api-gateway
     cloud:
       nacos:
         server-addr: localhost:8848
       gateway:
         discovery:
           locator:
             enabled: true #使gateway可以获取nacos中的服务清单
         routes:
           - id: product_route #路由标识符
             uri: lb://product-service #客户端顶球最终被转发到的微服务
             predicates: #断言的作用是进行条件判断,只有断言都返回真,才会真正的执行路由
               - Path=/pro/**
             filters:  #过滤器
               - StripPrefix=1 #去掉n级前缀
   ```



## 过滤器



### 局部过滤器

```java
/*
 *命名格式必须为 XXXGatewayFilterFactory
 */
@Component
public class TimeGatewayFilterFactory extends AbstractGatewayFilterFactory<TimeGatewayFilterFactory.config> {

    public TimeGatewayFilterFactory() {
        super(TimeGatewayFilterFactory.config.class);
    }


    /**
     * 导入配置
     * @return  配置类参数列表
     */
    @Override
    public List<String> shortcutFieldOrder() {
        return Collections.singletonList("show");
    }

    @Override
    public GatewayFilter apply(config config) {
        return new GatewayFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

                if (!config.show) {
                    return chain.filter(exchange);
                }

                exchange.getAttributes().put("beginTime", System.currentTimeMillis());
                return chain.filter(exchange).
                        then(Mono.fromRunnable(() -> {
                            //此处是执行业务完成,返回到当前Filter的时间点
                            Long endTime = System.currentTimeMillis();
                            Long beginTime = exchange.getAttribute("beginTime");
                            System.out.println("处理耗时: " + (endTime - beginTime)+"ms");
                        }));
            }
        };
    }

    @Data
    static class config {
        private boolean show;
    }
}

```



### 全局过滤器

```java
@Component
public class AuthorGlobalFilter implements GlobalFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getQueryParams().getFirst("token");
        if (token == null){
            //无权限
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }
}
```



# Mybatis-plus

1. 导入依赖

   ```xml
           <dependency>
               <groupId>com.baomidou</groupId>
               <artifactId>mybatis-plus-boot-starter</artifactId>
               <version>3.3.2</version>
           </dependency>
   ```

2. 配置 `sql` 基础信息

   ```yml
   spring:
     datasource:
       driver-class-name: com.mysql.jdbc.Driver
       url: jdbc:mysql://localhost:3306/testmp09?useUnicode=true&character=utf8
       username: root
       password: root
   #输出sql语句    
   mybatis-plus:
     configuration:
       log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
   ```

   

3. 新建 `接口` 集成 `BaseMapper` 这个类实现了绝大多数的 `sql` 需求

   ```java
   package cn.konfan.testmp.mapper;
   
   import cn.konfan.testmp.entity.User;
   import com.baomidou.mybatisplus.core.mapper.BaseMapper;
   
   /**
    * @author MrLv
    * @date 2022/1/18
    * @apiNote
    */
   public interface UserMapper extends BaseMapper<User>{
   }
   
   ```

   * `BaseMapper` 实现了 增删改查等绝大多数的需求

     ```java
     //
     // Source code recreated from a .class file by IntelliJ IDEA
     // (powered by FernFlower decompiler)
     //
     
     package com.baomidou.mybatisplus.core.mapper;
     
     import com.baomidou.mybatisplus.core.conditions.Wrapper;
     import com.baomidou.mybatisplus.core.metadata.IPage;
     import java.io.Serializable;
     import java.util.Collection;
     import java.util.List;
     import java.util.Map;
     import org.apache.ibatis.annotations.Param;
     
     public interface BaseMapper<T> extends Mapper<T> {
         int insert(T entity);
     
         int deleteById(Serializable id);
     
         int deleteByMap(@Param("cm") Map<String, Object> columnMap);
     
         int delete(@Param("ew") Wrapper<T> wrapper);
     
         int deleteBatchIds(@Param("coll") Collection<? extends Serializable> idList);
     
         int updateById(@Param("et") T entity);
     
         int update(@Param("et") T entity, @Param("ew") Wrapper<T> updateWrapper);
     
         T selectById(Serializable id);
     
         List<T> selectBatchIds(@Param("coll") Collection<? extends Serializable> idList);
     
         List<T> selectByMap(@Param("cm") Map<String, Object> columnMap);
     
         T selectOne(@Param("ew") Wrapper<T> queryWrapper);
     
         Integer selectCount(@Param("ew") Wrapper<T> queryWrapper);
     
         List<T> selectList(@Param("ew") Wrapper<T> queryWrapper);
     
         List<Map<String, Object>> selectMaps(@Param("ew") Wrapper<T> queryWrapper);
     
         List<Object> selectObjs(@Param("ew") Wrapper<T> queryWrapper);
     
         <E extends IPage<T>> E selectPage(E page, @Param("ew") Wrapper<T> queryWrapper);
     
         <E extends IPage<Map<String, Object>>> E selectMapsPage(E page, @Param("ew") Wrapper<T> queryWrapper);
     }
     
     ```

4. 测试

   ```java
   package cn.konfan.testmp.mapper;
   
   import cn.konfan.testmp.entity.User;
   import org.junit.jupiter.api.Test;
   import org.junit.runner.RunWith;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.boot.test.context.SpringBootTest;
   import org.springframework.test.context.junit4.SpringRunner;
   
   /**
    * @author MrLv
    * @date 2022/1/19
    * @apiNote
    */
   @SpringBootTest
   @RunWith(SpringRunner.class)
   class UserMapperTest {
   
       @Autowired
       private UserMapper userMapper;
   
   
       @Test
       void testSave() {
           User user = new User(null, "小明", "12345678@163.com", 20);
           int insert = userMapper.insert(user);
           System.out.println(insert);
           System.out.println(user.getId());
       }
   
   }
   ```

## ActiveRecord（AR）

ActiveRecord 是什么:

* 每一个数据库表对应创建一个类，类的每一个对象实例对应于数据库中
  表的一行记录; 通常表的每个字段在类中都有相应的 Field;
* ActiveRecord 负责把自己持久化. 在 ActiveRecord 中封装了对数据库的访
  问，通过对象自己实现 CRUD，实现优雅的数据库操作。
*  ActiveRecord 也封装了部分业务逻辑。可以作为业务对象使用。

```java
package cn.konfan.testmp.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author MrLv
 * @date 2022/1/19
 * @apiNote
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Dept extends Model<Dept> {
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    private String name;
    private String mobile;
    private Integer manager;
}

```

> Dept extends Model<Dept>  会依赖同名Mapper

```java
package cn.konfan.testmp.mapper;

import cn.konfan.testmp.entity.Dept;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

/**
 * @author MrLv
 * @date 2022/1/19
 * @apiNote
 */
public interface DeptMapper extends BaseMapper<Dept> {
}

```

* 测试

  ```java
  package cn.konfan.testmp.entity;
  
  import org.junit.jupiter.api.Test;
  import org.junit.runner.RunWith;
  import org.springframework.boot.test.context.SpringBootTest;
  import org.springframework.test.context.junit4.SpringRunner;
  
  
  /**
   * @author MrLv
   * @date 2022/1/19
   * @apiNote
   */
  @SpringBootTest
  @RunWith(SpringRunner.class)
  class DeptTest {
  
      @Test
      void deptTest() {
          Dept dept = new Dept(null, "开发部", "1100011", 1);
          boolean insert = dept.insert();
          System.out.println(insert);
          System.out.println(dept.getId());
  
      }
  
  }
  ```



## QueryWrapper

```java

    @Test
    void allEq() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        Map<String, Object> map = new HashMap<>();
        map.put("name", "张三");
        map.put("age", null);
        /*
            qw.allEq(map,true);
            SELECT id,name,age,email,status FROM student WHERE (name = ? AND age IS NULL)

            qw.allEq(map,false);
            SELECT id,name,age,email,status FROM student WHERE (name = ?)
         */
        qw.allEq(map, false);
        List<Student> students = studentMapper.selectList(qw);
        System.out.println(students);

    }

    @Test
    void eq() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student WHERE (name = ?)
        qw.eq("name", "李四");
        List<Student> students = studentMapper.selectList(qw);
        System.out.println(students);
    }

    @Test
    void nq() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student WHERE (name <> ?)
        qw.ne("name", "李四");
        List<Student> students = studentMapper.selectList(qw);
        System.out.println(students);
    }

    /*
     *  gt  >
     *  ge  >=
     *  lt  <
     *  le  <=
     */
    @Test
    void gt() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student WHERE (age > ?)
        qw.gt("age", 30);
        List<Student> students = studentMapper.selectList(qw);
        System.out.println(students);
    }

    @Test
    void between() {
        QueryWrapper<Student> qw = new QueryWrapper<>();

        //SELECT id,name,age,email,status FROM student WHERE (age BETWEEN ? AND ?)
        //qw.between("age",18,25);

        //SELECT id,name,age,email,status FROM student WHERE (age NOT BETWEEN ? AND ?)
        qw.notBetween("age", 18, 25);

        List<Student> students = studentMapper.selectList(qw);
        System.out.println(students);
    }

    @Test
    void like() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //Preparing: SELECT id,name,age,email,status FROM student WHERE (name LIKE ?)
        //Parameters: %李%(String)
        qw.like("name", "李");
        List<Student> students = studentMapper.selectList(qw);
        System.out.println(students);
    }

    @Test
    void likeLeft() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //Preparing: SELECT id,name,age,email,status FROM student WHERE (name LIKE ?)
        //Parameters: %李(String)
        qw.likeLeft("name", "李");
        List<Student> students = studentMapper.selectList(qw);
        System.out.println(students);
    }

    @Test
    void isNull() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student WHERE (email IS NULL)
        qw.isNull("email");
        List<Student> students = studentMapper.selectList(qw);
        System.out.println(students);
    }

    @Test
    void in() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student WHERE (name IN (?,?,?))
        qw.in("name", "张三", "李四", "周丽");
        List<Student> students = studentMapper.selectList(qw);
        System.out.println(students);
    }

    @Test
    void inSql() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student WHERE (age IN (select age from student where name='张三'))
        qw.inSql("age", "select age from student where name='张三'");
        List<Student> students = studentMapper.selectList(qw);
        System.out.println(students);
    }

    @Test
    void groupBy() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT status,count(*) c,avg(age) avgage FROM student GROUP BY status
        qw.groupBy("status");
        qw.select("status", "count(*) c", "avg(age) avgage");
        List<Map<String, Object>> maps = studentMapper.selectMaps(qw);
        System.out.println(maps);
    }

    @Test
    void orderBy() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student ORDER BY convert(name using gbk) ASC,age ASC
        //qw.orderByAsc("convert(name using gbk)","age");

        /*
         *  参数1:是否排序
         *  参数2:升序降序
         */
        qw.orderBy(true, false, "convert(name using gbk)", "age");
        List<Map<String, Object>> maps = studentMapper.selectMaps(qw);
        System.out.println(maps);
    }

    @Test
    void orderBy1() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student ORDER BY convert(name using gbk) ASC,age DESC
        qw.orderByAsc("convert(name using gbk)");
        qw.orderByDesc("age");
        List<Map<String, Object>> maps = studentMapper.selectMaps(qw);
        System.out.println(maps);
    }

    @Test
    void or() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student WHERE (name = ? OR age = ?)
        qw.eq("name","张三").or().eq("age",22);
        List<Map<String, Object>> maps = studentMapper.selectMaps(qw);
        System.out.println(maps);
    }

    @Test
    void last() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student WHERE (name = ? OR age = ?) limit 1
        qw.eq("name","张三").or().eq("age",22).last("limit 1");
        List<Map<String, Object>> maps = studentMapper.selectMaps(qw);
        System.out.println(maps);
    }

    @Test
    void exists() {
        QueryWrapper<Student> qw = new QueryWrapper<>();
        //SELECT id,name,age,email,status FROM student WHERE (EXISTS (select id from student where age > 20) AND age < ?)
        qw.exists("select id from student where age > 20");
        qw.lt("age",24);
        List<Map<String, Object>> maps = studentMapper.selectMaps(qw);
        System.out.println(maps);
    }

```



### 分页

```java
    /*
     * 分页插件
     */
    @Bean
    public PaginationInterceptor paginationInterceptor() {
        return new PaginationInterceptor();
    }

```

* 查询测试

  ```java
      @Test
      void page() {
          QueryWrapper<Student> qw = new QueryWrapper<>();
          qw.orderByAsc("age");
          IPage<Student> page = new Page<>();
          page.setCurrent(1);
          page.setSize(3);
          //Preparing: SELECT id,name,age,email,status FROM student ORDER BY age ASC LIMIT ?,? 
          //Parameters: 0(Long), 3(Long)
          IPage<Student> pageResult = studentMapper.selectPage(page, qw);
          System.out.println(pageResult.getRecords());
      }
  ```

  