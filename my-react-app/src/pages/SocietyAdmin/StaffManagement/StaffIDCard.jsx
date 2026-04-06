import { Button, Select } from "antd";
import { useState, useEffect } from "react";
import api from "@/api/api";

export default function StaffIDCard() {
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/staff").then(res => setStaff(res.data.data));
  }, []);

  const download = () => {
    window.open(`/api/idcard/${selected}`);
  };

  return (
    <>
      <Select onChange={setSelected}>
        {staff.map(s => (
          <Select.Option key={s._id}>{s.name}</Select.Option>
        ))}
      </Select>

      <Button onClick={download}>Download ID Card</Button>
    </>
  );
}
