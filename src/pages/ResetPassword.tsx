import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get parameters from both URL search params and hash fragment
  const getUrlParams = () => {
    const params = new URLSearchParams(searchParams);
    
    // Parse hash fragment
    const hash = window.location.hash.substring(1);
    console.log('Raw hash:', hash); // Debug log

    if (hash) {
      // Split the hash string by & and = to get key-value pairs
      const hashParts = hash.split('&');
      hashParts.forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
          params.set(key, value);
        }
      });
    }
    
    return params;
  };

  const params = getUrlParams();
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const type = params.get('type');

  // Debug logging
  console.log('URL Parameters:', {
    accessToken: accessToken ? 'present' : 'missing',
    refreshToken: refreshToken ? 'present' : 'missing',
    type,
    hash: window.location.hash,
    allParams: Object.fromEntries(params.entries())
  });

  // Check if this is a password reset flow
  const isResetToken = type === 'recovery' && accessToken;

  useEffect(() => {
    // If we have a token, try to get the user's email
    if (isResetToken) {
      const getUser = async () => {
        try {
          console.log('Attempting to set session with tokens');
          // Set the session with the tokens
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken!,
            refresh_token: refreshToken!,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }

          console.log('Session set successfully:', session?.user?.email);

          if (session?.user?.email) {
            setEmail(session.user.email);
          }
        } catch (err) {
          console.error('Error getting user:', err);
          setError('Invalid or expired reset link');
        }
      };
      getUser();
    }
  }, [isResetToken, accessToken, refreshToken]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('Check your email for the password reset link');
    } catch (err) {
      console.error('Reset request error:', err);
      setError('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // First update the user's password
      const { data: { user }, error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      if (user) {
        // Then update the profile table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          // Don't throw here, as the password was updated successfully
        }
      }

      setMessage('Password updated successfully');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug logging for component state
  console.log('Component state:', {
    isResetToken,
    hasEmail: !!email,
    hasError: !!error,
    hasMessage: !!message
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-700 text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isResetToken ? 'Reset your password' : 'Forgot your password?'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isResetToken
            ? 'Enter your new password below'
            : 'Enter your email address and we&apos;ll send you a link to reset your password'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-error-50 p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-error-500" />
                <span className="ml-2 text-error-800">{error}</span>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-md bg-success-50 p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success-500" />
                <span className="ml-2 text-success-800">{message}</span>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={isResetToken ? handleResetPassword : handleRequestReset}>
            {!isResetToken && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {isResetToken && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm new password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isResetToken ? 'Resetting password...' : 'Sending reset link...'}
                  </span>
                ) : (
                  isResetToken ? 'Reset password' : 'Send reset link'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 