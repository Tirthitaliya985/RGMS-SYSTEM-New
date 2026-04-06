import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Upload,
  Avatar,
  Row,
  Col,
  Popconfirm,
  Space,
  Badge,
  Pagination,
} from "antd";
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import api from "@/api/api";
import io from "socket.io-client";

const { Option } = Select;
const socket = io("http://localhost:5000"); // your socket server

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [preview, setPreview] = useState("");
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const selectedRole = Form.useWatch("role", form);

  /* ================= FETCH STAFF ================= */
  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff");
      setStaff(res.data);
      setFilteredStaff(res.data);
    } catch {
      message.error("Failed to fetch staff");
    }
  };

  useEffect(() => {
    fetchStaff();

    // Socket events for real-time updates
    socket.on("staffCreated", (data) => setStaff((prev) => [data, ...prev]));
    socket.on("staffUpdated", (data) =>
      setStaff((prev) => prev.map((s) => (s._id === data._id ? data : s)))
    );
    socket.on("staffDeleted", (id) =>
      setStaff((prev) => prev.filter((s) => s._id !== id))
    );

    return () => {
      socket.off("staffCreated");
      socket.off("staffUpdated");
      socket.off("staffDeleted");
    };
  }, []);

  /* ================= FILTER & SEARCH ================= */
  useEffect(() => {
    let data = [...staff];
    if (searchText)
      data = data.filter((s) =>
        s.name.toLowerCase().includes(searchText.toLowerCase())
      );
    if (roleFilter) data = data.filter((s) => s.role === roleFilter);
    if (statusFilter) data = data.filter((s) => s.status === statusFilter);
    setFilteredStaff(data);
    setCurrentPage(1);
  }, [searchText, roleFilter, statusFilter, staff]);

  /* ================= MODAL ================= */
  const openModal = (record = null) => {
    setEditing(record);
    setOpen(true);
    if (record) {
      form.setFieldsValue({
        ...record,
        joiningDate: record.joiningDate
          ? record.joiningDate.split("T")[0]
          : null,
      });
      setPreview(record.photo || "");
      setFileList([]);
    } else {
      form.resetFields();
      setPreview("");
      setFileList([]);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (values.role !== "guard") {
        delete values.password;
      }
      if (editing && !values.password) {
        delete values.password;
      }

      if (fileList.length > 0) {
        const formData = new FormData();
        formData.append("photo", fileList[0]);
        const photoRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        values.photo = photoRes.data.url;
      } else if (preview) values.photo = preview;

      if (editing) await api.put(`/staff/${editing._id}`, values);
      else await api.post("/staff", values);

      setOpen(false);
      form.resetFields();
      setEditing(null);
      setFileList([]);
      setPreview("");
      fetchStaff();
      message.success("Saved successfully");
    } catch {
      message.error("Error saving staff");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/staff/${id}`);
      setStaff((prev) => prev.filter((s) => s._id !== id));
      message.success("Deleted successfully");
    } catch {
      message.error("Delete failed");
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setFileList([file]);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      return false;
    },
    fileList: fileList.map((file) => ({
      uid: file.uid || file.name,
      name: file.name,
      status: "done",
    })),
    onRemove: () => {
      setFileList([]);
      setPreview("");
    },
  };

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      {/* Search & Filters */}
      <Space style={{ marginBottom: 20, flexWrap: "wrap" }}>
        <Input
          placeholder="Search by name"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ minWidth: 200 }}
        />
        <Select
          placeholder="Filter by role"
          value={roleFilter}
          onChange={setRoleFilter}
          allowClear
          style={{ width: 150 }}
        >
          <Option value="guard">guard</Option>
          <Option value="cleaner">cleaner</Option>
          <Option value="manager">manager</Option>
          <Option value="electrician">electrician</Option>
          <Option value="plumber">plumber</Option>
          <Option value="other">other</Option>
        </Select>
        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          style={{ width: 150 }}
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
        <Button type="primary" onClick={() => openModal()}>
          <PlusOutlined /> Add Staff
        </Button>
      </Space>

      {/* Staff Grid */}
      <Row gutter={[16, 16]}>
        {paginatedStaff.map((s) => (
          <Col xs={24} sm={12} md={8} lg={6} key={s._id}>
            <Card
              hoverable
              cover={
                <Avatar
                  src={s.photo}
                  size={120}
                  style={{ margin: "20px auto" }}
                />
              }
              actions={[
                <EditOutlined key="edit" onClick={() => openModal(s)} />,
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(s._id)}>
                  <DeleteOutlined style={{ color: "red" }} />
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={
                  <div>
                    {s.name}{" "}
                    <Badge
                      color={s.status === "active" ? "green" : "red"}
                      text={s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    />
                  </div>
                }
                description={
                  <>
                    <div>
                      Role:{" "}
                      <Badge
                        color={
                          s.role === "guard"
                            ? "blue"
                            : s.role === "manager"
                            ? "purple"
                            : s.role === "cleaner"
                            ? "orange"
                            : "grey"
                        }
                        text={s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                      />
                    </div>
                    <div>Phone: {s.phone || "-"}</div>
                    <div>Salary: ₹{s.salaryPerMonth || "-"}</div>
                    <div>
                      Joining:{" "}
                      {s.joiningDate
                        ? new Date(s.joiningDate).toLocaleDateString()
                        : "-"}
                    </div>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredStaff.length}
          onChange={setCurrentPage}
          showSizeChanger={false}
        />
      </div>

      {/* Modal for Add/Edit */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleOk}
        title={editing ? "Edit Staff" : "Add Staff"}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if (changedValues.role && changedValues.role !== "guard") {
              form.setFieldValue("password", undefined);
            }
          }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Option value="guard">Guard</Option>
              <Option value="cleaner">Cleaner</Option>
              <Option value="manager">Manager</Option>
              <Option value="electrician">Electrician</Option>
              <Option value="plumber">Plumber</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          {selectedRole === "guard" && (
            <Form.Item
              name="password"
              label="Guard Password"
              rules={[
                {
                  required: !editing,
                  message: "Password is required for guard",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
              ]}
              extra={editing ? "Leave blank to keep current password" : undefined}
            >
              <Input.Password placeholder="Enter guard login password" />
            </Form.Item>
          )}
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item name="salaryPerMonth" label="Salary (per month)">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="joiningDate" label="Joining Date">
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Photo">
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
            {preview && (
              <Avatar src={preview} size={80} style={{ marginTop: 10 }} />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
