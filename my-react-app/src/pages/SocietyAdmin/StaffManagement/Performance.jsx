// src/pages/Performance.jsx

import {
  Card,
  Select,
  Rate,
  Input,
  Button,
  Table,
  message,
  Form,
  Space,
  Popconfirm,
  Tag,
} from "antd";
import { useState, useEffect } from "react";
import api from "@/api/api";

const { Option } = Select;
const { TextArea } = Input;

export default function Performance() {
  const [staffList, setStaffList] = useState([]);
  const [performanceList, setPerformanceList] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Fetch Staff
  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff");
      setStaffList(res.data);
    } catch (err) {
      message.error("Failed to fetch staff");
    }
  };

  // Fetch Performance Records
  const fetchPerformance = async () => {
    try {
      const res = await api.get("/performance");
      setPerformanceList(res.data.data);
    } catch (err) {
      message.error("Failed to fetch performance data");
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchPerformance();
  }, []);

  // Submit Performance
  const onFinish = async (values) => {
    try {
      setLoading(true);
      await api.post("/performance", values);
      message.success("Performance submitted successfully");
      form.resetFields();
      fetchPerformance();
    } catch (err) {
      message.error("Error submitting performance");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`/performance/${id}`);
      message.success("Deleted successfully");
      fetchPerformance();
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
      title: "Category",
      dataIndex: "category",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: "Comment",
      dataIndex: "comment",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Delete this record?"
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
    <Card title="Staff Performance Management" style={{ margin: 20 }}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          name="staff"
          label="Select Staff"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select staff member">
            {staffList.map((s) => (
              <Option key={s._id} value={s._id}>
                {s.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="category"
          label="Performance Category"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select category">
            <Option value="Punctuality">Punctuality</Option>
            <Option value="Behavior">Behavior</Option>
            <Option value="Work Quality">Work Quality</Option>
            <Option value="Discipline">Discipline</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="rating"
          label="Rating"
          rules={[{ required: true }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item name="comment" label="Comment">
          <TextArea rows={3} placeholder="Optional comment..." />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          Submit Performance
        </Button>
      </Form>

      <Table
        columns={columns}
        dataSource={performanceList}
        rowKey="_id"
        style={{ marginTop: 30 }}
      />
    </Card>
  );
}
