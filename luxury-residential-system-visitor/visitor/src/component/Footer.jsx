import React from "react";
import { NavLink } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-20">
      {/* Top Footer */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14">
        
        {/* Logo & Description */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="text-blue-700 font-bold text-3xl">E</div>
            <h3 className="text-xl tracking-widest text-gray-700">
              BUILDING
            </h3>
          </div>

          <p className="text-gray-600 leading-relaxed text-sm">
            The MY-Building app revolutionizes tenant interaction with its
            smart structure by providing real-time control over environmental
            settings like climate and lighting. Users can monitor energy
            usage, receive maintenance alerts, and access building amenities
            through a user-friendly interface. This integration enhances
            convenience and promotes sustainable living.
          </p>
        </div>

        {/* Get in Touch */}
        <div>
          <h4 className="text-blue-700 font-semibold text-lg mb-6">
            Get in Touch
          </h4>

          <ul className="space-y-4 text-gray-700 text-sm">
            <li>
              <a
                href="https://www.google.com/maps/search/?api=1&query=4th%20Floor%20413%2C%20Fortune%20Plaza%2C%20opposite%20Mango%20Plus%20Cinemas%2C%20New%20India%20Colony%2C%20Nava%20Naroda%2C%20Ahmedabad%2C%20Gujarat%20382350"
                target="_blank"
                rel="noreferrer"
                className="flex gap-3 hover:text-blue-600 transition"
              >
                <MapPin size={18} className="text-blue-600 mt-1" />
                <span>
                  4th Floor 413, Fortune Plaza, opposite Mango Plus Cinemas,
                  New India Colony, Nava Naroda, Ahmedabad, Gujarat 382350
                </span>
              </a>
            </li>

            <li>
              <a
                href="tel:+917383631581"
                className="flex gap-3 items-center hover:text-blue-600 transition"
              >
                <Phone size={18} className="text-blue-600" />
                +91 7383631581
              </a>
            </li>

            <li>
              <a
                href="mailto:hello@nrcrow.com"
                className="flex gap-3 items-center hover:text-blue-600 transition"
              >
                <Mail size={18} className="text-blue-600" />
                hello@nrcrow.com
              </a>
            </li>
          </ul>

          {/* App Buttons */}
          <div className="flex gap-4 mt-6">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                className="h-10"
              />
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="App Store"
                className="h-10"
              />
            </a>
          </div>
        </div>

        {/* Learn More */}
        <div>
          <h4 className="text-blue-700 font-semibold text-lg mb-6">
            Learn More
          </h4>
          <ul className="space-y-4 text-gray-700 text-sm">
            <li>
              <NavLink to="/" className="hover:text-blue-600 transition">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/features"
                className="hover:text-blue-600 transition"
              >
                Features
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className="hover:text-blue-600 transition">
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/OnlineDemo"
                className="hover:text-blue-600 transition"
              >
                Online Demo
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className="hover:text-blue-600 transition">
                Contact
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Follow */}
        <div>
          <h4 className="text-blue-700 font-semibold text-lg mb-6">
            Follow
          </h4>
          <ul className="space-y-4 text-gray-700 text-sm">
            <li>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition"
              >
                Linkedin
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition"
              >
                Whatsapp
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 bg-blue-700 py-4">
        <p className="text-center text-white text-sm">
          (c) 2024 MY-Building. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

