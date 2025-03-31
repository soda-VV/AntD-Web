module.exports = {
  'GET /api/currentUser': {
    data: {
      username: 'Serati Ma',
      id: '00000001',
    },
  },

  'POST /api/login/outLogin': { data: {}, success: true },
  
  'POST /api/login': {
    status: 'ok',
    type: 'account',
    currentAuthority: 'admin',
  },
};
