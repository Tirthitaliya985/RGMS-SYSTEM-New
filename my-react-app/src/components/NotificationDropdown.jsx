import { List, Typography, Empty, Badge } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "@/api/backendConfig";
import api from "@/api/api";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    const societyId = localStorage.getItem("societyId");
    socket.emit("joinSociety", societyId);

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Badge count={unreadCount} overflowCount={99}>
      <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
      <div className="notificationDropdown">
        {notifications.length === 0 ? (
          <Empty description="No notifications" />
        ) : (
          <List
            dataSource={notifications.slice(0, 5)}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: item.isRead ? "#fff" : "#e6f7ff",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/society/notifications")}
              >
                <List.Item.Meta
                  title={
                    <Typography.Text strong={!item.isRead}>
                      {item.title}
                    </Typography.Text>
                  }
                  description={item.message}
                />
              </List.Item>
            )}
          />
        )}
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Typography.Link onClick={() => navigate("/society/notifications")}>
            View all
          </Typography.Link>
        </div>
      </div>
    </Badge>
  );
}
