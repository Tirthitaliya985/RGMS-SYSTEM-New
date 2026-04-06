import React from "react";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import Functionalist from "../assets/functionalists.png";

const Functionalists = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <img
            src={Functionalist}
            alt="Functionalists"
            className="w-full max-w-lg"
          />
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="text-blue-600 text-5xl font-bold mb-4">
            Functionalists
          </h2>

          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
            We are always working to provide you best of the Functionalists in all aspects.
          </h3>

          <p className="text-gray-600 leading-relaxed mb-5">
            MY-Building is a dedicated team of professionals specializing in building
            maintenance and gate security. Our journey began with a simple goal:
            to deliver high-quality maintenance services and robust security
            solutions that give property owners peace of mind.
          </p>

          <p className="text-gray-600 leading-relaxed mb-8">
            At MY-Building, we are committed to building long-lasting relationships
            with our clients through trust, transparency, and exceptional service.
            Whether it’s ensuring your building is well-maintained or providing
            robust security solutions, we are here to serve you with excellence.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2
                       bg-blue-600 hover:bg-blue-700
                       text-white px-8 py-3
                       rounded-full font-medium
                       transition shadow-lg"
          >
            <RouterLink to="/contact" className="flex items-center gap-2">
              <span className="text-lg">→</span>
            Join now
            </RouterLink>
            
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
};

export default Functionalists;
