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
            e.target.value as 'default' | 'alphabetical' | 'date-old-new' | 'date-new-old'
          )
        }
        className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none"
      >
        <option value="default">Default</option>
        <option value="alphabetical">Alphabetical</option>
        <option value="date-old-new">Upload Date (old-new)</option>
        <option value="date-new-old">Upload Date (new-old)</option>
      </select>
    </div>
  );
}
// not reusable (wrong implementation)