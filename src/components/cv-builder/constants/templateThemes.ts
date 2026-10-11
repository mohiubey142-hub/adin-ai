// src/components/cv-builder/constants/templateThemes.ts
// =====================================================
// ✅ SINGLE SOURCE OF TRUTH for template colors
// ✅ Colors now MATCH the actual CV templates (modernPdf.ts,
//    classicPdf.ts, minimalPdf.ts, tealCurvePdf.ts, executivePdf.ts,
//    creativePdf.ts, academicPdf.ts, standardPdf.ts, atsProPdf.ts).
//    So the colored band on a document card looks like a real preview
//    of the CV the user built — same palette, same feel.
// =====================================================

export interface TemplateTheme {
    // 🎨 Card band gradient (top colored strip on card)
    cardBandFrom: string;
    cardBandTo: string;
    cardText: string;       // Text color on band
    cardAccent: string;     // Accent (icons, badges)

    // 🖼️ Mini preview colors (sidebar, header, etc.)
    sidebar: string;
    accent: string;
    nameColor: string;
    headerBg: string;
}

// =====================================================
// RESUME TEMPLATES (10) — colors ported from each PDF generator
// =====================================================
export const TEMPLATE_THEMES: Record<string, TemplateTheme> = {
    // Modern: primary purple #5846c8, light purple tags #b4aadc
    'modern': {
        cardBandFrom: '#7c6ee0',   // lighter purple (for gradient start)
        cardBandTo: '#5846c8',     // primary purple (modernPdf.ts COLOR_PRIMARY)
        cardText: '#ffffff',
        cardAccent: '#5846c8',
        sidebar: '#5846c8',
        accent: '#7c6ee0',
        nameColor: '#5846c8',
        headerBg: '#5846c8',
    },

    // Classic: teal — name #0f766e, title #0d9488, section #0f766e
    'classic': {
        cardBandFrom: '#0d9488',   // teal accent
        cardBandTo: '#0f766e',     // deeper teal
        cardText: '#ffffff',
        cardAccent: '#0f766e',
        sidebar: '#0f766e',
        accent: '#0d9488',
        nameColor: '#0f766e',
        headerBg: '#0f766e',
    },

    // Minimal: dark near-black/gray — name #28282d, heading #28282d
    'minimal': {
        cardBandFrom: '#3a3a42',   // slightly lighter than #28282d
        cardBandTo: '#28282d',     // minimalPdf.ts COLOR_NAME
        cardText: '#ffffff',
        cardAccent: '#28282d',
        sidebar: '#28282d',
        accent: '#3a3a42',
        nameColor: '#28282d',
        headerBg: '#28282d',
    },

    // Executive: navy #0d1b2a + gold #b8a46a
    'executive': {
        cardBandFrom: '#1e3a5c',   // lighter navy
        cardBandTo: '#0d1b2a',     // executivePdf.ts COLOR_HEADER_BACKGROUND
        cardText: '#b8a46a',       // gold title
        cardAccent: '#b8a46a',
        sidebar: '#0d1b2a',
        accent: '#c6a75e',
        nameColor: '#b8a46a',
        headerBg: '#0d1b2a',
    },

    // Creative: dark sidebar #161616, accent #1f2937
    'creative': {
        cardBandFrom: '#2a2a2a',   // lighter than #161616
        cardBandTo: '#161616',     // creativePdf.ts COLOR_SIDEBAR_BG
        cardText: '#ffffff',
        cardAccent: '#161616',
        sidebar: '#161616',
        accent: '#2a2a2a',
        nameColor: '#1a1a1a',
        headerBg: '#161616',
    },

    // Academic: black #000000, monochrome
    'academic': {
        cardBandFrom: '#3a3a3a',   // light black for gradient
        cardBandTo: '#000000',     // academicPdf.ts COLOR_NAME
        cardText: '#ffffff',
        cardAccent: '#000000',
        sidebar: '#000000',
        accent: '#3a3a3a',
        nameColor: '#000000',
        headerBg: '#000000',
    },

    // Teal Curve: dark teal #0d2b2b (band + section heading)
    'teal-curve': {
        cardBandFrom: '#1a4545',   // lighter than #0d2b2b
        cardBandTo: '#0d2b2b',     // tealCurvePdf.ts COLOR_HEADER_BACKGROUND / SECTION_HEADLINE
        cardText: '#ffffff',
        cardAccent: '#0d2b2b',
        sidebar: '#0d2b2b',
        accent: '#1a4545',
        nameColor: '#ffffff',
        headerBg: '#0d2b2b',
    },

    // Standard: dark near-black/gray — same family as Minimal
    'standard': {
        cardBandFrom: '#3a3a42',   // slightly lighter than #28282d
        cardBandTo: '#28282d',     // standardPdf.ts COLOR_NAME
        cardText: '#ffffff',
        cardAccent: '#28282d',
        sidebar: '#28282d',
        accent: '#3a3a42',
        nameColor: '#28282d',
        headerBg: '#28282d',
    },

    // Corporate: blue — same as Classic's blue counterpart (kept from
    // original corporate palette, which is blue-based)
    'corporate': {
        cardBandFrom: '#3b82f6',   // blue accent
        cardBandTo: '#1d4ed8',     // deeper blue
        cardText: '#ffffff',
        cardAccent: '#1d4ed8',
        sidebar: '#1d4ed8',
        accent: '#3b82f6',
        nameColor: '#1e3a8a',
        headerBg: '#1d4ed8',
    },

    // ATS Pro: maroon #800000 + near-black #111827
    'ats-pro': {
        cardBandFrom: '#a02020',   // lighter maroon for gradient
        cardBandTo: '#800000',     // atsProPdf.ts COLOR_ACCENT (maroon)
        cardText: '#ffffff',
        cardAccent: '#800000',
        sidebar: '#800000',
        accent: '#a02020',
        nameColor: '#800000',
        headerBg: '#800000',
    },
};

// =====================================================
// COVER LETTER TEMPLATES (2) — kept as-is; cover letters have their
// own two designs (classic + modern), and their colors were already
// consistent with their own preview components.
// =====================================================
export const COVER_TEMPLATE_THEMES: Record<string, TemplateTheme> = {
    'classic': {
        cardBandFrom: '#475569',
        cardBandTo: '#1e293b',
        cardText: '#ffffff',
        cardAccent: '#1e293b',
        sidebar: '#ffffff',
        accent: '#1e293b',
        nameColor: '#0f172a',
        headerBg: '#1e293b',
    },
    'modern': {
        cardBandFrom: '#6366f1',
        cardBandTo: '#4f46e5',
        cardText: '#ffffff',
        cardAccent: '#4f46e5',
        sidebar: '#4f46e5',
        accent: '#6366f1',
        nameColor: '#1e293b',
        headerBg: '#4f46e5',
    },
};

// =====================================================
// HELPERS
// =====================================================

/**
 * ✅ Get theme for a template + kind
 */
export const getTemplateTheme = (
    template: string,
    kind: 'resume' | 'cover-letter' = 'resume'
): TemplateTheme => {
    if (kind === 'cover-letter') {
        return COVER_TEMPLATE_THEMES[template] || COVER_TEMPLATE_THEMES['classic'];
    }
    return TEMPLATE_THEMES[template] || TEMPLATE_THEMES['modern'];
};

/**
 * ✅ Template display labels
 */
export const TEMPLATE_LABELS: Record<string, string> = {
    'modern': 'Modern',
    'classic': 'Classic',
    'minimal': 'Minimal',
    'executive': 'Executive',
    'creative': 'Creative',
    'academic': 'Academic',
    'teal-curve': 'Teal Curve',
    'standard': 'Standard',
    'corporate': 'Corporate',
    'ats-pro': 'ATS Pro',
};

export const getTemplateLabel = (template: string): string => {
    return TEMPLATE_LABELS[template] || template || 'Modern';
};