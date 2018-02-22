# lawyer

法律咨询网

## 1. 版本

前端框架：Bootstrap 3.3.7
前端 JS 框架：AngularJS 1.6.4
图标库：font-awesome 4.7.0
后端框架：nodejs express 4.14.1
数据库：mongodb 3.4.3

## 2. 架构

采用 MVC 设计模式

### 2.1 View ：

Bootstrap+JQuery：实现页面布局，二级菜单交互特效
Angular：实现律师数据渲染，web 端分页，wap 端上拉加载，下拉刷新

### 2.2 Controller ：

路由机制，接收 view 层的 ajax 请求，调用对应 dao

### 2.3 Model ：

处理业务逻辑
