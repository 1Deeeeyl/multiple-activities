'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import Container from '@/components/container/Container';
import Image from 'next/image';
import Modal from '@/components/modal/Modal';
import { useFood } from './hooks/useFood';
import Link from 'next/link';

export default function FoodViewPage() {
  const params = useParams();
  const foodId = params.foodId?.toString();

  const {
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
  } = useFood(foodId);

  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-lg">Loading...</p>
        </div>
      </Container>
    );
  }

  if (notFound || foodInfo === null) {
    return (
      <Container>
        <div className="flex flex-col justify-center items-center min-h-[50vh]">
          <h2 className="text-xl font-bold text-red-500 mb-2">
            Food Not Found
          </h2>
          <p className="text-gray-700">
            The food item you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/food-review"
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Back to Food Reviews
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="bg-white p-5 rounded flex flex-col mb-20">
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
        {modalMode === 'UpdateInfo' && (
          <>
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
                onKeyDown={(e) => e.key === 'Enter' && confirmUpdate()}
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
                className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
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
            <p className="mb-6">Are you sure you want to delete this review?</p>
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
      </Modal>
    </Container>
  );
}
