import { FileText, Mail, Zap, CheckCircle, Layout, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  xDistance: number;
  yDistance: number;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<Star[]>([]);

  // Generate stars only once on mount
  useEffect(() => {
    const generatedStars: Star[] = [];
    const count = 45;
    
    for (let i = 0; i < count; i++) {
      const top = Math.random() * 95;
      const left = Math.random() * 95;
      const size = 1.5 + Math.random() * 0.7;
      const opacity = 0.4 + Math.random() * 0.35;
      // Shorter durations for more noticeable movement
      const duration = 5 + Math.random() * 5; // 5-10 seconds
      const delay = Math.random() * 2;
      const xDistance = (Math.random() - 0.5) * 35; // -17.5 to 17.5px
      const yDistance = (Math.random() - 0.5) * 35;
      
      generatedStars.push({
        id: i,
        top: `${top}%`,
        left: `${left}%`,
        size,
        opacity,
        duration,
        delay,
        xDistance,
        yDistance,
      });
    }
    setStars(generatedStars);
  }, []);

  // ✨ Subtle parallax effect
  const getParallaxStyle = useCallback((factor: number = 0.015) => {
    const x = (mousePosition.x - 0.5) * factor * 20;
    const y = (mousePosition.y - 0.5) * factor * 20;
    return {
      transform: `translate(${x}px, ${y}px)`,
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  }, [mousePosition]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden bg-[#000000] select-none">
      {/* ✨ Premium Background - Pure Black */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        {/* Pure Black Base - No gradient, no blue tint */}
        <div className="absolute inset-0 bg-[#000000]" />

        {/* Subtle Purple Glow Behind Logo - Very Soft */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* ✨ Floating Stars Layer - Continuous Motion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white floating-star"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                top: star.top,
                left: star.left,
                opacity: star.opacity,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
                '--x-distance': `${star.xDistance}px`,
                '--y-distance': `${star.yDistance}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Subtle Vignette - Very light */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.25) 100%)',
          }}
        />
      </div>

      {/* ✨ Main Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-4xl flex flex-col items-center gap-5 md:gap-7 lg:gap-9 py-4">
          {/* ✨ Logo - Premium Glass Card */}
          <div
            className="relative group animate-fade-up"
            style={{
              animationDelay: '0ms',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            {/* Glow behind logo */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
                filter: 'blur(30px)',
                transform: 'scale(1.5)',
                animation: 'glowPulse 5s ease-in-out infinite alternate',
              }}
            />

            {/* Glass Card */}
            <div
              className="relative p-3 rounded-2xl bg-white/[0.015] backdrop-blur-xl border border-white/[0.03] shadow-2xl"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
                ...getParallaxStyle(0.008),
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.015), transparent 70%)',
                }}
              />

              <img
                src="/icon-1024x1024.png"
                alt="Adin AI Logo"
                className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain rounded-xl"
                style={{
                  filter: 'drop-shadow(0 8px 24px rgba(139, 92, 246, 0.06))',
                }}
              />
            </div>
          </div>

          {/* ✨ Title */}
          <div
            className="text-center space-y-2 animate-fade-up"
            style={{
              animationDelay: '100ms',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 30%, #6366f1 60%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 60px rgba(139, 92, 246, 0.04)',
                letterSpacing: '-0.02em',
              }}
            >
              Adin AI
            </h1>

            <div className="h-[2px] w-16 mx-auto bg-gradient-to-r from-transparent via-purple-500/15 to-transparent" />
          </div>

          {/* ✨ Subtitle */}
          <p
            className="text-center max-w-2xl animate-fade-up"
            style={{
              animationDelay: '200ms',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <span className="text-gray-300 text-base sm:text-lg md:text-xl font-light leading-relaxed tracking-wide">
              Free CV Builder,
            </span>
            <span className="text-gray-300 text-base sm:text-lg md:text-xl font-light leading-relaxed tracking-wide">
              {' '}<span className="text-purple-400 font-medium">Cover Letter</span>
            </span>
            <span className="text-gray-300 text-base sm:text-lg md:text-xl font-light leading-relaxed tracking-wide">
              {' '}&{' '}
            </span>
            <span className="text-gray-300 text-base sm:text-lg md:text-xl font-light leading-relaxed tracking-wide">
              <span className="text-blue-400 font-medium">AI Career Assistant</span>
            </span>
          </p>

          {/* ✨ Feature Chips - Premium Glass Pills */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 animate-fade-up"
            style={{
              animationDelay: '300ms',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            {[
              { icon: Zap, label: 'AI Powered', color: 'purple' },
              { icon: CheckCircle, label: 'ATS Optimized', color: 'blue' },
              { icon: Layout, label: 'Pro Templates', color: 'purple' },
            ].map((chip, index) => {
              const Icon = chip.icon;
              const isPurple = chip.color === 'purple';
              return (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.015)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.015)',
                  }}
                >
                  <Icon
                    size={13}
                    className={isPurple ? 'text-purple-400' : 'text-blue-400'}
                  />
                  <span className="text-gray-300">{chip.label}</span>
                </div>
              );
            })}
          </div>

          {/* ✨ Feature Cards - Premium Glass */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full max-w-2xl animate-fade-up"
            style={{
              animationDelay: '400ms',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            {/* CV Builder Card */}
            <div
              className="group/card relative p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.015)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.015)',
                ...getParallaxStyle(0.012),
              }}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.03), transparent 70%)',
                }}
              />

              {/* Border gradient */}
              <div
                className="absolute inset-[-1px] rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.04), rgba(59, 130, 246, 0.02))',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  padding: '1px',
                }}
              />

              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.02))',
                      border: '1px solid rgba(139, 92, 246, 0.04)',
                    }}
                  >
                    <FileText size={19} className="text-purple-400" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-base sm:text-lg font-semibold tracking-wide">
                    CV Builder
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                    ATS Optimized Resume Builder
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Letter Card */}
            <div
              className="group/card relative p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.015)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.015)',
                ...getParallaxStyle(0.018),
              }}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.03), transparent 70%)',
                }}
              />

              {/* Border gradient */}
              <div
                className="absolute inset-[-1px] rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04), rgba(139, 92, 246, 0.02))',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  padding: '1px',
                }}
              />

              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.02))',
                      border: '1px solid rgba(59, 130, 246, 0.04)',
                    }}
                  >
                    <Mail size={19} className="text-blue-400" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-base sm:text-lg font-semibold tracking-wide">
                    Cover Letter
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                    AI-Powered Cover Letters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ✨ CTA Button */}
          <div
            className="relative group/btn w-full max-w-sm mt-1 sm:mt-2 animate-fade-up"
            style={{
              animationDelay: '500ms',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            {/* Button Glow */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 70%)',
                filter: 'blur(40px)',
                transform: 'scale(1.1)',
              }}
            />

            <button
              onClick={onGetStarted}
              className="relative w-full py-3.5 sm:py-4 px-6 sm:px-8 rounded-full text-white text-sm sm:text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 40%, #3b82f6 100%)',
                boxShadow: '0 4px 24px rgba(139, 92, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Ripple effect */}
              <span className="absolute inset-0 bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />

              <span className="relative flex items-center justify-center gap-2">
                <span>Start Your Career Journey</span>
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover/btn:translate-x-1"
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ✨ Custom Animations */}
      <style>{`
        /* Floating Stars Animation - Fixed: Smooth continuous motion with CSS variables */
        @keyframes floatStar {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translate3d(var(--x-distance, 15px), calc(var(--y-distance, -12px) * -1), 0) scale(1.1);
            opacity: 0.9;
          }
          50% {
            transform: translate3d(calc(var(--x-distance, -10px) * -1), var(--y-distance, 14px), 0) scale(0.9);
            opacity: 0.5;
          }
          75% {
            transform: translate3d(var(--x-distance, 12px), var(--y-distance, 10px), 0) scale(1.15);
            opacity: 0.85;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.4;
          }
        }

        .floating-star {
          animation: floatStar ease-in-out infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          pointer-events: none;
          position: absolute;
        }

        @keyframes glowPulse {
          0% {
            opacity: 0.3;
            transform: scale(1);
          }
          100% {
            opacity: 0.5;
            transform: scale(1.08);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Premium Scrollbar - Always visible with premium colors */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.5), rgba(99, 102, 241, 0.5), rgba(59, 130, 246, 0.5));
          border-radius: 10px;
          transition: background 0.3s ease;
          border: 1px solid rgba(139, 92, 246, 0.1);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.8), rgba(99, 102, 241, 0.8), rgba(59, 130, 246, 0.8));
          border: 1px solid rgba(139, 92, 246, 0.2);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
        }

        ::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.9), rgba(99, 102, 241, 0.9), rgba(59, 130, 246, 0.9));
        }

        /* Firefox Scrollbar - Always visible with premium colors */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.5) #0a0a0a;
        }

        /* For Firefox hover state */
        *:hover {
          scrollbar-color: rgba(139, 92, 246, 0.8) #0a0a0a;
        }

        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .animate-fade-up {
            opacity: 1 !important;
            transform: none !important;
          }
          .floating-star {
            animation: none !important;
            opacity: 0.5 !important;
          }
        }

        /* Mobile optimization */
        @media (max-width: 640px) {
          .animate-fade-up {
            animation-duration: 0.5s;
          }
        }
      `}</style>
    </div>
  );
}