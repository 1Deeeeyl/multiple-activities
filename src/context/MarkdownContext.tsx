'use client';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect } from 'react';

type MarkdownData = {
  markdown_id: string;
  profile_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type MarkdownContextType = {
  markdowns: MarkdownData[];
  addMarkdown: (title: string, body: string) => Promise<void>;
  deleteMarkdown: (id: string) => Promise<void>;
  error: string | null;
  updateMarkdown: (id: string, title: string, body: string) => Promise<void>;
  isLoading: boolean;
  resetError: () => void;
};

export const MarkdownContext = createContext<MarkdownContextType | undefined>(
  undefined
);

type MarkdownProviderProps = {
  user: User;
  children: React.ReactNode;
};

export const MarkdownProvider = ({ user, children }: MarkdownProviderProps) => {
  const supabase = createClient();
  const [markdowns, setMarkdowns] = useState<MarkdownData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const now = new Date().toISOString();
  const [isLoading, setIsLoading] = useState(true);

  const resetError = () => {
    setError(null);
  };

  // Function to fetch all markdowns for the current user
  const fetchMarkdowns = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('markdowns')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching markdowns:', fetchError);
        setError(
          `Failed fetching: An unexpected error occurred - ${fetchError.message}`
        );
      } else {
        setMarkdowns(data || []);
        resetError();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred - Data not fetched!');
    } finally {
      setIsLoading(false);
    }
  };

  const addMarkdown = async (title: string, body: string) => {
    try {
      const { data, error: addError } = await supabase
        .from('markdowns')
        .insert([
          {
            profile_id: user.id,
            title,
            body,
            created_at: now,
            updated_at: now,
          },
        ])
        .select();

      if (addError) {
        console.error('Error adding markdown:', addError);
        setError(`Failed adding: ${addError.message}`);
        throw addError;
      } else {
        setError(null);
        await fetchMarkdowns();
      }
    } catch (err) {
      console.error('Error adding markdown:', err);
      if (err instanceof Error && !error) {
        setError(`Failed adding: ${err.message}`);
      }
      throw err;
    }
  };

  const deleteMarkdown = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('markdowns')
        .delete()
        .eq('markdown_id', id);

      if (deleteError) {
        setError(`Failed deleting: ${deleteError.message}`);
        throw new Error(deleteError.message);
      } else {
        setError(null);
        await fetchMarkdowns();
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError((err as Error).message);
      throw err;
    }
  };

  const updateMarkdown = async (id: string, title: string, body: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('markdowns')
        .update({ title: title, body: body, updated_at: now })
        .eq('markdown_id', id)
        .select();

      if (updateError) {
        setError(`Failed updating: ${updateError.message}`);
        throw new Error(updateError.message);
      } else {
        setError(null);
        await fetchMarkdowns();
      }
    } catch (err) {
      console.error('Error updating markdown:', err);
      if (err instanceof Error && !error) {
        setError(`Failed updating: ${err.message}`);
      }
      throw err;
    }
  };

  useEffect(() => {
    const loadMarkdowns = async () => {
      await fetchMarkdowns();
    };

    loadMarkdowns();
  }, [user.id]);

  // The value object that will be provided to consumers
  const value = {
    markdowns,
    addMarkdown,
    deleteMarkdown,
    error,
    updateMarkdown,
    isLoading,
    resetError,
  };

  return (
    <MarkdownContext.Provider value={value}>
      {children}
    </MarkdownContext.Provider>
  );
};

export function useMarkdown() {
  const context = useContext(MarkdownContext);

  if (context === undefined) {
    throw new Error('useMarkdown must be used within a MarkdownProvider');
  }

  return context;
}
