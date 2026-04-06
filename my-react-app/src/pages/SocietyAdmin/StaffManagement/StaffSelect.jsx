import { Select } from "antd";
import { useEffect, useState } from "react";
import api from "@/api/api";

export default function StaffSelect({ value, onChange, placeholder = "Select Staff" }) {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    api.get("/staff").then(res => setStaff(res.data.data));
  }, []);

  return (
    <Select
      placeholder={placeholder}
      style={{ minWidth: 200 }}
      value={value}
      onChange={onChange}
      allowClear
    >
      {staff.map(s => (
        <Select.Option key={s._id} value={s._id}>
          {s.name}
        </Select.Option>
      ))}
    </Select>
  );
}
