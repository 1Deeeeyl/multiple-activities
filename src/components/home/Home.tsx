'use client';

import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/navbar/Navbar';
import NavBar from '@/components/navbar/Navbar';
import Container from '../container/Container';

interface HomePageProps {
  user: User;
}

function HomePage({ user }: HomePageProps) {
  const supabase = createClient();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('profile_id', user.id)
          .single();

        setUsername(profile?.username);
        console.log(profile);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.id, supabase]);

  return (
    <>
      <header className="bg-white p-5 mb-[25px] rounded box-border">
        <NavBar user={user} />
      </header>
      <Container>
        <section className="bg-white p-5 rounded-md  mb-[25px]">
          <h1 className="font-bold text-5xl">Home Page</h1>
          <h1 className="mt-4">
            {loading ? (
              'Loading profile...'
            ) : (
              <span className="italic">Hello, {username}!</span>
            )}
          </h1>
        </section>
      </Container>
    </>
  );
}

export default HomePage;
