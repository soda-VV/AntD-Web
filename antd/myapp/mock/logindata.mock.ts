import { Request, Response } from 'express';

const loginData = {
  "data": [
    {
      "url": "1",
      "username": "user1@example.com",
      "password": "password1",
    },
    {
      "url": "2",
      "username": "user2@example.com",
      "password": "password2",
    },
    {
      "url": "3",
      "username": "user3@example.com",
      "password": "password3",
    },
    {
      "url": "4",
      "username": "user4@example.com",
      "password": "password4",
    },
    {
      "url": "5",
      "username": "user5@example.com",
      "password": "password5",
    },
    {
      "url": "6",
      "username": "user6@example.com",
      "password": "password6",
    },
    {
      "url": "7",
      "username": "user7@example.com",
      "password": "password7",
    },
    {
      "url": "8",
      "username": "user8@example.com",
      "password": "password8",
    },
    {
      "url": "9",
      "username": "user9@example.com",
      "password": "password9",
    },
    {
      "url": "10",
      "username": "user10@example.com",
      "password": "password10",
    },
    {
      "url": "11",
      "username": "user11@example.com",
      "password": "password11",
    },
    {
      "url": "12",
      "username": "user12@example.com",
      "password": "password12",
    },
    {
      "url": "13",
      "username": "user13@example.com",
      "password": "password13",
    },
    {
      "url": "14",
      "username": "user14@example.com",
      "password": "password14",
    },
    {
      "url": "15",
      "username": "user15@example.com",
      "password": "password15",
    },
    {
      "url": "16",
      "username": "user16@example.com",
      "password": "password16",
    },
    {
      "url": "17",
      "username": "user17@example.com",
      "password": "password17",
    },
    {
      "url": "18",
      "username": "user18@example.com",
      "password": "password18",
    },
    {
      "url": "19",
      "username": "user19@example.com",
      "password": "password19",
    },
    {
      "url": "20",
      "username": "user20@example.com",
      "password": "password20",
    },
    {
      "url": "21",
      "username": "user21@example.com",
      "password": "password21",
    }
  ],
  "total": 21
}

const getLoginData = async (req: Request, res: Response) => {
  await new Promise(resolve => setTimeout(resolve, 5000)); // 模拟异步请求延迟
  res.send(loginData)
};

export default {
  'GET /api/logindata': getLoginData,
};
