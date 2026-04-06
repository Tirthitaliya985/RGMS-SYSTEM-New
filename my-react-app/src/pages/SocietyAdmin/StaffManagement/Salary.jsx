import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  Tag,
  message,
  Popconfirm,
  Space,
} from "antd";
import { useState, useEffect } from "react";
import api from "@/api/api";

export default function Salary() {
  const [salary, setSalary] = useState([]);
  const [staff, setStaff] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // Fetch salaries
  const fetchSalary = async () => {
    try {
      const res = await api.get("/salary");
      setSalary(res.data);
    } catch {
      message.error("Failed to fetch salaries");
    }
  };

  // Fetch staff
  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff");
      setStaff(res.data);
    } catch {
      message.error("Failed to fetch staff");
    }
  };

  useEffect(() => {
    fetchSalary();
    fetchStaff();
  }, []);

  // Open modal for add/edit
  const openModal = (record = null) => {
    setEditing(record);
    setModal(true);

    if (record) {
      form.setFieldsValue({
        staff: record.staff._id,
        basicSalary: record.basicSalary,
        bonus: record.bonus,
        deduction: record.deduction,
        paymentStatus: record.paymentStatus,
        month: record.month,
        year: record.year,
      });
    } else {
      form.resetFields();
    }
  };

  // Submit salary (manual edit)
  const submitSalary = async () => {
    try {
      const values = await form.validateFields();
      values.totalPaid =
        (values.basicSalary || 0) + (values.bonus || 0) - (values.deduction || 0);

      if (editing) {
        await api.put(`/salary/${editing._id}`, values);
        message.success("Salary updated");
      } else {
        await api.post("/salary", values);
        message.success("Salary added");
      }

      setModal(false);
      setEditing(null);
      form.resetFields();
      fetchSalary();
    } catch {
      message.error("Failed to save salary");
    }
  };

  // Delete salary
  const handleDelete = async (id) => {
    try {
      await api.delete(`/salary/${id}`);
      message.success("Deleted");
      fetchSalary();
    } catch {
      message.error("Failed to delete");
    }
  };

  // Pay salary
  const handlePay = async (record) => {
    try {
      await api.put(`/salary/${record._id}`, { paymentStatus: "paid" });
      message.success(`${record.staff.name}'s salary marked as paid`);
      fetchSalary();
    } catch {
      message.error("Failed to mark as paid");
    }
  };

  // Auto-generate salaries
  const autoGenerate = async () => {
    try {
      const res = await api.post("/salary/auto-create");
      message.success(`${res.data.salariesCreated} salaries generated for this month`);
      fetchSalary();
    } catch {
      message.error("Failed to auto-generate salaries");
    }
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={autoGenerate}>
          Generate This Month Salaries
        </Button>
        <Button type="primary" onClick={() => openModal()}>
          Add/Edit Salary
        </Button>
      </Space>

      <Table
        dataSource={salary}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
        rowClassName={() => "hover-row"}
        columns={[
          { title: "Staff", dataIndex: ["staff", "name"] },
          { title: "Month", dataIndex: "month" },
          { title: "Year", dataIndex: "year" },
          { title: "Basic Salary", dataIndex: "basicSalary" },
          { title: "Bonus", dataIndex: "bonus" },
          { title: "Deduction", dataIndex: "deduction" },
          { title: "Total Paid", dataIndex: "totalPaid" },
          {
            title: "Status",
            dataIndex: "paymentStatus",
            render: (status) =>
              status === "paid" ? (
                <Tag color="green">Paid</Tag>
              ) : (
                <Tag color="orange">Pending</Tag>
              ),
          },
          {
            title: "Action",
            render: (_, record) => (
              <Space>
                {record.paymentStatus === "pending" && (
                  <Button type="primary" onClick={() => handlePay(record)}>
                    Pay
                  </Button>
                )}
                <Button onClick={() => openModal(record)}>Edit</Button>
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
                  <Button danger>Delete</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Edit Salary" : "Add Salary"}
        open={modal}
        onOk={submitSalary}
        onCancel={() => setModal(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="staff" label="Staff" rules={[{ required: true }]}>
            <Select placeholder="Select Staff">
              {staff.map((s) => (
                <Select.Option key={s._id} value={s._id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="month" label="Month" rules={[{ required: true }]}>
            <Select placeholder="Select Month">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <Select.Option key={m} value={m}>
                  {m}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="year" label="Year" rules={[{ required: true }]}>
            <InputNumber min={2000} max={2100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="basicSalary" label="Basic Salary" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="bonus" label="Bonus">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="deduction" label="Deduction">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="paymentStatus" label="Payment Status">
            <Select>
              <Select.Option value="paid">Paid</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Hover effect */}
      <style>
        {`
          .hover-row:hover {
            background-color: #fafafa;
            transition: 0.3s;
          }
        `}
      </style>
    </>
  );
}
