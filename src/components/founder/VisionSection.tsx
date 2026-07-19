// src/components/founder/VisionSection.tsx
import { Target, Rocket, Lightbulb } from "lucide-react";

export default function VisionSection() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-zinc-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Rocket size={24} className="text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Mission &amp; Vision</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Mission */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-purple-600/5 border border-purple-500/10">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Mission</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              To solve career challenges faced by students and freelancers by building an AI-powered platform 
              where anyone can create professional resumes, generate cover letters, prepare for interviews, 
              learn new skills, and connect with real freelance opportunities—all in one place.
            </p>
          </div>

          {/* Vision - ✅ Adin AI Logo instead of Sparkles */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/10">
            <div className="flex items-center gap-2 mb-3">
              <img 
                src="/icon-192x192.png" 
                alt="Adin AI Logo" 
                className="w-5 h-5 object-contain rounded"
              />
              <h3 className="text-sm font-semibold text-white">Vision</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              To transform Adin AI into a complete <span className="text-purple-400 font-medium">AI Career &amp; Freelancer Platform</span>. 
              A single intelligent ecosystem that helps users build resumes, create cover letters, prepare for 
              interviews, learn skills, discover jobs and scholarships, and connect with clients worldwide.
            </p>
          </div>
        </div>

        {/* Why Started */}
        <div className="mt-4 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Why Adin AI Started</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            I was inspired by the rapid growth of AI and wanted to use it for something practical that creates real value. 
            Instead of building just another chatbot, I built an AI platform that helps people improve their careers 
            and unlock new opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}