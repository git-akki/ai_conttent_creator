import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const InstagramCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for access token
        const response = await fetch('https://api.instagram.com/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: import.meta.env.VITE_INSTAGRAM_CLIENT_ID,
            client_secret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: `${window.location.origin}/auth/instagram/callback`,
            code,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange code for access token');
        }

        const { access_token, user_id } = await response.json();

        // Get user profile data
        const profileResponse = await fetch(
          `https://graph.instagram.com/me?fields=id,username,media_count&access_token=${access_token}`
        );

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const profileData = await profileResponse.json();

        // Get user's media
        const mediaResponse = await fetch(
          `https://graph.instagram.com/me/media?fields=id,like_count&access_token=${access_token}`
        );

        if (!mediaResponse.ok) {
          throw new Error('Failed to fetch user media');
        }

        const mediaData = await mediaResponse.json();

        // Calculate total likes
        const totalLikes = mediaData.data.reduce(
          (sum: number, media: { like_count: number }) => sum + media.like_count,
          0
        );

        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        // Store Instagram data in Supabase
        const { error: upsertError } = await supabase
          .from('social_media')
          .upsert({
            user_id: session.user.id,
            platform: 'instagram',
            access_token,
            stats: {
              username: profileData.username,
              followers_count: 0, // Not available in Basic Display API
              media_count: profileData.media_count,
              total_likes: totalLikes,
            },
            updated_at: new Date().toISOString(),
          });

        if (upsertError) {
          throw upsertError;
        }

        // Redirect back to the original page
        const redirectPath = localStorage.getItem('instagram_redirect') || '/dashboard';
        localStorage.removeItem('instagram_redirect');
        navigate(redirectPath);
      } catch (err) {
        console.error('Instagram callback error:', err);
        setError('Failed to connect Instagram account');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Error</h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Connecting Instagram</h2>
          <p className="mt-2 text-sm text-gray-600">Please wait while we connect your Instagram account...</p>
        </div>
      </div>
    </div>
  );
};

export default InstagramCallback; 