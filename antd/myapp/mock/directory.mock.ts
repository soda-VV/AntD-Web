import { Request, Response } from 'express';

const directoryData = {
  "data": [
    {
      "directory": "1",
      "filename": "1.txt"
    },
    {
      "directory": "2",
      "filename": "2.txt"
    },
    {
      "directory": "3",
      "filename": "3.txt"
    },
    {
      "directory": "4",
      "filename": "4.txt"
    },
    {
      "directory": "5",
      "filename": "5.txt"
    },
    {
      "directory": "6",
      "filename": "6.txt"
    },
    {
      "directory": "7",
      "filename": "7.txt"
    },
    {
      "directory": "8",
      "filename": "8.txt"
    },
    {
      "directory": "9",
      "filename": "9.txt"
    },
    {
      "directory": "10",
      "filename": "10.txt"
    },
    {
      "directory": "11",
      "filename": "11.txt"
    },
  ],
  "total": 11
}

const getDirectoryData = async (req: Request, res: Response) => {
  await new Promise(resolve => setTimeout(resolve, 5000)); // 模拟异步请求延迟
  res.send(directoryData)
};

export default {
  'GET /api/passwordindex': getDirectoryData,
};
