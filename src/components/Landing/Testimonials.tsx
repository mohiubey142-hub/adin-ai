// src/components/Landing/Testimonials.tsx
import React from 'react';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Priya S.',
    role: 'Software Engineer',
    stars: 5,
    text: "Honestly, I thought my CV was fine. But I wasn't getting shortlisted. I used Adin AI, and it fixed my formatting and added a professional summary. Got a call within a week!"
  },
  {
    id: 2,
    name: 'Marcus T.',
    role: 'Marketing Coordinator',
    stars: 5,
    text: "I was moving out of retail into marketing and my old CV didn't translate well. The AI cover letter tool was a lifesaver. It highlighted my transferable skills perfectly."
  },
  {
    id: 3,
    name: 'Ahmed R.',
    role: 'Fresh Graduate',
    stars: 5,
    text: "As a fresher, I had no idea how to write a CV. Adin AI's templates made it look like I had years of experience. 100% free and no signup was the best part."
  },
  {
    id: 4,
    name: 'Sara K.',
    role: 'Graphic Designer',
    stars: 5,
    // ✅ FIXED: Removed ATS Score claim, replaced with AI & PDF features
    text: "The templates are beautiful and very modern. I generated a professional cover letter in seconds using AI. Downloading in PDF format was instant and super easy!"
  }
];

export default function Testimonials() {
  return (
    <section className="relative z-10 bg-white/60 backdrop-blur-sm border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
            <Star size={12} className="fill-purple-600" />
            Testimonials
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Loved by Job Seekers
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">4.9 out of 5</span>
            <span className="text-sm text-slate-500">based on user feedback</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col"
            >
              <Quote size={32} className="absolute top-6 right-6 text-slate-100" strokeWidth={1.5} />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.stars ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-100'}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1 relative z-10">
                "{review.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{review.name}</h4>
                  <p className="text-xs text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}