'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';

const WordContext = createContext();

function WordProvider({ children }) {
  const [words, setWords] = useState([]);
  const [targetLang, setTargetLang] = useState('ES'); // Default target language
  const [sourceLang, setSourceLang] = useState('EN'); // Default source language
  const [correctGuesses, setCorrectGuesses] = useState([]); // Store correct guesses

  return (
    <WordContext.Provider value={{ words, setWords, targetLang, setTargetLang, sourceLang, setSourceLang, correctGuesses, setCorrectGuesses }}>
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

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Spanish' },
    { code: 'FR', name: 'French' },
    { code: 'DE', name: 'German' },
    { code: 'IT', name: 'Italian' },
    { code: 'PT', name: 'Portuguese' },
    // Add more languages as needed
  ];

  async function handleTextSubmit() {
    setError(null);
    const wordsArray = inputText.split(' ');
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

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2 style={{ textAlign: 'left', paddingLeft: '120px', paddingBottom: '10px' }}>
        Upload Text to Learn
      </h2>
      <div>
        <label>
          Source Language:
          <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: '20px' }}>
          Target Language:
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type or paste your text here"
        style={{ width: '80%', height: '100px', padding: '10px', fontSize: '16px', border: '2px solid black' }}
      />
      <br />
      <button
        onClick={handleTextSubmit}
        style={{ padding: '10px 20px', fontSize: '16px', marginTop: '10px' }}
      >
        Submit
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

function GuessingGame() {
  const { words, targetLang, correctGuesses, setCorrectGuesses } = useWords(); // Access context values
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (words.length > 0) {
      setCurrentWord(words[Math.floor(Math.random() * words.length)]);
    }
  }, [words]);

  function checkAnswer() {
    if (userInput.toLowerCase() === currentWord.english.toLowerCase()) {
      setMessage('Correct!');
      setCorrectGuesses(prevGuesses => [...prevGuesses, currentWord]); // Store correct guesses
    } else {
      setMessage(`Incorrect. The correct answer is ${currentWord.english}`);
    }
    setCurrentWord(words[Math.floor(Math.random() * words.length)]);
    setUserInput('');
  }

  if (!currentWord) return <p>Loading...</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Guess the Word</h1>
      <p>{currentWord[targetLang.toLowerCase()]}</p>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type your guess here"
        style={{ padding: '10px', fontSize: '16px' }}
      />
      <button onClick={checkAnswer} style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}>
        Submit
      </button>
      <p>{message}</p>
    </div>
  );
}

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

  return (
    <WordProvider>
      {loading && <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>}
      {!loading && !isSubmitted && <UploadPage onTextSubmit={handleTextSubmit} />}
      {!loading && isSubmitted && <GuessingGame />}
    </WordProvider>
  );
}

export default withPageAuthRequired(CSRPage);
