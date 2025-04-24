'use client';
import React from 'react';
import { useMarkdown } from '@/context/MarkdownContext';
import Modal from '../modal/Modal';
import { useState } from 'react';
import Markdown from 'react-markdown';

export default function MarkdownList() {
  const { markdowns, deleteMarkdown, error } = useMarkdown();
  const [open, setOpen] = useState(false);
  const [markdownView, setMarkdownView] = useState('view');
  const [modal, setModal] = useState('');
  const [markdownTitle, setMarkdownTitle] = useState('');
  const [markdownBody, setMarkdownBody] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMarkdownId, setSelectedMarkdownId] = useState<string | null>(
    null
  );

  const handleDeleteBtn = (id: string) => {
    setOpen(!open);
    setModal('delete');
    setSelectedMarkdownId(id);
  };
  const handleViewBtn = (title: string, body: string) => {
    setOpen(!open);
    setModal('view');
    setMarkdownTitle(title);
    setMarkdownBody(body);
  };

  const confirmDelete = async () => {
    if (!selectedMarkdownId) return;
    try {
      setIsProcessing(true);
      await deleteMarkdown(selectedMarkdownId);
      setSelectedMarkdownId(null);
    } catch (err) {
      console.error('Error deleting todo:', err);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsProcessing(false);
      setOpen(false);
    }
  };

  return (
    <>
      <section>
        <ul className="flex flex-row flex-wrap gap-5 justify-center items-center mt-[25px]">
          {markdowns.map((markdown) => (
            <li
              key={markdown.markdown_id}
              className="bg-gray-300 p-5 w-60 max-w-60 min-w-30 text-center rounded cursor-pointer"
            >
              <p className="font-bold">{markdown.title}</p>
              <div className="flex gap-2 mt-5 flex-wrap item-center justify-center">
                <button
                  onClick={() => handleViewBtn(markdown.title, markdown.body)}
                  className="py-2 px-5 bg-amber-500 text-white rounded hover:bg-amber-600 cursor-pointer"
                >
                  VIEW
                </button>
                <button
                  // onClick={() => handleUpdateBtn(image.id, image.name)}
                  className="py-2 px-5 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteBtn(markdown.markdown_id)}
                  className="py-2 px-5 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                >
                  Delete
                </button>
              </div>{' '}
            </li>
          ))}
        </ul>
      </section>
      <Modal open={open} onClose={() => setOpen(!open)}>
        {modal === 'delete' ? (
          <div className="flex flex-col justify-center items-center">
            <p>Are you sure you want to delete this markdown note?</p>
            <div className="flex flex-row gap-5 mt-5">
              <button
                onClick={() => confirmDelete()}
                className="py-2 px-5 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                disabled={isProcessing}
              >
                {isProcessing ? 'DELETING...' : 'YES'}
              </button>
              <button
                onClick={() => setOpen(!open)}
                className="py-2 px-5 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
              >
                NO
              </button>
            </div>
          </div>
        ) : modal === 'view' ? (
          <>
            <div>
              <h3 className="font-bold text-zinc-800 text-2xl tracking-wider mb-3">
                {markdownTitle}
              </h3>
              <label className="mr-2 font-medium text-gray-700">Sort by:</label>
              <select
                onChange={(e) =>
                  setMarkdownView(e.target.value as 'view' | 'raw')
                }
                className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none"
              >
                <option value="view">Mardown View</option>
                <option value="raw">Markdown Raw</option>
              </select>
            </div>
            <div className="prose bg-zinc-200 max-h-120 overflow-y-auto p-5 rounded mt-5">
              {markdownView === 'raw' ? (
                <pre>{markdownBody}</pre>
              ) : (
                <Markdown>{markdownBody}</Markdown>
              )}
            </div>
          </>
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
}
