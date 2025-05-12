import React, { useState, useEffect } from 'react';
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  Link as LinkIcon,
  ExternalLink,
  User as UserIcon,
  Mail,
  LogOut,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSocialAccounts } from '../lib/api';
import { SocialAccount } from '../types';
import { getPlatformColor } from '../lib/utils';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountsData = await getSocialAccounts();
        setAccounts(accountsData);
        
        if (user) {
          setName(user.name);
          setEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, would call an API to update the user profile
    setIsEditingProfile(false);
  };

  const handleConnectAccount = (platform: string) => {
    // In a real app, would initiate OAuth flow or other connection method
    console.log(`Connecting to ${platform}`);
  };

  const handleDisconnectAccount = (accountId: string) => {
    // In a real app, would call an API to disconnect the account
    console.log(`Disconnecting account ${accountId}`);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500">Manage your account and connected social profiles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            
            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm font-medium text-white bg-primary-700 border border-transparent rounded-md shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                    {user?.name.charAt(0) || 'U'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="mt-4 px-3 py-1.5 text-sm font-medium text-primary-700 bg-white border border-primary-200 rounded-md shadow-sm hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Edit Profile
                </button>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={logout}
                className="group flex w-full items-center space-x-2 text-sm text-gray-600 hover:text-error-700"
              >
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-error-500" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Connected accounts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Connected Accounts</h2>
            
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${account.connected ? getPlatformColor(account.platform) : 'bg-gray-100'}`}>
                      {renderPlatformIcon(account.platform)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                      </p>
                      {account.connected && (
                        <p className="text-sm text-gray-500">{account.handle}</p>
                      )}
                    </div>
                  </div>
                  
                  {account.connected ? (
                    <button
                      onClick={() => handleDisconnectAccount(account.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Disconnect</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectAccount(account.platform)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-white bg-primary-700 border border-transparent rounded-md shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              Connecting your accounts allows Metricool to schedule posts and retrieve analytics data.
              We never post without your permission.
            </p>
          </div>
          
          {/* Subscription info would go here in a real app */}
        </div>
      </div>
    </div>
  );
};

export default Profile;