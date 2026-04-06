import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Tag,
  Popconfirm,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AdminLayout from "../../../components/Layout/AdminLayout";
import api from "../../../api/api"; // Axios instance with baseURL + token
import { useAuth } from "../../../context/AuthContext";

const { Option } = Select;

export default function AdminAccounts() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [showSociety, setShowSociety] = useState(false);

  // Fetch admins from backend
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await api.get("/admins");
        setAdmins(res.data);
      } catch (err) {
        message.error("Failed to fetch admins");
        console.error(err);
      }
    };
    const fetchRoles = async () => {
      try {
        const res = await api.get("/roles");
        setRoles(res.data);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    };
    const fetchSocieties = async () => {
      try {
        const res = await api.get("/societies");
        setSocieties(res.data);
      } catch (err) {
        console.error("Failed to fetch societies", err);
      }
    };
    fetchAdmins();
    fetchSocieties();
    fetchRoles();
  }, []);

  const openModal = (admin = null) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);

    if (admin) {
      const { password, ...rest } = admin;
      form.setFieldsValue(rest);
       setSelectedRole(admin.role);
    } else {
      form.resetFields();
      setSelectedRole("");
    }
  };

  const closeModal = () => {
    setEditingAdmin(null);
    setIsModalOpen(false);
    form.resetFields();
  };

  // Create or update admin
  const handleSubmit = async (values) => {
    try {
      if (editingAdmin) {
        // remove password if empty
        if (!values.password) delete values.password;

        const res = await api.put(`/admins/${editingAdmin._id}`, values);
        setAdmins(
          admins.map((a) => (a._id === editingAdmin._id ? res.data : a))
        );
        message.success("Admin updated");
      } else {
        const res = await api.post("/admins", values);
        setAdmins([res.data, ...admins]);
        message.success("Admin created");
      }
      closeModal();
    } catch (err) {
      message.error(err.response?.data?.message || "Operation failed");
    }
  };

  // Delete admin
  const deleteAdmin = async (id, name) => {
    try {
      await api.delete(`/admins/${id}`);
      setAdmins(admins.filter((a) => a._id !== id));
      message.success("Admin deleted");
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
      console.error(err);
    }
  };

  // Toggle active status
  const toggleStatus = async (record, checked) => {
    try {
      const res = await api.put(`/admins/${record._id}`, {
        ...record,
        active: checked,
      });
      setAdmins(admins.map((a) => (a._id === record._id ? res.data : a)));
      message.success(`Status changed for ${record.username}`);
    } catch (err) {
      message.error("Failed to change status");
      console.error(err);
    }
  };

  const columns = [
    { title: "Email", dataIndex: "email" },
    { title: "Username", dataIndex: "username" },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => (
        <Tag color={role.includes("Admin") ? "gold" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      render: (_, record) => (
        <Switch
          checked={record.active}
          onChange={(checked) => toggleStatus(record, checked)}
        />
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="Delete this admin?"
            onConfirm={() => deleteAdmin(record._id, record.username)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Admin Accounts</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Create Admin
        </Button>
      </Space>

      <Table
        dataSource={admins}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingAdmin ? "Edit Admin" : "Create Admin"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingAdmin ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              editingAdmin
                ? {}
                : { required: true, message: "Password is required" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select
              onChange={(value) => setSelectedRole(value)}
              placeholder="Select Role"
            >
              {roles.map((role) => (
                <Option key={role._id} value={role.role}>
                  {role.role}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {(selectedRole === "society" || editingAdmin?.role === "society") && (
            <Form.Item
              label="Society"
              name="societyId"
              rules={[{ required: true, message: "Select society" }]}
            >
              <Select placeholder="Select Society">
                {societies.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </AdminLayout>
  );
}
