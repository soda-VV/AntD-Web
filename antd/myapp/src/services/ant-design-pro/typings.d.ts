// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    username?: string;
    id?: string;
    access?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
    token: string;
  };


  // 用户列表
type UserListItem = {
    id: number;
    email: string;
    username: string;
    password: string;
    role: 'admin' | 'user' | 'advancedUser';
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };



  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  // type NoticeIconList = {
  //   data?: NoticeIconItem[];
  //   /** 列表的内容总数 */
  //   total?: number;
  //   success?: boolean;
  // };

  // type NoticeIconItemType = 'notification' | 'message' | 'event';

  // type NoticeIconItem = {
  //   id?: string;
  //   extra?: string;
  //   key?: string;
  //   read?: boolean;
  //   avatar?: string;
  //   title?: string;
  //   status?: string;
  //   datetime?: string;
  //   description?: string;
  //   type?: NoticeIconItemType;
  // };
  
  // Logindata表
  type LogindataListItem = {
    url: string;
    username: string;
    password: string;
  };

  type LogindataList = {
    data?: LogindataListItem[];
    // success?: boolean;
    total?: number;
  };

  // Tetxline表
  type TetxlinedataListItem = {
    line_content: string;
  };

  type TetxlinedataList = {
    data?: TetxlinedataListItem[];   
    /** 列表的内容总数 */
    total?: number;
    // success?: boolean;
  }

  // passwordindex表
  type PasswordindexItem = {
    url: string;
    username: string;
    password: string;
    directory: string;
    filename: string;
  };

  type PasswordindexList = {
    data?: PasswordindexItem[];
    // success?: boolean;
    total?: number;
  };

  // directory表
  type DirectoryItem = {
    directory: string;
    filename: string;
  };

  type DirectoryList = {
    data?: DirectoryItem[];
    // success?: boolean;
    total?: number;
  };

}




