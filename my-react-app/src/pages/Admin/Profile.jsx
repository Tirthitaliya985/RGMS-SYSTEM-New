import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Avatar,
  Row,
  Col,
  Divider,
  Tag,
  Typography,
  Space,
} from "antd";
import { MailOutlined, SafetyOutlined, UserOutlined } from "@ant-design/icons";
import AdminLayout from "@/components/Layout/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import api from "@/api/api";

export default function Profile() {
  const { user, signIn } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const { Title, Text } = Typography;

  const styles = {
    shellCard: {
      maxWidth: 1080,
      margin: "0 auto",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: isDark
        ? "0 20px 52px rgba(2, 6, 23, 0.6)"
        : "0 18px 45px rgba(24, 39, 75, 0.12)",
      background: isDark ? "#0b1220" : "#ffffff",
      border: isDark ? "1px solid rgba(148, 163, 184, 0.2)" : "none",
    },
    header: {
      padding: "30px 28px",
      background: isDark
        ? "linear-gradient(135deg, #064e3b, #0c4a6e 58%, #1d4ed8)"
        : "linear-gradient(135deg, #0f766e, #0284c7 55%, #2563eb)",
      color: "#fff",
    },
    contentArea: {
      padding: 24,
      background: isDark ? "linear-gradient(180deg, #020617, #0f172a 55%, #0b1220)" : "#f8fbff",
    },
    profileCard: {
      borderRadius: 16,
      background: isDark
        ? "linear-gradient(165deg, #111827, #1e293b)"
        : "linear-gradient(165deg, #ffffff, #f0f9ff)",
      boxShadow: isDark
        ? "inset 0 0 0 1px rgba(56, 189, 248, 0.2)"
        : "inset 0 0 0 1px rgba(2, 132, 199, 0.08)",
    },
    formCard: {
      borderRadius: 16,
      background: isDark ? "#111827" : "#fff",
      boxShadow: isDark ? "inset 0 0 0 1px rgba(148, 163, 184, 0.2)" : "inset 0 0 0 1px #eef2ff",
    },
    primaryText: { color: isDark ? "#e2e8f0" : "#111827" },
    secondaryText: { color: isDark ? "#94a3b8" : "#4b5563" },
    divider: { borderColor: isDark ? "rgba(148, 163, 184, 0.22)" : "#e5e7eb" },
    icon: { color: isDark ? "#38bdf8" : "#0284c7" },
    input: {
      backgroundColor: isDark ? "#0f172a" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#111827",
      borderColor: isDark ? "#334155" : "#d1d5db",
    },
    disabledInput: {
      backgroundColor: isDark ? "#1e293b" : "#f3f4f6",
      color: isDark ? "#94a3b8" : "#6b7280",
      borderColor: isDark ? "#334155" : "#d1d5db",
    },
    ghostButton: {
      backgroundColor: isDark ? "#1e293b" : "#fff",
      borderColor: isDark ? "#334155" : "#d1d5db",
      color: isDark ? "#e2e8f0" : "#111827",
    },
  };

  const inputStyle = (disabled) => (disabled ? styles.disabledInput : styles.input);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const res = await api.put(`/admins/${user.id}`, values);
      signIn(res.data);
      message.success("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.username
    ? user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "A";

  return (
    <AdminLayout>
      <div className="page-glass-wrap admin-profile-theme">
        <Card
          bordered={false}
          style={styles.shellCard}
          bodyStyle={{ padding: 0 }}
        >
          <div style={styles.header}>
            <Space direction="vertical" size={6}>
              <Title level={3} style={{ color: "#fff", margin: 0 }}>
                Profile Studio
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                Manage your account details and keep your admin credentials up to date.
              </Text>
            </Space>
          </div>

          <div style={styles.contentArea}>
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={9}>
                <Card
                  bordered={false}
                  style={styles.profileCard}
                  bodyStyle={{ padding: 24 }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Avatar
                      size={92}
                      style={{
                        backgroundColor: "#0ea5e9",
                        fontSize: 28,
                        fontWeight: 700,
                        boxShadow: "0 12px 30px rgba(14, 165, 233, 0.35)",
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Title level={4} style={{ marginTop: 14, marginBottom: 6, ...styles.primaryText }}>
                      {user?.username || "Admin User"}
                    </Title>
                    <Tag color={isDark ? "cyan" : "blue"} icon={<SafetyOutlined />}>
                      {user?.role || "Administrator"}
                    </Tag>
                  </div>

                  <Divider style={{ margin: "18px 0", ...styles.divider }} />

                  <Space direction="vertical" size={14} style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <MailOutlined style={styles.icon} />
                      <Text style={styles.primaryText}>{user?.email || "No email available"}</Text>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <UserOutlined style={styles.icon} />
                      <Text strong style={styles.primaryText}>
                        {editMode ? "Edit Mode Enabled" : "View Mode Enabled"}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={15}>
                <Card
                  bordered={false}
                  style={styles.formCard}
                  bodyStyle={{ padding: 24 }}
                >
                  <Title level={4} style={{ marginBottom: 4, ...styles.primaryText }}>
                    Account Details
                  </Title>
                  <Text style={styles.secondaryText}>Update your personal and login information.</Text>

                  <Divider style={{ margin: "16px 0 18px", ...styles.divider }} />

                  <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<span style={styles.primaryText}>Username</span>}
                          name="username"
                          rules={[{ required: true, message: "Please enter your username" }]}
                        >
                          <Input
                            placeholder="Username"
                            disabled={!editMode}
                            size="large"
                            style={inputStyle(!editMode)}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<span style={styles.primaryText}>Email</span>}
                          name="email"
                          rules={[
                            { required: true, message: "Please enter your email" },
                            { type: "email", message: "Please enter a valid email" },
                          ]}
                        >
                          <Input
                            placeholder="Email"
                            disabled={!editMode}
                            size="large"
                            style={inputStyle(!editMode)}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item label={<span style={styles.primaryText}>Role</span>} name="role">
                          <Input disabled size="large" style={styles.disabledInput} />
                        </Form.Item>
                      </Col>
                    </Row>

                    {editMode && (
                      <Form.Item label={<span style={styles.primaryText}>New Password</span>} name="password">
                        <Input.Password
                          placeholder="Leave blank if unchanged"
                          size="large"
                          style={styles.input}
                        />
                      </Form.Item>
                    )}

                    <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                      {editMode ? (
                        <Space wrap>
                          <Button type="primary" htmlType="submit" loading={loading} size="large">
                            Save Changes
                          </Button>
                          <Button onClick={() => setEditMode(false)} size="large" style={styles.ghostButton}>
                            Cancel
                          </Button>
                        </Space>
                      ) : (
                        <Button
                          type="default"
                          onClick={() => setEditMode(true)}
                          size="large"
                          style={styles.ghostButton}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
