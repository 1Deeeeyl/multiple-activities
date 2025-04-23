'use client';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useDrive } from '@/context/DriveContext'; // Import the context



export default function FileInput() {
  const [fileName, setFileName] = useState<string>('No file chosen');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  // Use the image context
  const { uploadFile, isUploading } = useDrive();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
      setFile(selectedFile);
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
    try {
      e.preventDefault();

      if (!file) {
        alert('Please select a file first');
        return;
      }

      await uploadFile(file);

      // Reset form
      setFileName('No file chosen');
      setFile(null);

      // Refresh images list after upload
    //   await refreshImages();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    }
  };

  return (
    <section className="max-w-xs mx-auto p-2">
      <form className="" onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-2">
          <label htmlFor="file" className="text-sm font-medium text-gray-700">
            Upload an image.
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
            onChange={handleFileChange}
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors mt-[5px]"
          disabled={!file || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
    </section>
  );
}
