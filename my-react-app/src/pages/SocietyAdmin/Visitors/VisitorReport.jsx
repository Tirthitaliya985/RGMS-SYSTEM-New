import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import SocietyLayout from "@/components/Layout/SocietyLayout";
import api from "@/api/api";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Inside", value: "arrived" },
  { label: "Left", value: "exited" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_COLORS = {
  pending: "orange",
  approved: "blue",
  rejected: "red",
  arrived: "green",
  exited: "default",
  cancelled: "default",
};

const getWingLabel = (record) =>
  record?.wingId?.wing || record?.wingId?.code || record?.residentId?.wing || "-";

const getStatusLabel = (status) => {
  if (status === "arrived") return "INSIDE";
  if (status === "exited") return "LEFT";
  return String(status || "").toUpperCase();
};

const toISO = (value) => (value ? dayjs(value).toDate().toISOString() : undefined);

export default function VisitorReport() {
  const [loading, setLoading] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [range, setRange] = useState([dayjs().startOf("day").subtract(6, "day"), dayjs().endOf("day")]);

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (range?.[0]) params.from = toISO(range[0].startOf("day"));
      if (range?.[1]) params.to = toISO(range[1].endOf("day"));

      const res = await api.get("/visitors/gate", { params });
      setVisitors(res.data?.data || []);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to load visitors report");
    } finally {
      setLoading(false);
    }
  }, [range, statusFilter]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const filteredVisitors = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return visitors;
    return visitors.filter((item) => {
      const visitorName = String(item.visitorName || "").toLowerCase();
      const phone = String(item.phone || "").toLowerCase();
      const flat = String(item.residentId?.flatNo || "").toLowerCase();
      const purpose = String(item.purpose || "").toLowerCase();
      const wing = String(getWingLabel(item) || "").toLowerCase();
      return (
        visitorName.includes(q) ||
        phone.includes(q) ||
        flat.includes(q) ||
        purpose.includes(q) ||
        wing.includes(q)
      );
    });
  }, [searchText, visitors]);

  const stats = useMemo(() => {
    const counts = {
      total: visitors.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      arrived: 0,
      exited: 0,
      cancelled: 0,
      uniqueFlats: 0,
    };

    const flats = new Set();
    for (const v of visitors) {
      const status = String(v.status || "").toLowerCase();
      if (status in counts) counts[status] += 1;
      const flatNo = v?.residentId?.flatNo;
      if (flatNo) flats.add(String(flatNo));
    }
    counts.uniqueFlats = flats.size;
    return counts;
  }, [visitors]);

  const dailySummary = useMemo(() => {
    const map = new Map();
    for (const v of visitors) {
      const dateKey = v?.scheduledFor ? dayjs(v.scheduledFor).format("YYYY-MM-DD") : "unknown";
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    }
    const rows = Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    return rows;
  }, [visitors]);

  const exportToExcel = () => {
    const rows = filteredVisitors.map((v) => ({
      "Visitor Name": v.visitorName || "",
      Phone: v.phone || "",
      Purpose: v.purpose || "",
      "Delivery Partner": v.deliveryPartner || "",
      Wing: getWingLabel(v),
      Flat: v.residentId?.flatNo || "",
      Status: getStatusLabel(v.status),
      "Scheduled For": v.scheduledFor ? dayjs(v.scheduledFor).format("YYYY-MM-DD HH:mm") : "",
      "Arrived At": v.arrivedAt ? dayjs(v.arrivedAt).format("YYYY-MM-DD HH:mm") : "",
      "Exited At": v.exitedAt ? dayjs(v.exitedAt).format("YYYY-MM-DD HH:mm") : "",
      Notes: v.notes || "",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Visitors");

    const from = range?.[0] ? dayjs(range[0]).format("YYYY-MM-DD") : "start";
    const to = range?.[1] ? dayjs(range[1]).format("YYYY-MM-DD") : "end";
    XLSX.writeFile(wb, `visitor-report_${from}_to_${to}.xlsx`);
  };

  const columns = useMemo(
    () => [
      { title: "Visitor", dataIndex: "visitorName", key: "visitorName" },
      { title: "Phone", dataIndex: "phone", key: "phone", render: (value) => value || "-" },
      {
        title: "Purpose",
        dataIndex: "purpose",
        key: "purpose",
        render: (_, record) =>
          record.deliveryPartner ? `${record.purpose} (${record.deliveryPartner})` : record.purpose,
      },
      {
        title: "Wing",
        key: "wing",
        render: (_, record) => getWingLabel(record),
      },
      {
        title: "Flat",
        key: "flat",
        render: (_, record) => record.residentId?.flatNo || "-",
      },
      {
        title: "Scheduled",
        dataIndex: "scheduledFor",
        key: "scheduledFor",
        render: (value) => (value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "-"),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (value) => (
          <Tag color={STATUS_COLORS[String(value || "").toLowerCase()] || "default"}>
            {getStatusLabel(value)}
          </Tag>
        ),
      },
    ],
    []
  );

  return (
    <SocietyLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl shadow-inner hidden sm:flex items-center justify-center h-12 w-12">
              <TeamOutlined className="text-2xl" />
            </div>
            <div>
              <Title level={2} className="!mb-1 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-indigo-600 font-bold">
                Visitor Report
              </Title>
              <Text type="secondary" className="text-gray-500 font-medium">
                Filter visitors by date and status, then export as Excel
              </Text>
            </div>
          </div>

          <Space size="middle" wrap className="w-full lg:w-auto">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchVisitors}
              loading={loading}
              size="large"
              className="rounded-xl w-full sm:w-auto"
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportToExcel}
              disabled={filteredVisitors.length === 0}
              size="large"
              className="bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 border-0 shadow-md hover:shadow-lg rounded-xl w-full sm:w-auto"
            >
              Export Excel
            </Button>
          </Space>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <Space wrap size="middle" className="w-full">
            <RangePicker
              value={range}
              onChange={(value) => setRange(value || [])}
              allowClear={false}
            />
            <Select
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={setStatusFilter}
              style={{ width: 200 }}
            />
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search by name / phone / flat / wing / purpose"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ minWidth: 320 }}
              allowClear
            />
          </Space>
          <div className="mt-3">
            <Text type="secondary">Filters auto-refresh the report.</Text>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
          <Card className="rounded-2xl shadow-sm border border-gray-100">
            <Text type="secondary">Total</Text>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          </Card>
          <Card className="rounded-2xl shadow-sm border border-gray-100">
            <Text type="secondary">Pending</Text>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </Card>
          <Card className="rounded-2xl shadow-sm border border-gray-100">
            <Text type="secondary">Approved</Text>
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
          </Card>
          <Card className="rounded-2xl shadow-sm border border-gray-100">
            <Text type="secondary">Inside</Text>
            <div className="text-2xl font-bold text-green-600">{stats.arrived}</div>
          </Card>
          <Card className="rounded-2xl shadow-sm border border-gray-100">
            <Text type="secondary">Left</Text>
            <div className="text-2xl font-bold text-gray-700">{stats.exited}</div>
          </Card>
          <Card className="rounded-2xl shadow-sm border border-gray-100">
            <Text type="secondary">Unique Flats</Text>
            <div className="text-2xl font-bold text-indigo-600">{stats.uniqueFlats}</div>
          </Card>
        </div>

        {visitors.length === 0 && !loading && (
          <Alert
            type="info"
            showIcon
            message="No visitors found"
            description="Try expanding the date range and click Refresh."
            className="rounded-2xl"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card
            title="Daily Summary"
            className="rounded-2xl shadow-sm border border-gray-100"
          >
            <Table
              rowKey="date"
              size="small"
              pagination={false}
              dataSource={dailySummary}
              columns={[
                { title: "Date", dataIndex: "date", key: "date" },
                { title: "Visitors", dataIndex: "count", key: "count" },
              ]}
            />
          </Card>

          <Card
            title="Visitors List"
            className="lg:col-span-2 rounded-2xl shadow-sm border border-gray-100"
          >
            <Table
              rowKey="_id"
              loading={loading}
              columns={columns}
              dataSource={filteredVisitors}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      </div>
    </SocietyLayout>
  );
}
