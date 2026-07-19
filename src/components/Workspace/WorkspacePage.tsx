import React, { useState } from 'react';
import {
  FileText,
  Mail,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  User,
  Sparkles
} from 'lucide-react';

interface WorkspacePageProps {
  onNavigate: (page: string) => void;
  userId?: string;
}

const WorkspacePage: React.FC<WorkspacePageProps> = ({ onNavigate }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    { icon: CheckCircle, title: 'ATS Optimized', desc: 'Built to pass ATS systems and get you noticed.' },
    { icon: CheckCircle, title: 'AI Powered', desc: 'Advanced AI creates content that stands out.' },
    { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and always protected.' },
    { icon: Clock, title: 'Save Time', desc: 'Create professional documents in minutes, not hours.' }
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-[#040816] text-white overflow-y-auto">
      <div className="absolute left-[-220px] top-40 h-[550px] w-[550px] rounded-full bg-purple-700/20 blur-[160px]" />
      <div className="absolute right-[-220px] top-40 h-[550px] w-[550px] rounded-full bg-blue-700/20 blur-[160px]" />

      <div className="relative flex-1 max-w-[850px] mx-auto px-6 py-8 w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-purple-400/70 bg-purple-900/80 backdrop-blur-sm shadow-lg shadow-purple-500/20 mb-4">
            <span className="text-sm font-semibold text-white tracking-wide">AI-Powered Creation Suite</span>
          </div>

          <h1 className="text-2xl md:text-2.5xl lg:text-3xl font-black leading-tight mb-3">
            Welcome to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Adin AI</span>
          </h1>

          <p className="text-xl text-gray-100">Your AI-Powered Career Assistant</p>
          <p className="text-base text-gray-200 mt-3">
            Create professional resumes and cover letters with the power of AI.
          </p>
          <p className="text-gray-300 mt-1 text-sm">
            ATS-optimized • Professional • Job-winning
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              id: 'cv',
              title: 'CV Builder',
              subtitle: 'Professional ATS Resume',
              badge: 'ATS Optimized',
              route: 'cv-builder',
              icon: <FileText />,
              colors: 'from-purple-600 to-blue-500',
              border: 'border-purple-500/30',
              bullets: [
                'ATS-Optimized Templates',
                'Real-time Content Suggestions',
                'Professional Formatting',
                'Export in PDF Format'
              ]
            },
            {
              id: 'cover',
              title: 'Cover Letter',
              subtitle: 'AI Generated Cover Letter',
              badge: 'AI Powered',
              route: 'cover-letter',
              icon: <Mail />,
              colors: 'from-blue-500 to-cyan-500',
              border: 'border-blue-500/30',
              bullets: [
                'Job Specific & Personalized',
                'AI-Powered Content Generation',
                'Multiple Professional Templates',
                'Export in PDF Format'
              ]
            }
          ].map((card) => (
            <div
              key={card.id}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onNavigate(card.route)}
              className="cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <div className={`min-h-[210px] rounded-3xl ${card.border} border bg-black/40 backdrop-blur-xl p-4 transition-all duration-300 hover:border-purple-400/50`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.colors} flex items-center justify-center`}>
                    {card.icon}
                  </div>

                  <div className="px-3 py-1 rounded-full text-xs bg-white/20 text-white font-medium">
                    {card.badge}
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold mb-2">{card.title}</h2>
                <p className="text-lg text-gray-200 mb-4">{card.subtitle}</p>

                <div className="space-y-2 text-base text-gray-100 mb-4">
                  {card.bullets.map((b) => (
                    <div key={b}>✓ {b}</div>
                  ))}
                </div>

                <button className={`w-full h-7 rounded-xl bg-gradient-to-r ${card.colors} text-base font-semibold flex items-center justify-center gap-2`}>
                  Open {card.title}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Founder Profile Section - WITH PNG IMAGE */}
        <div className="mt-6">
          <div
            onClick={() => {
              window.location.hash = 'founder';
              window.location.reload();
            }}
            className="cursor-pointer rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20"
          >
            <div className="flex items-center gap-4">
              {/* ✅ Founder Image - PNG */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-black overflow-hidden">
                  <img
                    src="/kian-mercer-profile.png"
                    alt="Kian Mercer, Founder of Adin AI"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white truncate">Meet the Founder</h3>
                <p className="text-xs text-gray-300 truncate">Kian Mercer - 16-year-old AI product builder from Pakistan</p>
              </div>
              <button className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity flex-shrink-0">
                View Profile
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/5">
              <f.icon className="mb-2 text-purple-400" size={18} />
              <h4 className="font-bold text-base mb-1">{f.title}</h4>
              <p className="text-gray-300 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-purple-200 italic text-sm">
            "Professional documents that open doors to your dream career"
          </p>
        </div>
      </div>

      <div className="text-center py-4 border-t border-white/5">
        <p className="text-gray-400 text-xs">© 2026 Adin AI. All rights reserved.</p>
      </div>
    </div>
  );
};

export default WorkspacePage;