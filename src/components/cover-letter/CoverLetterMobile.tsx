import React, { useState, useRef } from 'react';
import { Eye, Activity } from 'lucide-react';
import { CoverLetterProps } from './CoverLetter';

// Components to reuse
import CoverLetterProgress from './CoverLetterProgress';
import Step1Details from './steps/Step1Details';
import Step2Style from './steps/Step2Style';
import Step3Preview from './steps/Step3Preview';
import CoverLetterPreview from './CoverLetterPreview';
import CircularProgressRing from './components/CircularProgressRing';
import EmailPremiumPanel from './components/EmailPremiumPanel';
import CoverLetterEnhancer from './CoverLetterEnhancer';

type TabType = 'preview' | 'health';

interface CoverLetterMobileProps {
  // All props from CoverLetter
  step: number;
  setStep: (step: number) => void;
  generating: boolean;
  // ... all other props
}

const CoverLetterMobile: React.FC<CoverLetterMobileProps> = (props) => {
  const [activeTab, setActiveTab] = useState<TabType | null>(null);

  const tabs = [
    { id: 'preview' as TabType, label: 'Preview', icon: Eye },
    { id: 'health' as TabType, label: 'Health', icon: Activity },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (activeTab === tabId) {
      setActiveTab(null);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Content Area */}
      <div className="flex-1 overflow-auto p-3 pb-24">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Stepper */}
          <CoverLetterProgress 
            step={props.step} 
            jobTitle={props.jobTitle} 
            company={props.company} 
            selectedStyle={props.selectedStyle} 
          />

          {/* Step Content */}
          <div className="space-y-4">
            {props.step === 1 && (
              <Step1Details {...props.step1Props} />
            )}
            {props.step === 2 && (
              <Step2Style {...props.step2Props} />
            )}
            {props.step === 3 && (
              <Step3Preview {...props.step3Props} />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 gap-4">
            {props.step > 1 && (
              <button onClick={props.prevStep} className="px-4 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-white text-sm font-medium transition-all duration-300 hover:scale-105">
                ← Back
              </button>
            )}
            {props.step < 3 && (
              <button onClick={props.nextStep} className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 ml-auto">
                Next →
              </button>
            )}
          </div>

          {/* Tab Content - Only show when tab is active */}
          <div className="space-y-4 mt-4">
            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
                <CoverLetterPreview 
                  generatedLetter={props.generatedLetter} 
                  generating={props.generating} 
                />
              </div>
            )}

            {/* Health Tab */}
            {activeTab === 'health' && (
              <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="rounded-2xl p-5 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 shadow-xl">
                  <h3 className="text-xs font-semibold text-purple-400 mb-4 flex items-center gap-2">
                    <span className="text-sm">📊</span> Letter Health
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Health scores here */}
                    {/* Reuse CircularProgressRing components */}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Tabs - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-3 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterMobile;