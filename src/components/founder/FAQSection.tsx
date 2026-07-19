// src/components/founder/FAQSection.tsx
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What inspired you to start Adin AI?",
      answer: "I was inspired by the rapid growth of AI and wanted to use it for something practical that creates real value. Instead of building just another chatbot, I built an AI platform that helps people improve their careers and unlock new opportunities. I saw how students and freelancers struggled with creating professional resumes and cover letters, and I knew AI could solve this problem."
    },
    {
      question: "How old are you and how did you start building AI products?",
      answer: "I'm 16 years old (17 in progress) from Mananwala, Sheikhupura, Pakistan. I started exploring AI tools and realized I could combine them with product strategy to build real solutions. I use AI-assisted development to design, plan, and build websites, digital products, and business solutions. Adin AI is my first major product."
    },
    {
      question: "What is Adin AI and who is it for?",
      answer: "Adin AI is an AI-powered career platform that helps students and freelancers build professional resumes, generate cover letters, prepare for interviews, learn new skills, and connect with freelance opportunities. It's designed for anyone who wants to grow their career, especially students and freelancers who need affordable, professional tools."
    },
    {
      question: "What are your future plans for Adin AI?",
      answer: "My long-term vision is to transform Adin AI into a complete AI Career & Freelancer Platform. A single intelligent ecosystem that helps users build resumes, create cover letters, prepare for interviews, learn skills, discover jobs and scholarships, and eventually connect with clients worldwide."
    },
    {
      question: "How do you build products without being a traditional software engineer?",
      answer: "I specialize in AI Product Development by combining modern AI tools with product strategy. While I am not a traditional software engineer, I use AI-assisted development to design, plan, and build websites, digital products, content, and business solutions. I focus on product vision, strategy, and leveraging AI tools like ChatGPT, Claude, and Gemini to bring ideas to life."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-zinc-900/50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle size={24} className="text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-purple-500/10 bg-zinc-900/20 overflow-hidden transition-all duration-300 hover:border-purple-500/20"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-purple-500/5 transition-colors duration-200"
              >
                <span className="text-sm font-medium text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-purple-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-5 pt-1">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}