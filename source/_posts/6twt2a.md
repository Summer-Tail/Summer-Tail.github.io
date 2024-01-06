---
title: windows10共享打印机0x0000011b
author: 婲样的女孩
tags:
  - windows
  - 打印机共享
  - '0x0000011b'
categories: []
cover: t01f5ef3c82875f3c51.png
date: 2021-10-11 14:38:00
---

#### 问题

​	共享打印机时出现报错,Windows无法连接到打印机(操作失败, 错误为0x0000011b)

![错误如图所示](t01f5ef3c82875f3c51.png)

##### 解决方案1

> ​	1.根据360工作人员排查,确认为21年9月13号微软发布的KB5005565补丁导致的此问题
>
> 博主通过拆卸此补丁后仍然无法正常共享打印机,错误代码也没有发生改变

##### 解决方案2

> 修改注册表,新建*.reg注册表文件将下列文本输入保存后,运行重启电脑即可

```reg
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Print]
"RpcAuthnLevelPrivacyEnabled"=dword:00000000

[HKEY_LOCAL_MACHINE\Software\Policies\Microsoft\Windows NT\Printers\PointAndPrint]
"RestrictDriverInstallationToAdministrators"=dword:00000000
```

