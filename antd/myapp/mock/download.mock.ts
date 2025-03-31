import { Request, Response } from 'express';

const passwordindexData = {
  "data": [
    {
      "directory": "1",
      "filename": "1.txt",
      "password": "password1",
      "url": "https://www.example.com",
      "username": "user1@example.com"
    },
    {
      "directory": "2",
      "filename": "2.txt",
      "password": "password2",
      "url": "https://www.example.com",
      "username": "user2@example.com"
    },
    {
      "directory": "3",
      "filename": "3.txt",
      "password": "password3",
      "url": "https://www.example.com",
      "username": "user3@example.com"
    }
  ],
  "total": 3
}

const getPasswordindexData = async (req: Request, res: Response) => {
  await new Promise(resolve => setTimeout(resolve, 5000)); // 模拟异步请求延迟
  res.send(passwordindexData)
};

export default {
  'GET /api/passwordindex': getPasswordindexData,
};
