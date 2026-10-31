// src/pages/Contact.tsx
// ✅ LIGHT THEME — matches landing page UI
// ✅ Gray scrollbar (no purple/black)
// ✅ FIX: Back button — close tab FIRST, then history.back()
// ✅ FIX: Privacy + Terms links → path-based, new tab
// ✅ Purple + blue accents
// ✅ Contact form → backend proxy /api/sync (action: submit_contact)

import { useState } from "react";
import { SEOHead } from "../components/SEO/SEOHead";
import { getSEOConfig } from "../utils/seoPages";
import { cameFromApp } from "../utils/inAppNav";
import HomeLink from "../components/HomeLink";
import {
  ArrowLeft, Mail, MapPin, MessageSquare, Send, User, Clock,
  Shield, FileText, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { postToSyncProxy } from "../services/sync/proxyClient";

interface ContactProps {
  onBack?: () => void;
}

export default function Contact({ onBack }: ContactProps) {
  // ✅ Back sirf tab jab user app ke andar se aaya; seedha khulne par Adin AI home link
  const showBack = cameFromApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ Smart back button — Contact-specific
  // Contact is often opened in a NEW TAB from Privacy/Terms pages.
  // - If new tab (no history): close the tab
  // - If history exists: go back in history
  // - onBack prop is NOT used (it would be circular — App.tsx sends us to /contact)
  const goBack = () => {
    // Case 1: New tab (no history) — try to close
    if (window.history.length <= 1) {
      window.close();

      // Chrome blocks window.close() for user-opened tabs.
      // Fallback: go to /contact (stays on same page, no visual change)
      setTimeout(() => {
        if (!window.closed) {
          window.location.href = '/contact';
        }
      }, 150);
      return;
    }

    // Case 2: Has history — go back
    window.history.back();
  };

  const seoConfig = getSEOConfig('contact');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSending(true);

    try {
      const { json } = await postToSyncProxy("submit_contact", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        source: "contact-page",
        timestamp: new Date().toISOString(),
      });
      const data = json && typeof json === "object" ? json : { ok: false };

      if (data.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        toast.error(data.message || "Failed to send. Please try again.");
      }
    } catch (err) {
      console.error("[Contact] submit failed:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // ✅ Path-based URLs (no hash), new tab
  const openPrivacy = () => {
    window.open('/privacy-policy', '_blank', 'noopener,noreferrer');
  };
  const openTerms = () => {
    window.open('/terms-of-service', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalUrl={seoConfig.canonicalUrl}
        ogType="website"
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 h-[56px] flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
          {showBack ? (
            <button
              onClick={goBack}
              className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
              <span className="text-xs sm:text-sm font-semibold">Back</span>
            </button>
          ) : (
            <HomeLink />
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-sm">
              <Mail size={14} className="text-white" strokeWidth={2.4} />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Contact Us
            </span>
          </div>

          <div className="w-[80px]" aria-hidden="true" />
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          {/* Hero */}
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
              <MessageSquare size={12} />
              Get in Touch
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              Contact{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Us
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-3 max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Reach out anytime — we aim to respond within 24-48 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Contact Form */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-sm">
                  <Send size={16} className="text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Send a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you?"
                      rows={5}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200 text-sm resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-purple-600/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send size={15} />
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Right: Contact Info */}
            <div className="space-y-5">
              {/* Location card */}
              <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-sm">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Where We Are
                  </h2>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={17} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                      Location
                    </p>
                    <p className="text-sm text-slate-900 font-medium">
                      Punjab, Pakistan
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/60 via-white to-blue-50/40 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-sm">
                    <Clock size={16} className="text-white" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Response Time
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We aim to respond within <strong className="text-slate-800">24-48 hours</strong>. Use the form on the left to reach us — we read every message personally.
                </p>
              </section>

              {/* Clickable Privacy / Terms links */}
              <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-slate-900 mb-3">
                  Before You Ask
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Many common questions are answered in our legal pages. Check them first for faster answers.
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={openPrivacy}
                    className="w-full group inline-flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-left transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Shield size={14} className="text-purple-600" />
                    </div>
                    <span className="flex-1 text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                      Privacy Policy
                    </span>
                    <ExternalLink size={13} className="text-slate-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={openTerms}
                    className="w-full group inline-flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 transition-colors">
                      <FileText size={14} className="text-blue-600" />
                    </div>
                    <span className="flex-1 text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                      Terms of Service
                    </span>
                    <ExternalLink size={13} className="text-slate-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-sm mt-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Adin AI — Contact Us
            </p>
          </div>
        </footer>

        {/* Neutral gray scrollbar */}
        <style>{`
          html, body {
            height: auto !important;
            min-height: 100% !important;
            max-height: none !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            background: #f8fafc;
            color: #0f172a;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
          }
          body > *, body > * > *, #root, #root > * {
            height: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
            overflow-x: visible !important;
          }
          html::-webkit-scrollbar,
          body::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          html::-webkit-scrollbar-track,
          body::-webkit-scrollbar-track {
            background: #f1f5f9;
          }
          html::-webkit-scrollbar-thumb,
          body::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 6px;
            border: 2px solid #f1f5f9;
          }
          html::-webkit-scrollbar-thumb:hover,
          body::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          html::-webkit-scrollbar-corner,
          body::-webkit-scrollbar-corner {
            background: transparent;
          }
        `}</style>
      </div>
    </>
  );
}