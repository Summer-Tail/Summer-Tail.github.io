---
title: 'Windows10离线安装net,iis等'
author: 婲样的女孩
tags:
  - windows
  - iis
  - net
  - net3.5
cover: cover.png
date: 2021-09-22 11:47:00
---

### 说明

> ​	本教程理论可安装控制面板 程序和功能中所有windows功能



### 准备工具

- cmd
- [windows10.iso(原版镜像)](https://www.microsoft.com/zh-cn/software-download/windows10)

### 挂载windows镜像

​		如图所示,右键windows.iso 使用资源管理打开后将会自动挂载为系统盘符

![挂载镜像](windows1.png)

在此电脑盘符页面中能看到这个就说明挂载成功了

![挂载完成](windows2.png)

### 开始安装

#### NET3.5

```bash
dism.exe /online /enable-feature /featurename:netfx3 /all /Source:挂载盘符:\sources\sxs
```

#### IIS

```bash
dism.exe /online /enable-feature /featurename:IIS-ManagementConsole /all /Source:挂载盘符:\sources\sxs
```



#### 一键脚本

​	这个是net3.5的其他的同理

```bash
@echo off
set/p winpath=请输入挂载镜像盘符:
dism.exe /online /enable-feature /featurename:netfx3 /all /Source:%winpath%:\sources\sxs
@pause
```