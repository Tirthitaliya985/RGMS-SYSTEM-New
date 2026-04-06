import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3001/user/contact", form);
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error);
    }
  };

  return (
    <div className="mt-20">
      {/* Header Section */}
      <div className="text-center py-12 bg-gray-100 dark:bg-blue-800">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-600 dark:text-gray-300">
          We’d love to hear from you! Please reach out with any questions.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 dark:bg-slate-800 dark:border-slate-700"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 dark:bg-slate-800 dark:border-slate-700"
                placeholder="example@gmail.com"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 dark:bg-slate-800 dark:border-slate-700"
                placeholder="Write your message here..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Contact Details */}
        <div className="flex flex-col gap-8">

          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Our Contact Info</h2>

            <div className="space-y-4">
              <p>
                <strong>📍 Address:</strong> 142 samrat soc., surat, gujarat, India
              </p>
              <p>
                <strong>📞 Phone:</strong> +91 83470 59901
              </p>
              <p>
                <strong>📧 Email:</strong> tsp108@gmail.com
              </p>
              <p>
                <strong>🕒 Hours:</strong> Mon - Sat (9 AM - 7 PM)
              </p>
            </div>
          </div>

          {/* Map Section */}
          <div className="rounded-xl overflow-hidden shadow-lg">
           <iframe src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3719.425659505109!2d72.87098707471948!3d21.214962981358156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjHCsDEyJzUzLjkiTiA3MsKwNTInMjQuOCJF!5e0!3m2!1sen!2sin!4v1763464334051!5m2!1sen!2sin"
             className="w-full h-full" 
             title="map"
             loading="lazy"
             referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;