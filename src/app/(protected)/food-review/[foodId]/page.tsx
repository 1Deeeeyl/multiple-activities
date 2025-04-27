'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Container from '@/components/container/Container';
import Image from 'next/image';
import Modal from '@/components/modal/Modal';
import { useRouter } from 'next/navigation';

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

// Define Modal modes correctly
type ModalMode =
  | 'UpdateInfo'
  | 'DeleteInfo'
  | 'AddReview'
  | 'UpdateReview'
  | 'DeleteReview';

export default function FoodViewPage() {
  const router = useRouter();
  const params = useParams();
  const foodId = params.foodId?.toString();
  const supabase = createClient();
  const [foodInfo, setFoodInfo] = useState<Food | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>('AddReview');
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'username'>('date');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const handleDeleteBtn = () => {
    setModalMode('DeleteInfo');
    setShowModal(true);
  };

  const handleDeleteFood = async () => {
    if (!foodInfo || !foodId) return;

    try {
      setIsProcessing(true);
      // 1. Get the path after "public/food-imgs/"
      const publicUrl = foodInfo.image_url;
      const pathInBucket = publicUrl.split(
        '/storage/v1/object/public/food-imgs/'
      )[1];

      if (!pathInBucket) {
        console.error('Could not extract image path from URL.');
        return;
      }

      // 2. Delete the image from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('food-imgs') // Your actual bucket name
        .remove([pathInBucket]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        return;
      }

      // 3. Delete the food record from database
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

  const handleUpdateBtn = () => {
    setFoodName(foodInfo?.food_name || ''); // Ensure food name is set correctly
    setModalMode('UpdateInfo'); // Update mode
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
        // Update the local state with the new food name
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
      router.refresh(); // This might not be immediately updating the UI
    }
  };

  // Review functions
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

  // Sort reviews based on selected option
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
      if (!foodId) return;

      const { data: foodData, error } = await supabase
        .from('foods')
        .select('image_url, food_name, profile_id')
        .eq('food_id', foodId)
        .single();

      if (error) {
        console.error('Error fetching food:', error);
      } else {
        setFoodInfo(foodData);
      }
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

  if (foodInfo === null) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-lg">Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="bg-white p-5 rounded flex flex-col">
        <section className="bg-gray-200 flex flex-col items-center justify-center text-center mb-5 p-5 rounded">
          {/* Show update/delete buttons only if user is the owner */}
          {isOwner && (
            <div className="flex flex-row gap-2 self-end mb-4">
              <button
                onClick={handleUpdateBtn}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Update
              </button>
              <button
                onClick={handleDeleteBtn}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          )}
          <header>
            <div className="relative h-60 w-xs overflow-hidden rounded-xs">
              <Image
                src={foodInfo.image_url}
                alt={foodInfo.food_name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  objectFit: 'cover',
                }}
              />
            </div>
            <div className="flex flex-col w-fit mx-auto">
              <h1 className="text-lg font-bold tracking-widest mt-2">
                {foodInfo.food_name}
              </h1>
            </div>
          </header>
        </section>

        <section className="">
          <div className="flex flex-row justify-between items-center mb-4">
            <h2 className="font-bold text-2xl">Reviews</h2>
            {user && (
              <div className="flex gap-2">
                {!userReview ? (
                  <button
                    onClick={handleAddReview}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                  >
                    Add Review
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleUpdateReview}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                      Update
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      disabled={isProcessing}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded disabled:bg-red-300"
                    >
                      {isProcessing ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Sort controls */}
          <div className="mb-4 flex items-center">
            <label htmlFor="sort-select" className="mr-2">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'username')}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none"
            >
              <option value="date">Latest</option>
              <option value="username">Username</option>
            </select>
          </div>
        </section>

        {/* Reviews list */}
        <section className="space-y-4">
          {isReviewsLoading ? (
            <p className="text-center py-2">Loading reviews...</p>
          ) : sortedReviews.length === 0 ? (
            <p className="text-center py-2 italic">No reviews available</p>
          ) : (
            sortedReviews.map((review) => (
              <div
                key={review.review_id}
                className={`p-4 rounded-lg ${
                  review.profile_id === user?.id
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">{review.username}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                    {review.created_at !== review.updated_at && ' (edited)'}
                  </p>
                </div>
                <p className="whitespace-pre-line">{review.comment}</p>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Modal for Update/Delete/Other Actions */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="p-5">
          {modalMode === 'UpdateInfo' && (
            <>
              <h2 className="text-xl font-bold mb-4">
                Update Food Information
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="foodName"
                  className="block text-sm font-medium mb-2"
                >
                  Food Name
                </label>
                <input
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  type="text"
                  name="foodName"
                  id="foodName"
                  className="w-full p-2 border rounded"
                  disabled={isProcessing}
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
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmUpdate}
                  className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                  disabled={isProcessing || !foodName.trim()}
                >
                  {isProcessing ? 'Updating...' : 'Update'}
                </button>
              </div>
            </>
          )}

          {modalMode === 'DeleteInfo' && (
            <>
              <h2 className="text-xl font-bold mb-4">Delete Confirmation</h2>
              <p className="mb-6">
                Are you sure you want to delete this food item?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFood}
                  className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}

          {modalMode === 'AddReview' && (
            <>
              <h2 className="text-xl font-bold mb-4">Add Review</h2>
              <div className="mb-4">
                <label
                  htmlFor="reviewComment"
                  className="block text-sm font-medium mb-2"
                >
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  name="reviewComment"
                  id="reviewComment"
                  rows={5}
                  className="w-full p-2 border rounded resize-none"
                  disabled={isProcessing}
                  placeholder="Share your thoughts about this food..."
                ></textarea>
              </div>
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReview}
                  className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                  disabled={isProcessing || !comment.trim()}
                >
                  {isProcessing ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </>
          )}

          {modalMode === 'UpdateReview' && (
            <>
              <h2 className="text-xl font-bold mb-4">Update Review</h2>
              <div className="mb-4">
                <label
                  htmlFor="reviewComment"
                  className="block text-sm font-medium mb-2"
                >
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  name="reviewComment"
                  id="reviewComment"
                  rows={5}
                  className="w-full p-2 border rounded resize-none"
                  disabled={isProcessing}
                ></textarea>
              </div>
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={updateReview}
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={isProcessing || !comment.trim()}
                >
                  {isProcessing ? 'Updating...' : 'Update'}
                </button>
              </div>
            </>
          )}

          {modalMode === 'DeleteReview' && (
            <>
              <h2 className="text-xl font-bold mb-4">Delete Confirmation</h2>
              <p className="mb-6">
                Are you sure you want to delete this review?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteReview}
                  className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </Container>
  );
}
