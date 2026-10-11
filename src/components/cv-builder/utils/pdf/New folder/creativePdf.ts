/**
 * creativePdf.ts
 * ------------------------------------------------------------------
 * A direct clone of minimalPdf.ts (Creative PDF generator), built with
 * jsPDF. Every layout, spacing, sizing, and geometry decision below is
 * unchanged from minimalPdf.ts. The ONLY two differences from
 * minimalPdf.ts are:
 *   1. Generator/export identity — generateCreativePDF() and the
 *      CreativePdf* type names, so this module has its own identity
 *      distinct from minimalPdf.ts's generateMinimalPDF()/MinimalPdf*.
 *   2. Section-heading color — COLOR_SECTION_HEADING below is purple
 *      instead of minimalPdf.ts's near-black, so heading TEXT color is
 *      the only visual difference. Font size, weight, position,
 *      spacing, and the divider under each heading are all identical
 *      to minimalPdf.ts.
 *
 * STATUS: PHASE 1 + PHASE 2 + PHASE 3 + PHASE 4 + PHASE 5 + PHASE 6 + PHASE 7 + PHASE 8 + PHASE 9
 *   (+ a global section-gap consistency pass — see
 *   "SECTION-GAP ARCHITECTURE" / topUpToLineHeight() below)
 *   (+ universal section-heading dividers — see
 *   "UNIVERSAL SECTION HEADING + DIVIDER" / renderSectionHeading() below.
 *   Every section heading (Summary, Experience, Education, Skills,
 *   Languages, Achievements, Certifications, Projects) is now followed
 *   by a divider line before its content. Header's own separate divider
 *   is unchanged.)
 *   - A4 page setup
 *   - Margins
 *   - Header (name, job title, contact line)
 *   - Professional Summary (heading + wrapped paragraph, skipped if empty)
 *   - Experience (heading + entries: title, company/dates, description),
 *     skipped entirely if there are no usable entries
 *   - Education (heading + entries: degree, institution/year, grade),
 *     skipped entirely if there are no usable entries
 *   - Skills (heading + inline "Skill • Skill • Skill" list, wrapped
 *     across as many lines as needed), skipped entirely if empty
 *   - Languages (heading + entries: language name, expanded proficiency
 *     label), skipped entirely if there are no usable entries
 *   - Achievements (heading + entries: title, date, description),
 *     skipped entirely if there are no usable entries
 *   - Certifications (heading + entries: name, date, credentialId),
 *     skipped entirely if there are no usable entries
 *   - Projects (heading + entries: name, tech, description, github),
 *     skipped entirely if there are no usable entries
 *
 * DEPENDENCY:
 *   This file requires the "jspdf" package.
 *   If it is not already installed, run:  npm install jspdf
 *
 * DESIGN RULE FOLLOWED IN THIS FILE:
 *   Every spacing/size value is a named constant below. Nothing is
 *   hardcoded inline. If you want to change spacing, change a
 *   constant here — you should never need to hunt through the
 *   rendering functions for a stray number.
 *
 * COLOR PALETTE SOURCE:
 *   All COLOR_* constants below are ported from the OLD (pre-rewrite)
 *   minimalPdf.ts's MINIMAL_THEME color palette (a dark near-black/gray
 *   theme), used here as a DESIGN reference only. Every gap, position,
 *   margin, and page-break calculation in this file is unrelated to
 *   that old file and comes from simplePdf.ts's geometry, unchanged.
 *   The single exception is COLOR_SECTION_HEADING, which this file
 *   overrides to purple (see its own declaration below) — every other
 *   COLOR_* constant is identical to minimalPdf.ts.
 * ------------------------------------------------------------------
 */

import { jsPDF } from 'jspdf';

// ====================================================================
// PAGE LAYOUT CONSTANTS
// All measurements are in points ("pt"). jsPDF font sizes are always
// expressed in points regardless of the document's unit, so using
// points for positions/margins too keeps every number in this file
// in the same unit — no mental conversion needed.
// (A4 = 210mm x 297mm = 595.28pt x 841.89pt)
// ====================================================================
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const LEFT_MARGIN = 50;
const RIGHT_MARGIN = 50;
const TOP_MARGIN = 50;
const BOTTOM_MARGIN = 50;

// Usable horizontal space for text, after subtracting both margins.
// Used for text-wrapping calculations.
const CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;

// ====================================================================
// TYPOGRAPHY CONSTANTS (font sizes, in points)
// ====================================================================
const NAME_SIZE = 22;
const TITLE_SIZE = 13;
const METADATA_SIZE = 9.5; // contact line (email / phone / location / links)

// Reserved for later phases (section headings, body paragraphs).
// Declared now so every size constant lives in one place from the start.
const HEADING_SIZE = 12;
const BODY_SIZE = 10.5;

// Multiplier applied to BODY_SIZE to get the vertical distance between
// wrapped lines of paragraph text (a.k.a. "leading"). 1.4 is a normal,
// readable line-height for body copy — tight enough to stay compact,
// loose enough not to feel cramped. Used by every body-text section
// (Summary, Experience, and later ones), so it lives here once rather
// than being redefined per section.
const BODY_LINE_HEIGHT_MULTIPLIER = 1.4;

// The actual computed line height used whenever BODY_SIZE text wraps
// across multiple lines. Computed once here instead of recomputing
// `BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER` inline in every section.
const BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;

// --- Experience entry typography (Phase 3) ---
// Job title: slightly smaller than a section heading, but still bold,
// so entries are clearly distinguishable from the section heading
// above them.
const EXPERIENCE_TITLE_SIZE = 11;
// Company / dates line: supporting text, same visual weight as the
// header's contact line.
const EXPERIENCE_SUBTITLE_SIZE = 10;

// ====================================================================
// SPACING CONSTANTS (in points)
// A "gap" is the vertical space added AFTER a line's own height,
// i.e. it is whitespace on top of the text height, not a replacement
// for it.
// ====================================================================
const NAME_TO_TITLE_GAP = 6;
const TITLE_TO_CONTACT_GAP = 10;
const HEADER_RULE_GAP = 12; // space above AND below the divider line under the header

// Reserved for later phases (sections, list items, bullets).
const SECTION_GAP = 18;
// NOTE: as of this phase, HEADING_TO_CONTENT_GAP is no longer used to
// position section content directly under a heading — every section
// now renders a divider between heading and content, via
// renderSectionHeading(), and that transition is governed instead by
// HEADING_TO_DIVIDER_GAP + DIVIDER_TO_CONTENT_GAP below. Left in place
// (unused) rather than deleted, since removing constants is outside
// the scope of this phase and nothing outside this file depends on it
// being absent.
const HEADING_TO_CONTENT_GAP = 8;
const ITEM_GAP = 10;
const BULLET_GAP = 4;

// --- Universal section-heading divider spacing ---
//
// UNIT CONVERSION: the whole file works in points (jsPDF's unit for
// this doc — see PAGE LAYOUT CONSTANTS above), but the divider's
// required whitespace is specified in millimeters. One centralized
// conversion constant, used nowhere else, is the single source of
// truth for that unit change — no mm value is ever hand-converted to
// a decimal point value anywhere in this file.
const MM_TO_PT = 72 / 25.4;

// The exact whitespace required on EACH side of the divider (heading
// -> divider, and divider -> content), as real, visible, empty space —
// not a baseline-to-baseline distance. One constant, reused for both
// sides and for every section, so "heading->divider" and
// "divider->content" can never drift apart from each other.
const DIVIDER_SIDE_GAP_MM = 4; // requested: 2mm -> 4mm on each side
const DIVIDER_SIDE_GAP_PT = DIVIDER_SIDE_GAP_MM * MM_TO_PT; // 4mm, ≈ 11.3386pt

// Requested increase to the section-heading divider's stroke thickness:
// +0.2mm on top of the existing visual weight (previously equal to
// HEADER_RULE_THICKNESS/HEADER's own 0.75pt rule). Expressed in mm and
// converted through the single MM_TO_PT constant — same convention as
// DIVIDER_SIDE_GAP_PT above — so no raw pt magic number is introduced.
const SECTION_DIVIDER_THICKNESS_INCREASE_MM = 0.2;
const SECTION_DIVIDER_THICKNESS_INCREASE_PT = SECTION_DIVIDER_THICKNESS_INCREASE_MM * MM_TO_PT; // ≈ 0.5669pt

// Standard Adobe Core-14 Helvetica AFM font metrics, expressed as a
// fraction of font size. jsPDF's 'helvetica' standard font IS this
// font, so these ratios are real rendering geometry, not assumptions:
//   - ascender  = 718/1000 em  (how far a line's ink rises above its
//     own baseline — already used by the previous phase's fix)
//   - descender = 207/1000 em  (how far a line's ink — e.g. the tail
//     of a "g" or "y" — extends below its own baseline)
// Both are needed now because "exactly DIVIDER_SIDE_GAP_MM mm of whitespace" must be
// measured between actual ink edges, not between the baseline
// reference points doc.text()/checkPageBreak() otherwise use.
const HELVETICA_ASCENT_RATIO = 0.718;

// Standard Adobe Core-14 Helvetica AFM descender ratio (207/1000 em) —
// already documented by name in the comment above (the "old formula"
// note), just never instantiated as its own constant since nothing in
// this file needed it until now. Needed for the header photo's
// vertical-centering math below (measuring the job title's real
// ink-bottom, not its baseline).
const HELVETICA_DESCENT_RATIO = 0.207;

// --- Header profile photo (circular header layout) ---
// Exact rendered diameter and photo-to-text gap, ported from the
// ATSPro generator (atsProPdf.ts HEADER_PHOTO_SIZE_PT / PHOTO_TO_TEXT_
// GAP_PT) per request — this is geometry (size + position) only, not
// color/spacing/typography. Both files already share the same pt-only
// coordinate system (no px/pt conversion helper in either), so no new
// unit conversion is introduced.
const HEADER_PHOTO_SIZE_PT = 75;
const PHOTO_TO_TEXT_GAP_PT = 15;

// Computes the exact Y distance from a section heading's own baseline
// (the startY passed into renderSectionHeading()) down to the BASELINE
// of the first line of content that will be drawn beneath its divider,
// given the divider's real geometry. This is the SINGLE formula behind
// both the actual rendering in renderSectionHeading() and every
// section's pre-heading checkPageBreak() reservation, so measurement
// and rendering can never disagree (see both call sites below).
//
//   headingInkBottomY  = headingBaselineY                      (see note below — no descent term)
//   dividerTopEdgeY     = headingInkBottomY + DIVIDER_SIDE_GAP_PT
//   dividerBottomEdgeY  = dividerTopEdgeY + SECTION_DIVIDER_THICKNESS
//   contentInkTopY      = dividerBottomEdgeY + DIVIDER_SIDE_GAP_PT
//   contentBaselineY    = contentInkTopY + firstContentFontSize * HELVETICA_ASCENT_RATIO
//
// NOTE ON HEADING INK-BOTTOM: every heading this function is ever
// called for is a hardcoded, literal ALL-CAPS string — see every
// renderSectionHeading() call site below ('PROFESSIONAL SUMMARY',
// 'EDUCATION', 'SKILLS', 'LANGUAGES', 'ACHIEVEMENTS',
// 'CERTIFICATIONS', 'PROJECTS', 'EXPERIENCE'). Helvetica's capital
// letters A-Z have no descender — their ink never extends below the
// baseline. So for these specific, code-controlled strings, the
// heading's true visual ink-bottom IS its baseline; no descent term
// belongs in this formula. (This is a verifiable fact about these
// exact literals, not an assumption — unlike the content that
// follows, which is arbitrary user-supplied text and genuinely can
// contain lowercase ascenders, which is why HELVETICA_ASCENT_RATIO
// is still needed for the content side.) An earlier version of this
// formula included `HEADING_SIZE * HELVETICA_DESCENT_RATIO` here,
// which over-allocated space no heading ever actually uses — that
// term has been removed so heading->divider is exactly DIVIDER_SIDE_GAP_PT
// (DIVIDER_SIDE_GAP_MM mm), not that-plus-a-phantom-descender.
//
// `firstContentFontSize` is the font size of whatever gets drawn
// immediately under the divider (BODY_SIZE for Summary/Skills'
// paragraph text, EXPERIENCE_TITLE_SIZE for every entry-based
// section's title) — passing it in, rather than assuming one size,
// is what makes the DIVIDER_SIDE_GAP_MM mm whitespace exact for every section instead of
// merely "at least DIVIDER_SIDE_GAP_MM mm" for whichever sections use a smaller font.
function sectionHeadingToContentOffset(firstContentFontSize: number): number {
  const dividerTopEdgeOffset = DIVIDER_SIDE_GAP_PT; // heading baseline -> divider top edge
  const dividerBottomEdgeOffset = dividerTopEdgeOffset + SECTION_DIVIDER_THICKNESS;
  const contentInkTopOffset = dividerBottomEdgeOffset + DIVIDER_SIDE_GAP_PT;
  return contentInkTopOffset + firstContentFontSize * HELVETICA_ASCENT_RATIO;

}

// --- Experience entry spacing (Phase 3) ---
const EXPERIENCE_TITLE_TO_SUBTITLE_GAP = 3; // job title -> company/dates line
const EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = 6; // company/dates (or title) -> description
const EXPERIENCE_ENTRY_GAP = 14; // space between one experience entry and the next

// --- Bullet-formatted descriptions (Achievements) ---
// No bullet-dot rendering existed anywhere in this file before this
// change — there is no prior "Experience/Projects bullet system" to
// reuse, so this is a new, single, centralized helper
// (renderBulletedDescriptionLines(), declared near addAchievementEntry()
// below) rather than a one-off drawn inline in that function, so any
// future section that wants the same bullet format reuses this same
// helper/constant instead of duplicating the logic.
// Horizontal space between the bullet dot and its text, expressed in
// mm and converted through the file's existing MM_TO_PT conversion —
// same convention as DIVIDER_SIDE_GAP_PT above — so no raw pt magic
// number is introduced.
const BULLET_DOT_TO_TEXT_GAP_MM = 3;
const BULLET_DOT_TO_TEXT_GAP_PT = BULLET_DOT_TO_TEXT_GAP_MM * MM_TO_PT;

// --- Right-aligned date on a title/degree/achievement-name row
// (Experience, Education, Achievements) ---
// Horizontal gap reserved between the end of the wrapped title text
// and the start of its right-aligned date, expressed in mm and
// converted through the existing MM_TO_PT conversion — same
// convention as BULLET_DOT_TO_TEXT_GAP_MM/DIVIDER_SIDE_GAP_PT above —
// so no raw pt magic number is introduced.
const TITLE_TO_DATE_GAP_MM = 3;
const TITLE_TO_DATE_GAP_PT = TITLE_TO_DATE_GAP_MM * MM_TO_PT;

// --- Skills spacing/formatting (Phase 5) ---
// Not a layout coordinate — this is the literal text inserted between
// two skills on the same line (e.g. "React  •  Node.js"). Declared as
// a named constant (rather than typed inline in the render loop) so
// the separator style is defined in exactly one place. No new gap
// constant is needed beyond this: the space between skills is part of
// this string, the space between wrapped skill lines reuses
// BODY_LINE_HEIGHT (same convention as the Summary paragraph), and the
// space above/below the section reuses SECTION_GAP and
// HEADING_TO_CONTENT_GAP, exactly like every other section.
const SKILLS_SEPARATOR = '   •   ';

// Divider line under the header
const HEADER_RULE_THICKNESS = 0.75; // pt — jsPDF requires an explicit line width

// Universal section-heading divider (added in this phase). Declared as
// its own constant — deliberately NOT aliased to HEADER_RULE_THICKNESS —
// so the Header's divider and the section dividers can never accidentally
// become coupled; they only happened to share the same starting value —
// the section divider is now thicker than the Header's rule by exactly
// SECTION_DIVIDER_THICKNESS_INCREASE_PT (0.2mm), per request.
const SECTION_DIVIDER_THICKNESS = 0.75 + SECTION_DIVIDER_THICKNESS_INCREASE_PT; // pt (0.75pt base + 0.2mm)

// Text colors (RGB, 0-255). Kept as named constants rather than
// scattering setTextColor(r, g, b) calls with unexplained numbers.
//
// DESIGN SOURCE: every value below was ported from the OLD
// minimalPdf.ts's MINIMAL_THEME color palette (its `colors.primary`,
// `colors.text`, `colors.textLight`, `colors.divider`, `colors.link`),
// which is this file's DESIGN reference. Only the RGB values changed —
// which named constant governs which piece of text (the "color
// architecture" itself, i.e. Simple's/geometry-file's structure) is
// untouched, so no new per-section color logic was introduced.
const COLOR_NAME = [40, 40, 45] as const; // OLD theme's `primary`
const COLOR_TITLE = [70, 70, 75] as const; // OLD theme's `textLight` (header job title)
const COLOR_METADATA = [70, 70, 75] as const; // OLD theme's `textLight` (contact line, subtitles, dates, institution, grade, proficiency, tech, credential)
const COLOR_RULE = [195, 195, 200] as const; // OLD theme's `divider`

// Universal section-heading divider color (added in this phase).
// Declared separately from COLOR_RULE for the same reason
// SECTION_DIVIDER_THICKNESS is declared separately from
// HEADER_RULE_THICKNESS above — the Header's rule stays fully
// independent even though the values match today.
const COLOR_SECTION_DIVIDER = [195, 195, 200] as const; // OLD theme's `divider`

// Entry titles (job title, degree, language name, achievement title,
// certification name, project name) — OLD theme's `text`.
const COLOR_HEADING = [25, 25, 30] as const;

// Centralized color for the literal section-heading strings drawn by
// renderSectionHeading() ('PROFESSIONAL SUMMARY', 'EXPERIENCE',
// 'EDUCATION', 'SKILLS', 'LANGUAGES', 'ACHIEVEMENTS', 'CERTIFICATIONS',
// 'PROJECTS') — declared separately from COLOR_HEADING (above) so that
// entry-level titles (job title, degree, project name, etc.), which
// also draw via COLOR_HEADING elsewhere in this file, stay on their own
// tone exactly as OLD design keeps `primary` (headings/name) distinct
// from `text` (entry titles/body). Only renderSectionHeading() below
// references this constant, so every section heading in the document
// is guaranteed to share this exact same color — one source of truth,
// no per-section hardcoding.
//
// CREATIVE PDF OVERRIDE: this is the one color constant that differs
// from minimalPdf.ts (which uses [40, 40, 45], OLD theme's `primary`).
// Per the Creative PDF spec, every section heading (Professional
// Summary, Experience, Education, Skills, Languages, Achievements,
// Certifications, Projects) renders in purple instead — only the
// COLOR value changes; renderSectionHeading()'s font size, weight,
// position, and divider logic are untouched.
const COLOR_SECTION_HEADING = [124, 58, 237] as const; // Creative PDF: purple (was [40, 40, 45] in minimalPdf.ts)
const COLOR_BODY = [25, 25, 30] as const; // normal paragraph/body text — OLD theme's `text`

// GitHub link text (Projects section only) — OLD theme's `link`, kept
// as its own constant (rather than folded into COLOR_METADATA) because
// OLD deliberately renders links in a distinct, more prominent tone
// than ordinary metadata.
const COLOR_LINK = [40, 40, 45] as const;

// ====================================================================
// DATA SHAPE
// ------------------------------------------------------------------
// ASSUMPTION / TO VERIFY: the uploaded downloadActions.ts declares
// `personalInfo` as `any`, so its exact field names are not confirmed.
// I could not find a shared PersonalInfo type in the file you
// provided, so this interface accepts a few common alternative field
// names (e.g. `title` OR `jobTitle`, `location` OR `city`) so Phase 1
// doesn't break if the real field is named differently.
//
// ACTION FOR YOU: open your actual personalInfo type/interface and
// tell me the real field names — I'll then simplify this to the
// exact shape instead of guessing with fallbacks.
// ====================================================================
export interface CreativePdfPersonalInfo {
  name?: string;
  title?: string;
  jobTitle?: string;
  email?: string;
  location?: string;
  city?: string;
  linkedin?: string;
  github?: string; // header contact-line GitHub URL — CONFIRMED field
  // name (`personalInfo.github`) against the actual ATSPro generator
  // (atsProPdf.ts), which already reads this same field for its own
  // contact line. Distinct from CreativePdfProject.github below, which
  // is a per-project link, not a personal one.
  website?: string;
  portfolio?: string;
  // Header profile photo (circular header layout). No confirmed field
  // name for this exists anywhere in the app data as provided — this
  // mirrors the exact same placeholder ATSPro's own generator uses
  // (atsProPdf.ts's AtsProPersonalInfo.photo, with the identical
  // caveat noted there): a base64 data URL (e.g.
  // "data:image/png;base64,..."), the only source jsPDF's addImage()
  // can embed without an extra fetch step. If the real app field is
  // named differently (e.g. photoUrl, profileImage), this is a
  // straight rename — isValidPhotoSource()/getImageFormatFromDataUrl()
  // and addHeader()'s hasPhoto branch below don't otherwise change.
  photo?: string;
}

export interface CreativePdfData {
  personalInfo: CreativePdfPersonalInfo;
  phoneNumber: string;
  selectedCountryCode: string;

  // Accepted now (matching createDownloadActions' existing parameters)
  // so this function's signature won't need to change again when
  // later phases are added.
  professionalSummary?: string;

  // CONFIRMED against the project's actual ExperienceItem
  // (src/components/cv-builder/types/cvTypes.ts / ExperienceSection.tsx):
  // fields used are title, company, startDate, endDate, description.
  // There is no separate "location" field on an experience entry, so
  // Phase 3 does not render one (nothing to fabricate).
  experiences?: CreativePdfExperience[];

  // CONFIRMED against the project's actual EducationItem
  // (src/components/cv-builder/types/cvTypes.ts / EducationSection.tsx):
  // fields used are degree, institution, year (already a combined
  // "start - end" string, not separate startDate/endDate), and grade.
  // There is no location or description field on an education entry,
  // so Phase 4 does not render either (nothing to fabricate).
  educations?: CreativePdfEducation[];

  // CONFIRMED against the project's actual SkillsSection.tsx: `skills`
  // is a single free-text string, not an array. The app's own
  // getSkillArray() splits it two ways depending on what the user
  // typed: if it contains a comma, split on commas; otherwise split
  // on newlines and strip a leading "•", "-", or "*" bullet marker
  // (for users who typed one skill per line with bullets). Phase 5
  // parses the string the same way (see parseSkillsList()) so the PDF
  // shows the exact same skill list the form/editor shows — no new
  // data shape, no re-splitting logic invented.
  //
  // CONFIRMED against the project's actual LanguageItem
  // (src/components/cv-builder/types/cvTypes.ts / LanguagesSection.tsx):
  // fields used are `language` (free text, e.g. "English") and
  // `proficiency`, which is stored as one of four short codes —
  // 'Beginner' | 'Intermediate' | 'Advanced' | 'Fluent' — not the
  // human-readable label the form displays. LanguagesSection.tsx's own
  // getProficiencyLabel() expands those codes to their display labels
  // ('Intermediate' -> "Professional Working Proficiency", etc.) before
  // showing the form's own preview line. The PDF renders the same
  // expanded label the form preview shows — see
  // getProficiencyDisplayLabel() below — no new data shape invented.
  languages?: CreativePdfLanguage[];

  // CONFIRMED against the project's actual AchievementItem
  // (src/components/cv-builder/types/cvTypes.ts / AchievementsSection.tsx):
  // fields used are title, date, description. All fields are optional.
  achievements?: CreativePdfAchievement[];

  // CONFIRMED against the project's actual CertificationItem
  // (src/components/cv-builder/types/cvTypes.ts / CertificationsSection.tsx):
  // fields used are name, date, credentialId. All fields are optional.
  certifications?: CreativePdfCertification[];

  // CONFIRMED against the project's actual ProjectItem
  // (src/components/cv-builder/types/cvTypes.ts / ProjectsSection.tsx):
  // fields used are name, tech, description, github. All fields are optional.
  projects?: CreativePdfProject[];

  // Not used yet — later phases.
  skills?: string;
}

// ------------------------------------------------------------------
// CONFIRMED shape (Phase 3), taken directly from ExperienceSection.tsx:
//   - title: string       (already includes the level prefix, e.g.
//                           "Senior Software Engineer" — do not
//                           re-add a level label in the PDF)
//   - company: string
//   - startDate: string   (free text, e.g. "Jan 2022")
//   - endDate: string     (free text, e.g. "Present" or "Dec 2024")
//   - description: string (plain multi-line textarea, NOT an array
//                           of bullet points — line breaks the user
//                           typed are preserved, not reformatted
//                           into bullets)
// jobLevel / isValid / yearsOfExperience are form-only validation
// state, not CV content, so the PDF does not render them.
// ------------------------------------------------------------------
export interface CreativePdfExperience {
  title?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

// ------------------------------------------------------------------
// CONFIRMED shape (Phase 4), taken directly from EducationSection.tsx:
//   - degree: string
//   - institution: string
//   - year: string   (already a single combined "start - end" string,
//                      e.g. "2020 - 2024" — the form builds this
//                      itself from two inputs, so the PDF renders it
//                      as-is rather than re-splitting/reformatting it)
//   - grade: string  (optional, e.g. "3.8/4.0" — rendered as typed,
//                      with no "Grade:" label, matching the form's
//                      own placeholder convention)
// There is no description/achievements/coursework field on an
// education entry in the actual data, so none is rendered.
// ------------------------------------------------------------------
export interface CreativePdfEducation {
  degree?: string;
  institution?: string;
  year?: string;
  grade?: string;
}

// ------------------------------------------------------------------
// CONFIRMED shape (Phase 6), taken directly from LanguagesSection.tsx:
//   - language: string     (free text, e.g. "English")
//   - proficiency: string  (one of the four short codes the form's
//                           <select> stores — 'Beginner' |
//                           'Intermediate' | 'Advanced' | 'Fluent' —
//                           expanded to a display label before
//                           rendering, same as the form's own preview)
// There is no separate location/notes field on a language entry in
// the actual data, so none is rendered.
// ------------------------------------------------------------------
export interface CreativePdfLanguage {
  language?: string;
  proficiency?: string;
}

// ------------------------------------------------------------------
// CONFIRMED shape (Phase 7), taken directly from AchievementsSection.tsx:
//   - title: string       (achievement title, e.g. "Best Developer Award 2024")
//   - date: string        (date received, free text, e.g. "Dec 2024")
//   - description: string (plain multi-line textarea, manual line breaks preserved)
// All fields are optional and rendered only when present.
// ------------------------------------------------------------------
export interface CreativePdfAchievement {
  title?: string;
  date?: string;
  description?: string;
}

// ------------------------------------------------------------------
// CONFIRMED shape (Phase 8), taken directly from CertificationsSection.tsx:
//   - name: string        (certification name, e.g. "AWS Certified Solutions Architect")
//   - date: string        (date earned, free text, e.g. "2023")
//   - credentialId: string (optional credential ID, free text)
// All fields are optional and rendered only when present.
// ------------------------------------------------------------------
export interface CreativePdfCertification {
  name?: string;
  date?: string;
  credentialId?: string;
}

// ------------------------------------------------------------------
// CONFIRMED shape (Phase 9), taken directly from ProjectsSection.tsx:
//   - name: string        (project name, e.g. "AI Career Assistant")
//   - tech: string        (technologies used, e.g. "React, Python, AWS")
//   - description: string (bullet points/description, manual line breaks preserved)
//   - github: string      (optional GitHub link, free text)
// All fields are optional and rendered only when present.
// ------------------------------------------------------------------
export interface CreativePdfProject {
  name?: string;
  tech?: string;
  description?: string;
  github?: string;
}

// ====================================================================
// SECTION-GAP ARCHITECTURE (shared by every section below)
// ------------------------------------------------------------------
// The rule this file follows for spacing between sections is:
//
//     actualPreviousSectionEndY  +  SECTION_GAP  =  nextSectionHeadingY
//
// "actualPreviousSectionEndY" must be the REAL rendered bottom of the
// previous section's content — never an estimate based on font size,
// text length, or line count. Each addXxx() function below returns
// exactly that real Y position.
//
// Each addXxx() function applies SECTION_GAP itself, as the very first
// thing it does, but ONLY after checking that its own section actually
// has content to render:
//
//     if (nothing to render) return startY unchanged;   // no gap "spent"
//     y = startY + SECTION_GAP;                          // gap applied once
//     ...draw heading + content...
//     return y;                                          // real end
//
// This (rather than always adding SECTION_GAP once up-front in
// generateCreativePDF, before knowing whether the next section will
// render anything) is what prevents a "double gap" when a section in
// the middle is empty and skipped — e.g. if Professional Summary is
// blank, Header's real end flows straight into Experience with exactly
// one SECTION_GAP between them, not two.
//
// THE PART THAT NEEDS EXTRA CARE: two sections can end their LAST
// line in different ways —
//   - a wrapped body paragraph (Summary's text, an Experience
//     description) always ends by advancing BODY_LINE_HEIGHT past its
//     last line, which already reserves a full line's leading below it.
//   - a single metadata-style line (a job title with no company/dates,
//     company/dates with no description, an education entry's
//     institution/year or grade) only advances by ITS OWN font size,
//     the same "no extra leading" convention the header's contact line
//     uses — because that's the correct look for a short label, not
//     because of any spacing bug.
//
// If SECTION_GAP were simply added on top of whichever of these Y
// values a section happened to end on, sections ending on a metadata
// line would visually sit closer to the next heading than sections
// ending on a wrapped paragraph — NOT because SECTION_GAP changed, but
// because the content each one ended on reserved a different amount of
// trailing space. topUpToLineHeight() below closes exactly that gap
// (and only that gap) using real font-size constants, never a bare
// magic number, so that SECTION_GAP always measures from an
// equivalent starting point no matter which field a section or entry
// happened to end on.
// ====================================================================
function topUpToLineHeight(y: number, lastLineFontSize: number): number {
  return y + (BODY_LINE_HEIGHT - lastLineFontSize);
}

// ====================================================================
// UNIVERSAL SECTION HEADING + DIVIDER (added in this phase)
// ------------------------------------------------------------------
// Single source of truth for the "heading -> divider -> content"
// transition used by every section EXCEPT Header. Header keeps its
// own separate, untouched divider (see addHeader() above — it never
// calls this function). Every addXxx() section function below calls
// this instead of drawing its own heading text, so heading style,
// heading->divider gap, divider geometry (thickness/color/width), and
// divider->content gap can never drift between sections or be
// special-cased per section.
//
// GEOMETRY GUARANTEE (identical proportions for every call site — see
// sectionHeadingToContentOffset() above for the full derivation):
//   headingBaselineY   = startY                                    (passed in)
//   headingInkBottomY  = headingBaselineY                           (headings are hardcoded ALL-CAPS — no descender ink; see note in sectionHeadingToContentOffset())
//   dividerTopEdgeY     = headingInkBottomY + DIVIDER_SIDE_GAP_PT    (exactly DIVIDER_SIDE_GAP_MM mm)
//   dividerCenterY      = dividerTopEdgeY + SECTION_DIVIDER_THICKNESS / 2
//   dividerBottomEdgeY  = dividerTopEdgeY + SECTION_DIVIDER_THICKNESS
//   contentInkTopY      = dividerBottomEdgeY + DIVIDER_SIDE_GAP_PT   (exactly DIVIDER_SIDE_GAP_MM mm)
//   contentBaselineY    = contentInkTopY + firstContentFontSize * HELVETICA_ASCENT_RATIO (returned)
//
// Every term above is either a fixed constant (DIVIDER_SIDE_GAP_PT,
// SECTION_DIVIDER_THICKNESS, HELVETICA_ASCENT_RATIO) or the
// caller-supplied `firstContentFontSize` — never a content measurement
// (line count, wrapped text height, entry count). Because every
// section's heading goes through this exact function with no
// per-section branching, the DIVIDER_SIDE_GAP_MM mm whitespace on both sides of the
// divider is mathematically guaranteed identical everywhere this is
// called.
//
// The divider itself is drawn at full content width (LEFT_MARGIN to
// PAGE_WIDTH - RIGHT_MARGIN), matching the Header's own divider width
// convention, using SECTION_DIVIDER_THICKNESS / COLOR_SECTION_DIVIDER
// — both declared once, above, and used only here. The stroke is drawn
// at its CENTER Y (jsPDF/PDF strokes are centered on the path), so its
// top and bottom edges — the actual ink boundaries the DIVIDER_SIDE_GAP_MM mm gaps are
// measured against — are `thickness / 2` above and below that center.
//
// This function returns the exact BASELINE Y the caller must pass to
// doc.text() for its first content line — not an approximation the
// caller then adjusts. It does NOT apply SECTION_GAP (still the
// caller's responsibility) and does NOT decide page-break placement
// (still checkPageBreak(), called by the caller first, using the same
// sectionHeadingToContentOffset() formula — see each addXxx() section).
//
// `firstContentFontSize` is the font size of whatever the caller is
// about to draw immediately below (BODY_SIZE for a paragraph,
// EXPERIENCE_TITLE_SIZE for an entry title) — required so the DIVIDER_SIDE_GAP_MM mm gap
// below the divider is measured against that specific line's real
// ascent, making it exactly DIVIDER_SIDE_GAP_MM mm for every section rather than "at
// least DIVIDER_SIDE_GAP_MM mm" for whichever sections happen to use a smaller font.
// ====================================================================
function renderSectionHeading(
  doc: jsPDF,
  headingText: string,
  startY: number,
  firstContentFontSize: number
): number {
  // --- Heading text (baseline at startY, unchanged) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(HEADING_SIZE);
  doc.setTextColor(...COLOR_SECTION_HEADING); // color ported from OLD minimalPdf.ts design — see COLOR_SECTION_HEADING above
  doc.text(headingText, LEFT_MARGIN, startY);

  // --- Divider (heading -> divider -> content, per the geometry
  // guarantee documented above). Drawn at its CENTER Y, exactly
  // DIVIDER_SIDE_GAP_PT (DIVIDER_SIDE_GAP_MM mm) below the heading's own ink-bottom, at
  // full content width — same width convention as the Header's own
  // divider. Color/thickness come from the same two constants used in
  // every distance calculation above, so the drawn line and the
  // reserved whitespace can never disagree. ---
  const headingInkBottomY = startY; // ALL-CAPS heading, no descender ink — see note above
  const dividerTopEdgeY = headingInkBottomY + DIVIDER_SIDE_GAP_PT;
  const dividerCenterY = dividerTopEdgeY + SECTION_DIVIDER_THICKNESS / 2;

  doc.setDrawColor(...COLOR_SECTION_DIVIDER);
  doc.setLineWidth(SECTION_DIVIDER_THICKNESS);
  doc.line(LEFT_MARGIN, dividerCenterY, PAGE_WIDTH - RIGHT_MARGIN, dividerCenterY);

  // --- Content baseline, placed so the content's own ink-top sits
  // exactly DIVIDER_SIDE_GAP_PT (DIVIDER_SIDE_GAP_MM mm) below the divider's bottom edge ---
  return startY + sectionHeadingToContentOffset(firstContentFontSize);
}

// ====================================================================
// ENTRY POINT
// ====================================================================
export function generateCreativePDF(data: CreativePdfData): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  let y = TOP_MARGIN;

  y = addHeader(doc, data, y);
  y = addSummary(doc, data, y);
  y = addExperience(doc, data, y);
  y = addEducation(doc, data, y);
  y = addSkills(doc, data, y);
  y = addLanguages(doc, data, y);
  y = addAchievements(doc, data, y);
  y = addCertifications(doc, data, y);
  y = addProjects(doc, data, y);

  return doc;
}

// ====================================================================
// HEADER SECTION (Phase 1, + circular profile-photo layout)
// Renders: photo (optional, top-left, circular) + name + job title
// (optional) + contact line (optional) + divider.
//
// PHOTO GEOMETRY (size/position only) is ported from the ATSPro
// generator (atsProPdf.ts addHeader()) per request — Minimal PDF's own
// colors, typography (name stays normal-weight, not bold, per the OLD
// design note below), margins, and divider are all unchanged.
//
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addHeader(doc: jsPDF, data: CreativePdfData, startY: number): number {
  let y = startY;
  const { personalInfo, phoneNumber, selectedCountryCode } = data;

  const name = (personalInfo?.name || '').trim() || 'Your Name';
  const jobTitle = (personalInfo?.title || personalInfo?.jobTitle || '').trim();
  const hasPhoto = isValidPhotoSource(personalInfo?.photo);

  if (hasPhoto) {
    // --- Name & job title baselines — identical Y math to the
    // no-photo branch below; the photo changes X positioning only. ---
    const nameBaselineY = y;
    const titleBaselineY = jobTitle ? nameBaselineY + NAME_SIZE + NAME_TO_TITLE_GAP : null;

    // --- Real ink-space vertical span of the name/job-title block, so
    // the photo centers against actual text height, not a guess. ---
    const blockTopY = nameBaselineY - NAME_SIZE * HELVETICA_ASCENT_RATIO;
    const blockBottomY = titleBaselineY !== null
      ? titleBaselineY + TITLE_SIZE * HELVETICA_DESCENT_RATIO
      : nameBaselineY + NAME_SIZE * HELVETICA_DESCENT_RATIO;
    const blockHeight = blockBottomY - blockTopY;

    // --- Photo geometry: top-left of the header, vertically centered
    // on the name/job-title block computed above. ---
    const photoX = LEFT_MARGIN;
    const photoTopY = blockTopY + (blockHeight - HEADER_PHOTO_SIZE_PT) / 2;
    const photoRadius = HEADER_PHOTO_SIZE_PT / 2;
    const photoCenterX = photoX + photoRadius;
    const photoCenterY = photoTopY + photoRadius;

    // --- Draw the photo, circularly clipped. Aspect ratio is
    // preserved (no distortion) via a "cover" fit: the image is
    // scaled so its shorter side exactly fills the circle's diameter,
    // and centered so the circular clip crops the longer side evenly
    // on both sides. ---
    const photoSource = (personalInfo?.photo as string).trim();
    const imgProps = doc.getImageProperties(photoSource);
    const imgAspect = imgProps.width / imgProps.height;
    const drawWidth = imgAspect >= 1 ? HEADER_PHOTO_SIZE_PT * imgAspect : HEADER_PHOTO_SIZE_PT;
    const drawHeight = imgAspect >= 1 ? HEADER_PHOTO_SIZE_PT : HEADER_PHOTO_SIZE_PT / imgAspect;
    const drawX = photoX - (drawWidth - HEADER_PHOTO_SIZE_PT) / 2;
    const drawY = photoTopY - (drawHeight - HEADER_PHOTO_SIZE_PT) / 2;

    doc.saveGraphicsState();
    // `null` (not omitted) is required: jsPDF's default path-paint
    // operation is 'S' (stroke) in pt mode, so an omitted style would
    // stroke a visible circle before clip() below ever runs. Passing
    // null suppresses ALL painting for this path — it exists purely
    // as the clip boundary for clip()/discardPath() immediately after.
    doc.circle(photoCenterX, photoCenterY, photoRadius, null);
    doc.clip();
    doc.discardPath();
    doc.addImage(photoSource, getImageFormatFromDataUrl(photoSource), drawX, drawY, drawWidth, drawHeight);
    doc.restoreGraphicsState();

    // --- Text block X: starts right after the photo's own right
    // edge, with PHOTO_TO_TEXT_GAP_PT of breathing room. ---
    const textStartX = photoX + HEADER_PHOTO_SIZE_PT + PHOTO_TO_TEXT_GAP_PT;

    // --- Name — Minimal PDF's own typography (normal weight, not
    // bold — see the OLD design note in the no-photo branch below),
    // just moved to textStartX instead of LEFT_MARGIN. ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(NAME_SIZE);
    doc.setTextColor(...COLOR_NAME);
    doc.text(name, textStartX, nameBaselineY);

    // --- Job title (optional, same start X as name) ---
    if (jobTitle && titleBaselineY !== null) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TITLE_SIZE);
      doc.setTextColor(...COLOR_TITLE);
      doc.text(jobTitle, textStartX, titleBaselineY);
    }

    // --- Advance Y past whichever is taller: the text block or the
    // photo — so a photo larger than a title-less name row doesn't
    // have its bottom edge overlapped by the contact line below. ---
    y = jobTitle && titleBaselineY !== null
      ? titleBaselineY + TITLE_SIZE + TITLE_TO_CONTACT_GAP
      : nameBaselineY + NAME_SIZE + NAME_TO_TITLE_GAP;
    const photoBottomY = photoTopY + HEADER_PHOTO_SIZE_PT;
    const photoOverhang = Math.max(0, photoBottomY - blockBottomY);
    y += photoOverhang;
  } else {
    // --- NO PHOTO (unchanged original Minimal PDF layout) ---

    // --- Name ---
    // OLD design renders the name in normal (not bold) weight — text
    // weight/style copied from the OLD design reference; font size and
    // Y-advance math (NAME_SIZE) are unchanged geometry.
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(NAME_SIZE);
    doc.setTextColor(...COLOR_NAME);
    doc.text(name, LEFT_MARGIN, y);
    y += NAME_SIZE; // move past the line's own height
    y += NAME_TO_TITLE_GAP;

    // --- Job title (optional) ---
    if (jobTitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TITLE_SIZE);
      doc.setTextColor(...COLOR_TITLE);
      doc.text(jobTitle, LEFT_MARGIN, y);
      y += TITLE_SIZE;
      y += TITLE_TO_CONTACT_GAP;
    }
  }

  // --- Contact line (email | phone | location | linkedin | github |
  // website) — always starts at LEFT_MARGIN and uses the full
  // CONTENT_WIDTH, independent of the photo, identical in both
  // branches above. ---
  const contactParts = buildContactParts(personalInfo, phoneNumber, selectedCountryCode);
  // Ink-bottom reference point for whatever the divider gap measures
  // from. Defaults to the current cursor (used as-is when there's no
  // contact line at all — an unchanged edge case, not part of this
  // request). Overwritten below once the contact line's real last-line
  // ink-bottom is known.
  let contactInkBottomY = y;
  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(METADATA_SIZE);
    doc.setTextColor(...COLOR_METADATA);

    const contactLine = contactParts.join('   |   ');
    // Wrap in case a very long combination of contact details doesn't
    // fit on one line at this font size.
    const wrappedLines = doc.splitTextToSize(contactLine, CONTENT_WIDTH);
    doc.text(wrappedLines, LEFT_MARGIN, y);

    // ROOT CAUSE of the old contact->divider gap being visually wrong:
    // renderSectionHeading()'s DIVIDER_SIDE_GAP_PT is measured from a
    // heading's own INK-BOTTOM, and section headings are guaranteed
    // ALL-CAPS with no descenders, so ink-bottom == baseline there.
    // The contact line is NOT all-caps — it can contain descenders
    // (e.g. "g" in gmail.com, "y" in "NYC", "j"/"p"/"q") that extend
    // below its baseline. Advancing straight from baseline by
    // DIVIDER_SIDE_GAP_PT (as the old HEADER_RULE_GAP code effectively
    // did) would therefore leave a SMALLER real gap above the divider
    // than the identical section-heading case, on any contact line
    // that happens to have a descender on its last rendered line —
    // same numeric constant, different rendered result. Fixed by
    // actually locating that last line's real ink-bottom first: full
    // HELVETICA_DESCENT_RATIO reserve if it has a descender character,
    // baseline itself (no reserve) if it doesn't — mirroring exactly
    // how renderSectionHeading() already reasons about ink-bottom for
    // ALL-CAPS text, just generalized to mixed-case text.
    const lastContactLine = wrappedLines[wrappedLines.length - 1];
    const lastContactBaselineY = y + (wrappedLines.length - 1) * METADATA_SIZE;
    contactInkBottomY = lastContactBaselineY + (hasDescenderChar(lastContactLine) ? METADATA_SIZE * HELVETICA_DESCENT_RATIO : 0);

    y += wrappedLines.length * METADATA_SIZE;
  }

  // --- Header divider ---
  // Reuses the SAME divider design system every section already uses
  // (COLOR_SECTION_DIVIDER + SECTION_DIVIDER_THICKNESS, drawn centered
  // on its Y exactly like renderSectionHeading()'s divider) — not the
  // old, never-wired COLOR_RULE/HEADER_RULE_THICKNESS constants, which
  // were declared for this purpose but never actually drawn. Left
  // those two constants in place (unused) since removing constants is
  // outside the scope of this change. HEADER_RULE_GAP is likewise left
  // declared but now unused here — replaced by DIVIDER_SIDE_GAP_PT
  // below so "contact -> divider" reuses the EXACT SAME gap constant
  // (measured from the exact same kind of reference point: real
  // ink-bottom, not baseline) that every section heading already uses
  // before its own divider — not a second, header-specific value. This
  // divider's own position/thickness/color are UNCHANGED by this fix.
  const headerDividerTopEdgeY = contactInkBottomY + DIVIDER_SIDE_GAP_PT;
  const headerDividerCenterY = headerDividerTopEdgeY + SECTION_DIVIDER_THICKNESS / 2;
  doc.setDrawColor(...COLOR_SECTION_DIVIDER);
  doc.setLineWidth(SECTION_DIVIDER_THICKNESS);
  doc.line(LEFT_MARGIN, headerDividerCenterY, PAGE_WIDTH - RIGHT_MARGIN, headerDividerCenterY);
  const headerDividerBottomEdgeY = headerDividerCenterY + SECTION_DIVIDER_THICKNESS / 2; // divider's real, visible ink-bottom — unchanged geometry

  // ROOT CAUSE of "divider -> Professional Summary" sitting closer
  // than a normal section-to-section gap: every OTHER section's
  // "previousEnd" (the value SECTION_GAP is added to) is always run
  // through topUpToLineHeight() FIRST, which pads it out to a full
  // "last baseline + BODY_LINE_HEIGHT" reference point — i.e. it bakes
  // in the SAME invisible trailing reserve a wrapped body paragraph
  // naturally ends with (its last line already advances by the full
  // BODY_LINE_HEIGHT leading, not just its own ink). That baked-in
  // reserve (~BODY_LINE_HEIGHT minus a couple pt of descender) is what
  // makes every normal section-to-section gap look like SECTION_GAP
  // PLUS that reserve when measured from real, visible ink — not
  // SECTION_GAP alone.
  //
  // The header's divider is real, visible ink with NO such reserve
  // built in — returning its bare bottom edge (or topping up the
  // CONTACT LINE's baseline, which sits almost exactly where the
  // divider itself already is) leaves next to no reserve at all, so
  // the same `+= SECTION_GAP` constant lands the heading much closer
  // than it does after a paragraph or metadata line.
  //
  // Fixed the same way every metadata-ending section already fixes
  // this for itself: run the real ink-bottom through topUpToLineHeight()
  // — the exact same function, no new one — so the divider gets the
  // same BODY_LINE_HEIGHT-sized reserve any other last-drawn element
  // gets. `0` is passed as the "own size already consumed" argument
  // because, unlike text, the divider's bottom edge already IS real
  // ink with no further font-based advance to subtract.
  return topUpToLineHeight(headerDividerBottomEdgeY, 0);
}

// Returns true if `text` contains a lowercase Helvetica descender
// character (g, j, p, q, y) — the letters whose ink extends below the
// baseline. Used to determine a mixed-case (non-ALL-CAPS) line's real
// ink-bottom, the same concept renderSectionHeading() gets for free
// with section headings since those are guaranteed ALL-CAPS (no
// descenders, so ink-bottom == baseline there already).
function hasDescenderChar(text: string): boolean {
  return /[gjpqy]/.test(text);
}

// Returns true only when `photo` is a usable embedded image source —
// a base64 data URL (e.g. "data:image/png;base64,..."). Anything else
// (a bare HTTP URL, which jsPDF's addImage() can't embed synchronously
// without an extra fetch step) is treated as "no photo" — same rule
// ATSPro's own generator uses (atsProPdf.ts isValidPhotoSource()).
function isValidPhotoSource(photo?: string): boolean {
  return typeof photo === 'string' && photo.trim().startsWith('data:image');
}

// Extracts the image subtype (e.g. "PNG", "JPEG") from a data URL, in
// the exact string form jsPDF's addImage() expects as its `format`
// argument. Ported from ATSPro's own generator (getImageFormatFromDataUrl()).
function getImageFormatFromDataUrl(photo: string): string {
  const match = /^data:image\/([a-zA-Z0-9+.-]+);base64,/.exec(photo.trim());
  return match ? match[1].toUpperCase() : 'PNG';
}

// Builds the list of non-empty contact details, in display order.
function buildContactParts(
  personalInfo: CreativePdfPersonalInfo,
  phoneNumber: string,
  selectedCountryCode: string
): string[] {
  const parts: string[] = [];

  if (personalInfo?.email) {
    parts.push(personalInfo.email.trim());
  }

  if (phoneNumber) {
    const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
    parts.push(`${dialPrefix}${phoneNumber}`.trim());
  }

  const location = personalInfo?.location || personalInfo?.city;
  if (location) {
    parts.push(location.trim());
  }

  if (personalInfo?.linkedin) {
    parts.push(personalInfo.linkedin.trim());
  }

  if (personalInfo?.github) {
    parts.push(personalInfo.github.trim());
  }

  const webLink = personalInfo?.website || personalInfo?.portfolio;
  if (webLink) {
    parts.push(webLink.trim());
  }

  return parts;
}

// ====================================================================
// PROFESSIONAL SUMMARY SECTION (Phase 2)
// Renders: "PROFESSIONAL SUMMARY" heading + the wrapped paragraph.
// If professionalSummary is empty/whitespace-only, this renders
// nothing at all (no heading, no gap) and simply returns startY
// unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addSummary(doc: jsPDF, data: CreativePdfData, startY: number): number {
  const summaryText = (data.professionalSummary || '').trim();

  // Nothing to render — skip the section entirely rather than leaving
  // an empty heading or a blank gap.
  if (!summaryText) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (header) and this section.
  y += SECTION_GAP;

  // Font must be set BEFORE measuring/wrapping, since jsPDF wraps
  // text based on the currently active font and size.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const wrappedLines: string[] = doc.splitTextToSize(summaryText, CONTENT_WIDTH);

  // Make sure there's room for the heading plus at least the first
  // line of the summary before starting this section on the current
  // page. Otherwise the heading would be orphaned alone at the
  // bottom of the page with its text pushed to the next one.
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + BODY_LINE_HEIGHT;
  y = checkPageBreak(doc, y, minimumSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'PROFESSIONAL SUMMARY', y, BODY_SIZE);

  // --- Wrapped summary paragraph ---
  // Rendered one line at a time (instead of handing jsPDF the whole
  // array at once) so each line's vertical position can be checked
  // against the remaining page space individually. This is what lets
  // a very long summary flow naturally onto a new page without
  // losing or clipping any text.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(...COLOR_BODY);

  for (const line of wrappedLines) {
    y = checkPageBreak(doc, y, BODY_LINE_HEIGHT);
    doc.text(line, LEFT_MARGIN, y);
    y += BODY_LINE_HEIGHT;
  }

  return y;
}

// ====================================================================
// EXPERIENCE SECTION (Phase 3, refined in Phase 5.1)
// Renders: "EXPERIENCE" heading, then one block per entry:
//   Job Title
//   Company   |   Start Date – End Date
//   Description (wrapped, manual line breaks preserved)
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is
// skipped and startY is returned unchanged.
//
// PHASE 5.1 NOTE: an entry with no description ends on a metadata
// line (title or subtitle) instead of a body-paragraph line, and
// metadata lines carry no extra leading (see the header's contact
// line convention). addExperienceEntry() tops up such an entry's
// ending Y to match a body-paragraph ending, so the gap before
// whatever comes next — another entry, or the Education section — is
// consistent regardless of whether that entry happened to have a
// description. See the comment inside addExperienceEntry() for the
// full analysis (this mirrors the Education -> Skills fix from
// earlier in Phase 5.1).
//
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addExperience(doc: jsPDF, data: CreativePdfData, startY: number): number {
  const experiences = (data.experiences || []).filter(hasUsableExperienceContent);

  if (experiences.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one.
  y += SECTION_GAP;

  // Make sure there's room for the heading plus at least the first
  // entry's job-title line before starting the section on the current
  // page — otherwise the heading would be orphaned alone at the
  // bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'EXPERIENCE', y, EXPERIENCE_TITLE_SIZE);

  // --- Entries ---
  experiences.forEach((exp, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }
    y = addExperienceEntry(doc, exp, y);
  });

  return y;
}

// An entry counts as "usable" if it has ANY content worth printing —
// this mirrors the empty-summary rule from Phase 2: don't render a
// heading for entries that are entirely blank placeholders.
function hasUsableExperienceContent(exp: CreativePdfExperience | null | undefined): boolean {
  if (!exp) {
    return false;
  }
  return Boolean(
    (exp.title || '').trim() ||
    (exp.company || '').trim() ||
    (exp.startDate || '').trim() ||
    (exp.endDate || '').trim() ||
    (exp.description || '').trim()
  );
}

// Renders a single experience entry and returns the new Y position.
function addExperienceEntry(doc: jsPDF, exp: CreativePdfExperience, startY: number): number {
  let y = startY;

  const title = (exp.title || '').trim();
  const company = (exp.company || '').trim();
  const startDate = (exp.startDate || '').trim();
  const endDate = (exp.endDate || '').trim();
  const description = (exp.description || '').trim();

  // Date now renders RIGHT-ALIGNED on the SAME row as the job title
  // (previously its own line above/below company) — via the shared
  // renderTitleRowWithDate() helper (see its own doc comment above),
  // also used by Education and Achievements. Company keeps its own
  // line directly below, unchanged in every other respect.
  const dateRange = [startDate, endDate].filter(Boolean).join(' – ');

  // The description textarea allows the user to type their own line
  // breaks (e.g. one line per responsibility). Those manual breaks are
  // preserved — split on them first, then wrap each resulting line to
  // the page width. This renders the content the user actually wrote
  // instead of inventing a bullet-point format that isn't in the data.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const descriptionLines: string[] = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim();
          return trimmedLine ? doc.splitTextToSize(trimmedLine, CONTENT_WIDTH) : [];
        })
    : [];

  // --- Determine how much space this entry's "header" (title/date row
  // + company line) plus at least the first description line needs, so
  // the whole block can be pushed to a new page together rather than
  // splitting a job title from its own company/first description line.
  // The title row's height only depends on how many lines the title
  // itself wraps into (computed here the same way
  // renderTitleRowWithDate() computes it internally), so this estimate
  // stays accurate without having to render twice. ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateWidthForEstimate = dateRange ? doc.getTextWidth(dateRange) : 0;
  const titleWrapWidthForEstimate = dateRange
    ? Math.max(0, CONTENT_WIDTH - dateWidthForEstimate - TITLE_TO_DATE_GAP_PT)
    : CONTENT_WIDTH;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const estimatedTitleLineCount = title ? doc.splitTextToSize(title, titleWrapWidthForEstimate).length : 0;
  const titleRowHeightEstimate = estimatedTitleLineCount > 0
    ? estimatedTitleLineCount * EXPERIENCE_TITLE_SIZE
    : (dateRange ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const hasTitleRow = Boolean(title || dateRange);

  const titleToCompanyGap = hasTitleRow && company ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;
  const headerHeight = titleRowHeightEstimate + titleToCompanyGap + (company ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const hasHeaderLine = hasTitleRow || Boolean(company);
  const descriptionGap = hasHeaderLine && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const minimumEntrySpaceNeeded = headerHeight + descriptionGap + firstDescriptionLineHeight;
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Job title (left) + Date (right, same row) ---
  const titleRow = renderTitleRowWithDate(doc, title, dateRange, y);
  if (titleRow.hasContent) {
    y += titleRow.height;
    if (company) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Company (its own line, below the title/date row) ---
  if (company) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(company, LEFT_MARGIN, y);
    y += EXPERIENCE_SUBTITLE_SIZE;
  }

  // PHASE 5.1 FIX: this gap is the space BETWEEN the header
  // (title-row/company) and the description, so it must only apply
  // when a description actually follows — otherwise it silently
  // became a generic "trailing space after the entry" for entries
  // with no description, which happened to mask (rather than fix) the
  // metadata-line-has-no-leading issue below. Now conditioned the same
  // way addEducationEntry() already conditions its header-to-grade gap.
  if (hasHeaderLine && descriptionLines.length > 0) {
    y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
  }

  // --- Description ---
  if (descriptionLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);
    doc.setTextColor(...COLOR_BODY);

    for (const line of descriptionLines) {
      y = checkPageBreak(doc, y, BODY_LINE_HEIGHT);
      doc.text(line, LEFT_MARGIN, y);
      y += BODY_LINE_HEIGHT;
    }
  }

  // Same trailing-space parity applied to every Education entry (see
  // the comment inside addEducationEntry() for the full analysis) — it
  // applies here whenever THIS entry ends on a metadata line, whether
  // or not it's the section's last entry. An entry-to-entry gap
  // (EXPERIENCE_ENTRY_GAP, added by the caller) sits on top of whatever
  // y this function returns, exactly like SECTION_GAP does for the
  // section after it — so any entry lacking a description (ending on
  // the company line, or rarer, the title row alone) needs the same
  // top-up, or the gap before the NEXT entry (not just the next
  // section) would be inconsistent too. Entries that do have a
  // description already end on a BODY_LINE_HEIGHT line, so no top-up
  // is needed for them.
  if (descriptionLines.length === 0 && hasHeaderLine) {
    const lastLineFontSize = company ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE;
    y = topUpToLineHeight(y, lastLineFontSize);
  }

  return y;
}

// ====================================================================
// EDUCATION SECTION (Phase 4, refined in Phase 5.1)
// Renders: "EDUCATION" heading, then one block per entry:
//   Degree / Program
//   Institution   |   Year
//   Grade (optional, no label — rendered as typed)
//
// SHARED CONSTANT NOTE: this section deliberately reuses
// EXPERIENCE_TITLE_SIZE, EXPERIENCE_SUBTITLE_SIZE,
// EXPERIENCE_TITLE_TO_SUBTITLE_GAP, EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
// and EXPERIENCE_ENTRY_GAP rather than defining Education-specific
// equivalents — an education entry has the exact same visual
// relationship (title -> subtitle -> supporting detail -> gap to next
// entry) as an experience entry, so reusing keeps the whole CV's
// vertical rhythm consistent. Their "EXPERIENCE_" prefix is now a
// slightly inaccurate name (they're really shared entry-typography
// constants), but renaming them would mean editing Phase 3, which is
// out of scope for this phase — see the Phase 4 report for this
// called out explicitly rather than silently renaming things.
//
// ENTRY-GAP CONSISTENCY: every entry's trailing space is topped up to
// match the leading baked into body-text sections (Summary,
// Experience's description) — not only the section's last entry — so
// EXPERIENCE_ENTRY_GAP measures the same visual distance between EVERY
// pair of entries regardless of grade presence or degree length, and
// the gap before whatever section comes next (via SECTION_GAP) stays
// consistent with every other section transition too. See the comment
// inside addEducationEntry() for the full analysis.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is
// skipped and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addEducation(doc: jsPDF, data: CreativePdfData, startY: number): number {
  const educations = (data.educations || []).filter(hasUsableEducationContent);

  if (educations.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — same relationship
  // as "previous section -> Experience heading", so the same constant.
  y += SECTION_GAP;

  // Room for the heading plus at least the first entry's degree line,
  // so the heading is never left alone at the bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'EDUCATION', y, EXPERIENCE_TITLE_SIZE);

  // --- Entries ---
  educations.forEach((edu, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }
    y = addEducationEntry(doc, edu, y);
  });

  return y;
}

// An entry counts as "usable" if it has ANY content worth printing —
// same rule as hasUsableExperienceContent().
function hasUsableEducationContent(edu: CreativePdfEducation | null | undefined): boolean {
  if (!edu) {
    return false;
  }
  return Boolean(
    (edu.degree || '').trim() ||
    (edu.institution || '').trim() ||
    (edu.year || '').trim() ||
    (edu.grade || '').trim()
  );
}

// Renders a single education entry and returns the new Y position,
// normalized so every entry (not just the section's last one) ends on
// an equivalent trailing space — see the TRAILING-SPACE PARITY comment
// near the end of this function.
function addEducationEntry(
  doc: jsPDF,
  edu: CreativePdfEducation,
  startY: number
): number {
  let y = startY;

  const degree = (edu.degree || '').trim();
  const institution = (edu.institution || '').trim();
  const year = (edu.year || '').trim();
  const grade = (edu.grade || '').trim();

  // Date (year) now renders RIGHT-ALIGNED on the SAME row as the
  // degree name (previously its own line below institution) — via the
  // shared renderTitleRowWithDate() helper (see its own doc comment
  // above), also used by Experience and Achievements. Institution
  // keeps its own line directly below the degree/date row, unchanged
  // in every other respect.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, CONTENT_WIDTH) : [];
  const gradeLines: string[] = grade ? doc.splitTextToSize(grade, CONTENT_WIDTH) : [];

  // Multi-line metadata fields (institution/grade) use their own font
  // size as the per-line height, with no extra leading — the same
  // convention already used for the header's wrapped contact line in
  // addHeader(). BODY_LINE_HEIGHT (with its 1.4 multiplier) is
  // reserved for actual paragraph body text, which none of these
  // fields are.
  const institutionHeight = institutionLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this entry's degree/date row +
  // institution block needs, so the whole block moves to a new page
  // together rather than splitting a degree from its own institution
  // line. The degree/date row's height only depends on how many lines
  // the degree itself wraps into (computed here the same way
  // renderTitleRowWithDate() computes it internally), so this estimate
  // stays accurate without having to render twice. ---
  const dateWidthForEstimate = year ? doc.getTextWidth(year) : 0;
  const degreeWrapWidthForEstimate = year
    ? Math.max(0, CONTENT_WIDTH - dateWidthForEstimate - TITLE_TO_DATE_GAP_PT)
    : CONTENT_WIDTH;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const estimatedDegreeLineCount = degree ? doc.splitTextToSize(degree, degreeWrapWidthForEstimate).length : 0;
  const degreeRowHeightEstimate = estimatedDegreeLineCount > 0
    ? estimatedDegreeLineCount * EXPERIENCE_TITLE_SIZE
    : (year ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const hasDegreeRow = Boolean(degree || year);

  const titleToSubtitleGap = hasDegreeRow && institutionLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const headerHeight = degreeRowHeightEstimate + titleToSubtitleGap + institutionHeight;
  const hasHeaderContent = hasDegreeRow || institutionLines.length > 0;
  const headerToGradeGap = hasHeaderContent && gradeLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstGradeLineHeight = gradeLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : 0;
  const minimumEntrySpaceNeeded = headerHeight + headerToGradeGap + firstGradeLineHeight;
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Degree / Program (left) + Date/Year (right, same row) ---
  const degreeRow = renderTitleRowWithDate(doc, degree, year, y);
  if (degreeRow.hasContent) {
    y += degreeRow.height;
    if (institutionLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Institution / University (its own line, below the degree/date row) ---
  if (institutionLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(institutionLines, LEFT_MARGIN, y);
    y += institutionHeight;
  }

  if (hasHeaderContent && gradeLines.length > 0) {
    y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
  }

  // --- Grade (optional, rendered as typed, no label) ---
  if (gradeLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);

    for (const line of gradeLines) {
      y = checkPageBreak(doc, y, EXPERIENCE_SUBTITLE_SIZE);
      doc.text(line, LEFT_MARGIN, y);
      y += EXPERIENCE_SUBTITLE_SIZE;
    }
  }

  // --- TRAILING-SPACE PARITY (applies to EVERY entry, not just the last) ---
  // Every field above (degree/institution/grade) advances y by its
  // own font size only, with no extra leading — intentional, matching
  // the header's wrapped contact line. A body-text line (Summary's
  // paragraph, Experience's description) instead advances by
  // BODY_LINE_HEIGHT, which bakes in extra leading (~40% more than the
  // font size alone). Whatever gap is added next — EDUCATION_ENTRY_GAP
  // before another entry, or SECTION_GAP before the next section —
  // sits directly on top of y, so if y weren't normalized here, an
  // entry ending on grade would leave a visibly smaller gap than one
  // ending on institution-only (different font sizes) or one ending on
  // degree-only, and the entry-to-entry rhythm would depend on which
  // fields happened to be filled in.
  //
  // Normalizing EVERY entry's end to a body-line-equivalent trailing
  // space (not only the section's last entry) is what makes
  // EXPERIENCE_ENTRY_GAP — the canonical entry-to-entry gap, shared with
  // Experience (see the SHARED CONSTANT NOTE above addEducation()) — mean
  // the same visual distance between every pair of Education entries,
  // regardless of grade presence, degree length, or wrapping. It's also
  // why no separate "last entry" case is needed any more: SECTION_GAP
  // (added by the caller, addSkills()) lands on an already-normalized y
  // exactly like EXPERIENCE_ENTRY_GAP does, whether this happens to be
  // the last entry or not. No new spacing constant — purely the existing
  // gap already used by every other section/entry transition in this
  // file.
  const lastLineFontSize = gradeLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : institutionLines.length > 0
      ? EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_TITLE_SIZE;
  y = topUpToLineHeight(y, lastLineFontSize);

  return y;
}

// ====================================================================
// SKILLS SECTION (Phase 5)
// Renders: "SKILLS" heading, then the skills as an inline, wrapped
// list — "Skill A   •   Skill B   •   Skill C" — flowing onto as many
// lines as are actually needed for the real data at CONTENT_WIDTH.
// If there are no usable skills at all, the whole section (including
// the heading) is skipped and startY is returned unchanged.
//
// SHARED CONSTANT NOTE: this section deliberately reuses SECTION_GAP,
// HEADING_SIZE, HEADING_TO_CONTENT_GAP and COLOR_HEADING (same as
// every other heading), and BODY_SIZE/BODY_LINE_HEIGHT/COLOR_BODY
// (same as the Summary paragraph) rather than inventing Skills-only
// typography or spacing — a line of skills is just wrapped body text,
// the same relationship Summary already has to the page.
//
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addSkills(doc: jsPDF, data: CreativePdfData, startY: number): number {
  const skillsList = parseSkillsList(data.skills);

  // Nothing to render — skip the section entirely rather than leaving
  // an empty heading or a blank gap.
  if (skillsList.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — same
  // relationship as every other "previous section -> next section"
  // gap in this file.
  y += SECTION_GAP;

  // Font must be set BEFORE measuring, since the line-building below
  // measures text width at the currently active font/size.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const skillLines = buildSkillLines(doc, skillsList, CONTENT_WIDTH);

  // Make sure there's room for the heading plus at least the first
  // line of skills before starting this section on the current page.
  // Otherwise the heading would be orphaned alone at the bottom of
  // the page with its content pushed to the next one.
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + BODY_LINE_HEIGHT;
  y = checkPageBreak(doc, y, minimumSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'SKILLS', y, BODY_SIZE);

  // --- Wrapped skill list ---
  // Rendered one line at a time (same pattern as addSummary()) so a
  // long skill list can continue naturally onto a new page without
  // losing, duplicating, or clipping any skill.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(...COLOR_BODY);

  for (const line of skillLines) {
    y = checkPageBreak(doc, y, BODY_LINE_HEIGHT);
    doc.text(line, LEFT_MARGIN, y);
    y += BODY_LINE_HEIGHT;
  }

  return y;
}

// Splits the raw `skills` string into individual skill strings, using
// the EXACT same rule as the CV editor's own getSkillArray()
// (SkillsSection.tsx): comma-separated if it contains a comma,
// otherwise one skill per line with an optional leading bullet
// marker stripped. This is intentionally duplicated logic rather than
// a shared import, since minimalPdf.ts is a self-contained renderer —
// but the rule itself must stay identical to what the editor shows,
// so the PDF never displays a different skill list than the form did.
function parseSkillsList(skillsRaw: string | undefined): string[] {
  const skills = skillsRaw || '';

  if (!skills.trim()) {
    return [];
  }

  if (skills.includes(',')) {
    return skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);
  }

  return skills
    .split('\n')
    .map((s) => s.trim())
    .map((s) => s.replace(/^[•\-*]\s*/, ''))
    .filter((s) => s);
}

// Packs skill strings into as few lines as actually fit within
// maxWidth, measuring real text width at the doc's currently active
// font/size (must be set by the caller before calling this) rather
// than assuming a fixed number of skills per row. A skill is only
// pushed onto a new line once adding it to the current line would
// exceed maxWidth; a single skill longer than maxWidth on its own is
// still placed alone on its line rather than split mid-word.
function buildSkillLines(doc: jsPDF, skills: string[], maxWidth: number): string[] {
  const lines: string[] = [];
  let currentLine = '';

  for (const skill of skills) {
    const candidate = currentLine ? `${currentLine}${SKILLS_SEPARATOR}${skill}` : skill;
    const candidateWidth = doc.getTextWidth(candidate);

    if (candidateWidth <= maxWidth || !currentLine) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = skill;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// ====================================================================
// LANGUAGES SECTION (Phase 6)
// Renders: "LANGUAGES" heading, then one block per entry:
//   Language Name
//   Proficiency label (optional, expanded from the form's short code —
//   see getProficiencyDisplayLabel())
//
// SHARED CONSTANT NOTE: reuses EXPERIENCE_TITLE_SIZE/COLOR_HEADING for
// the language name and EXPERIENCE_SUBTITLE_SIZE/COLOR_METADATA for the
// proficiency line — the exact same title/subtitle visual relationship
// Experience and Education entries already use — and reuses
// EXPERIENCE_ENTRY_GAP for the gap between one language and the next,
// rather than inventing a LANGUAGE_ENTRY_GAP that would just be the
// same value under a different name (the same reasoning Education's
// SHARED CONSTANT NOTE gives for reusing it there).
//
// ENTRY-GAP CONSISTENCY: every entry's trailing space is normalized via
// topUpToLineHeight() (same helper Education entries use), so
// EXPERIENCE_ENTRY_GAP measures the same visual distance between every
// pair of language entries regardless of whether proficiency is present,
// and SECTION_GAP measures the same distance to whatever section comes
// next regardless of which entry happens to be last.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addLanguages(doc: jsPDF, data: CreativePdfData, startY: number): number {
  const languages = (data.languages || []).filter(hasUsableLanguageContent);

  if (languages.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — the same
  // relationship as every other "previous section -> next section" gap
  // in this file.
  y += SECTION_GAP;

  // Room for the heading plus at least the first entry's language-name
  // line, so the heading is never left alone at the bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'LANGUAGES', y, EXPERIENCE_TITLE_SIZE);

  // --- Entries ---
  languages.forEach((lang, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }
    y = addLanguageEntry(doc, lang, y);
  });

  return y;
}

// An entry counts as "usable" if it has ANY content worth printing —
// same rule as hasUsableExperienceContent()/hasUsableEducationContent().
function hasUsableLanguageContent(lang: CreativePdfLanguage | null | undefined): boolean {
  if (!lang) {
    return false;
  }
  return Boolean((lang.language || '').trim() || (lang.proficiency || '').trim());
}

// Expands the form's stored short proficiency code to the same
// human-readable label LanguagesSection.tsx's own getProficiencyLabel()
// shows in its preview line. Intentionally duplicated (not imported)
// for the same reason parseSkillsList() duplicates getSkillArray()'s
// rule instead of sharing it: minimalPdf.ts is a self-contained
// renderer — but the mapping itself must stay identical to the form's,
// so the PDF never shows a different proficiency label than the form
// did. Falls back to the raw stored value for anything unrecognized
// (e.g. older data saved before a label was added), rather than
// showing nothing.
function getProficiencyDisplayLabel(proficiency: string): string {
  const labels: Record<string, string> = {
    Beginner: 'Beginner',
    Intermediate: 'Professional Working Proficiency',
    Advanced: 'Advanced Professional Proficiency',
    Fluent: 'Native/Bilingual Proficiency',
  };
  return labels[proficiency] || proficiency;
}

// Renders a single language entry and returns the new Y position,
// normalized (like every Education entry) so every entry — not only
// the section's last one — ends on an equivalent trailing space. See
// the ENTRY-GAP CONSISTENCY note above addLanguages().
function addLanguageEntry(doc: jsPDF, lang: CreativePdfLanguage, startY: number): number {
  let y = startY;

  const language = (lang.language || '').trim();
  const proficiencyRaw = (lang.proficiency || '').trim();
  const proficiencyLabel = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';

  // Wrap each field independently (either could be long), the same way
  // addEducationEntry() wraps degree/subtitle/grade.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const languageLines: string[] = language ? doc.splitTextToSize(language, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const proficiencyLines: string[] = proficiencyLabel
    ? doc.splitTextToSize(proficiencyLabel, CONTENT_WIDTH)
    : [];

  // Multi-line fields use their own font size as the per-line height,
  // with no extra leading — the same metadata-line convention used by
  // the header's contact line and every Education field.
  const languageHeight = languageLines.length * EXPERIENCE_TITLE_SIZE;
  const proficiencyHeight = proficiencyLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a language name from
  // its own proficiency line. ---
  const titleToSubtitleGap = languageLines.length > 0 && proficiencyLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const minimumEntrySpaceNeeded = languageHeight + titleToSubtitleGap + proficiencyHeight;
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Language name ---
  if (languageLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(languageLines, LEFT_MARGIN, y);
    y += languageHeight;
    if (proficiencyLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Proficiency (optional, no label, matching the form's own
  // preview convention — no artificial space reserved when absent) ---
  if (proficiencyLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(proficiencyLines, LEFT_MARGIN, y);
    y += proficiencyHeight;
  }

  // ENTRY-GAP CONSISTENCY: normalize every entry's end (not only the
  // last) to a body-line-equivalent trailing space — see the
  // ENTRY-GAP CONSISTENCY note above addLanguages() and the matching
  // comment inside addEducationEntry() for the full analysis.
  const lastLineFontSize = proficiencyLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : EXPERIENCE_TITLE_SIZE;
  y = topUpToLineHeight(y, lastLineFontSize);

  return y;
}

// ====================================================================
// ACHIEVEMENTS SECTION (Phase 7)
// Renders: "ACHIEVEMENTS" heading, then one block per achievement:
//   Achievement Title
//   Date (optional)
//   Description (wrapped)
//
// SHARED CONSTANT NOTE: reuses EXPERIENCE_TITLE_SIZE/COLOR_HEADING for
// the achievement title and EXPERIENCE_SUBTITLE_SIZE/COLOR_METADATA for
// the date line — the same title/subtitle visual relationship Experience
// and Education entries already use — and reuses EXPERIENCE_ENTRY_GAP
// for the gap between one achievement and the next (same semantic: one
// complete entry to the next), rather than inventing a separate constant.
//
// ENTRY-GAP CONSISTENCY: every entry's trailing space is normalized via
// topUpToLineHeight() (same helper Education/Language entries use), so
// EXPERIENCE_ENTRY_GAP measures the same visual distance between every
// pair of achievement entries regardless of date presence or description
// length, and SECTION_GAP measures the same distance to whatever section
// comes next regardless of which entry happens to be last.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addAchievements(doc: jsPDF, data: CreativePdfData, startY: number): number {
  const achievements = (data.achievements || []).filter(hasUsableAchievementContent);

  if (achievements.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — the same
  // relationship as every other "previous section -> next section" gap
  // in this file.
  y += SECTION_GAP;

  // Room for the heading plus at least the first entry's title line,
  // so the heading is never left alone at the bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'ACHIEVEMENTS', y, EXPERIENCE_TITLE_SIZE);

  // --- Entries ---
  achievements.forEach((ach, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }
    y = addAchievementEntry(doc, ach, y);
  });

  return y;
}

// An entry counts as "usable" if it has ANY content worth printing —
// same rule as hasUsableExperienceContent()/hasUsableEducationContent().
function hasUsableAchievementContent(ach: any | null | undefined): boolean {
  if (!ach) {
    return false;
  }
  return Boolean(
    (ach.title || '').trim() ||
    (ach.date || '').trim() ||
    (ach.description || '').trim()
  );
}

// Renders a single achievement entry and returns the new Y position,
// normalized (like every Education/Language entry) so every entry —
// not only the section's last one — ends on an equivalent trailing space.
// Renders a left-aligned title/degree/achievement-name (bold,
// COLOR_HEADING, EXPERIENCE_TITLE_SIZE) with its date right-aligned on
// the SAME baseline row (normal weight, COLOR_METADATA,
// EXPERIENCE_SUBTITLE_SIZE) — a single shared helper used by
// Experience, Education, and Achievements so all three date
// placements stay identical (same fonts, same gap, same boundary).
//
// The date NEVER wraps: its width is measured with doc.getTextWidth()
// and it's placed so its own right edge sits exactly at the existing
// content right boundary (PAGE_WIDTH - RIGHT_MARGIN) — never past it,
// regardless of page width, since this is computed from the existing
// constants rather than a fixed X.
//
// The title/degree/name wraps (via the file's existing
// doc.splitTextToSize()) into whatever width remains to its LEFT once
// the date's own measured width plus TITLE_TO_DATE_GAP_PT is
// subtracted from CONTENT_WIDTH — so a long title can never collide
// with the date; it simply wraps onto additional lines the normal
// way, with the date only ever drawn on the row of that title's FIRST
// line. Every subsequent wrapped line still starts at LEFT_MARGIN but
// is naturally narrower than CONTENT_WIDTH while a date is present —
// the same trade-off any right-aligned-date resume layout makes.
//
// Returns the wrapped title lines and the total height they consume
// (own-font-size-per-line, no extra leading — the same convention
// already used for every other metadata field in this file), so the
// caller advances its own Y cursor exactly as it did before.
function renderTitleRowWithDate(
  doc: jsPDF,
  title: string,
  date: string,
  y: number
): { lines: string[]; height: number; hasContent: boolean } {
  let dateWidth = 0;
  if (date) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    dateWidth = doc.getTextWidth(date);
  }

  const titleWrapWidth = date
    ? Math.max(0, CONTENT_WIDTH - dateWidth - TITLE_TO_DATE_GAP_PT)
    : CONTENT_WIDTH;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleLines: string[] = title ? doc.splitTextToSize(title, titleWrapWidth) : [];

  if (titleLines.length > 0) {
    doc.setTextColor(...COLOR_HEADING);
    doc.text(titleLines, LEFT_MARGIN, y);
  }

  if (date) {
    const rightBoundary = PAGE_WIDTH - RIGHT_MARGIN;
    const dateX = rightBoundary - dateWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(date, dateX, y); // same baseline row as the title's first line
  }

  const hasContent = titleLines.length > 0 || Boolean(date);
  const height = titleLines.length > 0
    ? titleLines.length * EXPERIENCE_TITLE_SIZE
    : (date ? EXPERIENCE_SUBTITLE_SIZE : 0);

  return { lines: titleLines, height, hasContent };
}

// Renders a bulleted list of achievement items: a "•" dot at
// LEFT_MARGIN, then the item's text indented by BULLET_DOT_TO_TEXT_GAP_PT
// — the bullet dot's X position never moves; only the text is offset
// from it. Single centralized helper so any section wanting this exact
// bullet format (currently Achievements) reuses the same dot color,
// gap, and page-break behavior rather than duplicating it.
//
// ONE-BULLET-PER-ITEM: `items` is an array of ACHIEVEMENT ITEMS, where
// each item is itself the array of already-wrapped lines that one
// achievement sentence produced (via doc.splitTextToSize()). The bullet
// dot is drawn only once per item — against that item's FIRST wrapped
// line — and every subsequent wrapped line belonging to the SAME item
// is rendered at the bullet's text indentation with no dot, so a
// sentence that wraps onto 2, 10, or 20 lines still shows exactly one
// bullet. This mirrors how the rest of the file already separates "one
// logical line" from "the lines it wraps into" (see descriptionLines
// construction above) — the only change here is that the grouping by
// logical item is preserved through to render time instead of being
// flattened away. Returns the new Y position.
function renderBulletedDescriptionLines(doc: jsPDF, items: string[][], startY: number): number {
  let y = startY;
  const bulletX = LEFT_MARGIN;
  const textX = LEFT_MARGIN + BULLET_DOT_TO_TEXT_GAP_PT;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  for (const itemLines of items) {
    itemLines.forEach((line, lineIndex) => {
      y = checkPageBreak(doc, y, BODY_LINE_HEIGHT);
      if (lineIndex === 0) {
        // First wrapped line of this achievement item — draw its bullet.
        doc.setTextColor(...COLOR_SECTION_HEADING); // bullet dot — Minimal PDF's own section-heading/accent color
        doc.text('•', bulletX, y);
      }
      // Continuation lines of the same item render no dot, but still
      // start at the bullet-text indentation, exactly like the first line.
      doc.setTextColor(...COLOR_BODY);
      doc.text(line, textX, y);
      y += BODY_LINE_HEIGHT;
    });
  }

  return y;
}

function addAchievementEntry(
  doc: jsPDF,
  ach: any,
  startY: number
): number {
  let y = startY;

  const title = (ach.title || '').trim();
  const date = (ach.date || '').trim();
  const description = (ach.description || '').trim();

  // Date now renders RIGHT-ALIGNED on the SAME row as the achievement
  // title/name (previously its own line below the title) — via the
  // shared renderTitleRowWithDate() helper (see its own doc comment
  // above), also used by Experience and Education.

  // Description uses body text size and line height with 1.4 multiplier
  // (same as Summary and Experience description).
  //
  // ONE-BULLET-PER-ITEM: each manual line break the user typed (split on
  // '\n') is one ACHIEVEMENT ITEM and gets exactly one bullet dot,
  // regardless of how many lines it wraps into. `descriptionItems` keeps
  // that grouping — one array entry per item, each entry being that
  // item's own wrapped lines — so renderBulletedDescriptionLines() can
  // draw a single bullet per item instead of one per wrapped line.
  // `descriptionLines` (the flat list of every wrapped line, across all
  // items) is kept alongside it purely for the page-break/space
  // estimates below, which only ever cared about total line count.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const descriptionItems: string[][] = description
    ? description
        .split('\n')
        .map((rawLine) => rawLine.trim())
        .filter((trimmedLine) => trimmedLine.length > 0)
        .map((trimmedLine) => doc.splitTextToSize(trimmedLine, CONTENT_WIDTH))
    : [];
  const descriptionLines: string[] = descriptionItems.flat();

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a title from its
  // date/description. The title row's height only depends on how many
  // lines the title itself wraps into (computed here the same way
  // renderTitleRowWithDate() computes it internally), so this estimate
  // stays accurate without having to render twice. ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateWidthForEstimate = date ? doc.getTextWidth(date) : 0;
  const titleWrapWidthForEstimate = date
    ? Math.max(0, CONTENT_WIDTH - dateWidthForEstimate - TITLE_TO_DATE_GAP_PT)
    : CONTENT_WIDTH;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const estimatedTitleLineCount = title ? doc.splitTextToSize(title, titleWrapWidthForEstimate).length : 0;
  const titleRowHeightEstimate = estimatedTitleLineCount > 0
    ? estimatedTitleLineCount * EXPERIENCE_TITLE_SIZE
    : (date ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const hasHeaderContent = Boolean(title || date);
  const headerToDescriptionGap = hasHeaderContent && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const minimumEntrySpaceNeeded = titleRowHeightEstimate +
    headerToDescriptionGap + firstDescriptionLineHeight;
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Achievement Title (left) + Date (right, same row) ---
  const titleRow = renderTitleRowWithDate(doc, title, date, y);
  if (titleRow.hasContent) {
    y += titleRow.height;
  }

  // --- Description (optional, wrapped body text, rendered as bullets) ---
  if (descriptionLines.length > 0) {
    // Only add the gap if there was header content before it
    if (hasHeaderContent) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }

    y = renderBulletedDescriptionLines(doc, descriptionItems, y);
  }

  // ENTRY-GAP CONSISTENCY: normalize every entry's end (not only the
  // last) to a body-line-equivalent trailing space.
  // 
  // When there IS a description: the last line uses BODY_LINE_HEIGHT (14.7)
  // which already includes the 1.4 multiplier — this is the body-line-equivalent.
  // 
  // When there is NO description: the last line is the title row
  // which uses its own font size (11, or 10 if only a date was
  // present with no title). topUpToLineHeight() adds the difference
  // between BODY_LINE_HEIGHT and that font size, resulting in the
  // same body-line-equivalent (14.7 from the start of the last line).
  //
  // Both cases result in the SAME Y position baseline, ensuring that
  // EXPERIENCE_ENTRY_GAP and SECTION_GAP are consistent regardless of
  // whether achievements have descriptions or not.
  let lastLineFontSize: number;
  if (descriptionLines.length > 0) {
    // Description already ends at body-line-equivalent
    return y;
  } else if (title) {
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
  } else if (date) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
  } else {
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
  }
  y = topUpToLineHeight(y, lastLineFontSize);

  return y;
}

// ====================================================================
// CERTIFICATIONS SECTION (Phase 8)
// Renders: "CERTIFICATIONS" heading, then one block per certification:
//   Certification Name
//   Date (optional)
//   Credential ID (optional)
//
// SHARED CONSTANT NOTE: reuses EXPERIENCE_TITLE_SIZE/COLOR_HEADING for
// the certification name and EXPERIENCE_SUBTITLE_SIZE/COLOR_METADATA for
// the date and credential ID lines — the same title/subtitle visual
// relationship Experience and Education entries already use — and reuses
// EXPERIENCE_ENTRY_GAP for the gap between one certification and the next
// (same semantic: one complete entry to the next), rather than inventing
// a separate constant.
//
// ENTRY-GAP CONSISTENCY: every entry's trailing space is normalized via
// topUpToLineHeight() (same helper Education/Language/Achievement entries
// use), so EXPERIENCE_ENTRY_GAP measures the same visual distance between
// every pair of certification entries regardless of which optional fields
// are present, and SECTION_GAP measures the same distance to whatever
// section comes next regardless of which entry happens to be last.
//
// CRITICAL: The gap between Achievements and Certifications is exactly
// SECTION_GAP (18pt). Achievements returns its actual content end, and
// Certifications applies SECTION_GAP at its start. This is the same
// architecture used by every other section transition in this file.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addCertifications(doc: jsPDF, data: CreativePdfData, startY: number): number {
  const certifications = (data.certifications || []).filter(hasUsableCertificationContent);

  if (certifications.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (Achievements) and this section.
  // This is the SAME SECTION_GAP used by all other section transitions.
  // No special Achievements→Certifications gap constant exists or is needed.
  y += SECTION_GAP;

  // Room for the heading plus at least the first entry's name line,
  // so the heading is never left alone at the bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'CERTIFICATIONS', y, EXPERIENCE_TITLE_SIZE);

  // --- Entries ---
  certifications.forEach((cert, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }
    y = addCertificationEntry(doc, cert, y);
  });

  return y;
}

// An entry counts as "usable" if it has ANY content worth printing —
// same rule as hasUsableExperienceContent()/hasUsableEducationContent().
function hasUsableCertificationContent(cert: any | null | undefined): boolean {
  if (!cert) {
    return false;
  }
  return Boolean(
    (cert.name || '').trim() ||
    (cert.date || '').trim() ||
    (cert.credentialId || '').trim()
  );
}

// Renders a single certification entry and returns the new Y position,
// normalized (like every Education/Language/Achievement entry) so every
// entry — not only the section's last one — ends on an equivalent
// trailing space.
function addCertificationEntry(
  doc: jsPDF,
  cert: any,
  startY: number
): number {
  let y = startY;

  const name = (cert.name || '').trim();
  const date = (cert.date || '').trim();
  const credentialId = (cert.credentialId || '').trim();

  // Wrap each field independently (any could be long).
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const nameLines: string[] = name ? doc.splitTextToSize(name, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateLines: string[] = date ? doc.splitTextToSize(date, CONTENT_WIDTH) : [];
  const credentialLines: string[] = credentialId ? doc.splitTextToSize(credentialId, CONTENT_WIDTH) : [];

  // Multi-line metadata fields (name/date/credential) use their own font
  // size as the per-line height, with no extra leading — the same
  // metadata-line convention used by the header's contact line and every
  // Education field.
  const nameHeight = nameLines.length * EXPERIENCE_TITLE_SIZE;
  const dateHeight = dateLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const credentialHeight = credentialLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a name from its date
  // or credential ID. ---
  const nameToDateGap = nameLines.length > 0 && dateLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const dateToCredentialGap = dateLines.length > 0 && credentialLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const nameToCredentialGap = nameLines.length > 0 && credentialLines.length > 0 && dateLines.length === 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  
  const minimumEntrySpaceNeeded = nameHeight + nameToDateGap + dateHeight + 
    dateToCredentialGap + credentialHeight + nameToCredentialGap;
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Certification Name ---
  if (nameLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(nameLines, LEFT_MARGIN, y);
    y += nameHeight;
    if (dateLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    } else if (credentialLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Date (optional) ---
  if (dateLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(dateLines, LEFT_MARGIN, y);
    y += dateHeight;
    if (credentialLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Credential ID (optional) ---
  if (credentialLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(credentialLines, LEFT_MARGIN, y);
    y += credentialHeight;
  }

  // ENTRY-GAP CONSISTENCY: normalize every entry's end (not only the
  // last) to a body-line-equivalent trailing space — see the matching
  // comment inside addEducationEntry() for the full analysis.
  // The last line could be credential (EXPERIENCE_SUBTITLE_SIZE),
  // date (EXPERIENCE_SUBTITLE_SIZE), or name (EXPERIENCE_TITLE_SIZE).
  let lastLineFontSize: number;
  if (credentialLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
  } else if (dateLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
  } else {
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
  }
  y = topUpToLineHeight(y, lastLineFontSize);

  return y;
}

// ====================================================================
// PROJECTS SECTION (Phase 9)
// Renders: "PROJECTS" heading, then one block per project:
//   Project Name
//   Tech (optional)
//   Description (wrapped bullet points, manual line breaks preserved)
//   GitHub (optional)
//
// SHARED CONSTANT NOTE: reuses EXPERIENCE_TITLE_SIZE/COLOR_HEADING for
// the project name and EXPERIENCE_SUBTITLE_SIZE/COLOR_METADATA for
// the tech, description, and GitHub lines — the same title/subtitle
// visual relationship Experience and Education entries already use —
// and reuses EXPERIENCE_ENTRY_GAP for the gap between one project and
// the next (same semantic: one complete entry to the next), rather than
// inventing a separate constant.
//
// ENTRY-GAP CONSISTENCY: every entry's trailing space is normalized via
// topUpToLineHeight() (same helper Education/Language/Achievement/
// Certification entries use), so EXPERIENCE_ENTRY_GAP measures the same
// visual distance between every pair of project entries regardless of
// which optional fields are present, and SECTION_GAP measures the same
// distance to whatever section comes next regardless of which entry
// happens to be last.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addProjects(doc: jsPDF, data: CreativePdfData, startY: number): number {
  const projects = (data.projects || []).filter(hasUsableProjectContent);

  if (projects.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (Certifications) and this section.
  // This is the SAME SECTION_GAP used by all other section transitions.
  y += SECTION_GAP;

  // Room for the heading plus at least the first entry's name line,
  // so the heading is never left alone at the bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'PROJECTS', y, EXPERIENCE_TITLE_SIZE);

  // --- Entries ---
  projects.forEach((project, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }
    y = addProjectEntry(doc, project, y);
  });

  return y;
}

// An entry counts as "usable" if it has ANY content worth printing —
// same rule as hasUsableExperienceContent()/hasUsableEducationContent().
function hasUsableProjectContent(project: any | null | undefined): boolean {
  if (!project) {
    return false;
  }
  return Boolean(
    (project.name || '').trim() ||
    (project.tech || '').trim() ||
    (project.description || '').trim() ||
    (project.github || '').trim()
  );
}

// Renders a single project entry and returns the new Y position,
// normalized (like every Education/Language/Achievement/Certification
// entry) so every entry — not only the section's last one — ends on an
// equivalent trailing space.
function addProjectEntry(
  doc: jsPDF,
  project: any,
  startY: number
): number {
  let y = startY;

  const name = (project.name || '').trim();
  const tech = (project.tech || '').trim();
  const description = (project.description || '').trim();
  const github = (project.github || '').trim();

  // Wrap each field independently (any could be long).
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const nameLines: string[] = name ? doc.splitTextToSize(name, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const techLines: string[] = tech ? doc.splitTextToSize(tech, CONTENT_WIDTH) : [];

  // Description uses body text size and line height with 1.4 multiplier
  // (same as Summary and Experience description).
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const descriptionLines: string[] = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim();
          return trimmedLine ? doc.splitTextToSize(trimmedLine, CONTENT_WIDTH) : [];
        })
    : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const githubLines: string[] = github ? doc.splitTextToSize(github, CONTENT_WIDTH) : [];

  // Multi-line metadata fields (name/tech/github) use their own font
  // size as the per-line height, with no extra leading — the same
  // metadata-line convention used by the header's contact line and every
  // Education field.
  const nameHeight = nameLines.length * EXPERIENCE_TITLE_SIZE;
  const techHeight = techLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const descriptionHeight = descriptionLines.length * BODY_LINE_HEIGHT;
  const githubHeight = githubLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a name from its tech,
  // description, or GitHub link. ---
  const nameToTechGap = nameLines.length > 0 && techLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const hasHeaderContent = nameLines.length > 0 || techLines.length > 0;
  const headerToDescriptionGap = hasHeaderContent && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const descriptionToGithubGap = descriptionLines.length > 0 && githubLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const nameToDescriptionGap = nameLines.length > 0 && descriptionLines.length > 0 && techLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const techToGithubGap = techLines.length > 0 && githubLines.length > 0 && descriptionLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const nameToGithubGap = nameLines.length > 0 && githubLines.length > 0 && techLines.length === 0 && descriptionLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;

  const minimumEntrySpaceNeeded = nameHeight + nameToTechGap + techHeight +
    headerToDescriptionGap + descriptionHeight + nameToDescriptionGap +
    descriptionToGithubGap + githubHeight + techToGithubGap + nameToGithubGap;
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Project Name ---
  if (nameLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(nameLines, LEFT_MARGIN, y);
    y += nameHeight;
    if (techLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    } else if (descriptionLines.length > 0) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    } else if (githubLines.length > 0) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }
  }

  // --- Tech (optional) ---
  if (techLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(techLines, LEFT_MARGIN, y);
    y += techHeight;
    if (descriptionLines.length > 0) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    } else if (githubLines.length > 0) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }
  }

  // --- Description (optional, wrapped body text with bullet points) ---
  if (descriptionLines.length > 0) {
    // Only add the gap if there was header content before it
    if (hasHeaderContent) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);
    doc.setTextColor(...COLOR_BODY);

    for (const line of descriptionLines) {
      y = checkPageBreak(doc, y, BODY_LINE_HEIGHT);
      doc.text(line, LEFT_MARGIN, y);
      y += BODY_LINE_HEIGHT;
    }
    
    if (githubLines.length > 0) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }
  }

  // --- GitHub (optional) ---
  if (githubLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_LINK); // OLD design renders links in their own tone, distinct from ordinary metadata
    doc.text(githubLines, LEFT_MARGIN, y);
    y += githubHeight;
  }

  // ENTRY-GAP CONSISTENCY: normalize every entry's end (not only the
  // last) to a body-line-equivalent trailing space — see the matching
  // comment inside addEducationEntry() for the full analysis.
  // The last line could be github (EXPERIENCE_SUBTITLE_SIZE),
  // description (BODY_LINE_HEIGHT already has 1.4 multiplier),
  // tech (EXPERIENCE_SUBTITLE_SIZE), or name (EXPERIENCE_TITLE_SIZE).
  let lastLineFontSize: number;
  if (githubLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
  } else if (descriptionLines.length > 0) {
    // Description already ends at body-line-equivalent
    return y;
  } else if (techLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
  } else {
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
  }
  y = topUpToLineHeight(y, lastLineFontSize);

  return y;
}

// ====================================================================
// PAGE-BREAK HELPER
// Used by addSummary(), addExperience()/addExperienceEntry(),
// addEducation()/addEducationEntry(), addSkills(), addLanguages()/
// addLanguageEntry(), addAchievements()/addAchievementEntry(),
// addCertifications()/addCertificationEntry(), addProjects()/
// addProjectEntry() (and every future section) to decide whether there
// is enough room left on the current page for the next chunk of content.
// If not, it starts a new page and resets Y to the top margin. Content
// length controls page breaks — no hardcoded per-section page-break
// thresholds anywhere else in this file.
// ====================================================================
export function checkPageBreak(doc: jsPDF, y: number, spaceNeeded: number): number {
  const willOverflow = y + spaceNeeded > PAGE_HEIGHT - BOTTOM_MARGIN;
  if (willOverflow) {
    doc.addPage();
    return TOP_MARGIN;
  }
  return y;
}