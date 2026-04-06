import { Link } from "lucide-react";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

const AboutUs = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left Content */}
        <div>
          <h6 className="text-blue-600 text-5xl font-bold mb-4">
            About Us
          </h6>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-6">
            <span className="text-blue-600">MY Building</span> Your Trusted Partner
            in Building Maintenance and Gate Security
          </h2>

          <p className="text-gray-600 leading-relaxed mb-8">
            Welcome to MY-Building, your trusted partner in comprehensivMY Building
            maintenance and gate security solutions. Our mission is to ensure
            that your properties remain in top-notch condition while providing
            unparalleled security to safeguard your premises. With a focus on
            excellence and customer satisfaction, we bring expertise,
            reliability, and innovative solutions to every project we
            undertake.
          </p>

          <button
            className="inline-flex items-center gap-2 
                       bg-blue-600 hover:bg-blue-700 
                       text-white px-8 py-3 
                       rounded-full font-medium 
                       transition-all duration-300
                       shadow-lg hover:shadow-xl"
          >
            <RouterLink to="/contact" className="flex items-center gap-2">
              Join now
              <span className="text-lg">→</span>
            </RouterLink>
          </button>
        </div>

        {/* Right Image */}
        <div className="flex justify-center">
          <img
            src="https://illustrations.popsy.co/blue/online-shopping.svg"
            alt="About MY-Building"
            className="w-full max-w-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
