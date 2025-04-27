'use client';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect } from 'react';

// Simplified Pokemon data structure
type PokemonListItem = {
  name: string;
  url: string;
};

type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
};

// Simplified Pokemon detail structure with only id, name, and sprite
type PokemonDetail = {
  id: number;
  name: string;
  image: {
    image: string;
  };
};

type PokemonContextType = {
  pokemons: PokemonDetail[];
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  fetchPokemons: (page?: number) => Promise<void>;
  searchPokemon: (query: string) => Promise<void>;
  currentPage: number;
  totalPages: number;
};

export const PokemonContext = createContext<PokemonContextType | undefined>(
  undefined
);

type PokemonProviderProps = {
  user: User;
  children: React.ReactNode;
};

export const PokemonProvider = ({ user, children }: PokemonProviderProps) => {
  const supabase = createClient();
  const [pokemons, setPokemons] = useState<PokemonDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const LIMIT = 50; // Number of Pokemon per page

  const resetError = () => {
    setError(null);
  };

  const fetchPokemonDetails = async (
    pokemonList: PokemonListItem[]
  ): Promise<PokemonDetail[]> => {
    try {
      const details = await Promise.all(
        pokemonList.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          if (!res.ok) {
            throw new Error(`Failed to fetch ${pokemon.name}`);
          }

          const data = await res.json();

          return {
            id: data.id,
            name: data.name,
            image: {
              image: data.sprites.front_default,
            },
          };
        })
      );

      return details;
    } catch (error) {
      console.error('Error fetching Pokémon details:', error);
      setError('Failed to load Pokemon details');
      return [];
    }
  };

  // Fetch all Pokemon (paginated)
  const fetchPokemons = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * LIMIT;
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`
      );

      if (!res.ok) {
        throw new Error('Failed to fetch Pokemon');
      }

      const data: PokemonListResponse = await res.json();

      // Calculate total pages
      setTotalPages(Math.ceil(data.count / LIMIT));
      setCurrentPage(page);

      // Fetch details for each Pokemon
      const pokemonDetails = await fetchPokemonDetails(data.results);
      setPokemons(pokemonDetails);
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
      setError('Failed to load Pokemon');
    } finally {
      setIsLoading(false);
    }
  };

  // Search for a specific Pokemon
  const searchPokemon = async (query: string) => {
    if (!query.trim()) {
      return fetchPokemons(1);
    }

    setIsLoading(true);
    setError(null);

    try {
      // PokeAPI doesn't have a search endpoint, so we'll fetch a single Pokemon by name
      const formattedQuery = query.toLowerCase().trim();
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${formattedQuery}`
      );

      if (!res.ok) {
        throw new Error(`Pokemon "${query}" not found`);
      }

      const data = await res.json();
      const pokemonDetail: PokemonDetail = {
        id: data.id,
        name: data.name,
        image: {
          image: data.sprites.front_default,
        },
      };

      setPokemons([pokemonDetail]);
      setCurrentPage(1);
      setTotalPages(1); // Just one page when searching
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      setError(`Pokemon "${query}" not found`);
      setPokemons([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadPokemons = async () => {
      await fetchPokemons(1);
    };

    loadPokemons();
  }, []);

  // The value object that will be provided to consumers
  const value = {
    pokemons,
    isLoading,
    error,
    resetError,
    fetchPokemons,
    searchPokemon,
    currentPage,
    totalPages,
  };

  return (
    <PokemonContext.Provider value={value}>{children}</PokemonContext.Provider>
  );
};

export function usePokemon() {
  const context = useContext(PokemonContext);

  if (context === undefined) {
    throw new Error('usePokemon must be used within a PokemonProvider');
  }

  return context;
}
