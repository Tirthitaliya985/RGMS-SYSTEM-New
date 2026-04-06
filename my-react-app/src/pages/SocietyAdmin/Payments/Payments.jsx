import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Tag, Typography, Tabs, Card, Space, Avatar, Divider, Popconfirm, Alert } from "antd";
import { 
  PlusOutlined, 
  CreditCardOutlined, 
  HistoryOutlined, 
  WalletOutlined,
  SendOutlined,
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  BankOutlined,
  MoneyCollectOutlined
} from "@ant-design/icons";
import SocietyLayout from "../../../components/Layout/SocietyLayout";
import { getBills } from "../../../api/billapi";
import { getPayments, addPayment } from "../../../api/paymentApi";
import api from "../../../api/api";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMessageId, setSendingMessageId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPayments(), fetchBills()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    const res = await getPayments();
    setPayments(Array.isArray(res.data) ? res.data : []);
  };

  const fetchBills = async () => {
    const res = await getBills();
    const data = Array.isArray(res.data) ? res.data : [];
    setBills(data.filter(b => b.status !== "Paid"));
  };

  const handleSendReminder = async (bill) => {
    try {
      const resident = bill.residentId;
      if (!resident || !resident.phone) {
        return message.error("Resident phone number not found.");
      }

      setSendingMessageId(bill._id);

      await api.post("/whatsapp/send", {
        staffList: [{
          name: resident.ownerName || "Resident",
          phone: resident.phone,
        }],
        message: `Dear ${resident.ownerName || 'Resident'},\n\nThis is a gentle reminder that your society maintenance bill for Flat ${bill.flatNo || resident.flatNo} (Month: ${bill.month}) is pending.\n\nAmount Due: Rs. ${bill.remainingAmount}\n\nPlease clear it as soon as possible to avoid late fees. Thank you.`,
      });

      message.success("WhatsApp reminder sent successfully!");
    } catch (err) {
      console.error(err);
      message.error("Failed to send WhatsApp reminder.");
    } finally {
      setSendingMessageId(null);
    }
  };

  const handleAddPayment = async (values) => {
    try {
      await addPayment(values);
      message.success("Manual payment recorded successfully");
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  const getPaymentModeTag = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'online': return <Tag color="blue" className="px-2 py-1 rounded-md font-medium border-blue-200"><CreditCardOutlined className="mr-1" /> Online</Tag>;
      case 'cash': return <Tag color="green" className="px-2 py-1 rounded-md font-medium border-green-200"><MoneyCollectOutlined className="mr-1" /> Cash</Tag>;
      case 'cheque': return <Tag color="purple" className="px-2 py-1 rounded-md font-medium border-purple-200"><BankOutlined className="mr-1" /> Cheque</Tag>;
      default: return <Tag color="default" className="px-2 py-1 rounded-md font-medium">{mode || 'Unknown'}</Tag>;
    }
  };

  const paymentsColumns = [
    { 
      title: "Resident Details", 
      key: "resident",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            shape="square" 
            size="large" 
            style={{ backgroundColor: '#f0f5ff', color: '#1677ff', borderRadius: '8px' }} 
            icon={<HomeOutlined />} 
          />
          <div className="flex flex-col">
            <Text strong className="text-gray-800 text-base">Flat {record.residentId?.flatNo || "N/A"}</Text>
            <Text type="secondary" className="text-xs flex items-center gap-1">
              <UserOutlined /> {record.residentId?.ownerName || "Unknown Owner"}
            </Text>
          </div>
        </div>
      )
    },
    { 
      title: "Amount Paid", 
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="text-[15px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
          ₹ {Number(amount).toLocaleString('en-IN')}
        </span>
      )
    },
    { 
      title: "Payment Mode", 
      dataIndex: "paymentMode",
      key: "mode",
      render: (mode) => getPaymentModeTag(mode)
    },
    { 
      title: "Transaction Info", 
      key: "info",
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarOutlined className="text-indigo-400" />
            <Text className="text-sm font-medium">
              {record.paymentDate ? dayjs(record.paymentDate).format('DD MMM YYYY, hh:mm A') : "N/A"}
            </Text>
          </div>
          {record.transactionId && (
            <Text className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100 w-fit">
              ID: {record.transactionId}
            </Text>
          )}
        </div>
      )
    },
  ];

  const pendingBillsColumns = [
    { 
      title: "Resident Details", 
      key: "details",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            shape="square" 
            size="large" 
            style={{ backgroundColor: '#fff1f0', color: '#ff4d4f', borderRadius: '8px' }} 
            icon={<WalletOutlined />} 
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Text strong className="text-gray-800 text-base">Flat {record.flatNo || record.residentId?.flatNo}</Text>
              <Tag color="red" className="m-0 border-red-200 leading-[18px]">Pending</Tag>
            </div>
            <Text type="secondary" className="text-xs flex items-center gap-1 mt-0.5">
              <UserOutlined /> {record.residentId?.ownerName || "Unknown Owner"}
            </Text>
          </div>
        </div>
      )
    },
    { 
      title: "Billing Month", 
      dataIndex: "month",
      key: "month",
      render: (month) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-blue-500" />
          <Text strong className="text-gray-700">{month}</Text>
        </div>
      )
    },
    { 
      title: "Amount Due", 
      dataIndex: "remainingAmount",
      key: "amount",
      render: (amount) => (
        <span className="text-[15px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
          ₹ {Number(amount).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, bill) => (
        <Button 
          type="default" 
          icon={<SendOutlined />} 
          onClick={() => handleSendReminder(bill)}
          loading={sendingMessageId === bill._id}
          className="border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50 shadow-sm font-medium rounded-lg h-9 transition-colors"
        >
          Inform
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2 text-[15px] font-medium px-4 py-1">
          <HistoryOutlined />
          Payment History
        </span>
      ),
      children: (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
          <div className="p-5 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800 m-0">Recent Transactions</h3>
              <p className="text-sm text-gray-500 m-0 mt-1">View all successful payments made by residents.</p>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
              {payments.length} Records
            </div>
          </div>
          <Table 
            dataSource={payments} 
            columns={paymentsColumns} 
            rowKey="_id" 
            loading={loading}
            pagination={{ pageSize: 8, className: 'px-6 py-4 m-0' }}
            className="custom-payments-table"
            scroll={{ x: true }}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2 text-[15px] font-medium px-4 py-1">
          <WalletOutlined />
          Pending Bills
          <span className="bg-red-100 text-red-600 px-2 min-w-[24px] rounded-full text-xs font-bold text-center border border-red-200">
            {bills.length}
          </span>
        </span>
      ),
      children: (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
          <div className="p-5 border-b border-gray-100 bg-red-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800 m-0">Awaiting Payment</h3>
              <p className="text-sm text-gray-500 m-0 mt-1">Review pending dues and inform residents directly via WhatsApp.</p>
            </div>
          </div>
          <Table
            dataSource={bills}
            columns={pendingBillsColumns}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8, className: 'px-6 py-4 m-0' }}
            className="custom-payments-table"
            scroll={{ x: true }}
          />
        </div>
      ),
    },
  ];

  return (
    <SocietyLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner hidden sm:flex items-center justify-center h-12 w-12">
              <CreditCardOutlined className="text-2xl" />
            </div>
            <div>
              <Title level={2} className="!mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-bold">
                Payment Management
              </Title>
              <Text type="secondary" className="text-gray-500 font-medium">
                Track resident payments, process manual entries, and view pending dues
              </Text>
            </div>
          </div>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            size="large"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 shadow-md hover:shadow-lg flex items-center font-medium rounded-xl transition-all duration-300 w-full sm:w-auto"
          >
            Record Manual Payment
          </Button>
        </div>

        {/* Tabs Section */}
        <Tabs 
          defaultActiveKey="1" 
          items={tabItems} 
          className="custom-payments-tabs"
          animated={{ inkBar: true, tabPane: true }}
        />

        {/* Manual Payment Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <MoneyCollectOutlined className="text-indigo-600 text-xl" />
              </div>
              <span className="text-xl font-bold text-gray-800">Record Offline Payment</span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText="Save Payment"
          cancelText="Cancel"
          centered
          width={500}
          className="rounded-2xl overflow-hidden"
          okButtonProps={{ className: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 rounded-lg shadow-sm font-medium" }}
          cancelButtonProps={{ className: "rounded-lg font-medium border-gray-300 hover:text-indigo-600 hover:border-indigo-600" }}
          closeIcon={<span className="text-gray-400 hover:text-gray-600 text-lg">✕</span>}
        >
          <div className="py-4 px-1">
            <Form form={form} layout="vertical" onFinish={handleAddPayment} requiredMark={false}>
              
              <Alert 
                message="Manual Entry Mode" 
                description="Use this form to record offline payments like Cash or Cheques that have already been settled. Online gateway payments are recorded automatically."
                type="info" 
                showIcon 
                className="mb-6 rounded-xl border-blue-200 bg-blue-50/50"
              />

              <Form.Item 
                name="billId" 
                label={<span className="font-semibold text-gray-700">Select Pending Bill</span>} 
                rules={[{ required: true, message: 'Please select a bill to pay against' }]}
              >
                <Select 
                  size="large"
                  placeholder="Select a bill..."
                  showSearch
                  optionFilterProp="children"
                  className="rounded-xl w-full [&_.ant-select-selector]:rounded-xl"
                  dropdownStyle={{ borderRadius: '12px', padding: '8px' }}
                >
                  {bills.map((b) => (
                    <Option key={b._id} value={b._id}>
                      <div className="flex justify-between items-center w-full">
                        <span className="font-semibold text-slate-700">Flat {b.flatNo || b.residentId?.flatNo} ({b.month})</span>
                        <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">₹ {Number(b.remainingAmount).toLocaleString('en-IN')}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <Form.Item 
                  name="amount" 
                  label={<span className="font-semibold text-gray-700">Amount Received</span>} 
                  rules={[
                    { required: true, message: 'Please enter amount' },
                    () => ({
                      validator(_, value) {
                        const selectedBillId = form.getFieldValue('billId');
                        const selectedBill = bills.find(b => b._id === selectedBillId);
                        
                        if (!value) return Promise.resolve();
                        if (value <= 0) {
                          return Promise.reject(new Error('Amount must be greater than zero'));
                        }
                        if (selectedBill && Number(value) > selectedBill.remainingAmount) {
                          return Promise.reject(new Error(`Cannot exceed due amount (₹${selectedBill.remainingAmount})`));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  className="mb-0"
                >
                  <Input 
                    size="large" 
                    type="number"
                    min={1}
                    placeholder="e.g. 5000" 
                    prefix={<span className="text-gray-400 mr-1 font-medium">₹</span>} 
                    className="rounded-xl py-2 hover:border-indigo-400 focus:border-indigo-500" 
                  />
                </Form.Item>

                <Form.Item 
                  name="paymentMode" 
                  label={<span className="font-semibold text-gray-700">Payment Mode</span>}
                  rules={[{ required: true, message: 'Select mode' }]}
                  initialValue="Cash"
                  className="mb-0"
                >
                  <Select size="large" className="rounded-xl [&_.ant-select-selector]:rounded-xl">
                    <Option value="Cash"><span className="flex items-center gap-2"><MoneyCollectOutlined className="text-green-500"/> Cash</span></Option>
                    <Option value="Online"><span className="flex items-center gap-2"><CreditCardOutlined className="text-blue-500"/> Online Txn</span></Option>
                    <Option value="Cheque"><span className="flex items-center gap-2"><BankOutlined className="text-purple-500"/> Cheque</span></Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item 
                name="transactionId" 
                label={<span className="font-semibold text-gray-700 mt-5">Transaction ID / Cheque No. <span className="text-gray-400 font-normal">(Optional)</span></span>}
              >
                <Input size="large" placeholder="Enter reference number if applicable" className="rounded-xl py-2 hover:border-indigo-400 focus:border-indigo-500" />
              </Form.Item>
            </Form>
          </div>
        </Modal>

        <style>{`
          /* Shared Table Styles */
          .custom-payments-table .ant-table-thead > tr > th {
            background-color: transparent !important;
            color: #64748b !important;
            font-weight: 600 !important;
            padding: 16px 24px !important;
            border-bottom: 1px solid #e2e8f0 !important;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.05em;
          }
          .custom-payments-table .ant-table-tbody > tr > td {
            padding: 16px 24px !important;
            border-bottom: 1px solid #f1f5f9;
            transition: all 0.2s;
          }
          .custom-payments-table .ant-table-tbody > tr:hover > td {
            background-color: #f8fafc !important;
          }
          
          /* Custom Tabs Styling */
          .custom-payments-tabs .ant-tabs-nav::before {
            border-bottom-color: #f1f5f9;
          }
          .custom-payments-tabs .ant-tabs-tab {
            padding: 12px 0;
            margin: 0 32px 0 0;
            color: #64748b;
            transition: all 0.3s;
          }
          .custom-payments-tabs .ant-tabs-tab:hover {
            color: #4f46e5;
          }
          .custom-payments-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #4f46e5 !important;
          }
          .custom-payments-tabs .ant-tabs-ink-bar {
            background: linear-gradient(to right, #4f46e5, #9333ea);
            height: 3px;
            border-radius: 3px 3px 0 0;
          }
        `}</style>
      </div>
    </SocietyLayout>
  );
}
