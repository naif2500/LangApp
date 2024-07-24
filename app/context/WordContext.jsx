// app/context/WordContext.jsx
'use client';

import { createContext, useState, useContext } from 'react';

const WordContext = createContext();

export function WordProvider({ children }) {
  const [words, setWords] = useState([]);

  return (
    <WordContext.Provider value={{ words, setWords }}>
      {children}
    </WordContext.Provider>
  );
}

export function useWords() {
  return useContext(WordContext);
}
