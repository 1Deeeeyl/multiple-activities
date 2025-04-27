'use client';

import React, { useEffect, useState } from 'react';
import Container from '@/components/container/Container';
import Image from 'next/image';
import { useParams, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Modal from '@/components/modal/Modal'; // Assuming you have a Modal component

// Define the Pokemon type
type Pokemon = {
  id: number;
  name: string;
  image: {
    image: string;
  };
};

// Define the Review type
type Review = {
  review_id: string;
  pokemon_id: number;
  profile_id: string;
  review: string;
  created_at: string;
  updated_at: string;
  username?: string; // From profiles table join
};

// Sort option type
type SortOption = 'date' | 'username';

export default function PokemonViewPage() {
  const params = useParams();
  const pokemonId = params.pokemonId?.toString();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'update'>('add');
  const [reviewText, setReviewText] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current user
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        redirect('/');
      }
    }
    
    getUser();
  }, [supabase]);

  // Fetch Pokemon details
  useEffect(() => {
    if (!pokemonId) return;

    async function fetchPokemonDetails() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
        );

        if (!res.ok) {
          throw new Error('Pokémon not found');
        }

        const data = await res.json();

        setPokemon({
          id: data.id,
          name: data.name,
          image: {
            image: data.sprites.front_default,
          },
        });
      } catch (err) {
        console.error('Error fetching Pokémon:', err);
        setError('Failed to load Pokémon details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPokemonDetails();
  }, [pokemonId]);

  // Fetch reviews for this Pokemon
  useEffect(() => {
    if (!pokemon) return;

    async function fetchReviews() {
      setIsReviewsLoading(true);
      try {
        // Make sure pokemon is not null before accessing its id
        if (!pokemon) {
          throw new Error('Pokemon data is not available');
        }
        
        // Get all reviews for this Pokemon with username from profiles table
        const { data, error: fetchError } = await supabase
          .from('pokemon_reviews')
          .select(`
            *,
            profiles:profile_id (username)
          `)
          .eq('pokemon_id', pokemon.id);

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
  }, [pokemon, user, supabase]);

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

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('pokemon_reviews')
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
    } catch (err) {
      console.error('Error deleting review:', err);
      setReviewError('Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      setReviewError('Review text cannot be empty');
      return;
    }

    if (!user || !pokemon) return;

    setIsSubmitting(true);
    setReviewError(null);
    const now = new Date().toISOString();

    try {
      if (modalMode === 'add') {
        // Add new review
        const { data, error: addError } = await supabase
          .from('pokemon_reviews')
          .insert([
            {
              pokemon_id: pokemon.id,
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
        if (!userReview) return;

        const { data, error: updateError } = await supabase
          .from('pokemon_reviews')
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

      setShowModal(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError(`Failed to ${modalMode} review`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return (a.username || '').localeCompare(b.username || '');
    }
  });

  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-lg">Loading...</p>
        </div>
      </Container>
    );
  }

  if (error || !pokemon) {
    return (
      <Container>
        <div className="text-center py-8">
          <p className="text-xl">{error || 'Pokémon not found'}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="bg-white p-5 rounded flex flex-col">
        <section className="bg-gray-200 flex flex-col items-center justify-center text-center mb-5 p-5 rounded">
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
            <h1 className="font-bold text-3xl mb-3 tracking-wider">
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </h1>
            <p className="font-semibold text-md">{`Pokémon #${pokemon.id}`}</p>
          </div>
        </section>
        
        <section className="mt-5">
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
            <label htmlFor="sort-select" className="mr-2">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none"
            >
              <option value="date">Latest</option>
              <option value="username">Username</option>
            </select>
          </div>

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
                  <p className="whitespace-pre-line">{review.review}</p>
                </div>
              ))
            )}
          </section>
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
              onClick={handleSubmitReview}
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