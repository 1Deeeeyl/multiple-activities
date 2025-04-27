'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Define types
type Food = {
  food_id: string;
  profile_id: string;
  food_name: string;
  image_url: string;
  created_at: string;
};

type FoodContextType = {
  foods: Food[];
  isUploading: boolean;
  isLoading: boolean;
  uploadFood: (file: File, foodName: string) => Promise<void>;
  fetchFoods: () => Promise<void>;
  deleteFood: (foodId: string, imageUrl: string) => Promise<void>;
};

// Create context
const FoodContext = createContext<FoodContextType | undefined>(undefined);

type DriveProviderProps = {
  user: User;
  children: React.ReactNode;
};

// Provider component
export function FoodProvider({ user, children }: DriveProviderProps) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Supabase client
  const supabase = createClient();

  const uploadFood = async (file: File, foodName: string) => {
    try {
      if (!file) {
        throw new Error('No file selected');
      }

      setIsUploading(true);
      const fileExtension = file.name.split('.').pop();
      const fileName = uuidv4();
      const newFileName = `${fileName}.${fileExtension}`;
      // Upload the file to storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('food-imgs')
        .upload(user.id + '/' + newFileName, file);

      if (fileError) {
        throw fileError;
      }

      console.log('Food image uploaded successfully:', fileData);

      //   // Get the URL of the uploaded image
      const { data: urlData } = supabase.storage
        .from('food-imgs')
        .getPublicUrl(user.id + '/' + newFileName);

      //   // Insert record into foods table
      const { error: insertError } = await supabase.from('foods').insert([
        {
          profile_id: user.id,
          food_name: foodName,
          image_url: urlData.publicUrl,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      // Refresh foods list after upload
        await fetchFoods();
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch all foods
  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a food and its image
  const deleteFood = async (foodId: string, imageUrl: string) => {
    // try {
    //   // Get the authenticated user
    //   const { data: { user } } = await supabase.auth.getUser();
    //   if (!user) throw new Error('User not authenticated');
    //   // Extract the path from the URL
    //   const path = imageUrl.split('/').slice(-2).join('/');
    //   // Delete from storage
    //   const { error: storageError } = await supabase
    //     .storage
    //     .from('food-images')
    //     .remove([path]);
    //   if (storageError) throw storageError;
    //   // Delete from database
    //   const { error: dbError } = await supabase
    //     .from('foods')
    //     .delete()
    //     .eq('food_id', foodId);
    //   if (dbError) throw dbError;
    //   // Update state
    //   setFoods(foods.filter(food => food.food_id !== foodId));
    // } catch (error) {
    //   console.error('Error deleting food:', error);
    //   throw error;
    // }
  };

  useEffect(() => {
    const loadFoods = async () => {
        await fetchFoods();
        console.log(foods)
      };
  
      loadFoods();
    }, [user.id]);

  return (
    <FoodContext.Provider
      value={{
        foods,
        isUploading,
        isLoading,
        uploadFood,
        fetchFoods,
        deleteFood,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}

// Custom hook to use the context
export function useFood() {
  const context = useContext(FoodContext);
  if (context === undefined) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
}
