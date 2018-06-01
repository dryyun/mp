# mp
微信公众号开发小尝试  
开发初衷其实是在微信里找不到好一点的任务提醒的公众号或者小程序，还不如自己写一个  
因为要实现这功能，需要微信公众号的【模板消息】功能，不得已使用了【服务号】，也是花了钱的。  

# 使用  

## 代码很烂，😞

## 安装  
> yarn  

## 使用前提

- 微信公众号开启【接收语音识别结果】 
- 开启【获取用户地理位置】 
- 注册高德开发者，根据微信的发来的经纬度获得准确的地址
- 注册 tuling123 机器人

## 配置 config   

- default.json 、development.json 、 production.json 主要配置程序中使用到的变量，使用参数 [node-config](https://github.com/lorenwest/node-config) 项目，需要设置  
- menu.json 配置公众号的功能菜单，运行 `node menu.js` 即可 ，前提是 `npm run cron` 已经运行，并且得到了 `access_token`    
- metakey.json 是对于表 meta 中可能出现的 meta 字段的含义的说明，表中 openid == 'root' 代表全局配置，不然代表个人配置    
- status.json 是每个表的 status 代表的含义说明     

## 目录说明

- config // 配置文件目录  
- models // 对应数据库表，封装了相应方法  
- msgHandlers // 处理事件消息  
- views //  
- index.js // 入口文件  
- mp.sql // 数据库结构  

## 命令解释  

> npm run dev  // 本地开发环境，使用 nodemon 监控 js 文件变化，自动重启  
> npm run start // 线上环境使用  
> npm run cron // 线上环境，用于执行 cronJob 脚本  
> node menu.js // 根据 menu.json 生成公众号菜单，默认行为时先删除原有菜单，再重新生成


