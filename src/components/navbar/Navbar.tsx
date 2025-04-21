'use client';

import Link from 'next/link';
import DeleteAccountButton from '@/components/buttons/deleteaccountbutton/DeleteAccountButton';
import SignOutButton from '@/components/buttons/signoutbutton/SignOutButton';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';

interface ProfileProps {
  user: User;
}

function NavBar({ user }: ProfileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const links = [
    { href: '/', label: 'Home' },
    { href: '/to-do', label: 'To-Do' },
    { href: '/drive-lite', label: 'Drive' },
    { href: '/food-review', label: 'Food' },
    { href: '/pokemon-review', label: 'Pokemon' },
    { href: '/markdown-page', label: 'Markdown' }
  ];

  return (
    <nav className="flex justify-between items-center relative">
      {/* Desktop nav */}
      <div className="hidden md:flex gap-5 box-border">
        {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hover:underline underline-offset-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
      </div>
      <div className="hidden md:flex">
        <SignOutButton />
        <DeleteAccountButton user={user} />
      </div>

      {/*Mobile top nav */}
      <div className="md:hidden flex justify-between w-full items-center">
        <span className="text-lg font-medium">Secret Website</span>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Sliding mobile menu nav*/}
      <div
        className={`fixed top-0 right-0 h-full w-fit bg-white shadow-lg z-100 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 focus:outline-none"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col space-y-4">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-2 px-3"
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <SignOutButton />
              <DeleteAccountButton user={user} />
            </div>
          </div>
        </div>
      </div>

      {/* Black overlay background mobile menu*/}

      <div
        className={`fixed inset-0 z-10 md:hidden transition-opacity duration-300 ease-in-out bg-black ${
          isMenuOpen
            ? 'pointer-events-auto opacity-80'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      ></div>
    </nav>
  );
}

export default NavBar;