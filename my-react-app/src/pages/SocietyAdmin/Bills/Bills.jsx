import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Progress,
  Space,
  Tag,
  Typography,
  message,
  Avatar,
  Tooltip,
} from "antd";
import {
  ApartmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
  SearchOutlined,
  WalletOutlined,
  CalendarOutlined,
  HomeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import SocietyLayout from "../../../components/Layout/SocietyLayout";
import { deleteBill, generateBills, getBills } from "../../../api/billapi";
import api from "../../../api/api";

const { Title, Text } = Typography;

const pad2 = (value) => String(value).padStart(2, "0");

const formatLocalDateISO = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const parseLocalISODate = (value) => {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const parseYearMonth = (value) => {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month)) return null;
  if (month < 1 || month > 12) return null;

  const date = new Date(year, month - 1, 1);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1) return null;

  return { year, month };
};

const statusBadgeMap = {
  Paid: "bg-green-50 text-green-700 border-green-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
  Pending: "bg-red-50 text-red-700 border-red-200",
};

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [sendingMessages, setSendingMessages] = useState(false);
  const [deletingBillId, setDeletingBillId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterText, setFilterText] = useState("");

  const [generateForm] = Form.useForm();
  const todayISO = useMemo(() => formatLocalDateISO(new Date()), []);
  const currentMonthISO = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  }, []);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getBills();
      setBills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to fetch bills.");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const total = bills.length;
    const paid = bills.filter((bill) => bill.status === "Paid").length;
    const pending = bills.filter((bill) => bill.status === "Pending").length;
    const outstanding = bills.reduce(
      (sum, bill) => sum + Number(bill.remainingAmount || 0),
      0
    );
    return { total, paid, pending, outstanding };
  }, [bills]);

  const filteredBills = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    if (!query) return bills;

    return bills.filter((bill) => {
      const flat = String(bill.flatNo || "").toLowerCase();
      const month = String(bill.month || "").toLowerCase();
      const status = String(bill.status || "").toLowerCase();
      return flat.includes(query) || month.includes(query) || status.includes(query);
    });
  }, [bills, filterText]);

  const handleGenerate = async (values) => {
    try {
      await generateBills(values);
      message.success("Bills generated successfully");
      fetchBills();
      setIsGenerateModalOpen(false);
      generateForm.resetFields();
    } catch (err) {
      console.error(err);
      message.error(err?.response?.data?.message || "Failed to generate bills.");
    }
  };

  const handleSendReminders = async () => {
    try {
      setSendingMessages(true);

      const pendingResidents = bills
        .filter((bill) => bill.status !== "Paid" && bill.residentId && bill.residentId.phone)
        .map((bill) => ({
          name: bill.residentId.ownerName || "Resident",
          phone: bill.residentId.phone,
        }));

      if (pendingResidents.length === 0) {
        message.info("No pending bills with valid phone numbers found.");
        return;
      }

      const uniqueResidents = [];
      const seenPhones = new Set();
      for (const resident of pendingResidents) {
        if (!seenPhones.has(resident.phone)) {
          seenPhones.add(resident.phone);
          uniqueResidents.push(resident);
        }
      }

      await api.post("/whatsapp/send", {
        staffList: uniqueResidents,
        message:
          "Dear Resident, this is a gentle reminder that you have a pending society bill. Please clear it as soon as possible to avoid late fees. Thank you.",
      });

      message.success("Reminders sent successfully.");
    } catch (err) {
      console.error(err);
      message.error("Failed to send reminders.");
    } finally {
      setSendingMessages(false);
    }
  };

  const handleDeleteBill = (bill) => {
    Modal.confirm({
      title: "Delete bill?",
      icon: <ExclamationCircleOutlined />,
      content: `This will permanently delete the bill for Flat ${bill.flatNo} (${bill.month}).`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          setDeletingBillId(bill._id);
          await deleteBill(bill._id);
          message.success("Bill deleted successfully.");
          await fetchBills();
        } catch (err) {
          console.error(err);
          message.error(err?.response?.data?.message || "Failed to delete bill.");
        } finally {
          setDeletingBillId(null);
        }
      },
    });
  };

  return (
    <SocietyLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-inner hidden sm:flex items-center justify-center h-12 w-12">
              <ApartmentOutlined className="text-2xl" />
            </div>
            <div>
              <Title level={2} className="!mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 font-bold">
                Society Bills
              </Title>
              <Text type="secondary" className="text-gray-500 font-medium">
                Generate monthly bills, monitor status, and notify residents
              </Text>
            </div>
          </div>
          
          <Space size="middle" className="flex-wrap w-full lg:w-auto">
            <Button
              type="default"
              icon={<SendOutlined />}
              onClick={handleSendReminders}
              loading={sendingMessages}
              size="large"
              className="border-gray-300 text-indigo-600 hover:text-indigo-700 hover:border-indigo-500 flex items-center font-medium rounded-xl transition-all duration-300 w-full sm:w-auto"
            >
              Send Reminders
            </Button>
            <Button
              type="primary"
              onClick={() => setIsGenerateModalOpen(true)}
              size="large"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 shadow-md hover:shadow-lg flex items-center font-medium rounded-xl transition-all duration-300 w-full sm:w-auto"
            >
              Generate Bills
            </Button>
          </Space>
        </div>

        {error && (
          <Alert
            type="error"
            showIcon
            message="Unable to load bills"
            description={error}
            className="rounded-xl border-red-200 bg-red-50"
          />
        )}

        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <ApartmentOutlined className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Bills</p>
              <h3 className="text-2xl font-bold text-gray-800 m-0">{summary.total}</h3>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircleOutlined className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Paid Bills</p>
              <h3 className="text-2xl font-bold text-gray-800 m-0">{summary.paid}</h3>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
              <ClockCircleOutlined className="text-orange-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Pending Bills</p>
              <h3 className="text-2xl font-bold text-gray-800 m-0">{summary.pending}</h3>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
              <WalletOutlined className="text-red-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Outstanding</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 m-0">₹{summary.outstanding.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <Input
            prefix={<SearchOutlined className="text-gray-400 text-lg mr-2" />}
            allowClear
            size="large"
            placeholder="Search by flat number, month, or status..."
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            className="border-0 hover:border-0 focus:border-0 focus:ring-0 shadow-none text-base"
            style={{ boxShadow: 'none' }}
          />
        </div>

        {/* Bills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredBills.map((bill) => {
            const amount = Number(bill.amount || 0);
            const paidAmount = Number(bill.paidAmount || 0);
            const remainingAmount = Number(bill.remainingAmount || 0);
            const paidPercent = amount > 0 ? Math.round((paidAmount / amount) * 100) : 0;
            const statusClass = statusBadgeMap[bill.status] || "bg-gray-50 text-gray-700 border-gray-200";

            return (
              <div 
                key={bill._id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col group overflow-hidden relative"
              >
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 group-hover:bg-blue-100 transition-colors duration-500 translate-x-10 -translate-y-10"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      shape="square" 
                      size="large" 
                      style={{ backgroundColor: '#f0f5ff', color: '#1677ff', borderRadius: '10px' }} 
                      icon={<HomeOutlined />} 
                    />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Flat No</p>
                      <h3 className="text-lg font-bold text-gray-800 m-0">{bill.flatNo}</h3>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tooltip
                      title={
                        bill.status !== "Pending" || Number(bill.paidAmount || 0) > 0
                          ? "Only pending, unpaid bills can be deleted."
                          : "Delete bill"
                      }
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        disabled={bill.status !== "Pending" || Number(bill.paidAmount || 0) > 0}
                        loading={deletingBillId === bill._id}
                        onClick={() => handleDeleteBill(bill)}
                        className="!h-8 !w-8 flex items-center justify-center rounded-lg hover:!bg-red-50"
                      />
                    </Tooltip>
                    <Tag className={`px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wide m-0 ${statusClass}`}>
                      {bill.status}
                    </Tag>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <CalendarOutlined className="text-indigo-400" />
                  <span className="text-sm font-medium text-slate-700">{bill.month}</span>
                </div>

                <div className="flex flex-col gap-2 mb-4 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <span className="text-sm font-semibold text-gray-700">₹{amount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Amount Paid</span>
                    <span className="text-sm font-semibold text-green-600">₹{paidAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="w-full h-px bg-gray-100 my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Remaining</span>
                    <span className="text-base font-bold text-red-500">₹{remainingAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="mt-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-500">Payment Progress</span>
                    <span className="font-bold text-indigo-600">{paidPercent}%</span>
                  </div>
                  <Progress
                    percent={paidPercent}
                    showInfo={false}
                    status={bill.status === "Paid" ? "success" : "active"}
                    strokeColor={{
                      '0%': '#818cf8',
                      '100%': bill.status === "Paid" ? '#22c55e' : '#4f46e5',
                    }}
                    className="m-0 [&_.ant-progress-bg]:h-2"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filteredBills.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <SearchOutlined className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No Bills Found</h3>
            <p className="text-gray-500">We couldn't find any bills matching your search criteria.</p>
          </div>
        )}

        {/* Generate Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="bg-blue-50 p-2 rounded-lg">
                <WalletOutlined className="text-blue-600 text-xl" />
              </div>
              <span className="text-xl font-bold text-gray-800">Generate Monthly Bills</span>
            </div>
          }
          open={isGenerateModalOpen}
          onCancel={() => setIsGenerateModalOpen(false)}
          onOk={() => generateForm.submit()}
          okText="Generate Now"
          cancelText="Cancel"
          centered
          width={450}
          className="rounded-2xl overflow-hidden"
          okButtonProps={{ className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 rounded-lg shadow-sm font-medium" }}
          cancelButtonProps={{ className: "rounded-lg font-medium border-gray-300 hover:text-blue-600 hover:border-blue-600" }}
          closeIcon={<span className="text-gray-400 hover:text-gray-600 text-lg">✕</span>}
        >
          <div className="py-4 px-1">
            <Form form={generateForm} layout="vertical" onFinish={handleGenerate} requiredMark={false}>
              <Form.Item 
                name="month" 
                label={<span className="font-semibold text-gray-700">Billing Month (YYYY-MM)</span>} 
                rules={[
                  { required: true, message: "Please enter the billing month" },
                  {
                    validator: async (_, value) => {
                      if (!value) return;
                      const parsed = parseYearMonth(value);
                      if (!parsed) throw new Error("Billing month must be in YYYY-MM format.");
                      if (parsed.year < 2000 || parsed.year > 2100) {
                        throw new Error("Billing month year must be between 2000 and 2100.");
                      }
                      const selectedIndex = parsed.year * 12 + (parsed.month - 1);
                      const now = new Date();
                      const currentIndex = now.getFullYear() * 12 + now.getMonth();
                      if (selectedIndex < currentIndex) {
                        throw new Error("Cannot generate bills for past months.");
                      }
                    },
                  },
                ]}
              >
                <Input
                  size="large"
                  type="month"
                  min={currentMonthISO}
                  placeholder="e.g. 2026-03"
                  className="rounded-xl py-2 hover:border-blue-400 focus:border-blue-500"
                />
              </Form.Item>
              <Form.Item 
                name="amount" 
                label={<span className="font-semibold text-gray-700">Standard Amount (₹)</span>} 
                rules={[
                  { required: true, message: "Please enter the standard amount" },
                  {
                    validator: async (_, value) => {
                      if (value === null || value === undefined || value === "") return;

                      const amount = typeof value === "number" ? value : Number(value);
                      if (!Number.isFinite(amount)) throw new Error("Amount must be a valid number.");
                      if (amount <= 0) throw new Error("Amount must be greater than 0.");
                      if (amount > 1_000_000_000) {
                        throw new Error("Amount seems too large.");
                      }
                    },
                  },
                ]}
                className="mt-5"
              >
                <Input size="large" type="number" placeholder="e.g. 5000" prefix={<span className="text-gray-400 mr-1 font-medium">₹</span>} className="rounded-xl py-2 hover:border-blue-400 focus:border-blue-500" />
              </Form.Item>
              <Form.Item 
                name="dueDate" 
                label={<span className="font-semibold text-gray-700">Due Date</span>} 
                rules={[
                  { required: true, message: "Please select a due date" },
                  {
                    validator: async (_, value) => {
                      if (!value) return;
                      const dueDate = parseLocalISODate(value);
                      if (!dueDate) throw new Error("Please select a valid due date.");

                      const now = new Date();
                      const startOfToday = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                      );

                      if (dueDate < startOfToday) {
                        throw new Error("Due date cannot be in the past.");
                      }
                    },
                  },
                ]}
                className="mt-5"
              >
                <Input
                  size="large"
                  type="date"
                  min={todayISO}
                  className="rounded-xl py-2 hover:border-blue-400 focus:border-blue-500"
                />
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    </SocietyLayout>
  );
}
