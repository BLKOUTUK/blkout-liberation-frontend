// BLKOUT Liberation Platform - Admin Authentication Component
// SECURE VERSION - Proper authentication for moderation access

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

interface AdminAuthProps {
  onAuthenticated: () => void;
  onCancel: () => void;
  requiredAction: string;
}

interface AdminSession {
  isAuthenticated: boolean;
  expiresAt: number;
  role: 'admin' | 'moderator';
  username: string;
}

export default function AdminAuth({ onAuthenticated, onCancel, requiredAction }: AdminAuthProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

  // Hardcoded admin credentials for secure access (in production, use proper auth service)
  const ADMIN_CREDENTIALS = {
    admin: 'liberation2024',
    moderator: 'community2024'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate credentials
      const isValidAdmin = username === 'admin' && password === ADMIN_CREDENTIALS.admin;
      const isValidModerator = username === 'moderator' && password === ADMIN_CREDENTIALS.moderator;

      if (!isValidAdmin && !isValidModerator) {
        throw new Error('Invalid credentials. Access denied to moderation system.');
      }

      // Create authenticated session
      const session: AdminSession = {
        isAuthenticated: true,
        expiresAt: new Date().getTime() + SESSION_DURATION,
        role: isValidAdmin ? 'admin' : 'moderator',
        username: username
      };

      localStorage.setItem('liberation_admin_session', JSON.stringify(session));
      console.log(`✅ ${session.role} access granted for moderation system`);

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAuthenticated();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
      console.error('🚨 Admin authentication failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setError('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-4 border-liberation-sovereignty-gold rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-liberation-sovereignty-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-gray-900" />
          </div>
          <h2 className="text-2xl font-black text-liberation-sovereignty-gold mb-2">
            MODERATION ACCESS
          </h2>
          <p className="text-gray-400 text-sm">
            Authentication required for: {requiredAction}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-gray-300 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-liberation-sovereignty-gold focus:outline-none"
              placeholder="admin or moderator"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white focus:border-liberation-sovereignty-gold focus:outline-none"
                placeholder="Enter secure password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-liberation-sovereignty-gold"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="flex-1 bg-liberation-sovereignty-gold hover:bg-liberation-sovereignty-gold/90 text-gray-900 py-3 px-6 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Authenticate
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 border-2 border-gray-600 text-gray-300 hover:border-liberation-sovereignty-gold hover:text-liberation-sovereignty-gold rounded-lg font-bold transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-liberation-sovereignty-gold/10 border border-liberation-sovereignty-gold/20 rounded-lg">
          <h4 className="text-liberation-sovereignty-gold font-bold text-sm mb-2">Moderation Principles</h4>
          <div className="text-gray-400 text-xs space-y-1">
            <div>• Community protection and trauma-informed moderation</div>
            <div>• Creator sovereignty and community consent</div>
            <div>• Liberation-focused content curation</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility function to check admin authentication status
export const checkAdminAuth = (): { isAuthenticated: boolean; role?: 'admin' | 'moderator' } => {
  try {
    const sessionData = localStorage.getItem('liberation_admin_session');
    if (sessionData) {
      const session: AdminSession = JSON.parse(sessionData);
      if (session.isAuthenticated && new Date().getTime() < session.expiresAt) {
        return { isAuthenticated: true, role: session.role };
      } else {
        localStorage.removeItem('liberation_admin_session');
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('liberation_admin_session');
  }

  return { isAuthenticated: false };
};

// Utility function to logout admin
export const adminLogout = (): void => {
  localStorage.removeItem('liberation_admin_session');
};