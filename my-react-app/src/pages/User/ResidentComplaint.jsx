import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Table,
  Tag,
  message,
} from "antd";
import api from "@/api/api";
import ResidentLayout from "@/components/Layout/ResidentLayout";
import SocietyLoader from "@/components/ui/SocietyLoader";

const { TextArea } = Input;

export default function ResidentComplaint() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [form] = Form.useForm();

  // Fetch complaints on load
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get("/residents/complaints");
      setComplaints(res.data.data);
    } catch (err) {
      message.error("Failed to load complaints");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      await api.post("/residents/complaints", values);
      message.success("Complaint submitted successfully!");
      form.resetFields();
      fetchComplaints();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const complaintColumns = [
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const color =
          status === "Pending"
            ? "orange"
            : status === "In Progress"
            ? "blue"
            : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  if (loading) return <SocietyLoader fullScreen />;

  return (
    <ResidentLayout>
      <Row gutter={[16, 16]}>
        {/* Complaint Form */}
        <Col xs={24} md={12}>
          <Card title="Submit a Complaint">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message: "Please enter subject" }]}
              >
                <Input placeholder="Enter complaint subject" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please enter description" }]}
              >
                <TextArea rows={4} placeholder="Describe your complaint" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Submit Complaint
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Complaints Table */}
        <Col xs={24} md={12}>
          <Card title="Your Complaints">
            <Table
              columns={complaintColumns}
              dataSource={complaints}
              rowKey="_id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </ResidentLayout>
  );
}
