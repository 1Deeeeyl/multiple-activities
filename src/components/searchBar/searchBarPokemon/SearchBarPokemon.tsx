'use client';
import { useState } from 'react';
import { usePokemon } from '@/context/PokemonContext';

export default function SearchBarPokemon() {
  const { searchPokemon, fetchPokemons, isLoading } = usePokemon();
  const [searchText, setSearchText] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (searchText.trim() === '') {
        await fetchPokemons(1); // Reset to first page when search is empty
      } else {
        await searchPokemon(searchText);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center rounded-full overflow-hidden bg-gray-200 justify-between max-w-fit my-[50px]"
    >
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search for a Pokémon!"
        className="px-4 py-4 focus:outline-none text-gray-700 sm:w-[25ch] w-[20ch]"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-[#EFB036] text-white px-8 py-4 font-semibold rounded-full text-center"
        disabled={isLoading}
      >
        {isLoading ? 'SEARCHING...' : 'SEARCH'}
      </button>
    </form>
  );
}