import { Card, Select, DatePicker, Button, message, Tag } from "antd";
import { useMemo, useState, useEffect } from "react";
import api from "@/api/api";
import dayjs from "dayjs";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import io from "socket.io-client";
import { SOCKET_URL } from "@/api/backendConfig";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Attendance() {
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [date, setDate] = useState(dayjs());
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchStaff();
    fetchAttendance();

    const s = io(SOCKET_URL);
    s.on("attendanceUpdated", fetchAttendance);
    setSocket(s);

    return () => s.disconnect();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff");
      setStaff(res.data);
    } catch (err) {
      message.error("Failed to load staff");
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance");
      setAttendance(res.data);
    } catch (err) {
      message.error("Failed to fetch attendance");
    }
  };

  const markAttendance = async (status = "Present") => {
    if (!selectedStaff) return message.warning("Please select staff");

    try {
      await api.post("/attendance", {
        staff: selectedStaff,
        date: date.toDate(), // convert dayjs to Date
        status,
      });

      message.success(`${status} marked for staff`);
      fetchAttendance();
    } catch (err) {
      message.error("Failed to mark attendance");
      console.error(err);
    }
  };

  const heatmapData = attendance.map((a) => ({
    date: dayjs(a.date).format("YYYY-MM-DD"),
    count: a.status === "Present" ? 1 : 0,
  }));

  const selectedDateKey = dayjs(date).format("YYYY-MM-DD");

  const summaryData = useMemo(
    () =>
      staff.map((s) => {
        const staffAttendance = attendance.filter((a) => a.staff._id === s._id);
        const total = staffAttendance.length;
        const present = staffAttendance.filter((a) => a.status === "Present").length;
        return { name: s.name, present, total };
      }),
    [staff, attendance]
  );

  const todaySummary = useMemo(() => {
    const todays = attendance.filter(
      (a) => dayjs(a.date).format("YYYY-MM-DD") === selectedDateKey
    );
    const present = todays.filter((a) => a.status === "Present").length;
    const absent = todays.filter((a) => a.status === "Absent").length;
    const leave = todays.filter((a) => a.status === "Leave").length;
    return { total: staff.length, present, absent, leave };
  }, [attendance, staff.length, selectedDateKey]);

  const chartData = {
    labels: summaryData.map((s) => s.name),
    datasets: [
      {
        label: "Present Days",
        data: summaryData.map((s) => s.present),
        backgroundColor: "#4caf50",
      },
      {
        label: "Absent Days",
        data: summaryData.map((s) => s.total - s.present),
        backgroundColor: "#f44336",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 m-0">
              Staff Attendance
            </h2>
            <p className="text-gray-500 mt-1">
              Track daily presence and view monthly trends.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="rounded-full border-0 bg-emerald-50 text-emerald-700 font-semibold">
              {dayjs(date).format("DD MMM YYYY")}
            </Tag>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
          <div className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Total Staff
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {todaySummary.total}
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Present
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {todaySummary.present}
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Absent
            </div>
            <div className="text-2xl font-bold text-rose-600">
              {todaySummary.absent}
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Leave
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {todaySummary.leave}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <Select
            placeholder="Select Staff"
            style={{ minWidth: 240 }}
            value={selectedStaff}
            onChange={setSelectedStaff}
            showSearch
            optionFilterProp="children"
          >
            {staff.map((s) => (
              <Select.Option key={s._id} value={s._id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>

          <DatePicker value={date} onChange={setDate} />

          <Button type="primary" onClick={() => markAttendance("Present")}>
            Mark Present
          </Button>
          <Button onClick={() => markAttendance("Leave")}>Mark Leave</Button>
          <Button danger onClick={() => markAttendance("Absent")}>
            Mark Absent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card
          title="Monthly Attendance Heatmap"
          className="lg:col-span-3"
          bordered={false}
        >
          <CalendarHeatmap
            startDate={dayjs().startOf("month").toDate()}
            endDate={dayjs().endOf("month").toDate()}
            values={heatmapData}
            classForValue={(value) => {
              if (!value) return "color-empty";
              return value.count ? "color-present" : "color-absent";
            }}
          />
        </Card>
        <Card title="Monthly Summary" className="lg:col-span-2" bordered={false}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
            }}
          />
        </Card>
      </div>

      <style>{`
        .color-empty {
          background-color: #eee;
        }
        .color-present {
          background-color: #16a34a;
        }
        .color-absent {
          background-color: #ef4444;
        }
      `}</style>
    </div>
  );
}
