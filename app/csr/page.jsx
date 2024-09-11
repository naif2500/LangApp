'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Import the arrow icon
import Flag from 'react-world-flags';



const WordContext = createContext();

function WordProvider({ children }) {
  const [words, setWords] = useState([]);
  const [targetLang, setTargetLang] = useState('ES'); // Default target language
  const [sourceLang, setSourceLang] = useState('EN'); // Default source language
  const [correctGuesses, setCorrectGuesses] = useState([]); // Store correct guesses
  const [partialSentence, setPartialSentence] = useState([]); // Store the partially constructed sentence as an array of words

  return (
    <WordContext.Provider value={{ words, setWords, targetLang, setTargetLang, sourceLang, setSourceLang, correctGuesses, setCorrectGuesses, partialSentence, setPartialSentence }}>
      {children}
    </WordContext.Provider>
  );
}

function useWords() {
  return useContext(WordContext);
}

function UploadPage({ onTextSubmit }) {
  const [inputText, setInputText] = useState('');
  const { setWords, targetLang, setTargetLang, sourceLang, setSourceLang } = useWords();
  const [error, setError] = useState(null);
  const [pdfjs, setPdfjs] = useState(null);
  const { user, isLoading } = useUser(); // Get user info from Auth0
  const [isOpen, setIsOpen] = useState(false); // For dropdown toggle

  const toggleDropdown = () => setIsOpen(!isOpen);



  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Spanish' },
    { code: 'FR', name: 'French' },
    { code: 'DE', name: 'German' },
    { code: 'IT', name: 'Italian' },
    { code: 'PT', name: 'Portuguese' },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") { // Ensures it's client-side
      import('../../lib/pdf').then(pdfModule => {
        setPdfjs(pdfModule.default);
      });
    }
  }, []);

  const handleFileUpload = async (event) => {
    if (!pdfjs) return;  // Ensure pdfjs is loaded

    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      try {
        const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
        const pdf = await loadingTask.promise;
        let extractedText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map(item => item.str).join(' ');
        }

        setInputText(extractedText); // Set the extracted text to state
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
        setError('Failed to extract text from PDF. Please try another file.');
      }
    } else {
      setError('Please upload a PDF file.');
    }
  };

  async function handleTextSubmit() {
    setError(null);
    // Remove punctuation and commas, then split the words
    const wordsArray = inputText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(' ');
    try {
      onTextSubmit(); // Notify parent component that translation is starting
      const translatedArray = await Promise.all(
        wordsArray.map(async (word) => {
          const translation = await translateWord(word);
          return { [targetLang.toLowerCase()]: translation, english: word }; // Adjust based on target language
        })
      );
      setWords(translatedArray);
    } catch (err) {
      console.error(err);
      setError('Failed to translate the text. Please check the console for more details.');
    }
  }
  

  async function translateWord(word) {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word, sourceLang, targetLang }), // Pass selected languages
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translation;
  }
  const getFlagCode = (langCode) => {
    switch (langCode) {
      case 'EN':
        return 'GB'; // Map 'EN' to 'GB' for British flag
      case 'ES':
        return 'ES'; // Spain
      case 'FR':
        return 'FR'; // France
      case 'DE':
        return 'DE'; // Germany
      case 'IT':
        return 'IT'; // Italy
      case 'PT':
        return 'PT'; // Portugal
      default:
        return 'GB'; // Default to British flag if unknown
    }
  };
  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Top Language Selectors */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>
              <Flag code={getFlagCode(sourceLang)} style={{ width: '20px', height: '20px' }} />
            </span>
            <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} style={{ marginLeft: '10px' }}>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ marginLeft: '20px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>
              <Flag code={getFlagCode(targetLang)} style={{ width: '20px', height: '20px' }} />
            </span>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} style={{ marginLeft: '10px' }}>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ position: 'relative' }}>
    <h3>Upload Words</h3>
  </div>

        {/* Right corner for Avatar */}
        <div style={{ position: 'relative' }}>
          {!isLoading && user ? (
            <div>
              <button onClick={toggleDropdown} className="flex items-center focus:outline-none">
                <img
                  src={user.picture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                  decode="async"
                  data-testid="navbar-picture-desktop"
                />
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                  <span className="block px-4 py-2 text-gray-800" data-testid="navbar-user-desktop">
                    {user.name}
                  </span>
                  <a href="/profile" className="block px-4 py-2 text-gray-800">
                    Profile
                  </a>
                  <a href="/api/auth/logout" className="block px-4 py-2 text-gray-800">
                    Log out
                  </a>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/api/auth/login"
              className="bg-sky-400 text-white text-center px-4 py-2 rounded-full shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
              tabIndex={0}
            >
              Log in
            </a>
          )}
        </div>
      </div>

        {/* Middle Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}> 
          <div style={{ padding: '10px',  backgroundColor: '#f0f0f0', textAlign: 'left',  display: 'inline-block', borderButtom: '1px solid #ccc', borderRadius: '15px', marginTop: '100px', marginLeft: '20px', maxWidth: '100%'
}}>
                "Choose source and target language and then upload or type the vocabulary."
            </div>     

            {/* Additional content can be added here if needed */}
        </div>

          

        {/* Bottom Input Area */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px', borderTop: '2px solid #808080'}}>
          
            <input 
                type="file" 
                id="fileInput" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
                accept="application/pdf" 
            />
            <label htmlFor="fileInput" style={{ fontSize: '16px', cursor: 'pointer' }}>
                📎
            </label>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste your text here or upload a PDF"
                style={{ flex: 1, height: '50px', resize: 'none', padding: '10px', fontSize: '16px', border: 'none' }}
            />
            <button
                onClick={handleTextSubmit}
                style={{ fontSize: '16px', color: '#ffffff', backgroundColor: '#4CAF50', padding: '10px',borderRadius:'5px'}}
            >
                Submit
            </button>
        </div>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
    </div>
);



  
  
}




function GuessingGame({ goBack }) {
  const { words, targetLang, correctGuesses, setCorrectGuesses, setWords } = useWords();
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const { user, isLoading } = useUser(); // Get user info from Auth0
  const [isOpen, setIsOpen] = useState(false); // For dropdown toggle

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (words.length > 0) {
      setCurrentWord(words[Math.floor(Math.random() * words.length)]);
    }
  }, [words]);

  function checkAnswer() {
    if (userInput.toLowerCase() === currentWord.english.toLowerCase()) {
      setMessage('Correct!');
      setCorrectGuesses(prevGuesses => [...prevGuesses, currentWord]); 
    } else {
      setMessage(`Incorrect. The correct answer is ${currentWord.english}`);
    }

    // Ensure targetLang is a valid string before using it
    if (targetLang && typeof targetLang === 'string') {
      setCurrentWord(words[Math.floor(Math.random() * words.length)]);
    } else {
      console.error('Invalid targetLang');
    }

    setUserInput('');
  }

  function readWord() {
    if (currentWord && currentWord[targetLang.toLowerCase()]) {
      const utterance = new SpeechSynthesisUtterance(currentWord[targetLang.toLowerCase()]);
      utterance.lang = targetLang.toLowerCase(); // Set the language for pronunciation
      window.speechSynthesis.speak(utterance);
    }
  }

  if (!currentWord) return <p>Loading...</p>;

  return (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}> 
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
  <button onClick={goBack} style={{ margin: '10px', fontSize: '16px', cursor: 'pointer' }}>
  <FontAwesomeIcon icon={faArrowLeft} />      
  </button>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
    <h3>Guess the word</h3>
  </div>

  <div style={{ position: 'relative' }}>
          {!isLoading && user ? (
            <div>
              <button onClick={toggleDropdown} className="flex items-center focus:outline-none">
                <img
                  src={user.picture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                  decode="async"
                  data-testid="navbar-picture-desktop"
                />
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                  <span className="block px-4 py-2 text-gray-800" data-testid="navbar-user-desktop">
                    {user.name}
                  </span>
                  <a href="/profile" className="block px-4 py-2 text-gray-800">
                    Profile
                  </a>
                  <a href="/api/auth/logout" className="block px-4 py-2 text-gray-800">
                    Log out
                  </a>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/api/auth/login"
              className="bg-sky-400 text-white text-center px-4 py-2 rounded-full shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
              tabIndex={0}
            >
              Log in
            </a>
          )}
        </div>

  </div>



  {/* Middle Content Area */}
  <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}> 
  <div style={{ 
    padding: '10px', 
    paddingLeft: '12px',  
    paddingRight: '12px',   
    backgroundColor: '#f0f0f0', 
    textAlign: 'left',  
    display: 'flex',  /* Flexbox layout to align items horizontally */
    alignItems: 'center',  /* Vertically center items */
     display: 'inline-block',
    borderBottom: '1px solid #ccc', 
    borderRadius: '15px', 
    marginTop: '100px', 
    marginLeft: '20px', 
    maxWidth: '100%' 
}}>
    <button 
        onClick={readWord} 
        style={{ marginRight: '10px',  display: 'inline-block' }}  /* Add margin to separate button and text */
    >
        <FontAwesomeIcon icon={faVolumeUp} />
    </button>

    <p style={{ margin: 0,  display: 'inline-block' }}>{currentWord[targetLang.toLowerCase()]}</p>  {/* Remove default margin for better alignment */}
</div>

      <p className="mt-4">{message}</p>
    

      {/* Additional content can be added here if needed */}
  </div>

  <div style={{ display: 'flex', alignItems: 'center', padding: '10px', borderTop: '2px solid #808080'}}>
          
          <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your guess here"
              style={{ flex: 1, height: '50px', resize: 'none', padding: '10px', fontSize: '16px', border: 'none' }}
          />
          <button
              onClick={checkAnswer}
              style={{ fontSize: '16px' }}
          >
              Submit
          </button>
      </div>


   
  </div>

  )};


function CSRPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleTextSubmit() {
    setLoading(true); // Start loading screen
    setTimeout(() => {
      setIsSubmitted(true); // Switch to GuessingGame after translation is done
      setLoading(false); // Stop loading screen
    }, 1000); // Simulate a delay, adjust this based on your actual API response time
  }

  function goBack() {
    setIsSubmitted(false); // Set to false to go back to the UploadPage
  }

  return (
    <WordProvider>
      {loading && <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>}
      {!loading && !isSubmitted && <UploadPage onTextSubmit={handleTextSubmit} />}
      {!loading && isSubmitted && <GuessingGame  goBack={goBack} />}
    </WordProvider>
  );
}

export default withPageAuthRequired(CSRPage);
