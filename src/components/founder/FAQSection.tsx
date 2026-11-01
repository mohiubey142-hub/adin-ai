// src/components/founder/FAQSection.tsx
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What inspired you to start Adin AI?",
      answer: "I was inspired by the rapid growth of AI and wanted to use it for something practical that creates real value. Instead of building just another chatbot, I built an AI platform that helps people improve their careers and unlock new opportunities. I saw how students and job seekers struggled with creating professional resumes and cover letters, and I knew AI could solve this problem."
    },
    {
      question: "How old are you and how did you start building AI products?",
      answer: "I'm 17 years old from Pakistan. I started exploring AI tools and realized I could combine them with product strategy to build real solutions. I use AI-assisted development to design, plan, and build websites, digital products, and business solutions. Adin AI is my first major product."
    },
    {
      question: "What is Adin AI and who is it for?",
      answer: "Adin AI is an AI-powered career platform that helps students and job seekers build professional resumes and generate cover letters, with an AI career assistant to support them. I'm also working toward career guidance and interview preparation for students. It's designed for anyone who wants to grow their career, especially students and job seekers who need affordable, professional tools."
    },
    {
      question: "What are your future plans for Adin AI?",
      answer: "My long-term vision is to grow Adin AI into an AI Career Companion for Students. Starting with resumes and cover letters, I want it to help students figure out what to study, prepare for interviews, and take their first career steps, especially those who have no one to guide them."
    },
    {
      question: "Is Adin AI really free?",
      answer: "Yes. Adin AI is 100% free today: no credit card, no hidden charges and no premium tiers. We intend to keep the core features free. If we ever add optional paid features, we will announce them in advance and existing free features will stay free."
    },
    {
      question: "Where is my data stored?",
      answer: "Your documents are saved in your browser and automatically synced over HTTPS to a private cloud database (a Google Sheet), so you can restore them on another device with your User ID and PIN. We never sell your data. You can read the details in our Privacy Policy."
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
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-t border-slate-200 bg-white">
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
            <HelpCircle size={12} />
            FAQ
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Frequently asked <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:border-purple-200 hover:shadow-md">
              <button
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-purple-50/50 transition-colors duration-200"
              >
                <span className="text-sm font-semibold text-slate-900 pr-4">{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-purple-600 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-5 pb-5 pt-1">
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
