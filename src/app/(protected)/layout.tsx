import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import NavBar from '@/components/navbar/Navbar';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect('/');
  }
  return (
    <>
      <header className="bg-white p-5 mb-[25px] rounded box-border">
        <NavBar user={user} />
      </header>
      <main>{children}</main>
    </>
  );
}
