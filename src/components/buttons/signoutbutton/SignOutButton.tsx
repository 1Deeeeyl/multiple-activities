'use client';
import React from 'react';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';



function SignOutButton() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    // this prevents redirect problems (Life saver!!)
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-gray-200 px-3 py-1 rounded mr-2 cursor-pointer text-gray-900 hover:bg-gray-500 hover:text-gray-200"
    >
      {loading ? 'Signing out...':'Sign Out'}
    </button>
  );
}

export default SignOutButton;