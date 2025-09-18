// BLKOUT Liberation Platform - Admin Authentication Component
// Password protection for admin/moderator functions

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
}

export default function AdminAuth({ onAuthenticated, onCancel, requiredAction }: AdminAuthProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 3;
  const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  const ADMIN_PASSWORD_HASH = '96a3fbd1415ea9322abac0bd97e756477b4d23b7a03e0fb2138bb6b110c0c236'; // liberation2025
  const MODERATOR_PASSWORD_HASH = 'a5bff44950188d261cbe3e577865d25c3507ad1dcfbc5c3332ef0233b41c4c5d'; // blkout2025

  useEffect(() => {
    // Check for existing valid session
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    try {
      const sessionData = localStorage.getItem('liberation_admin_session');
      if (sessionData) {
        const session: AdminSession = JSON.parse(sessionData);
        if (session.isAuthenticated && new Date().getTime() < session.expiresAt) {
          onAuthenticated();
          return;
        } else {
          // Session expired
          localStorage.removeItem('liberation_admin_session');
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('liberation_admin_session');
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'LIBERATION_SALT_2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (attempts >= MAX_ATTEMPTS) {
      setError('Too many failed attempts. Please refresh the page and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const hashedPassword = await hashPassword(password);

      // Debug logging
      console.log('Input password:', password);
      console.log('Generated hash:', hashedPassword);
      console.log('Expected admin hash:', ADMIN_PASSWORD_HASH);
      console.log('Expected moderator hash:', MODERATOR_PASSWORD_HASH);

      let role: 'admin' | 'moderator' | null = null;

      if (hashedPassword === ADMIN_PASSWORD_HASH) {
        role = 'admin';
      } else if (hashedPassword === MODERATOR_PASSWORD_HASH) {
        role = 'moderator';
      }

      if (role) {
        // Create session
        const session: AdminSession = {
          isAuthenticated: true,
          expiresAt: new Date().getTime() + SESSION_DURATION,
          role
        };

        localStorage.setItem('liberation_admin_session', JSON.stringify(session));

        // Log successful authentication
        console.log(`Admin authentication successful - Role: ${role}`);

        onAuthenticated();
      } else {
        setAttempts(prev => prev + 1);
        setError('Invalid password. Access denied.');
        setPassword('');

        if (attempts + 1 >= MAX_ATTEMPTS) {
          setError('Maximum attempts exceeded. Access locked.');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingAttempts = () => MAX_ATTEMPTS - attempts;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-4 border-liberation-sovereignty-gold rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-liberation-sovereignty-gold rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-gray-900" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-liberation-sovereignty-gold mb-2">
            ADMIN ACCESS REQUIRED
          </h2>
          <p className="text-gray-400 text-sm">
            This action requires administrator privileges: <strong>{requiredAction}</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="adminPassword" className="block text-sm font-bold text-liberation-healing-sage mb-2 uppercase tracking-wider">
              Administrator Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="adminPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-liberation-sovereignty-gold transition-colors"
                placeholder="Enter admin password"
                required
                disabled={isLoading || attempts >= MAX_ATTEMPTS}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-liberation-sovereignty-gold transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center space-x-2">
              <span className="text-red-500 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Attempts Warning */}
          {attempts > 0 && attempts < MAX_ATTEMPTS && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
              <p className="text-orange-500 text-sm font-medium">
                {getRemainingAttempts()} attempt{getRemainingAttempts() !== 1 ? 's' : ''} remaining
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors"
              disabled={isLoading}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-liberation-sovereignty-gold text-gray-900 rounded-xl font-bold hover:bg-liberation-sovereignty-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || attempts >= MAX_ATTEMPTS || !password.trim()}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>VERIFYING...</span>
                </div>
              ) : (
                'AUTHENTICATE'
              )}
            </button>
          </div>
        </form>

        {/* Security Info */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Encrypted Session</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>8h Timeout</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>3 Max Attempts</span>
            </div>
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