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
import SocietyLoader from "@/components/ui/SocietyLoader";

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
      // 1ï¸âƒ£ Create Razorpay order via backend
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

      // 2ï¸âƒ£ Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Society Maintenance",
        description: `Maintenance for ${selectedBill.month}`,
        order_id: data.order.id,
        handler: async function (response) {
          // 3ï¸âƒ£ Confirm payment in backend
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
      // 4ï¸âƒ£ Open Razorpay modal
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Payment failed");
    }
  };

  const downloadReceipt = (bill) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const rupee = "Rs.";
    const pageWidth = 210;
    const marginX = 16;
    const rightX = 140;

    const formatMoney = (value) =>
      `${rupee}${Number(value || 0).toLocaleString("en-IN")}`;

      // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(25);
    doc.setTextColor(18, 76, 145);
    doc.text("MAINTENANCE INVOICE", pageWidth / 2, 20, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Bill To
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(18, 76, 145);
    doc.text("Bill To", marginX, 55);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const residentName =
      bill.residentName ||
      bill.residentId?.ownerName ||
      bill.residentId?.name ||
      "Resident";
    const flatNo = bill.flatNo || bill.residentId?.flatNo || "-";
    doc.text(`Name: ${residentName}`, marginX, 62);
    doc.text(`Flat No: ${flatNo}`, marginX, 68);

    // Invoice meta
    doc.setFont("helvetica", "bold");
    doc.setTextColor(18, 76, 145);
    doc.text("Invoice #", rightX, 75, { align: "right" });
    doc.text("Invoice date", rightX, 81, { align: "right" });
    doc.text("Due date", rightX, 87, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${bill._id?.slice(-6) || "000007"}`, rightX + 30, 75, { align: "right" });
    doc.text(dayjs().format("DD-MM-YYYY"), rightX + 30, 81, { align: "right" });
    doc.text(
      bill.dueDate ? dayjs(bill.dueDate).format("DD-MM-YYYY") : "-",
      rightX + 30,
      87,
      { align: "right" }
    );

    // Table header
    const tableTop = 100;
    doc.setFillColor(18, 76, 145);
    doc.rect(marginX, tableTop, pageWidth - marginX * 2, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("QTY", marginX + 6, tableTop + 5.5);
    doc.text("Description", marginX + 20, tableTop + 5.5);
    doc.text("Unit Price", 150, tableTop + 5.5, { align: "right" });
    doc.text("Amount", 190, tableTop + 5.5, { align: "right" });
    doc.setTextColor(0, 0, 0);

    // Table row
    const rowY = tableTop + 14;
    doc.setFont("helvetica", "normal");
    doc.text("1", marginX + 6, rowY);
    doc.text(`Maintenance (${bill.month || "-"})`, marginX + 20, rowY);
    const unitPrice = Number(bill.amount || 0);
    doc.text(formatMoney(unitPrice), 150, rowY, { align: "right" });
    doc.text(formatMoney(unitPrice), 190, rowY, { align: "right" });

    // Totals
    const totalsTop = rowY + 18;
    doc.setDrawColor(18, 76, 145);
    doc.line(120, totalsTop - 6, 190, totalsTop - 6);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", 150, totalsTop, { align: "right" });
    doc.text(formatMoney(unitPrice), 190, totalsTop, { align: "right" });
    doc.text("Late Fee", 150, totalsTop + 6, { align: "right" });
    doc.text(formatMoney(bill.lateFee || 0), 190, totalsTop + 6, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(18, 76, 145);
    doc.text("Total (INR)", 150, totalsTop + 14, { align: "right" });
    doc.text(formatMoney(bill.finalAmount || bill.amount), 190, totalsTop + 14, { align: "right" });
    doc.setTextColor(0, 0, 0);

    // Terms
    const termsTop = totalsTop + 34;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(18, 76, 145);
    doc.text("Terms and Conditions", marginX, termsTop);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Payment is due within 14 days.", marginX, termsTop + 6);
    doc.text("Please make checks payable to: Your Company Inc.", marginX, termsTop + 12);

    // Footer
    doc.setDrawColor(220, 230, 245);
    doc.line(marginX, 285, pageWidth - marginX, 285);
    doc.setFontSize(9);
    doc.text(
      `Paid At: ${bill.paidAt ? dayjs(bill.paidAt).format("DD MMM YYYY") : "-"} | Method: ${bill.paymentMethod || "-"}`,
      marginX,
      291
    );

    doc.save(`Maintenance_${bill.month || "receipt"}.pdf`);
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
      <SocietyLoader spinning={loading} fullScreen>
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
      </SocietyLoader>
    </ResidentLayout>
  );
}


