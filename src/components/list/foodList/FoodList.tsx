'use client';
import { useFood } from '@/context/FoodContext';
import Image from 'next/image';
import Link from 'next/link';

export default function FoodList() {
  const { foods, isLoading } = useFood();

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-4">
      {foods.map((food) => (
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
  );
}
