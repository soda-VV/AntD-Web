/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    // 高级会员权限：可以访问下载功能，管理员也可以使用
    canAdvancedUser: currentUser && (currentUser.access === 'advancedUser' || currentUser.access === 'admin'),
  };
}
