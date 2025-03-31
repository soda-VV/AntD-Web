# 项目描述

本项目是一个基于 Ant Design Pro + Flask 开发的Web系统，主要实现如下功能：

- 1）基本的注册登录功能
- 2）三种权限，不同权限访问不同页面
- 3）用户管理界面，管理员可以访问该界面进行用户的增删改查
- 4）分页查询、下载功能
- 5）token动态验证鉴权

因为网上并没有比较全面的Ant Design Pro教程，笔者主要基于[Ant Design Pro 官方文档](https://pro.ant.design/zh-CN/docs/overview) 和 [Ant Design Pro 从零到一教程](https://blog.csdn.net/qq_40432886/article/details/117294378) 学习，结合chatgpt进行快速开发。开发过程中，学习和解决问题的全过程记录在我的个人博客[『web前端开发』基于Ant Design的前端快速开发](https://isoda.top/posts/f69d.html)。



# 项目部分功能页面展示

登录：

![image-20240725170206028](https://isodatop.oss-cn-beijing.aliyuncs.com/img/image-20240725170206028.png)

用户管理界面：包括用户的增删改查功能

![image-20240801171000518](https://isodatop.oss-cn-beijing.aliyuncs.com/img/image-20240801171000518.png)

弹窗修改和新增用户

![image-20240801171031979](https://isodatop.oss-cn-beijing.aliyuncs.com/img/image-20240801171031979.png)





# 前端部署

使用nginx作为web服务器进行部署

首先在服务器上安装Nginx

```SQL
sudo apt update
sudo apt install nginx
```

在ant design pro项目目录下，执行以下命令来构建项目。这会生成一个`dist`文件夹，里面包含了构建后的静态资源文件。（这里就不需要构建了，直接使用 `web flask\antd\myapp` 文件夹就可以了）

```Bash
npm run build
```

将构建好的文件复制到Nginx的`html`目录下，通常是`/usr/share/nginx/html`：

```SQL
sudo cp -r dist/* /usr/share/nginx/html/
```

然后修改Nginx的配置文件，通常位于`/etc/nginx/nginx.conf`，修改配置如下：

```SQL
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    # multi_accept on;
}

http {
    ##
    # Basic Settings
    ##
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ##
    # SSL Settings
    ##
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    ##
    # Logging Settings
    ##
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    ##
    # Gzip Settings
    ##
    gzip on;
    gzip_min_length 1k;
    gzip_comp_level 9;
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
    gzip_vary on;
    gzip_disable "MSIE [1-6]\.";

    ##
    # Virtual Host Configs
    ##
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;

    server {
        listen 8000 default_server;
        listen [::]:8000 default_server;
        # Server name can be your domain or IP address
        server_name 192.168.xx.xx;

        # Root directory for static files
        root /usr/share/nginx/html;

        # Index file for directory access
        index index.html;

        # Handle requests for static files
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Proxy requests to the backend Flask API server
        location /api/ {
            proxy_pass http://192.168.xx.xx:5000;  # Replace with your actual Flask server address and port
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Gzip Settings
        gzip on;
        gzip_min_length 1k;
        gzip_comp_level 9;
        gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
        gzip_vary on;
        gzip_disable "MSIE [1-6]\.";
    }
}
```

主要需要注意的几个点：

```SQL
# 指定了静态文件的根目录
root /usr/share/nginx/html;

# 指定监听哪个端口号
listen 8000 default_server;     listen [::]:8000 default_server;

# 指定前端部署服务器名称
server_name 192.168.xx.xx;
    
# 指定将/api开头的请求转发给哪个后端服务器。
proxy_pass http://192.168.xx.xx:5000;
```

在保存修改后的配置文件后，运行以下命令测试Nginx配置：

```Bash
sudo nginx -t
```

如果没有语法错误，应该会看到类似于以下输出：

```Plain
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

最后重启Nginx：运行以下命令重启Nginx以应用新配置

```Bash
sudo systemctl restart nginx
```

直接访问192.168.xx.xx:8000即可



# 后端部署

## 配置mysql数据库

在实验室的linux服务器上下载mysql

```SQL
sudo apt update
sudo apt install mysql-server
```

安装完成后启动MySQL服务，并确保MySQL在系统启动时自动启动

```SQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

设置mysql密码

```SQL
sudo mysql_secure_installation
sudo mysql -u root -p
```

设置好后要修改 `backend/config.py` 文件中的mysql相关配置信息

在mysql中创建用于用户管理的数据库和表

```SQL
 CREATE DATABASE UserManagement;
 USE UserManagement; 
 CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    access VARCHAR(255)
);
```

然后手动添加一批用户，添加一个admin即可

```
INSERT INTO users (username, password_hash, access) VALUES ('admin', '$12$lVWWwGA99qRNc5UW2hu.Yukkwe7zun325j8gB.dP7Wr89nkrMtEfi', 'admin');
```



## 运行代码

创建虚拟环境：

```SQL
conda create -n backend python=3.11
```

cd到backend文件夹下后

```SQL
conda activate backend
cd backend
pip install -r requirements.txt
```

安装完所需的包后直接运行app.py即可。（如需要，也可用Gunicorn运行，能更好处理负载问题）

```SQL
python app.py
```