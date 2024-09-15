import React from 'react';


const Content = () => (
  <div className="bg-white-100 min-h-[70vh] flex items-center">
      <div className="container mx-auto flex flex-col lg:flex-row items-center p-6 lg:space-x-6">
        <div className="flex-1 mt-6 lg:mt-0">
          <div className="mockup-window bg-base-300 border min-h-[315px]">
            <div className="bg-base-200 flex flex-col justify-center items-center px-4 py-16">
              <div className="mb-4">Hola</div>
             
            </div>
          </div>
        </div>
        <div className="flex-1 text-left">
          <h2 className=" font-bold text-gray-900">Step 1: Choose Your Content</h2>
          <p className="mt-4 text-lg text-gray-700">
Paste the text you're passionate about—whether its lyrics from a French song, a scene from a Spanish movie, or a passage from a Japanese manga. Learning a language becomes more fun and meaningful when its centered around what you love.


          </p>
          
        </div>
        
      </div>
    </div>
);

export default Content;
