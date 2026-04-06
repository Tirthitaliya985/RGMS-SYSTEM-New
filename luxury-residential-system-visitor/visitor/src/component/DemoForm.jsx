import React, { useState } from "react";
import { motion } from "framer-motion";
import { visitorAPI } from "../services/api";
import toast from "react-hot-toast";

const DemoForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    address: "",
    visitDate: new Date().toISOString().split("T")[0],
    visitTime: "10:00",
    purpose: "Demo",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.state ||
      !formData.city ||
      !formData.visitDate ||
      !formData.visitTime
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const visitorData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        visitDate: formData.visitDate,
        visitTime: formData.visitTime,
        purpose: formData.purpose,
        status: "Pending",
      };

      const response = await visitorAPI.createVisitor(visitorData);
      if (response.data.success) {
        toast.success("Demo request submitted successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          state: "",
          city: "",
          address: "",
          visitDate: new Date().toISOString().split("T")[0],
          visitTime: "10:00",
          purpose: "Demo",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl px-10 py-12"
      >
        {/* Title */}
        <h2 className="text-4xl font-bold text-center text-blue-700 mb-10">
          Online Demo Form
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span> First name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              className="input border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span> Last name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              className="input border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="input border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span> Phone number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="input border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* State */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span> Select State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="input border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select State</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span> Select City
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="input border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select City</option>
              <option value="Surat">Surat</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Address (optional)
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              className="input border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Visit Date */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span> Visit Date
            </label>
            <input
              type="date"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleChange}
              className="input border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Visit Time */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span> Visit Time
            </label>
            <input
              type="time"
              name="visitTime"
              value={formData.visitTime}
              onChange={handleChange}
              className="input border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Purpose
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="input border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Property Tour">Property Tour</option>
              <option value="Demo">Demo</option>
              <option value="Inquiry">Inquiry</option>
              <option value="Complaint">Complaint</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Button */}
          <div className="md:col-span-2">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Submitting...
                </>
              ) : (
                "Send"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </section>
  );
};

export default DemoForm;
