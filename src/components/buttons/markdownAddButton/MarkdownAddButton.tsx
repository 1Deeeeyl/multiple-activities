'use client';
import React, { useState } from 'react';
import Modal from '@/components/modal/Modal';
import { useMarkdown } from '@/context/MarkdownContext';

export default function MarkdownAddButton() {
  const { addMarkdown, error, resetError } = useMarkdown();
  const [open, setOpen] = useState(false);
  const [markdownTitle, setMarkdownTitle] = useState('');
  const [markdownBody, setMarkdownBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!markdownTitle.trim()) {
      setInputError('Title is required');
      return;
    }
    if (!markdownBody.trim()) {
      setInputError('Body is required');
      return;
    }

    setIsSubmitting(true);
    setInputError(null);
    resetError();

    try {
      await addMarkdown(markdownTitle, markdownBody);

      setMarkdownTitle('');
      setMarkdownBody('');
      setOpen(false);
    } catch (err) {
      setInputError("Failed to save markdown note. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
      // console.log(markdowns);
    }
  };

  const handleOpenModal = () => {
    resetError(); 
    setInputError(null); 
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="py-2 px-8 rounded bg-green-500 w-fit self-center md:self-end text-white hover:bg-green-600 cursor-pointer"
      >
        Add Markdown Note
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4">Create New Markdown Note</h2>

          {inputError && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
              {inputError}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="markdownTitle">Title</label>
            <input
              value={markdownTitle}
              onChange={(e) => setMarkdownTitle(e.target.value)}
              type="text"
              name="markdownTitle"
              id="markdownTitle"
              className="border rounded p-2"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <label htmlFor="markdownBody">Body</label>
            <textarea
              value={markdownBody}
              onChange={(e) => setMarkdownBody(e.target.value)}
              name="markdownBody"
              id="markdownBody"
              className="border rounded max-h-40 p-2 resize-none overflow-y-auto text-sm"
              disabled={isSubmitting}
              rows={5}
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-green-500 px-5 py-2 hover:bg-green-700 rounded text-white disabled:bg-green-300 mt-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
        </form>
      </Modal>
    </>
  );
}
