'use client';
import React from 'react';
import { useDrive } from '@/context/DriveContext';

export default function SortDropdown() {
  const { sortImages } = useDrive();

  return (
    <div className="w-fit mb-6 flex flex-col">
      <label className="mr-2 font-medium text-gray-700">Sort by:</label>
      <select
        onChange={(e) =>
          sortImages(
            e.target.value as 'none' | 'name' | 'date-old' | 'date-new'
          )
        }
        className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        <option value="none">Original</option>
        <option value="name">Alphabetic (A-Z)</option>
        <option value="date-new">Upload Date (newest first)</option>
        <option value="date-old">Upload Date (oldest first)</option>
      </select>
    </div>
  );
}
