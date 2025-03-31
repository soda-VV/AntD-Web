// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 登录接口 POST /api/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}


/**查询logindata表  GET /api/logindata*/
export async function queryLoginData(
  params: { 
    domain?: string;
    username?: string; 
    fuzzy?: boolean;
    page?: number;
    pagesize?: number;
  },
  options?: { [key: string]: any },
  ) {
  return request<API.LogindataList>('/api/logindata', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 查询textline表 GET /api/textline */
export async function queryTextlineData(
  params: { 
    domain?: string; 
    username?: string; 
    page?: number;
    pagesize?: number;
  },
  options?: { [key: string]: any },
  ) {
  return request<API.TetxlinedataList>('/api/textline', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 查询passwordindex表 GET /api/passwordindex */
export async function queryPasswordindexData(
  params: { 
    domain?: string;
    username?: string; 
    fuzzy?: boolean;
    page?: number;
    pagesize?: number;
  },
  options?: { [key: string]: any },
  ) {
  return request<API.PasswordindexList>('/api/passwordindex', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 查询directory表 GET /api/directory */
export async function queryDirectoryData(
  params: { 
    directory?: string;
  },
  options?: { [key: string]: any },
  ) {
  return request<API.DirectoryList>('/api/directory', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 下载文件 
 * */

/**单个下载 */
export async function downloadFile(
  params: { 
    filepath?: string;
  },
  options?: { [key: string]: any },
  ) {
  return request('/api/download', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**批量下载 */
export async function batchDownloadFiles(params: { files: string[] }) {
  return request('/api/download_some', {
    method: 'POST',
    data: params,
  });
}



/**全选下载 */
export async function downloadAllDirectory(
  params: { 
    domain: string; 
    username: string; 
    fuzzy: boolean 
  },
  options?: { [key: string]: any },
  ) {
  return request('/api/download_all_password', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}


/**
 * 用户管理 
 * */

/** 查询用户数据 */
export async function queryUserData(options?: { [key: string]: any }) {
  return request('/api/users', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 删除用户 */
export async function deleteUser(
  params: { 
    username: string;
  },
  options?: { [key: string]: any },
) {
  return request(`/api/deleteUser`, {
    method: 'GET',
    params,  // 直接将 username 作为查询参数发送
    ...(options || {}),
  });
}


/** 更新用户 */
export async function updateUser(
  params: { 
    username: string;
    password: string;
    access: string;
  },
  options?: { [key: string]: any },
) {
  return request(`/api/updateUser`, {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}


/**新增用户 */
export async function createUser(
  params: { 
    username: string;
    password: string;
    access: string;
  },
  options?: { [key: string]: any },
) {
  return request('/api/addUser', {
    method: 'POST',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}