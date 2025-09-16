// BLKOUT Liberation Platform - Frontend Utilities
// Layer 1: Community Frontend Presentation Layer
// STRICT SEPARATION: Presentation utilities only - NO business logic

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * QI COMPLIANCE: Utility functions for presentation layer ONLY
 * NO business logic, NO API calls, NO data transformation beyond UI needs
 */

// Utility function for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Liberation color system utilities
export const liberationColors = {
  // Pan-African liberation colors
  panAfrican: {
    red: 'text-liberation-red-liberation bg-liberation-red-liberation',
    black: 'text-liberation-black-power bg-liberation-black-power',
    green: 'text-liberation-green-africa bg-liberation-green-africa',
  },
  
  // Pride celebration colors
  pride: {
    pink: 'text-liberation-pride-pink bg-liberation-pride-pink',
    purple: 'text-liberation-pride-purple bg-liberation-pride-purple',
    blue: 'text-liberation-pride-blue bg-liberation-pride-blue',
    yellow: 'text-liberation-pride-yellow bg-liberation-pride-yellow',
  },
  
  // Healing colors
  healing: {
    sage: 'text-liberation-healing-sage bg-liberation-healing-sage',
    lavender: 'text-liberation-healing-lavender bg-liberation-healing-lavender',
  },
  
  // Economic justice colors
  economic: {
    sovereignty: 'text-liberation-sovereignty-gold bg-liberation-sovereignty-gold',
    transparency: 'text-liberation-transparency-blue bg-liberation-transparency-blue',
    empowerment: 'text-liberation-empowerment-orange bg-liberation-empowerment-orange',
  },
} as const;

// Accessibility utility functions
export const accessibilityUtils = {
  // WCAG 3.0 Bronze contrast ratios
  getContrastClass: (background: 'light' | 'medium' | 'dark') => {
    switch (background) {
      case 'light':
        return 'text-gray-900'; // High contrast on light backgrounds
      case 'medium':
        return 'text-white'; // High contrast on medium backgrounds  
      case 'dark':
        return 'text-white'; // High contrast on dark backgrounds
      default:
        return 'text-gray-900';
    }
  },
  
  // Touch-friendly sizing for community access
  getTouchFriendlySize: (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return 'min-h-[44px] min-w-[44px] p-2'; // 44px minimum touch target
      case 'medium':
        return 'min-h-[48px] min-w-[48px] p-3'; // 48px comfortable touch target
      case 'large':
        return 'min-h-[56px] min-w-[56px] p-4'; // 56px generous touch target
      default:
        return 'min-h-[48px] min-w-[48px] p-3';
    }
  },
} as const;

// Trauma-informed UX utilities
export const traumaInformedUtils = {
  // Gentle animation classes
  getGentleAnimation: (type: 'fade' | 'slide' | 'celebration') => {
    switch (type) {
      case 'fade':
        return 'animate-gentle-fade';
      case 'slide':
        return 'animate-soft-slide';
      case 'celebration':
        return 'animate-celebration';
      default:
        return '';
    }
  },
  
  // Safe transition classes
  getSafeTransition: (duration: 'fast' | 'medium' | 'slow') => {
    switch (duration) {
      case 'fast':
        return 'transition-all duration-200 ease-in-out';
      case 'medium':
        return 'transition-all duration-300 ease-in-out';
      case 'slow':
        return 'transition-all duration-500 ease-in-out';
      default:
        return 'transition-all duration-300 ease-in-out';
    }
  },
  
  // Gentle hover states
  getGentleHover: () => {
    return 'hover:scale-[1.02] hover:shadow-sm transition-transform duration-200 ease-out';
  },
} as const;

// Cultural authenticity utilities
export const culturalUtils = {
  // Pan-African color combinations
  getPanAfricanGradient: () => {
    return 'bg-gradient-to-r from-liberation-red-liberation via-liberation-black-power to-liberation-green-africa';
  },
  
  // Pride flag color combinations
  getPrideGradient: () => {
    return 'bg-gradient-to-r from-liberation-pride-pink via-liberation-pride-purple to-liberation-pride-blue';
  },
} as const;

// Creator sovereignty display utilities (NO business logic)
export const creatorSovereigntyUtils = {
  // Format percentage display (presentation only)
  formatPercentage: (decimal: number): string => {
    return `${(decimal * 100).toFixed(1)}%`;
  },
  
  // Format currency display (presentation only)
  formatCurrency: (amount: string, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount));
  },
} as const;

// Date and time formatting utilities (presentation only)
export const dateUtils = {
  formatDisplayDate: (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
  
  formatDisplayDateTime: (isoString: string): string => {
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
} as const;