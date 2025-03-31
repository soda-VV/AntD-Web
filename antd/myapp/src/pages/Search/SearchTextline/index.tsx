import React, { useState } from 'react';
import { queryTextlineData } from '@/services/ant-design-pro/api';
import { Input, Button, Table, Form, Alert } from 'antd'; 
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { TableColumnsType } from 'antd';

interface DataType {
  key: React.Key;
  line_content: string;
}

interface ResponseDataType {
  data: DataType[];
  total: number;
}

// 定义表格列
const columns: TableColumnsType<DataType> = [
  {
    title: 'Line Content',
    dataIndex: 'line_content',
    key: 'line_content',
  },
];

// 定义主组件TextlineQuery
const TextlineQuery: React.FC = () => {
  const intl = useIntl();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [domain, setDomain] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // textline表 查询函数
  const fetchFilteredTextline = async (page: number = 1) => {
    if (!domain && !username) {
      setError('Url和Username至少输入一个');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await queryTextlineData({ domain, username, page, pagesize: pageSize });
      if (response && response.data) {
        const formattedData = response.data.map((item, index) => ({
          key: index + (page - 1) * pageSize,
          line_content: item.line_content,
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
    fetchFilteredTextline(page);
  };

  // 渲染
  return (
    <PageContainer
      content={intl.formatMessage({
        id: 'pages.user.search.textlinedata',
        defaultMessage: '查询/textline',
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
          <Button type="primary" onClick={() => fetchFilteredTextline(1)} loading={loading}>
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
          showSizeChanger: false, // 隐藏选择条数的下拉框
        }} 
      />
    </PageContainer>
  );
};

export default TextlineQuery;
