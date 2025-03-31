import access from '@/access';
import { Request, Response } from 'express';

let usersData = {
  "data": [
    {
      "key": 1,
      "username": "admin",
      "password": "ant.design.1",
      "access": "admin"
    },
    {
      "key": 2,
      "username": "advancedUser",
      "password": "ant.design.2",
      "access": "advancedUser"
    },
    {
      "key": 3,
      "username": "user",
      "password": "ant.design.3",
      "access": "user"
    }
  ],
  "total": 3
};

const queryUserData = (req: Request, res: Response) => {
  const { username } = req.query;
  let filteredData = usersData.data;

  if (username) {
    filteredData = filteredData.filter(user => user.username.includes(username as string));
  }
  res.send({
    data: filteredData,
    total: filteredData.length,
  });
};

const deleteUser = (req: Request, res: Response) => {
  const { id } = req.params;
  usersData.data = usersData.data.filter(user => user.key !== Number(id));
  usersData.total = usersData.data.length;
  res.send({ success: true });
};

const updateUser = (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  usersData.data = usersData.data.map(user => 
    user.key === Number(id) ? { ...user, username, email, password } : user
  );
  res.send({ success: true });
};

const createUser = (req: Request, res: Response) => {
  const { username, email, password, access } = req.body;
  const newUser = {
    key: usersData.data.length ? usersData.data[usersData.data.length - 1].key + 1 : 1,
    username,
    email,
    password,
    access,
  };
  usersData.data.push(newUser);
  usersData.total = usersData.data.length;
  res.send({ success: true });
};

export default {
  'GET /api/users': queryUserData,
  'DELETE /api/users/:id': deleteUser,
  'PUT /api/users/:id': updateUser,
  'POST /api/users': createUser,
};
