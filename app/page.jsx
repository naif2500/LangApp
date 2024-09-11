'use client';

import React from 'react';

import Hero from '../components/Hero';
import Content from '../components/Content';
import Contenttwo from '../components/Content2';
import Contentthree from '../components/Content3';
import Contentfour from '../components/Content4';
import Heading from '../components/heading';
import Footer from '../components/Footer';
import Navbar from '../components/NavBar';



import LanguageCarousel from '../components/LanguageCarousel';

export default function Index() {
  return (
    <>
      <Navbar/>
      <Hero />
      <LanguageCarousel/>
      <hr />
      <Heading />
      <Content />
      <Contenttwo />
      <Contentthree />
      <Contentfour />
      <Footer/>

    </>
  );
}
