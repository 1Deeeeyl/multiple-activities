import { createClient, protect } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Use the correct parameter structure for Next.js App Router
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await protect();
    const { userId } = await params;

    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own account' },
        { status: 403 }
      );
    }

    const supabase = await createClient(); //No argument uses anon key

    // Define buckets to clean up
    const buckets = ['drive', 'food-imgs'];
    
    // Delete storage files in all user buckets
    for (const bucket of buckets) {
      try {
        // List all files in user's storage folder
        const { data: fileList, error: listError } = await supabase.storage
          .from(bucket)
          .list(`${userId}`);
        
        if (listError) {
          console.error(`Error listing storage files in ${bucket}:`, listError);
          // Continue with next bucket even if this one fails
          continue;
        }
        
        if (fileList && fileList.length > 0) {
          // Map file paths for deletion
          const filesToRemove = fileList.map((x) => `${userId}/${x.name}`);
          
          // Delete all files
          const { error: removeError } = await supabase.storage
            .from(bucket)
            .remove(filesToRemove);
          
          if (removeError) {
            console.error(`Error removing storage files from ${bucket}:`, removeError);
          }
        }
      } catch (bucketError) {
        console.error(`Error processing bucket ${bucket}:`, bucketError);
        // Continue with next bucket
      }
    }

    // Delete in todos table
    const { error: todosDeleteError } = await supabase
      .from('todos')
      .delete()
      .eq('profile_id', userId);

    // Delete in pokemon_reviews table
    const { error: pokemonReviewsError } = await supabase
      .from('pokemon_reviews')
      .delete()
      .eq('profile_id', userId);

    // Delete in markdowns table
    const { error: markdownsError } = await supabase
      .from('markdowns')
      .delete()
      .eq('profile_id', userId);

    // Delete in food_reviews table
    const { error: foodReviewsError } = await supabase
      .from('food_reviews')
      .delete()
      .eq('profile_id', userId);

    // Delete in foods table
    const { error: foodError } = await supabase
      .from('foods')
      .delete()
      .eq('profile_id', userId);

    // Delete in profiles table
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('profile_id', userId);

    if (
      profileDeleteError ||
      todosDeleteError ||
      foodError ||
      foodReviewsError ||
      markdownsError ||
      pokemonReviewsError
    ) {
      console.error(
        'Error deleting profile data:',
        profileDeleteError || todosDeleteError
      );
      return NextResponse.json(
        { error: 'Error deleting profile data' },
        { status: 500 }
      );
    }

    // Service role key for admin level data manipulation
    const supabaseAdmin = await createClient(true); // true = use service role key api

    // Delete the user root data
    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Error deleting user:', authDeleteError);
      return NextResponse.json(
        { error: 'Error deleting user authentication data' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Account successfully deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during account deletion:', error);
    return NextResponse.json(
      { error: 'Internal server error during account deletion' },
      { status: 500 }
    );
  }
}