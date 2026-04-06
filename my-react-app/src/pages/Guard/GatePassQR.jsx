import { useState } from "react";
import { Alert, Button, Card, Descriptions, Input, Space, Tag, message } from "antd";
import dayjs from "dayjs";
import GuardLayout from "@/components/Layout/GuardLayout";
import api from "@/api/api";

const tokenFromInput = (value = "") => String(value).replace("RGMS_VISITOR:", "").trim();

export default function GatePassQR() {
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);

  const verify = async () => {
    const token = tokenFromInput(qr);
    if (!token) {
      message.warning("Enter valid QR token");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/visitors/qr/${token}`);
      setRecord(res.data?.data || null);
    } catch (err) {
      message.error(err.response?.data?.message || "QR not found");
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  const markInside = async () => {
    if (!record?._id) return;
    try {
      setLoading(true);
      await api.patch("/visitors/arrival", { visitorId: record._id });
      message.success("Entry marked");
      await verify();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to mark entry");
    } finally {
      setLoading(false);
    }
  };

  const markExit = async () => {
    if (!record?._id) return;
    try {
      setLoading(true);
      await api.patch("/visitors/exit", { visitorId: record._id });
      message.success("Exit marked");
      await verify();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to mark exit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuardLayout>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card title="Gate Pass QR Verification">
          <Space wrap>
            <Input
              value={qr}
              onChange={(e) => setQr(e.target.value)}
              placeholder="Scan or paste token"
              style={{ width: 360 }}
            />
            <Button type="primary" onClick={verify} loading={loading}>
              Verify
            </Button>
          </Space>
        </Card>

        {record && (
          <Card title="Visitor Details">
            {record.status === "pending" && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
                message="Resident approval pending"
              />
            )}
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Visitor">{record.visitorName}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{record.phone || "-"}</Descriptions.Item>
              <Descriptions.Item label="Flat">{record.residentId?.flatNo || "-"}</Descriptions.Item>
              <Descriptions.Item label="Purpose">{record.purpose}</Descriptions.Item>
              <Descriptions.Item label="Entry Time">
                {record.scheduledFor ? dayjs(record.scheduledFor).format("DD MMM YYYY, hh:mm A") : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag>{String(record.status || "").toUpperCase()}</Tag>
              </Descriptions.Item>
            </Descriptions>
            <Space style={{ marginTop: 12 }}>
              {record.status === "approved" && (
                <Button type="primary" onClick={markInside} loading={loading}>
                  Mark Inside
                </Button>
              )}
              {record.status === "arrived" && (
                <Button onClick={markExit} loading={loading}>
                  Mark Exit
                </Button>
              )}
            </Space>
          </Card>
        )}
      </Space>
    </GuardLayout>
  );
}
