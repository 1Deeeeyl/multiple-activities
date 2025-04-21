'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const Page = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: 'http://localhost:3000/update-password',
        }
      );
      if (resetError) {
        throw new Error(resetError.message);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded">
      <h1 className="text-2xl font-semibold mb-3">Password Recovery</h1>
      <p className="mb-6 text-gray-500">
        Type your email and we&apos;ll send you a link to update your password!
      </p>
      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <input
            className="w-full p-2 border rounded focus:outline-blue-500"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Sending Link...' : 'Get Link'}
        </button>
      </form>

      <div className="mt-5">
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded">
            We&apos;ve sent you an email, please check your inbox.
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
