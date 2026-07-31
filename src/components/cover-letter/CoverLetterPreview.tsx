import React from 'react';
import { Eye } from 'lucide-react';

interface CoverLetterPreviewProps {
  generatedLetter: string;
  generating: boolean;
  // ✅ ADD THESE PROPS
  profilePhoto?: string | null;
  userName?: string;
  jobTitle?: string;
  company?: string;
}

const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({ 
  generatedLetter, 
  generating,
  profilePhoto,
  userName,
  jobTitle,
  company
}) => {
  return (
    <div className="rounded-2xl p-5 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 shadow-xl h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
          <Eye size={14} /> Live Preview
        </h3>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Real-time
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-2xl shadow-purple-500/20 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-0.5">
          <div className="bg-white p-4 min-h-[350px] max-h-[450px] overflow-auto">
            {generating ? (
              <div className="flex items-center justify-center h-full min-h-[300px] text-center">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* ✅ Profile Photo */}
                {profilePhoto && (
                  <div className="flex justify-center">
                    <img 
                      src={profilePhoto} 
                      alt={userName || 'Profile'} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30 shadow-lg"
                    />
                  </div>
                )}
                {/* ✅ Name & Title */}
                {userName && (
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-800">{userName}</h3>
                    {jobTitle && <p className="text-sm text-gray-600">{jobTitle}</p>}
                    {company && <p className="text-xs text-gray-500">{company}</p>}
                  </div>
                )}
                {/* ✅ Letter Content */}
                <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-serif border-t border-gray-200 pt-3">
                  {generatedLetter || 'Your cover letter will appear here'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-3">
        <div className="flex gap-1">
          <div className="w-6 h-1 rounded-full bg-purple-500" />
          <div className="w-4 h-1 rounded-full bg-gray-700" />
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;