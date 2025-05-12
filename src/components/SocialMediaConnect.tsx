import React, { useState } from 'react';
import { Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SocialMediaConnect: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInstagramConnect = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Instagram Basic Display API configuration
      const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/instagram/callback`;
      
      // Store the current URL in localStorage to redirect back after auth
      localStorage.setItem('instagram_redirect', window.location.pathname);

      // Construct Instagram authorization URL
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;

      // Redirect to Instagram authorization page
      window.location.href = authUrl;
    } catch (err) {
      console.error('Instagram connection error:', err);
      setError('Failed to connect to Instagram');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Social Media</h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleInstagramConnect}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          <Instagram className="h-5 w-5 mr-2" />
          {isLoading ? 'Connecting...' : 'Connect Instagram'}
        </button>
      </div>
    </div>
  );
};

export default SocialMediaConnect; 