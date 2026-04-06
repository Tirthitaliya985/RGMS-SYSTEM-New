import { useEffect, useState, useContext } from "react";
import { Badge, List, Button, message, Input, Space } from "antd";
import { BellOutlined } from "@ant-design/icons";
import api from "../api/api";
import { NotificationContext } from "@/context/NotificationContext";
import SocietyLayout from "./Layout/SocietyLayout";

export default function Notifications() {
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
    <div>
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
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{ background: item.isRead ? "#fff" : "#f0f8ff" }}
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
              title={<b>{item.title}</b>}
              description={item.message}
            />
            <small>{new Date(item.createdAt).toLocaleString()}</small>
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
