// src/utils/storage.js
export const STORAGE_KEYS = {
  ADMINS: "admins",
  RESIDENTS: "residents",
  SOCIETIES: "societies",
  EVENTS: "events",
  COMPLAINTS: "complaints",
  ACTIVITIES: "activities",
};

// Get data from localStorage
export const getData = (key, defaultValue = []) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// Set data to localStorage
export const setData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Log system activity
export const logActivity = (username, action) => {
  const activities = getData(STORAGE_KEYS.ACTIVITIES, []);
  const newActivity = {
    id: Date.now(),
    user: username,
    action,
    time: new Date().toLocaleString(),
  };
  setData(STORAGE_KEYS.ACTIVITIES, [newActivity, ...activities]);
};
