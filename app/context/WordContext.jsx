// app/context/WordContext.jsx
'use client';

import { createContext, useState, useContext } from 'react';

const WordContext = createContext();

export function WordProvider({ children }) {
  const [words, setWords] = useState([]);       // Store words for level 1
  const [shortSentences, setShortSentences] = useState([]);  // Store sentences for levels 2 and 3
  const [longSentences, setLongSentences] = useState([]);  // Store sentences for levels 2 and 3

  return (
    <WordContext.Provider value={{ words, setWords, shortSentences, setShortSentences, longSentences, setLongSentences }}>
      {children}
    </WordContext.Provider>
  );
}

export function useWords() {
  return useContext(WordContext);
}
