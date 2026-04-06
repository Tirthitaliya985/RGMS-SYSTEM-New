import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ApartmentOutlined,
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/Layout/AdminLayout";
import api from "@/api/api";
import { useTheme } from "@/context/ThemeContext";

const { Title, Text } = Typography;

export default function SocietyAdminManagement() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [form] = Form.useForm();

  const [societyAdmins, setSocietyAdmins] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const societyMap = useMemo(() => {
    return societies.reduce((acc, item) => {
      acc[item._id] = item.name;
      return acc;
    }, {});
  }, [societies]);

  const filteredAdmins = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return societyAdmins;

    return societyAdmins.filter((admin) => {
      const name = String(admin.username || "").toLowerCase();
      const email = String(admin.email || "").toLowerCase();
      const phone = String(admin.phone || "").toLowerCase();
      const society = String(societyMap[admin.societyId] || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || society.includes(q);
    });
  }, [searchText, societyAdmins, societyMap]);

  const assignedSocieties = useMemo(() => {
    return new Set(societyAdmins.map((admin) => String(admin.societyId || ""))).size;
  }, [societyAdmins]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [adminsRes, societiesRes] = await Promise.all([
        api.get("/admins?role=society"),
        api.get("/societies"),
      ]);
      setSocietyAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
      setSocieties(Array.isArray(societiesRes.data) ? societiesRes.data : []);
    } catch (err) {
      console.error("Failed to load society admin data", err);
      setError(err?.response?.data?.message || "Failed to load society admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (admin = null) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
    if (admin) {
      form.setFieldsValue({
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        societyId: admin.societyId,
        password: "",
      });
      return;
    }
    form.resetFields();
  };

  const closeModal = () => {
    setEditingAdmin(null);
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        username: values.username,
        email: values.email,
        phone: values.phone ? String(values.phone).trim() : null,
        role: "society",
        societyId: values.societyId,
      };

      if (values.password) payload.password = values.password;

      if (editingAdmin) {
        const res = await api.put(`/admins/${editingAdmin._id}`, payload);
        setSocietyAdmins((prev) =>
          prev.map((item) => (item._id === editingAdmin._id ? res.data : item))
        );
        message.success("Society admin updated");
      } else {
        const res = await api.post("/admins", payload);
        setSocietyAdmins((prev) => [res.data, ...prev]);
        message.success("Society admin created");
      }

      closeModal();
    } catch (err) {
      message.error(err?.response?.data?.message || "Could not save society admin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admins/${id}`);
      setSocietyAdmins((prev) => prev.filter((item) => item._id !== id));
      message.success("Society admin deleted");
    } catch (err) {
      message.error(err?.response?.data?.message || "Could not delete society admin.");
    }
  };

  const cardStyle = {
    borderRadius: 18,
    border: isDark ? "1px solid rgba(148,163,184,0.24)" : "1px solid #dbeafe",
    boxShadow: isDark
      ? "0 14px 28px rgba(2, 6, 23, 0.45)"
      : "0 12px 26px rgba(14, 116, 144, 0.1)",
  };

  const columns = [
    {
      title: "Admin",
      dataIndex: "username",
      key: "username",
      render: (value) => (
        <Space>
          <Avatar style={{ background: "#0891b2" }}>
            {String(value || "S").charAt(0).toUpperCase()}
          </Avatar>
          <Text strong>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value) => (
        <Space>
          <MailOutlined />
          <span>{value}</span>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (value) => (
        <Space>
          <PhoneOutlined />
          <span>{value || "-"}</span>
        </Space>
      ),
    },
    {
      title: "Society",
      dataIndex: "societyId",
      key: "societyId",
      render: (societyId) => (
        <Tag color="cyan">{societyMap[societyId] || "Unassigned"}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="Delete this society admin?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Card
        bordered={false}
        style={{
          ...cardStyle,
          marginBottom: 16,
          background: isDark
            ? "radial-gradient(circle at top left, #0f766e, #0f172a 62%)"
            : "radial-gradient(circle at top left, #cffafe, #eff6ff 60%)",
        }}
      >
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ margin: 0, color: isDark ? "#f8fafc" : "#0f172a" }}>
                Society Admin Management
              </Title>
              <Text style={{ color: isDark ? "#cbd5e1" : "#334155" }}>
                Create, update and remove society admins from one place.
              </Text>
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Add Society Admin
            </Button>
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="Could not load management data"
          description={error}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card style={cardStyle}>
            <Statistic
              title="Society Admins"
              value={societyAdmins.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={cardStyle}>
            <Statistic
              title="Societies Assigned"
              value={assignedSocieties}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={cardStyle}>
            <Statistic
              title="Search Result"
              value={filteredAdmins.length}
              prefix={<CrownOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={cardStyle}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }} gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Input
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              placeholder="Search by name, email, phone or society"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </Col>
        </Row>

        <Table
          rowKey="_id"
          dataSource={filteredAdmins}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 6 }}
          locale={{ emptyText: "No society admins found" }}
        />
      </Card>

      <Modal
        title={editingAdmin ? "Update Society Admin" : "Create Society Admin"}
        open={isModalOpen}
        onCancel={closeModal}
        confirmLoading={submitting}
        onOk={() => form.submit()}
        okText={editingAdmin ? "Update" : "Create"}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Username is required" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              { required: true, message: "Phone is required" },
              { pattern: /^[0-9]{10,15}$/, message: "Enter a valid phone number" },
            ]}
          >
            <Input placeholder="Enter phone number" maxLength={15} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={
              editingAdmin
                ? []
                : [{ required: true, message: "Password is required for new admin" }]
            }
          >
            <Input.Password placeholder={editingAdmin ? "Leave blank to keep unchanged" : "Set password"} />
          </Form.Item>

          <Form.Item
            label="Society"
            name="societyId"
            rules={[{ required: true, message: "Select a society" }]}
          >
            <Select
              showSearch
              placeholder="Select society"
              optionFilterProp="label"
              options={societies.map((society) => ({
                value: society._id,
                label: society.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
