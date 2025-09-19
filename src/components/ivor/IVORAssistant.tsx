import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables for IVOR');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface IVORMessage {
  id: string;
  type: 'user' | 'ivor';
  content: string;
  timestamp: Date;
  category?: string;
}

interface LearningTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'problem-solving' | 'emotional-support' | 'learning' | 'entertainment';
  prompt: string;
}

const LEARNING_TOOLS: LearningTool[] = [
  {
    id: 'problem-solving',
    name: 'Problem-Solving Assistant',
    description: 'Work through challenges step by step with community-centered solutions',
    icon: '🧠',
    category: 'problem-solving',
    prompt: 'I need help working through a problem. Can you guide me through a step-by-step process that centers community wisdom and liberation principles?'
  },
  {
    id: 'conflict-resolution',
    name: 'Conflict Resolution',
    description: 'Navigate interpersonal challenges with trauma-informed approaches',
    icon: '🤝',
    category: 'problem-solving',
    prompt: 'I\'m dealing with a conflict and need guidance on how to approach it with community care and trauma-informed practices.'
  },
  {
    id: 'study-buddy',
    name: 'Study Partner',
    description: 'Get help understanding concepts and organizing learning',
    icon: '📚',
    category: 'learning',
    prompt: 'I\'d like you to be my study partner. Can you help me understand and learn about a topic?'
  },
  {
    id: 'emotional-support',
    name: 'Emotional Check-In',
    description: 'Space for emotional processing and community support',
    icon: '💜',
    category: 'emotional-support',
    prompt: 'I could use some emotional support and a caring check-in. Can you help me process what I\'m feeling?'
  },
  {
    id: 'jokes-humor',
    name: 'Jokes & Humor',
    description: 'Share community-appropriate jokes and lighthearted moments',
    icon: '😄',
    category: 'entertainment',
    prompt: 'I could use a good laugh! Can you share some community-appropriate humor or a joke?'
  },
  {
    id: 'liberation-wisdom',
    name: 'Liberation Wisdom',
    description: 'Explore liberation principles and community wisdom',
    icon: '✊🏾',
    category: 'learning',
    prompt: 'I\'d like to explore liberation principles and community wisdom. Can you share some insights?'
  },
  {
    id: 'creative-spark',
    name: 'Creative Inspiration',
    description: 'Get unstuck with creative projects and artistic expression',
    icon: '🎨',
    category: 'problem-solving',
    prompt: 'I\'m feeling creatively stuck. Can you help me find inspiration and new approaches to my creative work?'
  },
  {
    id: 'resource-finder',
    name: 'Resource Navigator',
    description: 'Find community resources and mutual aid opportunities',
    icon: '🗺️',
    category: 'learning',
    prompt: 'I need help finding resources or connecting with community support. Can you guide me?'
  }
];

export default function IVORAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<IVORMessage[]>([
    {
      id: '1',
      type: 'ivor',
      content: 'Hello! I\'m IVOR, your community AI assistant. I\'m here to support you with learning tools, problem-solving, and community wisdom. How can I help you today?',
      timestamp: new Date(),
      category: 'greeting'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLearningTools, setShowLearningTools] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const categories = Array.from(new Set(LEARNING_TOOLS.map(tool => tool.category)));

  const filteredTools = selectedCategory
    ? LEARNING_TOOLS.filter(tool => tool.category === selectedCategory)
    : LEARNING_TOOLS;

  const handleSendMessage = async (content: string = currentMessage) => {
    if (!content.trim()) return;

    const userMessage: IVORMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setShowLearningTools(false);

    try {
      // Store conversation in Supabase if available
      if (supabase) {
        await supabase.from('ivor_conversations').insert([
          {
            user_message: content,
            timestamp: new Date().toISOString(),
            session_id: 'webapp-session-' + Date.now()
          }
        ]);
      }

      // Simulate IVOR response based on content
      const response = await generateIVORResponse(content);

      const ivorMessage: IVORMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ivor',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, ivorMessage]);

      // Store IVOR response
      if (supabase) {
        await supabase.from('ivor_conversations').insert([
          {
            ivor_response: response,
            timestamp: new Date().toISOString(),
            session_id: 'webapp-session-' + Date.now()
          }
        ]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: IVORMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ivor',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again or reach out to the community for support.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearningToolSelect = (tool: LearningTool) => {
    handleSendMessage(tool.prompt);
  };

  const generateIVORResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase();

    // Problem-solving responses
    if (message.includes('problem') || message.includes('challenge') || message.includes('step-by-step')) {
      return `Let's work through this together using community-centered problem-solving:

1. **Define the Challenge**: What exactly are you facing? Let's name it clearly and without judgment.

2. **Community Perspective**: How might this challenge affect not just you, but your community connections?

3. **Resources & Strengths**: What resources, skills, or community support do you already have?

4. **Liberation-Centered Solutions**: What options align with our values of mutual aid, community care, and collective liberation?

5. **Action Steps**: What's one small, manageable step you could take today?

Would you like to work through any of these steps together? I'm here to support you with trauma-informed, community-centered guidance.`;
    }

    // Conflict resolution responses
    if (message.includes('conflict') || message.includes('resolution') || message.includes('trauma-informed')) {
      return `Conflict is natural in community spaces. Let's approach this with care:

**Trauma-Informed Approach:**
- Center safety for all involved
- Recognize that conflict can trigger past traumas
- Move at the pace of trust, not urgency

**Community Care Steps:**
1. Pause and breathe - your nervous system matters
2. Identify your needs and feelings without blame
3. Consider the other person's humanity and circumstances
4. Seek to understand before being understood
5. Focus on impact over intent

**Restorative Questions:**
- What happened and who was affected?
- What needs weren't met?
- How can we move forward together?

Would you like to explore any of these approaches more deeply? I'm here to support you in navigating this with community wisdom.`;
    }

    // Study partner responses
    if (message.includes('study') || message.includes('learn') || message.includes('understand')) {
      return `I'd love to be your study partner! Learning is more powerful when we do it together.

**How I can support your learning:**
- Break down complex topics into manageable pieces
- Help you make connections between new and existing knowledge
- Practice active recall and spaced repetition
- Connect learning to liberation and community wisdom
- Celebrate your progress and growth

**Learning with Liberation Principles:**
- Knowledge belongs to the community
- Different ways of knowing are valuable
- Learning should serve collective liberation
- Mistakes are part of the process

What subject or topic would you like to explore together? I'm here to support your learning journey with patience and encouragement.`;
    }

    // Emotional support responses
    if (message.includes('emotional') || message.includes('feeling') || message.includes('support') || message.includes('check-in')) {
      return `Thank you for trusting me with your feelings. Your emotions are valid and deserve care.

**Gentle Check-In:**
How are you holding up right now? It's okay if the answer is "not great" - you don't have to be strong all the time.

**Reminders for Your Heart:**
- You are worthy of love and care exactly as you are
- It's okay to feel multiple things at once
- Community healing happens through individual healing
- Your struggles don't define your worth

**Community Care Suggestions:**
- Reach out to a trusted friend or community member
- Practice grounding techniques (5-4-3-2-1 senses)
- Move your body gently if it feels good
- Rest without guilt

I'm here to listen without judgment. What would feel most supportive for you right now?`;
    }

    // Jokes and humor responses
    if (message.includes('joke') || message.includes('humor') || message.includes('laugh')) {
      const jokes = [
        "Why did the liberation organizer bring a ladder to the meeting? Because they heard it was time to raise consciousness! 😄",
        "What's a community organizer's favorite type of music? Protest songs... but they're always in harmony! 🎵",
        "Why don't oppressive systems ever win at hide and seek? Because the community always finds them! 👀",
        "What did one liberation activist say to another? 'We're stronger together!' (And they weren't wrong!) ✊🏾",
        "Why did the mutual aid network cross the road? To help the chicken get to the other side - because no one should have to journey alone! 🐔💜"
      ];

      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

      return `Here's some community humor for you:

${randomJoke}

Laughter is resistance! Community joy is a radical act. Sometimes we need moments of lightness to sustain us in the work of liberation.

Would you like another joke, or is there something else I can help brighten your day with?`;
    }

    // Liberation wisdom responses
    if (message.includes('liberation') || message.includes('wisdom') || message.includes('principles')) {
      return `Liberation wisdom flows from our ancestors and grows through our collective experiences:

**Core Liberation Principles:**
- "Nobody's free until everybody's free" - We rise together
- Community care is not just self-care scaled up
- Center those most impacted by systems of oppression
- Mutual aid is solidarity, not charity
- Healing happens in community

**Ancestral Wisdom:**
"If you have come here to help me, you are wasting your time. But if you have come because your liberation is bound up with mine, then let us work together." - Aboriginal activists, Queensland, 1970s

**Community Practices:**
- Listen more than you speak
- Share resources and power
- Hold space for difficult emotions
- Celebrate small victories together
- Rest is resistance

What aspect of liberation wisdom resonates with you today? I'm here to explore these principles together.`;
    }

    // Creative inspiration responses
    if (message.includes('creative') || message.includes('art') || message.includes('stuck') || message.includes('inspiration')) {
      return `Creative blocks are just energy waiting to flow in new directions! Let's unstick that creative spark:

**Creative Unsticking Techniques:**
- Change your environment (even just a different chair)
- Start with the "worst" idea first - take the pressure off
- Set a timer for 5 minutes and create anything
- Ask: "What would my ancestor create?"
- Connect your art to community needs

**Liberation-Centered Creativity:**
- How does your creativity serve the community?
- What stories need telling that only you can tell?
- How can your art be an act of resistance?
- What beauty can you bring to the movement?

**Creative Prompts:**
- Create something that celebrates community resilience
- Make art from materials you have right now
- Tell a story about mutual aid in action
- Design something that brings joy to your neighbors

What kind of creative work calls to you? I'm here to help you reconnect with your artistic power!`;
    }

    // Resource navigator responses
    if (message.includes('resource') || message.includes('help') || message.includes('support') || message.includes('mutual aid')) {
      return `Finding community resources is an act of mutual aid! Let's connect you with support:

**Types of Community Resources:**
- Mutual aid networks and food pantries
- Community healing and therapy resources
- Educational opportunities and skill shares
- Housing assistance and tenant organizing
- Economic justice and cooperative development
- Legal aid and know-your-rights trainings

**How to Find Local Resources:**
- Search "[your city] mutual aid network"
- Check with local community centers
- Connect with faith communities doing justice work
- Look for community fridges and little free libraries
- Ask neighbors and community members

**Mutual Aid Principles:**
- Solidarity, not charity
- No strings attached
- Led by those most impacted
- Meets immediate needs while working for systemic change

What specific type of support are you looking for? I can help you think through where to start looking and how to connect with community resources.`;
    }

    // Default response
    return `Thank you for sharing that with me. I'm here to support you however I can.

I can help with:
- Problem-solving and working through challenges
- Learning and studying together
- Emotional support and check-ins
- Finding community resources
- Creative inspiration
- Sharing liberation wisdom
- A good joke when you need one!

What would feel most helpful for you right now? I'm here to listen and support you with community-centered care.`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-liberation-gold text-liberation-black p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-liberation-black rounded-full flex items-center justify-center">
              <span className="text-liberation-gold font-bold">I</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">IVOR - Community AI Assistant</h2>
              <p className="text-sm opacity-80">Your learning companion and community support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-liberation-black hover:text-liberation-black/70 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Learning Tools Sidebar */}
          {showLearningTools && (
            <div className="w-1/3 bg-liberation-cream border-r border-liberation-gold/20 p-4 overflow-y-auto">
              <h3 className="font-bold text-liberation-black mb-4">Learning Tools</h3>

              {/* Category filters */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1 rounded-full text-xs ${
                      selectedCategory === null
                        ? 'bg-liberation-gold text-liberation-black'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs capitalize ${
                        selectedCategory === category
                          ? 'bg-liberation-gold text-liberation-black'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning tools */}
              <div className="space-y-3">
                {filteredTools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleLearningToolSelect(tool)}
                    className="w-full text-left p-3 bg-white rounded-lg border border-liberation-gold/20 hover:border-liberation-gold hover:bg-liberation-gold/5 transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div>
                        <h4 className="font-semibold text-liberation-black text-sm">{tool.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className={`${showLearningTools ? 'w-2/3' : 'w-full'} flex flex-col`}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-liberation-gold text-liberation-black'
                        : 'bg-liberation-cream text-liberation-black border border-liberation-gold/20'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-liberation-cream text-liberation-black border border-liberation-gold/20 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-liberation-gold rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-liberation-gold rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-liberation-gold rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-liberation-gold/20 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask IVOR anything about learning, problem-solving, or community support..."
                  className="flex-1 p-3 border border-liberation-gold/20 rounded-lg focus:outline-none focus:border-liberation-gold"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !currentMessage.trim()}
                  className="px-6 py-3 bg-liberation-gold text-liberation-black rounded-lg hover:bg-liberation-gold/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={() => setShowLearningTools(!showLearningTools)}
                  className="text-sm text-liberation-black/60 hover:text-liberation-black"
                >
                  {showLearningTools ? 'Hide Learning Tools' : 'Show Learning Tools'}
                </button>
                <p className="text-xs text-liberation-black/60">
                  IVOR is here to support community learning and mutual aid
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}