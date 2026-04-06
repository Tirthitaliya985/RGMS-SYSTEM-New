import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Tag,
  Typography,
  message,
  Descriptions,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
} from "@ant-design/icons";
import SocietyLayout from "@/components/Layout/SocietyLayout";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import api from "@/api/api";

export default function SocietyProfile() {
  const { user, token, signIn } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!user) return;
    form.setFieldsValue({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "society",
      password: "",
    });
  }, [user, form]);

  const handleSave = async (values) => {
    try {
      setLoading(true);
      const payload = {
        username: values.username,
        email: values.email,
        phone: values.phone || null,
      };
      if (values.password) payload.password = values.password;

      const res = await api.put("/auth/me", payload);
      const updatedUser = res.data?.data;
      const authToken = token || localStorage.getItem("token");
      signIn(updatedUser, authToken);
      form.setFieldValue("password", "");
      setEditMode(false);
      message.success("Profile updated");
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials = String(user?.username || "S")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const profileName = user?.username || "Society Admin";
  const profileRole = String(user?.role || "society").toUpperCase();

  const cardStyle = {
    borderRadius: 16,
    border: isDark ? "1px solid rgba(148, 163, 184, 0.22)" : "1px solid #dbeafe",
    boxShadow: isDark
      ? "0 12px 26px rgba(0, 0, 0, 0.35)"
      : "0 12px 26px rgba(15, 23, 42, 0.08)",
  };

  const heroCardStyle = {
    ...cardStyle,
    background: isDark
      ? "linear-gradient(130deg, #1b2a45 0%, #1f3d61 100%)"
      : "linear-gradient(130deg, #f8fbff 0%, #e9f4ff 100%)",
  };

  const metaText = {
    color: isDark ? "#dbeafe" : "#0f172a",
  };

  const secondaryText = {
    color: isDark ? "#cbd5e1" : "#475569",
  };

  return (
    <SocietyLayout>
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Card style={heroCardStyle} styles={{ body: { padding: "20px 24px" } }}>
          <Row justify="space-between" align="middle" gutter={[12, 12]}>
            <Col style={{ minWidth: 0 }}>
              <Space size={14} align="center" wrap>
                <Avatar size={72} style={{ background: "#0891b2", fontSize: 24 }}>
                  {initials}
                </Avatar>
                <Space direction="vertical" size={2}>
                  <Typography.Title
                    level={4}
                    style={{ margin: 0, ...metaText }}
                  >
                    {profileName}
                  </Typography.Title>
                  <Typography.Text style={secondaryText}>
                    Manage your society account details and contact information
                  </Typography.Text>
                  <Tag color="cyan" icon={<SafetyOutlined />} style={{ width: "fit-content" }}>
                    {profileRole}
                  </Tag>
                </Space>
              </Space>
            </Col>

            <Col>
              {editMode ? (
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                    loading={loading}
                  >
                    Save Changes
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setEditMode(false);
                      form.setFieldValue("password", "");
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              ) : (
                <Button type="primary" icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              )}
            </Col>
          </Row>
        </Card>

      <Row gutter={[18, 18]}>
        <Col xs={24} lg={8}>
          <Card style={cardStyle} styles={{ body: { padding: "18px 20px" } }}>
            <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
              <Avatar size={88} style={{ margin: "0 auto", background: "#0891b2", fontSize: 28 }}>
                {initials}
              </Avatar>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {profileName}
              </Typography.Title>
              <Tag color="cyan" icon={<SafetyOutlined />}>
                {profileRole}
              </Tag>
              <Divider style={{ margin: "10px 0" }} />
              <Descriptions
                column={1}
                size="small"
                labelStyle={{ color: isDark ? "#94a3b8" : "#64748b", width: 90 }}
                contentStyle={{ color: isDark ? "#f8fafc" : "#0f172a" }}
              >
                <Descriptions.Item label="Email">
                  <Space size={6}>
                    <MailOutlined />
                    <Typography.Text ellipsis style={{ maxWidth: 180 }}>
                      {user?.email || "-"}
                    </Typography.Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <Space size={6}>
                    <PhoneOutlined />
                    <Typography.Text>{user?.phone || "-"}</Typography.Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Mode">
                  <Tag color={editMode ? "gold" : "blue"}>
                    {editMode ? "Edit Mode" : "View Mode"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Profile Details"
            style={cardStyle}
            styles={{ body: { padding: "18px 20px" } }}
            extra={
              <Typography.Text type="secondary">
                Keep your details updated for notifications and access.
              </Typography.Text>
            }
          >
            <Form form={form} layout="vertical" onFinish={handleSave} className="admin-profile-theme">
              <Row gutter={[16, 8]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Username is required" }]}
                  >
                    <Input
                      disabled={!editMode}
                      prefix={<UserOutlined />}
                      placeholder="Enter username"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Email is required" },
                      { type: "email", message: "Enter a valid email" },
                    ]}
                  >
                    <Input
                      disabled={!editMode}
                      prefix={<MailOutlined />}
                      placeholder="name@example.com"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[
                      { required: true, message: "Phone is required" },
                      { pattern: /^[0-9]{10,15}$/, message: "Enter valid phone number" },
                    ]}
                  >
                    <Input
                      disabled={!editMode}
                      maxLength={15}
                      prefix={<PhoneOutlined />}
                      placeholder="Enter phone number"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="role" label="Role">
                    <Input disabled prefix={<SafetyOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              {editMode && (
                <Form.Item
                  name="password"
                  label="New Password"
                  rules={[{ min: 6, message: "Minimum 6 characters" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Leave empty to keep current password"
                  />
                </Form.Item>
              )}

            </Form>
          </Card>
        </Col>
      </Row>
      </Space>
    </SocietyLayout>
  );
}
