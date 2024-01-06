---
title: 使用SmartDNS裸连Github
cover: github.png
author: 婲样的女孩
tags:
  - github
  - SmartDNS
  - 裸连
categories: []
date: 2022-1-11 22:14:55
---

将下发内容添加到`SmartDNS`域名地址框中`保存&应用`

```yaml
serve 208.67.222.222:5353 -group openudp -exclude-default-group
nameserver /github.com/openudp
```



原理是通过`opendns`的`5353`端口来防止dns污染,因为绝大多数dns污染大多数都是监控的`53`端口

