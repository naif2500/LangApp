'use client';
import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import PageLink from './PageLink';
import AnchorLink from './AnchorLink';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useUser();
  const toggle = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white">
      <div className=" mx-auto flex items-center  justify-between py-4 px-20">
        <div className="flex-shrink-0">
          <img src="/logo1.svg" alt="Logo" width="120" height="50" />
          </div>


          <div className="flex text-lg justify-center  space-x-8">

          <PageLink href="/" className="nav-link text-gray-900 font-medium" testId="navbar-home">
            Home
          </PageLink>
          <PageLink href="/LanguageCarousel" className="nav-link text-gray-900 font-medium" testId="navbar-home">
            How it works
          </PageLink>
          <PageLink href="/Content" className="nav-link text-gray-900 font-medium" testId="navbar-home">
            Languages
          </PageLink>
          <PageLink href="/Content" className="nav-link text-gray-900 font-medium" testId="navbar-home">
            Pricing
          </PageLink>
          
        </div>
        <div className="flex lg:hidden">
          <button
            onClick={toggle}
            className="text-gray-700 focus:outline-none focus:text-gray-900"
            data-testid="navbar-toggle"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
              />
            </svg>
          </button>
        </div>
        {/* Desktop Login/Logout */}
        <div className="hidden lg:flex items-center space-x-4">
          {!isLoading && !user && (
            
            <>
      <AnchorLink
        href="/api/auth/login?returnTo=/csr"
        className=" text-sky-400 text-center px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600"
        tabIndex={0}
        testId="navbar-signup-desktop"
      >
        Log in
      </AnchorLink>
      <AnchorLink
        href="/api/auth/login?returnTo=/csr"
        className="bg-white border-sky-400 border-2 text-sky-400 text-center px-4 py-2 rounded-xl hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        tabIndex={0}
        testId="navbar-login-desktop"
      >
        Sign up
      </AnchorLink>
    </>
          )}
          {user && (
            <div className="relative">
              <button
                className="flex items-center focus:outline-none"
                id="profileDropDown"
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={toggle}
              >
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
                  <PageLink href="/profile" className="block px-4 py-2 text-gray-800" testId="navbar-profile-desktop">
                    Profile
                  </PageLink>
                  <AnchorLink
                    href="/api/auth/logout"
                    className="block px-4 py-2 text-gray-800"
                    tabIndex={0}
                    testId="navbar-logout-desktop"
                  >
                    Log out
                  </AnchorLink>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Mobile Menu */}
        <div className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <PageLink href="/" className="block nav-link" testId="navbar-home-mobile">
              Home
            </PageLink>
            {user && (
              <>
                <PageLink href="/csr" className="block nav-link" testId="navbar-csr-mobile">
                  Client-side rendered page
                </PageLink>
                <PageLink href="/ssr" className="block nav-link" testId="navbar-ssr-mobile">
                  Server-side rendered page
                </PageLink>
                <PageLink href="/external" className="block nav-link" testId="navbar-external-mobile">
                  External API
                </PageLink>
              </>
            )}
            {!isLoading && !user && (
              <AnchorLink
                href="/api/auth/login"
                className="block bg-sky-500 text-white text-center px-4 py-2 rounded-full shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                tabIndex={0}
                testId="navbar-login-mobile"
              >
                Log in
              </AnchorLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
