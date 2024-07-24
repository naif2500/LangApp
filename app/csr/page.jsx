'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';

const WordContext = createContext();

function WordProvider({ children }) {
  const [words, setWords] = useState([]);
  return (
    <WordContext.Provider value={{ words, setWords }}>
      {children}
    </WordContext.Provider>
  );
}

function useWords() {
  return useContext(WordContext);
}

function UploadPage() {
  const [inputText, setInputText] = useState('');
  const { setWords } = useWords();
  const [error, setError] = useState(null);

  async function handleTextSubmit() {
    setError(null);
    const wordsArray = inputText.split(' ');
    try {
      const translatedArray = await Promise.all(
        wordsArray.map(async (word) => {
          const translation = await translateWord(word);
          return { spanish: translation, english: word };
        })
      );
      setWords(translatedArray);
    } catch (err) {
      console.error(err);
      setError('Failed to translate the text. Please check the console for more details.');
    }
  }

  async function translateWord(word) {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `DeepL-Auth-Key 52bc488e-8ce5-4853-9c09-a0e3ea22eb38:fx`
      },
      body: new URLSearchParams({
        text: word,
        source_lang: 'EN',
        target_lang: 'ES'
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translations[0].text;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Upload Text to Learn</h1>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type or paste your text here"
        style={{ width: '80%', height: '100px', padding: '10px', fontSize: '16px' }}
      />
      <br />
      <button onClick={handleTextSubmit} style={{ padding: '10px 20px', fontSize: '16px', marginTop: '10px' }}>
        Submit
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

function GuessingGame() {
  const { words } = useWords();
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
    } else {
      setMessage(`Incorrect. The correct answer is ${currentWord.english}`);
    }
    setCurrentWord(words[Math.floor(Math.random() * words.length)]);
    setUserInput('');
  }

  if (!currentWord) return <p>Loading...</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Guess the Spanish Word</h1>
      <p>{currentWord.spanish}</p>
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
  return (
    <WordProvider>
      <UploadPage />
      <GuessingGame />
    </WordProvider>
  );
}

export default withPageAuthRequired(CSRPage);
