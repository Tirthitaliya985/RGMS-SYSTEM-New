import { useState, useEffect, useRef } from "react";
import { Layout, Menu, Switch, Avatar, Dropdown, Badge, Drawer, Breadcrumb, List, Typography, message, Empty } from "antd";
import { BellOutlined, LogoutOutlined, UserOutlined, MoonOutlined, SunOutlined, MenuOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";
import { SOCKET_URL } from "@/api/backendConfig";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import api from "@/api/api";
import { ResidentRoutes } from "@/routes/ResidentRoutes";

const { Header, Sider, Content } = Layout;

export default function ResidentLayout({ children }) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const isDark = theme === "dark";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    const wingId = localStorage.getItem("wingId");

    socketRef.current.emit("joinWing", wingId);
    socketRef.current.on("newWingNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      message.success("New notification");
    });

    return () => socketRef.current.disconnect();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const menuItems = ResidentRoutes.map((route) => ({
    key: route.path,
    icon: route.icon,
    label: <Link to={route.path}>{route.name}</Link>,
  }));

  const profileMenu = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: <Link to="/resident/profile">Profile</Link> },
      { key: "logout", icon: <LogoutOutlined />, label: <span onClick={signOut}>Sign Out</span> },
    ],
  };

  const notificationDropdown = (
    <div style={{ width: 320 }}>
      <List
        size="small"
        dataSource={notifications.slice(0, 5)}
        locale={{ emptyText: <Empty description="No Notifications" /> }}
        renderItem={(item) => (
          <List.Item
            style={{ background: item.isRead ? "#fff" : "#e6f4ff", cursor: "pointer" }}
            onClick={async () => {
              if (!item.isRead) {
                await api.put(`/notifications/${item._id}/read`);
                setNotifications((prev) => prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)));
              }
              navigate("/resident/notifications");
            }}
          >
            <List.Item.Meta title={<Typography.Text strong={!item.isRead}>{item.title}</Typography.Text>} description={item.message} />
          </List.Item>
        )}
      />
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <Typography.Link onClick={() => navigate("/resident/notifications")}>View all notifications</Typography.Link>
      </div>
    </div>
  );

  const breadcrumbItems = location.pathname
    .split("/")
    .filter(Boolean)
    .map((path, idx) => ({
      title: (
        <Link to={`/${location.pathname.split("/").slice(1, idx + 2).join("/")}`} style={{ color: isDark ? "#fff" : "#000" }}>
          {path.charAt(0).toUpperCase() + path.slice(1)}
        </Link>
      ),
    }));

  return (
    <Layout className="app-shell">
      {!isMobile && (
        <Sider
          className="app-shell-sider"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme={isDark ? "dark" : "light"}
        >
          <div className="app-shell-brand">Resident</div>
          <Menu mode="inline" theme={isDark ? "dark" : "light"} selectedKeys={[location.pathname]} items={menuItems} />
        </Sider>
      )}

      {isMobile && (
        <Drawer title="Resident Menu" placement="left" open={drawerVisible} onClose={() => setDrawerVisible(false)}>
          <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={() => setDrawerVisible(false)} />
        </Drawer>
      )}

      <Layout className="app-shell">
        <Header className="app-shell-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <MenuOutlined className="app-shell-icon" style={{ fontSize: 20 }} onClick={() => setDrawerVisible(true)} />
            )}
            <h3 className="app-shell-title app-shell-header-title">Resident Panel</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <Switch checked={isDark} onChange={toggleTheme} checkedChildren={<MoonOutlined />} unCheckedChildren={<SunOutlined />} />

            <Dropdown popupRender={() => notificationDropdown}>
              <Badge count={unreadCount}>
                <BellOutlined style={{ fontSize: 20, color: "var(--ui-text)", cursor: "pointer" }} />
              </Badge>
            </Dropdown>

            <Dropdown menu={profileMenu} placement="bottomRight">
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} />
                <span className="app-shell-user-name">{user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <div className="app-shell-breadcrumb">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <Content className="app-shell-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
