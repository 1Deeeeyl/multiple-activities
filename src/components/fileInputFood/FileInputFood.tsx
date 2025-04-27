'use client';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import Modal from '../modal/Modal';
import { useFood } from '@/context/FoodContext';

export default function FileInputFood() {
  const [fileName, setFileName] = useState<string>('No file chosen');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Use the food context
  const { uploadFood, isUploading } = useFood();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
      setFile(selectedFile);
      setInputError(null);
    } else {
      setFileName('No file chosen');
      setFile(null);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!file) {
      setInputError('Please select a file first');
      return;
    }

    if (!foodName.trim()) {
      setInputError('Please enter a food name');
      return;
    }

    try {
      // Upload the file and create the food entry
      await uploadFood(file, foodName);

      // Reset form after successful upload
      setFileName('No file chosen');
      setFile(null);
      setFoodName('');
      setOpen(false);
    } catch (err) {
      console.error('Upload error:', err);
      setInputError('Upload failed. Please try again.');
    }
  };

  const handleUploadButton = ()=>{
    setOpen(!open)
    setInputError(null);
  }

  return (
    <>
      <section className="max-w-xs mx-auto p-2">
        <div className="flex flex-col space-y-2">
          <label htmlFor="file" className="text-sm font-medium text-gray-700">
            Upload a food image
          </label>

          <div className="flex items-center space-x-3 bg-gray-300 rounded">
            <button
              type="button"
              onClick={handleButtonClick}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Browse
            </button>
            <span className="text-sm text-gray-700 truncate">{fileName}</span>
          </div>

          {/* Original file input, hidden visually */}
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            name="file"
            id="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <button
          onClick={handleUploadButton}
          type="button"
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors mt-[5px]"
          disabled={!file || isUploading}
        >
          {isUploading ? 'Processing...' : 'Upload Food'}
        </button>
      </section>

      <Modal open={open} onClose={() => !isUploading && setOpen(false)}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4">Add Food Details</h2>

          {inputError && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
              {inputError}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="foodName">Food Name</label>
            <input
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              type="text"
              name="foodName"
              id="foodName"
              className="border rounded p-2"
              disabled={isUploading}
              placeholder="Enter food name"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 px-5 py-2 hover:bg-green-700 rounded text-white disabled:bg-green-300 mt-3"
            disabled={isUploading}
          >
            {isUploading ? 'UPLOADING...' : 'SUBMIT'}
          </button>
        </form>
      </Modal>
    </>
  );
}
