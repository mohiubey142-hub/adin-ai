// src/pages/PrivacyPolicy.tsx
// ✅ LIGHT THEME — matches landing page UI
// ✅ UPDATED: Completely rewritten to match Supabase (Email/Google) Auth.
// ✅ Removed Guest Account, ID, and PIN references.
// ✅ Added Supabase, Google OAuth, and new data deletion flows.
// ✅ UPDATED (Nov 2026, PRICING): "Pricing & Charges" no longer mentions a "free plan"
//    or promises core features stay accessible — aligned with Terms Section 19.
import { useEffect, useState } from "react";
import { cameFromApp, markLandingIntent } from "../utils/inAppNav";
import {
  ArrowLeft, Shield, Mail, Lock, Database, Trash2,
  Users, Globe, AlertTriangle, Scale, RefreshCw, HardDrive,
  KeyRound, Download, CloudDownload, MessageSquare,
} from "lucide-react";

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const showBack = cameFromApp();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goBack = () => {
    // ✅ App ka handler (handleBackFromLegal): landing se aaye ho to Landing, warna history.back()
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length <= 1) {
      window.close();
      setTimeout(() => {
        if (!window.closed) window.location.href = '/contact';
      }, 150);
      return;
    }
    window.history.back();
  };

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
              <Shield size={14} className="text-white" strokeWidth={2.4} />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Privacy Policy
            </span>
          </div>

          <div className="hidden sm:block w-[80px]" aria-hidden="true" />
        </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
              <Shield size={12} />
              Legal
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              Privacy{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-3">
              Last updated: November 2026
            </p>
          </div>

          <div className="space-y-5">

            <Section icon={<Shield size={16} />} title="Introduction">
              <p className="mb-3">
                At Adin AI, we take your privacy seriously. This Privacy Policy explains what information we collect, how we use it, where we store it, and what rights you have over your data.
              </p>
              <p>
                Adin AI is a career platform that helps you build CVs, write cover letters, and prepare for job applications using AI. To provide these features reliably, we need to store and sync your data securely. This policy tells you exactly how.
              </p>
            </Section>

            <Section icon={<Database size={16} />} title="Information We Collect">
              <p className="mb-4">
                We only collect the information necessary to provide our services. Here's what we collect and why:
              </p>

              <SubSection title="Account Information">
                <p>
                  When you sign up, we collect your <strong className="text-slate-800">Name, Email Address, and Password</strong> (if using Email login). If you choose "Continue with Google", we receive your name, email, and profile picture from Google. This information is used to create and secure your account.
                </p>
              </SubSection>

              <SubSection title="Document Content">
                <p>
                  Everything you type into the CV builder or cover letter editor — work experience, education, skills, projects, and AI-generated content. This is the core data we store and sync.
                </p>
              </SubSection>

              <SubSection title="Profile Photos">
                <p>
                  If you upload a profile photo for your CV, it is stored locally in your browser's IndexedDB. If a photo is saved together with a CV that gets synced, it is stored securely in your account's cloud storage. Photos are never shared with third parties.
                </p>
              </SubSection>

              <SubSection title="Contact & Feedback Messages">
                <p>
                  If you write to us through the Contact or Feedback form, we collect the name, message, and email address you enter. These are stored in a private database and forwarded to our team by email so we can reply and improve the app.
                </p>
              </SubSection>

              <SubSection title="Usage Analytics (Google Analytics)">
                <p>
                  We use Google Analytics to understand how people use the app — which pages are visited, how long sessions last, and which features are used. This data is aggregated and pseudonymized. We never send your name, email address, or document content to Google Analytics. We keep analytics data for up to 14 months.
                </p>
              </SubSection>
            </Section>

            <Section icon={<Lock size={16} />} title="How We Use Your Information">
              <p className="mb-4">
                We use your information strictly for the following purposes:
              </p>

              <SubSection title="To Provide Services">
                <p>
                  Your document data is used to display your CVs and cover letters, generate PDFs, and enable AI-powered writing suggestions. Without this data, the app cannot function.
                </p>
              </SubSection>

              <SubSection title="To Enable Cross-Device Access">
                <p>
                  Because you have an account, you can simply log in from any device using your email and password (or Google) to access your documents instantly.
                </p>
              </SubSection>

              <SubSection title="To Improve the Product">
                <p>
                  Anonymous usage statistics help us understand which templates are popular, which features are used most, and where users get stuck — so we can make the app better.
                </p>
              </SubSection>

              <SubSection title="To Ensure Security">
                <p>
                  We monitor API access patterns, rate-limit requests, and maintain logs to detect and prevent abuse, fraud, or unauthorized access attempts.
                </p>
              </SubSection>
            </Section>

            <Section icon={<HardDrive size={16} />} title="Data Storage & Auto-Sync">
              <p className="mb-4">
                Adin AI stores your data in two places to give you both speed and safety:
              </p>

              <SubSection title="Local Browser Storage (Primary)">
                <p>
                  When you type in the CV builder or cover letter editor, your changes are saved to your browser's <strong className="text-slate-800">localStorage</strong> instantly. This makes the app fast and lets you work even with a slow internet connection. Your profile photos are stored in your browser's <strong className="text-slate-800">IndexedDB</strong>.
                </p>
              </SubSection>

              <SubSection title="Private Cloud Storage (Auto-Sync)">
                <p>
                  Your documents are <strong className="text-slate-800">automatically synced</strong> to our secure cloud database (hosted on Supabase) whenever you create, edit, or save a document. This happens silently in the background.
                </p>
                <p className="mt-3">
                  This automatic sync is what makes "Restore on another device" possible. When you log in on a new device, your documents are pulled from your cloud storage to your browser.
                </p>
              </SubSection>

              <SubSection title="How the Sync Works">
                <p>
                  Your data is transmitted over HTTPS and stored in a secure PostgreSQL database (Supabase), linked to your unique User ID. Every request is protected by Row Level Security (RLS) policies, which means the database itself ensures that only you can read, edit, or delete your own data. We never share your data publicly.
                </p>
              </SubSection>
            </Section>

            <Section icon={<Lock size={16} />} title="Data Security">
              <p className="mb-4">
                We take several measures to protect your data:
              </p>

              <SubSection title="Encrypted Transmission">
                <p>
                  All data sent to and from our servers uses HTTPS encryption. This prevents third parties from intercepting your documents during transit.
                </p>
              </SubSection>

              <SubSection title="Secure Authentication">
                <p>
                  We use Supabase Auth to manage your login. Passwords are cryptographically hashed and salted. We never store your password in plain text.
                </p>
              </SubSection>

              <SubSection title="Row Level Security (RLS)">
                <p>
                  Our database enforces strict RLS policies. This means that even if someone had access to the database, they could not read your data without your specific login session. You can only access data that belongs to your account.
                </p>
              </SubSection>

              <SubSection title="Rate Limiting & Abuse Prevention">
                <p>
                  Our API enforces rate limits to prevent brute-force attacks, spam, and unauthorized data scraping.
                </p>
              </SubSection>

              <SubSection title="No Selling, No Sharing">
                <p>
                  We never sell your data, and we never share it with advertisers or third parties for marketing purposes. Your documents are yours.
                </p>
              </SubSection>
            </Section>

            <Section icon={<KeyRound size={16} />} title="Your Account & Access">
              <p className="mb-4">
                Your account is protected by a secure login system.
              </p>

              <SubSection title="Email & Password or Google">
                <p>
                  You can log in using your email address and a password you set, or via Google OAuth. You are responsible for keeping your login credentials secure. We recommend using a strong password and not sharing your account with anyone.
                </p>
              </SubSection>

              <SubSection title="Changing Your Password">
                <p>
                  You can change your password at any time from your Profile page. If you forget your password, you can use the "Forgot Password" option on the login screen to receive a reset link via email.
                </p>
              </SubSection>

              <SubSection title="Multiple Devices">
                <p>
                  You can log in to your account from multiple devices at the same time. Your data will automatically sync across all devices.
                </p>
              </SubSection>
            </Section>

            <Section icon={<Download size={16} />} title="Downloading Your Data" highlight>
              <p className="mb-4">
                You own your data. You can export any CV or cover letter as <strong className="text-slate-800">PDF, PNG, or TXT</strong> at any time. We recommend downloading your important documents and saving them locally as an extra backup.
              </p>
            </Section>

            <Section icon={<Scale size={16} />} title="Legal Basis for Processing">
              <p className="mb-4">
                Under the General Data Protection Regulation (GDPR) and similar laws, we process your data based on:
              </p>

              <SubSection title="Contract Performance">
                <p>
                  To deliver the services you requested (CV building, cloud sync, AI writing).
                </p>
              </SubSection>

              <SubSection title="Legitimate Interest">
                <p>
                  To ensure security, keep the service running, and prevent fraud and abuse.
                </p>
              </SubSection>

              <SubSection title="Consent">
                <p>
                  When you accept this policy at the start, and for optional features such as submitting feedback.
                </p>
              </SubSection>

              <SubSection title="Legal Obligation">
                <p>
                  To comply with applicable laws.
                </p>
              </SubSection>
            </Section>

            <Section icon={<Trash2 size={16} />} title="Data Retention & Deletion" highlight>
              <p className="mb-4">
                You have full control over your data. Here's exactly what happens when you delete your account from the profile menu:
              </p>

              <SubSection title="How to Delete Your Account">
                <p>
                  Open your profile menu, tap "Delete my account", and confirm. You will be asked to check a confirmation box to prevent accidental deletion.
                </p>
              </SubSection>

              <SubSection title="Immediate Deletion">
                <p>
                  Your account, name, email, and all your CVs and cover letters (including any photo inside them) are <strong className="text-slate-800">permanently removed from our active cloud database within seconds</strong>. Your login credentials are also destroyed. This action cannot be undone.
                </p>
              </SubSection>

              <SubSection title="Local Data Cleared">
                <p>
                  Your browser's localStorage, sessionStorage, and IndexedDB entries are cleared immediately when you log out or delete your account.
                </p>
              </SubSection>

              <SubSection title="Contact & Feedback Messages">
                <p>
                  Messages you send through the Contact or Feedback forms are not linked to your account, so deleting your account does not remove them automatically. To have them deleted, ask us through the contact form and we will remove them.
                </p>
              </SubSection>
            </Section>

            <Section icon={<HardDrive size={16} />} title="Local Storage & Browser Data">
              <p className="mb-4">
                Adin AI uses modern browser storage technologies to keep you logged in and your documents accessible:
              </p>

              <SubSection title="localStorage">
                <p>
                  Stores your app preferences, session state, document metadata, and the secure session token that keeps this device logged in.
                </p>
              </SubSection>

              <SubSection title="sessionStorage">
                <p>
                  Stores temporary data that resets when you close the tab.
                </p>
              </SubSection>

              <SubSection title="IndexedDB">
                <p>
                  Stores larger data like your profile photos locally, for faster loading.
                </p>
              </SubSection>

              <SubSection title="Analytics Cookies">
                <p>
                  We do not use advertising cookies. Once you have accepted this policy, Google Analytics may set its own cookies to produce aggregated statistics. Analytics is not loaded before you accept.
                </p>
              </SubSection>
            </Section>

            <Section icon={<Database size={16} />} title="Third-Party Services">
              <p className="mb-4">
                We rely on these trusted third-party services to operate the app:
              </p>

              <SubSection title="Supabase (Database & Auth)">
                <p>
                  Stores your synced documents and handles your secure login. Supabase is protected by enterprise-grade security and encryption.
                </p>
              </SubSection>

              <SubSection title="Google (OAuth Login)">
                <p>
                  Allows you to log in securely using your Google account. We only receive your name, email, and profile picture.
                </p>
              </SubSection>

              <SubSection title="Groq / OpenRouter (AI Providers)">
                <p>
                  Powers AI text generation. Only the content needed for a generation request is sent. Your full document history is never shared.
                </p>
              </SubSection>

              <SubSection title="Vercel (Hosting)">
                <p>
                  Hosts the website and the server functions that handle requests. Like any host, it processes technical data such as IP addresses and request logs.
                </p>
              </SubSection>

              <SubSection title="Google Mail (Contact & Feedback Notifications)">
                <p>
                  When you send a message through the Contact or Feedback form, a notification is emailed to our team.
                </p>
              </SubSection>
            </Section>

            <Section icon={<Globe size={16} />} title="International Data Transfers">
              <p>
                Our cloud storage is hosted on secure cloud infrastructure, which may store data in the United States or other regions outside your country of residence.
              </p>
              <p className="mt-3">
                By using Adin AI, you consent to this transfer. We ensure appropriate safeguards are in place — HTTPS encryption in transit, access controls at rest — to protect your data during transfer and storage.
              </p>
            </Section>

            <Section icon={<Users size={16} />} title="Children's Privacy">
              <p>
                Adin AI is designed for users aged 13 and above (16 in some jurisdictions). We do not knowingly collect personal information from children under these ages.
              </p>
              <p className="mt-3">
                If you believe a child has provided us with personal information, please contact us via the in-app contact form, and we will delete that information promptly.
              </p>
            </Section>

            <Section icon={<AlertTriangle size={16} />} title="Data Breach Notification">
              <p>
                In the unlikely event of a data breach that affects your personal information, we will:
              </p>
              <p className="mt-3">
                Notify the relevant data protection authorities <strong className="text-slate-800">within 72 hours</strong> of becoming aware of the breach, where required by law, and notify affected users without undue delay. The notice will describe what happened, what data was affected, and what steps you can take.
              </p>
            </Section>

            <Section icon={<Shield size={16} />} title="Your Rights">
              <p className="mb-4">
                Depending on where you live, you have the following rights over your personal data:
              </p>

              <SubSection title="Right to Access">
                <p>
                  You can request a copy of all data we hold about you. Most of it is visible in your own account.
                </p>
              </SubSection>

              <SubSection title="Right to Correction">
                <p>
                  You can edit any of your document data directly in the editor at any time.
                </p>
              </SubSection>

              <SubSection title="Right to Deletion">
                <p>
                  You can delete your account and all data from the profile menu.
                </p>
              </SubSection>

              <SubSection title="Right to Portability">
                <p>
                  You can export your documents as PDF, PNG, or TXT at any time.
                </p>
              </SubSection>

              <SubSection title="Right to Complain">
                <p>
                  If you believe your data has been mishandled, you have the right to lodge a complaint with your local Data Protection Authority.
                </p>
              </SubSection>
            </Section>

            <Section icon={<CloudDownload size={16} />} title="Pricing & Charges">
              <p className="mb-4">
                Adin AI is free to use today, with no hidden charges. We may introduce optional paid features or premium offerings in the future to support the development and maintenance of the platform. You will always be informed before any new charges apply.
              </p>
            </Section>

            <Section icon={<RefreshCw size={16} />} title="Updates to This Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons.
              </p>
              <p className="mt-3">
                When we make material changes, we will update the "Last updated" date at the top of this page and, where appropriate, notify you through the app. Your continued use of Adin AI after such changes means you accept the updated policy.
              </p>
            </Section>

            <Section icon={<Mail size={16} />} title="Contact" highlight>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or want to exercise your data rights, please reach out to us using our in-app contact form:
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
              © {new Date().getFullYear()} Adin AI — Privacy Policy
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
  title,
  children,
  highlight = false,
}: {
  icon: React.ReactNode;
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
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
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