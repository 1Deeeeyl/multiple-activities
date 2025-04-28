'use client';
import { useFood } from '@/context/FoodContext';
import { useState } from 'react';
import Link from 'next/link';

export default function FoodList() {
  const { foods, isLoading } = useFood();
  const [sortOption, setSortOption] = useState<string>('default');

  if (isLoading) {
    return <div className="text-center py-10">Loading foods...</div>;
  }

  if (foods.length === 0) {
    return (
      <div className="text-center py-10">
        No foods found. Start the foodies trend!!
      </div>
    );
  }

  // Sort foods based on current sort option
  const sortedFoods = [...foods].sort((a, b) => {
    if (sortOption === 'oldest') {
      // Sort by date, oldest first
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortOption === 'alphabetical') {
      // Sort alphabetically by name
      return a.food_name.toLowerCase().localeCompare(b.food_name.toLowerCase());
    } else {
      // Default is newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-end mb-4 p-4">
        <div className="flex items-center">
          <label htmlFor="sort-select" className=" mr-2">Sort by:</label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={handleSortChange}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none"
          >
            <option value="default">Default</option>
            <option value="oldest">Oldest</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-4">
        {sortedFoods.map((food) => (
          <Link href={`/food-review/${food.food_id}`} key={food.food_id}>
            <div className="overflow-hidden shadow-2xl w-fit p-5 bg-white">
              <img
                src={food.image_url}
                alt={food.food_name}
                className="object-cover h-[200px] w-xs overflow-hidden rounded-xs"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">{food.food_name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(food.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}