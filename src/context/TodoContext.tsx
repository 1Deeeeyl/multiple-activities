'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export type Todo = {
  id: string;
  text: string;
  isDone: boolean;
  profile_id: string;
  created_at: string;
  updated_at: string;
  priority: string;
};

type TodoContextType = {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  addTodo: (text: string, prioText: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  editTodo: (id: string, newText: string, prioText: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
};

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch the todos Supabase
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data, error: todosError } = await supabase
          .from('todos')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });

        if (todosError) {
          throw new Error(todosError.message);
        }

        const formattedTodos = data.map((todo) => ({
          id: todo.id,
          text: todo.task,
          isDone: todo.is_complete,
          profile_id: todo.profile_id,
          created_at: todo.created_at,
          updated_at: todo.updated_at,
          priority: todo.priority,
        }));

        setTodos(formattedTodos);
      } catch (err) {
        console.error('Error fetching todos:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [supabase]);

  // add todo function
  const addTodo = async (todoText: string, prioText: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('todos')
        .insert({
          task: todoText,
          is_complete: false,
          profile_id: user.id,
          created_at: now,
          updated_at: now,
          priority: prioText,
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }

      if (data && data[0]) {
        const formattedTodo: Todo = {
          id: data[0].id,
          text: data[0].task,
          isDone: data[0].is_complete,
          profile_id: data[0].profile_id,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          priority: data[0].priority,
        };

        setTodos((prevTodos) => [formattedTodo, ...prevTodos]);
      }
    } catch (err) {
      console.error('Error adding todo:', err);
      setError((err as Error).message);
    }
  };

  // Toggle is_complete for todo
  const toggleTodo = async (id: string) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === id);

      if (!todoToUpdate) return;

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('todos')
        .update({
          is_complete: !todoToUpdate.isDone,
          updated_at: now,
        })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setTodos(
        todos.map((todo) =>
          todo.id === id
            ? { ...todo, isDone: !todo.isDone, updated_at: now }
            : todo
        )
      );
    } catch (err) {
      console.error('Error toggling todo:', err);
      setError((err as Error).message);
    }
  };

  // Edit todo's text
  const editTodo = async (id: string, newText: string, prioText: string) => {
    try {
      if (!newText.trim()) {
        throw new Error('Task text cannot be empty');
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('todos')
        .update({
          task: newText.trim(),
          updated_at: now,
          priority: prioText,
        })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setTodos(
        todos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                text: newText.trim(),
                updated_at: now,
                priority: prioText,
              }
            : todo
        )
      );
    } catch (err) {
      console.error('Error editing todo:', err);
      setError((err as Error).message);
      throw err;
    }
  };

  // Delete a todo
  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError((err as Error).message);
      throw err; // Re-throw to handle in component
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        isLoading,
        error,
        addTodo,
        toggleTodo,
        editTodo,
        deleteTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

// needed to make useContext work
export function useTodos() {
  const context = useContext(TodoContext);

  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }

  return context;
}
