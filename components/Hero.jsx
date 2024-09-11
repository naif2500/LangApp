import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import AnchorLink from './AnchorLink';


const Hero = () => {
  
  return (
    <div className="relative bg-white text-center py-20 mt-4 mb-20">
    <div className="container mx-auto relative">
      {/* Heading */}
      <h1 className="text-8xl font-bold text-gray-700">
        Learn new <span className="text-sky-400">languages</span><br/>with what you love
      </h1>
      {/* Subheading */}
      <p className="text-gray-500 text-lg mt-4 max-w-lg mx-auto">
      Turn your favorite content into personalized language lessons. Discover the joy of learning with content that truly matters to you.      </p>

      {/* Floating Language Labels */}
      <div className="relative mt-8">
        <span className="absolute left-0 bottom-16 transform -translate-x-12 -translate-y-8 bg-pink-300 text-gray-900 font-medium py-2 px-4 rounded-xl">
          French
          <span className="rotate-45 scale-y-[-1] absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-pink-300 border-r-[8px] border-r-transparent"></span>

        </span>
        <span className="absolute right-0 bottom-16 transform translate-x-12 -translate-y-8 bg-purple-300 text-gray-900 font-medium py-2 px-4 rounded-xl">
          English
          <span className="-rotate-45 scale-y-[-1] absolute top-0 left-0 transform -translate-x-2 -translate-y-2 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-purple-300 border-r-[8px] border-r-transparent"></span>

        </span>
        <span className="absolute left-12 bottom-10 transform -translate-x-12 translate-y-8 bg-yellow-300 text-gray-900 font-medium py-2 px-4 rounded-xl">
          Spanish
           <span className="rotate-45 scale-y-[-1] absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-yellow-300 border-r-[8px] border-r-transparent"></span>

        </span>
        <span className="absolute right-12 bottom-10 transform translate-x-12 translate-y-8 bg-blue-300 text-gray-900 font-medium py-2 px-4 rounded-xl">
          German
          <span className="-rotate-45 scale-y-[-1] absolute top-0 left-0 transform -translate-x-2 -translate-y-2 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-blue-300 border-r-[8px] border-r-transparent"></span>

        </span>
      </div>

      {/* Buttons */}
      <div className="mt-10 flex justify-center space-x-4">
      <AnchorLink
              href="/api/auth/login"
              className="bg-sky-400 text-white text-center px-4 py-2 rounded-xl shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
              tabIndex={0}
              testId="navbar-login-desktop"
            >
              Get started
            </AnchorLink>
        <button className="border border-sky-400 text-sky-400 py-2 px-6 rounded-xl">
          Learn more
        </button>
      </div>
    </div>
  </div>
);
};

export default Hero;
