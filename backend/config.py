# config.py

# MySQL数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'asdfgh',
    'database': 'usermanagement'
}

# ClickHouse客户端配置
CLICKHOUSE_CONFIG = {
    'host': '192.168.xx.102',
    'port': 9000,
    'user': 'xxxx',
    'password': 'xxxx',
    'database': 'attribution'  # 可选，如果使用特定数据库
}

# MinIO客户端配置
MINIO_CONFIG = {
    'endpoint': "192.168.xx.107:9000",
    'access_key': 'xxxx',
    'secret_key': 'xxxx',
    'secure': False
}

# JWT配置
SECRET_KEY = 'sichuandaxue'

# 其他配置...
