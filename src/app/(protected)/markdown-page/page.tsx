import React from 'react';
import type { Metadata } from 'next';
import Container from '@/components/container/Container';
import Hero from '@/components/hero/Hero';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { MarkdownProvider } from '@/context/MarkdownContext';
import MarkdownAddButton from '@/components/markdownAddButton/MarkdownAddButton';
import MarkdownList from '@/components/markdownList/MarkdownList';

export const metadata: Metadata = {
  title: 'Markdown Page',
  description: 'A Markdown app.',
};
export default async function MarkdownPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/');
  }
  return (
    <Container>
      <Hero h1="Markdown Page" description="A simple markdown page." />
      <div className="bg-white p-5 rounded flex flex-col">
        <MarkdownProvider user={user}>
          <MarkdownAddButton />
          <MarkdownList/>
        </MarkdownProvider>
      </div>
    </Container>
  );
}
