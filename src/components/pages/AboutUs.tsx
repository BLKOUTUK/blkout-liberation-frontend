// BLKOUT Liberation Platform - About Us Page
// Comprehensive transparency, policies, and technical information

import React, { useState } from 'react';
import { Shield, Heart, Users, FileText, MapPin, Phone, Mail, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ title, children, defaultOpen = false }: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-gray-800 hover:bg-gray-750 transition-colors text-left"
      >
        <h3 className="text-xl font-black text-liberation-sovereignty-gold">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-liberation-sovereignty-gold" />
        ) : (
          <ChevronDown className="w-5 h-5 text-liberation-sovereignty-gold" />
        )}
      </button>
      {isOpen && (
        <div className="p-6 bg-gray-900 border-t border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-liberation-pride-pink/20 via-liberation-pride-purple/30 to-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black text-white mb-6">
            ABOUT BLKOUT LIBERATION PLATFORM
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The world's first technically implemented liberation platform with 75% creator sovereignty,
            democratic governance, and trauma-informed community protection for Black queer communities.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-liberation-healing-sage" />
              <span className="text-liberation-healing-sage font-bold">Community Benefit Society</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-liberation-pride-pink" />
              <span className="text-liberation-pride-pink font-bold">Liberation-First</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-liberation-sovereignty-gold" />
              <span className="text-liberation-sovereignty-gold font-bold">Community-Owned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-6">

          {/* Mission & Values */}
          <CollapsibleSection title="Our Liberation Mission" defaultOpen={true}>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-liberation-pride-pink mb-3">Core Mission</h4>
                <p className="text-gray-300 leading-relaxed">
                  BLKOUT Liberation Platform exists to create technical infrastructure that prioritizes Black queer liberation
                  through economic sovereignty, democratic governance, and trauma-informed community protection. We reject
                  extractive technology models in favor of cooperative ownership and genuine community empowerment.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-liberation-pride-pink">
                  <h5 className="text-liberation-pride-pink font-bold mb-2">75% Creator Sovereignty</h5>
                  <p className="text-sm text-gray-300">
                    Not performative promises - technically enforced revenue sharing where creators retain
                    75% of value generated, with 25% supporting platform infrastructure and community programs.
                  </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-liberation-pride-purple">
                  <h5 className="text-liberation-pride-purple font-bold mb-2">Democratic Governance</h5>
                  <p className="text-sm text-gray-300">
                    One-member-one-vote community governance with transparent decision-making processes.
                    No corporate board overrides - community decisions are technically binding.
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Trauma-Informed Practices */}
          <CollapsibleSection title="Trauma-Informed Practices Explained">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-liberation-healing-sage mb-3">What "Trauma-Informed" Actually Means</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our trauma-informed approach is based on evidence-based practices, not just buzzwords.
                  We implement specific technical and community features designed around trauma recovery principles.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-bold text-liberation-healing-sage mb-2">🛡️ Safety First</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Content warnings and trigger alerts before potentially harmful content</li>
                    <li>• Granular privacy controls - users control what they share and with whom</li>
                    <li>• Anonymous participation options for sensitive discussions</li>
                    <li>• No location tracking without explicit consent</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-bold text-liberation-healing-sage mb-2">🤝 Trustworthiness & Transparency</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Open-source platform architecture - no hidden algorithms</li>
                    <li>• Financial transparency - all revenue sharing publicly auditable</li>
                    <li>• Clear community guidelines co-created by members</li>
                    <li>• Predictable moderation processes with community oversight</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-bold text-liberation-healing-sage mb-2">✊ Choice & Collaboration</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Democratic governance - community members shape platform policies</li>
                    <li>• Multiple engagement options - no forced participation</li>
                    <li>• Peer support networks with trained community facilitators</li>
                    <li>• Restorative justice approaches to conflict resolution</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-bold text-liberation-healing-sage mb-2">🌟 Empowerment & Cultural Responsiveness</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Black queer joy celebration integrated into platform design</li>
                    <li>• Economic empowerment through guaranteed creator sovereignty</li>
                    <li>• Cultural authenticity prioritized over growth metrics</li>
                    <li>• Community healing circles and mutual aid coordination</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Safer Spaces Policy */}
          <CollapsibleSection title="Safer Spaces - Why & How">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-liberation-pride-purple mb-3">Creating Genuinely Safer Spaces</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We call them "safer" not "safe" spaces because we acknowledge that complete safety cannot be guaranteed,
                  but we can create conditions that significantly reduce harm and promote healing.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-liberation-pride-purple">
                  <h5 className="font-bold text-liberation-pride-purple mb-2">Community Protection Measures</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Proactive moderation by trained community members</li>
                    <li>• Zero tolerance for racism, transphobia, homophobia, or other oppression</li>
                    <li>• Content moderation queue system with community oversight</li>
                    <li>• Immediate response protocols for harassment or threats</li>
                    <li>• De-escalation training for community moderators</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-liberation-healing-sage">
                  <h5 className="font-bold text-liberation-healing-sage mb-2">Harm Reduction Approach</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Restorative justice processes instead of punitive banning</li>
                    <li>• Mental health crisis intervention protocols</li>
                    <li>• Conflict mediation by trained community facilitators</li>
                    <li>• Regular community check-ins and feedback mechanisms</li>
                    <li>• Connection to local mental health and crisis resources</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-liberation-sovereignty-gold">
                  <h5 className="font-bold text-liberation-sovereignty-gold mb-2">Technical Safeguards</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Advanced privacy controls and encrypted communications</li>
                    <li>• AI-assisted content warnings for potentially triggering material</li>
                    <li>• Granular blocking and filtering options</li>
                    <li>• Anonymous reporting mechanisms for community concerns</li>
                    <li>• Regular security audits and vulnerability assessments</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Technical Specifications */}
          <CollapsibleSection title="Technical Specifications">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-bold text-liberation-sovereignty-gold mb-3">Platform Architecture</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li><strong>Frontend:</strong> React 18, TypeScript, Tailwind CSS</li>
                    <li><strong>Backend:</strong> Node.js, Express, PostgreSQL</li>
                    <li><strong>Hosting:</strong> Vercel (Frontend), Railway (Backend)</li>
                    <li><strong>CDN:</strong> Cloudflare with DDoS protection</li>
                    <li><strong>Monitoring:</strong> Real-time performance tracking</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-liberation-sovereignty-gold mb-3">Security & Privacy</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li><strong>Encryption:</strong> TLS 1.3, AES-256 data encryption</li>
                    <li><strong>Authentication:</strong> Multi-factor authentication available</li>
                    <li><strong>Privacy:</strong> No third-party tracking, minimal data collection</li>
                    <li><strong>Compliance:</strong> GDPR, CCPA compliant</li>
                    <li><strong>Auditing:</strong> Regular third-party security assessments</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h5 className="font-bold text-liberation-pride-pink mb-2">Open Source Commitment</h5>
                <p className="text-sm text-gray-300">
                  Our platform architecture is open source to ensure transparency and community oversight.
                  Community members can review, audit, and contribute to the codebase.
                  Repository: <a href="#" className="text-liberation-sovereignty-gold hover:underline">github.com/blkout-liberation</a>
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Legal & Organizational Information */}
          <CollapsibleSection title="Legal & Organizational Information">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-liberation-pride-purple mb-4">Organizational Structure</h4>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div>
                      <strong className="text-white">Legal Status:</strong><br />
                      Community Benefit Society (CBS)<br />
                      Registration Number: [To be registered]
                    </div>
                    <div>
                      <strong className="text-white">Governance Model:</strong><br />
                      Cooperative ownership with democratic member governance
                    </div>
                    <div>
                      <strong className="text-white">Financial Model:</strong><br />
                      75% creator revenue share, 25% platform operations and community programs
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-liberation-healing-sage mb-4">Contact Information</h4>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-liberation-healing-sage mt-1 flex-shrink-0" />
                      <div>
                        <strong className="text-white">Registered Office:</strong><br />
                        [To be determined upon CBS registration]<br />
                        United Kingdom
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-liberation-healing-sage" />
                      <div>
                        <strong className="text-white">Contact:</strong><br />
                        info@blkoutcollective.org
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h5 className="font-bold text-liberation-sovereignty-gold mb-2">Community Benefit Society (CBS) Benefits</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Democratic member control - one member, one vote regardless of investment</li>
                  <li>• Asset lock - community assets cannot be extracted by private interests</li>
                  <li>• Community purpose priority over profit maximization</li>
                  <li>• Tax advantages for community benefit activities</li>
                  <li>• Regulatory oversight ensuring community benefit compliance</li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* Community Guidelines & Policies */}
          <CollapsibleSection title="Community Guidelines & Policies">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-liberation-pride-pink">
                  <h5 className="font-bold text-liberation-pride-pink mb-2">Liberation-Centered Values</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Center Black queer joy and liberation in all interactions</li>
                    <li>• Challenge oppressive systems, not individuals experiencing oppression</li>
                    <li>• Practice accountability and restorative justice</li>
                    <li>• Honor the labor and wisdom of Black queer ancestors and elders</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-liberation-healing-sage">
                  <h5 className="font-bold text-liberation-healing-sage mb-2">Prohibited Behaviors</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Racism, transphobia, homophobia, or other forms of oppression</li>
                    <li>• Harassment, doxxing, or threats of violence</li>
                    <li>• Content that promotes self-harm or exploitation</li>
                    <li>• Corporate extraction or exploitative business practices</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-liberation-sovereignty-gold">
                  <h5 className="font-bold text-liberation-sovereignty-gold mb-2">Accountability Process</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Community reporting and peer mediation first</li>
                    <li>• Restorative justice circles for community harm</li>
                    <li>• Escalation to trained community moderators when needed</li>
                    <li>• Removal only as last resort after community process</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong className="text-liberation-sovereignty-gold">Full Community Guidelines:</strong>
                  <a href="#" className="text-liberation-sovereignty-gold hover:underline ml-1">
                    View complete community guidelines document
                  </a>
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Transparency & Accountability */}
          <CollapsibleSection title="Transparency & Accountability">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-bold text-liberation-pride-purple mb-2">Financial Transparency</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Monthly financial reports published to community</li>
                    <li>• Real-time creator revenue sharing tracking</li>
                    <li>• Annual community audit and budget approval</li>
                    <li>• Open-book accounting with member access</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-bold text-liberation-healing-sage mb-2">Decision-Making Transparency</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• All community votes and results publicly visible</li>
                    <li>• Community meeting minutes published</li>
                    <li>• Platform changes proposed and voted on by members</li>
                    <li>• Conflict resolution outcomes shared (with privacy protection)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h5 className="font-bold text-liberation-sovereignty-gold mb-2">Community Oversight Mechanisms</h5>
                <p className="text-sm text-gray-300 mb-2">
                  The community maintains oversight through multiple channels:
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Elected community council with rotating membership</li>
                  <li>• Anonymous feedback systems for platform concerns</li>
                  <li>• Regular community assemblies for major decisions</li>
                  <li>• External mediation available for unresolved conflicts</li>
                  <li>• Annual third-party audits of community benefit compliance</li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>

        </div>

        {/* Footer CTA */}
        <div className="mt-12 bg-gradient-to-r from-liberation-pride-pink to-liberation-pride-purple rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-black mb-4">QUESTIONS ABOUT OUR PRACTICES?</h3>
          <p className="mb-6">
            Transparency is fundamental to liberation. If you have questions about any of our practices,
            policies, or technical implementations, we're committed to providing clear answers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-liberation-pride-purple px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
              Contact Community Council
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">
              Join Community Assembly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}