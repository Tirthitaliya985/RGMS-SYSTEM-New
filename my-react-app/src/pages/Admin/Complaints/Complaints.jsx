import { useEffect, useState } from "react";
import AdminLayout from "@/components/Layout/AdminLayout";
import { Table, Button, Tag, Space, message, Modal, Input } from "antd";
import api from "../../../api/api";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/complaints");
      setComplaints(res.data?.data || res.data || []);
    } catch (error) {
      message.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const openReplyModal = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const sendReply = async () => {
    try {
      await api.put(`/admin/complaints/${selectedId}/reply`, {
        reply,
      });

      message.success("Reply sent!");
      setIsModalOpen(false);
      setReply("");
      fetchComplaints();
    } catch (error) {
      message.error("Failed to send reply");
    }
  };

  const columns = [
    {
      title: "Society Name",
      key: "societyName",
      render: (_, record) =>
        record?.societyId?.name || record?.societyName || "N/A",
    },
    { title: "Subject", dataIndex: "subject", key: "subject" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Resolved" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Reply",
      dataIndex: "reply",
      key: "reply",
      render: (text) => text || "No reply yet",
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Space>
          <Button type="primary" onClick={() => openReplyModal(record._id)}>
            Reply
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Table
        columns={columns}
        dataSource={complaints}
        rowKey={(record) => record._id}
        loading={loading}
      />

      <Modal
        title="Send Reply"
        open={isModalOpen}
        onOk={sendReply}
        onCancel={() => setIsModalOpen(false)}
      >
        <Input.TextArea
          rows={5}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply here..."
        />
      </Modal>
    </AdminLayout>
  );
}
