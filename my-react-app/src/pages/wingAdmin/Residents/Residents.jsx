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
  Tag,
  Upload,
  Row,
  Col,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import api from "@/api/api";
import WingLayout from "@/components/Layout/WingLayout";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Option } = Select;

export default function Residents() {
  const [residents, setResidents] = useState([]);
  const [wingName, setWingName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [form] = Form.useForm();
  const [maintenanceModal, setMaintenanceModal] = useState({ open: false, bills: [] });
  const [searchText, setSearchText] = useState("");

  // ================= FETCH =================
  useEffect(() => {
    fetchResidents();
    fetchWing();
  }, []);

  const fetchResidents = async () => {
    try {
      const res = await api.get("/wing/residents");
      setResidents(res.data.data || []);
    } catch {
      message.error("Failed to load residents");
    }
  };

  const fetchWing = async () => {
    try {
      const res = await api.get("/wing/profile");
      setWingName(res.data.data?.wingName || "Wing");
    } catch {}
  };

  // ================= CRUD =================
  const openModal = (resident = null) => {
    setEditingResident(resident);
    setIsModalOpen(true);
    resident ? form.setFieldsValue(resident) : form.resetFields();
  };

  const closeModal = () => {
    setEditingResident(null);
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingResident) {
        await api.put(`/wing/residents/${editingResident._id}`, values);
        message.success("Resident updated");
      } else {
        await api.post("/wing/residents", values);
        message.success("Resident created");
      }
      closeModal();
      fetchResidents();
    } catch (err) {
      message.error(err.response?.data?.message || "Operation failed");
    }
  };

  const deleteResident = async (id) => {
    await api.delete(`/wing/residents/${id}`);
    message.success("Resident deleted");
    fetchResidents();
  };

  const restoreResident = async (id) => {
    await api.put(`/wing/residents/restore/${id}`);
    message.success("Resident restored");
    fetchResidents();
  };

  // ================= UPLOAD =================
  const uploadProps = (residentId) => ({
    name: "documents",
    multiple: true,
    action: `${api.defaults.baseURL}/wing/residents/${residentId}/documents`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} uploaded`);
      }
    },
  });

  // ================= MAINTENANCE =================
  const viewMaintenance = async (resident) => {
    const res = await api.get(`/wing/residents/maintenance/${resident._id}`);
    setMaintenanceModal({ open: true, bills: res.data.data });
  };

  // ================= EXPORT =================
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(residents);
    XLSX.utils.book_append_sheet(wb, ws, "Residents");
    XLSX.writeFile(wb, "Residents.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Owner", "Phone", "Flat", "Status"]],
      body: residents.map((r) => [
        r.ownerName,
        r.phone,
        r.flatNo,
        r.status,
      ]),
    });
    doc.save("Residents.pdf");
  };

  // ================= TABLE =================
  const columns = [
    {
      title: "",
      render: (_, r) => (
        <Avatar style={{ backgroundColor: "#1677ff" }}>
          {r.ownerName?.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    { title: "Owner", dataIndex: "ownerName" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Flat", dataIndex: "flatNo" },
    {
      title: "Status",
      render: (_, r) =>
        r.overdue ? (
          <Tag color="red">Overdue</Tag>
        ) : (
          <Tag color="green">Active</Tag>
        ),
    },
    {
      title: "Actions",
      render: (_, r) => (
        <Space>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => openModal(r)} />
          <Popconfirm title="Delete?" onConfirm={() => deleteResident(r._id)}>
            <Button danger ghost icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button onClick={() => viewMaintenance(r)}>History</Button>
          <Upload {...uploadProps(r._id)} showUploadList={false}>
            <Button icon={<UploadOutlined />}>Docs</Button>
          </Upload>
        </Space>
      ),
    },
  ];

  const filteredData = residents.filter(
    (r) =>
      r.ownerName?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.flatNo?.includes(searchText)
  );

  // ================= UI =================
  return (
    <WingLayout>
      <div
        className="wing-residents-page"
        style={{ background: "var(--wing-residents-page-bg)", minHeight: "100vh", padding: 24 }}
      >
        
        {/* Gradient Header */}
        <div
          style={{
            background: "var(--wing-residents-hero-bg)",
            padding: 30,
            borderRadius: 20,
            color: "#fff",
            marginBottom: 24,
          }}
        >
          <h1 style={{ margin: 0 }}>{wingName} - Residents</h1>
          <p style={{ opacity: 0.9 }}>Modern SaaS Resident Management</p>
        </div>

        {/* Controls */}
        <Row justify="space-between" style={{ marginBottom: 20 }}>
          <Input
            placeholder="Search residents..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250, borderRadius: 8 }}
          />

          <Space>
            <Button icon={<FileExcelOutlined />} onClick={exportExcel}>
              Excel
            </Button>
            <Button icon={<FilePdfOutlined />} onClick={exportPDF}>
              PDF
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Add Resident
            </Button>
          </Space>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          pagination={{ pageSize: 6 }}
          style={{
            background: "var(--wing-residents-table-bg)",
            borderRadius: 16,
            padding: 16,
          }}
        />

        {/* Add/Edit Modal */}
        <Modal
          title={editingResident ? "Edit Resident" : "Add Resident"}
          open={isModalOpen}
          onCancel={closeModal}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="ownerName" label="Owner Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="flatNo" label="Flat No" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Maintenance Modal */}
        <Modal
          title="Maintenance History"
          open={maintenanceModal.open}
          footer={null}
          width={900}
          onCancel={() => setMaintenanceModal({ open: false, bills: [] })}
        >
          <Table
            dataSource={maintenanceModal.bills}
            rowKey="_id"
            pagination={false}
            scroll={{ y: 400 }}
          />
        </Modal>
      </div>
    </WingLayout>
  );
}
