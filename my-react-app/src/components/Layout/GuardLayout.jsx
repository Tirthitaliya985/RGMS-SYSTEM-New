import { useMemo } from "react";
import { Layout, Menu, Avatar, Dropdown, Breadcrumb, Button, Space, Typography } from "antd";
import { LogoutOutlined, UserOutlined, ReloadOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { guardRoutes } from "@/routes/guardRoutes";

const { Header, Sider, Content } = Layout;

export default function GuardLayout({ children, onRefresh, refreshing = false }) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const menuItems = useMemo(
    () =>
      guardRoutes.map((route) => ({
        key: route.path,
        icon: route.icon,
        label: <Link to={route.path}>{route.name}</Link>,
      })),
    []
  );

  const breadcrumbItems = location.pathname
    .split("/")
    .filter(Boolean)
    .map((path, idx) => ({
      title: (
        <Link to={`/${location.pathname.split("/").slice(1, idx + 2).join("/")}`}>
          {path.charAt(0).toUpperCase() + path.slice(1)}
        </Link>
      ),
    }));

  const profileMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: <span>{user?.username || "Guard"}</span>,
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: <span onClick={signOut}>Sign Out</span>,
      },
    ],
  };

  return (
    <Layout className="app-shell">
      <Sider className="app-shell-sider" width={240}>
        <div className="app-shell-brand">Guard</div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
      </Sider>

      <Layout className="app-shell">
        <Header className="app-shell-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Guard Security Panel
          </Typography.Title>
          <Space>
            <Button icon={<ReloadOutlined />} loading={refreshing} onClick={onRefresh}>
              Refresh
            </Button>
            <Dropdown menu={profileMenu} placement="bottomRight">
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} />
                <span className="app-shell-user-name">{user?.username || "Guard"}</span>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <div className="app-shell-breadcrumb">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <Content className="app-shell-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
