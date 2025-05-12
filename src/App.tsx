import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import InstagramCallback from './pages/InstagramCallback';
import ProtectedRoute from './components/ProtectedRoute';
import SocialMediaConnect from './components/SocialMediaConnect';
import InstagramStats from './components/InstagramStats';
import { Toaster } from './components/ui/toaster';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/instagram/callback" element={<InstagramCallback />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={
              <div className="space-y-6">
                <SocialMediaConnect />
                <InstagramStats />
              </div>
            } />
            <Route path="calendar" element={<Calendar />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;