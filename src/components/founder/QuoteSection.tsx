// src/components/founder/QuoteSection.tsx
import { Quote } from "lucide-react";

export default function QuoteSection() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-slate-200 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
          <Quote size={36} className="text-purple-600 mx-auto mb-4 opacity-70" />
          <blockquote className="text-xl sm:text-2xl font-semibold text-slate-900 leading-relaxed">
            "Instead of building just another chatbot, I wanted to build an AI platform that helps
            people improve their careers and unlock new opportunities."
          </blockquote>
          <div className="mt-4">
            <p className="text-purple-700 font-semibold">— Kian Mercer</p>
            <p className="text-xs text-slate-500 mt-0.5">Founder &amp; CEO, Adin AI</p>
          </div>
        </div>
      </div>
    </section>
  );
}
