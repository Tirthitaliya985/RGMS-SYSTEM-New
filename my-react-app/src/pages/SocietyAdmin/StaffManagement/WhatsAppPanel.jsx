import { Input, Select, Button, message } from "antd";
import { useState, useEffect } from "react";
import api from "@/api/api";

export default function WhatsAppPanel() {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff");
      setStaff(res.data);
    } catch (err) {
      message.error("Failed to load staff");
    }
  };

  const sendWhatsApp = async () => {
    if (!selectedStaff) return message.warning("Please select staff");
    if (!messageText.trim()) return message.warning("Please enter message");

    let staffList = [];
    if (selectedStaff === "all") staffList = staff;
    else staffList = staff.filter((s) => s._id === selectedStaff);


    
    

    try {
      setLoading(true);
      await api.post("/whatsapp/send", { staffList, message: messageText });
      message.success("WhatsApp messages sent successfully!");
      setMessageText("");
      setSelectedStaff(null);
    } catch (err) {
      message.error("Failed to send WhatsApp messages");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Select
        placeholder="Select Staff"
        style={{ width: "100%", marginBottom: 10 }}
        value={selectedStaff}
        onChange={setSelectedStaff}
      >
        <Select.Option value="all">All Staff</Select.Option>
        {staff.map((s) => (
          <Select.Option key={s._id} value={s._id}>
            {s.name} ({s.phone})
          </Select.Option>
        ))}
      </Select>

      <Input.TextArea
        rows={4}
        placeholder="Type your WhatsApp message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
      />

      <Button
        type="primary"
        style={{ marginTop: 10 }}
        loading={loading}
        onClick={sendWhatsApp}
      >
        Send WhatsApp
      </Button>
    </>
  );
}
