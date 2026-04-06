import User from "../models/User.js";
import WingAdmin from "../models/wingAdminModel.js";
import { sendWhatsApp } from "./whatsapp.js";
import { sendWhatsAppWebMessage } from "./whatsappService.js";

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "");

const sendWithFallback = async (phone, text) => {
  try {
    await sendWhatsAppWebMessage(phone, text);
    return { ok: true, channel: "web" };
  } catch (webErr) {
    try {
      await sendWhatsApp(phone, text);
      return { ok: true, channel: "cloud" };
    } catch (cloudErr) {
      return {
        ok: false,
        error: cloudErr.message || webErr.message || "send failed",
      };
    }
  }
};

export const notifyEmergencyToAdmins = async ({
  societyId,
  type,
  flatNo,
  wing,
  details,
}) => {
  const societyAdmins = await User.find({
    societyId,
    role: "society",
  }).select("username email phone");

  const wingAdmins = await WingAdmin.find({ societyId }).select("name phone wing");

  const recipients = [...societyAdmins, ...wingAdmins];
  const seen = new Set();
  const phones = [];

  for (const person of recipients) {
    const normalized = normalizePhone(person.phone);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    phones.push(normalized);
  }

  if (!phones.length) {
    return { sent: 0, failed: 0, reason: "No admin phone numbers configured" };
  }

  const text = [
    "EMERGENCY ALERT - RGMS",
    `Type: ${type || "Security"}`,
    `Flat: ${flatNo || "-"}`,
    `Wing: ${wing || "-"}`,
    `Details: ${details || "-"}`,
  ].join("\n");

  let sent = 0;
  let failed = 0;
  for (const phone of phones) {
    const result = await sendWithFallback(phone, text);
    if (result.ok) sent += 1;
    else failed += 1;
  }

  return { sent, failed };
};
