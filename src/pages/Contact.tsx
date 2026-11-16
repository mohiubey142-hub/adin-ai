// src/pages/Contact.tsx
// ✅ Supabase integration — direct insert into 'contact_messages' table
// ✅ LIGHT THEME — matches landing page UI
// ✅ Gray scrollbar (no purple/black)
// ✅ FIX: Back button — close tab FIRST, then history.back()

import { useEffect, useState } from "react";
import { cameFromApp, markLandingIntent } from "../utils/inAppNav";
import {
  ArrowLeft, Mail, MapPin, Send, Clock, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../services/sync/supabaseClient";

interface ContactProps {
  onBack?: () => void;
}

export default function Contact({ onBack }: ContactProps) {
  const showBack = cameFromApp();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const goBack = () => {
    if (window.history.length <= 1) {
      window.close();
      setTimeout(() => {
        if (!window.closed) {
          window.location.href = '/contact';
        }
      }, 150);
      return;
    }
    window.history.back();
  };

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
      // Ab direct Supabase mein save ho raha hai
      const { error } = await supabase.from('contact_messages').insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        source: "contact-page",
        client_timestamp: new Date().toISOString(),
      });

      if (error) {
        console.error('[Contact] Supabase error:', error.message);
        toast.error("Failed to send. Please try again.");
      } else {
        toast.success("Message sent! We'll get back to you soon.");
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err) {
      console.error("[Contact] submit failed:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const openPrivacy = () => {
    window.open('/privacy-policy', '_blank', 'noopener,noreferrer');
  };
  const openTerms = () => {
    window.open('/terms-of-service', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200 shadow-sm' : 'bg-transparent border-b border-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {showBack ? (
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <a
              href="/"
              onClick={markLandingIntent}
              aria-label="Adin AI home"
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-white shadow-md shadow-purple-900/10 border border-slate-200 flex items-center justify-center overflow-hidden">
                <img src="/icon-1024x1024.png" alt="Adin AI" className="w-full h-full object-contain" />
              </div>
              <span className="hidden sm:inline text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                Adin AI
              </span>
            </a>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-sm">
              <Mail size={14} className="text-white" strokeWidth={2.4} />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Contact Us
            </span>
          </div>

          <div className="hidden sm:block w-[80px]" aria-hidden="true" />
        </div>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-24 sm:pb-28">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Contact us
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-3 leading-relaxed">
              Have a question or feedback? Send us a message and we'll get back to you within 24-48 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-10 md:gap-14">
            <section className="md:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    rows={6}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-colors text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send message
                      <Send size={15} />
                    </>
                  )}
                </button>
              </form>
            </section>

            <aside className="md:col-span-2 space-y-8 md:pl-10 md:border-l md:border-slate-200">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-1.5">
                  <MapPin size={15} className="text-slate-400" />
                  Location
                </h2>
                <p className="text-sm text-slate-600">Pakistan</p>
              </div>

              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-1.5">
                  <Clock size={15} className="text-slate-400" />
                  Response time
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We usually reply within 24-48 hours. We read every message personally.
                </p>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-2">
                  Before you ask
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  Many common questions are answered in our legal pages.
                </p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={openPrivacy}
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Privacy Policy
                    <ExternalLink size={13} className="opacity-70 group-hover:opacity-100" />
                  </button>
                  <br />
                  <button
                    type="button"
                    onClick={openTerms}
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Terms of Service
                    <ExternalLink size={13} className="opacity-70 group-hover:opacity-100" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 text-center">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Adin AI. All rights reserved.
            </p>
          </div>
        </footer>

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