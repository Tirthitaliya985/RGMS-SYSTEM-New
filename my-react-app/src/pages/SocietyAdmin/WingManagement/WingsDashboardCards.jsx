import { Card, Row, Col, Button, message, Badge, Modal, Form, Input, InputNumber, Divider } from "antd";
import { useState, useEffect } from "react";
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";

export default function WingsDashboardCards() {
  const { user } = useAuth();
  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWing, setEditingWing] = useState(null);
  const [form] = Form.useForm();

  // Fetch wings + admins
  const fetchWings = async () => {
    try {
      if (!user?.societyId) return;

      // 1️⃣ Fetch all wings
      const wingsRes = await api.get("/wings");
      const wingsData = wingsRes.data.data || [];

      // 2️⃣ Fetch all admins
      const adminsRes = await api.get("/wings/admins");
      const adminsData = adminsRes.data.data || [];

      // 3️⃣ Map admins to wings
      const wingsWithAdmin = wingsData.map((wing) => {
        const admin = adminsData.find((a) => a.wing === wing._id);
        return { ...wing, admin };
      });

      setWings(wingsWithAdmin);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch wings or admins");
    }
  };

  useEffect(() => {
    fetchWings();
  }, []);

  // Delete wing
  const handleDelete = async (id) => {
    try {
      await api.delete(`/wings/${id}`);
      message.success("Wing deleted");
      fetchWings();
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    }
  };

  // Open modal for Add / Edit
  const openModal = (wing = null) => {
    setEditingWing(wing);
    form.setFieldsValue({
      wingName: wing?.wing || "",
      code: wing?.code || "",
      totalFloors: wing?.totalFloors || 1,
      totalFlats: wing?.totalFlats || 1,
      adminName: wing?.admin?.name || "",
      adminEmail: wing?.admin?.email || "",
      adminPassword: "",
    });
    setModalVisible(true);
  };

  // Add / Edit Submit
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let wingId = editingWing?._id;

      if (editingWing) {
        // Update existing wing
        await api.put(`/wings/${wingId}`, {
          wing: values.wingName,
          code: values.code,
          totalFloors: values.totalFloors,
          totalFlats: values.totalFlats,
        });

        // Update or create admin
        if (editingWing.admin?._id) {
          await api.put(`/wings/admins/${editingWing.admin._id}`, {
            name: values.adminName,
            email: values.adminEmail,
            ...(values.adminPassword ? { password: values.adminPassword } : {}),
            wing: wingId,
          });
        } else if (values.adminName && values.adminEmail && values.adminPassword) {
          await api.post("/wings/admins", {
            name: values.adminName,
            email: values.adminEmail,
            password: values.adminPassword,
            wing: wingId,
          });
        }

        message.success("Wing updated successfully");
      } else {
        // Create new wing
        const wingRes = await api.post("/wings", {
          wing: values.wingName,
          code: values.code,
          totalFloors: values.totalFloors,
          totalFlats: values.totalFlats,
        });

        wingId = wingRes.data.data._id;

        // Create optional admin
        if (values.adminName && values.adminEmail && values.adminPassword) {
          await api.post("/wings/admins", {
            name: values.adminName,
            email: values.adminEmail,
            password: values.adminPassword,
            wing: wingId,
          });
        }

        message.success("Wing and Admin created successfully");
      }

      form.resetFields();
      setModalVisible(false);
      setEditingWing(null);
      fetchWings();
    } catch (err) {
      console.error(err);
      message.error("Operation failed");
    }
    setLoading(false);
  };

  return (
    <>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
        Add Wing
      </Button>

      <Row gutter={[16, 16]}>
        {wings.map((wing) => (
          <Col xs={24} sm={12} md={8} lg={6} key={wing._id}>
            <Card
              title={`${wing.wing} (${wing.code})`}
              extra={
                <Badge
                  status={wing.admin ? "success" : "error"}
                  text={wing.admin ? "Admin Assigned" : "No Admin"}
                />
              }
              actions={[
                <Button size="small" onClick={() => openModal(wing)}>Edit</Button>,
                <Button danger size="small" onClick={() => handleDelete(wing._id)}>Delete</Button>,
              ]}
            >
              <p><b>Floors:</b> {wing.totalFloors}</p>
              <p><b>Flats:</b> {wing.totalFlats}</p>
              <p><b>Wing Admin:</b> {wing.admin?.name || "N/A"}</p>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        open={modalVisible}
        title={editingWing ? "Edit Wing" : "Add Wing"}
        onCancel={() => {
          setModalVisible(false);
          setEditingWing(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Divider orientation="left">Wing Details</Divider>
          <Form.Item name="wingName" label="Wing Name" rules={[{ required: true }]}>
            <Input placeholder="A Wing" />
          </Form.Item>

          <Form.Item name="code" label="Wing Code" rules={[{ required: true }]}>
            <Input placeholder="WA" />
          </Form.Item>

          <Form.Item name="totalFloors" label="Total Floors" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="totalFlats" label="Total Flats" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Divider orientation="left">Wing Admin (Optional)</Divider>
          <Form.Item name="adminName" label="Name">
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item name="adminEmail" label="Email">
            <Input placeholder="admin@example.com" type="email" />
          </Form.Item>

          <Form.Item name="adminPassword" label="Password">
            <Input.Password placeholder="Leave blank to keep current" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {editingWing ? "Update Wing" : "Add Wing"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
