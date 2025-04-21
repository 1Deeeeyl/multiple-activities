'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';


const Page = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First check if username is already taken
      const { data: existingUsers, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);

      if (usernameError) {
        setError('Something went wrong while checking the username.');
        setLoading(false);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        setError('Username is already taken.');
        setLoading(false);
        return;
      }

      if (password !== retypePassword) {
        setError('Password is not a match');
        setLoading(false);
        return;
      }

      // Then proceed with signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/confirm?next=/private',
          data: {
            username: username, // Store username in user metadata
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('Sign up failed.');
        setLoading(false);
        return;
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded">
      <h1 className="text-2xl font-semibold mb-6">Account Sign Up</h1>
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
        <div className="mb-4">
          <input
            className="w-full p-2 border rounded focus:outline-blue-500"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <div className="mb-4">
          <input
            className="w-full p-2 border rounded focus:outline-blue-500"
            type="password"
            name="retype password"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            placeholder="Retype Password"
            required
          />
        </div>
        <div className="mb-6">
          <input
            className="w-full p-2 border rounded focus:outline-blue-500"
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-5">
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 p-2 rounded">
              Check your email and verify your account
            </div>
          )}
        </div>
    </div>
  );
};

export default Page;
