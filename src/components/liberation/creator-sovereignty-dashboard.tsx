// BLKOUT Liberation Platform - Creator Sovereignty Dashboard
// Layer 1: Community Frontend Presentation Layer
// STRICT SEPARATION: Presentation component only - NO business logic

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Shield, Award, Eye, ChevronRight } from 'lucide-react';
import { LiberationButton } from '@/components/ui/liberation-button';
import { 
  cn, 
  creatorSovereigntyUtils, 
  accessibilityUtils, 
  traumaInformedUtils,
  liberationColors,
  dateUtils
} from '@/lib/liberation-utils';
import { communityAPI } from '@/services/community-api';
import type { 
  CreatorSovereigntyDisplay, 
  BaseComponentProps 
} from '@/types/liberation';

/**
 * QI COMPLIANCE: Creator Sovereignty Dashboard Component
 * BOUNDARY ENFORCEMENT: Only displays data from Layer 2 API Gateway
 * LIBERATION VALUES: 75% creator sovereignty prominently displayed
 * ACCESSIBILITY: WCAG 3.0 Bronze compliant with screen reader support
 * CULTURAL AUTHENTICITY: Economic justice celebration embedded
 */

export interface CreatorSovereigntyDashboardProps extends BaseComponentProps {
  readonly creatorId?: string;
  readonly displayMode?: 'full' | 'summary' | 'transparency-only';
  readonly showCelebration?: boolean;
  readonly traumaInformedMode?: boolean;
}

export const CreatorSovereigntyDashboard: React.FC<CreatorSovereigntyDashboardProps> = ({
  creatorId,
  displayMode = 'full',
  showCelebration = true,
  traumaInformedMode = true,
  className,
  'data-testid': testId,
  ...props
}) => {
  // QI COMPLIANCE: State for presentation data only - NO business logic
  const [sovereigntyData, setSovereigntyData] = useState<CreatorSovereigntyDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [celebrationMode, setCelebrationMode] = useState(false);

  // QI COMPLIANCE: Data fetching through Layer 2 API Gateway only
  useEffect(() => {
    const fetchCreatorSovereignty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // BOUNDARY ENFORCEMENT: Only call Layer 2 API Gateway
        const data = await communityAPI.getCreatorDashboard();
        setSovereigntyData(data);
        
        // QI REQUIREMENT: Validate 75% creator sovereignty
        if (data.revenueTransparency.creatorShare >= 0.75 && showCelebration) {
          setCelebrationMode(true);
          // Gentle celebration animation for trauma-informed UX
          setTimeout(() => setCelebrationMode(false), 3000);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load creator sovereignty data');
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorSovereignty();
  }, [creatorId, showCelebration]);

  // Loading state with accessibility
  if (loading) {
    return (
      <div 
        className={cn(
          'animate-pulse space-y-4 p-6',
          liberationColors.economic.transparency,
          'opacity-20 rounded-lg',
          className
        )}
        data-testid={`${testId}-loading`}
        aria-label="Loading creator sovereignty dashboard"
      >
        <div className="h-8 bg-gray-300 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Error state with community support
  if (error || !sovereigntyData) {
    return (
      <div 
        className={cn(
          'p-6 rounded-lg border-2 border-red-200 bg-red-50',
          'text-red-800',
          className
        )}
        data-testid={`${testId}-error`}
        role="alert"
        aria-describedby={`${testId}-error-description`}
      >
        <h3 className="font-semibold mb-2">Unable to Load Creator Sovereignty Data</h3>
        <p id={`${testId}-error-description`} className="text-sm mb-4">
          {error || 'Creator sovereignty information is currently unavailable. Your rights remain protected.'}
        </p>
        <LiberationButton
          variant="community-protection"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Try Again
        </LiberationButton>
      </div>
    );
  }

  // QI COMPLIANCE: Revenue transparency display (presentation only)
  const renderRevenueTransparency = () => {
    const { revenueTransparency } = sovereigntyData;
    const creatorSharePercentage = creatorSovereigntyUtils.formatPercentage(revenueTransparency.creatorShare);
    const isCompliant = revenueTransparency.creatorShare >= 0.75;

    return (
      <div className="space-y-4">
        {/* 75% Creator Sovereignty Headline */}
        <div className={cn(
          'p-4 rounded-lg border-2',
          isCompliant 
            ? cn(
                liberationColors.economic.sovereignty,
                'border-liberation-sovereignty-gold bg-liberation-sovereignty-gold/10'
              )
            : 'border-red-500 bg-red-50',
          celebrationMode && traumaInformedUtils.getGentleAnimation('celebration')
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award 
                className={cn(
                  'h-6 w-6',
                  isCompliant ? 'text-liberation-sovereignty-gold' : 'text-red-500'
                )}
                aria-hidden="true"
              />
              <div>
                <h3 className="text-lg font-semibold font-liberation">
                  Creator Sovereignty: {creatorSharePercentage}
                </h3>
                <p className="text-sm opacity-80">
                  {isCompliant 
                    ? '✅ Above 75% minimum - Your sovereignty is protected' 
                    : '⚠️ Below 75% minimum - Contact community support'
                  }
                </p>
              </div>
            </div>
            <TrendingUp 
              className={cn(
                'h-5 w-5',
                isCompliant ? 'text-green-600' : 'text-red-500'
              )}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={cn(
            'p-4 rounded-lg border',
            liberationColors.economic.transparency,
            'border-liberation-transparency-blue/30 bg-liberation-transparency-blue/10'
          )}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-liberation-transparency-blue" aria-hidden="true" />
              <h4 className="font-medium">Your Earnings</h4>
            </div>
            <p className="text-2xl font-bold font-liberation text-liberation-black-power">
              {creatorSovereigntyUtils.formatCurrency(revenueTransparency.creatorEarnings)}
            </p>
            <p className="text-sm opacity-70">
              From {creatorSovereigntyUtils.formatCurrency(revenueTransparency.totalRevenue)} total
            </p>
          </div>

          <div className={cn(
            'p-4 rounded-lg border',
            liberationColors.economic.empowerment,
            'border-liberation-empowerment-orange/30 bg-liberation-empowerment-orange/10'
          )}>
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-liberation-empowerment-orange" aria-hidden="true" />
              <h4 className="font-medium">Community Benefit</h4>
            </div>
            <p className="text-2xl font-bold font-liberation text-liberation-black-power">
              {creatorSovereigntyUtils.formatCurrency(revenueTransparency.communityBenefit)}
            </p>
            <p className="text-sm opacity-70">
              Supporting community liberation
            </p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs opacity-60 flex items-center space-x-2">
          <Eye className="h-3 w-3" aria-hidden="true" />
          <span>
            Updated: {dateUtils.formatDisplayDateTime(revenueTransparency.lastUpdated)}
          </span>
        </div>
      </div>
    );
  };

  // QI COMPLIANCE: Content ownership display (presentation only)
  const renderContentOwnership = () => {
    const { contentOwnership } = sovereigntyData;
    
    const ownershipItems = [
      { label: 'Editorial Control', value: contentOwnership.hasFullEditorialControl, description: 'Full control over content editing and presentation' },
      { label: 'Content Removal Rights', value: contentOwnership.hasContentRemovalRights, description: 'Right to remove content at any time' },
      { label: 'Attribution Control', value: contentOwnership.hasAttributionControl, description: 'Control over how you are credited' },
      { label: 'Distribution Control', value: contentOwnership.hasDistributionControl, description: 'Control over where and how content is shared' },
    ];

    return (
      <div className="space-y-3">
        <h4 className="font-medium font-liberation">Content Ownership Rights</h4>
        <div className="space-y-2">
          {ownershipItems.map((item, index) => (
            <div 
              key={index}
              className={cn(
                'flex items-center justify-between p-3 rounded border',
                item.value 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              )}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-lg" aria-label={item.value ? 'Granted' : 'Not granted'}>
                    {item.value ? '✅' : '⚠️'}
                  </span>
                </div>
                <p className="text-xs opacity-70 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs opacity-60">
          License Type: {contentOwnership.licenseType}
        </div>
      </div>
    );
  };

  // QI COMPLIANCE: Narrative authority display (presentation only)
  const renderNarrativeAuthority = () => {
    const { narrativeAuthority } = sovereigntyData;
    
    const authorityItems = [
      { label: 'Presentation Control', value: narrativeAuthority.canControlPresentation },
      { label: 'Headline Control', value: narrativeAuthority.canModifyHeadlines },
      { label: 'Imagery Control', value: narrativeAuthority.canControlImagery },
      { label: 'Tag Control', value: narrativeAuthority.canControlTags },
      { label: 'Promotion Control', value: narrativeAuthority.canControlPromotion },
    ];

    const grantedRights = authorityItems.filter(item => item.value).length;
    const totalRights = authorityItems.length;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium font-liberation">Narrative Authority</h4>
          <span className={cn(
            'text-sm px-2 py-1 rounded',
            grantedRights === totalRights 
              ? 'bg-green-100 text-green-800'
              : grantedRights > totalRights / 2 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          )}>
            {grantedRights}/{totalRights} Rights
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {authorityItems.map((item, index) => (
            <div 
              key={index}
              className={cn(
                'flex items-center space-x-2 p-2 rounded text-sm',
                item.value 
                  ? 'text-green-700 bg-green-50'
                  : 'text-gray-500 bg-gray-50'
              )}
            >
              <span aria-label={item.value ? 'Granted' : 'Not granted'}>
                {item.value ? '✅' : '➖'}
              </span>
              <span className={cn(item.value ? 'font-medium' : '')}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'space-y-6 p-6 rounded-lg border-2',
        liberationColors.economic.transparency,
        'border-liberation-transparency-blue/20 bg-white',
        traumaInformedMode && traumaInformedUtils.getSafeTransition('medium'),
        className
      )}
      data-testid={testId}
      aria-label="Creator sovereignty dashboard"
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-liberation text-liberation-black-power">
            Creator Sovereignty Dashboard
          </h2>
          <p className="text-sm opacity-70 mt-1">
            Your economic empowerment and creative control status
          </p>
        </div>
        
        {celebrationMode && (
          <div className={cn(
            'p-2 rounded-full',
            liberationColors.pride.yellow,
            'bg-liberation-pride-yellow/20',
            traumaInformedUtils.getGentleAnimation('celebration')
          )}>
            <Award className="h-6 w-6 text-liberation-pride-yellow" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Revenue Transparency Section */}
      <section aria-labelledby="revenue-transparency-heading">
        <h3 id="revenue-transparency-heading" className="sr-only">
          Revenue transparency and creator earnings
        </h3>
        {renderRevenueTransparency()}
      </section>

      {/* Full display mode includes ownership and authority */}
      {displayMode === 'full' && (
        <>
          {/* Content Ownership Section */}
          <section aria-labelledby="content-ownership-heading">
            <h3 id="content-ownership-heading" className="sr-only">
              Content ownership rights and controls
            </h3>
            {renderContentOwnership()}
          </section>

          {/* Narrative Authority Section */}
          <section aria-labelledby="narrative-authority-heading">
            <h3 id="narrative-authority-heading" className="sr-only">
              Narrative authority and presentation controls
            </h3>
            {renderNarrativeAuthority()}
          </section>
        </>
      )}

      {/* Community Support Link */}
      <div className={cn(
        'pt-4 border-t border-liberation-transparency-blue/20',
        'flex items-center justify-between'
      )}>
        <div className="text-sm opacity-70">
          Questions about your creator sovereignty?
        </div>
        <LiberationButton
          variant="creator-sovereignty"
          size="sm"
          className="text-xs"
          ariaDescription="Contact community support about creator sovereignty"
        >
          Community Support
          <ChevronRight className="h-3 w-3 ml-1" aria-hidden="true" />
        </LiberationButton>
      </div>
    </div>
  );
};