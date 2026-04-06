import { useState, useEffect } from "react";
import AdminLayout from "../../../components/Layout/AdminLayout";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Switch,
  Card,
  Table,
  message,
  Modal,
  Popconfirm,
  Row,
  Col,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "@/api/api";
import AddressInputWithMap from "@/components/Map/AddressInputWithMap";

export default function SocietyConfig() {
  const [societies, setSocieties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSociety, setEditingSociety] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    const res = await api.get("/societies");
    setSocieties(res.data);
    setFiltered(res.data);
  };

  const handleSearch = (value) => {
    const filteredData = societies.filter((s) =>
      s.name.toLowerCase().includes(value.toLowerCase()),
    );
    setFiltered(filteredData);
  };

  const openModal = (record = null) => {
    setEditingSociety(record);
    setModalOpen(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        amenities: record.amenities?.join(", "),
      });
    } else {
      form.resetFields();
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingSociety) {
        const res = await api.put(`/societies/${editingSociety._id}`, values);
        setSocieties(
          societies.map((s) => (s._id === res.data._id ? res.data : s)),
        );
        message.success("Society updated");
      } else {
        const res = await api.post("/societies", values);
        setSocieties([res.data, ...societies]);
        message.success("Society created");
      }

      setModalOpen(false);
      fetchSocieties();
    } catch (err) {
      message.error(err.response?.data?.message || "Action failed");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await api.delete(`/societies/${id}`);
    message.success("Deleted successfully");
    fetchSocieties();
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Location", dataIndex: "location" },
    { title: "Units", dataIndex: "units" },
    {
      title: "Visitor Rules",
      dataIndex: "visitorRules",
      render: (val) => (val ? "Enabled" : "Disabled"),
    },
    {
      title: "Action",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => openModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this society?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger type="link">
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Card
        title="Society Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add Society
          </Button>
        }
      >
        <Input.Search
          placeholder="Search society"
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 20 }}
        />

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />

        <Modal
          title={editingSociety ? "Edit Society" : "Add Society"}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Society Name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: "Address is required" }]}
                >
                  <AddressInputWithMap
                    // AntD will inject value/onChange automatically
                    onMapLocationChange={({ lat, lng }) => {
                      // fill location field as comma separated coords
                      form.setFieldsValue({ location: `${lat},${lng}` });
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="contact"
                  label="Contact"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="units"
                  label="Units"
                  rules={[{ required: true }]}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="amenities" label="Amenities">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="visitorRules"
                  label="Visitor Rules"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingSociety ? "Update" : "Create"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Card>
    </AdminLayout>
  );
}
