import { useState, useEffect } from "react";
import SocietyLayout from "@/components/Layout/SocietyLayout";
import {
  Table,
  Button,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
  Progress,
  Card,
  Tag,
  Typography,
  Space,
  Avatar,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  BankOutlined,
} from "@ant-design/icons";
import api from "@/api/api";
import * as XLSX from "xlsx";

const { Text } = Typography;

export default function Maintenance() {
  const [maintenance, setMaintenance] = useState([]);
  const [wings, setWings] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMaintenance();
    fetchWings();
  }, []);

  // Fetch maintenance records
  const fetchMaintenance = async () => {
    try {
      const res = await api.get("/maintenance/society");
      setMaintenance(res?.data?.data || []);
    } catch (err) {
      message.error("Failed to fetch maintenance records");
    }
  };

  // Fetch wings
  const fetchWings = async () => {
    try {
      const res = await api.get("/wings");
      setWings(res?.data?.data || []);
    } catch (err) {
      message.error("Failed to fetch wings");
    }
  };

  // Generate Maintenance
  const handleGenerate = async (values) => {
    try {
      const monthStr = values.month.format("MMMM YYYY");
      const totalAmount = values.totalAmount;

      if (!totalAmount || totalAmount <= 0) {
        return message.error("Enter valid total amount");
      }

      // Total flats in society
      const totalFlats = wings.reduce((sum, w) => sum + w.totalFlats, 0);

      if (totalFlats === 0) {
        return message.error("No flats found in wings");
      }

      // Proportional distribution
      const wingBills = wings.map((w) => ({
        wing: w._id, // store wing ID
        amount: Math.round((w.totalFlats / totalFlats) * totalAmount),
      }));

      await api.post("/maintenance/society", {
        month: monthStr,
        totalAmount,
        wingBills,
      });

      message.success(`Maintenance for ${monthStr} generated successfully`);
      form.resetFields();
      setOpen(false);
      fetchMaintenance();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Failed to generate maintenance",
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/maintenance/${id}`);
      message.success("Maintenance deleted successfully");
      fetchMaintenance();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Failed to delete maintenance",
      );
    }
  };

  // Export to Excel
  const exportExcel = () => {
    const data = maintenance.map((m) => ({
      Month: m.month,
      "Total Amount (₹)": m.totalAmount,
      "Wing-wise Distribution": m.wingBills
        ?.map((w) => {
          const wingData = wings.find((wing) => wing._id === w.wing);
          return `Wing ${wingData?.wing || "?"}: ₹${w.amount}`;
        })
        .join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenance");
    XLSX.writeFile(workbook, "Maintenance.xlsx");
  };

  // Table Columns
  const columns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: (text) => (
        <Space>
          <Avatar 
            shape="square" 
            size="small" 
            style={{ backgroundColor: '#e6f4ff', color: '#1677ff', borderRadius: '6px' }} 
            icon={<CalendarOutlined />} 
          />
          <Text strong className="text-gray-700">{text}</Text>
        </Space>
      ),
    },
    {
      title: "Total Amount (₹)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <Tag color="green" className="px-3 py-1 text-[13px] font-bold rounded-md shadow-sm border-green-200">
          ₹ {amount?.toLocaleString('en-IN')}
        </Tag>
      ),
    },
    {
      title: "Wing-wise Distribution",
      key: "wingBills",
      render: (_, record) => (
        <div className="flex flex-wrap gap-3 my-1">
          {record.wingBills?.map((w) => {
            const wingData = wings.find((wing) => wing._id === w.wing);
            const percent = Math.round((w.amount / record.totalAmount) * 100);

            return (
              <div 
                key={w.wing} 
                className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 shadow-sm min-w-[170px] hover:border-blue-300 hover:shadow-md transition-all duration-300"
              >
                <Avatar 
                  style={{ backgroundColor: '#f0f5ff', color: '#2f54eb', fontWeight: 'bold' }}
                >
                  {wingData?.wing || "?"}
                </Avatar>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-bold text-slate-700">₹ {w.amount?.toLocaleString('en-IN')}</span>
                  <div className="flex items-center gap-2 m-0 mt-0.5">
                     <Progress 
                       percent={percent} 
                       size="small" 
                       showInfo={false} 
                       strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                       className="m-0 flex-1"
                     />
                     <span className="text-[10px] font-semibold text-slate-400 w-6 text-right fade-in">{percent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Delete Maintenance"
          description="Are you sure you want to delete this record?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete Record">
            <Button 
              danger 
              type="text" 
              icon={<DeleteOutlined />} 
              className="hover:bg-red-50 rounded-full"
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <SocietyLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-inner hidden sm:block">
              <BankOutlined className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 m-0">Society Maintenance</h2>
              <p className="text-gray-500 text-sm mt-1 m-0">Manage society maintenance generation and distributions</p>
            </div>
          </div>
          
          <Space className="mt-4 md:mt-0 flex-wrap">
            <Button
              icon={<FileExcelOutlined />}
              onClick={exportExcel}
              className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 font-medium rounded-lg h-10 px-4"
            >
              Export Excel
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all rounded-lg h-10 px-4"
            >
              Generate Maintenance
            </Button>
          </Space>
        </div>

        {/* Content Table */}
        <Card 
          className="shadow-sm rounded-2xl overflow-hidden border-gray-100" 
          bodyStyle={{ padding: 0 }}
        >
          <Table 
            columns={columns} 
            dataSource={maintenance} 
            rowKey="_id" 
            pagination={{ pageSize: 10, className: 'px-6 pt-4 pb-6' }}
            scroll={{ x: true }}
            className="[&_.ant-table-thead_>_tr_>_th]:bg-slate-50 [&_.ant-table-thead_>_tr_>_th]:text-slate-600 [&_.ant-table-thead_>_tr_>_th]:font-semibold [&_.ant-table-thead_>_tr_>_th]:py-4 [&_.ant-table-cell]:px-6 [&_.ant-table-cell]:py-4"
          />
        </Card>

        {/* Generate Modal */}
        <Modal
          title={<span className="text-xl font-bold text-gray-800">Generate Society Maintenance</span>}
          open={open}
          onCancel={() => setOpen(false)}
          onOk={() => form.submit()}
          okText="Generate Now"
          cancelText="Cancel"
          centered
          width={450}
          className="rounded-2xl overflow-hidden"
          okButtonProps={{ className: "bg-blue-600 hover:bg-blue-700 rounded-lg" }}
          cancelButtonProps={{ className: "rounded-lg" }}
        >
          <div className="py-4">
            <Form form={form} layout="vertical" onFinish={handleGenerate} requiredMark={false}>
              <Form.Item
                name="month"
                label={<span className="font-semibold text-gray-700">Billing Month</span>}
                rules={[{ required: true, message: "Please select a month" }]}
              >
                <DatePicker 
                  picker="month" 
                  style={{ width: "100%" }} 
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="totalAmount"
                label={<span className="font-semibold text-gray-700">Total Amount (₹)</span>}
                rules={[{ required: true, message: "Enter total maintenance amount" }]}
                className="mt-5"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  size="large"
                  placeholder="e.g. 5,00,000"
                  className="rounded-lg"
                  prefix={<span className="text-gray-400 font-medium mr-1">₹</span>}
                />
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    </SocietyLayout>
  );
}
