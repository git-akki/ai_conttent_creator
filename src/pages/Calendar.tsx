import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import { getPosts } from '../lib/api';
import { Post } from '../types';
import { formatTime, getPlatformColor, getStatusColor } from '../lib/utils';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className={`h-4 w-4 ${getPlatformColor(platform)}`} />;
      case 'facebook':
        return <Facebook className={`h-4 w-4 ${getPlatformColor(platform)}`} />;
      case 'instagram':
        return <Instagram className={`h-4 w-4 ${getPlatformColor(platform)}`} />;
      case 'linkedin':
        return <Linkedin className={`h-4 w-4 ${getPlatformColor(platform)}`} />;
      default:
        return null;
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = getDay(monthStart);

  const getPostsForDay = (day: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduled);
      return (
        postDate.getDate() === day.getDate() &&
        postDate.getMonth() === day.getMonth() &&
        postDate.getFullYear() === day.getFullYear()
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-500">Schedule and manage your posts</p>
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

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 bg-gray-50">
          {days.map((day) => (
            <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Empty cells for days before the start of the month */}
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-gray-50 h-32 md:h-40 px-2 py-2" />
          ))}

          {/* Calendar days */}
          {dateRange.map((day) => {
            const dayPosts = getPostsForDay(day);
            const isToday = day.getDate() === new Date().getDate() && 
                            day.getMonth() === new Date().getMonth() && 
                            day.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={day.toString()} 
                className={`bg-white h-32 md:h-40 px-2 py-2 ${isToday ? 'bg-primary-50' : ''}`}
              >
                <div className={`text-sm font-medium ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </div>
                <div className="mt-1 space-y-1 max-h-[90%] overflow-y-auto">
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      className={`p-1 text-xs rounded cursor-pointer hover:bg-gray-50 border-l-2 ${
                        post.status === 'published' 
                          ? 'border-success-500' 
                          : 'border-warning-500'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`truncate font-medium ${getStatusColor(post.status)}`}>
                          {formatTime(post.scheduled)}
                        </span>
                        <div className="flex space-x-1">
                          {post.platforms.map((platform) => (
                            <span key={platform}>
                              {renderPlatformIcon(platform)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="truncate mt-1">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;