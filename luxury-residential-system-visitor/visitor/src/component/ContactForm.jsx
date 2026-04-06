/** @format */
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

/* -------------------- helpers -------------------- */

const initialState = {
  name: "",
  email: "",
  message: "",
};

const validate = ({ name, email, message }) => {
  const errors = {};
  if (!name || name.trim().length < 2)
    errors.name = "Name must be at least 2 characters.";
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    errors.email = "Please enter a valid email address.";
  if (!message || message.trim().length < 10)
    errors.message = "Message must be at least 10 characters.";
  return errors;
};

/* -------------------- component -------------------- */

export default function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3001/contact", form);

      if (res.data?.success) {
        toast.success("Message sent successfully!");
        setForm(initialState);
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      } else {
        toast.error(res.data?.message || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 md:px-12 py-16 bg-white-700 mt-15">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ---------------- Left: Form ---------------- */}
        <div className="p-8 rounded-3xl bg-white-700 dark:bg-white-800/40 backdrop-blur-md border border-blue-200/40 dark:border-blue-400/10 shadow-lg">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-700">
            Contact Us
          </h1>
          <p className="text-sm text-blue-600/80 dark:text-blue-700 mt-1 mb-6">
            Have a question or proposal? Drop us a message and we’ll get back
            within 24 hours.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-blue-700 ">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your full name"
                className={`mt-1 w-full px-4 py-2 rounded-xl bg-white/80 dark:bg--700/50 outline-none border focus:ring-2 focus:ring-blue-400 ${
                  errors.name ? "border-red-400" : "border-blue-200"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-blue-700">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className={`mt-1 w-full px-4 py-2 rounded-xl bg-white/80 dark:bg-white-700/50 outline-none border focus:ring-2 focus:ring-blue-400 ${
                  errors.email ? "border-red-400" : "border-blue-200"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-blue-700">
                Message
              </label>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={onChange}
                placeholder="Tell us how we can help..."
                className={`mt-1 w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-white-700/50 outline-none border focus:ring-2 focus:ring-blue-400 ${
                  errors.message ? "border-red-400" : "border-blue-200"
                }`}
              />
              {errors.message && (
                <p className="text-xs text-red-500 mt-1">{errors.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-full bg-linear-to-r from-blue-600 to-sky-500 text-white font-medium shadow-lg hover:from-blue-700 hover:to-sky-600 hover:scale-[1.03] transition"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

              {sent && (
                <div className="flex items-center gap-2 text-blue-600">
                  <SuccessCheck />
                  <span className="text-sm">Sent successfully</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ---------------- Right: Info + Map ---------------- */}
        <div className="rounded-3xl overflow-hidden shadow-lg">
          <div className="p-6 bg-linear-to-b from-white-700 to-white-700 dark:from-white-800/50 dark:to-white-800/10">
            <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-700">
              Get in touch
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-700 mt-2">
              You can also reach us via WhatsApp anytime.
            </p>

            <div className="mt-6 space-y-4 to-blue-700  ">
              <InfoItem
                label="Address"
                value="Surat, Gujarat, India"
                icon="📍"
              />
              <InfoItem label="Phone" value="+91 83470 59901" icon="📞" />
              <InfoItem label="Email" value="tsp108@gmail.com" icon="✉️" />
            </div>
          </div>

          <div className="h-64">
            <iframe
              title="map"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.425659505109!2d72.87098707471948!3d21.214962981358156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f3a8c5d4cdb%3A0x7c7e87a0c64d2d8e!2sSurat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000"
            ></iframe>
          </div>
        </div>
      </div>

      <WhatsAppButton
        phone="+918347059901"
        message="Hi! I need help with your services."
      />
    </div>
  );
}

/* -------------------- small components -------------------- */

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-sm text-blue-500">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function SuccessCheck() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-blue-500/80"
      />
      <path
        d="M7.5 12.5l2.3 2.3 6-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-600"
      />
    </svg>
  );
}

function WhatsAppButton({ phone, message }) {
  const url = `https://wa.me/${phone.replace(
    /[^0-9]/g,
    "",
  )}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="fixed right-5 bottom-6 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:scale-105 transition"
    >
      <span className="text-sm font-medium hidden md:inline">
        Chat on WhatsApp
      </span>
    </a>
  );
}
