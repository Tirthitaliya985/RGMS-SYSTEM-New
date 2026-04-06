/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Table, Input, Select, Space, message } from "antd";
import AdminLayout from "../../../components/Layout/AdminLayout";
import api from "../../../api/api";

const { Search } = Input;
const { Option } = Select;

const toTitleCase = (value = "") =>
  String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatActionLabel = (action = "") => {
  if (!action) return "N/A";
  return toTitleCase(action);
};

const isObjectIdLike = (segment = "") => /^[a-fA-F0-9]{24}$/.test(segment);

const formatRecordName = (record = {}) => {
  const rawRecordName = String(record.recordName || "").trim();

  if (rawRecordName && !rawRecordName.startsWith("/")) {
    return toTitleCase(rawRecordName);
  }

  const endpoint = String(record.endpoint || rawRecordName || "").trim();
  if (endpoint) {
    const parts = endpoint
      .replace(/^\/api\/?/i, "")
      .split("/")
      .filter((segment) => segment && !isObjectIdLike(segment));

    if (parts.length > 0) {
      return parts.map((part) => toTitleCase(part)).join(" / ");
    }
  }

  if (record.model) return toTitleCase(record.model);
  return "N/A";
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Search + Filter
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [model, setModel] = useState("");
  const [role, setRole] = useState("");

  // Meta
  const [actions, setActions] = useState([]);
  const [models, setModels] = useState([]);
  const [roles, setRoles] = useState([]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/activities/audit", {
        params: { page, limit, search, action, model, role },
      });

      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      message.error("Failed to load logs",err);
    }
    setLoading(false);
  };

  const fetchMeta = async () => {
    try {
      const res = await api.get("/activities/audit/meta");
      setActions(res.data.actions);
      setModels(res.data.models);
      setRoles(res.data.roles || []);
    } catch (err) {
      message.error("Failed to load filters",err);
    }
  };

  useEffect(() => {
    
    fetchMeta();
  }, []);

  useEffect(() => {
    
    fetchLogs();
  }, [page, limit, search, action, model, role]);

  const columns = [
    {
      title: "Action",
      dataIndex: "action",
      render: (value) => formatActionLabel(value),
    },
    { title: "Model", dataIndex: "model" },
    {
      title: "Record Name",
      dataIndex: "recordName",
      render: (_, record) => formatRecordName(record),
    },
    {
      title: "Performed By",
      render: (text, record) =>
        record.performedBy?.username || record.performedByName,
    },
    { title: "Role", dataIndex: "performedByRole" },

    { title: "Date", dataIndex: "createdAt" },
  ];

  return (
    <AdminLayout>
      <h2>Audit Logs</h2>

      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search action/model/performedByName"
          onSearch={(value) => setSearch(value)}
          allowClear
          style={{ width: 300 }}
        />

        <Select
          placeholder="Filter by action"
          onChange={(value) => setAction(value)}
          allowClear
          style={{ width: 200 }}
        >
          {actions.map((a) => (
            <Option key={a} value={a}>
              {a}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Filter by model"
          onChange={(value) => setModel(value)}
          allowClear
          style={{ width: 200 }}
        >
          {models.map((m) => (
            <Option key={m} value={m}>
              {m}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Filter by role"
          onChange={(value) => setRole(value)}
          allowClear
          style={{ width: 200 }}
        >
          {roles.map((r) => (
            <Option key={r} value={r}>
              {r}
            </Option>
          ))}
        </Select>
      </Space>

      <Table
        dataSource={logs}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            setPage(page);
            setLimit(pageSize);
          },
        }}
      />
    </AdminLayout>
  );
}
