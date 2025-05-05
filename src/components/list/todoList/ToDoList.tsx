'use client';

import { useState } from 'react';
import Modal from '@/components/modal/Modal';
import { useTodos } from '@/context/TodoContext';

function TodoList() {
  const { todos, isLoading, error, toggleTodo, editTodo, deleteTodo } =
    useTodos();
  const [open, setOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [modalType, setModalType] = useState('');
  const [todoEdit, setTodoEdit] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [prioText, setPrioText] = useState('LOW');

  // Handle edit click
  const handleEditClick = (id: string, currentText: string) => {
    setModalType('edit');
    setTodoEdit(id);
    setEditedText(currentText);
    setOpen(true);
  };

  // Confirm edit
  const confirmEdit = async () => {
    if (!editedText.trim()) {
      alert("You can't leave that blank!");
      return;
    }

    if (!todoEdit) return;

    try {
      setIsProcessing(true);
      await editTodo(todoEdit, editedText, prioText);
      setOpen(false);
      setTodoEdit(null);
    } catch (err) {
      console.error('Error editing todo text:', err);
      alert('Failed to edit task. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (id: string) => {
    setModalType('delete');
    setTodoToDelete(id);
    setOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!todoToDelete) return;

    try {
      setIsProcessing(true);
      await deleteTodo(todoToDelete);
      setOpen(false);
      setTodoToDelete(null);
    } catch (err) {
      console.error('Error deleting todo:', err);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <p className="text-center">Loading todos...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <>
      {isProcessing && (
        <div className="text-center text-sm text-gray-500">Processing...</div>
      )}

      <ul className="flex flex-col gap-2">
        {todos.length === 0 ? (
          <div className="text-center text-gray-500">
            No tasks yet. Add a task to get started!
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex flex-row items-center justify-between bg-gray-200 h-fit p-3 w-full rounded-md"
            >
              <span className="flex flex-row gap-5 items-center">
                {todo.isDone ? (
                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 cursor-pointer"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <path d="m0 0h24v24h-24z" fill="#fff" opacity="0" />
                    <path
                      d="m12 2a10 10 0 1 0 10 10 10 10 0 0 0 -10-10zm4.3 7.61-4.57 6a1 1 0 0 1 -.79.39 1 1 0 0 1 -.79-.38l-2.44-3.11a1 1 0 0 1 1.58-1.23l1.63 2.08 3.78-5a1 1 0 1 1 1.6 1.22z"
                      fill="#EFB036"
                    />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 cursor-pointer"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <li
                  onClick={() => toggleTodo(todo.id)}
                  className={`${
                    todo.isDone
                      ? 'sm:max-w-[20ch] cursor-pointer break-words line-through max-w-[15ch] text-black/50 decoration-black'
                      : 'sm:max-w-[20ch] cursor-pointer break-words max-w-[15ch]'
                  }`}
                >
                  {todo.text} - Priority Level {todo.priority}
                </li>
              </span>
              <span className="flex-row flex items-center gap-3">
                <svg
                  viewBox="0 0 576 512"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 box-border cursor-pointer fill-slate-800"
                  onClick={() => handleEditClick(todo.id, todo.text)}
                >
                  <path d="m402.3 344.9 32-32c5-5 13.7-1.5 13.7 5.7v145.4c0 26.5-21.5 48-48 48h-352c-26.5 0-48-21.5-48-48v-352c0-26.5 21.5-48 48-48h273.5c7.1 0 10.7 8.6 5.7 13.7l-32 32c-1.5 1.5-3.5 2.3-5.7 2.3h-241.5v352h352v-113.5c0-2.1.8-4.1 2.3-5.6zm156.6-201.8-262.6 262.6-90.4 10c-26.2 2.9-48.5-19.2-45.6-45.6l10-90.4 262.6-262.6c22.9-22.9 59.9-22.9 82.7 0l43.2 43.2c22.9 22.9 22.9 60 .1 82.8zm-98.8 30.9-58.1-58.1-185.8 185.9-7.3 65.3 65.3-7.3zm64.8-79.7-43.2-43.2c-4.1-4.1-10.8-4.1-14.8 0l-30.9 30.9 58.1 58.1 30.9-30.9c4-4.2 4-10.8-.1-14.9z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 box-border cursor-pointer stroke-slate-800"
                  onClick={() => handleDeleteClick(todo.id)}
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M10 10l4 4m0 -4l-4 4" />
                </svg>
              </span>
            </div>
          ))
        )}
      </ul>

      <Modal open={open} onClose={() => setOpen(false)}>
        {modalType === 'delete' ? (
          <>
            <h2 className="text-xl font-bold mb-4">Delete Confirmation</h2>
            <p className="mb-6">Are you sure you want to delete this to-do?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label
                htmlFor="editedText"
                className="block text-sm font-medium mb-2"
              >
                Edit To-Do
              </label>
              <input
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                type="text"
                name="editedText"
                id="editedText"
                className="w-full p-2 border rounded"
                disabled={isProcessing}
              />
              <label className="mr-2 font-medium text-gray-700">
                Priority level:
              </label>
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
            </div>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmEdit}
                className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                disabled={isProcessing || !editedText.trim()}
              >
                {isProcessing ? 'Updating...' : 'Update'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export default TodoList;
