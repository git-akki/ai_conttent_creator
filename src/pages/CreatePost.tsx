import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Calendar as CalendarIcon, 
  Clock, 
  Image as ImageIcon,
  X,
  AlertCircle,
  Sparkles,
  Target,
  Lightbulb
} from 'lucide-react';
import { format } from 'date-fns';
import { getSocialAccounts, createPost, getContentSuggestions } from '../lib/api';
import { SocialAccount } from '../types';
import { useToast } from '../components/ui/toaster';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // New state for AI suggestions
  const [topic, setTopic] = useState('');
  const [selectedKPI, setSelectedKPI] = useState('engagement');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const kpiOptions = [
    { value: 'engagement', label: 'Increase Engagement' },
    { value: 'reach', label: 'Expand Reach' },
    { value: 'conversion', label: 'Drive Conversions' },
    { value: 'awareness', label: 'Brand Awareness' },
    { value: 'traffic', label: 'Website Traffic' }
  ];

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getSocialAccounts();
        setAccounts(data);
        
        // Default select all connected accounts
        setSelectedPlatforms(
          data.filter(account => account.connected).map(account => account.platform)
        );
      } catch (error) {
        console.error('Error fetching social accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAccounts();
  }, []);

  useEffect(() => {
    setCharacterCount(content.length);
  }, [content]);

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!content.trim()) {
      newErrors.content = 'Post content is required';
    }
    
    if (selectedPlatforms.length === 0) {
      newErrors.platforms = 'At least one platform must be selected';
    }
    
    if (!scheduledDate) {
      newErrors.date = 'Scheduled date is required';
    }
    
    if (!scheduledTime) {
      newErrors.time = 'Scheduled time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Combine date and time
      if (!scheduledDate || !scheduledTime) {
        throw new Error('Date and time are required');
      }
      
      const [hours, minutes] = scheduledTime.split(':');
      const scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      await createPost({
        content,
        platforms: selectedPlatforms,
        scheduled: scheduledDateTime.toISOString(),
        image: imageUrl || null,
      });
      
      // Redirect to calendar view
      navigate('/calendar');
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ submit: 'Failed to create post. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!topic || selectedPlatforms.length === 0) {
      setErrors({
        ...errors,
        suggestions: 'Please select at least one platform and enter a topic'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const platform = selectedPlatforms[0]; // Use first selected platform
      const suggestions = await getContentSuggestions(platform, selectedKPI, topic);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setErrors({
        ...errors,
        suggestions: 'Failed to generate suggestions. Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applyCaption = (caption: string) => {
    setContent(caption);
  };

  const renderPlatformIcon = (platform: string, isSelected: boolean) => {
    const baseClasses = "h-6 w-6";
    const colorClasses = isSelected ? "text-white" : "";
    
    switch (platform) {
      case 'twitter':
        return <Twitter className={`${baseClasses} ${colorClasses}`} />;
      case 'facebook':
        return <Facebook className={`${baseClasses} ${colorClasses}`} />;
      case 'instagram':
        return <Instagram className={`${baseClasses} ${colorClasses}`} />;
      case 'linkedin':
        return <Linkedin className={`${baseClasses} ${colorClasses}`} />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'facebook':
        return 'bg-blue-700 hover:bg-blue-800';
      case 'instagram':
        return 'bg-pink-600 hover:bg-pink-700';
      case 'linkedin':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const platformMaxLength: {[key: string]: number} = {
    twitter: 280,
    facebook: 5000,
    instagram: 2200,
    linkedin: 3000,
  };

  const getMaxLength = () => {
    if (selectedPlatforms.length === 0) return 5000;
    return Math.min(...selectedPlatforms.map(p => platformMaxLength[p] || 5000));
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-500">Schedule content across your social media accounts</p>
      </div>

      {errors.submit && (
        <div className="bg-error-50 text-error-700 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{errors.submit}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Platform selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Platforms
              {errors.platforms && (
                <span className="text-error-500 ml-2 text-xs">{errors.platforms}</span>
              )}
            </label>
            <div className="flex flex-wrap gap-3">
              {accounts.filter(account => account.connected).map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => togglePlatform(account.platform)}
                  className={`flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    selectedPlatforms.includes(account.platform)
                      ? `${getPlatformColor(account.platform)} text-white`
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {renderPlatformIcon(account.platform, selectedPlatforms.includes(account.platform))}
                  <span>{account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 text-primary-500 mr-2" />
              AI Content Suggestions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                  Topic or Theme
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Product launch, Industry news"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="kpi" className="block text-sm font-medium text-gray-700 mb-2">
                  Target KPI
                </label>
                <select
                  id="kpi"
                  value={selectedKPI}
                  onChange={(e) => setSelectedKPI(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {kpiOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateSuggestions}
              disabled={isGenerating}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </button>

            {errors.suggestions && (
              <p className="mt-2 text-sm text-error-600">{errors.suggestions}</p>
            )}

            {suggestions && (
              <div className="mt-4 space-y-4">
                {/* Trending Topics */}
                <div className="bg-gray-50 rounded-md p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Trending Topics</h4>
                  <div className="space-y-2">
                    {suggestions.trends.map((trend: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600 flex items-start">
                        <Target className="h-4 w-4 text-primary-500 mr-2 mt-0.5" />
                        {trend}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Caption Suggestions */}
                <div className="bg-gray-50 rounded-md p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Caption Suggestions</h4>
                  <div className="space-y-2">
                    {suggestions.captions.map((caption: string, index: number) => (
                      <div key={index} className="bg-white rounded p-3 shadow-sm">
                        <p className="text-sm text-gray-600">{caption}</p>
                        <button
                          type="button"
                          onClick={() => applyCaption(caption)}
                          className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Use this caption
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Strategy */}
                <div className="bg-gray-50 rounded-md p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Strategy Recommendations</h4>
                  <div className="text-sm text-gray-600">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(suggestions.strategy, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content editor */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Post Content
              {errors.content && (
                <span className="text-error-500 ml-2 text-xs">{errors.content}</span>
              )}
            </label>
            <div className="relative">
              <textarea
                id="content"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to share?"
                maxLength={getMaxLength()}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {characterCount}/{getMaxLength()}
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (optional)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ImageIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="imageUrl"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/image.jpg"
                className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              {imageUrl && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setImageUrl('')}
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>
            {imageUrl && (
              <div className="mt-3 w-full max-w-xs">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="max-h-40 rounded-md object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date
                {errors.date && (
                  <span className="text-error-500 ml-2 text-xs">{errors.date}</span>
                )}
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="scheduledDate"
                  onChange={(e) => setScheduledDate(e.target.value ? new Date(e.target.value) : null)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                Time
                {errors.time && (
                  <span className="text-error-500 ml-2 text-xs">{errors.time}</span>
                )}
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="scheduledTime"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-700 border border-transparent rounded-md shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Scheduling...' : 'Schedule Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;