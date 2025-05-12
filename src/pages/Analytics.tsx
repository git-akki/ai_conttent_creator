import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  TrendingUp,
  Users,
  Heart,
  MessageSquare,
  Repeat,
  Share2
} from 'lucide-react';
import { getAnalytics } from '../lib/api';
import { Analytics as AnalyticsType } from '../types';
import { getPlatformColor } from '../lib/utils';

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsType | null>(null);
  const [activePlatform, setActivePlatform] = useState<string>('twitter');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get platform icons
  const renderPlatformIcon = (platform: string, className: string = 'h-5 w-5') => {
    switch (platform) {
      case 'twitter':
        return <Twitter className={`${className} ${getPlatformColor(platform)}`} />;
      case 'facebook':
        return <Facebook className={`${className} ${getPlatformColor(platform)}`} />;
      case 'instagram':
        return <Instagram className={`${className} ${getPlatformColor(platform)}`} />;
      case 'linkedin':
        return <Linkedin className={`${className} ${getPlatformColor(platform)}`} />;
      default:
        return null;
    }
  };

  const platforms = [
    { id: 'twitter', name: 'Twitter', color: '#1DA1F2' },
    { id: 'instagram', name: 'Instagram', color: '#E1306C' },
    { id: 'facebook', name: 'Facebook', color: '#4267B2' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0077B5' },
  ];

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'followers':
        return <Users className="h-5 w-5 text-primary-500" />;
      case 'engagement':
        return <TrendingUp className="h-5 w-5 text-accent-500" />;
      case 'likes':
      case 'reactions':
        return <Heart className="h-5 w-5 text-error-500" />;
      case 'comments':
        return <MessageSquare className="h-5 w-5 text-secondary-500" />;
      case 'retweets':
      case 'shares':
        return <Repeat className="h-5 w-5 text-success-500" />;
      default:
        return <Share2 className="h-5 w-5 text-warning-500" />;
    }
  };

  const getPlatformMetrics = () => {
    if (!analyticsData || !analyticsData[activePlatform]) return [];
    
    const data = analyticsData[activePlatform];
    const metrics = Object.entries(data)
      .filter(([key]) => key !== 'daily')
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        key,
      }));
      
    return metrics;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  const activePlatformData = analyticsData?.[activePlatform];
  const platformColor = platforms.find(p => p.id === activePlatform)?.color || '#3B82F6';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Monitor your social media performance</p>
      </div>

      {/* Platform tabs */}
      <div className="bg-white rounded-lg shadow-sm p-1">
        <div className="flex flex-wrap">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setActivePlatform(platform.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                activePlatform === platform.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {renderPlatformIcon(platform.id)}
              <span>{platform.name}</span>
              {analyticsData?.[platform.id] && (
                <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800">
                  Connected
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activePlatformData ? (
        <>
          {/* Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getPlatformMetrics().slice(0, 4).map((metric) => (
              <div key={metric.key} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    {getMetricIcon(metric.key)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">{metric.name}</h3>
                    <p className="mt-1 text-xl font-semibold text-gray-900">
                      {metric.key === 'engagement' ? `${metric.value}%` : metric.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Followers growth chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Followers Growth</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activePlatformData.daily}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="followers"
                    stroke={platformColor}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement rate chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Engagement Rate</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activePlatformData.daily}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="engagement"
                    name="Engagement Rate"
                    fill={platformColor}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">No data available</h2>
          <p className="text-gray-500">This account is not connected or has no analytics data.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;