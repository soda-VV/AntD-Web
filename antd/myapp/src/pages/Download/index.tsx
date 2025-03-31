import React, { useState, useEffect } from 'react';
import { queryPasswordindexData, queryDirectoryData, downloadFile, batchDownloadFiles, downloadAllDirectory } from '@/services/ant-design-pro/api';
import { Input, Button, Table, Space, Alert, Form, Radio, Modal, message } from 'antd'; 
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import type { RadioChangeEvent } from 'antd';

interface DataType {
  key: React.Key;
  url: string;
  username: string;
  password: string;
  directory: string;
  filename: string;
}

interface DirectoryDataType {
  directory: string;
  filename: string;
}

// 定义主组件PasswordindexQuery
const PasswordindexQuery: React.FC = () => {
  const intl = useIntl();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [domain, setDomain] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [fuzzy, setFuzzy] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [directoryData, setDirectoryData] = useState<DirectoryDataType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedDirectoryRowKeys, setSelectedDirectoryRowKeys] = useState<React.Key[]>([]);
  const [allSelectedRows, setAllSelectedRows] = useState<{ [page: number]: DataType[] }>({});
  const pageSize = 10;

  // passwordindex表 查询函数
  const fetchFilteredPasswordindexData = async (page: number = 1) => {
    if (!domain && !username) {
      setError('Url和Username至少输入一个');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await queryPasswordindexData({ domain, username, fuzzy, page, pagesize: pageSize });
      if (response && response.data) {
        const formattedData = response.data.map((item, index) => ({
          key: index + (page - 1) * pageSize,
          url: item.url,
          username: item.username,
          password: item.password,
          directory: item.directory,
          filename: item.filename,
        }));
        setData(formattedData);
        setTotal(response.total ?? 0); // 设置total，默认值为0
        setSelectedRowKeys(allSelectedRows[page]?.map(row => row.key) || []);
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
    fetchFilteredPasswordindexData(page);
  };

  // 单选框变化处理函数
  const handleRadioChange = (e: RadioChangeEvent) => {
    setFuzzy(e.target.value === 'fuzzy');
  };

  // 下载函数
  const handleDownload = async (record: DataType | DirectoryDataType) => {
    try {
      const filepath = `${record.directory}/${record.filename}`;
      const response = await fetch(`/api/download?filepath=${encodeURIComponent(filepath)}`);
      
      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = record.filename; // 文件名
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url); // 释放内存
      console.log('下载成功', record);
    } catch (error) {
      console.error('下载失败', error);
    }
  };

  // 批量下载函数
  const handleBatchDownload = async (isDirectory: boolean = false) => {
    try {
      const selectedRecords = isDirectory 
        ? directoryData.filter(item => selectedDirectoryRowKeys.includes(item.key))
        : Object.values(allSelectedRows).flat();
      const files = selectedRecords.map(record => `${record.directory}/${record.filename}`);

      const response = await fetch('/api/download_some', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files }),  // 保持原有的请求参数
      });

      if (!response.ok) {
        throw new Error('批量下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'batch_download.zip';  // 可根据后端生成的文件名更改
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      console.log('批量下载成功');
    } catch (error) {
      console.error('批量下载失败', error);
    }
  };

  // 全部下载函数
  const handleDownloadAll = async () => {
    try {
      const params = new URLSearchParams({
        domain,
        username,
        fuzzy: fuzzy.toString(),
      });

      const response = await fetch(`/api/download_all_password?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('全部下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'all_download.zip';  // 可根据后端生成的文件名更改
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('全部下载成功');
    } catch (error) {
      console.error('全部下载失败', error);
      message.error('全部下载失败');
    }
  };
  
  // 查看目录函数
  const handleViewDirectory = async (directory: string) => {
    try {
      const response = await queryDirectoryData({ directory });
      if (response && response.data) {
        const formattedData = response.data.map((item, index) => ({
          key: index,
          directory: item.directory,
          filename: item.filename,
        }));
        setDirectoryData(formattedData);
        setIsModalVisible(true);
      } else {
        setError('获取目录数据失败');
      }
    } catch (error) {
      setError('API获取数据失败');
      console.error('API获取数据失败', error);
    }
  };


  // 关闭模态框
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // 处理表格选择变化
  const handleSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setAllSelectedRows(prevSelectedRows => {
      const newSelectedRows = { ...prevSelectedRows, [currentPage]: selectedRows };
      return newSelectedRows;
    });
  };

  // 处理目录表格选择变化
  const handleDirectorySelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedDirectoryRowKeys(newSelectedRowKeys);
  };

  // 同步选中行
  useEffect(() => {
    setSelectedRowKeys(allSelectedRows[currentPage]?.map(row => row.key) || []);
  }, [data, allSelectedRows, currentPage]);

  // 计算批量下载按钮的禁用状态
  const isBatchDownloadDisabled = () => {
    return Object.values(allSelectedRows).flat().length === 0;
  };

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
    {
      title: 'Directory',
      dataIndex: 'directory',
      key: 'directory',
    },
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleDownload(record)}>下载</a>
          <a onClick={() => handleViewDirectory(record.directory)}>查看目录</a>
        </Space>
      ),
    },
  ];

  // 定义目录表格列
  const directoryColumns: TableColumnsType<DirectoryDataType> = [
    {
      title: 'Directory',
      dataIndex: 'directory',
      key: 'directory',
    },
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleDownload(record)}>下载</a>
        </Space>
      ),
    },
  ];

  // 渲染
  return (
    <PageContainer
      content={intl.formatMessage({
        id: 'pages.user.download.password_indexdata',
        defaultMessage: '查询/passwordindex',
      })}
    >      
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="输入Url">
          <Input 
            placeholder="Enter Url" 
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
          <Button type="primary" onClick={() => fetchFilteredPasswordindexData(1)} loading={loading}>
            查询
          </Button>
        </Form.Item>
      </Form>
      {error && <Alert message={error} type="error" showIcon />}
      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => handleBatchDownload(false)} disabled={isBatchDownloadDisabled()}>批量下载</Button>
        <Button onClick={handleDownloadAll} style={{ marginLeft: 8 }}>全部下载</Button>
      </div>
      <Table 
        rowSelection={{
          selectedRowKeys,
          onChange: handleSelectChange,
        }}
        columns={columns} 
        dataSource={data} 
        loading={loading} 
        pagination={{ 
          current: currentPage,
          pageSize,
          total,
          onChange: (page) => handlePageChange(page),
        }} 
        scroll={{ x: 'max-content' }} // 添加水平滚动条
      />
      <Modal
        title="目录详情"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800} // 设置弹出框宽度
      >
        <div style={{ marginBottom: 16 }}>
          <Button onClick={() => handleBatchDownload(true)} disabled={selectedDirectoryRowKeys.length === 0}>批量下载</Button>
        </div>
        <Table 
          rowSelection={{
            selectedRowKeys: selectedDirectoryRowKeys,
            onChange: handleDirectorySelectChange,
          }}
          columns={directoryColumns}
          dataSource={directoryData.map((item, index) => ({ key: index, ...item }))}
          pagination={false}
        />
      </Modal>
    </PageContainer>
  );
};

export default PasswordindexQuery;
