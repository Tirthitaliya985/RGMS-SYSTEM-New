import { useEffect, useMemo, useState } from "react";
import SocietyLayout from "@/components/Layout/SocietyLayout";
import WingLayout from "@/components/Layout/WingLayout";
import ResidentLayout from "@/components/Layout/ResidentLayout";
import GuardLayout from "@/components/Layout/GuardLayout";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Select,
  Button,
  Card,
  List,
  Tag,
  Popconfirm,
} from "antd";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [form] = Form.useForm();
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  const permissions = useMemo(() => {
    const role = String(user?.role || "").toLowerCase();
    const isSociety = role === "society" || role === "society admin";
    const isWing = role === "wingadmin" || role === "wing admin";
    const isResident = role === "resident";
    const isGuard = role === "guard";

    return {
      role,
      isSociety,
      isWing,
      isResident,
      isGuard,
      canManageEvents: isSociety,
      canRSVP: isSociety || isWing || isResident,
      canCheckIn: isGuard,
      canViewAttendees: isSociety || isWing || isGuard,
    };
  }, [user?.role]);

  const Layout = permissions.isWing
    ? WingLayout
    : permissions.isResident
      ? ResidentLayout
      : permissions.isGuard
        ? GuardLayout
        : SocietyLayout;

  // Initialize Socket.IO
  useEffect(() => {
    const socketClient = io("http://localhost:5000"); // your backend URL
    setSocket(socketClient);

    // Listen for live updates
    socketClient.on("eventCreated", fetchEvents);
    socketClient.on("eventUpdated", fetchEvents);
    socketClient.on("eventDeleted", fetchEvents);
    socketClient.on("rsvpUpdated", fetchEvents);
    socketClient.on("attendanceUpdated", fetchEvents);

    return () => socketClient.disconnect();
  }, []);

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      const formatted = res.data.data.map((e) => ({
        id: e._id,
        title: e.title,
        start: e.eventDate,
        extendedProps: {
          description: e.description,
          location: e.location,
          color: e.color || "#1890ff",
          attendees: (e.attendees || []).map((a) => ({
            ...a,
            displayName:
              a?.displayName ||
              a?.userId?.name ||
              a?.userId?.ownerName ||
              a?.userId?.username ||
              a?.userId?.email ||
              a?.name ||
              a?.ownerName ||
              a?.residentName ||
              a?.userName ||
              a?.user?.name ||
              a?.resident?.ownerName ||
              "",
          })),
        },
        color: e.color || "#1890ff",
      }));
      setEvents(formatted);
      if (selectedEventId) {
        const updated = formatted.find((evt) => evt.id === selectedEventId);
        if (updated) {
          setEditingEvent(updated);
          if (open) {
            form.setFieldsValue({
              title: updated.title,
              description: updated.extendedProps?.description,
              location: updated.extendedProps?.location,
              color: updated.color || updated.extendedProps?.color,
              eventDate: dayjs(updated.start),
            });
          }
        }
      }
    } catch {
      message.error("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Create new event
  const handleDateClick = (info) => {
    if (!permissions.canManageEvents) return;
    setEditingEvent(null);
    setSelectedEventId(null);
    form.setFieldsValue({ eventDate: dayjs(info.date) });
    setOpen(true);
  };

  const openCreateEvent = () => {
    if (!permissions.canManageEvents) return;
    setEditingEvent(null);
    setSelectedEventId(null);
    form.resetFields();
    form.setFieldsValue({ eventDate: dayjs() });
    setOpen(true);
  };

  // Edit existing event
  const handleEventClick = (info) => {
    const event = info.event;
    setEditingEvent(event);
    setSelectedEventId(event.id);
    form.setFieldsValue({
      title: event.title,
      description: event.extendedProps.description,
      location: event.extendedProps.location,
      color: event.backgroundColor || event.extendedProps?.color || event.color,
      eventDate: dayjs(event.start),
    });
    setOpen(true);
  };

  // Drag & Drop event
  const handleEventDrop = async (info) => {
    if (!permissions.canManageEvents) return;
    try {
      await api.put(`/events/${info.event.id}`, { eventDate: info.event.start });
      message.success("Event updated");
      fetchEvents();
    } catch {
      message.error("Failed to update event");
    }
  };

  // Submit Create/Edit Event
  const handleSubmit = async () => {
    if (!permissions.canManageEvents) return;
    const values = await form.validateFields();
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, values);
        message.success("Event updated");
      } else {
        await api.post("/events", values);
        message.success("Event created");
      }
      setOpen(false);
      form.resetFields();
      setEditingEvent(null);
      setSelectedEventId(null);
      fetchEvents();
    } catch {
      message.error("Operation failed");
    }
  };

  const handleDeleteEvent = async () => {
    if (!permissions.canManageEvents || !editingEvent?.id) return;
    try {
      await api.delete(`/events/${editingEvent.id}`);
      message.success("Event deleted");
      setOpen(false);
      form.resetFields();
      setEditingEvent(null);
      setSelectedEventId(null);
      fetchEvents();
    } catch {
      message.error("Failed to delete event");
    }
  };

  // RSVP
  const handleRSVP = async (eventId, status) => {
    if (!permissions.canRSVP) return;
    try {
      await api.put(`/events/rsvp/${eventId}`, { status });
      message.success("RSVP updated");
      fetchEvents();
    } catch {
      message.error("RSVP failed");
    }
  };

  // QR Check-in
  const handleCheckIn = async (
    eventId,
    targetUserId,
    markAll = false,
    attendeeId
  ) => {
    if (!permissions.canCheckIn) return;
    try {
      await api.put(`/events/attendance/${eventId}`, {
        userId: targetUserId,
        markAll,
        attendeeId,
      });
      message.success("Attendance marked!");
      fetchEvents();
    } catch {
      message.error("Check-in failed");
    }
  };

  // Count attendees by status
  const getRSVPCount = (event, status) =>
    event.extendedProps.attendees.filter((a) => a.status === status).length;

  const getCheckedInCount = (event) =>
    event.extendedProps.attendees.filter((a) => a.checkedIn).length;

  const getAttendeeName = (attendee) => {
    if (!attendee) return "Unknown";
    if (typeof attendee === "string") return attendee;
    if (attendee.displayName) return attendee.displayName;
    return (
      attendee.name ||
      attendee.ownerName ||
      attendee.residentName ||
      attendee.userName ||
      attendee.user?.name ||
      attendee.resident?.ownerName ||
      attendee.userId?.name ||
      attendee.userId?.ownerName ||
      attendee.userId?.username ||
      attendee.userId?.email ||
      attendee._id ||
      "Unknown"
    );
  };

  const eventStats = useMemo(() => {
    const now = dayjs();
    const sortedUpcoming = [...events]
      .filter((e) => dayjs(e.start).isAfter(now))
      .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

    return {
      total: events.length,
      today: events.filter((e) => dayjs(e.start).isSame(now, "day")).length,
      upcoming: sortedUpcoming.length,
      upcomingList: sortedUpcoming.slice(0, 5),
    };
  }, [events]);

  const roleLabel = permissions.isSociety
    ? "Society Admin"
    : permissions.isWing
      ? "Wing Admin"
      : permissions.isResident
        ? "Resident"
        : permissions.isGuard
          ? "Guard"
          : "User";

  return (
    <Layout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  Community Events
                </h2>
                <Tag className="rounded-full border-0 bg-blue-50 text-blue-700 font-semibold">
                  {roleLabel}
                </Tag>
              </div>
              <p className="text-gray-500 mt-1">
                Plan, join, and track society activities in one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {permissions.canManageEvents && (
                <Button type="primary" onClick={openCreateEvent}>
                  Create Event
                </Button>
              )}
              <Button onClick={fetchEvents} type="default">
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                Total Events
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {eventStats.total}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                Today
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {eventStats.today}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                Upcoming
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {eventStats.upcoming}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-slate-50/60">
              <div className="text-sm font-semibold text-gray-700">
                Calendar View
              </div>
            </div>
            <div className="p-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                editable={permissions.canManageEvents}
                selectable={permissions.canManageEvents}
                events={events}
                dateClick={permissions.canManageEvents ? handleDateClick : undefined}
                eventClick={handleEventClick}
                eventDrop={permissions.canManageEvents ? handleEventDrop : undefined}
                height="70vh"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-slate-50/60">
                <div className="text-sm font-semibold text-gray-700">
                  Upcoming Events
                </div>
              </div>
              <div className="p-4">
                <List
                  dataSource={eventStats.upcomingList}
                  locale={{ emptyText: "No upcoming events" }}
                  renderItem={(item) => (
                    <List.Item>
                      <div className="flex items-start gap-3">
                        <span
                          className="h-3 w-3 rounded-full mt-1"
                          style={{ backgroundColor: item.color || "#1890ff" }}
                        />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {dayjs(item.start).format("DD MMM YYYY, hh:mm A")}
                            {item.extendedProps?.location
                              ? ` • ${item.extendedProps.location}`
                              : ""}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="text-sm font-semibold text-gray-700">
                Your Access
              </div>
              <div className="text-xs text-gray-500 mt-2 leading-relaxed">
                {permissions.canManageEvents &&
                  "You can create, edit, and delete events. RSVP is available."}
                {!permissions.canManageEvents &&
                  permissions.canRSVP &&
                  "You can RSVP to events."}
                {!permissions.canManageEvents &&
                  !permissions.canRSVP &&
                  permissions.canCheckIn &&
                  "You can mark attendance for events and view attendees."}
                {!permissions.canManageEvents &&
                  !permissions.canRSVP &&
                  !permissions.canCheckIn &&
                  "You have view access to the events calendar and attendees list."}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .fc .fc-toolbar-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #111827;
          }
          .fc .fc-button {
            border-radius: 10px;
            border-color: #e5e7eb;
          }
          .fc .fc-daygrid-day-frame {
            background: #fff;
          }
        `}</style>
      </div>

      {/* Event Modal */}
      <Modal
        open={open}
        title={
          permissions.canManageEvents
            ? editingEvent
              ? "Edit Event"
              : "Create Event"
            : "Event Details"
        }
        onCancel={() => {
          setOpen(false);
          setEditingEvent(null);
          setSelectedEventId(null);
          form.resetFields();
        }}
        onOk={permissions.canManageEvents ? handleSubmit : undefined}
        width={600}
        okText={permissions.canManageEvents ? "Save" : undefined}
        footer={
          permissions.canManageEvents
            ? [
                editingEvent && (
                  <Popconfirm
                    key="delete"
                    title="Delete this event?"
                    description="This action cannot be undone."
                    onConfirm={handleDeleteEvent}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger>Delete</Button>
                  </Popconfirm>
                ),
                <Button
                  key="cancel"
                  onClick={() => {
                    setOpen(false);
                    setEditingEvent(null);
                    setSelectedEventId(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>,
                <Button key="save" type="primary" onClick={handleSubmit}>
                  Save
                </Button>,
              ]
            : [
                <Button
                  key="close"
                  type="primary"
                  onClick={() => {
                    setOpen(false);
                    setEditingEvent(null);
                    setSelectedEventId(null);
                    form.resetFields();
                  }}
                >
                  Close
                </Button>,
              ]
        }
      >
        <Form form={form} layout="vertical" disabled={!permissions.canManageEvents}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="eventDate"
            label="Event Date"
            rules={[{ required: true }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input />
          </Form.Item>
          {permissions.canManageEvents && (
            <Form.Item name="color" label="Event Color">
              <Select>
                <Select.Option value="#1890ff">Blue</Select.Option>
                <Select.Option value="#52c41a">Green</Select.Option>
                <Select.Option value="#faad14">Orange</Select.Option>
                <Select.Option value="#ff4d4f">Red</Select.Option>
                <Select.Option value="#722ed1">Purple</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>

        {/* RSVP + Attendance */}
        {editingEvent && (
          <div style={{ marginTop: 20 }}>
            {permissions.canRSVP && (
              <Card title="RSVP">
                <Button
                  type="primary"
                  onClick={() => handleRSVP(editingEvent.id, "Going")}
                >
                  Going
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => handleRSVP(editingEvent.id, "Maybe")}
                >
                  Maybe
                </Button>
                <Button
                  danger
                  style={{ marginLeft: 8 }}
                  onClick={() => handleRSVP(editingEvent.id, "Declined")}
                >
                  Decline
                </Button>
                <div style={{ marginTop: 10 }}>
                  Going: {getRSVPCount(editingEvent, "Going")} | Maybe:{" "}
                  {getRSVPCount(editingEvent, "Maybe")} | Declined:{" "}
                  {getRSVPCount(editingEvent, "Declined")}
                </div>
                <div>Checked-in: {getCheckedInCount(editingEvent)}</div>
              </Card>
            )}

            {permissions.canCheckIn && (
              <Card title="Check-in" style={{ marginTop: 20 }}>
                <Button onClick={() => handleCheckIn(editingEvent.id, null, true)}>
                  Mark All Present
                </Button>
              </Card>
            )}

            {permissions.canViewAttendees && (
              <Card title="Attendees" style={{ marginTop: 20 }}>
                <List
                  dataSource={editingEvent.extendedProps.attendees || []}
                  locale={{ emptyText: "No attendees yet" }}
                  renderItem={(attendee) => (
                    <List.Item>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span>{getAttendeeName(attendee)}</span>
                        {attendee?.status && <Tag>{String(attendee.status)}</Tag>}
                        {attendee?.checkedIn && <Tag color="green">Checked-in</Tag>}
                        {permissions.canCheckIn && !attendee?.checkedIn && (
                          <Button
                            size="small"
                            onClick={() =>
                              handleCheckIn(
                                editingEvent.id,
                                attendee?.userId?._id || attendee?.userId,
                                false,
                                attendee?._id
                              )
                            }
                          >
                            Mark Present
                          </Button>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}

