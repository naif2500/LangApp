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
  const [shortSentences, setShortSentences] = useState([]);  // Store sentences for levels 2 and 3
  const [longSentences, setLongSentences] = useState([]);  // Store sentences for levels 2 and 3

  const [targetLang, setTargetLang] = useState('ES'); // Default target language
  const [sourceLang, setSourceLang] = useState('EN'); // Default source language
  const [correctGuesses, setCorrectGuesses] = useState([]); 
  const [level, setLevel] = useState(1); // Add level state
  const [correctGuessesCount, setCorrectGuessesCount] = useState(0);
   // Track correct guesses count


  return (
    <WordContext.Provider value={{ words, setWords,shortSentences, setShortSentences, longSentences, setLongSentences, targetLang, setTargetLang, sourceLang, setSourceLang, correctGuesses, setCorrectGuesses,  level, setLevel,  correctGuessesCount, setCorrectGuessesCount }}>
      {children}
    </WordContext.Provider>
  );
}

function useWords() {
  return useContext(WordContext);
}

function UploadPage({ onTextSubmit }) {
  const [inputText, setInputText] = useState('');
  const {words, shortSentences, longSentences, setWords, targetLang, setLongSentences, setShortSentences, setTargetLang, sourceLang, setSourceLang, level } = useWords();
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
 

// Handle text submission and split it based on level
async function handleTextSubmit() {
  setError(null);

  

  try {
   // Always split the text into words, short sentences, and long sentences
   const splitWords = inputText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(" "); // Split into words
   const splitShortSentences = extractTwoWordSentences(inputText); // Split into two-word sentences
   const splitLongSentences = splitIntoThreeWordSentences(inputText); // Split into three-word sentences

   // Translate each set of split text separately
   const translatedWords = await processTranslations(splitWords); // Translate the words
   const translatedShortSentences = await processTranslations(splitShortSentences); // Translate short sentences
   const translatedLongSentences = await processTranslations(splitLongSentences); // Translate long sentences

   // Set all arrays independently
   setWords(translatedWords); // Set words
   setShortSentences(translatedShortSentences); // Set short sentences
   setLongSentences(translatedLongSentences); // Set long sentences


    onTextSubmit();  // Notify the parent component of submission
  } catch (err) {
    console.error(err);
    setError("Failed to process or translate the text.");
  }
}

// Extract short two-word sentences for level 2
function extractTwoWordSentences(text) {
  const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(" ");
  const twoWordSentences = [];
  
  for (let i = 0; i < words.length - 1; i += 2) {
    twoWordSentences.push(`${words[i]} ${words[i + 1]}`);
  }

  return twoWordSentences;
}

// Split the text into sentences of maximum 3 words for Level 3
function splitIntoThreeWordSentences(text) {
  const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(" ");  // Split text into words
  const threeWordSentences = [];
  
  for (let i = 0; i < words.length; i += 3) {
    // Join every three words into a sentence, or add the remaining words as the last sentence
    const sentence = words.slice(i, i + 3).join(" ");
    threeWordSentences.push(sentence);
  }

  return threeWordSentences;  // Return the array of three-word sentences
}

// Process and translate the text
async function processTranslations(textArray) {
  try {
    const translatedArray = await Promise.all(
      textArray.map(async (text) => {
        const translation = await translateWord(text);
        return {
          [targetLang.toLowerCase()]: translation,
          [sourceLang.toLowerCase()]: text  // Store both source and target versions
        };
      })
    );
    return translatedArray;
  } catch (err) {
    console.error(err);
    setError("Failed to translate the text.");
    return [];
  }
}

// Translate individual word or sentence
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
  const { words, shortSentences, longSentences, targetLang, sourceLang, correctGuessesCount, setCorrectGuessesCount, level, setLevel, correctGuesses, setCorrectGuesses } = useWords();
  const [currentWord, setCurrentWord] = useState(null);
  const [hoveredWord, setHoveredWord] = useState(null); // State to track hovered word
  const [displayedWords, setDisplayedWords] = useState([]); // To store the displayed words

  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const { user, isLoading } = useUser(); // Get user info from Auth0
  const [isOpen, setIsOpen] = useState(false); // For dropdown toggle

  const toggleDropdown = () => setIsOpen(!isOpen);

  console.log("Words Array:", words);
  console.log("Short Sentences Array:", shortSentences);
  console.log("Long Sentences Array:", longSentences);

  

  // Function to select the next word or sentence based on the current level
  function getNextWord() {
    let currentArray;
    if (level === 1) {
      // Level 1: Single random word
      currentArray = words;
    } else if (level === 2) {
      // Level 2: Short sentences (two-word sentences)
      currentArray = shortSentences;
    } else {
      // Level 3: Long sentences (three-word sentences)
      currentArray = longSentences;
    }

    if (currentArray.length > 0) {
      let nextSelection = currentArray[Math.floor(Math.random() * currentArray.length)];
      setCurrentWord(nextSelection[targetLang.toLowerCase()]);

      console.log("Current Word:", nextSelection[targetLang.toLowerCase()]);

      // Store the selected word or sentence in the displayedWords array for display
      setDisplayedWords(prevWords => [...prevWords, nextSelection[targetLang.toLowerCase()]]);
    }
  }


  

  // Call getNextWord when the component first loads or words array changes
  useEffect(() => {
    getNextWord();
  }, [words, shortSentences, longSentences, level]);

  // Update the level when a certain number of correct guesses are made
  useEffect(() => {
    if (correctGuessesCount >= 5 && level === 1) {
      setLevel(2); // Move to short phrases after 5 correct guesses
    } else if (correctGuessesCount >= 10 && level === 2) {
      setLevel(3); // Move to full sentences after 10 correct guesses
    }
  }, [correctGuessesCount, level]);


  const getSourceWord = () => {
    let currentArray = level === 1 ? words : level === 2 ? shortSentences : longSentences;
    if (!currentWord || !currentArray) return null;
  
    // Find the corresponding source language word or sentence
    const wordObj = currentArray.find(w => w[targetLang.toLowerCase()] === currentWord);
  
    return wordObj ? wordObj[sourceLang.toLowerCase()] : null;
  };
  
  

// Function to check the user's answer
function checkAnswer() {
  const cleanUserInput = userInput.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  // Determine whether to check against words, short sentences, or long sentences
  const currentArray = level === 1 ? words : level === 2 ? shortSentences : longSentences;
  const correctWordOrSentence = currentArray.find(word => word[targetLang.toLowerCase()] === currentWord);

  // Check if the answer is correct
  if (correctWordOrSentence && correctWordOrSentence[sourceLang.toLowerCase()]) {
    const correctAnswer = correctWordOrSentence[sourceLang.toLowerCase()].toLowerCase();

    if (cleanUserInput === correctAnswer) {
      setMessage('Correct!');
      setCorrectGuessesCount(prevCount => prevCount + 1);
      setCorrectGuesses(prevGuesses => [...prevGuesses, currentWord]);
      getNextWord(); // Move to the next word or sentence
    } else {
      setMessage(`Incorrect. The correct answer is: ${correctWordOrSentence[sourceLang.toLowerCase()]}`);
      setTimeout(() => {
        getNextWord(); // Move to the next word or sentence after an incorrect answer
      }, 2000); // Adjust the delay time as needed (e.g., 2000ms = 2 seconds)
    }
  } else {
    setMessage('Error: The correct word or sentence could not be found.');
    console.error('correctWordOrSentence or sourceLang is undefined:', { correctWordOrSentence, sourceLang });
  }

  setUserInput(''); // Reset userInput state to an empty string
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
<div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
  {displayedWords.map((word, index) => (
    <div key={index} style={{ 
      padding: '10px', 
      backgroundColor: '#f0f0f0', 
      textAlign: 'left',  
      display: 'flex',  // Use Flexbox to align button and text side by side
      alignItems: 'center',  // Vertically center the items
      borderBottom: '1px solid #ccc', 
      borderRadius: '15px', 
      marginTop: '10px', 
      marginLeft: '20px', 
      maxWidth: '60%',  // Control max width of each bubble
      alignSelf: 'flex-start'  // Align each bubble to the left
    }}>
      <button onClick={readWord} style={{ marginRight: '10px' }}>
        <FontAwesomeIcon icon={faVolumeUp} />
      </button>
      
      <p
        style={{ margin: 0, cursor: 'pointer', textDecoration: 'underline dotted', textUnderlineOffset: '5px' }}
        onMouseEnter={() => setHoveredWord(index)}  // Show translation for the hovered word
        onMouseLeave={() => setHoveredWord(null)}   // Hide translation when not hovering
      >
        {hoveredWord === index ? getSourceWord() : word}  {/* Show translation if hovered */}
      </p>
    </div>
  ))}
  
  <p className="mt-4">{message}</p>
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
