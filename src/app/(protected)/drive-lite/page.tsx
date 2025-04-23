import Container from '@/components/container/Container';
import FileInput from '@/components/fileInput/FileInput';
import DriveImage from '@/components/driveImage/DriveImage';
import { DriveProvider } from '@/context/DriveContext';
import Hero from '@/components/hero/Hero';
import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SearchBar from '@/components/searchBar/SearchBar';
import SortDropdown from '@/components/sortDropdown/SortDropdown';
import type { Metadata } from 'next';



export const metadata: Metadata = {
  title: "Google Drive Lite",
  description: "Knockoff Google Drive lite website.",
};
export default async function DrivePage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/');
  }

  return (
    <Container>
      <Hero
        h1="Drive Lite"
        description='A "lite" imitation of the Google Drive service.'
      />
      <div className="bg-white p-5 rounded">
        <DriveProvider user={user}>
          <FileInput />
          <div className="flex flex-col sm:flex-row sm:gap-25 justify-center items-center">
            <SearchBar />
            <SortDropdown />
          </div>
          <DriveImage />
        </DriveProvider>
      </div>
    </Container>
  );
}
