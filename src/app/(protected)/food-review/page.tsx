import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import type { Metadata } from 'next';
import Container from '@/components/container/Container';
import Hero from '@/components/hero/Hero';
import FileInputFood from '@/components/fileInput/fileInputFood/FileInputFood';
import { FoodProvider } from '@/context/FoodContext';
import FoodList from '@/components/list/foodList/FoodList';

export const metadata: Metadata = {
  title: 'Food Review',
  description: 'A food review app.',
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
      <div className="bg-white p-5 rounded mb-20">
        <FoodProvider user={user}>
          <FileInputFood />
          <div className="flex flex-col sm:flex-row sm:gap-25 justify-center items-center">
            <FoodList />
          </div>
        </FoodProvider>
      </div>
    </Container>
  );
}
