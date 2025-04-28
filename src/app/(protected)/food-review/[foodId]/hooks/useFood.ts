import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type Food = {
  image_url: string;
  food_name: string;
  profile_id: string;
};

type Review = {
  review_id: string;
  food_id: string;
  profile_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  username: string;
};

type ModalMode =
  | 'UpdateInfo'
  | 'DeleteInfo'
  | 'AddReview'
  | 'UpdateReview'
  | 'DeleteReview';

export function useFood(foodId: string | undefined) {
  const router = useRouter();
  const supabase = createClient();

  // Food state
  const [foodInfo, setFoodInfo] = useState<Food | null>(null);
  const [foodName, setFoodName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('AddReview');
  const [error, setError] = useState<string | null>(null);

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'username'>('date');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  // Food operations
  const handleUpdateBtn = () => {
    setFoodName(foodInfo?.food_name || '');
    setModalMode('UpdateInfo');
    setShowModal(true);
  };

  const handleDeleteBtn = () => {
    setModalMode('DeleteInfo');
    setShowModal(true);
  };

  const confirmUpdate = async () => {
    if (!foodName.trim()) {
      setError('Title is required');
      return;
    }

    setError(null);
    if (!foodId) return;

    try {
      setIsProcessing(true);

      const { data, error } = await supabase
        .from('foods')
        .update({ food_name: foodName })
        .eq('food_id', foodId)
        .select();

      if (!error && data && data.length > 0) {
        setFoodInfo((prevState) => {
          if (!prevState) return null;
          return {
            ...prevState,
            food_name: foodName,
          };
        });
      }
    } catch (err) {
      console.error('Error updating food:', err);
    } finally {
      setIsProcessing(false);
      setShowModal(false);
      router.refresh();
    }
  };

  const handleDeleteFood = async () => {
    if (!foodInfo || !foodId) return;

    try {
      setIsProcessing(true);
      // Extract the path after "public/food-imgs/"
      const publicUrl = foodInfo.image_url;
      const pathInBucket = publicUrl.split(
        '/storage/v1/object/public/food-imgs/'
      )[1];

      if (!pathInBucket) {
        console.error('Could not extract image path from URL.');
        return;
      }

      // Delete the image from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('food-imgs')
        .remove([pathInBucket]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        return;
      }

      // Delete the food record from database
      const { error: dbError } = await supabase
        .from('foods')
        .delete()
        .eq('food_id', foodId);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        return;
      }
      setIsProcessing(false);
      router.push('/food-review'); // Redirect after deletion

      console.log('Successfully deleted food and its image!');
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  // Review operations
  const handleAddReview = () => {
    setComment('');
    setModalMode('AddReview');
    setShowModal(true);
  };

  const handleUpdateReview = () => {
    if (userReview) {
      setComment(userReview.comment);
      setCurrentReviewId(userReview.review_id);
      setModalMode('UpdateReview');
      setShowModal(true);
    }
  };

  const handleDeleteReview = () => {
    if (userReview) {
      setCurrentReviewId(userReview.review_id);
      setModalMode('DeleteReview');
      setShowModal(true);
    }
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      setError('Review comment is required');
      return;
    }

    if (!foodId || !user) {
      setError('You must be logged in to submit a review');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const { data, error } = await supabase
        .from('food_reviews')
        .insert({
          food_id: foodId,
          profile_id: user.id,
          comment: comment,
        })
        .select('*, profiles(username)');

      if (error) {
        console.error('Error adding review:', error);
        setError('Failed to add review');
      } else {
        // Transform the data to match our Review type
        const newReview: Review = {
          review_id: data[0].review_id,
          food_id: data[0].food_id,
          profile_id: data[0].profile_id,
          comment: data[0].comment,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          username: data[0].profiles.username,
        };

        setReviews([newReview, ...reviews]);
        setUserReview(newReview); // Set the user's review
        setShowModal(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateReview = async () => {
    if (!comment.trim()) {
      setError('Review comment is required');
      return;
    }

    if (!currentReviewId || !user) {
      setError('Something went wrong');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const { data, error } = await supabase
        .from('food_reviews')
        .update({ comment: comment, updated_at: new Date().toISOString() })
        .eq('review_id', currentReviewId)
        .eq('profile_id', user.id) // Security: ensure user owns this review
        .select();

      if (error) {
        console.error('Error updating review:', error);
        setError('Failed to update review');
      } else {
        // Update the review in our local state
        const updatedReviews = reviews.map((review) =>
          review.review_id === currentReviewId
            ? {
                ...review,
                comment: comment,
                updated_at: new Date().toISOString(),
              }
            : review
        );

        setReviews(updatedReviews);

        // Update userReview state as well
        setUserReview((prevUserReview) => {
          if (prevUserReview && prevUserReview.review_id === currentReviewId) {
            return {
              ...prevUserReview,
              comment: comment,
              updated_at: new Date().toISOString(),
            };
          }
          return prevUserReview;
        });

        setShowModal(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteReview = async () => {
    if (!currentReviewId || !user) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('food_reviews')
        .delete()
        .eq('review_id', currentReviewId)
        .eq('profile_id', user.id); // Security: ensure user owns this review

      if (error) {
        console.error('Error deleting review:', error);
      } else {
        // Remove the review from our local state
        setReviews(
          reviews.filter((review) => review.review_id !== currentReviewId)
        );
        setUserReview(null); // Clear the user review after deletion
        setShowModal(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Data fetching
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id });
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    const fetchFood = async () => {
      if (!foodId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const { data: foodData, error } = await supabase
        .from('foods')
        .select('image_url, food_name, profile_id')
        .eq('food_id', foodId)
        .single();

      if (error) {
        console.error('Error fetching food:', error);
        setNotFound(true);
      } else {
        setFoodInfo(foodData);
      }

      setIsLoading(false);
    };

    fetchFood();
  }, [foodId]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!foodId) return;

      setIsReviewsLoading(true);

      try {
        const { data, error } = await supabase
          .from('food_reviews')
          .select(
            `
            *,
            profiles:profile_id (username)
          `
          )
          .eq('food_id', foodId);

        if (error) {
          console.error('Error fetching reviews:', error);
        } else {
          // Transform the data to match our Review type
          const formattedReviews = data.map((item) => ({
            review_id: item.review_id,
            food_id: item.food_id,
            profile_id: item.profile_id,
            comment: item.comment,
            created_at: item.created_at,
            updated_at: item.updated_at,
            username: item.profiles.username,
          }));

          setReviews(formattedReviews);

          // Find and set the current user's review if it exists
          if (user) {
            const userReview = formattedReviews.find(
              (review) => review.profile_id === user.id
            );
            setUserReview(userReview || null);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsReviewsLoading(false);
      }
    };

    if (user) {
      fetchReviews();
    }
  }, [foodId, user]);

  // Get sorted reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'date') {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      return a.username.localeCompare(b.username);
    }
  });

  // Check if the current user is the owner of the food post
  const isOwner = user && foodInfo && user.id === foodInfo.profile_id;

  return {
    // State
    foodInfo,
    foodName,
    setFoodName,
    showModal,
    setShowModal,
    isProcessing,
    modalMode,
    error,
    setError,
    isReviewsLoading,
    comment,
    setComment,
    sortBy,
    setSortBy,
    user,
    userReview,
    sortedReviews,
    isOwner,
    isLoading,
    notFound,

    // Functions
    handleUpdateBtn,
    handleDeleteBtn,
    confirmUpdate,
    handleDeleteFood,
    handleAddReview,
    handleUpdateReview,
    handleDeleteReview,
    submitReview,
    updateReview,
    deleteReview,
  };
}

export type { Food, Review, ModalMode };
