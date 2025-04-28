import React from 'react';
import type { Metadata } from 'next';
import Container from '@/components/container/Container';
import Hero from '@/components/hero/Hero';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SearchBarPokemon from '@/components/searchBar/searchBarPokemon/SearchBarPokemon';
import PokemonList from '@/components/list/pokemonList/PokemonList';
import { PokemonProvider } from '@/context/PokemonContext';

export const metadata: Metadata = {
  title: 'Pokémon Review',
  description: 'A Pokémon review app.',
};

export default async function PokemonPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/');
  }
  
  return (
    <Container>
      <Hero h1="Pokémon Review" description="A simple Pokémon page" />
      <div className="bg-white p-5 rounded flex flex-col justify-center items-center mb-20">
        <PokemonProvider user={user}>
          <SearchBarPokemon />
          <PokemonList />
        </PokemonProvider>
      </div>
    </Container>
  );
}