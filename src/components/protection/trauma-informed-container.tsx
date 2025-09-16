// BLKOUT Liberation Platform - Trauma-Informed Container
// Layer 1: Community Frontend Presentation Layer
// STRICT SEPARATION: Presentation wrapper only - NO business logic

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Shield, Eye, EyeOff, Heart, X, HelpCircle } from 'lucide-react';
import { LiberationButton } from '@/components/ui/liberation-button';
import { 
  cn, 
  protectionUtils, 
  accessibilityUtils, 
  traumaInformedUtils,
  liberationColors
} from '@/lib/liberation-utils';
import type { BaseComponentProps } from '@/types/liberation';

/**
 * QI COMPLIANCE: Trauma-Informed Container Component
 * BOUNDARY ENFORCEMENT: Presentation wrapper only - NO business logic
 * LIBERATION VALUES: Community protection and trauma-informed UX
 * ACCESSIBILITY: WCAG 3.0 Bronze compliant with comprehensive support
 * CULTURAL AUTHENTICITY: Safe space creation with community care principles
 */

export interface TraumaInformedContainerProps extends BaseComponentProps {
  readonly children: React.ReactNode;
  
  // Content protection settings
  readonly contentWarning?: string;
  readonly triggerTopics?: string[];
  readonly requiresConsent?: boolean;
  readonly defaultVisible?: boolean;
  
  // Trauma-informed features
  readonly gentleAnimations?: boolean;
  readonly easyExit?: boolean;
  readonly supportResources?: boolean;
  readonly safeSpaceIndicator?: boolean;
  
  // Accessibility enhancements
  readonly reducedMotion?: boolean;
  readonly highContrast?: boolean;
  readonly screenReaderOptimized?: boolean;
  
  // Community care integration
  readonly showCommunityGuidelines?: boolean;
  readonly crisisSupport?: boolean;
  readonly healingResources?: boolean;
  
  // Callbacks (presentation only)
  readonly onContentRevealed?: () => void;
  readonly onContentHidden?: () => void;
  readonly onSupportRequested?: () => void;
  readonly onExitRequested?: () => void;
}

export const TraumaInformedContainer: React.FC<TraumaInformedContainerProps> = ({
  children,
  contentWarning,
  triggerTopics = [],
  requiresConsent = true,
  defaultVisible = false,
  gentleAnimations = true,
  easyExit = true,
  supportResources = true,
  safeSpaceIndicator = true,
  reducedMotion = false,
  highContrast = false,
  screenReaderOptimized = true,
  showCommunityGuidelines = true,
  crisisSupport = true,
  healingResources = true,
  onContentRevealed,
  onContentHidden,
  onSupportRequested,
  onExitRequested,
  className,
  'data-testid': testId,
  ...props
}) => {
  // QI COMPLIANCE: State for presentation behavior only - NO business logic
  const [contentVisible, setContentVisible] = useState(defaultVisible);
  const [consentGiven, setConsentGiven] = useState(!requiresConsent);
  const [showingSupport, setShowingSupport] = useState(false);
  const [showingGuidelines, setShowingGuidelines] = useState(false);
  const [exitConfirmation, setExitConfirmation] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Accessibility: Focus management for screen readers
  useEffect(() => {
    if (contentVisible && screenReaderOptimized && contentRef.current) {
      // Gentle focus for trauma-informed UX
      setTimeout(() => {
        contentRef.current?.focus();
      }, gentleAnimations ? 300 : 0);
    }
  }, [contentVisible, screenReaderOptimized, gentleAnimations]);

  // Handle content reveal with trauma-informed approach
  const handleContentReveal = () => {
    if (requiresConsent && !consentGiven) {
      setConsentGiven(true);
    }
    setContentVisible(true);
    onContentRevealed?.();
  };

  // Handle content hiding with gentle transition
  const handleContentHide = () => {
    setContentVisible(false);
    onContentHidden?.();
  };

  // Handle support request
  const handleSupportRequest = () => {
    setShowingSupport(true);
    onSupportRequested?.();
  };

  // Handle exit with confirmation for trauma-informed UX
  const handleExitRequest = () => {
    if (easyExit) {
      setExitConfirmation(true);
    } else {
      onExitRequested?.();
    }
  };

  const handleConfirmedExit = () => {
    setExitConfirmation(false);
    onExitRequested?.();
  };

  // QI COMPLIANCE: Content warning display (presentation only)
  const renderContentWarning = () => {
    if (!contentWarning && triggerTopics.length === 0) return null;

    return (
      <div className={cn(
        'p-4 rounded-lg border-2 border-yellow-300 bg-yellow-50',
        'text-yellow-800 space-y-3',
        gentleAnimations && traumaInformedUtils.getGentleAnimation('fade')
      )}>
        <div className="flex items-start space-x-3">
          <AlertTriangle 
            className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" 
            aria-hidden="true" 
          />
          <div className="flex-1">
            <h3 className="font-semibold font-liberation mb-2">
              Content Notice
            </h3>
            
            {contentWarning && (
              <p className="text-sm mb-3">{contentWarning}</p>
            )}
            
            {triggerTopics.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-2">This content may include:</p>
                <div className="flex flex-wrap gap-2">
                  {triggerTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs opacity-80">
              You have full control over viewing this content. Take care of yourself.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 pt-2">
          <LiberationButton
            variant="community-protection"
            size="sm"
            onClick={handleContentReveal}
            ariaDescription="Consent to view content with awareness of potential triggers"
          >
            I Understand - Show Content
          </LiberationButton>
          
          {supportResources && (
            <LiberationButton
              variant="community-healing"
              size="sm"
              onClick={handleSupportRequest}
              ariaDescription="Access community support and healing resources"
            >
              <Heart className="h-3 w-3 mr-1" aria-hidden="true" />
              Support Resources
            </LiberationButton>
          )}
          
          {easyExit && (
            <LiberationButton
              variant="secondary"
              size="sm"
              onClick={handleExitRequest}
              ariaDescription="Leave this content safely"
            >
              <X className="h-3 w-3 mr-1" aria-hidden="true" />
              Not Today
            </LiberationButton>
          )}
        </div>
      </div>
    );
  };

  // QI COMPLIANCE: Safe space indicators (presentation only)
  const renderSafeSpaceIndicators = () => {
    if (!safeSpaceIndicator) return null;

    return (
      <div className={cn(
        'flex items-center space-x-4 p-3 rounded border',
        liberationColors.healing.sage,
        'border-liberation-healing-sage/30 bg-liberation-healing-sage/10',
        'text-sm'
      )}>
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-liberation-healing-sage" aria-hidden="true" />
          <span className="font-medium">Safe Space</span>
        </div>
        
        <div className="text-xs opacity-70 flex-1">
          Community guidelines and trauma-informed support active
        </div>
        
        {showCommunityGuidelines && (
          <LiberationButton
            variant="ghost"
            size="sm"
            onClick={() => setShowingGuidelines(true)}
            ariaDescription="View community guidelines for safe participation"
          >
            <HelpCircle className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only">Community Guidelines</span>
          </LiberationButton>
        )}
      </div>
    );
  };

  // QI COMPLIANCE: Support resources display (presentation only)
  const renderSupportResources = () => {
    if (!showingSupport) return null;

    return (
      <div className={cn(
        'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
        gentleAnimations && traumaInformedUtils.getGentleAnimation('fade')
      )}>
        <div className={cn(
          'bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto',
          'border-2',
          liberationColors.healing.lavender,
          'border-liberation-healing-lavender'
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-liberation">
              Community Support Resources
            </h3>
            <LiberationButton
              variant="ghost"
              size="sm"
              onClick={() => setShowingSupport(false)}
              ariaDescription="Close support resources"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </LiberationButton>
          </div>
          
          <div className="space-y-4 text-sm">
            {crisisSupport && (
              <div className={cn(
                'p-3 rounded border-l-4',
                'border-red-400 bg-red-50 text-red-800'
              )}>
                <h4 className="font-semibold mb-2">Crisis Support</h4>
                <p className="mb-2">If you're in immediate crisis:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Call 988 (Suicide & Crisis Lifeline)</li>
                  <li>• Text "HOME" to 741741 (Crisis Text Line)</li>
                  <li>• Call 1-866-488-7386 (Trans Lifeline)</li>
                </ul>
              </div>
            )}
            
            {healingResources && (
              <div className={cn(
                'p-3 rounded border-l-4',
                liberationColors.healing.sage,
                'border-liberation-healing-sage bg-liberation-healing-sage/10'
              )}>
                <h4 className="font-semibold mb-2">Healing Resources</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Community mutual aid networks</li>
                  <li>• Trauma-informed therapy resources</li>
                  <li>• Peer support and healing circles</li>
                  <li>• Cultural healing practices</li>
                </ul>
              </div>
            )}
            
            <div className={cn(
              'p-3 rounded border-l-4',
              liberationColors.pride.purple,
              'border-liberation-pride-purple bg-liberation-pride-purple/10'
            )}>
              <h4 className="font-semibold mb-2">Community Care</h4>
              <p className="text-xs">
                Our community is here to support you. Reach out through community 
                channels for peer support, resources, and connection.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // QI COMPLIANCE: Community guidelines display (presentation only)
  const renderCommunityGuidelines = () => {
    if (!showingGuidelines) return null;

    return (
      <div className={cn(
        'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
        gentleAnimations && traumaInformedUtils.getGentleAnimation('fade')
      )}>
        <div className={cn(
          'bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto',
          'border-2',
          liberationColors.pride.purple,
          'border-liberation-pride-purple'
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-liberation">
              Community Guidelines
            </h3>
            <LiberationButton
              variant="ghost"
              size="sm"
              onClick={() => setShowingGuidelines(false)}
              ariaDescription="Close community guidelines"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </LiberationButton>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Safe Space Principles</h4>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Center Black queer joy and liberation</li>
                <li>Practice trauma-informed communication</li>
                <li>Respect consent in all interactions</li>
                <li>Support community healing and growth</li>
                <li>Challenge oppression with care and accountability</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Community Protection</h4>
              <p className="text-xs">
                Our community uses restorative justice approaches to address harm. 
                We prioritize healing and accountability over punishment.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Getting Support</h4>
              <p className="text-xs">
                If you experience harm or need support, our community care team 
                is available to help navigate resources and healing processes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // QI COMPLIANCE: Exit confirmation display (presentation only)
  const renderExitConfirmation = () => {
    if (!exitConfirmation) return null;

    return (
      <div className={cn(
        'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
        gentleAnimations && traumaInformedUtils.getGentleAnimation('fade')
      )}>
        <div className={cn(
          'bg-white rounded-lg p-6 max-w-sm w-full',
          'border-2',
          liberationColors.healing.warm,
          'border-liberation-community-warm'
        )}>
          <div className="text-center space-y-4">
            <div className={cn(
              'mx-auto w-12 h-12 rounded-full flex items-center justify-center',
              liberationColors.healing.warm,
              'bg-liberation-community-warm/20'
            )}>
              <Heart className="h-6 w-6 text-liberation-community-warm" aria-hidden="true" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold font-liberation mb-2">
                Taking Care of Yourself
              </h3>
              <p className="text-sm text-gray-600">
                You're choosing to step away, and that's completely okay. 
                Your wellbeing always comes first.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <LiberationButton
                variant="community-healing"
                size="sm"
                onClick={handleConfirmedExit}
                className="flex-1"
              >
                Yes, Leave Safely
              </LiberationButton>
              <LiberationButton
                variant="secondary"
                size="sm"
                onClick={() => setExitConfirmation(false)}
                className="flex-1"
              >
                Stay Here
              </LiberationButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative',
        reducedMotion && '[&_*]:!transition-none [&_*]:!animate-none',
        highContrast && 'high-contrast',
        className
      )}
      data-testid={testId}
      data-trauma-informed="true"
      data-safe-space={safeSpaceIndicator}
      {...props}
    >
      {/* Safe space indicators */}
      {safeSpaceIndicator && renderSafeSpaceIndicators()}
      
      {/* Content warning and consent flow */}
      {(!consentGiven || !contentVisible) && renderContentWarning()}
      
      {/* Main content */}
      {consentGiven && contentVisible && (
        <div
          ref={contentRef}
          className={cn(
            gentleAnimations && traumaInformedUtils.getGentleAnimation('fade'),
            'focus:outline-none'
          )}
          tabIndex={screenReaderOptimized ? -1 : undefined}
          aria-label="Content with trauma-informed protections"
        >
          {/* Easy exit button */}
          {easyExit && (
            <div className="absolute top-2 right-2 z-10">
              <LiberationButton
                variant="ghost"
                size="sm"
                onClick={handleExitRequest}
                ariaDescription="Exit content safely"
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Exit Safely</span>
              </LiberationButton>
            </div>
          )}
          
          {/* Content visibility controls */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm opacity-70">
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>Content visible with community protection</span>
            </div>
            
            <LiberationButton
              variant="ghost"
              size="sm"
              onClick={handleContentHide}
              ariaDescription="Hide content temporarily"
            >
              <EyeOff className="h-3 w-3 mr-1" aria-hidden="true" />
              Hide
            </LiberationButton>
          </div>
          
          {children}
        </div>
      )}
      
      {/* Support resources modal */}
      {renderSupportResources()}
      
      {/* Community guidelines modal */}
      {renderCommunityGuidelines()}
      
      {/* Exit confirmation modal */}
      {renderExitConfirmation()}
    </div>
  );
};