'use client';

import React from 'react';

import Hero from '../components/Hero';
import Content from '../components/Content';
import LanguageCarousel from '../components/LanguageCarousel';

export default function Index() {
  return (
    <>
      <Hero />
      <LanguageCarousel/>
      <hr />
      <Content />
    </>
  );
}
