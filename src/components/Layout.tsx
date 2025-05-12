import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Edit3,
  Settings,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const routes = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      path: '/calendar',
      name: 'Calendar',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      path: '/analytics',
      name: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      path: '/create',
      name: 'Create Post',
      icon: <Edit3 className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed z-20 top-4 left-4">
        <button
          className="p-2 bg-white rounded-md shadow-sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-10 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-10 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-700 text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-primary-700">Metricool</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={`flex items-center space-x-3 rounded-md px-4 py-3 transition-colors ${
                  location.pathname === route.path
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {route.icon}
                <span>{route.name}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                to="/profile"
                className="flex w-full items-center space-x-3 rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center space-x-3 rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;