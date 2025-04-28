import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';

// Define types
export type Pokemon = {
  id: number;
  name: string;
  image: {
    image: string;
  };
};

export type Review = {
  review_id: string;
  pokemon_id: number;
  profile_id: string;
  review: string;
  created_at: string;
  updated_at: string;
  username?: string; // From profiles table join
};

export type SortOption = 'date' | 'username';

export function usePokemonPage(pokemonId: string | undefined) {
  const supabase = createClient();
  
  // User state
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  // Pokemon state
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isPokemonLoading, setIsPokemonLoading] = useState(true);
  const [pokemonError, setPokemonError] = useState<string | null>(null);
  
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
      } else {
        redirect('/');
      }
      setIsUserLoading(false);
    }
    
    getUser();
  }, [supabase]);

  // Fetch Pokemon details
  useEffect(() => {
    if (!pokemonId) return;

    async function fetchPokemonDetails() {
      setIsPokemonLoading(true);
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
        setPokemonError('Failed to load Pokémon details');
      } finally {
        setIsPokemonLoading(false);
      }
    }

    fetchPokemonDetails();
  }, [pokemonId]);

  // Fetch reviews for this Pokemon
  useEffect(() => {
    if (!pokemon) return;

    async function fetchReviews() {
      setIsReviewsLoading(true);
      if (!pokemon){}

      try {
        // Get all reviews for this Pokemon with username from profiles table
        const { data, error: fetchError } = await supabase
          .from('pokemon_reviews')
          .select(`
            *,
            profiles:profile_id (username)
          `)
          .eq('pokemon_id', pokemon!.id);

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

  // Handle submitting a review (either add or update)
  const handleSubmitReview = async (reviewText: string, modalMode: 'add' | 'update') => {
    if (!reviewText.trim()) {
      setReviewError('Review text cannot be empty');
      return false;
    }

    if (!user || !pokemon) return false;

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
        if (!userReview) return false;

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
    
    // Pokemon
    pokemon,
    isPokemonLoading,
    pokemonError,
    
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