// BLKOUT Liberation Platform - Liberation Dashboard
// Layer 1: Community Frontend Presentation Layer
// STRICT SEPARATION: Presentation component only - NO business logic

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  MessageCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { LiberationButton } from '@/components/ui/liberation-button';
import { 
  cn, 
  culturalUtils, 
  accessibilityUtils, 
  traumaInformedUtils,
  liberationColors,
  dateUtils
} from '@/lib/liberation-utils';
import { communityAPI } from '@/services/community-api';
import type { 
  LiberationJourneyDisplay, 
  CelebrationMoment,
  Milestone,
  BaseComponentProps 
} from '@/types/liberation';

/**
 * QI COMPLIANCE: Liberation Dashboard Component
 * BOUNDARY ENFORCEMENT: Only displays data from Layer 2 API Gateway
 * LIBERATION VALUES: Black queer joy celebration and healing support
 * ACCESSIBILITY: WCAG 3.0 Bronze compliant with trauma-informed design
 * CULTURAL AUTHENTICITY: Liberation journey with community empowerment focus
 */

export interface LiberationDashboardProps extends BaseComponentProps {
  readonly displayMode?: 'full' | 'progress-only' | 'celebration-focus';
  readonly showMilestones?: boolean;
  readonly enableJoyCelebration?: boolean;
  readonly traumaInformedMode?: boolean;
}

export const LiberationDashboard: React.FC<LiberationDashboardProps> = ({
  displayMode = 'full',
  showMilestones = true,
  enableJoyCelebration = true,
  traumaInformedMode = true,
  className,
  'data-testid': testId,
  ...props
}) => {
  // QI COMPLIANCE: State for presentation data only - NO business logic
  const [liberationData, setLiberationData] = useState<LiberationJourneyDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // QI COMPLIANCE: Data fetching through Layer 2 API Gateway only
  useEffect(() => {
    const fetchLiberationJourney = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // BOUNDARY ENFORCEMENT: Only call Layer 2 API Gateway
        const data = await communityAPI.getLiberationDashboard();
        setLiberationData(data);
        
        // Enable joy celebration for recent achievements
        if (enableJoyCelebration && data.celebrationMoments.length > 0) {
          const recentCelebrations = data.celebrationMoments.filter(moment => {
            const achievedDate = new Date(moment.achievedDate);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return achievedDate > oneDayAgo;
          });
          
          if (recentCelebrations.length > 0) {
            setCelebrationActive(true);
            // Gentle celebration duration for trauma-informed UX
            setTimeout(() => setCelebrationActive(false), 5000);
          }
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load liberation journey data');
      } finally {
        setLoading(false);
      }
    };

    fetchLiberationJourney();
  }, [enableJoyCelebration]);

  // Loading state with accessibility
  if (loading) {
    return (
      <div 
        className={cn(
          'animate-pulse space-y-4 p-6',
          liberationColors.pride.pink,
          'opacity-20 rounded-lg',
          className
        )}
        data-testid={`${testId}-loading`}
        aria-label="Loading liberation journey dashboard"
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
  if (error || !liberationData) {
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
        <h3 className="font-semibold mb-2">Unable to Load Liberation Journey</h3>
        <p id={`${testId}-error-description`} className="text-sm mb-4">
          {error || 'Your liberation journey data is currently unavailable. Your progress is still being tracked.'}
        </p>
        <LiberationButton
          variant="community-healing"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Try Again
        </LiberationButton>
      </div>
    );
  }

  // Liberation journey stage configuration
  const getJourneyStageConfig = (stage: LiberationJourneyDisplay['currentStage']) => {
    switch (stage) {
      case 'discovering':
        return {
          title: 'Discovering Liberation',
          description: 'Beginning your journey of self-discovery and community connection',
          color: liberationColors.healing.sage,
          icon: Sparkles,
          gradient: 'from-liberation-healing-sage to-liberation-pride-blue',
        };
      case 'healing':
        return {
          title: 'Healing & Growth',
          description: 'Focusing on personal healing while building community connections',
          color: liberationColors.healing.lavender,
          icon: Heart,
          gradient: 'from-liberation-healing-lavender to-liberation-community-warm',
        };
      case 'empowered':
        return {
          title: 'Empowered Living',
          description: 'Living authentically while supporting community liberation',
          color: liberationColors.pride.purple,
          icon: Star,
          gradient: 'from-liberation-pride-purple to-liberation-pride-pink',
        };
      case 'organizing':
        return {
          title: 'Community Organizing',
          description: 'Leading liberation efforts and mobilizing community power',
          color: liberationColors.panAfrican.green,
          icon: Users,
          gradient: 'from-liberation-green-africa to-liberation-red-liberation',
        };
      default:
        return {
          title: 'Liberation Journey',
          description: 'Your path to personal and collective liberation',
          color: liberationColors.pride.pink,
          icon: Target,
          gradient: culturalUtils.getPrideGradient(),
        };
    }
  };

  // QI COMPLIANCE: Journey progress display (presentation only)
  const renderJourneyProgress = () => {
    const stageConfig = getJourneyStageConfig(liberationData.currentStage);
    const StageIcon = stageConfig.icon;

    return (
      <div className={cn(
        'p-6 rounded-lg border-2 relative overflow-hidden',
        'border-opacity-30',
        'bg-gradient-to-r',
        stageConfig.gradient,
        'text-white',
        celebrationActive && traumaInformedUtils.getGentleAnimation('celebration')
      )}>
        {/* Background pattern for cultural authenticity */}
        <div className="absolute inset-0 opacity-10">
          <div className={cn(
            'absolute inset-0',
            culturalUtils.getPanAfricanGradient()
          )} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <StageIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-liberation">
                  {stageConfig.title}
                </h3>
                <p className="text-sm opacity-90">
                  {stageConfig.description}
                </p>
              </div>
            </div>
            
            {celebrationActive && (
              <div className={cn(
                'p-2 rounded-full bg-white/30 backdrop-blur-sm',
                traumaInformedUtils.getGentleAnimation('celebration')
              )}>
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Journey Progress</span>
              <span className="text-sm font-medium">
                {liberationData.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className={cn(
                  'h-full bg-white/80 rounded-full transition-all duration-1000 ease-out',
                  traumaInformedMode && 'transition-all duration-2000'
                )}
                style={{ width: `${liberationData.progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={liberationData.progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Liberation journey progress: ${liberationData.progressPercentage}%`}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold font-liberation">
                {liberationData.celebrationMoments.length}
              </div>
              <div className="text-xs opacity-80">Celebrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-liberation">
                {liberationData.nextMilestones.length}
              </div>
              <div className="text-xs opacity-80">Next Steps</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // QI COMPLIANCE: Celebration moments display (presentation only)
  const renderCelebrationMoments = () => {
    if (liberationData.celebrationMoments.length === 0) {
      return (
        <div className="text-center p-6 text-gray-500">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
          <p>Your celebrations will appear here</p>
          <p className="text-sm mt-2">Every step of your journey deserves recognition</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {liberationData.celebrationMoments
          .slice(0, displayMode === 'celebration-focus' ? 10 : 5)
          .map((moment) => {
            const joyIntensity = moment.joyLevel === 'revolutionary' ? 'celebration' :
                               moment.joyLevel === 'celebration' ? 'moderate' : 'gentle';

            return (
              <div
                key={moment.id}
                className={cn(
                  'p-4 rounded-lg border-2 flex items-start space-x-3',
                  culturalUtils.getJoyClasses(
                    joyIntensity === 'celebration' ? 'celebration' :
                    joyIntensity === 'moderate' ? 'moderate' : 'subtle'
                  ),
                  'hover:shadow-sm',
                  traumaInformedMode && traumaInformedUtils.getSafeTransition('medium')
                )}
              >
                <div className={cn(
                  'p-2 rounded-full flex-shrink-0',
                  liberationColors.pride.yellow,
                  'bg-liberation-pride-yellow/20'
                )}>
                  <Award className="h-4 w-4 text-liberation-pride-yellow" aria-hidden="true" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold font-liberation text-sm">
                    {moment.title}
                  </h4>
                  <p className="text-sm opacity-80 mt-1">
                    {moment.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2 text-xs opacity-60">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    <span>{dateUtils.formatDisplayDate(moment.achievedDate)}</span>
                    <span className="mx-2">•</span>
                    <span className={cn(
                      'px-2 py-1 rounded capitalize',
                      moment.joyLevel === 'revolutionary' ? 'bg-liberation-pride-pink/20 text-liberation-pride-pink' :
                      moment.joyLevel === 'celebration' ? 'bg-liberation-pride-purple/20 text-liberation-pride-purple' :
                      'bg-liberation-healing-sage/20 text-liberation-healing-sage'
                    )}>
                      {moment.joyLevel} joy
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  // QI COMPLIANCE: Next milestones display (presentation only)
  const renderNextMilestones = () => {
    if (!showMilestones || liberationData.nextMilestones.length === 0) {
      return (
        <div className="text-center p-6 text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
          <p>You're on track with your liberation journey</p>
          <p className="text-sm mt-2">New milestones will appear as you progress</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {liberationData.nextMilestones.slice(0, 5).map((milestone) => (
          <div
            key={milestone.id}
            className={cn(
              'p-4 rounded-lg border-2 border-gray-200 hover:border-liberation-pride-blue/30',
              'hover:shadow-sm cursor-pointer',
              traumaInformedMode && traumaInformedUtils.getSafeTransition('medium'),
              selectedMilestone?.id === milestone.id && 'border-liberation-pride-blue bg-liberation-pride-blue/5'
            )}
            onClick={() => setSelectedMilestone(milestone)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedMilestone(milestone);
              }
            }}
            aria-expanded={selectedMilestone?.id === milestone.id}
            aria-describedby={`milestone-${milestone.id}-description`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={cn(
                  'p-2 rounded-full flex-shrink-0',
                  liberationColors.pride.blue,
                  'bg-liberation-pride-blue/20'
                )}>
                  <TrendingUp className="h-4 w-4 text-liberation-pride-blue" aria-hidden="true" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold font-liberation text-sm">
                    {milestone.title}
                  </h4>
                  <p className="text-sm opacity-80 mt-1">
                    {milestone.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2 text-xs opacity-60">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    <span>Target: {dateUtils.formatDisplayDate(milestone.estimatedCompletion)}</span>
                  </div>
                </div>
              </div>
              
              <ArrowRight 
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform',
                  selectedMilestone?.id === milestone.id && 'rotate-90'
                )}
                aria-hidden="true"
              />
            </div>
            
            {/* Expanded milestone details */}
            {selectedMilestone?.id === milestone.id && (
              <div 
                id={`milestone-${milestone.id}-description`}
                className={cn(
                  'mt-4 pt-3 border-t border-gray-200',
                  traumaInformedUtils.getGentleAnimation('fade')
                )}
              >
                <h5 className="font-medium text-sm mb-2">Support Resources:</h5>
                <div className="space-y-1">
                  {milestone.supportResources.map((resource, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <MessageCircle className="h-3 w-3 text-liberation-pride-blue flex-shrink-0" aria-hidden="true" />
                      <span>{resource}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'space-y-6 p-6 rounded-lg border-2',
        liberationColors.pride.pink,
        'border-liberation-pride-pink/20 bg-white',
        traumaInformedMode && traumaInformedUtils.getSafeTransition('medium'),
        className
      )}
      data-testid={testId}
      aria-label="Liberation journey dashboard"
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-liberation text-liberation-black-power">
            Liberation Journey
          </h2>
          <p className="text-sm opacity-70 mt-1">
            Your path to personal and collective empowerment
          </p>
        </div>
        
        {celebrationActive && (
          <div className={cn(
            'flex items-center space-x-2 px-3 py-2 rounded-full',
            liberationColors.pride.yellow,
            'bg-liberation-pride-yellow/20',
            traumaInformedUtils.getGentleAnimation('celebration')
          )}>
            <Sparkles className="h-4 w-4 text-liberation-pride-yellow" aria-hidden="true" />
            <span className="text-sm font-medium text-liberation-black-power">
              Celebrating You! 🎉
            </span>
          </div>
        )}
      </div>

      {/* Journey Progress Section */}
      <section aria-labelledby="journey-progress-heading">
        <h3 id="journey-progress-heading" className="sr-only">
          Current liberation journey progress and stage
        </h3>
        {renderJourneyProgress()}
      </section>

      {/* Content based on display mode */}
      {(displayMode === 'full' || displayMode === 'celebration-focus') && (
        <section aria-labelledby="celebrations-heading">
          <h3 id="celebrations-heading" className="text-lg font-semibold font-liberation mb-4">
            🎉 Your Celebrations
          </h3>
          {renderCelebrationMoments()}
        </section>
      )}

      {(displayMode === 'full') && showMilestones && (
        <section aria-labelledby="milestones-heading">
          <h3 id="milestones-heading" className="text-lg font-semibold font-liberation mb-4">
            🎯 Next Steps
          </h3>
          {renderNextMilestones()}
        </section>
      )}

      {/* Community Support */}
      <div className={cn(
        'pt-4 border-t',
        liberationColors.pride.pink,
        'border-liberation-pride-pink/20',
        'flex items-center justify-between'
      )}>
        <div className="text-sm opacity-70">
          Need support on your liberation journey?
        </div>
        <LiberationButton
          variant="black-queer-joy"
          size="sm"
          className="text-xs"
          ariaDescription="Connect with community support and healing resources"
          celebratesJoy={true}
        >
          Community Support
          <Heart className="h-3 w-3 ml-1" aria-hidden="true" />
        </LiberationButton>
      </div>
    </div>
  );
};