'use client';
import React from 'react';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Modal from '@/components/modal/Modal';

interface ProfileProps {
  user: User;
}

function DeleteAccountButton({ user }: ProfileProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);  // Change to false
  const [open, setOpen] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);

      // delete api route(/api/users/[userId])
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', await response.text());
        throw new Error('Server returned an invalid response format');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      // Sign out account on delete, return to login
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(
        `Failed to delete your account: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-red-100 text-red-700 px-3 py-1 rounded cursor-pointer hover:bg-red-700 hover:text-red-100"
      >
        Delete Account
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col items-center gap-5 text-center">
          <p>Are you sure you want to delete your account?</p>
          <button
            className={`bg-red-400 px-8 py-2 rounded text-white hover:bg-red-500 cursor-pointer ${
              loading ? 'opacity-75 cursor-wait' : ''
            }`}
            onClick={handleDeleteAccount}
            disabled={loading} 
          >
            {loading ? 'Deleting Account...' : 'Yes'}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default DeleteAccountButton;