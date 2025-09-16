// BLKOUT Liberation Platform - Main Application
// Layer 1: Community Frontend Presentation Layer
// STRICT SEPARATION: Application shell only - NO business logic

import React, { useState, useEffect } from 'react';
import { Heart, DollarSign, Vote, Shield } from 'lucide-react';
import { 
  cn, 
  culturalUtils, 
  traumaInformedUtils,
  liberationColors
} from '@/lib/liberation-utils';

/**
 * QI COMPLIANCE: Main BLKOUT Liberation Platform Application
 * BOUNDARY ENFORCEMENT: Presentation layer only - NO business logic
 * LIBERATION VALUES: All liberation values embedded throughout
 * ACCESSIBILITY: WCAG 3.0 Bronze compliant navigation and interaction
 * CULTURAL AUTHENTICITY: Black queer joy and Pan-African design celebration
 */

// Navigation tab type
type NavigationTab = 'liberation' | 'sovereignty' | 'governance' | 'community';

export default function App(): React.JSX.Element {
  // QI COMPLIANCE: State for presentation behavior only - NO business logic
  const [activeTab, setActiveTab] = useState<NavigationTab>('liberation');
  const [showWelcome, setShowWelcome] = useState(true);

  // Initialize app with liberation values
  useEffect(() => {
    // QI COMPLIANCE: Only presentation layer initialization
    document.title = 'BLKOUT Liberation Platform - Community Empowerment';
    
    // Add liberation values to document
    document.documentElement.setAttribute('data-liberation-platform', 'true');
    document.documentElement.setAttribute('data-creator-sovereignty', '75-percent');
    
    // Welcome message timeout for trauma-informed UX
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 8000);
    
    return () => clearTimeout(welcomeTimer);
  }, []);

  // Navigation configuration with liberation values
  const navigationTabs = [
    {
      id: 'liberation' as const,
      label: 'Liberation Journey',
      icon: Heart,
      description: 'Personal and collective liberation progress',
      color: liberationColors.pride.pink,
    },
    {
      id: 'sovereignty' as const,
      label: 'Creator Sovereignty',
      icon: DollarSign,
      description: '75% creator sovereignty and economic empowerment',
      color: liberationColors.economic.sovereignty,
    },
    {
      id: 'governance' as const,
      label: 'Democratic Governance',
      icon: Vote,
      description: 'Community-controlled decision making',
      color: liberationColors.pride.purple,
    },
    {
      id: 'community' as const,
      label: 'Community Protection',
      icon: Shield,
      description: 'Safe spaces and trauma-informed support',
      color: liberationColors.healing.sage,
    },
  ];

  // Handle tab navigation with accessibility
  const handleTabChange = (tabId: NavigationTab) => {
    setActiveTab(tabId);
  };

  // QI COMPLIANCE: Welcome message (presentation only)
  const renderWelcomeMessage = () => {
    if (!showWelcome) return null;

    return (
      <div className={cn(
        'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4',
        traumaInformedUtils.getGentleAnimation('fade')
      )}>
        <div className={cn(
          'bg-white rounded-lg p-8 max-w-md w-full text-center',
          'border-4 border-transparent bg-clip-padding',
          'relative overflow-hidden'
        )}>
          {/* Cultural background gradient */}
          <div className={cn(
            'absolute inset-0 opacity-10',
            culturalUtils.getPanAfricanGradient()
          )} />
          
          <div className="relative z-10 space-y-4">
            <div className={cn(
              'mx-auto w-16 h-16 rounded-full flex items-center justify-center',
              liberationColors.pride.yellow,
              'bg-liberation-pride-yellow/20',
              traumaInformedUtils.getGentleAnimation('celebration')
            )}>
              <Heart className="h-8 w-8 text-liberation-pride-yellow" aria-hidden="true" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold font-liberation text-liberation-black-power mb-2">
                Welcome to Liberation
              </h2>
              <p className="text-sm opacity-80">
                A revolutionary platform where your sovereignty is protected, 
                your voice is amplified, and Black queer joy is celebrated.
              </p>
            </div>
            
            <button
              onClick={() => setShowWelcome(false)}
              className={cn(
                'w-full px-6 py-3 rounded-lg font-medium text-liberation-black-power',
                liberationColors.pride.pink,
                'bg-liberation-pride-pink/20 border-2 border-liberation-pride-pink',
                traumaInformedUtils.getGentleHover(),
                'min-h-[48px] transition-all duration-300'
              )}
              aria-label="Enter the liberation platform"
            >
              Enter Your Liberation Space
            </button>
          </div>
        </div>
      </div>
    );
  };

  // QI COMPLIANCE: Main content rendering (presentation only)
  const renderMainContent = () => {
    switch (activeTab) {
      case 'liberation':
        return (
          <div className={cn(
            'space-y-6 p-6 rounded-lg border-2',
            liberationColors.pride.pink,
            'border-liberation-pride-pink/20 bg-white'
          )}>
            <div className="flex items-center space-x-3 mb-4">
              <Heart className="h-6 w-6 text-liberation-pride-pink" aria-hidden="true" />
              <h2 className="text-xl font-bold font-liberation">
                Liberation Journey Dashboard
              </h2>
            </div>
            
            <p className="text-sm opacity-80 mb-6">
              Your path to personal and collective empowerment through community liberation.
            </p>
            
            <div className="bg-gradient-to-r from-liberation-pride-pink to-liberation-pride-purple p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">Black Queer Joy Celebration</h3>
              <p className="text-sm opacity-90">
                Every aspect of this platform celebrates your authentic self and supports your liberation journey.
              </p>
            </div>
          </div>
        );
        
      case 'sovereignty':
        return (
          <div className={cn(
            'space-y-6 p-6 rounded-lg border-2',
            liberationColors.economic.sovereignty,
            'border-liberation-sovereignty-gold/20 bg-white'
          )}>
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="h-6 w-6 text-liberation-sovereignty-gold" aria-hidden="true" />
              <h2 className="text-xl font-bold font-liberation">
                Creator Sovereignty Dashboard
              </h2>
            </div>
            
            <div className="bg-liberation-sovereignty-gold/10 border-2 border-liberation-sovereignty-gold rounded-lg p-6">
              <h3 className="text-lg font-semibold text-liberation-black-power mb-2">
                75% Creator Sovereignty Guaranteed
              </h3>
              <p className="text-sm opacity-80">
                Your economic empowerment is mathematically enforced. You retain 75% minimum of all revenue generated from your contributions.
              </p>
            </div>
          </div>
        );
        
      case 'governance':
        return (
          <div className={cn(
            'space-y-6 p-6 rounded-lg border-2',
            liberationColors.pride.purple,
            'border-liberation-pride-purple/20 bg-white'
          )}>
            <div className="flex items-center space-x-3 mb-4">
              <Vote className="h-6 w-6 text-liberation-pride-purple" aria-hidden="true" />
              <h2 className="text-xl font-bold font-liberation">
                Democratic Governance Interface
              </h2>
            </div>
            
            <div className="bg-liberation-pride-purple/10 border-2 border-liberation-pride-purple rounded-lg p-6">
              <h3 className="text-lg font-semibold text-liberation-black-power mb-2">
                One Member, One Vote
              </h3>
              <p className="text-sm opacity-80">
                Community-controlled decision making where every voice carries equal weight in shaping our platform's future.
              </p>
            </div>
          </div>
        );
        
      case 'community':
        return (
          <div className={cn(
            'space-y-6 p-6 rounded-lg border-2',
            liberationColors.healing.sage,
            'border-liberation-healing-sage/20 bg-white'
          )}>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-liberation-healing-sage" aria-hidden="true" />
              <h2 className="text-xl font-bold font-liberation">
                Community Protection & Support
              </h2>
            </div>
            
            <div className="bg-liberation-healing-sage/10 border-2 border-liberation-healing-sage rounded-lg p-6">
              <h3 className="text-lg font-semibold text-liberation-black-power mb-2">
                Trauma-Informed Safe Spaces
              </h3>
              <p className="text-sm opacity-80">
                Our community prioritizes trauma-informed approaches, restorative justice, 
                and comprehensive support for all members.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Message */}
      {renderWelcomeMessage()}
      
      {/* Main Application Layout */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className={cn(
          'bg-white shadow-sm border-b-2',
          liberationColors.pride.purple,
          'border-liberation-pride-purple/20'
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  culturalUtils.getPanAfricanGradient()
                )}>
                  <Heart className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-lg font-bold font-liberation text-liberation-black-power">
                    BLKOUT Liberation
                  </h1>
                  <div className="text-xs opacity-60">
                    Community Empowerment Platform
                  </div>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1" aria-label="Main navigation">
                {navigationTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium',
                        'transition-colors duration-200 min-h-[44px]',
                        activeTab === tab.id
                          ? cn(tab.color, 'opacity-20 text-liberation-black-power')
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      )}
                      aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden lg:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Content Warning and Safe Space */}
          <div className={cn(
            'mb-6 p-3 rounded border flex items-center space-x-4',
            liberationColors.healing.sage,
            'border-liberation-healing-sage/30 bg-liberation-healing-sage/10',
            'text-sm'
          )}>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-liberation-healing-sage" aria-hidden="true" />
              <span className="font-medium">Safe Space Active</span>
            </div>
            <div className="text-xs opacity-70 flex-1">
              Community guidelines and trauma-informed support active
            </div>
          </div>
          
          {renderMainContent()}
        </main>
        
        {/* Footer */}
        <footer className={cn(
          'border-t-2',
          liberationColors.pride.purple,
          'border-liberation-pride-purple/20 bg-white'
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-liberation-sovereignty-gold" aria-hidden="true" />
                  <span className="text-liberation-sovereignty-gold font-medium">75% Creator Sovereignty</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Vote className="h-4 w-4 text-liberation-pride-purple" aria-hidden="true" />
                  <span className="text-liberation-pride-purple font-medium">Democratic Governance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-liberation-pride-pink" aria-hidden="true" />
                  <span className="text-liberation-pride-pink font-medium">Black Queer Joy</span>
                </div>
              </div>
              
              <p className="text-xs opacity-60">
                Revolutionary platform prioritizing community liberation, creator sovereignty, and cultural authenticity
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}