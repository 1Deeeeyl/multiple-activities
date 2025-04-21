'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const LogInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // login success, reload index page windw.location.href prevents infinite loop?
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded ">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>
      <form onSubmit={handleLogin} className="">
        <div className="mb-4">
          <input
            id="email"
            className="w-full p-2 border rounded focus:outline-blue-500"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
          />
        </div>
        <div className="mb-1">
          <input
            id="password"
            className="w-full p-2 border rounded focus:outline-blue-500"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />
        </div>
        <p className="text-right mb-6">
          <Link href="/request-password" className="text-gray-500 hover:text-blue-500">
            Forgot Password?
          </Link>
        </p>
        <div className="flex justify-between items-center flex-col gap-5 text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-sm">
            Don&apos;t have an account?&nbsp;
            <Link href="/signup" className="text-blue-500 hover:text-blue-700">
              Sign up here.
            </Link>
          </p>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>
      )}
    </div>
  );
};

export default LogInPage;