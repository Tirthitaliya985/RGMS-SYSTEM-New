// src/pages/ShiftManagement.jsx

import {
  Card,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Table,
  Form,
  message,
  Space,
  Popconfirm,
  Tag,
} from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import api from "@/api/api";

const { Option } = Select;

export default function ShiftCalendar() {
  const [staffList, setStaffList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Fetch Staff
  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff");
      setStaffList(res.data);
    } catch (err) {
      message.error("Failed to load staff");
    }
  };

  // Fetch Shifts
  const fetchShifts = async () => {
    try {
      const res = await api.get("/shifts");
      setShiftList(res.data.data);
    } catch (err) {
      message.error("Failed to load shifts");
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchShifts();
  }, []);

  // Submit Shift
  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
      };

      await api.post("/shifts", payload);
      message.success("Shift assigned successfully");
      form.resetFields();
      fetchShifts();
    } catch (err) {
      message.error("Error assigning shift");
    } finally {
      setLoading(false);
    }
  };

  // Delete Shift
  const handleDelete = async (id) => {
    try {
      await api.delete(`/shifts/${id}`);
      message.success("Shift deleted");
      fetchShifts();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const columns = [
    {
      title: "Staff",
      dataIndex: ["staff", "name"],
    },
    {
      title: "Shift Type",
      dataIndex: "shiftType",
      render: (text) => (
        <Tag color={text === "Night" ? "purple" : "blue"}>{text}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Start",
      dataIndex: "startTime",
    },
    {
      title: "End",
      dataIndex: "endTime",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Delete this shift?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Staff Shift Management" style={{ margin: 20 }}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          name="staff"
          label="Select Staff"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select staff">
            {staffList.map((s) => (
              <Option key={s._id} value={s._id}>
                {s.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="shiftType"
          label="Shift Type"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select shift">
            <Option value="Morning">Morning</Option>
            <Option value="Afternoon">Afternoon</Option>
            <Option value="Night">Night</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Shift Date"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="startTime"
          label="Start Time"
          rules={[{ required: true }]}
        >
          <TimePicker style={{ width: "100%" }} format="HH:mm" />
        </Form.Item>

        <Form.Item
          name="endTime"
          label="End Time"
          rules={[{ required: true }]}
        >
          <TimePicker style={{ width: "100%" }} format="HH:mm" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          Assign Shift
        </Button>
      </Form>

      <Table
        columns={columns}
        dataSource={shiftList}
        rowKey="_id"
        style={{ marginTop: 30 }}
      />
    </Card>
  );
}
