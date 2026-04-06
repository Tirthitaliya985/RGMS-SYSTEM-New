import { createContext, useEffect, useState } from "react";
import api from "@/api/api";
import { io } from "socket.io-client";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get("/notifications?page=1&limit=10");
      setNotifications(res.data.data);
      setTotal(res.data.total);
      setUnreadCount(res.data.data.filter(n => !n.isRead).length);
    };
    fetch();

    const socket = io("http://localhost:5000");
    socket.emit("joinSociety", localStorage.getItem("societyId"));

    socket.on("newNotification", (n) => {
      setNotifications(prev => [n, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        total,
        setTotal,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
