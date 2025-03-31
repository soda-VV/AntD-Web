import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

/**
 * 模拟等待时间
 * @returns 
 */
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

/**
 * 定义生成Token的方法
 */
const secret = 'your_jwt_secret';
const generateToken = (username: string, access: string) => {
  const token = jwt.sign({ username, access }, secret, { expiresIn: '1h' });
  return token;
};

/**
 * 定义验证Token的方法
 */
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
};

/**
 * 定义API路由
 */
export default {
  // 检查当前用户权限
  'GET /api/currentUser': (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).send({
        data: {
          isLogin: false,
        },
        errorCode: '401',
        errorMessage: '请先登录！',
        success: true,
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).send({
        data: {
          isLogin: false,
        },
        errorCode: '401',
        errorMessage: 'Token 无效或已过期，请重新登录！',
        success: true,
      });
      return;
    }

    res.send({
      success: true,
      data: {
        username: decoded.username,
        id: '00000001',
        access: decoded.access,
      },
    });
  },

  // 登录
  'POST /api/login': async (req: Request, res: Response) => {
    const { password, username, type } = req.body;
    await waitTime(2000);
    // 管理员权限
    if (password === 'ant.design' && username === 'admin') {
      const token = generateToken(username, 'admin');
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
        token,
      });
      return;
    }
    // 普通用户权限 
    if (password === 'ant.design' && username === 'user') {
      const token = generateToken(username, 'user');
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'user',
        token,
      });
      return;
    }
    // 高级用户权限
    if (password === 'ant.design' && username === 'advancedUser') {
      const token = generateToken(username, 'advancedUser');
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'advancedUser',
        token,
      });
      return;
    }

    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
  },

  // 退出登录
  'POST /api/login/outLogin': (req: Request, res: Response) => {
    res.send({ data: {}, success: true });
  },

  // 注册
  'POST /api/register': async (req: Request, res: Response) => {
    const { username, password } = req.body;
    await waitTime(2000);
    // 这里可以添加更多的注册逻辑，如检查用户名是否已存在等
    if (username && password) {
      res.send({ status: 'ok', currentAuthority: 'user', success: true });
      return;
    }
    res.send({ status: 'error', message: '注册失败', success: false });
  },

  'GET /api/500': (req: Request, res: Response) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (req: Request, res: Response) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (req: Request, res: Response) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Forbidden',
      message: 'Forbidden',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (req: Request, res: Response) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
};
