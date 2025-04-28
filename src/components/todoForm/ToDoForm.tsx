'use client';

import { useState } from 'react';
import { useTodos } from '@/context/TodoContext';

export default function TodoForm() {
  const [todoText, setTodoText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTodo } = useTodos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!todoText.trim()) {
      alert("You can't leave that blank!");
      return;
    }

    try {
      setIsSubmitting(true);
      await addTodo(todoText);
      setTodoText(''); 
    } catch (err) {
      console.error('Error in form submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center rounded-full overflow-hidden  bg-gray-200 w-full justify-between "
    >
      <input
        type="text"
        value={todoText}
        onChange={(e) => setTodoText(e.target.value)}
        placeholder="Add a new task..."
        className="px-4 py-4 focus:outline-none text-gray-700 sm:w-[25ch] w-[20ch]"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className="bg-yellow-400 text-white
   px-8 py-4 font-semibold rounded-full text-center disabled:bg-yellow-200 hover:bg-yellow-500"
        disabled={isSubmitting  || !todoText}
      >
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
}
