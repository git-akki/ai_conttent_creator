import React, { useEffect, useState } from 'react';
import { Users, Image, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface InstagramStats {
  followers_count: number;
  media_count: number;
  total_likes: number;
  username: string;
}

const InstagramStats: React.FC = () => {
  const [stats, setStats] = useState<InstagramStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInstagramStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('social_media')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('platform', 'instagram')
          .single();

        if (error) throw error;

        if (data) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching Instagram stats:', err);
        setError('Failed to load Instagram statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstagramStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">No Instagram data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Instagram Stats</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Followers</p>
              <p className="text-lg font-semibold">{stats.followers_count}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Image className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Posts</p>
              <p className="text-lg font-semibold">{stats.media_count}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Total Likes</p>
              <p className="text-lg font-semibold">{stats.total_likes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramStats; 