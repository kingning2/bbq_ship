# 在线烧烤平台

## 项目介绍
这是一款基于`React+TypeScript+Ant Design+Node.js+MySQL`的在线烧烤平台。
订单由`websocket`推送，用户可以实时查看订单状态。
支持优惠券获取，优惠券可以抵扣订单金额。

前端分为商家端和用户端，商家端可以查看订单，用户端可以查看订单和优惠券。

## 项目架构
前端：React+TypeScript+Ant Design
后端：Node.js+TypeOrm+MySQL

## 开始

> 设备安装`Node.js`和`MySQL` 开发时Node版本为`v20.17.0` MySQL版本为`v8.0.36`
>
> 项目使用`pnpm`作为包管理工具，安装`pnpm`请参考[pnpm官网](https://pnpm.io/zh/installation) 

> sql文件`/backend/src/database/init.sql`
> 默认账号为`admin` 密码为`159476`
> sql配置文件`/backend/.env`

### 前端
  - cd frontend 进入文件夹
  - pnpm install 安装依赖
  - pnpm run dev 启动开发环境

### 后端
  - cd backend 进入文件夹
  - pnpm install 安装依赖
  - pnpm start:dev 启动开发环境


