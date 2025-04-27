'use client';
import { usePokemon } from '@/context/PokemonContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function PokemonList() {
  const { pokemons, isLoading, error, fetchPokemons, currentPage, totalPages } =
    usePokemon();
  const [sortBy, setSortBy] = useState('default');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="">Catching Pokémons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-5">{error}</p>
        <button
          onClick={() => fetchPokemons(1)}
          className="bg-[#EFB036] text-white px-4 py-2 rounded-md hover:bg-yellow-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (pokemons.length === 0 && isLoading) {
    return <div className="text-center">No Pokémon found</div>;
  }

  // Sort Pokémon based on selected sorting option
  const sortedPokemons = [...pokemons].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Default sorting (by ID)
    return a.id - b.id;
  });

  return (
    <>
      <div className="w-full">
        {/* Sort dropdown */}
        <div className="mb-4 flex justify-end">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none"
            >
              <option value="default">Default (Pokédex ID)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedPokemons.map((pokemon) => (
            <Link href={`/pokemon-review/${pokemon.id}`} key={pokemon.id}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-4 flex flex-col items-center">
                  <div className="w-24 h-24 relative">
                    <Image
                      src={pokemon.image.image}
                      alt={pokemon.name}
                      width={96}
                      height={96}
                    />
                  </div>
                  <h3 className="text-lg font-semibold mt-2 capitalize">
                    {pokemon.name}
                  </h3>
                  <div className="text-sm text-gray-500">#{pokemon.id}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => fetchPokemons(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => fetchPokemons(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}