'use client';
import React from 'react';
import { useMarkdown } from '@/context/MarkdownContext';
import Modal from '@/components/modal/Modal';
import { useState } from 'react';
import Markdown from 'react-markdown'; //node package

export default function MarkdownList() {
  const {
    markdowns,
    deleteMarkdown,
    error,
    updateMarkdown,
    isLoading,
    resetError,
  } = useMarkdown();
  const [open, setOpen] = useState(false);
  const [markdownView, setMarkdownView] = useState('view');
  const [modal, setModal] = useState('');
  const [markdownTitle, setMarkdownTitle] = useState('');
  const [markdownBody, setMarkdownBody] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [empty, setEmpty] = useState<string | null>(null);
  const [selectedMarkdownId, setSelectedMarkdownId] = useState<string | null>(
    null
  );
  //press view button
  const handleViewBtn = (title: string, body: string) => {
    setOpen(!open);
    setModal('view');
    setMarkdownTitle(title);
    setMarkdownBody(body);
  };
  // press delete button
  const handleDeleteBtn = (id: string) => {
    setOpen(!open);
    setModal('delete');
    setSelectedMarkdownId(id);
  };
  //confirm delete function
  const confirmDelete = async () => {
    if (!selectedMarkdownId) return;
    try {
      setIsProcessing(true);
      await deleteMarkdown(selectedMarkdownId);
      setSelectedMarkdownId(null);
    } catch (err) {
      console.error('Error deleting todo:', err);
    } finally {
      setIsProcessing(false);
      setOpen(false);
    }
  };
  //press update button
  const handleUpdateBtn = (id: string, title: string, body: string) => {
    setEmpty(null);
    setOpen(!open);
    setModal('update');
    setSelectedMarkdownId(id);
    setMarkdownTitle(title);
    setMarkdownBody(body);
  };
  // update function
  const confirmUpdate = async () => {
    if (!markdownTitle.trim()) {
      setEmpty('Title is required');
      return;
    }
    if (!markdownBody.trim()) {
      setEmpty('Body is required');
      return;
    }

    setEmpty(null);
    resetError();
    if (!selectedMarkdownId) return;
    try {
      setIsProcessing(true);
      await updateMarkdown(selectedMarkdownId, markdownTitle, markdownBody);
      setSelectedMarkdownId(null);
    } catch (err) {
      console.error('Error updating todo:', err);
    } finally {
      setIsProcessing(false);
      setOpen(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading markdown notes...</div>;
  }

  if (!isLoading && markdowns.length === 0) {
    return <div className="text-center py-4">No markdown notes available.</div>;
  }

  return (
    <>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
          {error}
          <button
            onClick={resetError}
            className="ml-2 text-sm font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}
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
                  onClick={() =>
                    handleUpdateBtn(
                      markdown.markdown_id,
                      markdown.title,
                      markdown.body
                    )
                  }
                  className="py-2 px-5 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                >
                  UPDATE
                </button>
                <button
                  onClick={() => handleDeleteBtn(markdown.markdown_id)}
                  className="py-2 px-5 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                >
                  DELETE
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <Modal open={open} onClose={() => setOpen(!open)}>
        {modal === 'delete' ? (
          <>
            <h2 className="text-xl font-bold mb-4">Delete Confirmation</h2>
            <p className="mb-6">
              Are you sure you want to delete this markdown?
            </p>
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
        ) : modal === 'view' ? (
          <>
            <div>
              <h3 className="font-bold text-zinc-800 text-2xl tracking-wider mb-3">
                {markdownTitle}
              </h3>
              <label className="mr-2 font-medium text-gray-700">View:</label>
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
          <>
            <div className="flex flex-col gap-2">
              {empty && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mt-3">
                  {empty}
                </div>
              )}
              <label htmlFor="markdownTitle">Title</label>
              <input
                value={markdownTitle}
                onChange={(e) => setMarkdownTitle(e.target.value)}
                type="text"
                name="markdownTitle"
                id="markdownTitle"
                className="border rounded p-2"
                disabled={isProcessing}
              />
              <div className="flex flex-col gap-2 mt-3">
                <label htmlFor="markdownBody">Body</label>
                <textarea
                  value={markdownBody}
                  onChange={(e) => setMarkdownBody(e.target.value)}
                  name="markdownBody"
                  id="markdownBody"
                  className="border rounded max-h-40 p-2 resize-none overflow-y-auto text-sm"
                  disabled={isProcessing}
                  rows={5}
                ></textarea>
              </div>

              <button
                type="submit"
                onClick={() => confirmUpdate()}
                className="bg-green-500 px-5 py-2 hover:bg-green-700 rounded text-white disabled:bg-green-300 mt-3 self-end"
                disabled={
                  isProcessing || !markdownBody.trim() || !markdownTitle.trim()
                }
              >
                {isProcessing ? 'UPDATING...' : 'UPDATE'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

// update logic
