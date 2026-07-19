import React, { useMemo } from 'react';
import { TrendingUp, FileCheck, Mic, BookOpen } from 'lucide-react';

interface CoverLetterQualityPanelProps {
  generatedLetter: string;
}

const CoverLetterQualityPanel: React.FC<CoverLetterQualityPanelProps> = ({ generatedLetter }) => {
  if (!generatedLetter) return null;
  
  // ===== FIXED: Dynamic score calculation based on letter content =====
  const scores = useMemo(() => {
    const letter = generatedLetter || '';
    const wordCount = letter.split(/\s+/).filter(w => w.length > 0).length;
    
    // 1. Professional Score - based on word count and formal language
    let professionalScore = 75;
    if (wordCount > 200) professionalScore += 10;
    if (wordCount > 250) professionalScore += 5;
    if (letter.includes('professional') || letter.includes('expertise')) professionalScore += 5;
    if (letter.includes('results') || letter.includes('achievements')) professionalScore += 5;
    professionalScore = Math.min(professionalScore, 98);
    
    // 2. ATS Readiness - based on keywords and structure
    let atsScore = 70;
    const atsKeywords = ['experience', 'skills', 'project', 'team', 'lead', 'develop', 'manage', 'create', 'solution', 'results'];
    atsKeywords.forEach(keyword => {
      if (letter.toLowerCase().includes(keyword)) atsScore += 3;
    });
    if (wordCount > 200) atsScore += 5;
    if (letter.includes('Python') || letter.includes('JavaScript') || letter.includes('React')) atsScore += 5;
    atsScore = Math.min(atsScore, 98);
    
    // 3. Tone Analysis - based on language style
    let toneScore = 80;
    if (letter.includes('excited') || letter.includes('passionate')) toneScore += 5;
    if (letter.includes('confident') || letter.includes('proven')) toneScore += 5;
    if (letter.includes('thank you') || letter.includes('appreciate')) toneScore += 5;
    if (letter.includes('!')) toneScore -= 5;
    toneScore = Math.min(Math.max(toneScore, 60), 98);
    
    // 4. Readability - based on sentence length and structure
    let readabilityScore = 75;
    const sentences = letter.split(/[.!?]\s+/);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    if (avgSentenceLength > 10 && avgSentenceLength < 20) readabilityScore += 10;
    else if (avgSentenceLength > 20) readabilityScore -= 5;
    if (wordCount > 150) readabilityScore += 5;
    if (letter.includes('.\n') || letter.includes('\n\n')) readabilityScore += 5;
    readabilityScore = Math.min(Math.max(readabilityScore, 60), 98);
    
    // Calculate overall quality (average of all scores)
    const overallQuality = Math.round((professionalScore + atsScore + toneScore + readabilityScore) / 4);
    
    return {
      professional: professionalScore,
      ats: atsScore,
      tone: toneScore,
      readability: readabilityScore,
      overall: overallQuality
    };
  }, [generatedLetter]);

  const scoreItems = [
    { name: 'Professional Score', value: scores.professional, icon: <TrendingUp size={14} />, color: 'text-purple-400', gradient: 'from-purple-500 to-purple-400' },
    { name: 'ATS Readiness', value: scores.ats, icon: <FileCheck size={14} />, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-400' },
    { name: 'Tone Analysis', value: scores.tone, icon: <Mic size={14} />, color: 'text-green-400', gradient: 'from-green-500 to-emerald-400' },
    { name: 'Readability', value: scores.readability, icon: <BookOpen size={14} />, color: 'text-yellow-400', gradient: 'from-yellow-500 to-amber-400' },
  ];
  
  return (
    <div className="rounded-2xl p-5 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 shadow-xl">
      <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center gap-2">
        <TrendingUp size={14} /> AI Quality Analysis
      </h3>
      
      <div className="space-y-4">
        {scoreItems.map((score, idx) => (
          <div key={idx}>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className={score.color}>{score.icon}</div>
                <span className="text-xs text-gray-400">{score.name}</span>
              </div>
              <span className={`text-xs font-semibold ${score.color}`}>{score.value}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${score.gradient}`} 
                style={{ width: `${score.value}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-purple-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Overall Quality</span>
          <span className="text-sm font-bold text-white">{scores.overall}<span className="text-xs text-purple-400">/100</span></span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-700" 
            style={{ width: `${scores.overall}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

export default CoverLetterQualityPanel;