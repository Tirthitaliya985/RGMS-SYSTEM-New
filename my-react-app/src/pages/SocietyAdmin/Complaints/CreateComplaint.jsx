import { useState } from "react";
import SocietyLayout from "@/components/Layout/SocietyLayout";
import { Card, Form, Input, Button, message } from "antd";
import api from "../../../api/api";

export default function CreateComplaint() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post("/admin/complaints", {
        subject: values.subject,
        description: values.description,
      });

      message.success("Complaint sent to Main Admin!");
      setLoading(false);
    } catch (error) {
      message.error("Failed to send complaint.");
      setLoading(false);
    }
  };

  return (
    <SocietyLayout>
      <Card title="Send Complaint to Main Admin">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input placeholder="Enter subject" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={6} placeholder="Enter complaint details" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Send Complaint
          </Button>
        </Form>
      </Card>
    </SocietyLayout>
  );
}
