import AdminLayout from "../../../components/Layout/AdminLayout";
import { Table, Card } from "antd";
import { useTheme } from "../../../context/ThemeContext";
import { useEffect, useState } from "react";
import api from "../../../api/api"; // your Axios instance with token

export default function SystemActivities() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get("/activities");
        setActivities(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchActivities();
  }, []);

  const cardStyle = {
    background: isDark ? "#1f2940" : "#fff",
    color: isDark ? "#fff" : "#000",
  };

  const columns = [
    { title: "Admin User", dataIndex: "username", key: "_id" },
    { title: "Action", dataIndex: "action", key: "_id" },
    { 
      title: "Time", 
      dataIndex: "time", 
      key: "_id",  
      render: (time) => new Date(time).toLocaleString() 
    },
  ];

  return (
    <AdminLayout>
      <Card title="System Activities Log" style={cardStyle}>
        <Table 
          dataSource={activities} 
          columns={columns} 
          pagination={{ pageSize: 5 }} 
          rowKey="_id"
        />
      </Card>
    </AdminLayout>
  );
}
