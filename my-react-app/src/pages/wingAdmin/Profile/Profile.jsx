import { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Row,
  Col,
  Form,
  Input,
  Button,
  message,
  Divider,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import api from "@/api/api";
import WingLayout from "@/components/Layout/WingLayout";

export default function WingProfile() {
  const [profile, setProfile] = useState({});
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/wing/profile");
      setProfile(res.data.data);
      form.setFieldsValue(res.data.data);
    } catch {
      message.error("Failed to load profile");
    }
  };

  const updateProfile = async (values) => {
    try {
      await api.put("/wing/profile", values);
      message.success("Profile updated successfully");
      fetchProfile();
    } catch {
      message.error("Update failed");
    }
  };

  const changePassword = async (values) => {
    try {
      await api.put("/wing/profile/change-password", values);
      message.success("Password changed successfully");
      passwordForm.resetFields();
    } catch {
      message.error("Password change failed");
    }
  };

  return (
    <WingLayout>
      <div
        style={{
          minHeight: "100vh",
          padding: 30,
          background: "linear-gradient(120deg, #f6f9fc, #eef2f7)",
        }}
      >
        {/* Animated Gradient Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: "linear-gradient(135deg, #1677ff, #722ed1)",
            padding: 40,
            borderRadius: 24,
            color: "#fff",
            marginBottom: 40,
            boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28 }}>
            {profile?.wingName || "Wing"} Profile
          </h1>
          <p style={{ opacity: 0.9, marginTop: 8 }}>
            Manage your wing account settings & security
          </p>
        </motion.div>

        <Row gutter={30}>
          {/* Animated Profile Card */}
          <Col span={8}>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card
                style={{
                  borderRadius: 24,
                  textAlign: "center",
                  backdropFilter: "blur(20px)",
                  background: "rgba(255,255,255,0.7)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Avatar
                    size={110}
                    style={{
                      background:
                        "linear-gradient(135deg, #1677ff, #722ed1)",
                      fontSize: 40,
                      marginBottom: 20,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    }}
                  >
                    {profile?.wingName?.charAt(0)?.toUpperCase() || "W"}
                  </Avatar>
                </motion.div>

                <h2 style={{ marginBottom: 4 }}>{profile?.wingName}</h2>
                <p style={{ color: "#777" }}>{profile?.email}</p>

                <Divider />

                <p>
                  <strong>Phone:</strong> {profile?.phone || "N/A"}
                </p>
              </Card>
            </motion.div>
          </Col>

          {/* Forms Section */}
          <Col span={16}>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card
                title="Edit Profile"
                style={{
                  borderRadius: 24,
                  boxShadow: "0 15px 35px rgba(0,0,0,0.05)",
                }}
              >
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={updateProfile}
                >
                  <Form.Item
                    name="wingName"
                    label="Wing Name"
                    rules={[{ required: true }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, type: "email" }]}
                  >
                    <Input style={{ borderRadius: 12 }} />
                  </Form.Item>

                  <Form.Item name="phone" label="Phone">
                    <Input style={{ borderRadius: 12 }} />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg, #1677ff, #722ed1)",
                      border: "none",
                      height: 45,
                    }}
                    block
                  >
                    Update Profile
                  </Button>
                </Form>
              </Card>

              <Card
                title="Security Settings"
                style={{
                  borderRadius: 24,
                  marginTop: 30,
                  boxShadow: "0 15px 35px rgba(0,0,0,0.05)",
                }}
              >
                <Form
                  layout="vertical"
                  form={passwordForm}
                  onFinish={changePassword}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[{ required: true }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[{ required: true, min: 6 }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg, #fa541c, #ff7a45)",
                      border: "none",
                      height: 45,
                    }}
                    block
                  >
                    Change Password
                  </Button>
                </Form>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>
    </WingLayout>
  );
}