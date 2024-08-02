'use client';

import React from 'react';

import Hero from '../components/Hero';
import Content from '../components/Content';
import Stats from '../components/Stats';
import LanguageCarousel from '../components/LanguageCarousel';

export default function Index() {
  return (
    <>
      <Hero />
      <LanguageCarousel/>
      <Stats />
      <hr />
      <Content />
    </>
  );
}
