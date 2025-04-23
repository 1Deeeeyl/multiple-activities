'use client';
import { useDrive } from '@/context/DriveContext';
import Modal from '../modal/Modal';
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
      await updateImage(selectedImageId,editedText);
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
                className="py-2 px-5 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                Update
              </button>
              <button
                onClick={() => handleDeleteBtn(image.id)}
                className="py-2 px-5 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        {modal === 'delete' ? (
          <div className="flex flex-col justify-center items-center">
            <p>Are you sure you want to delete this image?</p>
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
        ) : (
          <>
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
                onClick={() => setOpen(!open)}
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
