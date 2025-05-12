export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SocialAccount {
  id: string;
  userId: string;
  platform: string;
  handle: string;
  connected: boolean;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  platforms: string[];
  scheduled: Date | string;
  status: 'scheduled' | 'published' | 'draft' | 'failed';
  image: string | null;
}

export interface DailyMetric {
  date: string;
  followers: number;
  engagement: number;
}

export interface PlatformAnalytics {
  followers: number;
  engagement: number;
  retweets?: number;
  likes?: number;
  comments?: number;
  reactions?: number;
  shares?: number;
  daily: DailyMetric[];
}

export interface Analytics {
  twitter: PlatformAnalytics;
  instagram: PlatformAnalytics;
  linkedin: PlatformAnalytics;
  facebook: PlatformAnalytics;
  [key: string]: PlatformAnalytics;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}