// BLKOUT Liberation Platform - Application Entry Point
// Layer 1: Community Frontend Presentation Layer
// STRICT SEPARATION: Application bootstrap only - NO business logic

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * QI COMPLIANCE: Application Entry Point
 * BOUNDARY ENFORCEMENT: Presentation layer bootstrap only
 * LIBERATION VALUES: Platform initialization with community values
 * ACCESSIBILITY: React 18 with concurrent features for better UX
 */

// Initialize React 18 with liberation values
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found - Liberation platform cannot initialize');
}

// Set liberation platform metadata
rootElement.setAttribute('data-liberation-platform', 'true');
rootElement.setAttribute('data-creator-sovereignty', '75-percent');
rootElement.setAttribute('data-community-governance', 'democratic');
rootElement.setAttribute('data-trauma-informed', 'true');

// Initialize React root with concurrent features
const root = ReactDOM.createRoot(rootElement);

// Render liberation platform
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);