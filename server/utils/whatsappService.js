import express from "express";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { protect, allowRoles } from "../middleware/authMiddleware.js";



const { Client, LocalAuth } = pkg;
let messageQueue = [];
let isClientReady = false;
let isInitializing = false;
let lastInitError = null;
let client = null;
const router = express.Router();
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED !== "false";
const RETRY_DELAY_MS = Number(process.env.RETRY_DELAY_MS || 15000);

const createWhatsAppClient = () =>
  new Client({
    authStrategy: new LocalAuth({ clientId: "rgms-main" }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    },
  });

const bindClientEvents = (instance) => {
  instance.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("Scan this QR code with your WhatsApp app");
  });

  instance.on("ready", async () => {
    console.log("WhatsApp client is ready!");
    isClientReady = true;
    lastInitError = null;

    // Send queued messages
    if (messageQueue.length > 0) {
      console.log(`Sending ${messageQueue.length} queued messages...`);
      for (let { staffList, messageText, resolve, reject } of messageQueue) {
        try {
          for (let staff of staffList) {
            if (!staff.phone) continue;
            const number = formatNumber(staff.phone);
            await instance.sendMessage(number, messageText);
          }
          resolve({ success: true });
        } catch (err) {
          reject(err);
        }
      }
      messageQueue = [];
    }
  });

  instance.on("auth_failure", () => {
    isClientReady = false;
    console.log("Auth failed. Please delete the session folder and retry.");
  });

  instance.on("disconnected", (reason) => {
    console.log("WhatsApp client disconnected:", reason);
    isClientReady = false;
    scheduleReinitialize();
  });

  instance.on("change_state", (state) => {
    if (state !== "CONNECTED") {
      isClientReady = false;
    }
  });
};

const scheduleReinitialize = () => {
  if (!WHATSAPP_ENABLED || isInitializing || isClientReady) return;

  setTimeout(() => {
    void initializeWhatsAppClient();
  }, RETRY_DELAY_MS);
};

const initializeWhatsAppClient = async () => {
  if (!WHATSAPP_ENABLED) {
    console.log("WhatsApp service disabled by WHATSAPP_ENABLED=false");
    return;
  }

  if (isInitializing || isClientReady) return;

  isInitializing = true;
  try {
    if (!client) {
      client = createWhatsAppClient();
      bindClientEvents(client);
    }
    await client.initialize();
  } catch (error) {
    isClientReady = false;
    lastInitError = error;

    const msg = String(error?.message || "");
    const isNavigationContextError =
      msg.includes("Execution context was destroyed") ||
      msg.includes("Cannot find context with specified id") ||
      msg.includes("Target closed");

    if (isNavigationContextError && client) {
      try {
        await client.destroy();
      } catch (destroyErr) {
        console.error("WhatsApp destroy after init failure failed:", destroyErr.message);
      } finally {
        client = null;
      }
    }

    console.error("WhatsApp initialization failed:", msg);
    scheduleReinitialize();
  } finally {
    isInitializing = false;
  }
};

// Keep startup non-fatal even if Puppeteer/WhatsApp fails to boot.
void initializeWhatsAppClient();

// Helper to format phone numbers for WhatsApp
function formatNumber(number) {
  // Remove all non-digits
  let cleanNumber = number.replace(/\D/g, "");

  // Ensure it has country code (example: India = 91)
  if (cleanNumber.length === 10) {
    cleanNumber = "91" + cleanNumber; // replace '91' with your country code
  }

  return cleanNumber + "@c.us"; // WhatsApp ID format
}

export const sendWhatsAppWebMessage = async (phone, messageText) => {
  if (!WHATSAPP_ENABLED) {
    throw new Error("WhatsApp web service is disabled");
  }
  if (!isClientReady) {
    throw new Error("WhatsApp web client is not ready");
  }
  if (!client) {
    throw new Error("WhatsApp web client is not initialized");
  }
  if (!phone || !messageText) {
    throw new Error("Phone and message are required");
  }

  const number = formatNumber(String(phone));
  if (!/^\d{12,15}@c\.us$/.test(number)) {
    throw new Error("Invalid number format");
  }

  await client.sendMessage(number, messageText);
};


// Send WhatsApp API endpoint
router.post("/send", async (req, res) => {
  const { staffList, message: messageText } = req.body;

  if (!staffList || !messageText) {
    return res.status(400).json({ error: "staffList and message are required" });
  }
  if (!WHATSAPP_ENABLED) {
    return res.status(503).json({ error: "WhatsApp service is disabled" });
  }

  if (!isClientReady) {
    return res.status(503).json({
      error: "WhatsApp client is not ready. Please try again shortly.",
      details: lastInitError?.message || undefined,
    });
  }

  let results = [];
  const sendPromise = new Promise((resolve, reject) => {
    (async () => {
      try {
        for (let staff of staffList) {
          if (!staff.phone) {
            results.push({
              staff: staff.name,
              status: "failed",
              reason: "No phone number",
            });
            continue;
          }

          const number = formatNumber(staff.phone);

          if (!/^\d{12,15}@c\.us$/.test(number)) {
            results.push({
              staff: staff.name,
              status: "failed",
              reason: "Invalid number format",
            });
            continue;
          }

          try {
            await client.sendMessage(number, messageText);
            results.push({ staff: staff.name, status: "sent" });
          } catch (err) {
            results.push({
              staff: staff.name,
              status: "failed",
              reason: err.message,
            });
          }
        }

        resolve({ success: true, results });
      } catch (err) {
        reject(err);
      }
    })();
  });

  try {
    const result = await sendPromise;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send messages", details: err.message });
  }
});



export default router;
