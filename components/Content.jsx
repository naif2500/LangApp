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
          <h2 className=" font-bold text-gray-900">How it works</h2>
          <p className="mt-4 text-sm text-gray-700">
          Step 1: Choose Your Content
Paste the text you're passionate about—whether it’s lyrics from a French song, a scene from a Spanish movie, or a passage from a Japanese manga. Learning a language becomes more fun and meaningful when it’s centered around what you love.

Step 2: Set Your Languages
Select your source language (the language of the text) and the target language (the one you want to learn). Whether you’re brushing up on your high school Spanish or diving into Japanese for the first time, you set the pace.

Step 3: Start Learning
Our app translates the text into your target language, but here’s the twist: instead of just giving you the answers, we let you guess the translations. Start with individual words—correct guesses will help you unlock full sentences.

Step 4: Level Up
As you accurately translate more words, the app gradually increases the length and complexity of the text. You'll start to form sentences, then paragraphs, and eventually, you'll be able to understand and translate the entire text. The more you play, the more you learn!
          </p>
          
        </div>
        
      </div>
    </div>
);

export default Content;
