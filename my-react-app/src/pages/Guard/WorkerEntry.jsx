import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Row, Select, Space, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import GuardLayout from "@/components/Layout/GuardLayout";
import api from "@/api/api";

const WORK_TYPES = ["Electrician", "Plumber", "Carpenter", "Maid", "Driver", "Other"];

export default function WorkerEntry() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [workers, setWorkers] = useState([]);

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/visitors/gate", { params: { today: true } });
      const items = (res.data?.data || []).filter((v) =>
        ["worker", "service"].includes(String(v.purpose || "").toLowerCase())
      );
      setWorkers(items);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load worker entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleCreate = async (values) => {
    try {
      setSubmitting(true);
      await api.post("/visitors/register", {
        visitorName: values.workerName,
        phone: values.phone,
        flatNo: values.flatNo,
        wing: values.wing,
        purpose: "Worker",
        notes: `Work Type: ${values.workType}${values.idProof ? `, ID: ${values.idProof}` : ""}`,
        vehicleNumber: values.vehicleNumber,
      });
      message.success("Worker entry created");
      form.resetFields();
      await fetchWorkers();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to create worker entry");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: "Worker", dataIndex: "visitorName", key: "visitorName" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Wing", key: "wing", render: (_, r) => r.wingId?.wing || r.wingId?.code || "-" },
    { title: "Flat", key: "flat", render: (_, r) => r.residentId?.flatNo || "-" },
    { title: "Notes", dataIndex: "notes", key: "notes" },
    { title: "Entry", dataIndex: "scheduledFor", key: "scheduledFor", render: (v) => dayjs(v).format("hh:mm A") },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag>{String(s || "").toUpperCase()}</Tag> },
  ];

  return (
    <GuardLayout onRefresh={fetchWorkers} refreshing={loading}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="Worker Entry">
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item name="workerName" label="Worker Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="phone" label="Mobile" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="workType" label="Work Type" rules={[{ required: true }]}>
                  <Select options={WORK_TYPES.map((x) => ({ label: x, value: x }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="wing" label="Wing" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="flatNo" label="Flat No" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="idProof" label="ID Proof No">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Save Worker Entry
            </Button>
          </Form>
        </Card>

        <Card title="Today's Worker Entries">
          <Table rowKey="_id" columns={columns} dataSource={workers} loading={loading} />
        </Card>
      </Space>
    </GuardLayout>
  );
}
