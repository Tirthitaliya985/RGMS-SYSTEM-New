import { useEffect, useState } from "react";
import ResidentLayout from "@/components/Layout/ResidentLayout";
import {
  Table,
  Tag,
  Button,
  message,
  Card,
  Row,
  Col,
  Space,
  Modal,
  Radio,
} from "antd";
import dayjs from "dayjs";
import api from "@/api/api";
import jsPDF from "jspdf";
import "./ResidentMaintenance.css";
import { loadRazorpayScript } from "@/utils/razorpay";

export default function ResidentMaintenance() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const RAZORPAY_KEY_ID =  "rzp_test_SJdpdTmA4H6VqM";

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.get("/maintenance/resident");
      setBills(res?.data?.data || []);
    } catch (err) {
      message.error("Failed to load maintenance bills");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedBill) return;

    try {
      // 1️⃣ Create Razorpay order via backend
      setLoading(true);
      const { data } = await api.post("/maintenance/pay/create-order", {
        maintenanceId: selectedBill._id,
      });

      const razorpayReady = await loadRazorpayScript();
      if (!razorpayReady) {
        message.error("Failed to load Razorpay checkout");
        setLoading(false);
        return;
      }

      // 2️⃣ Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Society Maintenance",
        description: `Maintenance for ${selectedBill.month}`,
        order_id: data.order.id,
        handler: async function (response) {
          // 3️⃣ Confirm payment in backend
          await api.post(`/maintenance/pay/${selectedBill._id}`, {
            paymentMethod: "Razorpay",
            transactionId: response.razorpay_payment_id,
          });

          message.success("Payment successful!");
          setOpen(false);
          setSelectedBill(null);
          fetchBills();
        },
        prefill: {
          name: selectedBill.residentName || "Me",
          email: selectedBill.email || "resident@example.com",
        },
        theme: { color: "#1677ff" },
      };
      setLoading(false);
      // 4️⃣ Open Razorpay modal
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Payment failed");
    }
  };

  const downloadReceipt = (bill) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Maintenance Payment Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Resident: ${bill.residentName || "Me"}`, 20, 40);
    doc.text(`Month: ${bill.month}`, 20, 50);
    doc.text(`Original Amount: ₹${bill.amount}`, 20, 60);
    doc.text(`Late Fee: ₹${bill.lateFee || 0}`, 20, 70);
    doc.text(`Total Paid: ₹${bill.finalAmount || bill.amount}`, 20, 80);
    doc.text(
      `Paid At: ${bill.paidAt ? dayjs(bill.paidAt).format("DD MMM YYYY") : "-"}`,
      20,
      90
    );
    doc.text(`Payment Method: ${bill.paymentMethod || "-"}`, 20, 100);
    doc.save(`Maintenance_${bill.month}.pdf`);
  };

  const columns = [
    {
      title: "Month",
      dataIndex: "month",
      render: (month) => <strong>{month}</strong>,
    },
    {
      title: "Amount (₹)",
      dataIndex: "amount",
      render: (amount, record) => (
        <>
          ₹ {amount}
          {record.lateFee > 0 && (
            <Tag color="volcano" style={{ marginLeft: 8 }}>
              Late Fee ₹ {record.lateFee}
            </Tag>
          )}
        </>
      ),
    },
    {
      title: "Final Amount (₹)",
      render: (_, record) => `₹ ${record.finalAmount || record.amount}`,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (date) => (date ? dayjs(date).format("DD MMM YYYY") : "-"),
    },
    {
      title: "Status",
      render: (_, record) => {
        if (record.isPaid) return <Tag color="green">Paid</Tag>;
        const overdue = new Date(record.dueDate) < new Date();
        return <Tag color={overdue ? "volcano" : "orange"}>{overdue ? "Overdue" : "Upcoming"}</Tag>;
      },
    },
    {
      title: "Payment Info",
      render: (_, record) =>
        record.isPaid ? (
          <div>
            <div>Paid At: {dayjs(record.paidAt).format("DD MMM YYYY")}</div>
            <div>Method: {record.paymentMethod}</div>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Action",
      render: (_, record) =>
        !record.isPaid ? (
          <Button type="primary" onClick={() => openPaymentModal(record)}>
            Pay ₹ {record.finalAmount || record.amount}
          </Button>
        ) : (
          <Space>
            <Button disabled>Paid</Button>
            <Button onClick={() => downloadReceipt(record)}>Download PDF</Button>
          </Space>
        ),
    },
  ];

  const totalPending = bills
    .filter((b) => !b.isPaid)
    .reduce((sum, b) => sum + Number(b.finalAmount || b.amount), 0);
  const totalPaid = bills
    .filter((b) => b.isPaid)
    .reduce((sum, b) => sum + Number(b.finalAmount || b.amount), 0);

  return (
    <ResidentLayout>
      <h2 style={{ marginBottom: 20 }}>My Maintenance Bills</h2>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card hoverable>
            <h3>Total Paid</h3>
            <p className="total-amount">₹ {totalPaid}</p>
          </Card>
        </Col>

        <Col span={6}>
          <Card hoverable>
            <h3>Total Pending</h3>
            <p className="total-amount">₹ {totalPending}</p>
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={bills.map((b) => ({ ...b, residentName: b.residentName || "Me" }))}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
        rowClassName={(record) => {
          if (record.isPaid) return "paid-row";
          const overdue = new Date(record.dueDate) < new Date();
          return overdue ? "overdue-row" : "upcoming-row";
        }}
      />

      {/* Payment Modal */}
      <Modal
        open={open}
        title={`Pay ₹ ${selectedBill?.finalAmount || selectedBill?.amount}`}
        onCancel={() => setOpen(false)}
        onOk={handlePayment}
        okText="Pay Now"
      >
        <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
          <Space direction="vertical">
            <Radio value="UPI">UPI</Radio>
            <Radio value="Credit Card">Credit Card</Radio>
            <Radio value="Debit Card">Debit Card</Radio>
            <Radio value="Razorpay">Razorpay</Radio>
            <Radio value="Paytm">Paytm</Radio>
          </Space>
        </Radio.Group>
      </Modal>
    </ResidentLayout>
  );
}
