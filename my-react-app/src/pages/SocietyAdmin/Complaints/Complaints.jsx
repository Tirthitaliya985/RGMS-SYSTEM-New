import { useEffect, useState } from "react";
import SocietyLayout from "../../../components/Layout/SocietyLayout";
import { Table, Button, Tag, Space, message, Popconfirm, Avatar, Typography, Tooltip } from "antd";
import { 
  CheckCircleOutlined, 
  SyncOutlined, 
  DeleteOutlined, 
  UserOutlined,
  MessageOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import api from "../../../api/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function SocietyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get("/residents/complaints");
      setComplaints(res.data?.data || res.data || []);
    } catch (error) {
      message.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/residents/complaints/${id}`, { status });
      message.success(`Complaint marked as ${status}`);
      fetchComplaints();
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const deleteComplaint = async (id) => {
    try {
      await api.delete(`/residents/complaints/${id}`);
      message.success("Complaint removed successfully");
      fetchComplaints();
    } catch (error) {
      message.error("Failed to delete complaint");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Tag color="error" className="px-3 py-1 rounded-full border-red-200 text-red-600 bg-red-50 font-semibold"><ExclamationCircleOutlined className="mr-1" /> Pending</Tag>;
      case "In Progress":
        return <Tag color="warning" className="px-3 py-1 rounded-full border-orange-200 text-orange-600 bg-orange-50 font-semibold"><SyncOutlined spin className="mr-1" /> In Progress</Tag>;
      case "Resolved":
        return <Tag color="success" className="px-3 py-1 rounded-full border-green-200 text-green-600 bg-green-50 font-semibold"><CheckCircleOutlined className="mr-1" /> Resolved</Tag>;
      default:
        return <Tag color="default" className="px-3 py-1 rounded-full font-semibold">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Resident Info",
      key: "residentName",
      render: (_, record) => {
        const renderName = (val) => {
          if (!val) return "Unknown Resident";
          if (typeof val === 'object') return val.ownerName || val.name || "Unknown Resident";
          return String(val);
        };

        return (
          <div className="flex items-center gap-3">
            <Avatar 
              size="large" 
              style={{ backgroundColor: '#f0f5ff', color: '#1677ff' }} 
              icon={<UserOutlined />} 
            />
            <div className="flex flex-col">
              <Text strong className="text-gray-800 text-[15px]">
                {renderName(record.residentName || record.residentId)}
              </Text>
              {record.wing && (
                <Text type="secondary" className="text-xs">
                  Wing {typeof record.wing === 'object' ? record.wing.name || "N/A" : record.wing}
                </Text>
              )}
              <Text type="secondary" className="text-[11px] text-gray-400 mt-0.5">
                {record.createdAt ? dayjs(record.createdAt).format("DD MMM YYYY, hh:mm A") : ""}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Complaint Details",
      key: "details",
      render: (_, record) => {
        const renderText = (value) => {
          if (value === null || value === undefined) return "";
          if (typeof value === 'object') {
             // If for some reason it's an object (like {_id: ...}), stringify it or extract a meaningful field
             return JSON.stringify(value); 
          }
          return String(value);
        };

        return (
          <div className="flex flex-col max-w-md">
            <Text strong className="text-gray-700 text-base mb-1">
              {renderText(record.subject)}
            </Text>
            <Text className="text-gray-500 text-sm italic line-clamp-2" title={renderText(record.description)}>
              "{renderText(record.description)}"
            </Text>
          </div>
        );
      }
    },
    {
      title: "Current Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
    },
    {
      title: "Management Actions",
      key: "actions",
      align: "right",
      render: (text, record) => (
        <Space className="flex-wrap justify-end">
          {record.status === "Pending" && (
            <Tooltip title="Mark as In Progress">
              <Button
                type="dashed"
                icon={<SyncOutlined />}
                onClick={() => updateStatus(record._id, "In Progress")}
                className="text-orange-500 border-orange-300 hover:text-orange-600 hover:border-orange-500 hover:bg-orange-50 font-medium rounded-lg"
              >
                Start
              </Button>
            </Tooltip>
          )}
          
          {record.status !== "Resolved" && (
            <Tooltip title="Mark as Resolved">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => updateStatus(record._id, "Resolved")}
                className="bg-green-500 hover:bg-green-600 shadow-sm border-0 font-medium rounded-lg"
              >
                Resolve
              </Button>
            </Tooltip>
          )}

          <Popconfirm
            title="Delete this complaint?"
            description="Are you sure you want to permanently delete this record?"
            onConfirm={() => deleteComplaint(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, className: "rounded-md" }}
            cancelButtonProps={{ className: "rounded-md border-gray-300" }}
          >
            <Tooltip title="Delete Complaint">
              <Button 
                danger 
                type="text" 
                icon={<DeleteOutlined />}
                className="hover:bg-red-50 rounded-lg text-red-500"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <SocietyLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-500 rounded-xl shadow-inner hidden sm:flex items-center justify-center h-12 w-12">
              <MessageOutlined className="text-2xl" />
            </div>
            <div>
              <Title level={2} className="!mb-1 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 font-bold">
                Resident Complaints
              </Title>
              <Text type="secondary" className="text-gray-500 font-medium">
                Monitor and resolve issues raised by society residents
              </Text>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 border border-gray-200 px-4 py-2 rounded-xl">
            <div className="flex flex-col items-center px-3 border-r border-gray-200">
              <span className="text-xl font-bold text-red-500">{loading ? '-' : complaints.filter(c => c.status === "Pending").length}</span>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Pending</span>
            </div>
            <div className="flex flex-col items-center px-3">
              <span className="text-xl font-bold text-gray-800">{loading ? '-' : complaints.length}</span>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total</span>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 m-0">Complaint Log</h3>
            <Button icon={<SyncOutlined spin={loading} />} onClick={fetchComplaints} type="text" className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
              Refresh
            </Button>
          </div>
          
          <Table
            columns={columns}
            dataSource={complaints}
            rowKey={(record) => record._id}
            loading={loading}
            pagination={{ pageSize: 8, className: 'px-6 py-4 m-0' }}
            className="custom-complaints-table"
            scroll={{ x: true }}
          />
        </div>

        <style>{`
          /* Custom Table Styling overrides to match premium look */
          .custom-complaints-table .ant-table-thead > tr > th {
            background-color: transparent !important;
            color: #64748b !important;
            font-weight: 600 !important;
            padding: 16px 24px !important;
            border-bottom: 1px solid #e2e8f0 !important;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.05em;
          }
          .custom-complaints-table .ant-table-tbody > tr > td {
            padding: 16px 24px !important;
            border-bottom: 1px solid #f1f5f9;
            transition: all 0.2s;
          }
          .custom-complaints-table .ant-table-tbody > tr:hover > td {
            background-color: #f8fafc !important;
          }
        `}</style>
      </div>
    </SocietyLayout>
  );
}
