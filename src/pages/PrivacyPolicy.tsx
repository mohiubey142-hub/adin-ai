// src/pages/PrivacyPolicy.tsx
// ✅ LIGHT THEME — matches landing page UI
// ✅ FIX: Back button uses history.back() — returns to referring page
// ✅ FIX: Contact link → path-based, new tab
// ✅ Full detailed content
// ✅ Auto-sync disclosure clarified
// ✅ User ID + PIN flow
// ✅ UPDATED: Removed "No Ads" / "No ads, no watermarks" claims (both in
//             the "Your Benefits & Guest Account" list and the "Pricing &
//             Charges" section). Kept "No watermarks" — a core product
//             promise — and stayed consistent with the landing page.
// ✅ UPDATED (Oct 2026): Policy re-aligned with the actual system —
//             PIN required to restore, server-side PIN hashing + lockout,
//             per-device tokens, onboarding collects name only, Google
//             Analytics only after consent (cookies disclosed), contact /
//             feedback forms, Vercel + Gmail listed, honest storage and
//             deletion wording (Google Sheets version history).

import { SEOHead } from "../components/SEO/SEOHead";
import { getSEOConfig } from "../utils/seoPages";
import { cameFromApp } from "../utils/inAppNav";
import HomeLink from "../components/HomeLink";
import {
  ArrowLeft, Shield, Mail, Lock, Database, Trash2,
  Users, Globe, AlertTriangle, Scale, RefreshCw, HardDrive,
  KeyRound, Download, CloudDownload, MessageSquare, Gift,
} from "lucide-react";

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  // ✅ Back sirf tab jab user app ke andar se aaya; seedha khulne par Adin AI home link
  const showBack = cameFromApp();

  // ✅ Smart back button — returns to referring page
  // - New tab (no history): close tab, fallback /contact
  // - Same tab (has history): history.back() → referring page
  const goBack = () => {
    // 1. If opened in new tab (no history) → close tab
    if (window.history.length <= 1) {
      window.close();
      // Fallback: if close is blocked, go to /contact
      setTimeout(() => {
        if (!window.closed) {
          window.location.href = '/contact';
        }
      }, 150);
      return;
    }

    // 2. Has history → go back (returns to referring page)
    window.history.back();
  };

  // ✅ Path-based URL (no hash), new tab
  const openContact = () => {
    window.open('/contact', '_blank', 'noopener,noreferrer');
  };

  const seoConfig = getSEOConfig('privacy-policy');

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
              <Shield size={14} className="text-white" strokeWidth={2.4} />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Privacy Policy
            </span>
          </div>

          <div className="w-[80px]" aria-hidden="true" />
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
              Last updated: October 2026
            </p>
          </div>

          <div className="space-y-5">

            <Section icon={<Shield size={16} />} title="Introduction">
              <p className="mb-3">
                At Adin AI, we take your privacy seriously. This Privacy Policy explains what information we collect, how we use it, where we store it, and what rights you have over your data.
              </p>
              <p>
                Adin AI is a <strong className="text-slate-800">100% free</strong> career platform that helps you build CVs, write cover letters, and prepare for job applications using AI. There are no hidden charges and no premium tiers today. To provide these features reliably, we need to store and sync your data securely. This policy tells you exactly how.
              </p>
            </Section>

            <Section icon={<Gift size={16} />} title="Your Benefits & Guest Account" highlight>
              <p className="mb-4">
                Before we dive into the details, here's a quick look at what you get with Adin AI — and why we give you a <strong className="text-slate-800">Guest Account</strong> from the start.
              </p>

              <SubSection title="What is a Guest Account?">
                <p>
                  A <strong className="text-slate-800">Guest Account</strong> is a private space we automatically create for you when you start using Adin AI — <strong className="text-slate-800">no email, no password, no signup required</strong>. It comes with a unique <strong className="text-slate-800">User ID</strong>, and you can add a <strong className="text-slate-800">4-digit PIN</strong> — the PIN is what lets you restore your documents on another device.
                </p>
              </SubSection>

              <SubSection title="Why do we give you a Guest Account?">
                <p className="mb-2">
                  We believe you should be able to <strong className="text-slate-800">try the product first</strong> and see its value — before deciding to save anything permanently. So instead of asking for your email upfront, we give you a private Guest Account and let you start building right away.
                </p>
                <p>
                  If you ever want to bring your documents to another device, set a PIN and keep it, together with your User ID, safe — that's your backup key. Your Guest Account works like a private vault that only you can access.
                </p>
              </SubSection>

              <div className="space-y-3 mt-5">
                <InfoRow label="✅ Free to use">
                  No credit card. No premium tiers.
                </InfoRow>
                <InfoRow label="✅ Private by default">
                  Your documents are yours. We never sell or share your data.
                </InfoRow>
                <InfoRow label="✅ Auto-save & Cloud Backup">
                  Everything saves automatically — no button needed.
                </InfoRow>
                <InfoRow label="✅ Restore on any device">
                  Use your User ID + PIN to bring all your documents anywhere.
                </InfoRow>
                <InfoRow label="✅ Full control">
                  Download your documents, delete your account, anytime.
                </InfoRow>
                <InfoRow label="✅ Clean experience">
                  A distraction-free experience from start to finish.
                </InfoRow>
              </div>
            </Section>

            <Section icon={<Database size={16} />} title="Information We Collect">
              <p className="mb-4">
                We only collect the information necessary to provide our services. Here's what we collect and why:
              </p>

              <SubSection title="Personal Information">
                <p>
                  When you start, we ask only for your name. Any other details — such as an email address, phone number, or home address — are collected only if you choose to type them into your CV or cover letter. They are used to generate your documents and are stored as part of your document data.
                </p>
              </SubSection>

              <SubSection title="Document Content">
                <p>
                  Everything you type into the CV builder or cover letter editor — work experience, education, skills, projects, certifications, languages, achievements, and AI-generated content. This is the core data we store and sync.
                </p>
              </SubSection>

              <SubSection title="Profile Photos">
                <p>
                  If you upload a profile photo for your CV, it is stored locally in your browser's IndexedDB. If a photo is saved together with a CV that gets synced, it is stored with that CV in your private cloud storage. Photos are never shared with third parties.
                </p>
              </SubSection>

              <SubSection title="Contact & Feedback Messages">
                <p>
                  If you write to us through the Contact or Feedback form, we collect the name, message, and email address you enter (and, for feedback, your star rating; your email is kept only if you ask for a reply). These are stored in a private sheet and forwarded to our team by email so we can reply and improve the app. They are not linked to your User ID.
                </p>
              </SubSection>

              <SubSection title="Usage Analytics (Google Analytics)">
                <p>
                  Once you have accepted this policy, we use Google Analytics to understand how people use the app — which pages are visited, how long sessions last, and which features are used. This data is aggregated and pseudonymized (it relies on a random browser identifier, not your name). We never send your name, email address, User ID, or document content to Google Analytics, and Google Analytics is not loaded before you accept. We keep analytics data for up to 14 months.
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
                  When you restore your data on another device using your User ID and PIN, we retrieve your documents from your private cloud storage so you can continue exactly where you left off.
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

            <Section icon={<HardDrive size={16} />} title="Data Storage & Auto-Sync" highlight>
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
                  Your documents are <strong className="text-slate-800">automatically synced</strong> to our secure cloud database (hosted on Google Sheets) whenever you create, edit, or save a document. This happens silently in the background — you don't need to click any button or enable any setting.
                </p>
                <p className="mt-3">
                  This automatic sync is what makes the "Restore on another device" feature possible. When you enter your User ID and PIN on a new device, we pull your documents from your private cloud storage.
                </p>
              </SubSection>

              <SubSection title="How the Sync Works">
                <p>
                  Your data is transmitted over HTTPS and stored in a private Google Sheet, linked to your unique User ID. Every request must carry a server-side secret and a personal access token that is issued to your device when you create or restore your account, so knowing a User ID alone is not enough to read anything. We never share the sheet publicly, and no other user can read your data.
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

              <SubSection title="Access Control">
                <p>
                  Your data is keyed by your unique User ID (a long, randomly generated string). To read or change it, a request needs both your User ID and a secret access token that is issued only to your own devices. We store that token only as a one-way hash.
                </p>
              </SubSection>

              <SubSection title="PIN Protection">
                <p>
                  Your PIN is checked on our server and stored only as a keyed one-way hash — never in readable form. Very common PINs (such as 0000 or 1234) are rejected. After 5 wrong attempts the account is locked for one hour. Deleting an account that has a PIN requires re-entering the PIN.
                </p>
              </SubSection>

              <SubSection title="How Your Documents Are Stored">
                <p>
                  Your documents are stored as readable text in our private Google Sheet. We do not add our own end-to-end encryption, because the app needs to read your content to show your CV, generate PDFs, power AI suggestions, and restore your data on another device. The sheet is protected by Google's encryption at rest and can be opened only by authorized Adin AI administrators. We do not browse user documents; we open them only when necessary to keep the service running, investigate abuse, or fix a problem you have reported.
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

            <Section icon={<KeyRound size={16} />} title="Restore Access: User ID & PIN">
              <p className="mb-4">
                To keep your account secure across devices, we use a simple two-part system: a <strong className="text-slate-800">User ID</strong> and a <strong className="text-slate-800">4-digit PIN</strong>.
              </p>

              <SubSection title="Your User ID">
                <p>
                  When you first start using Adin AI, we generate a unique User ID for you (something like <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">ADN-XXXXXX</code>). This ID is your account key — it's how the cloud knows which documents belong to you.
                </p>
              </SubSection>

              <SubSection title="Your PIN">
                <p>
                  You can set a 4-digit PIN from your profile menu at any time. The PIN is required to restore your data on a new device: both your User ID and your PIN must be entered. If you never set a PIN, your documents stay available on the device where you created them, but they cannot be restored on another device.
                </p>
              </SubSection>

              <SubSection title="Setting or Changing Your PIN">
                <p>
                  You have full control over your PIN:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>Open your profile menu.</li>
                  <li>Tap "Set PIN" if you haven't set one, or "Change PIN" if you already have.</li>
                  <li>Enter a new 4-digit PIN and confirm.</li>
                  <li>Your PIN is updated instantly. You can change it anytime — as often as you like.</li>
                </ul>
              </SubSection>

              <SubSection title="Restoring Your Data on a New Device">
                <p>
                  If you switch browsers or get a new device, you can restore everything with two simple steps:
                </p>
                <ol className="mt-3 space-y-2 text-sm text-slate-600 list-decimal list-inside">
                  <li>Open Adin AI and click "Restore from another device" on the onboarding screen.</li>
                  <li>Enter your User ID and the 4-digit PIN you set.</li>
                </ol>
                <p className="mt-3">
                  That's it — all your CVs and cover letters (and any photos saved with them) are pulled from your private cloud storage and loaded onto the new device.
                </p>
              </SubSection>

              <SubSection title="Forgot Your PIN?">
                <p>
                  If you forget your PIN, you can set a new one from the profile menu on a device where you are already using your account. We cannot reset a PIN for you from the outside, because Guest Accounts have no email on file and we have no way to verify who you are — so please keep your PIN somewhere safe.
                </p>
              </SubSection>

              <SubSection title="Forgot Your User ID?">
                <p>
                  If you can't remember your User ID, you can download it as a <strong className="text-slate-800">.txt file</strong> from your profile menu at any time. We recommend saving this file somewhere safe — your email, notes app, or cloud drive.
                </p>
              </SubSection>
            </Section>

            <Section icon={<Download size={16} />} title="Downloading Your Data" highlight>
              <p className="mb-4">
                You own your data. Here are the ways you can download and keep a copy of it:
              </p>

              <SubSection title="Download Your User ID">
                <p>
                  From your profile menu, you can download a <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">.txt</code> file containing your User ID and instructions on how to use it to restore your account. Keep this file safe — it's your backup key.
                </p>
              </SubSection>

              <SubSection title="Export Your Documents">
                <p>
                  Every CV and cover letter can be exported as <strong className="text-slate-800">PDF</strong>, <strong className="text-slate-800">PNG</strong>, or <strong className="text-slate-800">TXT</strong> at any time. We recommend downloading your important documents and saving them locally (or on a drive) as an extra backup — but this is optional. We will never force you to download anything.
                </p>
              </SubSection>

              <SubSection title="No Forced Actions">
                <p>
                  You are never required to set a PIN, download your ID, or export your documents to use Adin AI. These are simply tools to help you protect and back up your data — the choice is entirely yours. (A PIN is only needed if you want to restore your documents on another device.)
                </p>
              </SubSection>
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
                  When you accept this policy at the start (including automatic cloud sync of your documents and Google Analytics usage statistics), and for optional features such as submitting feedback.
                </p>
              </SubSection>

              <SubSection title="Legal Obligation">
                <p>
                  To comply with applicable laws (e.g., responding to lawful requests from authorities).
                </p>
              </SubSection>
            </Section>

            <Section icon={<Trash2 size={16} />} title="Data Retention & Deletion" highlight>
              <p className="mb-4">
                You have full control over your data. Here's exactly what happens when you delete your account from the profile menu:
              </p>

              <SubSection title="How to Delete Your Account">
                <p>
                  Open your profile menu, tap "Delete my account", and confirm. To prevent accidental deletion, you will be asked for your <strong className="text-slate-800">User ID</strong> and — if you set one — your <strong className="text-slate-800">4-digit PIN</strong>. This is a security measure to protect your account from unauthorized deletion.
                </p>
              </SubSection>

              <SubSection title="Immediate Deletion">
                <p>
                  Your name, User ID, and all your CVs and cover letters (including any email, phone number, or photo inside them) are removed from our active cloud database within seconds, and your devices' access tokens stop working.
                </p>
              </SubSection>

              <SubSection title="Local Data Cleared">
                <p>
                  Your browser's localStorage, sessionStorage, and IndexedDB entries are cleared immediately.
                </p>
              </SubSection>

              <SubSection title="Version History & Technical Records">
                <p>
                  Our cloud database is a Google Sheet, and Google Sheets keeps an internal version history of the file. Deleted data may therefore remain in older versions of the sheet, visible only to authorized administrators, until those versions are purged. We do not use this history to restore deleted accounts. Short-lived technical records, such as the counters we use to rate-limit abuse, may also remain for a brief period.
                </p>
              </SubSection>

              <SubSection title="Contact & Feedback Messages">
                <p>
                  Messages you send through the Contact or Feedback forms are not linked to your User ID, so deleting your account does not remove them automatically. To have them deleted, ask us through the contact form and we will remove them.
                </p>
              </SubSection>
            </Section>

            <Section icon={<HardDrive size={16} />} title="Local Storage & Browser Data">
              <p className="mb-4">
                Adin AI itself does <strong className="text-slate-800">not set its own cookies</strong>. Instead, it keeps your preferences and documents using modern browser storage technologies (Google Analytics may set its own cookies once you accept — see below):
              </p>

              <SubSection title="localStorage">
                <p>
                  Stores your app preferences, session state, document metadata, the access token that keeps this device signed in to your account, and your analytics choice. Persists across browser sessions.
                </p>
              </SubSection>

              <SubSection title="sessionStorage">
                <p>
                  Stores temporary data that resets when you close the tab — such as which page you were on.
                </p>
              </SubSection>

              <SubSection title="IndexedDB">
                <p>
                  Stores larger data like your profile photos locally, for faster loading.
                </p>
              </SubSection>

              <SubSection title="Analytics Cookies">
                <p>
                  We do not use advertising cookies or third-party tracking pixels. Once you have accepted this policy, Google Analytics may set its own cookies (for example, ones named <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">_ga</code>) to tell visits apart and produce aggregated statistics. Analytics is not loaded before you accept, we do not send your name, email, User ID, or document content to it, and we switch off Google's advertising features for our analytics.
                </p>
              </SubSection>
            </Section>

            <Section icon={<Database size={16} />} title="Third-Party Services">
              <p className="mb-4">
                We rely on these trusted third-party services to operate the app:
              </p>

              <SubSection title="Google Sheets (Cloud Storage)">
                <p>
                  Stores your synced documents in a private Google Sheet linked to your User ID, protected by Google's encryption at rest and by access controls on our side.
                </p>
              </SubSection>

              <SubSection title="Groq / OpenRouter (AI Providers)">
                <p>
                  Powers AI text generation for summaries, experience descriptions, skills, and cover letters. Only the content needed for a generation request is sent (this can include details you typed, such as your name or work history, in the part of the CV being improved); your full document history is never shared. These providers handle that content under their own privacy policies.
                </p>
              </SubSection>

              <SubSection title="Vercel (Hosting)">
                <p>
                  Hosts the website and the server functions that handle requests. Like any host, it processes technical data such as IP addresses and request logs.
                </p>
              </SubSection>

              <SubSection title="Google Mail (Contact & Feedback Notifications)">
                <p>
                  When you send a message through the Contact or Feedback form, a notification is emailed to our team through Google's mail service.
                </p>
              </SubSection>

              <SubSection title="Google Analytics (Aggregated)">
                <p>
                  Provides aggregated, pseudonymized statistics on how the app is used (pages visited, features used), so we can improve the experience. Loaded only after you accept this policy; data is kept for up to 14 months.
                </p>
              </SubSection>
            </Section>

            <Section icon={<Globe size={16} />} title="International Data Transfers">
              <p>
                Our cloud storage is hosted on Google's infrastructure, which may store data in the United States or other regions outside your country of residence.
              </p>
              <p className="mt-3">
                By using Adin AI, you consent to this transfer. We ensure appropriate safeguards are in place — HTTPS encryption in transit, access controls at rest, and Google's standard contractual clauses — to protect your data during transfer and storage.
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
                Notify the relevant data protection authorities <strong className="text-slate-800">within 72 hours</strong> of becoming aware of the breach, where required by law, and notify affected users without undue delay. Because Guest Accounts have no email on file, we will do this through a prominent notice in the app and on our website. The notice will describe what happened, what data was affected, what we're doing about it, and what steps you can take.
              </p>
              <p className="mt-3">
                If you have written to us through the contact form, we may also email you at the address you gave.
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
                  You can delete your account and all data from the profile menu, using your User ID (and your PIN, if you set one) to confirm.
                </p>
              </SubSection>

              <SubSection title="Right to Portability">
                <p>
                  You can download your User ID file to keep as a backup, and export your documents as PDF, PNG, or TXT at any time.
                </p>
              </SubSection>

              <SubSection title="Right to Restriction and Objection">
                <p>
                  You can request that we limit how your data is used, or object to processing based on legitimate interest. Contact us to exercise these rights.
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
                Adin AI is <strong className="text-slate-800">100% free</strong> to use, with no hidden charges, no premium tiers, and no paid upgrades.
              </p>

              <SubSection title="No Payment Required">
                <p>
                  You will never be asked for a credit card, bank details, or any form of payment to use any feature of Adin AI.
                </p>
              </SubSection>

              <SubSection title="No Hidden Charges">
                <p>
                  Every feature you see is included. There are no "premium" templates, no "unlock" buttons, and no watermarks.
                </p>
              </SubSection>

              <SubSection title="Free to Use (Until Further Notice)">
                <p>
                  Adin AI is free today and we intend to keep the core features free. If we ever introduce optional paid features in the future, we will clearly announce them in advance — and existing free features will remain free.
                </p>
              </SubSection>
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