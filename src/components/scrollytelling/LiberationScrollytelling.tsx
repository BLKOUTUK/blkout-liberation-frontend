import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface LiberationScrollytellingProps {
  onReturnToPlatform: () => void;
}

interface StorySlide {
  id: string;
  title: string;
  content: string;
  media?: {
    type: 'image' | 'video';
    src: string;
    alt?: string;
  };
  backgroundColor: string;
  textColor: string;
}

const storySlides: StorySlide[] = [
  {
    id: 'intro',
    title: 'Our Liberation Story Begins',
    content: 'Welcome to the BLKOUT Liberation Platform - where Black queer joy meets revolutionary action.',
    media: {
      type: 'image',
      src: '/Branding and logos/blkout_logo_roundel_colour.png',
      alt: 'BLKOUT Liberation Platform Logo'
    },
    backgroundColor: 'from-liberation-pride-pink to-liberation-pride-purple',
    textColor: 'text-white'
  },
  {
    id: 'sovereignty',
    title: '75% Creator Sovereignty',
    content: 'Our platform ensures creators retain 75% ownership of their work - the highest in the industry.',
    backgroundColor: 'from-liberation-pride-blue to-liberation-pride-teal',
    textColor: 'text-white'
  },
  {
    id: 'governance',
    title: 'Democratic Governance',
    content: 'Every member has a voice. One member, one vote. True community democracy in action.',
    backgroundColor: 'from-liberation-pride-gold to-liberation-pride-orange',
    textColor: 'text-liberation-dark'
  },
  {
    id: 'protection',
    title: 'Community Protection',
    content: 'Trauma-informed design and community protection are built into every aspect of our platform.',
    media: {
      type: 'image',
      src: '/videos/onboarding/blkoutvalues.png',
      alt: 'BLKOUT Values - Our commitment to community protection and liberation'
    },
    backgroundColor: 'from-liberation-pride-green to-liberation-pride-blue',
    textColor: 'text-white'
  },
  {
    id: 'joy',
    title: 'Black Queer Joy',
    content: 'Celebrating authenticity, creativity, and the full spectrum of Black queer experiences.',
    backgroundColor: 'from-liberation-pride-purple to-liberation-pride-pink',
    textColor: 'text-white'
  },
  {
    id: 'action',
    title: 'Revolutionary Action',
    content: 'From platform to movement - join us in building the future of community-owned technology.',
    backgroundColor: 'from-liberation-dark to-liberation-pride-purple',
    textColor: 'text-white'
  }
];

export const LiberationScrollytelling: React.FC<LiberationScrollytellingProps> = ({ onReturnToPlatform }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const slideIndex = Math.min(
        Math.floor(scrollPosition / windowHeight),
        storySlides.length - 1
      );
      setCurrentSlide(slideIndex);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNextSlide = () => {
    if (currentSlide < storySlides.length - 1) {
      const nextSlidePosition = (currentSlide + 1) * window.innerHeight;
      window.scrollTo({ top: nextSlidePosition, behavior: 'smooth' });
    }
  };

  const handleJoinPlatform = () => {
    onReturnToPlatform();
  };

  return (
    <div className="liberation-scrollytelling">
      {/* Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-liberation-dark/90 backdrop-blur-sm border-b border-liberation-pride-pink/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onReturnToPlatform}
              className="flex items-center space-x-2 text-liberation-pride-pink hover:text-liberation-pride-blue transition-colors"
              aria-label="Return to Liberation Platform"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Return to Platform</span>
            </button>

            <div className="text-white font-bold text-lg">
              Liberation Story
            </div>

            <div className="flex space-x-2">
              {storySlides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-liberation-pride-pink'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Story Slides */}
      <div className="relative">
        {storySlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`
              min-h-screen flex items-center justify-center
              bg-gradient-to-br ${slide.backgroundColor}
              transition-all duration-1000 ease-in-out
              ${currentSlide === index ? 'opacity-100 scale-100' : 'opacity-80 scale-95'}
            `}
            style={{ transform: `translateY(${index * 100}vh)` }}
          >
            <div className="max-w-4xl mx-auto px-6 text-center">
              {slide.media && (
                <div className="mb-8 flex justify-center">
                  {slide.media.type === 'image' ? (
                    <img
                      src={slide.media.src}
                      alt={slide.media.alt}
                      className="w-32 h-32 object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <video
                      src={slide.media.src}
                      autoPlay
                      loop
                      muted
                      className="w-64 h-40 object-cover rounded-lg shadow-lg"
                    />
                  )}
                </div>
              )}

              <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${slide.textColor}`}>
                {slide.title}
              </h1>

              <p className={`text-xl md:text-2xl mb-8 leading-relaxed ${slide.textColor} opacity-90`}>
                {slide.content}
              </p>

              {index < storySlides.length - 1 ? (
                <button
                  onClick={handleNextSlide}
                  className="px-8 py-3 bg-white/20 backdrop-blur-sm rounded-lg font-medium text-white border border-white/30 hover:bg-white/30 transition-all duration-300"
                >
                  Continue Story
                </button>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleJoinPlatform}
                    className="px-12 py-4 bg-liberation-pride-pink text-white rounded-lg font-bold text-lg hover:bg-liberation-pride-purple transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🏴‍☠️ Join the Liberation Platform
                  </button>
                  <p className="text-white/80 text-sm">
                    Ready to be part of the revolution?
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        {currentSlide < storySlides.length - 1 && (
          <div className="flex flex-col items-center text-white animate-bounce">
            <div className="text-sm mb-2">Scroll to continue</div>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiberationScrollytelling;