// src/config/toolLandingContent.ts
// ============================================================
// toolLandingContent.ts — PUBLIC SEO LANDING PAGES (content only)
//   /free-cv-builder
//   /free-cover-letter-generator
// ============================================================

import { canonicalFor } from './site';

export type ToolSlug =
  | 'free-cv-builder'
  | 'free-cover-letter-generator'
  | 'pk/cv-format'
  | 'pk/cv-for-fresh-graduates'
  | 'pk/job-application-letter'
  | 'pk/cover-letter-for-freshers';

export interface ToolLandingContent {
  slug: ToolSlug;
  /** label App.tsx keeps in `active` for this page (used to find the right content) */
  activeLabel: string;
  path: string;
  seoKey: string;
  ctaTarget: 'cv' | 'cover-letter';
  breadcrumb: string;
  eyebrow: string;
  h1: string;
  intro: string;
  ctaLabel: string;
  ctaNote: string;
  highlights: string[];
  fan: { src: string; alt: string; pill?: string }[];
  galleryTitle: string;
  gallerySubtitle: string;
  gallery: { name: string; subtitle: string; image: string }[];
  galleryCta: string;
  galleryHref: string;
  tipsTitle: string;
  tips: string[];
  featuresTitle: string;
  features: { title: string; text: string }[];
  stepsTitle: string;
  steps: { title: string; text: string }[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
  guidesTitle: string;
  guides: { label: string; href: string }[];
  related: { label: string; href: string }[];
}

export const TOOL_LANDING_CONTENT: Record<ToolSlug, ToolLandingContent> = {
  // ══════════════════════════════════════════════
  // FREE CV BUILDER
  // ══════════════════════════════════════════════
  'free-cv-builder': {
    slug: 'free-cv-builder',
    activeLabel: 'Free CV Builder',
    path: '/free-cv-builder',
    seoKey: 'free-cv-builder',
    ctaTarget: 'cv',
    breadcrumb: 'CV Builder',
    eyebrow: 'Completely free to use', // ✅ UPDATED
    h1: 'Free CV Builder: Create a Professional, ATS-Friendly CV Online',
    intro:
      'Adin AI is a free CV builder with AI-powered writing help and a growing library of professional templates. Choose a design, fill in your details and download your CV as PDF, PNG or TXT.',
    ctaLabel: 'Build My CV',
    ctaNote: 'It\'s completely free · No watermark',
    highlights: [
      'Completely free', // ✅ UPDATED
      'ATS-friendly templates',
      'PDF, PNG & TXT download',
      'AI writing help',
    ],
    fan: [
      { src: '/Templates/images/classic.webp', alt: 'Classic CV template' },
      { src: '/Templates/images/executive.webp', alt: 'Executive CV template' },
      { src: '/Templates/images/minimal.webp', alt: 'Minimal CV template' },
      { src: '/Templates/images/teal-curve.webp', alt: 'Teal Curve CV template' },
      { src: '/Templates/images/modern.webp', alt: 'Modern CV template', pill: 'CV Template' },
    ],
    galleryTitle: 'Choose a professional CV template',
    gallerySubtitle: 'Hand-crafted, ATS-friendly designs. Pick one and start building instantly.',
    gallery: [
      { name: 'Modern', subtitle: 'Purple Accent', image: '/Templates/images/modern.webp' },
      { name: 'Minimal', subtitle: 'Clean Layout', image: '/Templates/images/minimal.webp' },
      { name: 'Teal Curve', subtitle: 'Bold Teal Header', image: '/Templates/images/teal-curve.webp' },
      { name: 'Executive', subtitle: 'Navy & Gold', image: '/Templates/images/executive.webp' },
      { name: 'Creative', subtitle: 'Dark Sidebar', image: '/Templates/images/creative.webp' },
      { name: 'ATS Pro', subtitle: 'Maroon Accents', image: '/Templates/images/ats-pro.webp' },
    ],
    galleryCta: 'View all CV templates',
    galleryHref: '/templates',
    tipsTitle: 'ATS-friendly CV tips',
    tips: [
      'Use a simple, single-column layout on a white background.',
      'Stick to standard headings: Experience, Education, Skills and Projects.',
      'Mirror keywords from the job description wherever they honestly describe your work.',
      'Replace the old "Objective" line with a short Professional Summary that shows your value.',
      'Show results, not just duties — for example numbers and outcomes.',
      'Save your CV as a text-based PDF, not a scanned image.',
    ],
    featuresTitle: 'Everything you need to build a CV that gets noticed',
    features: [
      {
        title: 'AI-powered writing',
        text: 'Get help with your professional summary, experience descriptions and skills, so every section reads clearly and professionally.',
      },
      {
        title: 'ATS-friendly templates',
        text: 'Choose from modern, classic, minimal and executive designs, including ATS-friendly layouts that are easy for applicant tracking systems to read.',
      },
      {
        title: 'Instant download',
        text: 'Export your finished CV as a PDF, PNG or TXT file in one click.',
      },
      {
        title: 'Completely free to use', // ✅ UPDATED
        text: 'Start building right away. 100% free with no watermark on your CV.', // ✅ UPDATED
      },
      {
        title: 'Secure and private',
        text: 'Your work is protected, with secure cloud sync so you do not lose the CVs you have built.',
      },
      {
        title: 'Made for job seekers in Pakistan',
        text: 'Adin AI is built with Pakistani job seekers in mind, with CV guides written for the local job market.',
      },
    ],
    stepsTitle: 'How to build your CV in 3 steps',
    steps: [
      {
        title: 'Choose a template',
        text: 'Browse the free CV templates and pick the design that suits your field.',
      },
      {
        title: 'Add your details',
        text: 'Fill in your education, experience and skills, and use AI to polish your summary and descriptions.',
      },
      {
        title: 'Download your CV',
        text: 'Preview your CV, then export it as a PDF, PNG or TXT file.',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        q: 'Is the Adin AI CV builder really free?',
        a: 'Yes. You can build your CV for free right now — there are no hidden charges and no watermark.',
      },
      {
        q: 'Are the CV templates ATS-friendly?',
        a: 'Adin AI offers ATS-friendly CV templates. For the best results with applicant tracking systems, use a simple single-column layout, standard headings such as Experience, Education and Skills, and include keywords from the job description.',
      },
      {
        q: 'Which file formats can I download?',
        a: 'You can download your CV as a PDF, PNG or TXT file.',
      },
      {
        q: 'What does the AI help me write?',
        a: 'The AI helps with your professional summary, experience descriptions and skills section. You can review and edit everything before you download.',
      },
      {
        q: 'Can I build a CV if I have no work experience?',
        a: 'Yes. Put your education, projects, skills and any internships or volunteer work first. Our fresher CV guide explains how.',
      },
    ],
    guidesTitle: 'CV guides from the Adin AI blog',
    guides: [
      { label: 'ATS-Friendly CV Kya Hota Hai?', href: '/blog/ats-friendly-cv-kya-hai' },
      { label: 'Fresher CV Kaise Banayein?', href: '/blog/fresher-cv-kaise-banayein' },
      { label: 'Aapka CV In 5 Galtiyon Ki Wajah Se Reject Ho Sakta Hai', href: '/blog/naya-job-chahiye-cv-mistakes' },
    ],
    related: [
      { label: 'Free CV templates', href: '/templates' },
      { label: 'CV format in Pakistan', href: '/pk/cv-format' },
      { label: 'CV for fresh graduates in Pakistan', href: '/pk/cv-for-fresh-graduates' },
      { label: 'Free cover letter generator', href: '/free-cover-letter-generator' },
      { label: 'Free cover letter templates', href: '/cover-templates' },
    ],
  },

  // ══════════════════════════════════════════════
  // FREE COVER LETTER GENERATOR
  // ══════════════════════════════════════════════
  'free-cover-letter-generator': {
    slug: 'free-cover-letter-generator',
    activeLabel: 'Free Cover Letter Generator',
    path: '/free-cover-letter-generator',
    seoKey: 'free-cover-letter-generator',
    ctaTarget: 'cover-letter',
    breadcrumb: 'Cover Letter',
    eyebrow: 'Completely free to use', // ✅ UPDATED
    h1: 'Free Cover Letter Generator: Write a Professional Cover Letter in Seconds',
    intro:
      'Adin AI is a free AI cover letter generator. Add your details, get a clear and professional draft in seconds, then edit it so it sounds like you.',
    ctaLabel: 'Write My Cover Letter',
    ctaNote: 'It\'s completely free · No watermark',
    highlights: [
      'Completely free', // ✅ UPDATED
      'Editable AI draft',
      'Professional designs',
      'Instant download',
    ],
    fan: [
      { src: '/Templates/images/cover-classic.webp', alt: 'Classic cover letter template' },
      { src: '/Templates/images/cover-creative.webp', alt: 'Creative cover letter template' },
      { src: '/Templates/images/cover-modern.webp', alt: 'Modern cover letter template' },
      { src: '/Templates/images/cover-professional.webp', alt: 'Professional cover letter template' },
      { src: '/Templates/images/cover-executive.webp', alt: 'Executive cover letter template', pill: 'Cover Letter' },
    ],
    galleryTitle: 'Choose a professional cover letter template',
    gallerySubtitle: 'Six hand-crafted designs, from classic to creative. Pick one and start writing instantly.',
    gallery: [
      { name: 'Modern', subtitle: 'Teal Header', image: '/Templates/images/cover-modern.webp' },
      { name: 'Classic', subtitle: 'Timeless Formal', image: '/Templates/images/cover-classic.webp' },
      { name: 'Minimal', subtitle: 'Centered Header', image: '/Templates/images/cover-minimal.webp' },
      { name: 'Professional', subtitle: 'Dark Teal Bar', image: '/Templates/images/cover-professional.webp' },
      { name: 'Executive', subtitle: 'Navy & Gold', image: '/Templates/images/cover-executive.webp' },
      { name: 'Creative', subtitle: 'Black Band', image: '/Templates/images/cover-creative.webp' },
    ],
    galleryCta: 'View all cover letter templates',
    galleryHref: '/cover-templates',
    tipsTitle: 'Cover letter writing tips',
    tips: [
      'Greet the hiring manager by name if you can find it; otherwise use "Dear Hiring Manager".',
      'Open with the exact role and company, then one line on why you are a strong fit.',
      'Use the middle paragraph for one or two specific achievements, not a copy of your CV.',
      'Close with a thank-you and a clear note that you are ready for an interview.',
      'Keep it to three or four short paragraphs on a single page.',
      'Proofread twice before you send it.',
    ],
    featuresTitle: 'A cover letter that supports your CV',
    features: [
      {
        title: 'AI-written first draft',
        text: 'Add your details and get a professional, tailored draft in seconds. You stay in control and can edit every line.',
      },
      {
        title: 'Professional designs',
        text: 'Pick from classic, modern, minimal, executive, professional and creative cover letter templates.',
      },
      {
        title: 'Short and focused',
        text: 'A good cover letter has a clear introduction, a body about the value you bring and a polite closing, kept to one page.',
      },
      {
        title: 'Completely free to use', // ✅ UPDATED
        text: 'Start writing instantly with no watermark on your cover letter.', // ✅ UPDATED
      },
      {
        title: 'Works with your CV',
        text: 'Use it together with the Adin AI CV builder so your CV and cover letter look professional and consistent.',
      },
      {
        title: 'Formal English drafts',
        text: 'Drafts are written in formal English, which suits most job applications in Pakistan.',
      },
    ],
    stepsTitle: 'How to write your cover letter in 3 steps',
    steps: [
      {
        title: 'Choose a design',
        text: 'Browse the free cover letter templates and pick a style that fits the job.',
      },
      {
        title: 'Add your details',
        text: 'Enter your details and let AI write a professional draft for you.',
      },
      {
        title: 'Review, edit and download',
        text: 'Read the draft, edit it so it reflects your own experience, then download your cover letter.',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        q: 'Is the cover letter generator free?',
        a: 'Yes. You can write your cover letter for free right now — there are no hidden charges and no watermark.',
      },
      {
        q: 'Can I edit the cover letter the AI writes?',
        a: 'Yes. The AI creates a draft that you should review and edit so it reflects your own experience and the job you are applying for.',
      },
      {
        q: 'How long should a cover letter be?',
        a: 'Keep it to one page: three to four short paragraphs covering who you are, what you can offer the company, and a polite thank-you with your availability for an interview.',
      },
      {
        q: 'Should I write my cover letter in English or Urdu?',
        a: 'For most jobs in Pakistan, use formal English and avoid Urdu or Roman Urdu words, unless the employer asks for something different.',
      },
      {
        q: 'What mistakes should I avoid in a cover letter?',
        a: 'Avoid a copy-pasted generic template, opening with "To Whom It May Concern", repeating your whole CV, spelling mistakes and letters longer than one page.',
      },
    ],
    guidesTitle: 'Cover letter guides from the Adin AI blog',
    guides: [
      { label: 'Cover Letter Kaise Likhein? (Pakistan Ke Liye Best Guide)', href: '/blog/cover-letter-kaise-likhein' },
      { label: 'Cover Letter Ki 5 Badi Galtiyan', href: '/blog/cover-letter-ki-5-badi-galtiyan' },
    ],
    related: [
      { label: 'Free cover letter templates', href: '/cover-templates' },
      { label: 'Job application letter in Pakistan', href: '/pk/job-application-letter' },
      { label: 'Cover letter for freshers in Pakistan', href: '/pk/cover-letter-for-freshers' },
      { label: 'Free CV builder', href: '/free-cv-builder' },
      { label: 'Free CV templates', href: '/templates' },
    ],
  },

  // ══════════════════════════════════════════════
  // PAKISTAN — CV FORMAT (/pk/cv-format)
  // ══════════════════════════════════════════════
  'pk/cv-format': {
    slug: 'pk/cv-format',
    path: '/pk/cv-format',
    seoKey: 'pk/cv-format',
    activeLabel: 'CV Format in Pakistan',
    ctaTarget: 'cv',
    breadcrumb: 'CV Format in Pakistan',
    eyebrow: 'Free CV format for Pakistan job seekers',
    h1: 'CV Format in Pakistan: A Free, Professional Template and Step-by-Step Guide',
    intro:
      'Not sure what a CV should look like for jobs in Pakistan? Build one in the clear, standard format employers expect: contact details, a short summary, education, experience and skills. Pick a free template, fill in your details and download your CV as PDF, PNG or TXT.',
    ctaLabel: 'Build My CV Now',
    ctaNote: "It's completely free · No watermark",
    highlights: [
      'Clear, standard CV structure',
      'Completely free',
      'ATS-friendly templates',
      'PDF, PNG & TXT download',
    ],
    fan: [
      { src: '/Templates/images/classic.webp', alt: 'Classic CV format template' },
      { src: '/Templates/images/executive.webp', alt: 'Executive CV format template' },
      { src: '/Templates/images/minimal.webp', alt: 'Minimal CV format template' },
      { src: '/Templates/images/teal-curve.webp', alt: 'Teal Curve CV format template' },
      { src: '/Templates/images/modern.webp', alt: 'Modern CV format template', pill: 'CV Format' },
    ],
    galleryTitle: 'Pick a CV format that suits your job',
    gallerySubtitle: 'Clean, professional designs that follow the standard CV structure. Choose one and start building instantly.',
    gallery: [
      { name: 'Minimal', subtitle: 'Clean Layout', image: '/Templates/images/minimal.webp' },
      { name: 'ATS Pro', subtitle: 'Maroon Accents', image: '/Templates/images/ats-pro.webp' },
      { name: 'Modern', subtitle: 'Purple Accent', image: '/Templates/images/modern.webp' },
      { name: 'Executive', subtitle: 'Navy & Gold', image: '/Templates/images/executive.webp' },
      { name: 'Teal Curve', subtitle: 'Bold Teal Header', image: '/Templates/images/teal-curve.webp' },
      { name: 'Creative', subtitle: 'Dark Sidebar', image: '/Templates/images/creative.webp' },
    ],
    galleryCta: 'View all CV templates',
    galleryHref: '/templates',
    tipsTitle: 'What to include in a CV in Pakistan',
    tips: [
      'Start with your full name, mobile number, email address and city. Use a professional email address, not a nickname.',
      'Add a short professional summary of three to four lines instead of a long "career objective".',
      'List education with the latest degree first: degree, institute, year and CGPA or percentage.',
      'Put work experience next, with your job title, company, dates and two to four results-focused points for each role.',
      'Add the skills, certifications and projects that match the job advert, using its keywords where they honestly describe you.',
      'Keep your CV to one or two pages and send it as a PDF unless the employer asks for another format.',
    ],
    featuresTitle: 'Build your CV in the right format, faster',
    features: [
      {
        title: 'AI-powered writing',
        text: 'Get help writing your professional summary, experience points and skills, then edit everything so it sounds like you.',
      },
      {
        title: 'Ready-made CV structure',
        text: 'Every template follows a clear, standard order of sections, so you never have to guess what goes first.',
      },
      {
        title: 'Instant download',
        text: 'Export your finished CV as a PDF, PNG or TXT file in one click.',
      },
      {
        title: 'Completely free to use',
        text: 'Build and download your CV without paying and without a watermark.',
      },
      {
        title: 'Saved to your account',
        text: 'Your CVs are saved securely, so you can edit and download them again whenever you apply for a new job.',
      },
      {
        title: 'Made for job seekers in Pakistan',
        text: 'Our CV guides are written for the Pakistani job market, including Roman Urdu guides on the Adin AI blog.',
      },
    ],
    stepsTitle: 'How to make a CV in the right format in 3 steps',
    steps: [
      {
        title: 'Choose a template',
        text: 'Browse the free CV templates and pick a clean layout that suits your field.',
      },
      {
        title: 'Fill in each section',
        text: 'Add your contact details, summary, education, experience and skills. Use AI to polish the wording.',
      },
      {
        title: 'Download your CV',
        text: 'Check the preview, then export your CV as a PDF, PNG or TXT file.',
      },
    ],
    faqTitle: 'CV format in Pakistan: frequently asked questions',
    faqs: [
      {
        q: 'What is the correct CV format in Pakistan?',
        a: 'There is no single official format. Most employers expect a clear, reverse-chronological CV: contact details, a short summary, education, work experience, skills and, where relevant, projects and certifications. Keep it to one or two pages with a simple layout and a readable font.',
      },
      {
        q: 'Should I put my photo on my CV in Pakistan?',
        a: 'It depends on the employer. Many Pakistani employers are used to seeing a photo, but it is not required for every job, and it is often left out when applying to international companies. If the job advert asks for a photo, add a recent, professional one. Otherwise you can leave it out.',
      },
      {
        q: "Should I include my CNIC, father's name or date of birth?",
        a: 'These details appear on many traditional Pakistani CVs, but they are not needed to get shortlisted. Avoid writing your full CNIC number on a CV you upload to job sites or share publicly, because it is sensitive personal information. Add details such as date of birth only if the employer asks for them.',
      },
      {
        q: 'Is there a difference between a CV and a resume in Pakistan?',
        a: 'Many employers in Pakistan use the two words for the same document, so you do not need to worry about the name. What matters is that your document is clear, accurate and well organised.',
      },
      {
        q: 'Can I download my CV in MS Word format?',
        a: 'Adin AI lets you download your CV as a PDF, PNG or TXT file. We recommend PDF because it keeps your layout exactly the same on every device. Word (.docx) download is not available at the moment.',
      },
      {
        q: 'How long should a CV be?',
        a: 'One page is enough for fresh graduates and early-career candidates. Experienced professionals can use two pages. Avoid going beyond that.',
      },
      {
        q: 'Is this CV maker really free?',
        a: 'Yes. You can build and download your CV for free right now. There are no hidden charges and no watermark.',
      },
    ],
    guidesTitle: 'CV guides from the Adin AI blog',
    guides: [
      { label: 'ATS-Friendly CV Kya Hota Hai?', href: '/blog/ats-friendly-cv-kya-hai' },
      { label: 'Fresher CV Kaise Banayein?', href: '/blog/fresher-cv-kaise-banayein' },
      { label: 'Aapka CV In 5 Galtiyon Ki Wajah Se Reject Ho Sakta Hai', href: '/blog/naya-job-chahiye-cv-mistakes' },
    ],
    related: [
      { label: 'CV for fresh graduates in Pakistan', href: '/pk/cv-for-fresh-graduates' },
      { label: 'Job application letter in Pakistan', href: '/pk/job-application-letter' },
      { label: 'Free CV templates', href: '/templates' },
    ],
  },

  // ══════════════════════════════════════════════
  // PAKISTAN — FRESH GRADUATES (/pk/cv-for-fresh-graduates)
  // ══════════════════════════════════════════════
  'pk/cv-for-fresh-graduates': {
    slug: 'pk/cv-for-fresh-graduates',
    path: '/pk/cv-for-fresh-graduates',
    seoKey: 'pk/cv-for-fresh-graduates',
    activeLabel: 'CV for Fresh Graduates in Pakistan',
    ctaTarget: 'cv',
    breadcrumb: 'CV for Fresh Graduates',
    eyebrow: 'Free fresher CV maker for Pakistan',
    h1: 'CV for Fresh Graduates in Pakistan: Make a Strong CV With No Experience',
    intro:
      'No work experience yet? You can still make a strong CV. Adin AI helps fresh graduates in Pakistan put education, projects, internships and skills first, then download a professional CV as PDF, PNG or TXT, free and without a watermark.',
    ctaLabel: 'Build My Fresher CV',
    ctaNote: "It's completely free · No watermark",
    highlights: [
      'Made for fresh graduates',
      'No experience needed',
      'Completely free',
      'ATS-friendly templates',
    ],
    fan: [
      { src: '/Templates/images/minimal.webp', alt: 'Minimal fresher CV template' },
      { src: '/Templates/images/ats-pro.webp', alt: 'ATS Pro fresher CV template' },
      { src: '/Templates/images/classic.webp', alt: 'Classic fresher CV template' },
      { src: '/Templates/images/teal-curve.webp', alt: 'Teal Curve fresher CV template' },
      { src: '/Templates/images/modern.webp', alt: 'Modern fresher CV template', pill: 'Fresher CV' },
    ],
    galleryTitle: 'Choose a CV template for fresh graduates',
    gallerySubtitle: 'Simple, professional layouts that work well when your education and projects lead. Pick one and start building.',
    gallery: [
      { name: 'Minimal', subtitle: 'Clean Layout', image: '/Templates/images/minimal.webp' },
      { name: 'ATS Pro', subtitle: 'Maroon Accents', image: '/Templates/images/ats-pro.webp' },
      { name: 'Modern', subtitle: 'Purple Accent', image: '/Templates/images/modern.webp' },
      { name: 'Classic', subtitle: 'Timeless Formal', image: '/Templates/images/classic.webp' },
      { name: 'Teal Curve', subtitle: 'Bold Teal Header', image: '/Templates/images/teal-curve.webp' },
      { name: 'Creative', subtitle: 'Dark Sidebar', image: '/Templates/images/creative.webp' },
    ],
    galleryCta: 'View all CV templates',
    galleryHref: '/templates',
    tipsTitle: 'CV tips for fresh graduates',
    tips: [
      'Put education first: degree, university, graduation year and your CGPA or percentage if it is strong.',
      'Describe your final year project (FYP): what you built, the tools you used and the result.',
      'Include internships, volunteer work, society roles and freelance gigs. They all count as experience.',
      'Add a skills section with the tools the job asks for, such as MS Office, Excel, a programming language or design software.',
      'Write a three-line summary that names your degree, your strongest skills and the kind of role you want.',
      'Keep your CV to one page, use a simple layout and send it as a PDF.',
    ],
    featuresTitle: 'Everything a fresh graduate needs for a first CV',
    features: [
      {
        title: 'AI-powered writing',
        text: 'Not sure how to describe your projects or internships? Get help with your summary and descriptions, then edit them in your own words.',
      },
      {
        title: 'Education-first layouts',
        text: 'Choose a clean template and move your education and projects to the top when you have little work history.',
      },
      {
        title: 'Instant download',
        text: 'Export your CV as a PDF, PNG or TXT file in one click, ready for job portals and email applications.',
      },
      {
        title: 'Completely free to use',
        text: 'Start for free and download your CV without a watermark. No payment is needed.',
      },
      {
        title: 'Edit any time',
        text: 'Your CV is saved to your account, so you can add a new project, internship or certificate whenever you need to.',
      },
      {
        title: 'Made for students in Pakistan',
        text: 'Our Roman Urdu fresher CV guide on the blog explains the basics in simple language.',
      },
    ],
    stepsTitle: 'How to make a fresher CV in 3 steps',
    steps: [
      {
        title: 'Choose a simple template',
        text: 'Pick a clean one-column design. It is the easiest layout for employers and applicant tracking systems to read.',
      },
      {
        title: 'Lead with education and projects',
        text: 'Add your degree, FYP, internships, skills and certificates. Use AI to polish your summary.',
      },
      {
        title: 'Download and apply',
        text: 'Preview your CV, then export it as a PDF, PNG or TXT file and start applying.',
      },
    ],
    faqTitle: 'CV for fresh graduates: frequently asked questions',
    faqs: [
      {
        q: 'Can I make a CV with no work experience?',
        a: 'Yes. Put your education, final year project, internships, volunteer work, skills and certificates first. Employers hiring fresh graduates expect this, and a clear, honest CV with good projects can stand out.',
      },
      {
        q: 'What should a fresh graduate write in the CV summary?',
        a: 'Keep it to two or three lines. Mention your degree, two or three strong skills and the role you want. For example: "BS Computer Science graduate with hands-on project experience in web development, looking for a junior developer role."',
      },
      {
        q: 'Should I mention my final year project (FYP)?',
        a: 'Yes. Your FYP is real work. Say what problem it solved, the tools you used and the outcome. For many freshers it is the strongest section of the CV.',
      },
      {
        q: 'Should I list my matric and intermediate results?',
        a: 'Yes, briefly. It is common for fresh graduates to list earlier qualifications below the latest degree, with the year and grade or percentage on a single line each.',
      },
      {
        q: 'Which template is best for a fresh graduate?',
        a: 'A simple one-column template such as Minimal or ATS Pro works well for most jobs. Creative templates can suit design and media roles.',
      },
      {
        q: 'How long should a fresher CV be?',
        a: 'One page. If you cannot fill a page with experience, add projects, skills, certificates and activities rather than long descriptions.',
      },
      {
        q: 'Is the fresher CV maker free?',
        a: 'Yes. You can build and download your CV for free right now, with no hidden charges and no watermark.',
      },
    ],
    guidesTitle: 'Fresher guides from the Adin AI blog',
    guides: [
      { label: 'Fresher CV Kaise Banayein?', href: '/blog/fresher-cv-kaise-banayein' },
      { label: 'ATS-Friendly CV Kya Hota Hai?', href: '/blog/ats-friendly-cv-kya-hai' },
      { label: 'Cover Letter Kaise Likhein? (Pakistan Ke Liye Best Guide)', href: '/blog/cover-letter-kaise-likhein' },
    ],
    related: [
      { label: 'CV format in Pakistan', href: '/pk/cv-format' },
      { label: 'Free cover letter generator', href: '/free-cover-letter-generator' },
      { label: 'Free CV templates', href: '/templates' },
    ],
  },

  // ══════════════════════════════════════════════
  // PAKISTAN — JOB APPLICATION LETTER (/pk/job-application-letter)
  // ══════════════════════════════════════════════
  'pk/job-application-letter': {
    slug: 'pk/job-application-letter',
    path: '/pk/job-application-letter',
    seoKey: 'pk/job-application-letter',
    activeLabel: 'Job Application Letter in Pakistan',
    ctaTarget: 'cover-letter',
    breadcrumb: 'Job Application Letter',
    eyebrow: 'Free application letter generator for Pakistan',
    h1: 'Job Application Letter in Pakistan: Correct Format and a Free Generator',
    intro:
      'In Pakistan, a cover letter is often called a job application letter. Add your details and Adin AI writes a clear, professional draft in seconds, with a subject line, a polite opening and a strong closing. Edit it so it sounds like you, then download it.',
    ctaLabel: 'Write My Application Letter',
    ctaNote: "It's completely free · No watermark",
    highlights: [
      'Completely free',
      'Editable AI draft',
      'Formal English',
      'Professional designs',
    ],
    fan: [
      { src: '/Templates/images/cover-classic.webp', alt: 'Classic job application letter template' },
      { src: '/Templates/images/cover-creative.webp', alt: 'Creative job application letter template' },
      { src: '/Templates/images/cover-modern.webp', alt: 'Modern job application letter template' },
      { src: '/Templates/images/cover-professional.webp', alt: 'Professional job application letter template' },
      { src: '/Templates/images/cover-executive.webp', alt: 'Executive job application letter template', pill: 'Application Letter' },
    ],
    galleryTitle: 'Choose a job application letter design',
    gallerySubtitle: 'Six professional designs, from classic to creative. Pick one and start writing instantly.',
    gallery: [
      { name: 'Classic', subtitle: 'Timeless Formal', image: '/Templates/images/cover-classic.webp' },
      { name: 'Professional', subtitle: 'Dark Teal Bar', image: '/Templates/images/cover-professional.webp' },
      { name: 'Minimal', subtitle: 'Centered Header', image: '/Templates/images/cover-minimal.webp' },
      { name: 'Modern', subtitle: 'Teal Header', image: '/Templates/images/cover-modern.webp' },
      { name: 'Executive', subtitle: 'Navy & Gold', image: '/Templates/images/cover-executive.webp' },
      { name: 'Creative', subtitle: 'Black Band', image: '/Templates/images/cover-creative.webp' },
    ],
    galleryCta: 'View all cover letter templates',
    galleryHref: '/cover-templates',
    tipsTitle: 'How to write a job application letter',
    tips: [
      'Put your name, address, phone number and email at the top, then the date and the employer or company name.',
      'Add a clear subject line, for example: Subject: Application for the post of Sales Executive.',
      'Greet the hiring manager by name if you can find it. Otherwise "Dear Hiring Manager" is a safe, modern choice.',
      'In the first paragraph, name the position and say where you saw the advert.',
      'Use the middle paragraph for two or three skills or achievements that match the job. Do not repeat your whole CV.',
      'Close politely, say you are available for an interview, and end with "Yours sincerely" and your name. Keep it to one page.',
    ],
    featuresTitle: 'A job application letter written for you, edited by you',
    features: [
      {
        title: 'AI-written first draft',
        text: 'Add your details and the job, and get a professional draft in seconds. You can change every line.',
      },
      {
        title: 'Correct, formal structure',
        text: 'The letter follows a clear order: introduction, the value you bring, and a polite closing, kept to one page.',
      },
      {
        title: 'Professional designs',
        text: 'Pick from classic, modern, minimal, executive, professional and creative letter designs.',
      },
      {
        title: 'Works with your CV',
        text: 'Pick a saved Adin AI CV and your details fill in automatically, so your CV and letter match.',
      },
      {
        title: 'Completely free to use',
        text: 'Write and download your letter without paying and without a watermark.',
      },
      {
        title: 'Formal English drafts',
        text: 'Drafts are written in formal English, which suits most job applications in Pakistan.',
      },
    ],
    stepsTitle: 'How to write your application letter in 3 steps',
    steps: [
      {
        title: 'Choose a design',
        text: 'Browse the letter templates and pick a style that fits the job and company.',
      },
      {
        title: 'Add your details',
        text: 'Enter the job title, company and your details, or fill them in from your saved CV, and let AI write the draft.',
      },
      {
        title: 'Review, edit and download',
        text: 'Read the draft, make it your own, then download your letter.',
      },
    ],
    faqTitle: 'Job application letter: frequently asked questions',
    faqs: [
      {
        q: 'Is a job application letter the same as a cover letter?',
        a: 'In most cases, yes. In Pakistan many people say "job application letter" or "application letter" for what employers abroad call a cover letter. Both are a short letter that introduces you and explains why you are right for the job.',
      },
      {
        q: 'What is the correct format of a job application letter in Pakistan?',
        a: 'Start with your contact details, the date and the employer\'s name. Add a subject line, a greeting, two or three short paragraphs and a polite closing with your name. Keep the letter to one page.',
      },
      {
        q: 'Should I write "Respected Sir/Madam" or "Dear Hiring Manager"?',
        a: 'Both are understood in Pakistan. "Dear Hiring Manager", or the manager\'s name if you know it, sounds more modern and personal. Use whichever fits the employer, and stay polite and formal.',
      },
      {
        q: 'Should I write my application letter in English or Urdu?',
        a: 'For most jobs in Pakistan, use formal English and avoid Urdu or Roman Urdu words, unless the employer asks for something different.',
      },
      {
        q: 'Do I need a subject line?',
        a: 'A short subject line, such as "Application for the post of Accountant", is common in Pakistan and helps the reader see the purpose of the letter at once.',
      },
      {
        q: 'Can I edit the letter the AI writes?',
        a: 'Yes. The AI creates a draft that you should review and edit so it reflects your own experience and the job you are applying for.',
      },
      {
        q: 'Is the application letter generator free?',
        a: 'Yes. You can write and download your letter for free right now, with no hidden charges and no watermark.',
      },
    ],
    guidesTitle: 'Cover letter guides from the Adin AI blog',
    guides: [
      { label: 'Cover Letter Kaise Likhein? (Pakistan Ke Liye Best Guide)', href: '/blog/cover-letter-kaise-likhein' },
      { label: 'Cover Letter Ki 5 Badi Galtiyan', href: '/blog/cover-letter-ki-5-badi-galtiyan' },
    ],
    related: [
      { label: 'Cover letter for freshers in Pakistan', href: '/pk/cover-letter-for-freshers' },
      { label: 'CV format in Pakistan', href: '/pk/cv-format' },
      { label: 'Free cover letter templates', href: '/cover-templates' },
    ],
  },

  // ══════════════════════════════════════════════
  // PAKISTAN — FRESHER COVER LETTER (/pk/cover-letter-for-freshers)
  // ══════════════════════════════════════════════
  'pk/cover-letter-for-freshers': {
    slug: 'pk/cover-letter-for-freshers',
    path: '/pk/cover-letter-for-freshers',
    seoKey: 'pk/cover-letter-for-freshers',
    activeLabel: 'Cover Letter for Freshers in Pakistan',
    ctaTarget: 'cover-letter',
    breadcrumb: 'Cover Letter for Freshers',
    eyebrow: 'Free fresher cover letter generator',
    h1: 'Cover Letter for Freshers in Pakistan: Write One With No Experience',
    intro:
      'No work experience? A good cover letter can still make a strong first impression. Adin AI helps fresh graduates and students in Pakistan write a professional letter for jobs and internships, built around your degree, projects and skills. Edit the draft and download it for free.',
    ctaLabel: 'Write My Fresher Cover Letter',
    ctaNote: "It's completely free · No watermark",
    highlights: [
      'Made for freshers',
      'No experience needed',
      'Completely free',
      'Editable AI draft',
    ],
    fan: [
      { src: '/Templates/images/cover-minimal.webp', alt: 'Minimal fresher cover letter template' },
      { src: '/Templates/images/cover-modern.webp', alt: 'Modern fresher cover letter template' },
      { src: '/Templates/images/cover-classic.webp', alt: 'Classic fresher cover letter template' },
      { src: '/Templates/images/cover-professional.webp', alt: 'Professional fresher cover letter template' },
      { src: '/Templates/images/cover-executive.webp', alt: 'Executive fresher cover letter template', pill: 'Fresher Letter' },
    ],
    galleryTitle: 'Choose a cover letter design for freshers',
    gallerySubtitle: 'Clean, professional layouts that keep the focus on your skills. Pick one and start writing.',
    gallery: [
      { name: 'Minimal', subtitle: 'Centered Header', image: '/Templates/images/cover-minimal.webp' },
      { name: 'Classic', subtitle: 'Timeless Formal', image: '/Templates/images/cover-classic.webp' },
      { name: 'Modern', subtitle: 'Teal Header', image: '/Templates/images/cover-modern.webp' },
      { name: 'Professional', subtitle: 'Dark Teal Bar', image: '/Templates/images/cover-professional.webp' },
      { name: 'Executive', subtitle: 'Navy & Gold', image: '/Templates/images/cover-executive.webp' },
      { name: 'Creative', subtitle: 'Black Band', image: '/Templates/images/cover-creative.webp' },
    ],
    galleryCta: 'View all cover letter templates',
    galleryHref: '/cover-templates',
    tipsTitle: 'Cover letter tips for fresh graduates',
    tips: [
      'Open with the exact role (or internship) and one line on why you want it.',
      'Lead with your degree, your final year project and the skills that match the job.',
      'Use internships, volunteer work, society roles and freelance gigs as proof of your skills.',
      'Show enthusiasm and willingness to learn, but back it up with one or two specific examples.',
      'Keep it to three or four short paragraphs on a single page.',
      'Proofread twice and send it as a PDF together with your CV.',
    ],
    featuresTitle: 'A first cover letter without the stress',
    features: [
      {
        title: 'AI-written first draft',
        text: 'Add your degree, projects and skills and get a professional draft in seconds. You stay in control of every line.',
      },
      {
        title: 'Built around your strengths',
        text: 'The draft highlights your education, projects and skills when you do not have much work history yet.',
      },
      {
        title: 'Professional designs',
        text: 'Choose a classic, modern, minimal, executive, professional or creative design for your letter.',
      },
      {
        title: 'Works with your CV',
        text: 'Pick a saved Adin AI CV and your details fill in automatically, so your CV and letter match.',
      },
      {
        title: 'Completely free to use',
        text: 'Write and download your letter without paying and without a watermark.',
      },
      {
        title: 'Made for students in Pakistan',
        text: 'Drafts are written in formal English, which suits most job and internship applications in Pakistan.',
      },
    ],
    stepsTitle: 'How to write a fresher cover letter in 3 steps',
    steps: [
      {
        title: 'Choose a design',
        text: 'Pick a clean template that fits the job or internship you are applying for.',
      },
      {
        title: 'Add your details',
        text: 'Enter the role, the company, your degree, projects and skills, and let AI write the draft.',
      },
      {
        title: 'Edit and download',
        text: 'Read the draft, change anything that does not sound like you, then download your letter.',
      },
    ],
    faqTitle: 'Fresher cover letter: frequently asked questions',
    faqs: [
      {
        q: 'Can I write a cover letter with no work experience?',
        a: 'Yes. Focus on your degree, final year project, internships, skills and the reasons you want the role. Employers hiring freshers do not expect long work history.',
      },
      {
        q: 'What should a fresher put in a cover letter?',
        a: 'Name the role, introduce your degree and university, mention one or two relevant projects or skills, and end with a polite request for an interview.',
      },
      {
        q: 'Do I need a cover letter for an internship?',
        a: 'It is a good idea, even when it is not required. A short, well-written letter shows effort and helps you stand out from other applicants.',
      },
      {
        q: 'How long should a fresher cover letter be?',
        a: 'One page: three to four short paragraphs. Shorter is better than longer.',
      },
      {
        q: 'Should I write my cover letter in English or Urdu?',
        a: 'For most jobs and internships in Pakistan, use formal English and avoid Urdu or Roman Urdu words, unless the employer asks for something different.',
      },
      {
        q: 'Can I edit the letter the AI writes?',
        a: 'Yes. Always review and edit the draft so it reflects your own experience and the job you are applying for.',
      },
      {
        q: 'Is the fresher cover letter generator free?',
        a: 'Yes. You can write and download your letter for free right now, with no hidden charges and no watermark.',
      },
    ],
    guidesTitle: 'Cover letter guides from the Adin AI blog',
    guides: [
      { label: 'Cover Letter Kaise Likhein? (Pakistan Ke Liye Best Guide)', href: '/blog/cover-letter-kaise-likhein' },
      { label: 'Cover Letter Ki 5 Badi Galtiyan', href: '/blog/cover-letter-ki-5-badi-galtiyan' },
      { label: 'Fresher CV Kaise Banayein?', href: '/blog/fresher-cv-kaise-banayein' },
    ],
    related: [
      { label: 'Job application letter in Pakistan', href: '/pk/job-application-letter' },
      { label: 'CV for fresh graduates in Pakistan', href: '/pk/cv-for-fresh-graduates' },
      { label: 'Free cover letter generator', href: '/free-cover-letter-generator' },
    ],
  },
};

/** App.tsx `active` label -> content (default: CV builder landing) */
export const getToolSlugByActive = (active: string): ToolSlug =>
  (Object.values(TOOL_LANDING_CONTENT).find((c) => c.activeLabel === active)?.slug ?? 'free-cv-builder');

// ─────────────────────────────────────────────
// JSON-LD (FAQPage + BreadcrumbList)
// ─────────────────────────────────────────────
export const buildToolLandingSchema = (c: ToolLandingContent) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: c.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Adin AI', item: canonicalFor('/') },
        { '@type': 'ListItem', position: 2, name: c.breadcrumb, item: canonicalFor(c.path) },
      ],
    },
  ],
});