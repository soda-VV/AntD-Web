import { Request, Response } from 'express';

const textline = {
  "data": [
    {
      "line_content": "1"
    },
    {
      "line_content": "2"
    },
    {
      "line_content": "3"
    },
    {
      "line_content": "4"
    },
    {
      "line_content": "5"
    },
    {
      "line_content": "6"
    },
    {
      "line_content": "7"
    },
    {
      "line_content": "8"
    },
    {
      "line_content": "9"
    },
    {
      "line_content": "10"
    },
    {
      "line_content": "11"
    },
    {
      "line_content": "12"
    },
    {
      "line_content": "13"
    },
    {
      "line_content": "14"
    },
    {
      "line_content": "15"
    }
  ],
  "total": 15
}

const getTextlineData = async (req: Request, res: Response) => {
  await new Promise(resolve => setTimeout(resolve, 5000)); // 模拟异步请求延迟
  return res.send(textline);
};

export default {
  'GET /api/textline': getTextlineData,
};
