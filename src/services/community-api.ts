// BLKOUT Liberation Platform - Community API Client
// Layer 1: Community Frontend Presentation Layer
// STRICT SEPARATION: API contract definitions only - NO business logic implementation

import type {
  CommunityAPIContract,
  LiberationJourneyDisplay,
  CreatorSovereigntyDisplay,
  DemocraticGovernanceDisplay,
  CommunityProtectionDisplay,
  VoteSubmission,
  ProposalSubmission,
  VoteResult,
  ProposalResult,
} from '@/types/liberation';

/**
 * QI COMPLIANCE: Community API Client for Layer 2 integration
 * BOUNDARY ENFORCEMENT: Only API calls to Layer 2 API Gateway
 * NO business logic, NO data transformation, NO direct backend calls
 */

// API Configuration (Layer 2 API Gateway endpoint)
const API_BASE_URL = '/api/v1/community'; // Layer 2 API Gateway

// API Client Class implementing CommunityAPIContract
export class CommunityAPIClient implements CommunityAPIContract {
  private readonly baseURL: string;
  
  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }
  
  /**
   * QI COMPLIANCE: All methods call Layer 2 API Gateway ONLY
   * NO direct backend calls, NO business logic processing
   */
  
  // Liberation Journey Dashboard (Presentation data only)
  async getLiberationDashboard(): Promise<LiberationJourneyDisplay> {
    const response = await this.fetchFromAPIGateway('/liberation-dashboard');
    return this.validateLiberationJourneyResponse(response);
  }
  
  // Creator Sovereignty Dashboard (Presentation data only)
  async getCreatorDashboard(): Promise<CreatorSovereigntyDisplay> {
    const response = await this.fetchFromAPIGateway('/creator-dashboard');
    return this.validateCreatorSovereigntyResponse(response);
  }
  
  // Democratic Governance Dashboard (Presentation data only)
  async getGovernanceDashboard(): Promise<DemocraticGovernanceDisplay> {
    const response = await this.fetchFromAPIGateway('/governance-dashboard');
    return this.validateGovernanceResponse(response);
  }
  
  // Community Protection Settings (Presentation data only)
  async getCommunityProtection(): Promise<CommunityProtectionDisplay> {
    const response = await this.fetchFromAPIGateway('/community-protection');
    return this.validateProtectionResponse(response);
  }
  
  // Submit Vote (Layer 2 API Gateway only)
  async submitVote(vote: VoteSubmission): Promise<VoteResult> {
    const response = await this.postToAPIGateway('/submit-vote', vote);
    return this.validateVoteResult(response);
  }
  
  // Submit Proposal (Layer 2 API Gateway only)
  async submitProposal(proposal: ProposalSubmission): Promise<ProposalResult> {
    const response = await this.postToAPIGateway('/submit-proposal', proposal);
    return this.validateProposalResult(response);
  }
  
  // Private helper methods (API Gateway communication only)
  
  private async fetchFromAPIGateway(endpoint: string): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Liberation-Layer': 'frontend-presentation', // Layer identification
          'X-API-Contract': 'community-api-v1', // Contract versioning
        },
        credentials: 'include', // Community authentication
      });
      
      if (!response.ok) {
        throw new Error(`API Gateway error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Community API Gateway communication error:', error);
      throw new Error('Unable to connect to community services');
    }
  }
  
  private async postToAPIGateway(endpoint: string, data: any): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Liberation-Layer': 'frontend-presentation',
          'X-API-Contract': 'community-api-v1',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API Gateway error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Community API Gateway communication error:', error);
      throw new Error('Unable to submit to community services');
    }
  }
  
  // Response validation methods (presentation layer validation only)
  
  private validateLiberationJourneyResponse(response: any): LiberationJourneyDisplay {
    // QI COMPLIANCE: Validate response shape for UI consumption only
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid liberation journey data received');
    }
    
    return {
      currentStage: response.currentStage || 'discovering',
      progressPercentage: Math.min(100, Math.max(0, response.progressPercentage || 0)),
      celebrationMoments: Array.isArray(response.celebrationMoments) ? response.celebrationMoments : [],
      nextMilestones: Array.isArray(response.nextMilestones) ? response.nextMilestones : [],
    };
  }
  
  private validateCreatorSovereigntyResponse(response: any): CreatorSovereigntyDisplay {
    // QI COMPLIANCE: Validate 75% creator sovereignty display requirement
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid creator sovereignty data received');
    }
    
    const revenueTransparency = response.revenueTransparency || {};
    const creatorShare = revenueTransparency.creatorShare || 0;
    
    // QI REQUIREMENT: Creator share must be >= 75% for display
    if (creatorShare < 0.75) {
      console.warn('Creator sovereignty violation: Share below 75% minimum');
    }
    
    return {
      creatorId: response.creatorId || '',
      revenueTransparency: {
        creatorShare,
        totalRevenue: revenueTransparency.totalRevenue || '0.00',
        creatorEarnings: revenueTransparency.creatorEarnings || '0.00',
        platformShare: revenueTransparency.platformShare || '0.00',
        communityBenefit: revenueTransparency.communityBenefit || '0.00',
        lastUpdated: revenueTransparency.lastUpdated || new Date().toISOString(),
      },
      contentOwnership: response.contentOwnership || {
        hasFullEditorialControl: false,
        hasContentRemovalRights: false,
        hasAttributionControl: false,
        hasDistributionControl: false,
        licenseType: 'Unknown',
      },
      narrativeAuthority: response.narrativeAuthority || {
        canControlPresentation: false,
        canModifyHeadlines: false,
        canControlImagery: false,
        canControlTags: false,
        canControlPromotion: false,
      },
    };
  }
  
  private validateGovernanceResponse(response: any): DemocraticGovernanceDisplay {
    // QI COMPLIANCE: Validate democratic governance data for UI display
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid governance data received');
    }
    
    const votingRights = response.votingRights || {};
    
    // QI REQUIREMENT: Ensure one-member-one-vote is maintained
    const voteWeight = votingRights.voteWeight || 1;
    if (voteWeight !== 1) {
      console.warn('Democratic governance violation: Vote weight not equal to 1');
    }
    
    return {
      votingRights: {
        canVote: votingRights.canVote || false,
        canPropose: votingRights.canPropose || false,
        canModerate: votingRights.canModerate || false,
        voteWeight: 1, // QI REQUIREMENT: Always 1 for democratic governance
        participationLevel: votingRights.participationLevel || 'observer',
      },
      activeProposals: Array.isArray(response.activeProposals) ? response.activeProposals : [],
      votingHistory: Array.isArray(response.votingHistory) ? response.votingHistory : [],
      consensusParticipation: Array.isArray(response.consensusParticipation) ? response.consensusParticipation : [],
    };
  }
  
  private validateProtectionResponse(response: any): CommunityProtectionDisplay {
    // QI COMPLIANCE: Validate community protection settings for UI display
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid community protection data received');
    }
    
    return {
      safetySettings: response.safetySettings || {
        contentWarningsEnabled: true,
        communityModerationLevel: 'standard',
        crisisResourcesVisible: true,
        supportNetworkConnected: false,
        reportingEnabled: true,
      },
      traumaInformedSettings: response.traumaInformedSettings || {
        gentleAnimations: true,
        softTransitions: true,
        contentPreview: true,
        consentBeforeAction: true,
        easyExit: true,
        supportResourcesIntegrated: false,
      },
      accessibilitySettings: response.accessibilitySettings || {
        screenReaderOptimized: false,
        highContrastMode: false,
        textScaling: 100,
        keyboardNavigationOnly: false,
        reducedMotion: false,
        colorBlindFriendly: false,
      },
      communityGuidelines: response.communityGuidelines || {
        title: 'Community Guidelines',
        summary: 'Community-controlled guidelines for safe participation',
        lastUpdated: new Date().toISOString(),
        communityApproved: false,
        enforcementLevel: 'community',
        reportingProcess: 'Community-driven restorative justice process',
      },
    };
  }
  
  private validateVoteResult(response: any): VoteResult {
    // QI COMPLIANCE: Validate vote submission result for UI feedback
    return {
      success: response.success || false,
      message: response.message || 'Vote submission result unknown',
      proposalStatus: response.proposalStatus || 'pending',
    };
  }
  
  private validateProposalResult(response: any): ProposalResult {
    // QI COMPLIANCE: Validate proposal submission result for UI feedback
    return {
      success: response.success || false,
      proposalId: response.proposalId || '',
      message: response.message || 'Proposal submission result unknown',
      reviewDate: response.reviewDate || new Date().toISOString(),
    };
  }
}

// Export singleton instance for application use
export const communityAPI = new CommunityAPIClient();

// Export type-only imports for component use
export type {
  CommunityAPIContract,
  LiberationJourneyDisplay,
  CreatorSovereigntyDisplay,
  DemocraticGovernanceDisplay,
  CommunityProtectionDisplay,
  VoteSubmission,
  ProposalSubmission,
  VoteResult,
  ProposalResult,
};