import { createClient, protect } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Use the correct parameter structure for Next.js App Router
export async function DELETE(
  request: Request,
  {params}: { params:Promise< { userId: string }> }
) {
  try {
    const user = await protect();
    const {userId} = await params

    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own account' },
        { status: 403 }
      );
    }

    const supabase = await createClient(); //No argument uses anon key

    // Delete in friends table
    const { error: friendsDeleteError } = await supabase
      .from('friends')
      .delete()
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    // Delete in secret_messages table
    const { error: secretMessagesDeleteError } = await supabase
      .from('secret_messages')
      .delete()
      .eq('profile_id', userId);

    // Delete in profiles table
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('profile_id', userId);

    if (profileDeleteError || secretMessagesDeleteError || friendsDeleteError) {
      console.error(
        'Error deleting profile data:',
        profileDeleteError || secretMessagesDeleteError || friendsDeleteError
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