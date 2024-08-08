'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';

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
  const { words, targetLang, correctGuesses, setCorrectGuesses, setWords } = useWords();
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (words.length > 0) {
      setCurrentWord(words[Math.floor(Math.random() * words.length)]);
    }
  }, [words]);

  useEffect(() => {
    updatePartialSentence();
  }, [correctGuesses]);

  function checkAnswer() {
    if (userInput.toLowerCase() === currentWord.english.toLowerCase()) {
      setMessage('Correct!');
      setCorrectGuesses(prevGuesses => [...prevGuesses, currentWord]); // Store correct guesses

      // If the current word is a partial sentence, mark it so it won't form new sentences
      if (currentWord.canFormSentence !== undefined) {
        currentWord.canFormSentence = true;
        setWords(prevWords => prevWords.map(word =>
          word.english === currentWord.english ? { ...word, canFormSentence: true } : word
        ));
      }

    } else {
      setMessage(`Incorrect. The correct answer is ${currentWord.english}`);
    }
    setCurrentWord(words[Math.floor(Math.random() * words.length)]);
    setUserInput('');
  }

  function updatePartialSentence() {
    const englishWords = words.map(word => word.english); // Original sentence words
    const correctIndices = correctGuesses.map(guess => englishWords.indexOf(guess.english));

    // Filter out words that are marked as complete sentences and shouldn't form new sentences
    const nonSentenceWords = words.filter(word => !word.canFormSentence);
    const nonSentenceEnglishWords = nonSentenceWords.map(word => word.english);
    const nonSentenceIndices = correctGuesses
      .map(guess => nonSentenceEnglishWords.indexOf(guess.english))
      .filter(index => index !== -1);

    // Check for consecutive indices
    nonSentenceIndices.sort((a, b) => a - b);
    let tempSentence = [];
    for (let i = 0; i < nonSentenceIndices.length - 1; i++) {
      if (nonSentenceIndices[i + 1] - nonSentenceIndices[i] === 1) {
        // Build the partial sentence from consecutive correct guesses
        tempSentence.push(correctGuesses[i][targetLang.toLowerCase()]);
        if (tempSentence.length === 2) {
          tempSentence.push(correctGuesses[i + 1][targetLang.toLowerCase()]);

          // Add the formed 3-word sentence as a new "word" in the words array
          const partialSentence = {
            [targetLang.toLowerCase()]: tempSentence.join(' '),
            english: correctGuesses.slice(i, i + 2).map(guess => guess.english).join(' '),
            canFormSentence: false // Initially, set this to false since it's a new sentence
          };
          setWords(prevWords => [...prevWords, partialSentence]);
          break; // Stop after forming a valid 3-word sequence
        }
      }
    }
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
