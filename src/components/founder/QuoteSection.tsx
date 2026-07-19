// src/components/founder/QuoteSection.tsx
import { Quote } from "lucide-react";

export default function QuoteSection() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-zinc-900/50">
      <div className="max-w-3xl mx-auto text-center">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <Quote size={36} className="text-purple-400 mx-auto mb-4 opacity-60" />
          <blockquote className="text-xl sm:text-2xl font-medium text-white leading-relaxed">
            "Instead of building just another chatbot, I wanted to build an AI platform that helps 
            people improve their careers and unlock new opportunities."
          </blockquote>
          <div className="mt-4">
            <p className="text-purple-400 font-medium">— Kian Mercer</p>
            <p className="text-xs text-gray-500">Founder &amp; CEO, Adin AI</p>
          </div>
        </div>
      </div>
    </section>
  );
}