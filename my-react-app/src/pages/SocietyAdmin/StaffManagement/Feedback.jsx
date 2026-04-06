import { Input, Select, Button } from "antd";
import { useState, useEffect } from "react";
import api from "@/api/api";

export default function Feedback() {
  const [staff, setStaff] = useState([]);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/staff").then(res => setStaff(res.data.data));
  }, []);

  const submit = () => {
    api.post("/staff-feedback", {
      staff: selected,
      message
    });
  };

  return (
    <>
      <Select onChange={setSelected}>
        {staff.map(s => (
          <Select.Option key={s._id}>{s.name}</Select.Option>
        ))}
      </Select>

      <Input.TextArea onChange={e => setMessage(e.target.value)} />

      <Button onClick={submit}>Submit</Button>
    </>
  );
}
