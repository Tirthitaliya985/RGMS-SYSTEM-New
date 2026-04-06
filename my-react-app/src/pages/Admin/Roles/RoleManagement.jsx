import { useEffect, useState } from "react";
import AdminLayout from "../../../components/Layout/AdminLayout";
import { Table, Card, Button, Modal, Form, Input, Checkbox, message } from "antd";
import { useTheme } from "../../../context/ThemeContext";
import api from "../../../api/api"; // Axios instance with token

export default function RoleManagement() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [roles, setRoles] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/roles");
        setRoles(res.data);
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch roles");
      }
    };
    fetchRoles();
  }, []);

  const openModal = (role = null) => {
    setEditingRole(role);
    setModalVisible(true);
    if (role) form.setFieldsValue(role);
    else form.resetFields();
  };

  const closeModal = () => {
    setEditingRole(null);
    setModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      if (editingRole) {
        // Update role
        const res = await api.put(`/roles/${editingRole._id}`, values);
        setRoles(roles.map(r => (r._id === editingRole._id ? res.data : r)));
        message.success("Role updated");
      } else {
        // Create role
        const res = await api.post("/roles", values);
        setRoles([...roles, res.data]);
        message.success("Role created");
      }
      closeModal();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Operation failed");
    }
  };

  const deleteRole = async (id) => {
    try {
      await api.delete(`/roles/${id}`);
      setRoles(roles.filter(r => r._id !== id));
      message.success("Role deleted");
    } catch (err) {
      console.error(err);
      message.error("Failed to delete role");
    }
  };

  const columns = [
    { title: "Role Name", dataIndex: "role", key: "role" },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (perms) => perms.join(", "),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={() => openModal(record)}>Edit</Button>
          <Button danger onClick={() => deleteRole(record._id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const cardStyle = {
    background: isDark ? "#1f2940" : "#fff",
    color: isDark ? "#fff" : "#000",
  };

  return (
    <AdminLayout>
      <Card
        title="Role & Permission Management"
        style={cardStyle}
        extra={<Button onClick={() => openModal()}>Add Role</Button>}
      >
        <Table
          dataSource={roles}
          columns={columns}
          pagination={{ pageSize: 5 }}
          rowKey="_id"
          rowClassName={() => (isDark ? "dark-row" : "")}
        />
      </Card>

      <Modal
        title={editingRole ? "Edit Role" : "Add Role"}
        open={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Role Name"
            name="role"
            rules={[{ required: true, message: "Please input role name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Permissions" name="permissions">
            <Checkbox.Group
              options={[
                "All Access",
                "Society Config",
                "Residents",
                "Notices",
                "Reports",
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
