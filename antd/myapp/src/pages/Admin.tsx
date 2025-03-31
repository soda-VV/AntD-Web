import React, { useState, useEffect } from 'react';
import { queryUserData, deleteUser, updateUser, createUser } from '@/services/ant-design-pro/api'; 
import { Input, Button, Table, Space, Modal, Form, Alert, Select } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import type { TableColumnsType } from 'antd';

interface UserType {
  key: React.Key;
  username: string;
  access: string;
}

const Admin: React.FC = () => {
  const [data, setData] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [form] = Form.useForm();  // 创建 Form 实例

  useEffect(() => {
    fetchUserData();
  }, []);

  // 更新用户列表
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await queryUserData();
      if (response && response.data) {
        setData(response.data.map((item: any, index: number) => ({ key: index, ...item })));
      } else {
        setError('没有匹配到的数据');
      }
    } catch (error) {
      setError('API获取数据失败');
      console.error('API获取数据失败', error);
    }
    setLoading(false);
  };

  const handleDelete = async (record: UserType) => {
    try {
      await deleteUser({ username: record.username });  // 使用 username 作为查询参数
      fetchUserData();  // 删除后刷新用户数据
    } catch (error) {
      console.error('删除用户失败', error);
    }
  };
  
  const handleUpdate = async (values: any) => {
    try {
      const payload = {
        username: currentUser?.username,
        password: values.password,
        access: values.access,
      };
      await updateUser(payload);
      setIsModalVisible(false);
      fetchUserData();
    } catch (error) {
      console.error('更新用户信息失败', error);
    }
  };

  // 添加用户
  const handleAddUser = async (values: any) => {
    try {
      const response = await createUser(values);
      if (response.data.status === 'error' && response.data.message === 'Username already exists') {
        // 设置错误信息提示
        setError('用户名已存在，请选择其他用户名');
      } else {
        // 清除错误信息
        setError(null);
        // 关闭模态框并刷新用户数据
        setIsAddModalVisible(false);
        fetchUserData();
      }
    } catch (error) {
      console.error('新增用户失败', error);
      setError('新增用户失败');
    }
  };

  const handleEditClick = (record: UserType) => {
    setCurrentUser(record);
    form.setFieldsValue({ username: record.username, access: record.access });  // 仅设置 username 和 access 字段
    setIsModalVisible(true);
  };

  const columns: TableColumnsType<UserType> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Access',
      dataIndex: 'access',
      key: 'access',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEditClick(record)}>修改</a>
          <a onClick={() => handleDelete(record)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item>
          <Button 
            type="primary" 
            onClick={() => setIsAddModalVisible(true)}
          >
            新增用户
          </Button>
        </Form.Item>
      </Form>
      <Table 
        columns={columns} 
        dataSource={data} 
        loading={loading} 
        pagination={{ pageSize: 10 }} 
        scroll={{ x: 'max-content' }}
      />
      <Modal
        title="修改用户信息"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => {
          form.submit();  // 使用 Form 实例的 submit 方法来提交表单
        }}
      >
        {currentUser && (
          <Form
            form={form}  // 绑定到现有的 Form 实例
            onFinish={handleUpdate}
          >
            <Form.Item name="username" label="Username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input disabled />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item name="access" label="Access" rules={[{ required: true, message: '请选择权限' }]}>
              <Select>
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="advancedUser">Advanced User</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>
      <Modal
        title="新增用户"
        visible={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          setError(null); // 清除错误信息
        }}
        onOk={() => {
          form.submit();  // 提交表单
        }}
      >
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form
          form={form}  // 绑定到现有的 Form 实例
          id="addUserForm"
          onFinish={handleAddUser}
        >
          <Form.Item name="username" label="Username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="access" label="Access" rules={[{ required: true, message: '请选择权限' }]}>
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="advancedUser">Advanced User</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Admin;
