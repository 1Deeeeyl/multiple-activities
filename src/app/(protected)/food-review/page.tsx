import React from 'react'
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import type { Metadata } from 'next';
import Container from '@/components/container/Container';
import Hero from '@/components/hero/Hero';

export const metadata: Metadata = {
  title: "Food Review",
  description: "A food review app.",
};

export default async function FoodPage() {
  const supabase = await createClient();
  
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
  
    if (!user) {
      redirect('/');
    }
  
  return (
    <Container>
      <Hero h1="Food Review" description="A simple food review page." />
      
    </Container>
  )
}
