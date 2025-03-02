import React from 'react';


const Contentfour = () => (
  <div className="bg-white-100 min-h-[70vh] flex items-center">
      <div className="container mx-auto flex flex-col lg:flex-row items-center p-6 lg:space-x-6">
        
        <div className="flex-1 text-left">
          <h2 className=" font-bold text-gray-900">Step 4: Level Up</h2>
          <p className="mt-4 text-lg text-gray-700">
          
As you accurately translate more words, the app gradually increases the length and complexity of the text. You'll start to form sentences, then paragraphs, and eventually, you'll be able to understand and translate the entire text. The more you play, the more you learn!
          </p>
          
        </div>
        <div className="flex-1 mt-6 lg:mt-0">
        <img src="/images/practice.png" alt="content" className="w-full h-full shadow-xl" />

        </div>
        
      </div>
    </div>
);

export default Contentfour;
