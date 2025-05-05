'use client';

import { useState } from 'react';
import { useTodos } from '@/context/TodoContext';

export default function TodoForm() {
  const [todoText, setTodoText] = useState('');
  const [prioText, setPrioText] = useState('LOW');
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
      await addTodo(todoText, prioText);
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
      className="flex items-center  bg-gray-200 w-full justify-between "
    >
      <input
        type="text"
        value={todoText}
        onChange={(e) => setTodoText(e.target.value)}
        placeholder="Add a new task..."
        className="px-4 py-4 focus:outline-none text-gray-700 sm:w-[25ch] w-[20ch]"
        disabled={isSubmitting}
      />
      <label className="mr-2 font-medium text-gray-700">Priority level:</label>
      <select
        defaultValue={prioText}
        onChange={(e) =>
          setPrioText(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')
        }
        className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none"
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <button
        type="submit"
        className="bg-yellow-400 text-white
   px-8 py-4 font-semibold rounded-full text-center disabled:bg-yellow-200 hover:bg-yellow-500"
        disabled={isSubmitting || !todoText}
      >
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
}
