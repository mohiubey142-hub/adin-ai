// src/pages/PrivacyPolicy.tsx
import { SEOHead } from "../components/SEO/SEOHead";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  // ✅ Go back to workspace
  const goBack = () => {
    window.location.hash = '';
    window.location.reload();
  };

  return (
    <>
      {/* ✅ SEO for Privacy Policy Page */}
      <SEOHead
        title="Privacy Policy - Adin AI"
        description="Read Adin AI's privacy policy to understand how we collect, use, and protect your personal data. Your privacy matters to us."
        canonicalUrl="https://adin-ai.com/privacy-policy"
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
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: July 2026</p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            {/* Introduction */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">Introduction</h2>
              <p className="text-sm">
                At Adin AI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">Information We Collect</h2>
              <p className="text-sm mb-3">We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
              <ul className="text-sm space-y-2 list-disc list-inside text-gray-400">
                <li><span className="text-gray-300">Personal Data:</span> Name, email address, phone number, and other information you provide when creating an account or using our services.</li>
                <li><span className="text-gray-300">Resume Data:</span> Information you provide in your CV, cover letters, and other documents created through our platform.</li>
                <li><span className="text-gray-300">Usage Data:</span> Information about how you interact with our website, including pages visited, time spent, and features used.</li>
                <li><span className="text-gray-300">Device Data:</span> Information about your device, browser, IP address, and operating system.</li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">How We Use Your Information</h2>
              <p className="text-sm mb-3">We use the information we collect to:</p>
              <ul className="text-sm space-y-2 list-disc list-inside text-gray-400">
                <li><span className="text-gray-300">Provide and maintain our services</span></li>
                <li><span className="text-gray-300">Improve and personalize your experience</span></li>
                <li><span className="text-gray-300">Process your requests and transactions</span></li>
                <li><span className="text-gray-300">Send you updates, notifications, and marketing communications</span></li>
                <li><span className="text-gray-300">Protect against fraud and unauthorized access</span></li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">Data Security</h2>
              <p className="text-sm">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            {/* Third-Party Services */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">Third-Party Services</h2>
              <p className="text-sm">
                We use third-party services including Clerk for authentication, Google Analytics for analytics, and other tools to improve our services. These third parties have their own privacy policies and we recommend you review them.
              </p>
            </div>

            {/* Your Rights */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">Your Rights</h2>
              <ul className="text-sm space-y-2 list-disc list-inside text-gray-400">
                <li><span className="text-gray-300">Access:</span> Request a copy of your personal data</li>
                <li><span className="text-gray-300">Correction:</span> Request corrections to your personal data</li>
                <li><span className="text-gray-300">Deletion:</span> Request deletion of your personal data</li>
                <li><span className="text-gray-300">Opt-out:</span> Unsubscribe from marketing communications</li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/10">
              <h2 className="text-lg font-semibold text-white mb-2">Contact Us</h2>
              <p className="text-sm text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-sm text-purple-400 font-medium mt-2">
                Email: support@adin-ai.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}