import React from 'react'
import type { Metadata } from 'next';
import Container from '@/components/container/Container';
import Hero from '@/components/hero/Hero';

export const metadata: Metadata = {
  title: "Pokémon Review",
  description: "A Pokémon review app.",
};
export default function PokemonPage() {
  return (
    <Container>
      <Hero h1="Pokémon Review" description="A simple Pokémon page" />
      
    </Container>
  )
}
