// BLKOUT Liberation Platform - Democratic Governance Interface
// Layer 1: Community Frontend Presentation Layer
// STRICT SEPARATION: Presentation component only - NO business logic

import React, { useState, useEffect } from 'react';
import { Vote, Users, MessageSquare, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { LiberationButton } from '@/components/ui/liberation-button';
import { 
  cn, 
  governanceUtils, 
  accessibilityUtils, 
  traumaInformedUtils,
  liberationColors,
  dateUtils
} from '@/lib/liberation-utils';
import { communityAPI } from '@/services/community-api';
import type { 
  DemocraticGovernanceDisplay, 
  ProposalDisplay,
  VoteSubmission,
  BaseComponentProps 
} from '@/types/liberation';

/**
 * QI COMPLIANCE: Democratic Governance Interface Component
 * BOUNDARY ENFORCEMENT: Only displays data from Layer 2 API Gateway
 * LIBERATION VALUES: One-member-one-vote technically implemented
 * ACCESSIBILITY: WCAG 3.0 Bronze compliant with comprehensive navigation
 * CULTURAL AUTHENTICITY: Community control and democratic participation
 */

export interface DemocraticGovernanceInterfaceProps extends BaseComponentProps {
  readonly displayMode?: 'full' | 'voting-only' | 'proposals-only';
  readonly showHistory?: boolean;
  readonly traumaInformedMode?: boolean;
  readonly enableConsensusView?: boolean;
}

export const DemocraticGovernanceInterface: React.FC<DemocraticGovernanceInterfaceProps> = ({
  displayMode = 'full',
  showHistory = true,
  traumaInformedMode = true,
  enableConsensusView = true,
  className,
  'data-testid': testId,
  ...props
}) => {
  // QI COMPLIANCE: State for presentation data only - NO business logic
  const [governanceData, setGovernanceData] = useState<DemocraticGovernanceDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<ProposalDisplay | null>(null);
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'consensus'>('active');

  // QI COMPLIANCE: Data fetching through Layer 2 API Gateway only
  useEffect(() => {
    const fetchGovernanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // BOUNDARY ENFORCEMENT: Only call Layer 2 API Gateway
        const data = await communityAPI.getGovernanceDashboard();
        setGovernanceData(data);
        
        // QI REQUIREMENT: Validate one-member-one-vote
        if (data.votingRights.voteWeight !== 1) {
          console.warn('Democratic governance violation: Vote weight not equal to 1');
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load governance data');
      } finally {
        setLoading(false);
      }
    };

    fetchGovernanceData();
  }, []);

  // QI COMPLIANCE: Vote submission through Layer 2 API Gateway only
  const handleVoteSubmission = async (proposalId: string, vote: VoteSubmission['vote'], rationale?: string) => {
    if (!governanceData?.votingRights.canVote) {
      alert('You do not have voting rights in this community.');
      return;
    }

    try {
      setVotingInProgress(proposalId);
      
      // BOUNDARY ENFORCEMENT: Only submit through Layer 2 API Gateway
      const result = await communityAPI.submitVote({
        proposalId,
        vote,
        rationale,
      });

      if (result.success) {
        // Refresh governance data to show updated status
        const updatedData = await communityAPI.getGovernanceDashboard();
        setGovernanceData(updatedData);
        setSelectedProposal(null);
      } else {
        alert(`Vote submission failed: ${result.message}`);
      }
      
    } catch (err) {
      alert(`Unable to submit vote: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setVotingInProgress(null);
    }
  };

  // Loading state with accessibility
  if (loading) {
    return (
      <div 
        className={cn(
          'animate-pulse space-y-4 p-6',
          liberationColors.pride.purple,
          'opacity-20 rounded-lg',
          className
        )}
        data-testid={`${testId}-loading`}
        aria-label="Loading democratic governance interface"
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
  if (error || !governanceData) {
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
        <h3 className="font-semibold mb-2">Unable to Load Governance Interface</h3>
        <p id={`${testId}-error-description`} className="text-sm mb-4">
          {error || 'Democratic governance interface is currently unavailable. Your voting rights remain protected.'}
        </p>
        <LiberationButton
          variant="democratic-governance"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Try Again
        </LiberationButton>
      </div>
    );
  }

  // QI COMPLIANCE: Voting rights display (presentation only)
  const renderVotingRights = () => {
    const { votingRights } = governanceData;
    
    return (
      <div className={cn(
        'p-4 rounded-lg border-2',
        liberationColors.pride.purple,
        'border-liberation-pride-purple/30 bg-liberation-pride-purple/10'
      )}>
        <div className="flex items-center space-x-3 mb-3">
          <Vote className="h-6 w-6 text-liberation-pride-purple" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold font-liberation">
              Your Democratic Rights
            </h3>
            <p className="text-sm opacity-80">
              Participation Level: {votingRights.participationLevel}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Vote', granted: votingRights.canVote, icon: Vote },
            { label: 'Propose', granted: votingRights.canPropose, icon: MessageSquare },
            { label: 'Moderate', granted: votingRights.canModerate, icon: Users },
            { label: 'One Vote', granted: votingRights.voteWeight === 1, icon: CheckCircle },
          ].map((right, index) => {
            const Icon = right.icon;
            return (
              <div 
                key={index}
                className={cn(
                  'flex flex-col items-center p-3 rounded border text-center',
                  right.granted 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                )}
              >
                <Icon 
                  className={cn(
                    'h-5 w-5 mb-1',
                    right.granted ? 'text-green-600' : 'text-gray-400'
                  )}
                  aria-hidden="true"
                />
                <span className="text-xs font-medium">{right.label}</span>
                <span className="text-lg" aria-label={right.granted ? 'Granted' : 'Not granted'}>
                  {right.granted ? '✅' : '➖'}
                </span>
              </div>
            );
          })}
        </div>
        
        {votingRights.voteWeight !== 1 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            ⚠️ Vote weight is {votingRights.voteWeight} - Democratic governance requires equal voting power
          </div>
        )}
      </div>
    );
  };

  // QI COMPLIANCE: Active proposals display (presentation only)
  const renderActiveProposals = () => {
    const activeProposals = governanceData.activeProposals.filter(
      proposal => ['active', 'voting'].includes(proposal.status)
    );

    if (activeProposals.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
          <p>No active proposals requiring your participation</p>
          <p className="text-sm mt-2">Check back later or submit your own proposal</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {activeProposals.map((proposal) => (
          <div
            key={proposal.id}
            className={cn(
              'p-4 rounded-lg border-2 hover:shadow-sm',
              governanceUtils.getVotingStatusClass(proposal.status),
              'border-opacity-30',
              traumaInformedMode && traumaInformedUtils.getSafeTransition('medium')
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold font-liberation mb-1">
                  {proposal.title}
                </h4>
                <p className="text-sm opacity-80 mb-2">
                  {proposal.summary}
                </p>
                <div className="flex items-center space-x-4 text-xs opacity-60">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    <span>Submitted: {dateUtils.formatDisplayDate(proposal.submissionDate)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>Deadline: {dateUtils.formatDisplayDate(proposal.votingDeadline)}</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={cn(
                  'text-xs px-2 py-1 rounded mb-2',
                  governanceUtils.getVotingStatusClass(proposal.status)
                )}>
                  {proposal.status.toUpperCase()}
                </span>
                <div className="text-sm font-medium">
                  {proposal.currentSupport}% Support
                </div>
              </div>
            </div>

            {/* Voting Controls */}
            {governanceData.votingRights.canVote && proposal.status === 'voting' && (
              <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                <span className="text-sm font-medium mr-3">Cast Your Vote:</span>
                
                {['support', 'oppose', 'abstain', 'block'].map((voteOption) => (
                  <LiberationButton
                    key={voteOption}
                    variant={
                      voteOption === 'support' ? 'democratic-governance' :
                      voteOption === 'oppose' ? 'anti-oppression' :
                      voteOption === 'block' ? 'destructive' : 'secondary'
                    }
                    size="sm"
                    loading={votingInProgress === proposal.id}
                    onClick={() => {
                      if (voteOption === 'block') {
                        const rationale = prompt('Please provide rationale for blocking this proposal:');
                        if (rationale) {
                          handleVoteSubmission(proposal.id, voteOption as VoteSubmission['vote'], rationale);
                        }
                      } else {
                        handleVoteSubmission(proposal.id, voteOption as VoteSubmission['vote']);
                      }
                    }}
                    ariaDescription={`Vote ${voteOption} on proposal: ${proposal.title}`}
                    requiresConfirmation={voteOption === 'block'}
                    confirmationText="Are you sure you want to block this proposal? This is a strong democratic action."
                  >
                    {voteOption.charAt(0).toUpperCase() + voteOption.slice(1)}
                  </LiberationButton>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // QI COMPLIANCE: Voting history display (presentation only)
  const renderVotingHistory = () => {
    const { votingHistory } = governanceData;

    if (votingHistory.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
          <p>No voting history yet</p>
          <p className="text-sm mt-2">Your democratic participation will be recorded here</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {votingHistory.slice(0, 10).map((vote, index) => (
          <div
            key={index}
            className={cn(
              'p-3 rounded border flex items-center justify-between',
              'bg-gray-50 border-gray-200'
            )}
          >
            <div className="flex-1">
              <h5 className="font-medium text-sm">{vote.proposalTitle}</h5>
              <p className="text-xs opacity-70 mt-1">
                Voted: {dateUtils.formatDisplayDate(vote.votedAt)}
              </p>
              {vote.rationale && (
                <p className="text-xs mt-1 italic">"{vote.rationale}"</p>
              )}
            </div>
            <div className={cn(
              'px-2 py-1 rounded text-xs font-medium',
              vote.vote === 'support' ? 'bg-green-100 text-green-800' :
              vote.vote === 'oppose' ? 'bg-red-100 text-red-800' :
              vote.vote === 'block' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            )}>
              {vote.vote.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // QI COMPLIANCE: Consensus tracking display (presentation only)
  const renderConsensusTracking = () => {
    const { consensusParticipation } = governanceData;

    return (
      <div className="space-y-4">
        {consensusParticipation.map((consensus, index) => {
          const consensusClass = governanceUtils.getConsensusClass(consensus.consensusLevel);
          
          return (
            <div
              key={index}
              className={cn(
                'p-4 rounded-lg border-2',
                consensusClass
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium">Consensus Building</h5>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {consensus.consensusLevel}% Consensus
                  </span>
                  {consensus.blockers > 0 && (
                    <span className="flex items-center space-x-1 text-orange-600">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      <span className="text-xs">{consensus.blockers} blockers</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                <div>Support Level: {consensus.supportLevel}%</div>
                {consensus.discussionPoints.length > 0 && (
                  <div>
                    <span className="font-medium">Key Points:</span>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {consensus.discussionPoints.slice(0, 3).map((point, idx) => (
                        <li key={idx} className="text-xs opacity-80">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'space-y-6 p-6 rounded-lg border-2',
        liberationColors.pride.purple,
        'border-liberation-pride-purple/20 bg-white',
        traumaInformedMode && traumaInformedUtils.getSafeTransition('medium'),
        className
      )}
      data-testid={testId}
      aria-label="Democratic governance interface"
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-liberation text-liberation-black-power">
            Democratic Governance
          </h2>
          <p className="text-sm opacity-70 mt-1">
            Community-controlled decision making and consensus building
          </p>
        </div>
      </div>

      {/* Voting Rights Section */}
      <section aria-labelledby="voting-rights-heading">
        <h3 id="voting-rights-heading" className="sr-only">
          Your democratic participation rights
        </h3>
        {renderVotingRights()}
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Governance sections">
          {[
            { key: 'active', label: 'Active Proposals', icon: Vote },
            { key: 'history', label: 'Voting History', icon: MessageSquare },
            ...(enableConsensusView ? [{ key: 'consensus', label: 'Consensus Building', icon: Users }] : []),
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={cn(
                'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm',
                'hover:text-liberation-pride-purple hover:border-liberation-pride-purple/50',
                traumaInformedUtils.getSafeTransition('fast'),
                activeTab === key
                  ? 'border-liberation-pride-purple text-liberation-pride-purple'
                  : 'border-transparent text-gray-500'
              )}
              aria-current={activeTab === key ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'active' && (
          <section aria-labelledby="active-proposals-heading">
            <h3 id="active-proposals-heading" className="sr-only">
              Active proposals requiring your vote
            </h3>
            {renderActiveProposals()}
          </section>
        )}

        {activeTab === 'history' && showHistory && (
          <section aria-labelledby="voting-history-heading">
            <h3 id="voting-history-heading" className="sr-only">
              Your voting history and democratic participation
            </h3>
            {renderVotingHistory()}
          </section>
        )}

        {activeTab === 'consensus' && enableConsensusView && (
          <section aria-labelledby="consensus-building-heading">
            <h3 id="consensus-building-heading" className="sr-only">
              Community consensus building and discussion
            </h3>
            {renderConsensusTracking()}
          </section>
        )}
      </div>
    </div>
  );
};