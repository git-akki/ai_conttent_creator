import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SocialMediaConnect from './components/SocialMediaConnect';
import InstagramStats from './components/InstagramStats';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import { Toaster } from './components/ui/toaster';
import LoginPage from './pages/LoginPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
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
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;