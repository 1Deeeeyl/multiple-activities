'use client';
import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ open, onClose, children }: ModalProps) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 flex justify-center items-center transition-colors duration-300
  ${
    open
      ? 'visible pointer-events-auto bg-black/20'
      : 'invisible pointer-events-none bg-transparent'
  }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-lg p-8 shadow-xl w-full max-w-lg mx-4 transform transition-all duration-50 ease-in-out flex flex-col z-50
          ${open ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 font-extrabold text-xl text-gray-400 transition-all hover:text-gray-600"
        >
          <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;