// src/pages/TermsOfService.tsx
// ✅ LIGHT THEME — matches landing page UI
// ✅ FIX: Back button uses history.back() — returns to referring page
// ✅ FIX: Contact link → path-based, new tab
// ✅ Full detailed content
// ✅ Governing Law, Dispute Resolution, Age, Warranty, Indemnification
// ✅ UPDATED: Removed "No Ads" claims (Section 3 "What You Get", Section 19
//             "Pricing & Charges") to stay consistent with the landing page
//             and keep the policy future-proof if ads are ever introduced.
//             "No Watermarks" is kept — it's a core product promise.
// ✅ UPDATED (Nov 2026, PRICING): Removed "100% free", "no premium tiers", "never asked
//             for a credit card" and "existing free features will remain free" claims
//             (Sections 2, 3, 19) so paid features can be introduced later without
//             contradicting these Terms. Future charges: announced in advance + consent.
// ✅ UPDATED (Oct 2026): Aligned with the Privacy Policy and the real system —
//             PIN required to restore, deletion/version-history wording,
//             Vercel + Gmail listed, governing law = Pakistan, termination
//             notice fixed for Guest Accounts (no email on file).
// ✅ UPDATED (Nov 2026): Rewritten for Supabase Auth (Email/Password + Google).
//             Removed Guest Account, User ID, PIN and Google Sheets wording;
//             aligned with the updated Privacy Policy.

import { useEffect, useState } from "react";
import { cameFromApp, markLandingIntent } from "../utils/inAppNav";
import {
  ArrowLeft, FileText, CheckCircle, Lock, AlertCircle,
  Trash2, Scale, Users, Sparkles, Mail, Globe, Shield,
  KeyRound, RefreshCw, Ban, Gavel, ExternalLink, Baby,
  MessageSquare, Gift,
} from "lucide-react";

interface TermsOfServiceProps {
  onBack?: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  // ✅ Back sirf tab jab user app ke andar se aaya; seedha khulne par Adin AI home link
  const showBack = cameFromApp();
  // Header: transparent on top, glass + border after scrolling (same as the main landing page)
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ✅ Smart back button — returns to referring page
  const goBack = () => {
    // ✅ App ka handler (handleBackFromLegal): landing se aaye ho to Landing, warna history.back()
    if (onBack) {
      onBack();
      return;
    }
    // 1. If opened in new tab (no history) → close tab
    if (window.history.length <= 1) {
      window.close();
      setTimeout(() => {
        if (!window.closed) {
          window.location.href = '/contact';
        }
      }, 150);
      return;
    }

    // 2. Has history → go back
    window.history.back();
  };

  // ✅ Path-based URL (no hash), new tab
  const openContact = () => {
    window.open('/contact', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
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
              <FileText size={14} className="text-white" strokeWidth={2.4} />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Terms of Service
            </span>
          </div>

          <div className="hidden sm:block w-[80px]" aria-hidden="true" />
        </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <FileText size={12} />
              Legal
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              Terms of{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Service
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-3">
              Last updated: November 2026
            </p>
          </div>

          <div className="space-y-5">

            <Section icon={<CheckCircle size={16} />} number="1" title="Acceptance of Terms">
              <p className="mb-3">
                By accessing or using Adin AI, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services.
              </p>
              <p>
                These terms apply to every visitor, registered user, and anyone who accesses the platform through any device or browser.
              </p>
            </Section>

            <Section icon={<Sparkles size={16} />} number="2" title="Description of Service">
              <p className="mb-3">
                Adin AI is an AI-powered career platform that helps you build CVs, generate cover letters, and improve your job application materials.
              </p>
              <p>
                All core features — template gallery, editor, AI writing, cloud sync, and PDF/PNG/TXT export — are available <strong className="text-slate-800">free of charge</strong> today, with no hidden charges.
              </p>
            </Section>

            <Section icon={<Gift size={16} />} number="3" title="What You Get" highlight>
              <p className="mb-4">
                Adin AI is built to be simple, safe, and free to start. When you sign up, you get a private account for your work. Here's what you get:
              </p>

              <SubSection title="Your Account (Why You Get It)">
                <p>
                  You create an account with your <strong className="text-slate-800">name, email address and a password</strong>, or you can choose <strong className="text-slate-800">Continue with Google</strong>. Your account keeps your CVs and cover letters safe in the cloud and lets you log in from any device to continue exactly where you left off.
                </p>
                <p className="mt-3">
                  You can change your password at any time from your Profile page, and if you forget it you can use the "Forgot Password" option on the login screen to get a reset link by email.
                </p>
              </SubSection>

              <div className="space-y-3 mt-5">
                <InfoRow label="Free to Start">
                  No hidden charges. Any future paid features will be announced in advance.
                </InfoRow>
                <InfoRow label="Private by Default">
                  Your CVs and cover letters are yours. We never sell your data, and we share it only with the services needed to run the app (see Section 14).
                </InfoRow>
                <InfoRow label="Auto-Save & Cloud Backup">
                  Everything saves automatically. Your documents are stored safely in the cloud.
                </InfoRow>
                <InfoRow label="Access on Any Device">
                  Log in with your email and password (or Google) to open all your documents on any device, anytime.
                </InfoRow>
                <InfoRow label="Full Control">
                  Download your documents (PDF, PNG, TXT) and delete your account whenever you want.
                </InfoRow>
                <InfoRow label="No Watermarks">
                  A clean, distraction-free experience from start to finish.
                </InfoRow>
                <InfoRow label="AI-Powered Help">
                  Write better summaries, experience bullets, and cover letters with AI assistance.
                </InfoRow>
              </div>
            </Section>

            <Section icon={<Baby size={16} />} number="4" title="Eligibility & Age Requirement">
              <p className="mb-3">
                To use Adin AI, you must be at least <strong className="text-slate-800">13 years old</strong> (16 years old in some jurisdictions where required by local law).
              </p>
              <p>
                By using the service, you represent that you meet this age requirement. If we discover that a user under the minimum age has created an account, we will delete the account and all associated data.
              </p>
            </Section>

            <Section icon={<Users size={16} />} number="5" title="User Accounts & Security">
              <p className="mb-3">
                To use Adin AI, you create an account with your <strong className="text-slate-800">name, email address and a password</strong>, or sign in with your <strong className="text-slate-800">Google account</strong>. You can change your password at any time from your Profile page.
              </p>
              <p className="mb-3">
                You agree to:
              </p>
              <div className="space-y-3">
                <InfoRow>
                  Provide accurate information in your documents and profile.
                </InfoRow>
                <InfoRow>
                  Keep your login credentials (your password and the Google account you use to sign in) confidential and not share them with anyone.
                </InfoRow>
                <InfoRow>
                  Notify us immediately via the in-app contact form if you suspect unauthorized access to your account.
                </InfoRow>
                <InfoRow>
                  Take full responsibility for all activity that occurs under your account.
                </InfoRow>
              </div>
            </Section>

            <Section icon={<FileText size={16} />} number="6" title="Your Content">
              <p className="mb-3">
                You retain full ownership of all content you create with Adin AI — your CVs, cover letters, profile photos, and any other documents.
              </p>
              <p>
                By using our services, you grant us a limited license to store, sync, and process your content solely for the purpose of providing the service to you. This includes displaying your documents back to you, generating exports, and (with your consent) generating AI text based on what you provide. We never sell your content.
              </p>
            </Section>

            <Section icon={<Lock size={16} />} number="7" title="Cloud Storage & Auto-Sync" highlight>
              <p className="mb-3">
                Your documents are <strong className="text-slate-800">automatically synced</strong> to our secure cloud database (hosted on Supabase) whenever you create, edit, or save a document. This sync happens in the background — you don't need to click anything to enable it.
              </p>
              <p className="mb-3">
                This allows you to access your data on any device by simply logging in to your account. Access to your data is protected by Row Level Security policies, so that only you can read, edit, or delete your own documents.
              </p>
              <p>
                You are responsible for keeping your login credentials safe. If you forget your password, use the "Forgot Password" option on the login screen to receive a reset link by email. We recommend also exporting copies of important documents (PDF, PNG, TXT) as an extra backup.
              </p>
            </Section>

            <Section icon={<Trash2 size={16} />} number="8" title="Data Retention & Deletion" highlight>
              <p className="mb-4">
                You have the right to delete your account and all associated data at any time.
              </p>

              <SubSection title="How to Delete Your Account">
                <p>
                  Open your profile menu and click "Delete my account". To prevent accidental deletion, you will be asked to check a confirmation box before the deletion goes through.
                </p>
              </SubSection>

              <SubSection title="What Gets Deleted">
                <p>
                  Your account, name, email, and all your CVs and cover letters (including any photo inside them) are permanently removed from our active cloud database within seconds, and your login credentials are destroyed. This action cannot be undone. The localStorage, sessionStorage, and IndexedDB entries of the browser you delete from are also cleared immediately.
                </p>
              </SubSection>

              <SubSection title="Contact & Feedback Messages">
                <p>
                  Messages you sent through the Contact or Feedback forms are not linked to your account and are not deleted automatically — ask us through the contact form and we will remove them.
                </p>
              </SubSection>
            </Section>

            <Section icon={<Ban size={16} />} number="9" title="Prohibited Activities">
              <p className="mb-4">
                You agree not to engage in any of the following while using Adin AI:
              </p>
              <div className="space-y-3">
                <InfoRow>
                  Using the platform for any illegal purpose or to violate any local, national, or international law.
                </InfoRow>
                <InfoRow>
                  Attempting to gain unauthorized access to our systems, servers, or other users' data.
                </InfoRow>
                <InfoRow>
                  Interfering with or disrupting the operation of our services, including DoS or spam attacks.
                </InfoRow>
                <InfoRow>
                  Misrepresenting your identity, impersonating others, or falsifying affiliations.
                </InfoRow>
                <InfoRow>
                  Uploading malicious code, viruses, or content designed to harm the platform or other users.
                </InfoRow>
                <InfoRow>
                  Attempting to brute-force, scrape, or abuse our cloud sync and AI endpoints.
                </InfoRow>
                <InfoRow>
                  Using automated tools, bots, or scripts to interact with the service without our written permission.
                </InfoRow>
              </div>
            </Section>

            <Section icon={<Scale size={16} />} number="10" title="Intellectual Property">
              <p className="mb-3">
                All platform-level content, features, and functionality of Adin AI — including the source code, template designs, graphics, logos, icons, and UI/UX — are the exclusive property of Adin AI and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                However, the <strong className="text-slate-800">documents you create</strong> using Adin AI (your CVs, cover letters, and their content) remain entirely yours. We claim no ownership over your personal or professional content.
              </p>
            </Section>

            <Section icon={<AlertCircle size={16} />} number="11" title="Warranty Disclaimer">
              <p className="mb-3">
                Adin AI is provided <strong className="text-slate-800">"as is"</strong> and <strong className="text-slate-800">"as available"</strong>, without warranties of any kind, express or implied.
              </p>
              <p className="mb-3">
                We do not guarantee that:
              </p>
              <div className="space-y-3">
                <InfoRow>The service will be uninterrupted, timely, or error-free.</InfoRow>
                <InfoRow>The results obtained from the service will meet your specific expectations.</InfoRow>
                <InfoRow>AI-generated content will be accurate, complete, or fit for a particular purpose.</InfoRow>
                <InfoRow>Any errors in the service will be corrected immediately.</InfoRow>
              </div>
              <p className="mt-3">
                You use Adin AI at your own risk. AI-generated content should always be reviewed and edited before use in real job applications.
              </p>
            </Section>

            <Section icon={<AlertCircle size={16} />} number="12" title="Limitation of Liability">
              <p className="mb-3">
                To the maximum extent permitted by law, Adin AI and its founders, employees, and affiliates are not liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the service.
              </p>
              <p>
                This includes, but is not limited to, loss of data, loss of opportunities, or damages resulting from reliance on AI-generated content. You are solely responsible for reviewing and finalizing your documents before using them for real job applications.
              </p>
            </Section>

            <Section icon={<Shield size={16} />} number="13" title="Indemnification">
              <p>
                You agree to indemnify and hold harmless Adin AI, its founders, employees, and partners from any claims, damages, losses, liabilities, or expenses (including legal fees) arising from your use of the service, your violation of these Terms, or your infringement of any third-party rights.
              </p>
            </Section>

            <Section icon={<ExternalLink size={16} />} number="14" title="Third-Party Links & Services">
              <p className="mb-3">
                Adin AI integrates with third-party services to provide certain features:
              </p>
              <div className="space-y-3">
                <InfoRow label="Supabase">For secure login (authentication) and cloud data storage and synchronization.</InfoRow>
                <InfoRow label="Google (Sign-In)">For the optional "Continue with Google" login.</InfoRow>
                <InfoRow label="Groq / OpenRouter">For AI-powered text generation.</InfoRow>
                <InfoRow label="Google Analytics">For aggregated, pseudonymized usage statistics, loaded only after you accept our policy.</InfoRow>
                <InfoRow label="Vercel">For hosting the website and the server functions that handle requests.</InfoRow>
                <InfoRow label="Google Mail">For emailing Contact and Feedback notifications to our team.</InfoRow>
              </div>
              <p className="mt-3">
                These services have their own terms and privacy policies. We are not responsible for the content, practices, or availability of any third-party service. We recommend you review their policies before use.
              </p>
            </Section>

            <Section icon={<Gavel size={16} />} number="15" title="Governing Law">
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the competent courts of Pakistan.</p>
              <p className="mt-3">
                Adin AI is designed primarily for users in Pakistan. If you use it from another country, you do so on your own initiative and are responsible for complying with your local laws.
              </p>
            </Section>

            <Section icon={<Scale size={16} />} number="16" title="Dispute Resolution">
              <p className="mb-3">
                In the event of any dispute arising out of or relating to these Terms or your use of Adin AI:
              </p>
              <div className="space-y-3">
                <InfoRow>
                  <strong className="text-slate-800">Step 1 – Informal Resolution:</strong> You agree to first contact us via the in-app contact form to attempt to resolve the dispute informally.
                </InfoRow>
                <InfoRow>
                  <strong className="text-slate-800">Step 2 – Good-Faith Negotiation:</strong> Both parties agree to negotiate in good faith for a period of at least 30 days before pursuing formal action.
                </InfoRow>
                <InfoRow>
                  <strong className="text-slate-800">Step 3 – Formal Resolution:</strong> If the dispute is not resolved informally, it may be brought before a competent court in the jurisdiction specified above.
                </InfoRow>
              </div>
            </Section>

            <Section icon={<Lock size={16} />} number="17" title="Termination">
              <p className="mb-3">
                You may terminate your account at any time from your profile menu ("Delete my account"), confirming the deletion in the app.
              </p>
              <p>
                We reserve the right to suspend or terminate your access to Adin AI at our sole discretion, without prior notice, for violation of these Terms or for any other reason. Where possible, we will notify you by email or through a notice in the app.
              </p>
            </Section>

            <Section icon={<RefreshCw size={16} />} number="18" title="Changes to Terms">
              <p className="mb-3">
                We may update these Terms of Service from time to time. When we make material changes, we will update the "Last updated" date at the top of this page and, where appropriate, notify you through the app.
              </p>
              <p>
                Your continued use of Adin AI after changes are posted constitutes your acceptance of the updated terms. If you do not agree with the changes, you should stop using the service and delete your account.
              </p>
            </Section>

            <Section icon={<Sparkles size={16} />} number="19" title="Pricing & Charges" highlight>
              <p className="mb-3">
                Adin AI is <strong className="text-slate-800">free to use</strong> today, with no hidden charges. Adin AI does not add watermarks to your documents.
              </p>
              <p>
                We may introduce optional paid features, subscriptions, or premium offerings in the future. If we do, we will clearly announce them in advance, and you will not be charged for anything without your clear action and consent.
              </p>
            </Section>

            <Section icon={<Mail size={16} />} number="20" title="Contact Us" highlight>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please reach out using our in-app contact form:
              </p>
              <button
                type="button"
                onClick={openContact}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-sm font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg transition-all duration-200"
              >
                <MessageSquare size={14} />
                Open Contact Form
              </button>
            </Section>

          </div>
        </main>

        <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-sm mt-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Adin AI — Terms of Service
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

// ============================================================
// Sub-components
// ============================================================

function Section({
  icon,
  number,
  title,
  children,
  highlight = false,
}: {
  icon: React.ReactNode;
  number?: string;
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl bg-white border shadow-sm p-5 sm:p-6 transition-all duration-200 hover:shadow-md ${
        highlight
          ? 'border-purple-200 bg-gradient-to-br from-purple-50/60 via-white to-blue-50/40'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
            highlight
              ? 'bg-gradient-to-br from-purple-600 to-blue-500 text-white'
              : 'bg-purple-50 text-purple-600'
          }`}
        >
          {icon}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          {number && (
            <span className="text-xs font-bold text-slate-400 shrink-0">
              {number.padStart(2, '0')}
            </span>
          )}
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h2>
        </div>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed pl-0 sm:pl-12">
        {children}
      </div>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="text-sm font-semibold text-slate-800 mb-1.5">
        {title}
      </h3>
      <div className="text-sm text-slate-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="text-sm text-slate-600 leading-relaxed">
      {label && <span className="font-semibold text-slate-800">{label}: </span>}
      <span>{children}</span>
    </div>
  );
}