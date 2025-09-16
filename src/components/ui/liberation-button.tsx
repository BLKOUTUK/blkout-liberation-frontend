// BLKOUT Liberation Platform - Liberation Button Component
// Layer 1: Community Frontend Presentation Layer
// STRICT SEPARATION: UI component only - NO business logic

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, accessibilityUtils, traumaInformedUtils, liberationColors } from '@/lib/liberation-utils';
import type { BaseComponentProps } from '@/types/liberation';

/**
 * QI COMPLIANCE: Liberation Button Component
 * WCAG 3.0 Bronze compliant with trauma-informed UX patterns
 * Cultural authenticity through Black queer joy celebration
 * Community accessibility with touch-friendly design
 */

// Button variants with liberation values embedded
const liberationButtonVariants = cva(
  // Base styles - accessibility and trauma-informed by default
  cn(
    // WCAG 3.0 Bronze compliance
    'inline-flex items-center justify-center rounded-md text-sm font-medium',
    'ring-offset-white transition-colors focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    // Touch-friendly sizing
    accessibilityUtils.getTouchFriendlySize('medium'),
    // Trauma-informed gentle transitions
    traumaInformedUtils.getSafeTransition('medium'),
    // Cultural authenticity base
    'font-liberation'
  ),
  {
    variants: {
      // Liberation-focused variant system
      variant: {
        // Creator sovereignty - economic empowerment
        'creator-sovereignty': cn(
          liberationColors.economic.sovereignty,
          'hover:bg-liberation-sovereignty-gold/90 text-liberation-black-power',
          'border-2 border-liberation-sovereignty-gold',
          traumaInformedUtils.getGentleHover()
        ),
        
        // Democratic governance - community control
        'democratic-governance': cn(
          liberationColors.pride.purple,
          'hover:bg-liberation-pride-purple/90 text-white',
          'border-2 border-liberation-pride-purple',
          traumaInformedUtils.getGentleHover()
        ),
        
        // Community protection - safety and healing
        'community-protection': cn(
          liberationColors.healing.sage,
          'hover:bg-liberation-healing-sage/90 text-liberation-black-power',
          'border-2 border-liberation-healing-sage',
          traumaInformedUtils.getGentleHover()
        ),
        
        // Black queer joy - celebration and authenticity
        'black-queer-joy': cn(
          liberationColors.pride.pink,
          'hover:bg-liberation-pride-pink/90 text-liberation-black-power',
          'border-2 border-liberation-pride-pink',
          traumaInformedUtils.getGentleAnimation('celebration')
        ),
        
        // Anti-oppression - resistance and solidarity
        'anti-oppression': cn(
          liberationColors.panAfrican.red,
          'hover:bg-liberation-red-liberation/90 text-white',
          'border-2 border-liberation-red-liberation',
          traumaInformedUtils.getGentleHover()
        ),
        
        // Community healing - trauma-informed spaces
        'community-healing': cn(
          liberationColors.healing.lavender,
          'hover:bg-liberation-healing-lavender/90 text-liberation-black-power',
          'border-2 border-liberation-healing-lavender',
          traumaInformedUtils.getGentleHover()
        ),
        
        // Organizing action - mobilization and advocacy
        'organizing-action': cn(
          liberationColors.panAfrican.green,
          'hover:bg-liberation-green-africa/90 text-white',
          'border-2 border-liberation-green-africa',
          traumaInformedUtils.getGentleHover()
        ),
        
        // Secondary actions - supportive interactions
        secondary: cn(
          'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
          'border-2 border-slate-200',
          traumaInformedUtils.getGentleHover()
        ),
        
        // Ghost actions - minimal visual impact
        ghost: cn(
          'hover:bg-slate-100 hover:text-slate-900',
          'border-2 border-transparent',
          traumaInformedUtils.getGentleHover()
        ),
        
        // Destructive actions - with community consent
        destructive: cn(
          'bg-red-500 text-slate-50 hover:bg-red-500/90',
          'border-2 border-red-500',
          // Extra confirmation for destructive actions
          'focus-visible:ring-red-500',
          traumaInformedUtils.getGentleHover()
        ),
      },
      
      // Accessibility-focused sizing
      size: {
        // Touch-friendly sizes for community access
        sm: accessibilityUtils.getTouchFriendlySize('small'),
        md: accessibilityUtils.getTouchFriendlySize('medium'),
        lg: accessibilityUtils.getTouchFriendlySize('large'),
        
        // Icon-only buttons with accessible sizing
        icon: 'h-10 w-10 min-h-[44px] min-w-[44px]', // WCAG 3.0 Bronze minimum
      },
      
      // Trauma-informed interaction patterns
      traumaInformed: {
        true: cn(
          // Extra gentle interactions for trauma survivors
          'hover:scale-[1.01] active:scale-[0.99]',
          traumaInformedUtils.getSafeTransition('slow'),
          // Softer focus indicators
          'focus-visible:ring-offset-4 focus-visible:ring-opacity-50'
        ),
        false: '',
      },
      
      // Community celebration intensity
      joyLevel: {
        gentle: '',
        moderate: traumaInformedUtils.getGentleAnimation('fade'),
        celebration: cn(
          traumaInformedUtils.getGentleAnimation('celebration'),
          'hover:animate-pulse'
        ),
      },
    },
    
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      traumaInformed: true,
      joyLevel: 'gentle',
    },
  }
);

// Liberation Button Props Interface
export interface LiberationButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liberationButtonVariants>,
    BaseComponentProps {
  
  // Accessibility enhancements
  readonly ariaDescription?: string;
  readonly screenReaderText?: string;
  
  // Community context
  readonly liberationContext?: 'creator' | 'governance' | 'protection' | 'healing' | 'organizing';
  readonly communityRole?: 'member' | 'facilitator' | 'moderator' | 'organizer';
  
  // Trauma-informed options
  readonly requiresConfirmation?: boolean;
  readonly confirmationText?: string;
  readonly gentleInteraction?: boolean;
  
  // Cultural authenticity
  readonly celebratesJoy?: boolean;
  readonly panAfricanColors?: boolean;
  readonly prideColors?: boolean;
  
  // Loading and interaction states
  readonly loading?: boolean;
  readonly loadingText?: string;
}

// Liberation Button Component
const LiberationButton = React.forwardRef<HTMLButtonElement, LiberationButtonProps>(
  ({
    className,
    variant,
    size,
    traumaInformed = true,
    joyLevel = 'gentle',
    liberationContext,
    communityRole,
    requiresConfirmation = false,
    confirmationText,
    gentleInteraction = true,
    celebratesJoy = false,
    panAfricanColors = false,
    prideColors = false,
    loading = false,
    loadingText = 'Processing...',
    ariaDescription,
    screenReaderText,
    children,
    onClick,
    ...props
  }, ref) => {
    
    // Handle confirmed interactions for community protection
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (requiresConfirmation && confirmationText) {
        const confirmed = window.confirm(confirmationText);
        if (!confirmed) {
          event.preventDefault();
          return;
        }
      }
      
      if (onClick) {
        onClick(event);
      }
    };
    
    // Cultural color enhancement based on props
    const getCulturalEnhancement = () => {
      if (panAfricanColors && prideColors) {
        return 'bg-gradient-to-r from-liberation-red-liberation via-liberation-pride-purple to-liberation-green-africa';
      } else if (panAfricanColors) {
        return 'border-l-4 border-liberation-red-liberation border-r-4 border-r-liberation-green-africa';
      } else if (prideColors) {
        return 'border-l-4 border-liberation-pride-pink border-r-4 border-r-liberation-pride-blue';
      }
      return '';
    };
    
    // Joy celebration enhancement
    const getJoyCelebration = () => {
      if (celebratesJoy) {
        return cn(
          'relative overflow-hidden',
          'before:absolute before:inset-0 before:bg-gradient-to-r',
          'before:from-liberation-pride-pink/10 before:to-liberation-pride-yellow/10',
          'before:opacity-0 hover:before:opacity-100 before:transition-opacity'
        );
      }
      return '';
    };
    
    return (
      <button
        className={cn(
          liberationButtonVariants({ 
            variant, 
            size, 
            traumaInformed, 
            joyLevel 
          }),
          getCulturalEnhancement(),
          getJoyCelebration(),
          className
        )}
        ref={ref}
        onClick={handleClick}
        disabled={loading || props.disabled}
        aria-description={ariaDescription}
        data-liberation-context={liberationContext}
        data-community-role={communityRole}
        data-trauma-informed={traumaInformed}
        data-celebrates-joy={celebratesJoy}
        {...props}
      >
        {/* Loading state with accessibility */}
        {loading && (
          <span 
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        
        {/* Screen reader enhancement */}
        {screenReaderText && (
          <span className="sr-only">{screenReaderText}</span>
        )}
        
        {/* Button content */}
        <span className={cn(loading && 'opacity-70')}>
          {loading ? loadingText : children}
        </span>
      </button>
    );
  }
);

LiberationButton.displayName = 'LiberationButton';

export { LiberationButton, liberationButtonVariants };