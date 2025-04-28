'use client';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect } from 'react';

// image datas
type ImageFile = {
  name: string;
  url: string;
  id: string;
  created_at?: string;
};

type DriveContextType = {
  images: ImageFile[];
  loading: boolean;
  error: string | null;
  deleteImage: (id: string) => Promise<void>;
  updateImage: (id: string, text: string) => Promise<void>;
  searchImage: (text: string) => Promise<void>;
  sortImages: (by: 'default' | 'alphabetical' | 'date-old-new' | 'date-new-old') => void;
  uploadFile: (file: File) => Promise<void>;
  isUploading: boolean;
  refreshImages: () => void;
};

const DriveContext = createContext<DriveContextType | undefined>(undefined);

// Props for the provider component
type DriveProviderProps = {
  user: User;
  children: React.ReactNode;
};

export const DriveProvider = ({ user, children }: DriveProviderProps) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [originalImages, setOriginalImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Function to fetch images
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      // fetch images from users folder
      const { data, error } = await supabase.storage
        .from('drive')
        .list(user.id);
      console.log('Supabase list response:', { data, error });
      if (error) {
        throw error;
      }
      //   bandage fix developers note(- I'dont know why there is a placeholder appearing -)
      const filterPlaceholder =
        data?.filter((file) => file.name !== '.emptyFolderPlaceholder') ?? [];

      // Create image objects with URLs to map over
      const imageFiles: ImageFile[] = await Promise.all(
        (filterPlaceholder || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('drive')
            .getPublicUrl(`${user.id}/${file.name}`);

          return {
            id: file.id || file.name,
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at,
          };
        })
      );

      setImages(imageFiles);
      setOriginalImages(imageFiles);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  // function to upload an image
  const uploadFile = async (file: File) => {
    try {
      if (!file) {
        throw new Error('No file selected');
      }

      setIsUploading(true);
      setError(null);

      const { data: fileData, error: fileError } = await supabase.storage
        .from('drive')
        .upload(user.id + '/' + file.name, file);

      if (fileError) {
        throw fileError;
      }

      console.log('File uploaded successfully:', fileData);

      // Refresh images list after upload
      await fetchImages();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Function to delete an image
  const deleteImage = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Find the image by id
      const imageToDelete = images.find((img) => img.id === id);

      if (!imageToDelete) {
        throw new Error('Image not found');
      }

      // Delete the file from storage
      const { error } = await supabase.storage
        .from('drive')
        .remove([`${user.id}/${imageToDelete.name}`]);

      if (error) {
        setError('Error on image delete.');
        throw error;
      }

      // // Update the state to remove the deleted image
      // setImages(images.filter((img) => img.id !== id));
      fetchImages();
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  // weird supabase storage trait you cant update the image details, this is a weird work around
  // developers not (- think of solution for food feature -)
  const updateImage = async (id: string, newName: string) => {
    try {
      setLoading(true);
      setError(null);

      const imageToEdit = images.find((img) => img.id === id);
      if (!imageToEdit) throw new Error('Image not found');

      // Step 1: re-download the original image
      const { data: downloadData, error: downloadError } =
        await supabase.storage
          .from('drive')
          .download(`${user.id}/${imageToEdit.name}`);

      if (downloadError || !downloadData) {
        throw new Error('Failed to download image for renaming');
      }

      // Step 2: Upload it with new name
      const { error: uploadError } = await supabase.storage
        .from('drive')
        .upload(`${user.id}/${newName}`, downloadData, {
          upsert: false,
        });

      if (uploadError) {
        throw new Error('Failed to upload renamed image');
      }

      // Step 3: Delete the original image the user edited
      const { error: deleteError } = await supabase.storage
        .from('drive')
        .remove([`${user.id}/${imageToEdit.name}`]);

      if (deleteError) {
        throw new Error('Failed to delete original image');
      }

      // Refresh the image list
      await fetchImages();
    } catch (err) {
      console.error('Error updating image:', err);
      setError('Failed to update image');
    } finally {
      setLoading(false);
    }
  };
  // function to search for an image
  const searchImage = async (search: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.storage
        .from('drive')
        .list(user.id);

      if (error) throw error;

      const filtered = (data ?? [])
        .filter((file) => file.name !== '.emptyFolderPlaceholder')
        .filter((file) =>
          file.name.toLowerCase().includes(search.toLowerCase())
        );

      const imageFiles: ImageFile[] = await Promise.all(
        filtered.map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('drive')
            .getPublicUrl(`${user.id}/${file.name}`);

          return {
            id: file.id || file.name,
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at,
          };
        })
      );

      setImages(imageFiles);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search images');
    } finally {
      setLoading(false);
    }
  };

  const sortImages = (by: 'default' | 'alphabetical' | 'date-old-new' | 'date-new-old') => {
    if (by === 'default') {
      setImages(originalImages);
      return;
    }

    const sorted = [...images].sort((a, b) => {
      if (by === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (by === 'date-new-old') {
        return (
          new Date(b.created_at || '').getTime() -
          new Date(a.created_at || '').getTime()
        );
      } else if (by === 'date-old-new') {
        return (
          new Date(a.created_at || '').getTime() -
          new Date(b.created_at || '').getTime()
        );
      }
      return 0;
    });
  
    setImages(sorted);
  };

  // Fetch images on mount
  useEffect(() => {
    const loadImages = async () => {
      await fetchImages();
    };

    loadImages();
  }, [user.id]);

  // The value object that will be provided to consumers
  const value = {
    images,
    loading,
    error,
    deleteImage,
    updateImage,
    searchImage,
    sortImages,
    uploadFile,
    isUploading,
    refreshImages: fetchImages,
  };

  return (
    <DriveContext.Provider value={value}>{children}</DriveContext.Provider>
  );
};

// Custom hook to use the drive context
export function useDrive() {
  const context = useContext(DriveContext);

  if (context === undefined) {
    throw new Error('useDrive must be used within a DriveProvider');
  }

  return context;
}
