'use client';
import { Container } from 'reactstrap';
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
  const [correctGuesses, setCorrectGuesses] = useState([]); 
  const [level, setLevel] = useState(1); // Add level state
  const [correctGuessesCount, setCorrectGuessesCount] = useState(0);
   // Track correct guesses count


  return (
    <WordContext.Provider value={{ words, setWords, targetLang, setTargetLang, sourceLang, setSourceLang, correctGuesses, setCorrectGuesses,  level, setLevel,  correctGuessesCount, setCorrectGuessesCount }}>
      {children}
    </WordContext.Provider>
  );
}

function useWords() {
  return useContext(WordContext);
}

function UploadPage({ onTextSubmit }) {
  const [inputText, setInputText] = useState('');
  const { setWords, targetLang, setTargetLang, sourceLang, setSourceLang, level } = useWords();
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
    let textArray;
  
    if (level === 1) {
      // Split the input text into words for level 1
      textArray = inputText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(" ");
    } else {
      // Split into sentences or longer text for level 2 and 3
      textArray = inputText.match(/[^.!?]+[.!?]+/g) || [inputText];
    }
  
    try {
      onTextSubmit();
      const translatedArray = await Promise.all(
        textArray.map(async (text) => {
          const translation = await translateWord(text);
          return {
            [targetLang.toLowerCase()]: translation,
            [sourceLang.toLowerCase()]: text  // Store both source and target versions
          };
        })
      );
      setWords(translatedArray);  // Store both source and target sentencesø
    } catch (err) {
      console.error(err);
      setError("Failed to translate the text. Please check the console for more details.");
    }
  }
  
  
  

  async function translateWord(sentence) {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word: sentence, sourceLang, targetLang }), // Pass the sentence to the API
    });
  
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.translation;  // Return the translated sentence
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
  const { words, targetLang, sourceLang, correctGuessesCount, setCorrectGuessesCount, level, setLevel, correctGuesses, setCorrectGuesses } = useWords();
  const [currentWord, setCurrentWord] = useState(null);
  const [hoveredWord, setHoveredWord] = useState(null); // State to track hovered word

  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const { user, isLoading } = useUser(); // Get user info from Auth0
  const [isOpen, setIsOpen] = useState(false); // For dropdown toggle

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Function to select the next word or sentence based on the current level
  function getNextWord() {
    if (words.length > 0) {
      let nextSelection;
      
      if (level === 1) {
        // Level 1: Single random word
        nextSelection = words[Math.floor(Math.random() * words.length)];
        setCurrentWord(nextSelection[targetLang.toLowerCase()]);
      } else if (level === 2) {
        // Level 2: Pick two random words and join them as a string
        const shuffledWords = words.sort(() => 0.5 - Math.random());
        const selectedWords = shuffledWords.slice(0, 2);  // Pick 2 words
        const wordString = selectedWords.map(wordObj => wordObj[targetLang.toLowerCase()]).join(' ');
        setCurrentWord(wordString);
      } else if (level === 3) {
        // Level 3: Pick three random words and join them as a string
        const shuffledWords = words.sort(() => 0.5 - Math.random());
        const selectedWords = shuffledWords.slice(0, 3);  // Pick 3 words
        const wordString = selectedWords.map(wordObj => wordObj[targetLang.toLowerCase()]).join(' ');
        setCurrentWord(wordString);
      }
    }
  }
  

  // Call getNextWord when the component first loads or words array changes
  useEffect(() => {
    getNextWord();
  }, [words, level]);

  // Update the level when a certain number of correct guesses are made
  useEffect(() => {
    if (correctGuessesCount >= 5 && level === 1) {
      setLevel(2); // Move to short phrases after 5 correct guesses
    } else if (correctGuessesCount >= 10 && level === 2) {
      setLevel(3); // Move to full sentences after 10 correct guesses
    }
  }, [correctGuessesCount, level]);


  const getSourceWord = () => {
    if (!currentWord || !words) return null;
    const wordObj = words.find(word => word[targetLang.toLowerCase()] === currentWord);
    return wordObj ? wordObj[sourceLang.toLowerCase()] : null;
  };

  // Function to check the user's answer
  function checkAnswer() {
    const cleanUserInput = userInput.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  
    // Find the corresponding source language word for the current target language word
    const correctWord = words.find(word => word[targetLang.toLowerCase()] === currentWord);
  
    // Check if `correctWord` exists and `sourceLang` is a valid key in `correctWord`
    if (correctWord && correctWord[sourceLang.toLowerCase()]) {
      if (cleanUserInput === correctWord[sourceLang.toLowerCase()].toLowerCase()) {
        setMessage('Correct!');
        setCorrectGuessesCount(correctGuessesCount + 1);
        setCorrectGuesses([...correctGuesses, currentWord]); // Store the correct guess
        getNextWord(); // Move to the next word(s)
      }else {
        setMessage(`Incorrect. The correct answer is: ${correctWord[sourceLang.toLowerCase()]}`);
  
        // Optionally add a small delay before moving to the next word after showing the message
        setTimeout(() => {
          getNextWord(); // Move to the next word(s) after an incorrect answer
        }, 2000); // Adjust the delay time as needed (e.g., 2000ms = 2 seconds)
      }
    } else {
      setMessage('Error: The correct word could not be found or the language key is invalid.');
      console.error('correctWord or sourceLang is undefined:', { correctWord, sourceLang });
    }
    setUserInput(""); // Reset userInput state to an empty string

  }
  
  
  
  

  // Function to read out the current word
  function readWord() {
    if (currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.lang = targetLang.toLowerCase(); // Set the language for pronunciation
      window.speechSynthesis.speak(utterance);
    }
  }

  const translation = getSourceWord();

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
  <p>{`Level: ${level} Correct guesses: ${correctGuessesCount}`}</p>
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

    <p
            style={{ margin: 0, display: 'inline-block', cursor: 'pointer', textDecoration: 'underline dotted',textUnderlineOffset: '5px'
            }}
            onMouseEnter={() => setHoveredWord(true)}  // Show translation
            onMouseLeave={() => setHoveredWord(false)}  // Hide translation
          >
            {hoveredWord ? translation : currentWord} {/* Show translation if hovered */}
    </p>
</div>

      <p className="mt-4">{message}</p>
    

      {/* Additional content can be added here if needed */}
  </div>

  <div style={{ display: 'flex', alignItems: 'center', padding: '10px', borderTop: '2px solid #808080'}}>
          
          <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent newline in the textarea
                  checkAnswer(); // Call the submit function
                }
              }}
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
      {!loading && !isSubmitted && <Container><UploadPage onTextSubmit={handleTextSubmit} /></Container>}
      {!loading && isSubmitted && <Container><GuessingGame  goBack={goBack} /></Container>}
    </WordProvider>
  );
}

export default withPageAuthRequired(CSRPage);
