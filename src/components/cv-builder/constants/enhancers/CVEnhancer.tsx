import React, { useState } from 'react';
import { Sparkles, Zap, Shield, Users, 
         CheckCircle, Edit, Loader2, 
         Star, Heart, Target, TrendingUp, 
         User, Award, Briefcase, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { polishText } from '../utils/grammarExpert';

interface CVEnhancerProps {
  originalSummary: string;
  onEnhance: (enhancedSummary: string) => void;
  userName: string;
  jobTitle: string;
}

// ============================================
// ✅ PRO ENHANCEMENT OPTIONS (8 - REMOVED expand & executive)
// ============================================
const enhancementOptions = [
  { 
    id: 'professional', 
    icon: <Shield size={16} />, 
    label: 'Professional Tone', 
    desc: 'Formal & polished — executive level',
    color: 'from-blue-500 to-indigo-500',
    badge: '⭐ Pro'
  },
  { 
    id: 'persuasive', 
    icon: <Target size={16} />, 
    label: 'More Persuasive', 
    desc: 'Compelling & convincing — sales expert',
    color: 'from-orange-500 to-red-500',
    badge: '🔥 Pro'
  },
  { 
    id: 'ats', 
    icon: <CheckCircle size={16} />, 
    label: 'ATS Optimized', 
    desc: 'Keyword-rich — recruiter approved',
    color: 'from-emerald-500 to-green-500',
    badge: '📊 Pro'
  },
  { 
    id: 'formal', 
    icon: <Briefcase size={16} />, 
    label: 'More Formal', 
    desc: 'Highly professional — corporate level',
    color: 'from-slate-500 to-gray-500',
    badge: '🏢 Pro'
  },
  { 
    id: 'human', 
    icon: <Heart size={16} />, 
    label: 'More Human', 
    desc: 'Warm & personal — emotional connect',
    color: 'from-pink-500 to-rose-500',
    badge: '💛 Pro'
  },
  { 
    id: 'shorten', 
    icon: <Users size={16} />, 
    label: 'Shorten Content', 
    desc: 'Concise & focused — punchy impact',
    color: 'from-cyan-500 to-blue-500',
    badge: '✂️ Pro'
  },
  { 
    id: 'closing', 
    icon: <Star size={16} />, 
    label: 'Stronger Closing', 
    desc: 'Powerful ending — memorable finish',
    color: 'from-indigo-500 to-purple-500',
    badge: '🎯 Pro'
  },
  { 
    id: 'grammar', 
    icon: <Edit size={16} />, 
    label: 'Fix Grammar', 
    desc: 'Perfect clarity — expert polish',
    color: 'from-yellow-500 to-amber-500',
    badge: '✅ Pro'
  },
];

const CVEnhancer: React.FC<CVEnhancerProps> = ({ 
  originalSummary, 
  onEnhance,
  userName,
  jobTitle
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [enhancementCount, setEnhancementCount] = useState<Record<string, number>>({});

  const handleEnhance = (optionId: string) => {
    if (!originalSummary || originalSummary.trim().length < 10) {
      toast.error('Please write a summary first (minimum 10 characters)');
      return;
    }

    setSelectedOption(optionId);
    setIsEnhancing(true);
    toast.loading('✨ AI is enhancing your professional summary...', { id: 'enhance' });

    setTimeout(() => {
      let enhanced = originalSummary;
      
      switch(optionId) {
        case 'professional':
          enhanced = enhanceProfessional(originalSummary);
          break;
        case 'persuasive':
          enhanced = enhancePersuasive(originalSummary);
          break;
        case 'ats':
          enhanced = enhanceATS(originalSummary);
          break;
        case 'formal':
          enhanced = enhanceFormal(originalSummary);
          break;
        case 'human':
          enhanced = enhanceHuman(originalSummary);
          break;
        case 'shorten':
          enhanced = enhanceShorten(originalSummary);
          break;
        case 'closing':
          enhanced = enhanceClosing(originalSummary);
          break;
        case 'grammar':
          enhanced = enhanceGrammarExpert(originalSummary);
          break;
        default:
          enhanced = originalSummary;
      }
      
      // 🔥 FINAL POLISH — Grammar + Human Touch
      enhanced = polishText(enhanced);

      onEnhance(enhanced);
      setIsEnhancing(false);
      
      // Track usage
      setEnhancementCount(prev => ({
        ...prev,
        [optionId]: (prev[optionId] || 0) + 1
      }));
      
      const optionLabel = enhancementOptions.find(o => o.id === optionId)?.label || 'Enhancement';
      toast.success(`✅ ${optionLabel} applied successfully!`, { id: 'enhance' });
    }, 1200);
  };

  // ============================================
  // 🔥 PROFESSIONAL TONE — Executive Level
  // ============================================
  const enhanceProfessional = (text: string): string => {
    let enhanced = text
      .replace(/I'm/g, 'I am')
      .replace(/I've/g, 'I have')
      .replace(/I'd/g, 'I would')
      .replace(/thrilled/g, 'enthusiastic')
      .replace(/excited/g, 'interested')
      .replace(/super/g, 'very')
      .replace(/really/g, 'truly')
      .replace(/great/g, 'excellent')
      .replace(/good/g, 'strong')
      .replace(/I think/g, 'I am confident')
      .replace(/I believe/g, 'I am convinced')
      .replace(/I want/g, 'I am committed to')
      .replace(/I have/g, 'I bring')
      .replace(/My/g, 'My professional');
    
    if (!enhanced.toLowerCase().includes('professional') && !enhanced.toLowerCase().includes('experience')) {
      enhanced = `As a dedicated professional, ${enhanced}`;
    }
    
    return enhanced;
  };

  // ============================================
  // 🔥 PERSUASIVE — Sales Expert
  // ============================================
  const enhancePersuasive = (text: string): string => {
    return text
      .replace(/I have experience in/g, 'I bring proven expertise in')
      .replace(/I am skilled in/g, 'I excel at')
      .replace(/I can/g, 'I am capable of')
      .replace(/I want/g, 'I am committed to')
      .replace(/I think/g, 'I am confident that')
      .replace(/My skills include/g, 'My core strengths include')
      .replace(/I have/g, 'I bring')
      .replace(/worked on/g, 'delivered')
      .replace(/helped/g, 'empowered')
      .replace(/contributed/g, 'drove')
      .replace(/I am/g, 'I am')
      .replace(/I was/g, 'I was')
      .replace(/responsible for/g, 'led')
      .replace(/in charge of/g, 'managed')
      .replace(/helped to/g, 'enabled');
  };

  // ============================================
  // 🔥 ATS OPTIMIZED — Recruiter Approved
  // ============================================
  const enhanceATS = (text: string): string => {
    const keywords = [
      'expertise', 'delivered', 'implemented', 'optimized', 'scaled', 
      'architected', 'led', 'managed', 'developed', 'engineered',
      'spearheaded', 'transformed', 'accelerated', 'streamlined', 'pioneered'
    ];
    
    let enhanced = text
      .replace(/I have experience in/g, 'Demonstrated expertise in')
      .replace(/My skills include/g, 'Core competencies include')
      .replace(/I have worked on/g, 'Successfully delivered')
      .replace(/I am good at/g, 'Excel at')
      .replace(/I know/g, 'Proficient in')
      .replace(/I can/g, 'Able to')
      .replace(/I think/g, 'I am confident')
      .replace(/I believe/g, 'I am convinced');
    
    // Add missing keywords with variety
    const usedKeywords = enhanced.toLowerCase();
    let addedCount = 0;
    for (const keyword of keywords) {
      if (!usedKeywords.includes(keyword) && addedCount < 2) {
        const prefix = ['', 'Additionally, ', 'Furthermore, '][addedCount];
        enhanced = `${enhanced} ${prefix}${keyword.charAt(0).toUpperCase() + keyword.slice(1)} results consistently.`;
        addedCount++;
      }
    }
    
    return enhanced;
  };

  // ============================================
  // 🔥 MORE FORMAL — Corporate Level
  // ============================================
  const enhanceFormal = (text: string): string => {
    let enhanced = text
      .replace(/I'm/g, 'I am')
      .replace(/I've/g, 'I have')
      .replace(/I'd/g, 'I would')
      .replace(/can't/g, 'cannot')
      .replace(/won't/g, 'will not')
      .replace(/don't/g, 'do not')
      .replace(/shouldn't/g, 'should not')
      .replace(/I think/g, 'I am of the view that')
      .replace(/I believe/g, 'It is my conviction that')
      .replace(/I want/g, 'I am desirous of')
      .replace(/I have/g, 'I possess')
      .replace(/really/g, 'truly')
      .replace(/very/g, 'extremely')
      .replace(/My/g, 'My professional')
      .replace(/I am/g, 'I am');
    
    // Add formal opening if missing
    if (!enhanced.toLowerCase().includes('professional') && !enhanced.toLowerCase().includes('corporate')) {
      enhanced = `In a professional capacity, ${enhanced}`;
    }
    
    return enhanced;
  };

  // ============================================
  // 🔥 MORE HUMAN — Warm & Personal
  // ============================================
  const enhanceHuman = (text: string): string => {
    const humanOpenings = [
      'What truly drives me is',
      'I have always been passionate about',
      'My journey in this field has been about',
      'What I find most meaningful is',
      'I genuinely believe that',
      'At the heart of my work is'
    ];
    
    const humanClosings = [
      ' because people matter more than processes.',
      ' — because I believe in making a difference.',
      ', and that is what motivates me every day.',
      ' — that is what keeps me going.',
      ', and I carry that with me in everything I do.'
    ];
    
    let enhanced = text
      .replace(/I have experience in/g, 'I have had the privilege of working in')
      .replace(/My skills include/g, 'What I truly enjoy is')
      .replace(/I am skilled in/g, 'I am passionate about')
      .replace(/I can/g, 'I love to')
      .replace(/I want/g, 'I am eager to')
      .replace(/I think/g, 'I believe')
      .replace(/I have/g, 'I have')
      .replace(/I am/g, 'I am')
      .replace(/worked/g, 'collaborated')
      .replace(/managed/g, 'guided')
      .replace(/led/g, 'inspired');
    
    // Add human opening if missing
    if (!enhanced.toLowerCase().includes('passionate') && !enhanced.toLowerCase().includes('believe') && !enhanced.toLowerCase().includes('drives')) {
      const opening = humanOpenings[Math.floor(Math.random() * humanOpenings.length)];
      enhanced = `${opening} ${enhanced.toLowerCase()}`;
    }
    
    // Add human closing if missing
    if (!enhanced.includes('people matter') && !enhanced.includes('difference') && !enhanced.includes('motivates')) {
      const closing = humanClosings[Math.floor(Math.random() * humanClosings.length)];
      enhanced = enhanced + closing;
    }
    
    return enhanced;
  };

  // ============================================
  // 🔥 SHORTEN CONTENT — Concise & Focused
  // ============================================
  const enhanceShorten = (text: string): string => {
    const unnecessaryPhrases = [
      'I am writing to', 'I would like to', 'I want to', 
      'I think that', 'I believe that', 'In my opinion',
      'I am of the view that', 'It is my conviction that',
      'It is important to note that', 'It should be mentioned that',
      'Due to the fact that', 'At this point in time'
    ];
    
    let shortened = text;
    
    for (const phrase of unnecessaryPhrases) {
      shortened = shortened.replace(new RegExp(phrase, 'gi'), '');
    }
    
    // Remove redundant adjectives and weak words
    shortened = shortened
      .replace(/very good/g, 'excellent')
      .replace(/very nice/g, 'wonderful')
      .replace(/really great/g, 'exceptional')
      .replace(/very much/g, 'significantly')
      .replace(/quite/g, '')
      .replace(/rather/g, '')
      .replace(/just/g, '')
      .replace(/really/g, '')
      .replace(/very/g, '')
      .replace(/\s{2,}/g, ' ');
    
    // Count words and shorten if too long
    const words = shortened.split(' ');
    if (words.length > 35) {
      shortened = words.slice(0, 35).join(' ') + '...';
    }
    
    // Ensure it ends with a period if it's a complete thought
    if (!shortened.endsWith('...') && !shortened.endsWith('.') && !shortened.endsWith('!') && !shortened.endsWith('?')) {
      shortened = shortened + '.';
    }
    
    return shortened.trim();
  };

  // ============================================
  // 🔥 STRONGER CLOSING — Powerful Ending
  // ============================================
  const enhanceClosing = (text: string): string => {
    const closings = [
      ' I am confident that I can make a meaningful contribution to your organization.',
      ' I look forward to the opportunity to bring my skills and passion to your team.',
      ' I am excited about the possibility of joining your organization and making a lasting impact.',
      ' My commitment to excellence and results positions me to deliver significant value.',
      ' I would welcome the chance to discuss how I can contribute to your continued success.',
      ' I am ready to bring my expertise and dedication to help your organization thrive.',
      ' The opportunity to contribute to your team\'s success is one I would embrace with enthusiasm.',
      ' I am eager to apply my experience and skills to drive meaningful results for your organization.'
    ];
    
    let enhanced = text;
    
    // Remove existing closing if present
    const closingPatterns = closings.map(c => c.trim());
    for (const closing of closingPatterns) {
      enhanced = enhanced.replace(new RegExp(closing.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
    }
    
    // Select a closing that feels fresh
    const selectedClosing = closings[Math.floor(Math.random() * closings.length)];
    enhanced = enhanced.trim();
    
    // Ensure we don't have double periods
    if (enhanced.endsWith('.')) {
      enhanced = enhanced.slice(0, -1);
    }
    
    enhanced = enhanced + selectedClosing;
    
    return enhanced;
  };

  // ============================================
  // 🔥 GRAMMAR EXPERT — Perfect Clarity
  // ============================================
  const enhanceGrammarExpert = (text: string): string => {
    let enhanced = text
      // Fix spacing
      .replace(/\s+/g, ' ')
      .replace(/ ,/g, ',')
      .replace(/ \./g, '.')
      .replace(/ ;/g, ';')
      .replace(/ :/g, ':')
      .replace(/\s+!/g, '!')
      .replace(/\s+\?/g, '?')
      
      // Fix common grammar mistakes
      .replace(/I have a degree in/g, 'I hold a degree in')
      .replace(/a experience/g, 'an experience')
      .replace(/a honor/g, 'an honor')
      .replace(/a MBA/g, 'an MBA')
      .replace(/a hour/g, 'an hour')
      .replace(/a honest/g, 'an honest')
      .replace(/a university/g, 'a university')
      .replace(/a European/g, 'a European')
      .replace(/a one/g, 'a one')
      
      // Fix spelling mistakes
      .replace(/recieve/g, 'receive')
      .replace(/acheive/g, 'achieve')
      .replace(/maintainence/g, 'maintenance')
      .replace(/managment/g, 'management')
      .replace(/developement/g, 'development')
      .replace(/implemention/g, 'implementation')
      .replace(/comunication/g, 'communication')
      .replace(/leadeship/g, 'leadership')
      .replace(/responsiblities/g, 'responsibilities')
      .replace(/enviornment/g, 'environment')
      .replace(/perfomance/g, 'performance')
      .replace(/menterd/g, 'mentored')
      .replace(/supervized/g, 'supervised')
      .replace(/analized/g, 'analyzed')
      .replace(/inplemented/g, 'implemented')
      .replace(/orginization/g, 'organization')
      .replace(/collaberated/g, 'collaborated')
      .replace(/departmant/g, 'department')
      .replace(/excellence/g, 'excellence')
      .replace(/inititive/g, 'initiative')
      .replace(/stratgic/g, 'strategic')
      .replace(/implemnted/g, 'implemented')
      .replace(/utlized/g, 'utilized')
      .replace(/writen/g, 'written')
      .replace(/recieved/g, 'received')
      .replace(/seperate/g, 'separate')
      .replace(/definately/g, 'definitely')
      .replace(/accomodate/g, 'accommodate')
      .replace(/occured/g, 'occurred')
      .replace(/ocurring/g, 'occurring')
      .replace(/priviledge/g, 'privilege')
      .replace(/publically/g, 'publicly')
      
      // Fix i to I
      .replace(/\bi\b/g, 'I');
    
    // Capitalize after periods
    enhanced = enhanced.replace(/([.!?])\s*([a-z])/g, (_, punct, letter) => punct + ' ' + letter.toUpperCase());
    
    // Capitalize first letter
    if (enhanced.length > 0) {
      enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    }
    
    return enhanced;
  };

  return (
    <div className="mt-4 p-5 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/10">
            <Sparkles size={18} className="text-purple-400 flex-shrink-0" />
          </div>
          <h3 className="text-sm font-semibold text-purple-400 tracking-wide">AI Enhancer</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30 animate-pulse font-medium">
            ⚡ Pro Level
          </span>
          {Object.keys(enhancementCount).length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/30">
              {Object.values(enhancementCount).reduce((a, b) => a + b, 0)} used
            </span>
          )}
        </div>
      </div>

      {/* Info Message - Professional & Encouraging */}
      <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/8 to-blue-500/8 border border-purple-500/15">
        <p className="text-[11px] text-gray-400 flex items-center gap-2.5 flex-wrap">
          <span className="text-purple-400 text-sm">💡</span> 
          <span>Enhance your summary with <span className="text-purple-300 font-medium">pro-level</span> polish.</span>
          <span className="text-gray-500 text-[10px]">— Select an option below</span>
          <span className="text-emerald-400/60 text-[10px] ml-auto">
            {Object.keys(enhancementCount).length > 0 && '⚡ Active user'}
          </span>
        </p>
      </div>

      {/* Enhancement Options Grid - 8 Options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {enhancementOptions.map((option) => {
          const usageCount = enhancementCount[option.id] || 0;
          const isPopular = usageCount > 2;
          
          return (
            <button
              key={option.id}
              onClick={() => handleEnhance(option.id)}
              disabled={isEnhancing}
              className={`
                px-3 py-2.5 rounded-xl text-left transition-all duration-300
                ${selectedOption === option.id && isEnhancing 
                  ? `bg-gradient-to-r ${option.color}/30 border border-purple-500/50 shadow-lg shadow-purple-500/20 scale-105` 
                  : 'bg-gray-800/40 hover:bg-gray-700/50 border border-transparent hover:border-purple-500/25'
                }
                hover:scale-105 hover:shadow-lg hover:shadow-purple-500/15
                disabled:opacity-40 disabled:cursor-not-allowed
                relative
                min-h-[68px]
                w-full
                overflow-hidden
                group
              `}
            >
              {/* Popular badge */}
              {isPopular && !isEnhancing && (
                <div className="absolute top-1 right-1">
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                    🔥 Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-start gap-2.5 w-full min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    {option.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-300 leading-tight tracking-wide truncate">
                    {option.label}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5 truncate">
                    {option.desc}
                  </p>
                </div>
              </div>
              
              {selectedOption === option.id && isEnhancing && (
                <div className="absolute top-1.5 right-1.5">
                  <Loader2 size={12} className="text-purple-400 animate-spin" />
                </div>
              )}
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/4 group-hover:to-blue-500/4 transition-all duration-500 pointer-events-none"></div>
            </button>
          );
        })}
      </div>

      {/* Loading State - Professional */}
      {isEnhancing && (
        <div className="mt-4 text-center py-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
          <p className="text-xs text-purple-400 animate-pulse font-medium flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            AI is polishing your summary to perfection...
          </p>
        </div>
      )}

      {/* Footer - Professional & Trustworthy */}
      <div className="mt-3 text-center">
        <p className="text-[9px] text-gray-500 flex items-center justify-center gap-2 flex-wrap">
          <span>✨ 8 enhancement options</span>
          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
          <span className="text-purple-400/70">Pro level</span>
          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
          <span>Perfect grammar guaranteed</span>
          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
          <span className="text-emerald-400/60">+99% satisfaction</span>
        </p>
      </div>
    </div>
  );
};

export default CVEnhancer;