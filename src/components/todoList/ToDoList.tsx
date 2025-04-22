'use client';

import { useState } from 'react';
import Modal from '../modal/Modal';
import { useTodos } from '@/context/TodoContext';

function TodoList() {
  const { todos, isLoading, error, toggleTodo, editTodo, deleteTodo } = useTodos();
  const [open, setOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [modalType, setModalType] = useState('');
  const [todoEdit, setTodoEdit] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
      await editTodo(todoEdit, editedText);
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
                  {todo.text}
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
          <div className="flex flex-col items-center text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="100"
              height="100"
              viewBox="0 0 24 24"
              className="h-12 w-12 fill-[#B82132] box-border"
            >
              <path d="M 10 2 L 9 3 L 5 3 C 4.4 3 4 3.4 4 4 C 4 4.6 4.4 5 5 5 L 7 5 L 17 5 L 19 5 C 19.6 5 20 4.6 20 4 C 20 3.4 19.6 3 19 3 L 15 3 L 14 2 L 10 2 z M 5 7 L 5 20 C 5 21.1 5.9 22 7 22 L 17 22 C 18.1 22 19 21.1 19 20 L 19 7 L 5 7 z M 9 9 C 9.6 9 10 9.4 10 10 L 10 19 C 10 19.6 9.6 20 9 20 C 8.4 20 8 19.6 8 19 L 8 10 C 8 9.4 8.4 9 9 9 z M 15 9 C 15.6 9 16 9.4 16 10 L 16 19 C 16 19.6 15.6 20 15 20 C 14.4 20 14 19.6 14 19 L 14 10 C 14 9.4 14.4 9 15 9 z"></path>
            </svg>
            <h3 className="mt-[10px] font-bold text-xl">Confirm Delete</h3>
            <p>Are you sure you want to delete this item?</p>
            <span className="flex flex-row gap-5 mt-[15px]">
              <button
                onClick={confirmDelete}
                className="bg-[#B82132] text-white p-3 rounded-md cursor-pointer"
                disabled={isProcessing}
              >
                {isProcessing ? 'DELETING...' : 'CONFIRM'}
              </button>
              <button
                className="text-slate-700 cursor-pointer"
                onClick={() => setOpen(false)}
                disabled={isProcessing}
              >
                CANCEL
              </button>
            </span>
          </div>
        ) : (
          <>
            <h3 className="mt-[10px] font-bold text-xl">Edit Task</h3>
            <input
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="rounded-lg border border-slate-500 p-2 focus:outline-[#EFB036] mt-[15px] w-full"
              onKeyDown={(e) => e.key === 'Enter' && confirmEdit()}
              disabled={isProcessing}
            />
            <span className="flex flex-row gap-5 mt-[15px]">
              <button
                onClick={confirmEdit}
                className="bg-[#3D8D7A] text-white py-3 px-10 rounded-md cursor-pointer"
                disabled={isProcessing}
              >
                {isProcessing ? 'SAVING...' : 'SAVE'}
              </button>
              <button
                className="text-slate-700 cursor-pointer"
                onClick={() => setOpen(false)}
                disabled={isProcessing}
              >
                CANCEL
              </button>
            </span>
          </>
        )}
      </Modal>
    </>
  );
}

export default TodoList;