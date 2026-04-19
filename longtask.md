# 基础信息
CLINIC工作区下有两个项目：
前端项目：Clinic-client
后端项目：Clinic-server
数据库建表目录：D:\Wcke\000SourceCode\PythonProjects\medspy\.创建表的语句

# 任务内容
## 1、实现/project/medicine/index.vue
## 2、实现/project/check/index.vue
## 3、实现/project/treat/index.vue
## 4、实现/project/medicine/in.vue
## 5、实现/project/medicine/stock.vue
## 6、实现/project/medicine/out.vue
## 7、实现/project/medicine/warn.vue

# 实现任务步骤
1、先从建表目录中找寻适合的表，如果建表数据和对应实体类不太一致，请直连数据库验证
2、根据表到后端找到对应的接口，接口定义，接口参数，接口返回数据
3、跟前端页面对比较，还需要实现哪些接口
4、如果需要实现新接口，到后端Clinic-server中实现接口
5、前端按照系统通用做法封装接口，确保每个接口在都后端都有定义
6、前端调用接口，完成功能

# 注意事项
0、任务过程中，如果有终端运行任务，全部允许自动运行
1、凡是前后端数据定义不一致时，因为前端定义的都是演示数据，实际数据类型以后端定义为准
2、后端控制器如果存在相同的，/ams/api/v2/*和/ams/api/v1/*，要使用/ams/api/v1/*
3、生成前端api定义时候，设置Base不要包含/ams/api/v1
