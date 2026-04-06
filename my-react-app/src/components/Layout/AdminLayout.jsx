import { useState, useEffect } from "react";
import { Layout, Menu, Switch, Avatar, Dropdown, Badge, Drawer, Breadcrumb } from "antd";
import { UserOutlined, BellOutlined, LogoutOutlined, MoonOutlined, SunOutlined, MenuOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { adminRoutes } from "../../routes/adminRoutes";
import api from "../../api/api";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get("/activities");
        const unread = res.data.filter((activity) => !activity.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch activities", err);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNotificationClick = async () => {
    try {
      await api.post("/activities/mark-read");
      setUnreadCount(0);
      navigate("/admin/system-activities");
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  const profileMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: <Link to="/admin/profile">Profile</Link>,
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: <span onClick={signOut}>Sign Out</span>,
      },
    ],
  };

  const menuItems = adminRoutes.map((route) => ({
    key: route.path,
    icon: route.icon,
    label: <Link to={route.path}>{route.name}</Link>,
  }));

  const breadcrumbItems = location.pathname
    .split("/")
    .filter(Boolean)
    .map((path, idx) => ({
      title: (
        <Link
          style={{ color: isDark ? "#fff" : "#000" }}
          to={`/${location.pathname.split("/").slice(1, idx + 2).join("/")}`}
        >
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
          <div className="app-shell-brand">Admin</div>
          <Menu theme={isDark ? "dark" : "light"} mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
        </Sider>
      )}

      {isMobile && (
        <Drawer title="Menu" placement="left" open={drawerVisible} onClose={() => setDrawerVisible(false)}>
          <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={() => setDrawerVisible(false)} />
        </Drawer>
      )}

      <Layout className="app-shell">
        <Header className="app-shell-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <MenuOutlined className="app-shell-icon" style={{ fontSize: 20 }} onClick={() => setDrawerVisible(true)} />
            )}
            <h3 className="app-shell-title app-shell-header-title">Admin Panel</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <Switch checked={isDark} onChange={toggleTheme} checkedChildren={<MoonOutlined />} unCheckedChildren={<SunOutlined />} />
            <Badge count={unreadCount}>
              <BellOutlined style={{ fontSize: 20, color: "var(--ui-text)", cursor: "pointer" }} onClick={handleNotificationClick} />
            </Badge>
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
