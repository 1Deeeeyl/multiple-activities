'use client';
import React, { useState } from 'react';
import { useDrive } from '@/context/DriveContext';

export default function SearchBarDrive() {
  const { searchImage, refreshImages } = useDrive();
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (searchText.trim() === '') {
        await refreshImages();
      } else {
        await searchImage(searchText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center rounded-full overflow-hidden  bg-gray-200  justify-between max-w-fit my-[50px]"
    >
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search for an image..."
        className="px-4 py-4 focus:outline-none text-gray-700 sm:w-[25ch] w-[20ch]"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-[#EFB036] text-white
   px-8 py-4 font-semibold rounded-full text-center"
        disabled={isLoading}
      >
        {isLoading ? 'SEARCHING...' : 'SEARCH'}
      </button>
    </form>
  );
}
