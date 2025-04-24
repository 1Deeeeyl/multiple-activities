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


  // Function to fetch all markdowns for the current user
  const fetchMarkdowns = async () => {
    const { data, error } = await supabase
      .from('markdowns')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching markdowns:', error);
    } else {
      setMarkdowns(data || []);
    }
  };

  const addMarkdown = async (title: string, body: string) => {

    const { data, error } = await supabase
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

    if (error) {
      console.error('Error adding markdown:', error);
      throw error;
    } else {
      // Refresh the markdowns after adding a new one
      await fetchMarkdowns();
    }
  };

  const deleteMarkdown = async (id: string) => {
    try {
      const { error:deleteError } = await supabase.from('markdowns').delete().eq('markdown_id', id);

      setMarkdowns(markdowns.filter((markdown) => markdown.markdown_id !== id));
      fetchMarkdowns()
      if (deleteError) {
        throw new Error(deleteError.message);
      }

    } catch (err) {
      console.error('Error deleting todo:', err);
      setError((err as Error).message);
      throw err; // Re-throw to handle in component
    }
  };

  useEffect(() => {
    fetchMarkdowns();
  }, [user.id]);

  // The value object that will be provided to consumers
  const value = {
    markdowns,
    addMarkdown,
    deleteMarkdown,
    error,
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
