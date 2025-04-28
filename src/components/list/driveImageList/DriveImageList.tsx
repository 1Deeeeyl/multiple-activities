'use client';
import { useDrive } from '@/context/DriveContext';
import Modal from '../../modal/Modal';
import { useState } from 'react';

export default function ImageGallery() {
  const { images, loading, error, deleteImage, updateImage } = useDrive();
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modal, setModal] = useState('');
  const [editedText, setEditedText] = useState('');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  if (loading) {
    return <div className="text-center py-4">Loading images...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (images.length === 0) {
    return <div className="text-center py-4">No images uploaded yet.</div>;
  }

  const handleDeleteBtn = (id: string) => {
    setOpen(!open);
    setModal('delete');
    setSelectedImageId(id);
  };

  const confirmDelete = async () => {
    if (!selectedImageId) return;
    try {
      setIsProcessing(true);
      await deleteImage(selectedImageId);
      setSelectedImageId(null);
    } catch (err) {
      console.error('Error deleting todo:', err);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsProcessing(false);
      setOpen(false);
    }
  };
  const handleUpdateBtn = (id: string, currentText: string) => {
    setOpen(!open);
    setModal('update');
    setSelectedImageId(id);
    setEditedText(currentText);
  };

  const confirmEdit = async () => {
    if (!editedText.trim()) {
      alert("You can't leave that blank!");
      return;
    }

    if (!selectedImageId) return;
    try {
      setIsProcessing(true);
      await updateImage(selectedImageId, editedText);
      setSelectedImageId(null);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="rounded overflow-hidden shadow-sm p-5 bg-gray-200"
          >
            <p className="text-black mb-2 font-bold"> {image.name}</p>
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-70 object-cover"
            />
            <div className="flex justify-end gap-5 mt-5">
              <button
                onClick={() => handleUpdateBtn(image.id, image.name)}
                className="py-2 px-5 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteBtn(image.id)}
                className="py-2 px-5 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        {modal === 'delete' ? (
          <>
            <h2 className="text-xl font-bold mb-4">Delete Confirmation</h2>
            <p className="mb-6">Are you sure you want to delete this image?</p>
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
                htmlFor="imageName"
                className="block text-sm font-medium mb-2"
              >
                Edit Image Name
              </label>
              <input
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                type="text"
                name="imageName"
                id="imageName"
                className="w-full p-2 border rounded"
                disabled={isProcessing}
                onKeyDown={(e) => e.key === 'Enter' && confirmEdit()}
              />
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
