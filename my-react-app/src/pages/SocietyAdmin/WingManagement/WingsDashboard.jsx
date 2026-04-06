import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Input,
  message,
  Modal,
  Form,
  InputNumber,
  Divider,
} from "antd";
import { UserOutlined, ApartmentOutlined, HomeOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";

export default function WingsDashboard() {
  const { user } = useAuth();
  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWing, setEditingWing] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Fetch wings on mount
  useEffect(() => {
    const fetchWings = async () => {
      try {
        if (!user?.societyId) return;
        const res = await api.get("/wings");
        setWings(res.data.data || []);
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch wings");
      }
    };
    fetchWings();
  }, [user?.societyId]);

  // Delete wing
  const handleDelete = async (id) => {
    try {
      await api.delete(`/wings/${id}`);
      setWings(prev => prev.filter(w => w._id !== id)); // instant remove
      message.success("Wing deleted");
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    }
  };

  // Open modal
  const openModal = (wing = null) => {
    setEditingWing(wing);
    form.setFieldsValue({
      wingName: wing?.wing || "",
      code: wing?.code || "",
      totalFloors: wing?.totalFloors || 1,
      totalFlats: wing?.totalFlats || 1,
      adminName: wing?.admin?.name || "",
      adminPhone: wing?.admin?.phone || "",
      adminEmail: wing?.admin?.email || "",
      adminPassword: "",
    });
    setModalVisible(true);
  };

  // Submit create/edit
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let wingId = editingWing?._id;

      if (editingWing) {
        // Update wing
        await api.put(`/wings/${wingId}`, {
          wing: values.wingName,
          code: values.code,
          totalFloors: values.totalFloors,
          totalFlats: values.totalFlats,
        });

        let updatedAdmin = null;

        if (editingWing.admin?._id) {
          // Update existing admin
          const res = await api.put(`/wings/admins/${editingWing.admin._id}`, {
            name: values.adminName,
            email: values.adminEmail,
            phone: values.adminPhone,
            ...(values.adminPassword ? { password: values.adminPassword } : {}),
          });
          updatedAdmin = { ...editingWing.admin, name: res.data.data.name, email: res.data.data.email, phone: res.data.data.phone };
        } else if (values.adminName && values.adminEmail && values.adminPassword) {
          // Create new admin
          const res = await api.post("/wings/admins", {
            name: values.adminName,
            email: values.adminEmail,
            password: values.adminPassword,
            wing: wingId,
          });
          updatedAdmin = { _id: res.data.data._id, name: res.data.data.name, email: res.data.data.email, phone: res.data.data.phone };
        }

        // Update local wings state
        setWings(prev =>
          prev.map(w =>
            w._id === wingId
              ? { ...w, wing: values.wingName, code: values.code, totalFloors: values.totalFloors, totalFlats: values.totalFlats, admin: updatedAdmin || w.admin }
              : w
          )
        );

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

        let adminData = null;
        if (values.adminName && values.adminEmail && values.adminPassword) {
          const adminRes = await api.post("/wings/admins", {
            name: values.adminName,
            email: values.adminEmail,
            phone: values.adminPhone,
            password: values.adminPassword,
            wing: wingId,
          });
          adminData = { _id: adminRes.data.data._id, name: adminRes.data.data.name, email: adminRes.data.data.email, phone: adminRes.data.data.phone };
        }

        const newWing = {
          _id: wingId,
          wing: values.wingName,
          code: values.code,
          totalFloors: values.totalFloors,
          totalFlats: values.totalFlats,
          admin: adminData,
        };

        setWings(prev => [newWing, ...prev]);
        message.success("Wing and Admin created successfully");
      }

      form.resetFields();
      setModalVisible(false);
      setEditingWing(null);
    } catch (err) {
      console.error(err);
      message.error("Operation failed");
    }
    setLoading(false);
  };

  // Filtered wings
  const filteredWings = wings.filter(
    w =>
      w.wing.toLowerCase().includes(searchText.toLowerCase()) ||
      w.code.toLowerCase().includes(searchText.toLowerCase()) ||
      w.admin?.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const badgeColor = num => (num >= 10 ? "green" : num >= 5 ? "yellow" : "red");

  return (
    <>
      <Input
        placeholder="Search Wing, Code, or Admin..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Button type="primary" style={{ marginBottom: 16, marginLeft: 8 }} onClick={() => openModal()}>
        Add Wing
      </Button>

      <Row gutter={[16, 16]}>
        <AnimatePresence>
          {filteredWings.map(wing => (
            <Col xs={24} sm={12} md={8} lg={6} key={wing._id}>
              <motion.div
                layout
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  hoverable
                  style={{ cursor: "pointer", borderRadius: 10, boxShadow: "0 6px 12px rgba(0,0,0,0.1)" }}
                  title={
                    <>
                      {wing.wing} ({wing.code})
                      <Badge
                        style={{ marginLeft: 8 }}
                        color={wing.admin ? "green" : "red"}
                        text={wing.admin ? wing.admin.name : "No Admin"}
                      />
                    </>
                  }
                  actions={[
                    <Button size="small" onClick={() => openModal(wing)}>Edit</Button>,
                    <Button danger size="small" onClick={() => handleDelete(wing._id)}>Delete</Button>,
                  ]}
                >
                  <p><ApartmentOutlined /> Floors: <Badge color={badgeColor(wing.totalFloors)} text={wing.totalFloors} /></p>
                  <p><HomeOutlined /> Flats: <Badge color={badgeColor(wing.totalFlats)} text={wing.totalFlats} /></p>
                  <p><UserOutlined /> Admin: {wing.admin?.name || "N/A"}</p>
                  <p>Total Units: {wing.totalFloors * wing.totalFlats}</p>
                  <p>Wing Code: {wing.code}</p>
                </Card>
              </motion.div>
            </Col>
          ))}
        </AnimatePresence>
      </Row>

      <Modal
        open={modalVisible}
        title={editingWing ? "Edit Wing" : "Add Wing"}
        onCancel={() => { setModalVisible(false); setEditingWing(null); form.resetFields(); }}
        footer={null}
        centered
        destroyOnHidden
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
          <Form.Item name="totalFlats" label="Total Flats on floor" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Total number of flats in the one floor" />
          </Form.Item>

          <Divider orientation="left">Wing Admin (Optional)</Divider>
          <Form.Item name="adminName" label="Name"><Input placeholder="John Doe" /></Form.Item>
          <Form.Item name="adminEmail" label="Email"><Input placeholder="admin@example.com" type="email" /></Form.Item>
          <Form.Item name="adminPhone" label="Phone"><Input placeholder="1234567890" /></Form.Item>
          <Form.Item name="adminPassword" label="Password"><Input.Password placeholder="Leave blank to keep current" /></Form.Item>

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
