---
title: tomcat乱码究极解决方案
cover: idea_Encodings.png
author: 婲样的女孩
tags:
  - tomcat
  - 乱码
  - idea
  - js
categories: []
date: 2021-11-17 08:07:00
---



- 本教程方法理论可解决tomcat所有的乱码问题,包括idea控制台,tomcat日志,webjs等一系列乱码问题





### IDEA



1. Settings - File Encodings

   ![](idea_Encodings.png)

2. bin - idea.exe.vmoptions

   ```
   -Dfile.encoding=UTF-8
   ```

3. bin - idea64.exe.vmoptions

   ```
   -Dfile.encoding=UTF-8
   ```

   

### tomcat



1. bin - catalina.bat

   ```bash
   set "JAVA_OPTS=%JAVA_OPTS% %JSSE_OPTS%  -Dfile.encoding=UTF-8" 
   ```

2. conf - logging.properties

   ```
   java.util.logging.ConsoleHandler.encoding = UTF-8
   ```

3. conf - server.xml

   ```xml
     <Connector port="8080" protocol="HTTP/1.1"
                  connectionTimeout="20000"
                  redirectPort="8443" URIEncoding="UTF-8" />
   ```

   

经过以上设置如果还是乱码的话,听天由命吧....

