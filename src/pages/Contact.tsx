// src/pages/Contact.tsx
import { useState } from "react";
import { SEOHead } from "../components/SEO/SEOHead";
import { ArrowLeft, Mail, MapPin, MessageSquare, Send, User } from "lucide-react";
import toast from "react-hot-toast";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ Go back to workspace
  const goBack = () => {
    window.location.hash = '';
    window.location.reload();
  };

  // ✅ Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setSending(true);
    
    // Simulate sending
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
      setSending(false);
    }, 1500);
  };

  return (
    <>
      {/* ✅ SEO for Contact Page */}
      <SEOHead
        title="Contact Us - Adin AI"
        description="Get in touch with Adin AI. Have questions about our AI-powered career platform? Contact us for support, feedback, or partnership inquiries."
        canonicalUrl="https://adin-ai.com/contact"
        ogType="website"
      />

      {/* ✅ Page Content */}
      <div className="h-screen bg-black text-white overflow-y-auto">
        {/* Navigation - Sticky top */}
        <div className="sticky top-0 z-50 h-[56px] flex items-center px-5 border-b border-zinc-900 bg-black/90 backdrop-blur-md">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition"
          >
            <ArrowLeft size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Back to Home</span>
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Contact Us
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Have questions or feedback? We'd love to hear from you.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Contact Form */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-4">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-zinc-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-zinc-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-3 text-gray-500" />
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you?"
                      rows={4}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-zinc-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Contact Info */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
                <h2 className="text-lg font-semibold text-white mb-4">Get in Touch</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-sm text-white font-medium">support@adin-ai.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-sm text-white font-medium">Mananwala, Sheikhupura, Pakistan</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/10">
                <h2 className="text-lg font-semibold text-white mb-2">Response Time</h2>
                <p className="text-sm text-gray-300">
                  We typically respond within 24-48 hours. For urgent inquiries, please reach out via email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}