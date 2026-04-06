import React from 'react'
import heroImage from '../assets/hero-image.png';
import { Link  as RouterLink} from 'react-router-dom';

const Hero = () => {
  return (
    <div className="bg-blue-50 py-16 md:py-24  mt-15" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Welcome to MYBuilding <br />
            <span className="text-blue-600">Smart Society Maintenance & Security</span>
          </h1>
          <p className="text-lg text-gray-600">
            Digital Solutions for Modern Communities. MYBuilding offers a seamless, 
            digital solution for society maintenance, billing, visitor management, and security. 
            Empower your community with transparency, efficiency, and peace of mind.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 shadow-lg transition transform hover:scale-105">
           <RouterLink to="/OnlineDemo">
            Schedule a Free Demo
            </RouterLink>
          </button>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          {/* Placeholder for the "Woman using MYBuilding app" image */}
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 bg-blue-200 rounded-full blur opacity-30"></div>
            <img 
              src={heroImage} 
              alt="App Usage" 
              className=" rounded-2xl shadow-2xl z-10 w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero
