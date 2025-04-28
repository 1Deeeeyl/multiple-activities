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
  
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [user, setUser] = useState<any>(null);
  const [pokemonError, setPokemonError] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPokemonLoading, setIsPokemonLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('date');

  // get current user
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

  // fetch Pokemon details
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

  // fetch reviews for this Pokemon
  useEffect(() => {
    if (!pokemon) return;

    async function fetchReviews() {
      setIsReviewsLoading(true);
      if (!pokemon){}

      try {
        // get all reviews for this Pokemon with username from profiles table
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

        // format object to include username
        const formattedReviews = data.map(review => ({
          ...review,
          username: review.profiles?.username || 'Unknown User'
        }));

        setReviews(formattedReviews);

        // hheck if current user has a review
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

  // handle submitting a review (add or update)
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
        // add new review
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
        // update existing review
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
          
          // update the review in the reviews array
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

  // handle deleting a review
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

  // sort reviews based on selected option
  const getSortedReviews = () => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return (a.username || '').localeCompare(b.username || '');
      }
    });
  };

  return {
    user,
    isUserLoading,
    isSubmitting,
    isReviewsLoading,
    pokemon,
    isDeleting,    
    isPokemonLoading,
    handleSubmitReview,
    pokemonError,
    sortBy,
    handleDeleteReview,
    userReview,
    reviewError,
    reviews: getSortedReviews(),
    setReviewError,
    setSortBy,
  };
}