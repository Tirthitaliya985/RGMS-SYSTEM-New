import React from "react";
import { Link as RouterLink } from "react-router-dom";

const FreeTrial = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="rounded-3xl px-10 py-14 flex flex-col lg:flex-row 
                     items-start lg:items-center justify-between gap-10
                     bg-linear-to-r from-pink-800 via-purple-900 to-black"
        >
          {/* Left Content */}
          <div className="w-full lg:w-2/3">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-10">
              Start Your 30 Days Free Trial!
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Name */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Enter your name
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="w-full bg-transparent border-b border-white 
                             text-white outline-none py-2"
                />
              </div>

              {/* Number */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Enter your number
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="w-full bg-transparent border-b border-white 
                             text-white outline-none py-2"
                />
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="w-full lg:w-auto">
            <button
              className="bg-gray-200 hover:bg-white text-black font-semibold
                         px-10 py-4 rounded-xl transition duration-300
                         shadow-md"
            ><RouterLink to="/OnlineDemo" className="text-black no-underline">
              Get Free Trial
            </RouterLink>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeTrial;
