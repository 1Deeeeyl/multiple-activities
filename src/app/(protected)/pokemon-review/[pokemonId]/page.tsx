'use client';

import React, { useState } from 'react';
import Container from '@/components/container/Container';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Modal from '@/components/modal/Modal';

// Import consolidated hook
import { usePokemonPage } from './hooks/usePokemon';

export default function PokemonViewPage() {
  const params = useParams();
  const pokemonId = params.pokemonId?.toString();

  // Use the consolidated hook
  const {
    // User
    user,
    isUserLoading,

    // Pokemon
    pokemon,
    isPokemonLoading,
    pokemonError,

    // Reviews
    reviews,
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
    handleDeleteReview,
  } = usePokemonPage(pokemonId);

  // State for modal control
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'update'>('add');
  const [reviewText, setReviewText] = useState('');

  // UI handlers
  const handleAddReview = () => {
    setReviewText('');
    setModalMode('add');
    setShowModal(true);
  };

  const handleUpdateReview = () => {
    if (userReview) {
      setReviewText(userReview.review);
      setModalMode('update');
      setShowModal(true);
    }
  };

  const submitReview = async () => {
    const success = await handleSubmitReview(reviewText, modalMode);
    if (success) {
      setShowModal(false);
    }
  };

  if (isPokemonLoading || isUserLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-lg">Loading...</p>
        </div>
      </Container>
    );
  }

  if (pokemonError || !pokemon) {
    return (
      <Container>
        <div className="text-center py-8">
          <p className="text-xl">{pokemonError || 'Pokémon not found'}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="bg-white p-5 rounded flex flex-col">
        <section className="bg-gray-200 flex flex-col items-center justify-center text-center mb-5 p-5 rounded">
          <header>
            <div className="w-48 h-48 relative">
              <Image
                src={pokemon.image.image}
                alt={pokemon.name}
                width={192}
                height={192}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col w-fit">
              <h1 className="text-lg font-bold tracking-widest mt-5">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </h1>
              <p className="font-semibold text-sm mt-2 tracking-wide">{`Pokémon #${pokemon.id}`}</p>
            </div>
          </header>
        </section>

        <section className="">
          <div className="flex flex-row justify-between items-center mb-4">
            <h2 className="font-bold text-2xl">Reviews</h2>
            <div className="flex gap-2">
              {user && !userReview && (
                <button
                  onClick={handleAddReview}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                >
                  Add Review
                </button>
              )}
              {user && userReview && (
                <>
                  <button
                    onClick={handleUpdateReview}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded disabled:bg-red-300"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>

          {reviewError && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {reviewError}
              <button
                onClick={() => setReviewError(null)}
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
          ) : reviews.length === 0 ? (
            <p className="text-center py-2 italic">No reviews available</p>
          ) : (
            reviews.map((review) => (
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
                <p className="whitespace-pre-line">{review.review}</p>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Modal for adding/updating review */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="p-1">
          <h2 className="text-xl font-bold mb-4">
            {modalMode === 'add' ? 'Add Review' : 'Update Review'}
          </h2>
          <div className="mb-4">
            <label
              htmlFor="review-text"
              className="block text-sm font-medium mb-2"
            >
              Your Review
            </label>
            <textarea
              id="review-text"
              rows={5}
              className="w-full p-2 border rounded resize-none"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={isSubmitting}
              placeholder="Share your thoughts about this Pokémon..."
            ></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitReview}
              className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
              disabled={isSubmitting || !reviewText.trim()}
            >
              {isSubmitting
                ? 'Submitting...'
                : modalMode === 'add'
                ? 'Submit'
                : 'Update'}
            </button>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
