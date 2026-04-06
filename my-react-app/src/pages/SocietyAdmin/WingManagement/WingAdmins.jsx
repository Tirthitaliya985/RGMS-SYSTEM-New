import { Table, Button, Space, Popconfirm, message } from "antd";
import { useState, useEffect } from "react";
import api from "@/api/api";

export default function WingAdmins() {
  const [admins, setAdmins] = useState([]);

  const fetchAdmins = async () => {
    const res = await api.get("/wings/admins");
    setAdmins(res.data.data || []);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    await api.delete(`/wings/admins/${id}`);
    message.success("Wing Admin deleted");
    fetchAdmins();
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Assigned Wing", render: (_,record) => record.wing?.wing || "N/A" },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Delete this admin?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={admins} rowKey="_id" />;
}
