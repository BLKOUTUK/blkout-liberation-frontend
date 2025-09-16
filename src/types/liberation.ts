// BLKOUT Liberation Platform - Frontend Types
// Layer 1: Community Frontend Presentation Layer
// STRICT SEPARATION: Presentation types only - NO business logic

/**
 * QI COMPLIANCE: These types define ONLY presentation layer contracts
 * NO business logic, NO data persistence, NO API implementation details
 */

// Liberation Journey Types (Presentation Only)
export interface LiberationJourneyDisplay {
  readonly currentStage: 'discovering' | 'healing' | 'empowered' | 'organizing';
  readonly progressPercentage: number; // 0-100 for UI display
  readonly celebrationMoments: CelebrationMoment[];
  readonly nextMilestones: Milestone[];
}

export interface CelebrationMoment {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly achievedDate: string; // ISO string for display
  readonly joyLevel: 'gentle' | 'moderate' | 'celebration' | 'revolutionary';
}

export interface Milestone {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly targetDate?: string; // ISO string for display
}

// Creator Sovereignty Types (Presentation Only)
export interface CreatorSovereigntyDisplay {
  readonly creatorId: string;
  readonly revenueTransparency: RevenueTransparencyDisplay;
  readonly contentOwnership: ContentOwnershipDisplay;
  readonly narrativeAuthority: NarrativeAuthorityDisplay;
}

export interface RevenueTransparencyDisplay {
  readonly creatorShare: number; // Must display >= 0.75 (75%)
  readonly totalRevenue: string; // Formatted currency string
  readonly creatorEarnings: string; // Formatted currency string
  readonly platformShare: string; // Formatted currency string
  readonly communityBenefit: string; // Formatted currency string
  readonly lastUpdated: string; // ISO string for display
}

export interface ContentOwnershipDisplay {
  readonly hasFullEditorialControl: boolean;
  readonly hasContentRemovalRights: boolean;
  readonly hasAttributionControl: boolean;
  readonly hasDistributionControl: boolean;
  readonly licenseType: string;
}

export interface NarrativeAuthorityDisplay {
  readonly canControlPresentation: boolean;
  readonly canModifyHeadlines: boolean;
  readonly canControlImagery: boolean;
  readonly canControlTags: boolean;
  readonly canControlPromotion: boolean;
}

// Democratic Governance Types (Presentation Only)
export interface DemocraticGovernanceDisplay {
  readonly votingRights: VotingRightsDisplay;
  readonly activeProposals: ProposalDisplay[];
  readonly votingHistory: VoteHistoryDisplay[];
  readonly consensusParticipation: ConsensusDisplay[];
}

export interface VotingRightsDisplay {
  readonly canVote: boolean;
  readonly canPropose: boolean;
  readonly canModerate: boolean;
  readonly voteWeight: number; // Always 1 for one-member-one-vote
  readonly participationLevel: 'observer' | 'voter' | 'proposer' | 'facilitator';
}

export interface ProposalDisplay {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly proposer: string;
  readonly createdDate: string;
  readonly votingDeadline: string;
  readonly currentVotes: VoteTallyDisplay;
  readonly status: 'open' | 'closed' | 'implemented' | 'rejected';
}

export interface VoteTallyDisplay {
  readonly totalVotes: number;
  readonly yesVotes: number;
  readonly noVotes: number;
  readonly abstainVotes: number;
}

export interface VoteHistoryDisplay {
  readonly proposalId: string;
  readonly proposalTitle: string;
  readonly vote: 'yes' | 'no' | 'abstain';
  readonly votedDate: string;
}

export interface ConsensusDisplay {
  readonly topicId: string;
  readonly topicTitle: string;
  readonly consensusLevel: number; // 0-100 percentage
  readonly participationCount: number;
}

// Community Protection Types (Presentation Only)
export interface CommunityProtectionDisplay {
  readonly safetySettings: SafetySettingsDisplay;
  readonly traumaInformedSettings: TraumaInformedDisplay;
  readonly accessibilitySettings: AccessibilityDisplay;
  readonly communityGuidelines: CommunityGuidelinesDisplay;
}

export interface SafetySettingsDisplay {
  readonly contentWarningsEnabled: boolean;
  readonly triggerTopicFiltering: boolean;
  readonly communityModerationActive: boolean;
  readonly crisisSupportAvailable: boolean;
}

export interface TraumaInformedDisplay {
  readonly gentleAnimations: boolean;
  readonly reducedMotion: boolean;
  readonly consentBasedInteractions: boolean;
  readonly safeSpaceIndicators: boolean;
}

export interface AccessibilityDisplay {
  readonly screenReaderOptimized: boolean;
  readonly keyboardNavigationEnabled: boolean;
  readonly highContrastMode: boolean;
  readonly largeTextMode: boolean;
  readonly touchFriendlyInterface: boolean;
}

export interface CommunityGuidelinesDisplay {
  readonly guidelinesSummary: string;
  readonly lastUpdated: string;
  readonly communityApproved: boolean;
  readonly enforcementLevel: 'community' | 'moderated' | 'strict';
}

// Submission Types (Layer 2 Integration Only)
export interface VoteSubmission {
  readonly proposalId: string;
  readonly vote: 'yes' | 'no' | 'abstain';
}

export interface ProposalSubmission {
  readonly title: string;
  readonly description: string;
  readonly category: 'governance' | 'community' | 'platform' | 'values';
}

export interface VoteResult {
  readonly success: boolean;
  readonly message: string;
  readonly voteId?: string;
}

export interface ProposalResult {
  readonly success: boolean;
  readonly message: string;
  readonly proposalId?: string;
}

// API Contract Types (Layer 2 Integration Only)
export interface CommunityAPIContract {
  // STRICT BOUNDARY: These define contract shape only, NO implementation
  readonly getLiberationDashboard: () => Promise<LiberationJourneyDisplay>;
  readonly getCreatorDashboard: () => Promise<CreatorSovereigntyDisplay>;
  readonly getGovernanceDashboard: () => Promise<DemocraticGovernanceDisplay>;
  readonly getCommunityProtection: () => Promise<CommunityProtectionDisplay>;
  readonly submitVote: (vote: VoteSubmission) => Promise<VoteResult>;
  readonly submitProposal: (proposal: ProposalSubmission) => Promise<ProposalResult>;
}

// Component Props Base Types
export interface BaseComponentProps {
  readonly className?: string;
  readonly 'data-testid'?: string;
  readonly 'aria-label'?: string;
  readonly traumaInformed?: boolean;
  readonly accessible?: boolean;
}

// Liberation Values Validation (Presentation Layer Only)
export interface LiberationValuesDisplay {
  readonly creatorSovereigntyVisible: boolean; // Must show >= 75%
  readonly communityProtectionActive: boolean;
  readonly democraticGovernanceEnabled: boolean;
  readonly blackQueerJoyEnabled: boolean;
  readonly antiOppressionUXActive: boolean;
  readonly culturalAuthenticityMaintained: boolean;
}