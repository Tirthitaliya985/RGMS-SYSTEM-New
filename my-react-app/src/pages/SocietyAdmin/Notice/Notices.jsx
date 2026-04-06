import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Popconfirm,
  Tag,
} from "antd";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import api from "@/api/api";
import SocietyLayout from "@/components/Layout/SocietyLayout";
import WingLayout from "@/components/Layout/WingLayout";
import ResidentLayout from "@/components/Layout/ResidentLayout";
import GuardLayout from "@/components/Layout/GuardLayout";
import { useAuth } from "@/context/AuthContext";

dayjs.extend(duration);

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form] = Form.useForm();
  const [countdown, setCountdown] = useState({});
  const { user } = useAuth();

  const permissions = useMemo(() => {
    const role = String(user?.role || "").toLowerCase();
    const isSociety = role === "society" || role === "society admin";
    const isWing = role === "wingadmin" || role === "wing admin";
    const isResident = role === "resident";
    const isGuard = role === "guard";

    return {
      role,
      isSociety,
      isWing,
      isResident,
      isGuard,
      canManageNotices: isSociety,
    };
  }, [user?.role]);

  const Layout = permissions.isWing
    ? WingLayout
    : permissions.isResident
      ? ResidentLayout
      : permissions.isGuard
        ? GuardLayout
        : SocietyLayout;

  const roleLabel = permissions.isSociety
    ? "Society Admin"
    : permissions.isWing
      ? "Wing Admin"
      : permissions.isResident
        ? "Resident"
        : permissions.isGuard
          ? "Guard"
          : "User";

  // Fetch notices
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notices");
      setNotices(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Live countdown + auto remove expired notices
  useEffect(() => {
    const timer = setInterval(() => {
      const newCountdown = {};
      const updatedNotices = notices.filter((n) => {
        if (n.expiryDate) {
          const diffMs = dayjs(n.expiryDate).diff(dayjs());
          if (diffMs > 0) {
            const dur = dayjs.duration(diffMs);
            newCountdown[n._id] = `${dur.days()}d ${dur.hours()}h ${dur.minutes()}m ${dur.seconds()}s`;
            return true; // keep
          } else {
            toast(`Notice "${n.title}" has expired`, { icon: "⚠️" });
            return false; // remove expired
          }
        }
        return true; // no expiry, keep
      });

      setCountdown(newCountdown);
      setNotices(updatedNotices);
    }, 1000);

    return () => clearInterval(timer);
  }, [notices]);

  const priorityColor = (priority) => {
    if (priority === "Important") return "red";
    if (priority === "Normal") return "blue";
    return "gray";
  };

  const openModal = (notice = null) => {
    if (!permissions.canManageNotices) return;
    setEditingNotice(notice);
    if (notice) {
      form.setFieldsValue({
        ...notice,
        expiryDate: notice.expiryDate ? dayjs(notice.expiryDate) : null,
      });
    } else {
      form.resetFields();
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.expiryDate) values.expiryDate = values.expiryDate.toISOString();

      if (editingNotice) {
        await api.put(`/notices/${editingNotice._id}`, values);
        toast.success("Notice updated!");
      } else {
        await api.post("/notices", values);
        toast.success("Notice added!");
      }

      setOpen(false);
      form.resetFields();
      setEditingNotice(null);
      fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save notice");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notices/${id}`);
      toast.success("Notice deleted!");
      fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete notice");
    }
  };

  // Countdown style: flash red if less than 1 day
  const countdownStyle = (id) => {
    const timeLeft = countdown[id];
    if (!timeLeft || timeLeft === "Expired") return { color: "gray" };
    const [d] = timeLeft.split("d");
    if (parseInt(d) < 1) return { color: "red", fontWeight: "bold" };
    return {};
  };

  return (
    <Layout>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Society Notices
                </h2>
                <Tag className="rounded-full border-0 bg-indigo-50 text-indigo-700 font-semibold">
                  {roleLabel}
                </Tag>
              </div>
              <p className="text-gray-500 mt-1">
                Important updates, reminders, and announcements.
              </p>
            </div>
            {permissions.canManageNotices && (
              <Button type="primary" onClick={() => openModal()}>
                + Add Notice
              </Button>
            )}
          </div>
        </div>

        <Space direction="vertical" style={{ width: "100%" }}>
          {notices.length === 0 && <p>No notices found.</p>}
          {notices.map((notice) => (
            <Card
              key={notice._id}
              title={
                <div className="flex items-center gap-2">
                  <span style={{ color: priorityColor(notice.priority) }}>
                    {notice.title}
                  </span>
                  <Tag
                    color={notice.priority === "Important" ? "red" : "blue"}
                    className="rounded-full"
                  >
                    {notice.priority}
                  </Tag>
                </div>
              }
              extra={
                permissions.canManageNotices && (
                  <Space>
                    <Button type="link" onClick={() => openModal(notice)}>
                      Edit
                    </Button>
                    <Popconfirm
                      title="Are you sure to delete this notice?"
                      onConfirm={() => handleDelete(notice._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="link" danger>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                )
              }
              style={{ borderLeft: `5px solid ${priorityColor(notice.priority)}` }}
            >
              <p>{notice.description || "No description provided."}</p>
              <p>
                <strong>Expiry:</strong>{" "}
                {notice.expiryDate
                  ? `${dayjs(notice.expiryDate).format("DD MMM YYYY HH:mm")} `
                  : "No Expiry"}
                <span style={countdownStyle(notice._id)}>
                  {notice.expiryDate ? `(${countdown[notice._id] || ""})` : ""}
                </span>
              </p>
            </Card>
          ))}
        </Space>
      </div>

      <Modal
        title={editingNotice ? "Edit Notice" : "Add Notice"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText={editingNotice ? "Update" : "Add"}
        cancelText="Cancel"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Enter notice title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Enter notice description" />
          </Form.Item>

          <Form.Item name="priority" label="Priority" initialValue="Normal">
            <Select>
              <Select.Option value="Normal">Normal</Select.Option>
              <Select.Option value="Important">Important</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="expiryDate" label="Expiry Date">
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
