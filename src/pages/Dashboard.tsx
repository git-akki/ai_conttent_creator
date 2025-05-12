import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getPosts, getSocialAccounts, getAnalytics } from '../lib/api';
import { Post, SocialAccount, Analytics } from '../types';
import { formatDateTime, getPlatformIcon, getPlatformColor, getStatusColor } from '../lib/utils';

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, accountsData, analyticsData] = await Promise.all([
          getPosts(),
          getSocialAccounts(),
          getAnalytics()
        ]);
        
        setPosts(postsData);
        setAccounts(accountsData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get platform icons
  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className={`h-5 w-5 ${getPlatformColor(platform)}`} />;
      case 'facebook':
        return <Facebook className={`h-5 w-5 ${getPlatformColor(platform)}`} />;
      case 'instagram':
        return <Instagram className={`h-5 w-5 ${getPlatformColor(platform)}`} />;
      case 'linkedin':
        return <Linkedin className={`h-5 w-5 ${getPlatformColor(platform)}`} />;
      default:
        return null;
    }
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-warning-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-error-500" />;
      default:
        return null;
    }
  };

  const getTotalFollowers = () => {
    if (!analytics) return 0;
    
    return Object.values(analytics).reduce((sum, platform) => sum + platform.followers, 0);
  };

  const getAverageEngagement = () => {
    if (!analytics) return 0;
    
    const platforms = Object.values(analytics);
    return platforms.reduce((sum, platform) => sum + platform.engagement, 0) / platforms.length;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Manage your social media presence</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/create"
            className="inline-flex items-center rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Followers</h3>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {getTotalFollowers().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Scheduled Posts</h3>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {posts.filter(post => post.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Published Posts</h3>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {posts.filter(post => post.status === 'published').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-700">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg. Engagement</h3>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {getAverageEngagement().toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected accounts */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Connected Accounts</h2>
          <Link to="/profile" className="text-sm font-medium text-primary-700 hover:text-primary-800">
            Manage
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`flex items-center rounded-lg border p-4 ${
                account.connected ? 'border-success-200 bg-success-50' : 'border-gray-200'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${account.connected ? getPlatformColor(account.platform) : 'bg-gray-200'}`}>
                {renderPlatformIcon(account.platform)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                </p>
                <p className="text-xs text-gray-500">{account.handle}</p>
              </div>
              <div className="ml-auto">
                {account.connected ? (
                  <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800">
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    Disconnected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent posts */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Posts</h2>
          <Link to="/calendar" className="text-sm font-medium text-primary-700 hover:text-primary-800">
            View all
          </Link>
        </div>
        <div className="mt-6 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {posts.slice(0, 5).map((post) => (
              <li key={post.id} className="py-4 animate-slide-up">
                <div className="flex items-start space-x-4">
                  {post.image && (
                    <div className="flex-shrink-0">
                      <img 
                        src={post.image} 
                        alt="Post image" 
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{post.content}</p>
                    <div className="mt-2 flex items-center">
                      <span className="inline-flex items-center text-xs text-gray-500">
                        {renderStatusIcon(post.status)}
                        <span className={`ml-1 ${getStatusColor(post.status)}`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{formatDateTime(post.scheduled)}</span>
                    </div>
                  </div>
                  <div className="flex">
                    {post.platforms.map((platform) => (
                      <div key={platform} className="ml-1">
                        {renderPlatformIcon(platform)}
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;