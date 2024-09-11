'use client';
import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import PageLink from '../../components/PageLink';
import AnchorLink from '../../components/AnchorLink';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useUser();
  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 h-screen w-64 bg-white shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-center h-16 bg-gray-100 ">
          <img src="/logo1.svg" alt="Logo" width="150" height="50" />
        </div>
        <div className="flex flex-col items-start space-y-4 mt-4 px-4">
          <PageLink href="/" className="nav-link" testId="sidebar-home">
            Home
          </PageLink>
          {user && (
            <>
              <PageLink href="/csr" className="nav-link" testId="sidebar-csr">
                Main
              </PageLink>
              <PageLink href="/ssr" className="nav-link" testId="sidebar-ssr">
                Account info
              </PageLink>
            </>
          )}
          {!isLoading && !user && (
            <AnchorLink
              href="/api/auth/login"
              className="bg-sky-400 text-white px-4 py-2 rounded-full shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
              tabIndex={0}
              testId="sidebar-login"
            >
              Log in
            </AnchorLink>
          )}
        </div>

        {/* Profile and Logout in the sidebar */}
        {user && (
          <div className="mt-auto px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <img
                src={user.picture}
                alt="Profile"
                className="w-10 h-10 rounded-full"
                decode="async"
                data-testid="sidebar-picture"
              />
              <span className="text-gray-800" data-testid="sidebar-user">
                {user.name}
              </span>
            </div>
            <div className="mt-4">
              <PageLink href="/profile" className="block px-4 py-2 text-gray-800" testId="sidebar-profile">
                Profile
              </PageLink>
              <AnchorLink
                href="/api/auth/logout"
                className="block px-4 py-2 text-gray-800"
                tabIndex={0}
                testId="sidebar-logout"
              >
                Log out
              </AnchorLink>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Hamburger Icon */}
      <div className="flex lg:hidden p-4">
        <button
          onClick={toggle}
          className="text-gray-700 focus:outline-none focus:text-gray-900"
          data-testid="sidebar-toggle"
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

      {/* Content Area */}
      <div className="flex-1 p-6">
        {/* Add the rest of your page content here */}
        <h1 className="text-xl">Welcome to the app!</h1>
        {/* Other page content */}
      </div>
    </div>
  );
};

export default Sidebar;
