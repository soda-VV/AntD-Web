from flask import Flask, request, Response, jsonify
from clickhouse_driver import Client
from urllib.parse import unquote
import bcrypt
import datetime
from minio import Minio
from minio.error import S3Error
import zipfile
import io
import tempfile
import os
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
from functools import wraps
import jwt
import config  # 导入配置文件

app = Flask(__name__)
CORS(app)

# 初始化ClickHouse客户端
client = Client(**config.CLICKHOUSE_CONFIG)

# 初始化MinIO客户端
minio_client = Minio(
    config.MINIO_CONFIG['endpoint'],
    access_key=config.MINIO_CONFIG['access_key'],
    secret_key=config.MINIO_CONFIG['secret_key'],
    secure=config.MINIO_CONFIG['secure']
)

# 获取数据库连接
def get_db_connection():
    try:
        connection = mysql.connector.connect(**config.DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print("Error while connecting to MySQL", e)
        return None

# 用于编码和解码JWT的密钥
SECRET_KEY = config.SECRET_KEY

# 登录
@app.route('/api/login', methods=['POST'])
def login_user():
    username = request.json['username']
    password = request.json['password']

    connection = get_db_connection()
    if not connection:
        return jsonify({'status': 'error', 'message': 'Failed to connect to database'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT password_hash, access FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        result = cursor.fetchone()

        if not result:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        stored_hash = result['password_hash']
        current_authority = result['access']

        if bcrypt.checkpw(password.encode(), stored_hash.encode()):
            payload = {
                'username': username,
                'access': current_authority,
                'iat': datetime.datetime.utcnow(),
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

            return jsonify({
                'status': 'ok',
                'type': 'account',
                'currentAuthority': current_authority,
                'token': token
            }), 200
        else:
            return jsonify({'status': 'error', 'message': 'Invalid password'}), 401

    except Error as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


# 验证JWT Token的装饰器
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'status': 'error', 'message': 'Token is missing'}), 403

        if token.startswith('Bearer '):
            token = token[7:]

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = data['username']
        except jwt.ExpiredSignatureError:
            return jsonify({'status': 'error', 'message': 'Token has expired'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'status': 'error', 'message': 'Invalid token'}), 403

        return f(current_user=current_user, *args, **kwargs)

    return decorated


# 验证用户权限
@app.route('/api/currentUser', methods=['GET'])
@token_required
def get_user_info(current_user):
    token = request.headers.get('Authorization')
    connection = None

    if token.startswith('Bearer '):
        token = token[7:]

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        username = data['username']
        access = data['access']

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = "SELECT id FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        result = cursor.fetchone()

        if not result:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        user_id = result['id']

        return jsonify({
            'success': True,
            'data': {
                'username': username,
                'id': user_id,
                'access': access
            }
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({'success': False, 'message': 'Token has expired'}), 403
    except jwt.InvalidTokenError:
        return jsonify({'success': False, 'message': 'Invalid token'}), 403
    except Error as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()


# 退出登录
@app.route('/api/login/outLogin', methods=['POST'])
@token_required
def logout_user(current_user):
    return jsonify({"data": {}, "success": True}), 200


# 查看用户
@app.route('/api/users', methods=['GET'])
def get_all_users():
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("SELECT id, username, access FROM users")
        users = cursor.fetchall()

        user_list = []
        for user in users:
            user_list.append({
                "key": user[0],
                "username": user[1],
                "access": user[2]
            })

        return jsonify({
            "data": user_list,
            "total": len(user_list)
        }), 200
    except Error as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400
    finally:
        cursor.close()
        connection.close()


# 添加用户
@app.route('/api/addUser', methods=['POST'])
@token_required
def add_user(current_user):
    data = request.json
    username = data.get('username')
    password = data.get('password')
    access = data.get('access')

    if not username or not password or not access:
        return jsonify({'status': 'error', 'message': 'Missing required parameters'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'status': 'error', 'message': 'Failed to connect to database'}), 500

    try:
        cursor = connection.cursor()

        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            return jsonify({'status': 'error', 'message': 'Username already exists'}), 409

        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')

        insert_query = "INSERT INTO users (username, password_hash, access) VALUES (%s, %s, %s)"
        cursor.execute(insert_query, (username, password_hash, access))
        connection.commit()

        return jsonify({'status': 'success', 'message': 'User created successfully'}), 201

    except Error as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


# 删除用户
@app.route('/api/deleteUser', methods=['GET'])
def delete_user():
    username = request.args.get('username')

    if not username:
        return jsonify({'status': 'error', 'message': 'Missing username'}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s", (username,))
        if cursor.fetchone()[0] == 0:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        cursor.execute("DELETE FROM users WHERE username = %s", (username,))
        connection.commit()

        return jsonify({'status': 'success', 'message': 'User deleted successfully'}), 200
    except Error as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400
    finally:
        cursor.close()
        connection.close()


# 修改用户
@app.route('/api/updateUser', methods=['POST'])
@token_required
def update_user(current_user):
    data = request.json
    username = data.get('username')
    password = data.get('password')
    access = data.get('access')

    if not username or not password or not access:
        return jsonify({'status': 'error', 'message': 'Missing required parameters'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'status': 'error', 'message': 'Failed to connect to database'}), 500

    try:
        cursor = connection.cursor()

        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        if cursor.fetchone() is None:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')

        update_query = "UPDATE users SET password_hash = %s, access = %s WHERE username = %s"
        cursor.execute(update_query, (password_hash, access, username))
        connection.commit()

        return jsonify({'status': 'success', 'message': 'User updated successfully'}), 200

    except Error as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


# 查询logindata表
@app.route('/api/logindata', methods=['GET'])
def get_logindata():
    search_domain = request.args.get('domain')
    search_username = request.args.get('username')
    fuzzy = request.args.get('fuzzy', 'false').lower() == 'true'
    page = int(request.args.get('page', 1))
    pagesize = int(request.args.get('pagesize', 10))

    conditions = []

    if search_domain:
        domain_condition = f"url LIKE '%{search_domain}%'" if fuzzy else f"url = '{search_domain}'"
        conditions.append(domain_condition)
    if search_username:
        username_condition = f"username LIKE '%{search_username}%'" if fuzzy else f"username = '{search_username}'"
        conditions.append(username_condition)

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    count_query = f"SELECT COUNT(*) FROM attribution.logindata{where_clause}"
    total_count = client.execute(count_query)[0][0]

    data_query = f"SELECT url, username, password FROM attribution.logindata{where_clause} LIMIT {pagesize} OFFSET {(page - 1) * pagesize}"
    result = client.execute(data_query)

    response_data = [{'url': row[0], 'username': row[1], 'password': row[2]} for row in result]
    response = {
        'total': total_count,
        'data': response_data
    }
    return jsonify(response)


# 查询textline表
@app.route('/api/textline', methods=['GET'])
def get_textline():
    search_domain = request.args.get('domain')
    search_username = request.args.get('username')
    page = int(request.args.get('page', 1))
    pagesize = int(request.args.get('pagesize', 10))

    max_rows = 10000
    offset = (page - 1) * pagesize

    if offset >= max_rows:
        return jsonify({
            'total': 0,
            'data': []
        })

    conditions = []
    if search_domain:
        conditions.append(f"content LIKE '%{search_domain}%'")
    if search_username:
        conditions.append(f"content LIKE '%{search_username}%'")

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    count_query = f"SELECT COUNT(*) FROM attribution.textline{where_clause}"
    total_count = client.execute(count_query)[0][0]

    if total_count > max_rows:
        total_count = max_rows

    limit_clause = f"LIMIT {min(pagesize, max_rows - offset)} OFFSET {offset}"
    data_query = f"SELECT content FROM attribution.textline{where_clause} {limit_clause}"
    result = client.execute(data_query)

    return jsonify({
        'total': total_count,
        'data': [{'line_content': row[0]} for row in result]
    })


# 查询passwordindex表
@app.route('/api/passwordindex', methods=['GET'])
def get_password_index():
    search_domain = request.args.get('domain')
    search_username = request.args.get('username')
    fuzzy = request.args.get('fuzzy', 'false').lower() == 'true'
    page = int(request.args.get('page', 1))
    pagesize = int(request.args.get('pagesize', 10))

    conditions = []
    if search_domain:
        if fuzzy:
            conditions.append(f"url LIKE '%{search_domain}%'")
        else:
            conditions.append(f"url = '{search_domain}'")
    if search_username:
        if fuzzy:
            conditions.append(f"username LIKE '%{search_username}%'")
        else:
            conditions.append(f"username = '{search_username}'")

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    count_query = f"SELECT COUNT(*) FROM attribution.password_index{where_clause}"
    total_count = client.execute(count_query)[0][0]

    data_query = f"""
    SELECT uniqueid, url, username, password
    FROM attribution.password_index
    {where_clause}
    LIMIT {pagesize} OFFSET {(page - 1) * pagesize}
    """
    password_index_results = client.execute(data_query)

    uniqueids = [row[0] for row in password_index_results]

    if uniqueids:
        uniqueid_clause = "('" + "','".join(uniqueids) + "')"
        directory_query = f"""
        SELECT uniqueid, directory, filename
        FROM attribution.directory_index
        WHERE uniqueid IN {uniqueid_clause}
        """
        directory_results = client.execute(directory_query)
        directory_map = {row[0]: {'directory': row[1], 'filename': row[2]} for row in directory_results}
    else:
        directory_map = {}

    data = []
    for row in password_index_results:
        uniqueid, url, username, password = row
        directory_info = directory_map.get(uniqueid, {'directory': None, 'filename': None})
        data.append({
            'url': url,
            'username': username,
            'password': password,
            'directory': directory_info['directory'],
            'filename': directory_info['filename']
        })

    return jsonify({
        'total': total_count,
        'data': data
    })


# 下载单个文件
@app.route('/api/download', methods=['GET'])
def download_file():
    file_path = request.args.get('filepath')
    if not file_path:
        return {
            "success": False,
            "data": None,
            "errorCode": 400,
            "errorMessage": "File path is required."
        }, 400

    try:
        decoded_file_path = unquote(file_path).replace('&', '_')
        response = minio_client.get_object('stealer-log', decoded_file_path)
        return Response(
            response.stream(32*1024),
            mimetype='application/octet-stream',
            headers={'Content-Disposition': f'attachment;filename="{decoded_file_path.split("/")[-1]}"'}
        )
    except S3Error as e:
        return {
            "success": False,
            "data": None,
            "errorCode": 500,
            "errorMessage": str(e)
        }, 500


# 批量下载文件
@app.route('/api/download_some', methods=['POST'])
def download_files():
    file_paths = request.json.get('files', [])
    if not file_paths:
        return {
            "success": False,
            "data": None,
            "errorCode": 400,
            "errorMessage": "File paths are required."
        }, 400

    try:
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w') as zf:
            for file_path in file_paths:
                try:
                    decoded_file_path = unquote(file_path).replace('&', '_')
                    response = minio_client.get_object('stealer-log', decoded_file_path)
                    zf.writestr(decoded_file_path.split('/')[-1], response.read())
                except Exception as e:
                    app.logger.error(f"Failed to download {decoded_file_path}: {str(e)}")
                    continue

        memory_file.seek(0)
        return Response(
            memory_file,
            mimetype='application/zip',
            headers={'Content-Disposition': 'attachment;filename="download.zip"'}
        )
    except Exception as e:
        return {
            "success": False,
            "data": None,
            "errorCode": 500,
            "errorMessage": f"Failed to create ZIP file: {str(e)}"
        }, 500


# 下载查询页面检索到的全部文件
@app.route('/api/download_all_password', methods=['GET'])
def download_all_files():
    domain = request.args.get('domain')
    username = request.args.get('username')
    fuzzy = request.args.get('fuzzy', 'false').lower() == 'true'

    try:
        conditions = []
        if domain:
            if fuzzy:
                conditions.append(f"url LIKE '%{domain}%'")
            else:
                conditions.append(f"url = '{domain}'")
        if username:
            if fuzzy:
                conditions.append(f"username LIKE '%{username}%'")
            else:
                conditions.append(f"username = '{username}'")

        where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

        uniqueid_query = f"""
        SELECT uniqueid
        FROM attribution.password_index
        {where_clause}
        """
        app.logger.info(f"Executing uniqueid query: {uniqueid_query}")
        uniqueid_results = client.execute(uniqueid_query)

        uniqueids = [row[0] for row in uniqueid_results]

        directory_map = {}
        if uniqueids:
            uniqueid_clause = "('" + "','".join(uniqueids) + "')"
            directory_query = f"""
            SELECT uniqueid, directory, filename
            FROM attribution.directory_index
            WHERE uniqueid IN {uniqueid_clause}
            """
            app.logger.info(f"Executing directory query: {directory_query}")
            directory_results = client.execute(directory_query)
            directory_map = {row[0]: {'directory': row[1], 'filename': row[2]} for row in directory_results}

        with tempfile.TemporaryDirectory() as tmpdirname:
            zip_path = os.path.join(tmpdirname, 'files.zip')
            with zipfile.ZipFile(zip_path, 'w') as zf:
                for uniqueid in uniqueids:
                    directory_info = directory_map.get(uniqueid)
                    if directory_info:
                        file_path = f"{directory_info['directory']}/{directory_info['filename']}"
                        try:
                            data = minio_client.get_object('stealer-log', file_path)
                            zf.writestr(directory_info['filename'], data.read())
                        except Exception as e:
                            app.logger.error(f"Failed to download {file_path}: {str(e)}")
                            continue

            with open(zip_path, 'rb') as f:
                return Response(
                    f.read(),
                    mimetype='application/zip',
                    headers={'Content-Disposition': 'attachment;filename="download.zip"'}
                )
    except Exception as e:
        app.logger.error(f"Error in download_all_files: {str(e)}")
        return {
            "success": False,
            "data": None,
            "errorCode": 500,
            "errorMessage": f"An error occurred: {str(e)}"
        }, 500


# 查看目录
@app.route('/api/directory', methods=['GET'])
def get_directory_contents():
    directory = request.args.get('directory', '')

    parts = directory.rstrip('/').split('/')

    where_clause = f"WHERE directory = '{directory}' OR directory LIKE '{directory}/%'"

    data_query = f"SELECT directory, filename FROM attribution.directory_index {where_clause}"
    results = client.execute(data_query)

    return jsonify({
        'data': [{'directory': row[0], 'filename': row[1]} for row in results]
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
