import { useEffect, useState, useContext } from "react";
import { Badge, List, Button, message, Input, Space } from "antd";
import { BellOutlined } from "@ant-design/icons";
import api from "../api/api";
import { NotificationContext } from "@/context/NotificationContext";
import SocietyLayout from "./Layout/SocietyLayout";
import { useTheme } from "@/context/ThemeContext";

export default function Notifications() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const {
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
  } = useContext(NotificationContext);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");

  const fetchNotifications = async (reset = false) => {
    const res = await api.get(`/notifications?page=${page}&limit=10&search=${search}`);
    if (reset) setNotifications(res.data.data);
    else setNotifications(prev => [...prev, ...res.data.data]);

    setHasMore(res.data.hasMore);
    setUnreadCount(res.data.data.filter(n => !n.isRead).length);
  };

  useEffect(() => {
    fetchNotifications(true);
  }, [page, search]);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  return (
    <SocietyLayout>
    <div className="notifications-page">
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search notifications..."
          onSearch={(value) => setSearch(value)}
          style={{ width: 300 }}
        />
        <Button onClick={markAllRead}>Mark All Read</Button>
      </Space>

      <List
        bordered
        style={{
          background: isDark ? "#0f172a" : "#ffffff",
          borderColor: isDark ? "rgba(148, 163, 184, 0.22)" : undefined,
        }}
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{
              background: isDark
                ? item.isRead
                  ? "#0f172a"
                  : "#13233e"
                : item.isRead
                  ? "#ffffff"
                  : "#f0f8ff",
            }}
            actions={[
              !item.isRead && (
                <Button size="small" onClick={() => markRead(item._id)}>
                  Mark as Read
                </Button>
              ),
              <Button danger size="small" onClick={() => deleteNotification(item._id)}>
                Delete
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <span style={{ color: isDark ? "#e2e8f0" : "#111827", fontWeight: 600 }}>
                  {item.title}
                </span>
              }
              description={
                <span style={{ color: isDark ? "#94a3b8" : "#475569" }}>
                  {item.message}
                </span>
              }
            />
            <small style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
              {new Date(item.createdAt).toLocaleString()}
            </small>
          </List.Item>
        )}
      />

      {hasMore && (
        <Button style={{ marginTop: 16 }} onClick={() => setPage(page + 1)}>
          Load More
        </Button>
      )}
    </div>
    </SocietyLayout>
  );
}
