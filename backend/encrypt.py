import bcrypt

# 要加密的初始密码
password = "user"

# 生成盐并加密密码
salt = bcrypt.gensalt()
hashed_password = bcrypt.hashpw(password.encode(), salt)

# 打印加密后的密码
print(hashed_password.decode())

