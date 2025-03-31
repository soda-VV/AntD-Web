import React, { useState } from 'react';
import { queryLoginData } from '@/services/ant-design-pro/api';
import { Input, Button, Table, Space, Card, Typography, Alert, Form, Radio } from 'antd'; 
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import type { RadioChangeEvent } from 'antd';

interface DataType {
  key: React.Key;
  url: string;
  username: string;
  password: string;
}

interface ResponseDataType {
  data: DataType[];
  total: number;
}

// 定义表格列
const columns: TableColumnsType<DataType> = [
  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
  },
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: 'Password',
    dataIndex: 'password',
    key: 'password',
  },
];

// 定义主组件LoginDataQuery
const LoginDataQuery: React.FC = () => {
  const intl = useIntl();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [domain, setDomain] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [fuzzy, setFuzzy] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // logindata表 查询函数
  const fetchFilteredLoginData = async (page: number = 1) => {
    if (!domain && !username) {
      setError('Url和Username至少输入一个');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await queryLoginData({ domain, username, fuzzy, page, pagesize: pageSize });
      if (response && response.data) {
        const formattedData = response.data.map((item, index) => ({
          key: index + (page - 1) * pageSize,
          url: item.url,
          username: item.username,
          password: item.password,
        }));
        setData(formattedData);
        setTotal(response.total ?? 0); // 设置total，默认值为0
      } else {
        setError('没有匹配到的数据');
      }
    } catch (error) {
      setError('API获取数据失败');
      console.error('API获取数据失败', error);
    }
    setLoading(false);
  };

  // 页码变化处理函数
  const handlePageChange = (page: number) => {
    setCurrentPage(page ?? 1); // 设置currentPage，默认值为1
    fetchFilteredLoginData(page);
  };

  // 单选框变化处理函数
  const handleRadioChange = (e: RadioChangeEvent) => {
    setFuzzy(e.target.value === 'fuzzy');
  };

  // 渲染
  return (
    <PageContainer
      content={intl.formatMessage({
        id: 'pages.user.search.logindata',
        defaultMessage: '查询/logindata',
      })}
    >      
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="输入Domain">
          <Input 
            placeholder="Enter Domain" 
            value={domain} 
            onChange={e => setDomain(e.target.value)} 
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item label="输入Username">
          <Input 
            placeholder="Enter Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item>
          <Radio.Group onChange={handleRadioChange} defaultValue="fuzzy">
            <Radio value="fuzzy">模糊查询</Radio>
            <Radio value="exact">全字匹配</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => fetchFilteredLoginData(1)} loading={loading}>
            查询
          </Button>
        </Form.Item>
      </Form>
      {error && <Alert message={error} type="error" showIcon />}
      <Table 
        columns={columns} 
        dataSource={data} 
        loading={loading} 
        pagination={{ 
          current: currentPage,
          pageSize,
          total,
          onChange: (page) => handlePageChange(page),
        }} 
      />
    </PageContainer>
  );
};

export default LoginDataQuery;
