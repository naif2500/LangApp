import React, { useState, useEffect } from 'react';
import Logo from './Logo';

const Hero = () => {
  const [inputValue, setInputValue] = useState('Hi');
  const [showCorrect, setShowCorrect] = useState(true);

  return (
    <div className="bg-white-100 min-h-[70vh] flex items-center">
      <div className="container mx-auto flex flex-col lg:flex-row items-center p-6 lg:space-x-6">
        <div className="flex-1 text-left">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Learn a Language with What You Love</h1>
          <p className="mt-4 text-lg text-gray-700">
          Turn your favorite content into personalized language lessons. Discover the joy of learning with content that truly matters to you.
          </p>
          <div className="mt-6">
            <a href="#" className="rounded-md bg-sky-400 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
              Get Started
            </a>
            <a href="#" className="ml-4 text-sm font-semibold text-indigo-600 hover:underline">
              Learn More
            </a>
          </div>
        </div>
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="mockup-window bg-base-300 border min-h-[315px]">
            <div className="bg-base-200 flex flex-col justify-center items-center px-4 py-16">
              <div className="mb-4">Hola</div>
              <div className="w-full flex justify-center">
                <div className="border border-gray-300 rounded-md w-full max-w-xs px-4 py-2 text-gray-700 bg-white">
                  {inputValue}
                </div>
              </div>
              {showCorrect && (
                <div className="mt-4 text-green-600 font-bold">Correct</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
