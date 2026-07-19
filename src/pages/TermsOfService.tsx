// src/pages/TermsOfService.tsx
import { SEOHead } from "../components/SEO/SEOHead";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  // ✅ Go back to workspace
  const goBack = () => {
    window.location.hash = '';
    window.location.reload();
  };

  return (
    <>
      {/* ✅ SEO for Terms of Service Page */}
      <SEOHead
        title="Terms of Service - Adin AI"
        description="Read Adin AI's Terms of Service to understand the rules and guidelines for using our AI-powered career platform."
        canonicalUrl="https://adin-ai.com/terms-of-service"
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
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: July 2026</p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            {/* Introduction */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h2>
              <p className="text-sm">
                By using Adin AI, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, users, and others who access or use our platform.
              </p>
            </div>

            {/* Description of Service */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">2. Description of Service</h2>
              <p className="text-sm">
                Adin AI is an AI-powered career platform that helps users create professional resumes, generate cover letters, prepare for interviews, learn new skills, and connect with freelance opportunities. We provide tools and resources to help you build and grow your career.
              </p>
            </div>

            {/* User Accounts */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">3. User Accounts</h2>
              <p className="text-sm mb-3">To access our services, you must create an account. You agree to:</p>
              <ul className="text-sm space-y-2 list-disc list-inside text-gray-400">
                <li><span className="text-gray-300">Provide accurate and complete information</span></li>
                <li><span className="text-gray-300">Keep your login credentials confidential</span></li>
                <li><span className="text-gray-300">Notify us immediately of any unauthorized use</span></li>
                <li><span className="text-gray-300">You are responsible for all activities under your account</span></li>
              </ul>
            </div>

            {/* User Content */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">4. User Content</h2>
              <p className="text-sm">
                You retain ownership of all content you create using our platform, including resumes, cover letters, and other documents. By using our services, you grant us a license to store, display, and process your content solely for the purpose of providing our services to you.
              </p>
            </div>

            {/* Prohibited Activities */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">5. Prohibited Activities</h2>
              <ul className="text-sm space-y-2 list-disc list-inside text-gray-400">
                <li><span className="text-gray-300">Using our platform for any illegal purpose</span></li>
                <li><span className="text-gray-300">Attempting to gain unauthorized access to our systems</span></li>
                <li><span className="text-gray-300">Interfering with the operation of our services</span></li>
                <li><span className="text-gray-300">Misrepresenting your identity or affiliations</span></li>
                <li><span className="text-gray-300">Uploading malicious code or content</span></li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">6. Intellectual Property</h2>
              <p className="text-sm">
                All content, features, and functionality of Adin AI, including but not limited to text, graphics, logos, icons, and software, are the exclusive property of Adin AI and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">7. Limitation of Liability</h2>
              <p className="text-sm">
                Adin AI is provided "as is" without warranties of any kind. We do not guarantee that our services will be uninterrupted, secure, or error-free. We are not liable for any damages arising from the use of our services, including but not limited to direct, indirect, incidental, or consequential damages.
              </p>
            </div>

            {/* Termination */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">8. Termination</h2>
              <p className="text-sm">
                We reserve the right to suspend or terminate your account at our discretion, without notice, for violations of these Terms of Service or any other reason. You may also terminate your account at any time by contacting us.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white mb-2">9. Changes to Terms</h2>
              <p className="text-sm">
                We may update these Terms of Service from time to time. We will notify you of any changes by posting the new terms on this page. Your continued use of our services after such changes constitutes your acceptance of the new terms.
              </p>
            </div>

            {/* Contact */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/10">
              <h2 className="text-lg font-semibold text-white mb-2">10. Contact Us</h2>
              <p className="text-sm text-gray-300">
                If you have any questions about these Terms of Service, please contact us at:
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