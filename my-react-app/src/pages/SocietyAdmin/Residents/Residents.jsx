import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import SocietyLayout from "../../../components/Layout/SocietyLayout";
import api from "../../../api/api";
import io from "socket.io-client";

const { Option } = Select;
const socket = io("http://localhost:5000");

export default function Residents() {
  const [residents, setResidents] = useState([]);
  const [wings, setWings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [form] = Form.useForm();
  const selectedWing = Form.useWatch("wing", form);

  // Fetch residents and wings
  useEffect(() => {
    fetchWings();
    fetchResidents();

    socket.on("residentCreated", (res) =>
      setResidents((prev) => [res, ...prev]),
    );
    socket.on("residentUpdated", (updated) =>
      setResidents((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r)),
      ),
    );
    socket.on("residentDeleted", (id) =>
      setResidents((prev) => prev.filter((r) => r._id !== id)),
    );
    socket.on("residentRestored", (res) =>
      setResidents((prev) => [res, ...prev]),
    );

    return () => {
      socket.off("residentCreated");
      socket.off("residentUpdated");
      socket.off("residentDeleted");
      socket.off("residentRestored");
    };
  }, []);

  const fetchWings = async () => {
    try {
      const res = await api.get("/wings");
      setWings(res.data.data || []);
    } catch (err) {
      message.error("Failed to load wings");
    }
  };

  const fetchResidents = async () => {
    try {
      const res = await api.get("/society/residents"); // backend should populate wing
      setResidents(res.data);
    } catch (err) {
      message.error("Failed to load residents");
    }
  };

  const openModal = (resident = null) => {
    setEditingResident(resident);
    setIsModalOpen(true);

    if (resident) {
      // Populate wing object if populated
      form.setFieldsValue({
        ownerName: resident.ownerName,
        email: resident.email,
        phone: resident.phone,
        wing: resident.wing?._id || resident.wing,
        flatNo: resident.flatNo,
        status: resident.status,
      });
    } else {
      form.resetFields();
    }
  };

  const closeModal = () => {
    setEditingResident(null);
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingResident) {
        await api.put(`/society/residents/${editingResident._id}`, values);
        message.success("Resident updated");
      } else {
        await api.post("/society/residents", values);
        message.success("Resident created");
      }
      closeModal();
    } catch (err) {
      message.error(
        err.response?.data?.message ||
          "Operation failed (maybe duplicate flat)",
      );
    }
  };

  const deleteResident = async (id) => {
    try {
      await api.delete(`/society/residents/${id}`);
      message.success("Resident deleted");
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const restoreResident = async (id) => {
    try {
      await api.put(`/society/residents/restore/${id}`);
      message.success("Resident restored");
    } catch (err) {
      message.error("Restore failed");
    }
  };

  // Generate available flat numbers for selected wing
  const getAvailableFlats = (wingId) => {
    const wing = wings.find((w) => w._id === wingId);
    if (!wing) return [];

    const occupiedFlats = residents
      .filter(
        (r) =>
          r.wing?._id === wingId &&
          !r.isDeleted &&
          r._id !== editingResident?._id,
      )
      .map((r) => r.flatNo);

    const flats = [];
    for (let floor = 1; floor <= wing.totalFloors; floor++) {
      for (let flat = 1; flat <= wing.totalFlats; flat++) {
        const flatNo = `${floor}${flat.toString().padStart(2, "0")}`;
        if (!occupiedFlats.includes(flatNo)) flats.push(flatNo);
      }
    }
    return flats;
  };

  const columns = [
    { title: "Owner Name", dataIndex: "ownerName" },
    { title: "Contact", dataIndex: "phone" },
    {
      title: "Wing",
      dataIndex: "wing",
      filters: wings.map((w) => ({
        text: `${w.wing} (${w.code})`,
        value: w._id,
      })),
      onFilter: (value, record) => record.wing?._id === value,
      render: (_, r) => (r.wing ? `${r.wing.wing} (${r.wing.code})` : "N/A"),
    },
    { title: "Flat No", dataIndex: "flatNo" },
    { title: "Status", dataIndex: "status" },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="Delete resident?"
            onConfirm={() => deleteResident(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
          {record.isDeleted && (
            <Button onClick={() => restoreResident(record._id)}>Restore</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <SocietyLayout>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Residents</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Add Resident
        </Button>
      </Space>

      <Table dataSource={residents} columns={columns} rowKey="_id" />

      <Modal
        title={editingResident ? "Edit Resident" : "Add Resident"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="ownerName"
            label="Owner Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: !editingResident }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone (+Country Code)"
            rules={[{ required: true }]}
          >
            <Input placeholder="+919876543210" />
          </Form.Item>

          <Form.Item name="wing" label="Wing" rules={[{ required: true }]}>
            <Select
              placeholder="Select Wing"
              onChange={() => form.setFieldsValue({ flatNo: null })}
            >
              {wings.map((w) => (
                <Option key={w._id} value={w._id}>
                  {w.wing} ({w.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="flatNo" label="Flat No" rules={[{ required: true }]}>
            <Select placeholder="Select Flat" disabled={!selectedWing}>
              {getAvailableFlats(selectedWing).map((flat) => (
                <Option key={flat} value={flat}>
                  {flat}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </SocietyLayout>
  );
}
