// BLKOUT Liberation Platform - Admin Authentication Component
// IMMEDIATE BYPASS VERSION - For testing purposes

import React, { useState, useEffect } from 'react';

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
  const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

  // IMMEDIATE BYPASS FOR TESTING
  useEffect(() => {
    console.log('🚨 IMMEDIATE BYPASS: Granting admin access automatically');

    const session: AdminSession = {
      isAuthenticated: true,
      expiresAt: new Date().getTime() + SESSION_DURATION,
      role: 'admin'
    };

    localStorage.setItem('liberation_admin_session', JSON.stringify(session));
    console.log('✅ Admin access granted via auto-bypass');

    // Grant access immediately
    onAuthenticated();
  }, [onAuthenticated]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-4 border-liberation-sovereignty-gold rounded-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-liberation-sovereignty-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-black text-liberation-sovereignty-gold mb-2">
            GRANTING ACCESS
          </h2>
          <p className="text-gray-400 text-sm">
            Automatic admin authentication in progress...
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Action: {requiredAction}
          </p>
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