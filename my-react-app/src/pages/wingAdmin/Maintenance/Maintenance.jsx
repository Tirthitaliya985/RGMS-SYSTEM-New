import { useState, useEffect } from "react";
import WingLayout from "@/components/Layout/WingLayout";
import { Table, message, Modal, Tag } from "antd";
import api from "@/api/api";
import dayjs from "dayjs";

export default function Maintenance() {
  const [wingBills, setWingBills] = useState([]);
  const [residents, setResidents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchWingMaintenance();
  }, []);

  const fetchWingMaintenance = async () => {
    try {
      const res = await api.get("/maintenance/wing");
      setWingBills(res?.data?.data || []);
    } catch (err) {
      message.error("Failed to fetch wing maintenance");
    }
  };

  const fetchResidents = async (maintenanceId, month) => {
    try {
      const res = await api.get(
        `/maintenance/wing/details/${maintenanceId}`
      );

      setResidents(res?.data?.data || []);
      setSelectedMonth(month);
      setOpen(true);
    } catch (err) {
      message.error("Failed to fetch residents");
    }
  };

  const columns = [
    {
      title: "Month",
      dataIndex: "month",
    },
    {
      title: "Amount (₹)",
      dataIndex: "amount",
    },
    {
      title: "Action",
      render: (_, record) => (
        <a onClick={() => fetchResidents(record._id, record.month)}>
          View Residents
        </a>
      ),
    },
  ];

  const residentColumns = [
    { title: "Flat No", dataIndex: "flatNo" },
    { title: "Owner Name", dataIndex: "ownerName" },
    { title: "Amount", dataIndex: "finalAmount" },
    {
      title: "Status",
      dataIndex: "isPaid",
      render: (isPaid) =>
        isPaid ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag color="red">Unpaid</Tag>
        ),
    },
    {
      title: "Paid At",
      dataIndex: "paidAt",
      render: (date) =>
        date ? dayjs(date).format("DD MMM YYYY") : "-",
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      render: (method) => method || "-",
    },
  ];

  return (
    <WingLayout>
      <h2>Wing Maintenance Bills</h2>

      <Table
        columns={columns}
        dataSource={wingBills}
        rowKey="_id"
        bordered
      />

      <Modal
        title={`Residents - ${selectedMonth}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={residentColumns}
          dataSource={residents}
          rowKey="residentId"
          pagination={false}
        />
      </Modal>
    </WingLayout>
  );
}