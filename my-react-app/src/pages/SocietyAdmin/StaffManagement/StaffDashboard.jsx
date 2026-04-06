import { Card, Row, Col, Statistic, Avatar, List, Tag, Tooltip, message } from "antd";
import { TeamOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { PieChart, Pie, Tooltip as RechartsTooltip, Cell, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import SocietyLayout from "@/components/Layout/SocietyLayout";
import api from "@/api/api";

const COLORS = ["#4caf50", "#f44336"]; // green = active, red = inactive

export default function StaffDashboard() {
  const [staff, setStaff] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all"); // For filtering Top 5 staff

  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff");
      setStaff(res.data.data || res.data);
    } catch {
      message.error("Failed to fetch staff");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const activeStaff = staff.filter(s => s.status === "active");
  const inactiveStaff = staff.filter(s => s.status !== "active");

  const pieData = [
    { name: "Active", value: activeStaff.length },
    { name: "Inactive", value: inactiveStaff.length }
  ];

  // Filter top staff based on selectedStatus
  const filteredStaff = selectedStatus === "all"
    ? staff
    : staff.filter(s => selectedStatus === "active" ? s.status === "active" : s.status !== "active");

  const topStaff = [...filteredStaff]
    .sort((a, b) => (b.salaryPerMonth || 0) - (a.salaryPerMonth || 0))
    .slice(0, 5);

  const activePercent = staff.length ? Math.round((activeStaff.length / staff.length) * 100) : 0;

  return (
    <>
      <div style={{ padding: 20 }}>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          {/* Statistic Cards */}
          {[{
            title: "Total Staff",
            value: staff.length,
            color: "#1890ff",
            icon: <TeamOutlined />
          }, {
            title: "Active Staff",
            value: activeStaff.length,
            color: "#4caf50",
            icon: <CheckCircleOutlined />
          }, {
            title: "Inactive Staff",
            value: inactiveStaff.length,
            color: "#f44336",
            icon: <StopOutlined />
          }].map((card, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card
                hoverable
                style={{
                  transition: "transform 0.3s, box-shadow 0.3s",
                  cursor: "pointer"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
              >
                <Statistic
                  title={card.title}
                  value={card.value}
                  prefix={card.icon}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={16}>
          {/* Pie Chart */}
          <Col xs={24} md={12}>
            <Card title="Staff Status Pie">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                    onClick={(entry) => {
                      if (entry.name === "Active") setSelectedStatus("active");
                      else setSelectedStatus("inactive");
                    }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 10 }}>
                <Tag
                  color={selectedStatus === "all" ? "blue" : "default"}
                  onClick={() => setSelectedStatus("all")}
                  style={{ cursor: "pointer" }}
                >
                  Show All
                </Tag>
                <Tag
                  color={selectedStatus === "active" ? "green" : "default"}
                  onClick={() => setSelectedStatus("active")}
                  style={{ cursor: "pointer" }}
                >
                  Active
                </Tag>
                <Tag
                  color={selectedStatus === "inactive" ? "red" : "default"}
                  onClick={() => setSelectedStatus("inactive")}
                  style={{ cursor: "pointer" }}
                >
                  Inactive
                </Tag>
              </div>
            </Card>
          </Col>

          {/* Top Staff List */}
          <Col xs={24} md={12}>
            <Card title={`Top 5 Staff (${selectedStatus === "all" ? "All" : selectedStatus})`}>
              <List
                dataSource={topStaff}
                renderItem={item => (
                  <Tooltip
                    title={
                      <div>
                        <div><strong>Email:</strong> {item.email}</div>
                        <div><strong>Phone:</strong> {item.phone}</div>
                        <div><strong>Role:</strong> {item.role}</div>
                        <div><strong>Salary:</strong> ${item.salaryPerMonth || 0}</div>
                      </div>
                    }
                    placement="right"
                  >
                    <List.Item style={{ cursor: "pointer" }}>
                      <List.Item.Meta
                        avatar={<Avatar src={item.photo} />}
                        title={item.name}
                        description={item.role}
                      />
                      <Tag color={item.status === "active" ? "green" : "red"}>
                        {item.status.toUpperCase()}
                      </Tag>
                    </List.Item>
                  </Tooltip>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
