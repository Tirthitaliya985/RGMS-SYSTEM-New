import DemoVisitor from '../models/DemoVisitor.js';
import DemoUser from '../models/DemoUser.js';
import User from '../models/User.js';
import Society from '../models/Society.js';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/notifications.js';
import { sendWhatsApp } from '../utils/whatsapp.js';
import { sendWhatsAppWebMessage } from '../utils/whatsappService.js';
import { generateDemoGuidePdf } from '../utils/demoGuide.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseRecipients = (raw = '') =>
  String(raw)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizePhone = (value = '') => {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const toSlug = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 12) || 'demo';

const buildDemoSocietyName = (visitor) => {
  const base = `${visitor?.firstName || ''} ${visitor?.lastName || ''}`.trim();
  return base ? `Demo Society - ${base}` : 'Demo Society';
};

const resolveDemoSociety = async (visitor) => {
  const fixedId = String(process.env.DEMO_SOCIETY_ID || '').trim();
  const isPlaceholder =
    !fixedId ||
    fixedId.toUpperCase().includes("PUT_EXISTING_SOCIETY_ID_HERE");
  if (fixedId && !isPlaceholder && mongoose.isValidObjectId(fixedId)) {
    const society = await Society.findById(fixedId);
    if (society) return society;
  }

  const name = String(process.env.DEMO_SOCIETY_NAME || '').trim() || buildDemoSocietyName(visitor);
  let society = await Society.findOne({ name }).lean();
  if (society) return society;

  const location = String(process.env.DEMO_SOCIETY_LOCATION || 'Demo City').trim();
  const address = String(process.env.DEMO_SOCIETY_ADDRESS || 'Demo Address').trim();
  const contact = String(process.env.DEMO_SOCIETY_CONTACT || '9999999999').trim();
  const units = Number(process.env.DEMO_SOCIETY_UNITS || 100);

  society = await Society.create({
    name,
    location,
    address,
    contact,
    units,
    amenities: ['Demo Gym', 'Demo Clubhouse'],
    visitorRules: true,
    createdBy: 'demo-seed',
  });

  return society;
};

const buildDemoEmail = (visitor) => {
  const visitorEmail = String(visitor?.email || '').trim().toLowerCase();
  const visitorDomain = visitorEmail.includes('@') ? visitorEmail.split('@')[1] : '';
  const domain = process.env.DEMO_USER_EMAIL_DOMAIN || visitorDomain || 'example.com';
  const slug = toSlug(`${visitor?.firstName || ''}${visitor?.lastName || ''}`);
  const suffix = String(visitor?._id || '').slice(-6) || crypto.randomBytes(3).toString('hex');
  return `${slug}.${suffix}@${domain}`.toLowerCase();
};

const buildDemoPassword = () => '123456';

const buildDemoExpiryDate = () => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  return expiry;
};

const ensureDemoCredentials = async (visitor) => {
  if (visitor?.demoEmail && visitor?.password && visitor?.demoSocietyName) {
    return {
      demoEmail: visitor.demoEmail,
      password: visitor.password,
      demoSocietyName: visitor.demoSocietyName,
    };
  }

  const demoExpiresAt = buildDemoExpiryDate();
  const demoSociety = await resolveDemoSociety(visitor);
  const demoSocietyName = visitor.demoSocietyName || demoSociety?.name || buildDemoSocietyName(visitor);
  const demoEmail = visitor.demoEmail || buildDemoEmail(visitor);
  const demoPassword = visitor.password || buildDemoPassword();
  const demoName =
    `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim() || 'Demo Visitor';

  let demoUser = await DemoUser.findOne({ email: demoEmail });
  if (!demoUser) {
    demoUser = await DemoUser.create({
      name: demoName,
      email: demoEmail,
      password: demoPassword,
      phone: visitor.phone || '0000000000',
      role: 'society',
      apartment: visitor.hostUnit || 'Demo',
      societyId: demoSociety?._id,
      demoExpiresAt,
    });
  } else {
    demoUser.name = demoName;
    demoUser.phone = visitor.phone || demoUser.phone;
    demoUser.role = 'society';
    demoUser.password = demoPassword;
    demoUser.societyId = demoSociety?._id;
    demoUser.demoExpiresAt = demoExpiresAt;
    await demoUser.save();
  }

  visitor.demoEmail = demoEmail;
  visitor.password = demoPassword;
  visitor.demoSocietyName = demoSocietyName;
  visitor.demoUserId = demoUser._id;
  visitor.demoExpiresAt = demoExpiresAt;

  return { demoEmail, password: demoPassword, demoSocietyName, demoExpiresAt };
};

const buildDemoVisitorMessage = (visitor) => {
  const visitDate = visitor?.visitDate
    ? new Date(visitor.visitDate).toLocaleDateString('en-IN')
    : '-';
  return [
    'New demo visit request received.',
    `Name: ${visitor.firstName || ''} ${visitor.lastName || ''}`.trim(),
    `Phone: ${visitor.phone || '-'}`,
    `Email: ${visitor.email || '-'}`,
    `Location: ${visitor.city || '-'}, ${visitor.state || '-'}`,
    `Visit: ${visitDate} ${visitor.visitTime || ''}`.trim(),
    `Purpose: ${visitor.purpose || '-'}`,
  ].join('\n');
};

const buildVisitorConfirmationMessage = (visitor) => {
  const fullName = `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim() || 'Visitor';
  const liveDemoUrl = process.env.LIVE_DEMO_URL || process.env.DEMO_LIVE_URL || '';
  const demoGuideUrl = process.env.DEMO_GUIDE_URL || '';
  const lines = [
    `Hi ${fullName},`,
    'Thanks for your demo visit request for our Society Management Project.',
    'Our team will contact you shortly for the walkthrough.',
  ];

  if (liveDemoUrl) lines.push(`Live Demo: ${liveDemoUrl}`);
  if (demoGuideUrl) lines.push(`Demo Guide: ${demoGuideUrl}`);

  lines.push('Regards, RGMS Team');
  return lines.join('\n');
};

const buildApprovedDemoMessage = (visitor, demoDetails = {}) => {
  const fullName = `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim() || 'Visitor';
  const liveDemoUrl = process.env.LIVE_DEMO_URL || process.env.DEMO_LIVE_URL || '';
  const demoGuideUrl = process.env.DEMO_GUIDE_URL || '';
  const { demoEmail, password, demoSocietyName } = demoDetails;
  const lines = [
    `Hi ${fullName},`,
    'Your demo request has been approved.',
    'Please check project demo details below:',
  ];

  if (liveDemoUrl) lines.push(`Project Link: ${liveDemoUrl}`);
  if (demoGuideUrl) lines.push(`Usage PDF: ${demoGuideUrl}`);
  if (demoSocietyName) lines.push(`Demo Society: ${demoSocietyName}`);
  if (demoEmail) lines.push(`Login Email: ${demoEmail}`);
  if (password) lines.push(`Password: ${password}`);
  lines.push('Demo account is society-admin only. Super admin access is disabled.');
  lines.push('If you need help, reply to this message. Regards, RGMS Team');

  return lines.join('\n');
};

const notifyDemoVisitorRequest = async (visitor) => {
  const users = await User.find({ role: 'admin' }).select('email phone').lean();

  const envPhones = parseRecipients(
    process.env.DEMO_VISITOR_ALERT_PHONES || process.env.ADMIN_ALERT_PHONES
  );
  const envEmails = parseRecipients(
    process.env.DEMO_VISITOR_ALERT_EMAILS || process.env.ADMIN_ALERT_EMAILS
  );

  const phoneSet = new Set(envPhones.map(normalizePhone).filter(Boolean));
  const emailSet = new Set(envEmails.map((item) => item.toLowerCase()));

  users.forEach((user) => {
    const phone = normalizePhone(user.phone);
    if (phone) phoneSet.add(phone);
    if (user.email) emailSet.add(String(user.email).trim().toLowerCase());
  });

  const messageText = buildDemoVisitorMessage(visitor);
  const emailSubject = 'New Demo Visitor Request';
  const emails = Array.from(emailSet);
  const phones = Array.from(phoneSet);

  const emailResults = await Promise.allSettled(
    emails.map((to) =>
      sendEmail({
        to,
        subject: emailSubject,
        text: messageText,
      })
    )
  );

  const whatsappResults = await Promise.allSettled(
    phones.map(async (phone) => {
      try {
        await sendWhatsAppWebMessage(phone, messageText);
      } catch (webErr) {
        await sendWhatsApp(phone, messageText);
      }
    })
  );

  return {
    email: {
      total: emails.length,
      sent: emailResults.filter((item) => item.status === 'fulfilled').length,
      failed: emailResults.filter((item) => item.status === 'rejected').length,
    },
    whatsapp: {
      total: phones.length,
      sent: whatsappResults.filter((item) => item.status === 'fulfilled').length,
      failed: whatsappResults.filter((item) => item.status === 'rejected').length,
    },
  };
};

const notifyVisitorWithDemoDetails = async (visitor) => {
  const messageText = buildVisitorConfirmationMessage(visitor);
  const email = String(visitor?.email || '').trim().toLowerCase();
  const phone = normalizePhone(visitor?.phone || '');

  const outcomes = {
    email: { attempted: Boolean(email), sent: false },
    whatsapp: { attempted: Boolean(phone), sent: false },
  };

  if (email) {
    try {
      await sendEmail({
        to: email,
        subject: 'Your Demo Request is Received - RGMS',
        text: messageText,
      });
      outcomes.email.sent = true;
    } catch (err) {
      console.error('Demo visitor confirmation email failed:', err.message);
    }
  }

  if (phone) {
    try {
      await sendWhatsAppWebMessage(phone, messageText);
      outcomes.whatsapp.sent = true;
    } catch (webErr) {
      try {
        await sendWhatsApp(phone, messageText);
        outcomes.whatsapp.sent = true;
      } catch (cloudErr) {
        console.error(
          'Demo visitor confirmation WhatsApp failed:',
          cloudErr.message || webErr.message
        );
      }
    }
  }

  return outcomes;
};

const notifyVisitorOnApproval = async (visitor, demoDetails = {}) => {
  const messageText = buildApprovedDemoMessage(visitor, demoDetails);
  const email = String(visitor?.email || '').trim().toLowerCase();
  const phone = normalizePhone(visitor?.phone || '');
  const localGuidePath = path.resolve(__dirname, '..', '..', 'docs', 'Society-Management-Demo-Guide.pdf');
  const hasLocalGuide = fs.existsSync(localGuidePath);
  const liveDemoUrl = process.env.LIVE_DEMO_URL || process.env.DEMO_LIVE_URL || '';
  let generatedGuidePath = '';

  try {
    if (demoDetails?.demoEmail && demoDetails?.password) {
      generatedGuidePath = await generateDemoGuidePdf({
        visitorId: visitor._id,
        demoSocietyName: demoDetails.demoSocietyName,
        demoEmail: demoDetails.demoEmail,
        password: demoDetails.password,
        liveDemoUrl,
      });
    }
  } catch (err) {
    console.error('Demo guide PDF generation failed:', err.message);
  }

  const outcomes = {
    email: { attempted: Boolean(email), sent: false },
    whatsapp: { attempted: Boolean(phone), sent: false },
  };

  if (email) {
    try {
      await sendEmail({
        to: email,
        subject: 'Demo Request Approved - Project Link & Usage Guide',
        text: messageText,
        attachments: generatedGuidePath
          ? [
              {
                filename: 'Society-Management-Demo-Guide.pdf',
                path: generatedGuidePath,
              },
            ]
          : hasLocalGuide
            ? [
                {
                  filename: 'Society-Management-Demo-Guide.pdf',
                  path: localGuidePath,
                },
              ]
            : undefined,
      });
      outcomes.email.sent = true;
    } catch (err) {
      console.error('Demo visitor approval email failed:', err.message);
    }
  }

  if (phone) {
    try {
      await sendWhatsAppWebMessage(phone, messageText);
      outcomes.whatsapp.sent = true;
    } catch (webErr) {
      try {
        await sendWhatsApp(phone, messageText);
        outcomes.whatsapp.sent = true;
      } catch (cloudErr) {
        console.error(
          'Demo visitor approval WhatsApp failed:',
          cloudErr.message || webErr.message
        );
      }
    }
  }

  return outcomes;
};

// Get all visitors
export const getAllVisitors = async (req, res) => {
  try {
    const visitors = await DemoVisitor.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single visitor
export const getVisitor = async (req, res) => {
  try {
    const visitor = await DemoVisitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        error: 'Visitor not found',
      });
    }
    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create visitor
export const createVisitor = async (req, res) => {
  try {
    const visitor = await DemoVisitor.create(req.body);
    try {
      const notifyResult = await notifyDemoVisitorRequest(visitor);
      console.log('Demo visitor notification summary:', notifyResult);
    } catch (notifyErr) {
      console.error('Demo visitor notification failed:', notifyErr.message);
    }
    try {
      const visitorNotifyResult = await notifyVisitorWithDemoDetails(visitor);
      console.log('Demo visitor confirmation summary:', visitorNotifyResult);
    } catch (visitorNotifyErr) {
      console.error('Demo visitor confirmation failed:', visitorNotifyErr.message);
    }

    res.status(201).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update visitor
export const updateVisitor = async (req, res) => {
  try {
    const visitor = await DemoVisitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        error: 'Visitor not found',
      });
    }

    const previousStatus = visitor.status;
    Object.entries(req.body || {}).forEach(([key, value]) => {
      visitor[key] = value;
    });

    const currentStatus = String(visitor.status || '');
    const isNowApproved = currentStatus === 'Approved' && previousStatus !== 'Approved';
    let demoDetails = null;
    if (isNowApproved) {
      demoDetails = await ensureDemoCredentials(visitor);
    }

    await visitor.save();

    if (isNowApproved) {
      try {
        const approvalNotifyResult = await notifyVisitorOnApproval(visitor, demoDetails);
        console.log('Demo visitor approval notification summary:', approvalNotifyResult);
      } catch (notifyErr) {
        console.error('Demo visitor approval notification failed:', notifyErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete visitor
export const deleteVisitor = async (req, res) => {
  try {
    const visitor = await DemoVisitor.findByIdAndDelete(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        error: 'Visitor not found',
      });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get visitors by status
export const getVisitorsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const visitors = await DemoVisitor.find({ status }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get visitors by date range
export const getVisitorsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const visitors = await DemoVisitor.find({
      visitDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ visitDate: -1 });
    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
