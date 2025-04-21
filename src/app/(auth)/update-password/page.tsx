'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const url = window.location.href;
    supabase.auth.exchangeCodeForSession(url);
    const handlePasswordReset = async () => {
      const url = new URL(window.location.href);
      const errorCode = url.searchParams.get('error_code');

      if (errorCode) {
        setError(
          `Password reset failed: ${url.searchParams.get('error_description')}`
        );
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError(
          'Invalid or expired password reset link. Please request a new one.'
        );
        setTimeout(() => router.push('/request-password'), 3000);
      }
    };

    handlePasswordReset();
  }, [router, supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (password !== retypePassword) {
        setError('Passwords do not match');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      // To redirect to /
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded">
      <h1 className="text-2xl font-semibold mb-3">Update Your Password</h1>
      <p className="mb-6 text-gray-500">
        Please enter your new password below.
      </p>
      <form onSubmit={handleUpdatePassword}>
        <div className="mb-4">
          <input
            className="w-full p-2 border rounded focus:outline-blue-500"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            required
          />
        </div>
        <div className="mb-4">
          <input
            className="w-full p-2 border rounded focus:outline-blue-500"
            type="password"
            name="retypePassword"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            placeholder="Confirm New Password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <div className="mt-5">
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded">
            Password updated successfully! Logging in...
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
