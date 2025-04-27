// hooks/useFood.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useFood as useFoodContext } from '@/context/FoodContext';

// Define types
export type Food = {
  id: string;
  food_name: string;
  image_url: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
};

export type Review = {
  review_id: string;
  food_id: string;
  profile_id: string;
  review: string;
  created_at: string;
  updated_at: string;
  username?: string; // From profiles table join
};

export type SortOption = 'date' | 'username';

export function useFoodPage(foodId: string | undefined) {
  const supabase = createClient();
  
  // Safely try to use food context, but handle case where it's not available
  let contextFoods: any[] = [];
  try {
    const { foods } = useFoodContext();
    contextFoods = foods;
  } catch (error) {
    // Context not available, will fetch directly from database
    console.log('FoodContext not available, will fetch from database');
  }
  
  // User state
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  // Food state
  const [food, setFood] = useState<Food | null>(null);
  const [isFoodLoading, setIsFoodLoading] = useState(true);
  const [foodError, setFoodError] = useState<string | null>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current user
  useEffect(() => {
    async function getUser() {
      setIsUserLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setIsUserLoading(false);
    }
    
    getUser();
  }, [supabase]);

  // Fetch Food details
  useEffect(() => {
    if (!foodId) return;

    async function fetchFoodDetails() {
      setIsFoodLoading(true);
      try {
        // First check if the food is in context (if context is available)
        const contextFood = contextFoods?.find?.(f => f.id === foodId);
        
        if (contextFood && contextFood.id && contextFood.user_id) {
          setFood(contextFood);
        } else {
          // If not in context or context not available, fetch from database
          const { data, error } = await supabase
            .from('foods')
            .select('*')
            .eq('id', foodId)
            .single();
            
          if (error) {
            throw new Error('Food not found');
          }
          
          // Ensure the data has all required fields
          if (data && data.id && data.user_id) {
            setFood(data);
          } else {
            throw new Error('Food data is incomplete');
          }
        }
      } catch (err) {
        console.error('Error fetching food:', err);
        setFoodError('Failed to load food details');
      } finally {
        setIsFoodLoading(false);
      }
    }

    fetchFoodDetails();
  }, [foodId, contextFoods, supabase]);

  // Fetch reviews for this Food
  useEffect(() => {
    if (!food) return;

    async function fetchReviews() {
      setIsReviewsLoading(true);

      try {
        // Get all reviews for this Food with username from profiles table
        const { data, error: fetchError } = await supabase
          .from('food_reviews')
          .select(`
            *,
            profiles:profile_id (username)
          `)
          .eq('food_id', food!.id);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        // Format the data to include username
        const formattedReviews = data.map(review => ({
          ...review,
          username: review.profiles?.username || 'Unknown User'
        }));

        setReviews(formattedReviews);

        // Check if the current user has a review
        if (user) {
          const userReview = formattedReviews.find(
            (review) => review.profile_id === user.id
          );
          setUserReview(userReview || null);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviewError('Failed to load reviews');
      } finally {
        setIsReviewsLoading(false);
      }
    }

    fetchReviews();
  }, [food, user, supabase]);

  // Handle submitting a review (either add or update)
  const handleSubmitReview = async (reviewText: string, modalMode: 'add' | 'update') => {
    if (!reviewText.trim()) {
      setReviewError('Review text cannot be empty');
      return false;
    }

    if (!user || !food) return false;

    setIsSubmitting(true);
    setReviewError(null);
    const now = new Date().toISOString();

    try {
      if (modalMode === 'add') {
        // Add new review
        const { data, error: addError } = await supabase
          .from('food_reviews')
          .insert([
            {
              food_id: food.id,
              profile_id: user.id,
              review: reviewText,
              created_at: now,
              updated_at: now,
            },
          ])
          .select(`
            *,
            profiles:profile_id (username)
          `);

        if (addError) {
          throw new Error(addError.message);
        }

        if (data && data.length > 0) {
          const newReview = {
            ...data[0],
            username: data[0].profiles?.username || 'Unknown User'
          };
          setUserReview(newReview);
          setReviews([newReview, ...reviews]);
        }
      } else {
        // Update existing review
        if (!userReview) return false;

        const { data, error: updateError } = await supabase
          .from('food_reviews')
          .update({
            review: reviewText,
            updated_at: now,
          })
          .eq('review_id', userReview.review_id)
          .select(`
            *,
            profiles:profile_id (username)
          `);

        if (updateError) {
          throw new Error(updateError.message);
        }

        if (data && data.length > 0) {
          const updatedReview = {
            ...data[0],
            username: data[0].profiles?.username || 'Unknown User'
          };
          
          setUserReview(updatedReview);
          
          // Update the review in the reviews array
          const updatedReviews = reviews.map((review) =>
            review.review_id === userReview.review_id ? updatedReview : review
          );
          
          setReviews(updatedReviews);
        }
      }

      return true;
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError(`Failed to ${modalMode} review`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a review
  const handleDeleteReview = async () => {
    if (!userReview) return false;
    
    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('food_reviews')
        .delete()
        .eq('review_id', userReview.review_id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Refresh reviews
      setUserReview(null);
      const updatedReviews = reviews.filter(
        (review) => review.review_id !== userReview.review_id
      );
      setReviews(updatedReviews);
      return true;
    } catch (err) {
      console.error('Error deleting review:', err);
      setReviewError('Failed to delete review');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Sort reviews based on selected option
  const getSortedReviews = () => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return (a.username || '').localeCompare(b.username || '');
      }
    });
  };

  // Return everything needed by the page
  return {
    // User
    user,
    isUserLoading,
    
    // Food
    food,
    isFoodLoading,
    foodError,
    
    // Reviews
    reviews: getSortedReviews(),
    userReview,
    isReviewsLoading,
    reviewError,
    setReviewError,
    sortBy,
    setSortBy,
    isSubmitting,
    isDeleting,
    
    // Actions
    handleSubmitReview,
    handleDeleteReview
  };
}