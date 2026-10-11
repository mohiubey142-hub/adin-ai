/**
 * academicPdf.ts
 * ------------------------------------------------------------------
 * A from-scratch, single-file CV PDF generator built with jsPDF.
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
const BOTTOM_MARGIN = 40;

// Usable horizontal space for text, after subtracting both margins.
// Used for text-wrapping calculations.
const CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;

// Usable vertical space on ONE page, after subtracting both margins.
// Used by the page-flow system (see keepTogetherHeight() near
// checkPageBreak()) to tell a block that merely doesn't fit on the
// CURRENT page (move it to the next one) from a block that can never
// fit on ANY single page (let it flow across pages line by line).
const PAGE_USABLE_HEIGHT = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

// ====================================================================
// TYPOGRAPHY CONSTANTS (font sizes, in points)
// ====================================================================

// Auto-fit scale currently applied to every BASE_*/let bulk constant
// below (body/entry text sizes, section/entry spacing). 1 = full size,
// untouched. Set only by recomputeScaledConstants() — see the
// AUTO-FIT-TO-ONE-PAGE section near the entry point at the bottom of
// this file. Never applied to the header's own name/title/contact
// sizes, margins, colors, stroke widths, or photo geometry.
let SCALE_FACTOR = 1;

const NAME_SIZE = 22;
const TITLE_SIZE = 13;
const METADATA_SIZE = 9.5; // contact line (email / phone / location / links)

// Reserved for later phases (section headings, body paragraphs).
// Declared now so every size constant lives in one place from the start.
const BASE_HEADING_SIZE = 12;
let HEADING_SIZE = BASE_HEADING_SIZE;
const BASE_BODY_SIZE = 10.5;
let BODY_SIZE = BASE_BODY_SIZE;

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
let BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;

// --- Experience entry typography (Phase 3) ---
// Job title: slightly smaller than a section heading, but still bold,
// so entries are clearly distinguishable from the section heading
// above them.
const BASE_EXPERIENCE_TITLE_SIZE = 11;
let EXPERIENCE_TITLE_SIZE = BASE_EXPERIENCE_TITLE_SIZE;
// Company / dates line: supporting text, same visual weight as the
// header's contact line.
const BASE_EXPERIENCE_SUBTITLE_SIZE = 10;
let EXPERIENCE_SUBTITLE_SIZE = BASE_EXPERIENCE_SUBTITLE_SIZE;

// ====================================================================
// SPACING CONSTANTS (in points)
// A "gap" is the vertical space added AFTER a line's own height,
// i.e. it is whitespace on top of the text height, not a replacement
// for it.
// ====================================================================
const BASE_NAME_TO_TITLE_GAP = 6;
let NAME_TO_TITLE_GAP = BASE_NAME_TO_TITLE_GAP;
const BASE_TITLE_TO_CONTACT_GAP = 10;
let TITLE_TO_CONTACT_GAP = BASE_TITLE_TO_CONTACT_GAP;
const BASE_HEADER_RULE_GAP = 12; // space above AND below the divider line under the header
let HEADER_RULE_GAP = BASE_HEADER_RULE_GAP;

// Reserved for later phases (sections, list items, bullets).
const BASE_SECTION_GAP = 18;
let SECTION_GAP = BASE_SECTION_GAP;
// NOTE: as of this phase, HEADING_TO_CONTENT_GAP is no longer used to
// position section content directly under a heading — every section
// now renders a divider between heading and content, via
// renderSectionHeading(), and that transition is governed instead by
// HEADING_TO_DIVIDER_GAP + DIVIDER_TO_CONTENT_GAP below. Left in place
// (unused) rather than deleted, since removing constants is outside
// the scope of this phase and nothing outside this file depends on it
// being absent.
const BASE_HEADING_TO_CONTENT_GAP = 8;
let HEADING_TO_CONTENT_GAP = BASE_HEADING_TO_CONTENT_GAP;
const BASE_ITEM_GAP = 10;
let ITEM_GAP = BASE_ITEM_GAP;
const BASE_BULLET_GAP = 4;
let BULLET_GAP = BASE_BULLET_GAP;

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
const BASE_DIVIDER_SIDE_GAP_MM = 4; // requested: 2mm -> 4mm on each side
let DIVIDER_SIDE_GAP_MM = BASE_DIVIDER_SIDE_GAP_MM;
let DIVIDER_SIDE_GAP_PT = DIVIDER_SIDE_GAP_MM * MM_TO_PT; // 4mm, ≈ 11.3386pt

// Requested +1mm increase to ONE specific gap only: HEADER CONTACT
// DIVIDER -> PROFESSIONAL SUMMARY HEADING. This constant is consumed
// exclusively inside addSummary()'s own `y += SECTION_GAP` line (the
// single place that establishes that particular gap, since addSummary()
// is always called immediately after addHeader() — see the call chain
// in generate...()). It must NOT be folded into SECTION_GAP itself,
// DIVIDER_SIDE_GAP_PT, or topUpToLineHeight(), since every one of those
// is shared by every other section-to-section transition in this file
// and changing any of them would shift gaps this task requires to stay
// exactly as they are (Summary->Experience, Experience->Education,
// etc.). Uses the same MM_TO_PT conversion as every other mm-based
// constant above — no raw pt value introduced.
const BASE_CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_MM = 1;
let CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_MM = BASE_CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_MM;
let CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT = CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_MM * MM_TO_PT; // 1mm, ≈ 2.8346pt

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

// --- Header profile photo — requested render-only adjustments (2mm
// up, 5% larger) ---
// Both are derived FROM the existing HEADER_PHOTO_SIZE_PT/position —
// never a newly guessed size or coordinate — and are applied ONLY to
// how the photo is drawn (its circle/image geometry). They deliberately
// do NOT touch HEADER_PHOTO_SIZE_PT itself or the header's Y-cursor
// math below, so the Name/Job Title/Contact/divider — all locked —
// keep the EXACT SAME Y-flow as before this change.
//
// Size: 105% of the current rendered diameter, i.e. current size
// scaled by a named multiplier rather than a hardcoded new diameter.
const HEADER_PHOTO_SIZE_MULTIPLIER = 1.05; // requested: current size -> 105% of current size

// Latest requested increase: +4pt on top of the CURRENT rendered
// diameter (HEADER_PHOTO_SIZE_PT * HEADER_PHOTO_SIZE_MULTIPLIER,
// i.e. 75 * 1.05 = 78.75pt), not on top of the original
// HEADER_PHOTO_SIZE_PT. Declared as its own named term — rather than
// folded into HEADER_PHOTO_SIZE_MULTIPLIER or a new literal — so this
// file's history of render-size changes stays legible and
// independently traceable, matching the convention already used for
// HEADER_PHOTO_SIZE_MULTIPLIER/HEADER_PHOTO_VERTICAL_SHIFT_PT above.
// Like those, it only feeds HEADER_PHOTO_RENDER_SIZE_PT — it never
// touches HEADER_PHOTO_SIZE_PT itself or the header's Y-cursor math,
// so it cannot cascade into Name/Job Title/Contact/divider spacing.
const HEADER_PHOTO_RENDER_SIZE_INCREASE_PT = 4; // pt — requested +4px increase on top of the current (75 * 1.05 = 78.75pt) rendered size
const HEADER_PHOTO_RENDER_SIZE_PT = HEADER_PHOTO_SIZE_PT * HEADER_PHOTO_SIZE_MULTIPLIER + HEADER_PHOTO_RENDER_SIZE_INCREASE_PT;

// Position: 2mm upward from the photo's current position, expressed
// in mm and converted through the file's existing MM_TO_PT conversion —
// same convention as NAME_VERTICAL_OFFSET_PT/DIVIDER_SIDE_GAP_PT above —
// so no raw pt magic number is introduced.
const HEADER_PHOTO_VERTICAL_SHIFT_MM = 2;
const HEADER_PHOTO_VERTICAL_SHIFT_PT = HEADER_PHOTO_VERTICAL_SHIFT_MM * MM_TO_PT; // 2mm, ≈ 5.6693pt

// Latest requested further upward shift: +1mm on top of the CURRENT
// rendered position (which already sits HEADER_PHOTO_VERTICAL_SHIFT_PT
// above the cursor-anchored photoCenterY), not a re-measurement from
// the original, unshifted position. Declared as its own named term —
// same convention as HEADER_PHOTO_RENDER_SIZE_INCREASE_PT above — so
// this file's history of render-position changes stays legible and
// independently traceable. Like HEADER_PHOTO_VERTICAL_SHIFT_PT, this
// is applied ONLY to renderPhotoCenterY (how/where the photo is
// actually painted) — it never touches photoCenterY/photoTopY/
// HEADER_PHOTO_SIZE_PT or the header's Y-cursor math, so it cannot
// cascade into Name/Job Title/Contact/divider spacing.
const HEADER_PHOTO_VERTICAL_SHIFT_ADDITIONAL_MM = 1; // mm — requested +1mm further up, on top of the current 2mm shift
const HEADER_PHOTO_VERTICAL_SHIFT_ADDITIONAL_PT = HEADER_PHOTO_VERTICAL_SHIFT_ADDITIONAL_MM * MM_TO_PT; // 1mm, ≈ 2.8346pt
const HEADER_PHOTO_TOTAL_VERTICAL_SHIFT_PT = HEADER_PHOTO_VERTICAL_SHIFT_PT + HEADER_PHOTO_VERTICAL_SHIFT_ADDITIONAL_PT; // 2mm + 1mm = 3mm total, ≈ 8.5039pt

// --- Header name vertical offset (requested: move the Name exactly
// 3mm down) ---
// Applied ONLY to where the Name glyph is actually drawn — the
// cursor (`y`) used afterward for the job title/contact/divider is
// left untouched, so this shift cannot cascade into any other header
// element. Expressed in mm and converted through the file's existing
// MM_TO_PT conversion — same convention as DIVIDER_SIDE_GAP_PT/
// BULLET_DOT_TO_TEXT_GAP_PT above — so no raw pt magic number is
// introduced.
const NAME_VERTICAL_OFFSET_MM = 3;
const NAME_VERTICAL_OFFSET_PT = NAME_VERTICAL_OFFSET_MM * MM_TO_PT; // 3mm, ≈ 8.5039pt

// --- Header name horizontal offset (requested: move the Name 0.1mm
// to the right) ---
// Applied ONLY to the X where the Name glyph is drawn. The photo, job
// title and contact line keep their own X positions, and the cursor (`y`)
// is untouched. Same mm -> pt convention (MM_TO_PT) as the vertical
// offset above, so no raw pt magic number is introduced.
const NAME_HORIZONTAL_OFFSET_MM = 0.1;
const NAME_HORIZONTAL_OFFSET_PT = NAME_HORIZONTAL_OFFSET_MM * MM_TO_PT; // 0.1mm, ≈ 0.2835pt


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
const BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP = 3; // job title -> company/dates line
let EXPERIENCE_TITLE_TO_SUBTITLE_GAP = BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
const BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = 6; // company/dates (or title) -> description
let EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
const BASE_EXPERIENCE_ENTRY_GAP = 14; // space between one experience entry and the next
let EXPERIENCE_ENTRY_GAP = BASE_EXPERIENCE_ENTRY_GAP;

// --- Bullet-formatted descriptions (Experience, Achievements, Projects) ---
// A single, centralized pair of helpers — buildBulletDescriptionItems()
// and renderBulletDescriptionLines(), declared below — is shared by
// Experience, Achievements, and Projects, so every section's
// description renders with the same bullet-dot format instead of each
// section duplicating its own bullet logic.
// Horizontal space between the bullet dot and its text, expressed in
// mm and converted through the file's existing MM_TO_PT conversion —
// same convention as DIVIDER_SIDE_GAP_PT above — so no raw pt magic
// number is introduced.
const BASE_BULLET_DOT_TO_TEXT_GAP_MM = 3;
let BULLET_DOT_TO_TEXT_GAP_MM = BASE_BULLET_DOT_TO_TEXT_GAP_MM;
let BULLET_DOT_TO_TEXT_GAP_PT = BULLET_DOT_TO_TEXT_GAP_MM * MM_TO_PT;

// --- Right-aligned date on a title/degree/achievement-name row
// (Experience, Education, Achievements) ---
// Horizontal gap reserved between the end of the wrapped title text
// and the start of its right-aligned date, expressed in mm and
// converted through the existing MM_TO_PT conversion — same
// convention as BULLET_DOT_TO_TEXT_GAP_MM/DIVIDER_SIDE_GAP_PT above —
// so no raw pt magic number is introduced.
const BASE_TITLE_TO_DATE_GAP_MM = 3;
let TITLE_TO_DATE_GAP_MM = BASE_TITLE_TO_DATE_GAP_MM;
let TITLE_TO_DATE_GAP_PT = TITLE_TO_DATE_GAP_MM * MM_TO_PT;

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
// academicPdf.ts's `academicColors` palette (a Classic Black & White
// theme: `primary`/`secondary`/`accent`/`divider`/`link` are pure
// black #000000, `text` is near-black #111111, `textLight` is dark
// gray #333333), which is this file's DESIGN reference. Only the RGB
// values changed — which named constant governs which piece of text
// (the "color architecture" itself, i.e. this file's existing
// structure) is untouched, so no new per-section color logic was
// introduced.
const COLOR_NAME = [0, 0, 0] as const; // OLD theme's `primary`
const COLOR_TITLE = [0, 0, 0] as const; // OLD theme's `secondary` (header job title)
const COLOR_METADATA = [51, 51, 51] as const; // OLD theme's `textLight` (contact line, subtitles, dates, institution, grade, proficiency, tech, credential)
const COLOR_RULE = [0, 0, 0] as const; // OLD theme's `divider`

// Universal section-heading divider color (added in this phase).
// Declared separately from COLOR_RULE for the same reason
// SECTION_DIVIDER_THICKNESS is declared separately from
// HEADER_RULE_THICKNESS above — the Header's rule stays fully
// independent even though the values match today.
const COLOR_SECTION_DIVIDER = [0, 0, 0] as const; // OLD theme's `divider`

// Entry titles (job title, degree, language name, achievement title,
// certification name, project name) — OLD theme's `text`.
const COLOR_HEADING = [17, 17, 17] as const;

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
// no per-section hardcoding. OLD theme's `primary`.
const COLOR_SECTION_HEADING = [0, 0, 0] as const; // OLD theme's `primary`
const COLOR_BODY = [17, 17, 17] as const; // normal paragraph/body text — OLD theme's `text`

// GitHub link text (Projects section only) — OLD theme's `link`, kept
// as its own constant (rather than folded into COLOR_METADATA) because
// OLD deliberately renders links in a distinct, more prominent tone
// than ordinary metadata.
const COLOR_LINK = [0, 0, 0] as const;

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
export interface AcademicPdfPersonalInfo {
  name?: string;
  title?: string;
  jobTitle?: string;
  email?: string;
  address?: string; // header contact-line street/mailing address — CONFIRMED
  // field name (`personalInfo.address`) against the actual, real
  // production academicPdf.ts contact renderer, which already reads
  // this same field for its own contact line (`Address:
  // ${personalInfo.address}`). Distinct from `location`/`city` below.
  location?: string;
  city?: string;
  linkedin?: string;
  github?: string; // header contact-line GitHub URL — CONFIRMED field
  // name (`personalInfo.github`) against the actual ATSPro generator
  // (atsProPdf.ts), which already reads this same field for its own
  // contact line. Distinct from AcademicPdfProject.github below, which
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

export interface AcademicPdfData {
  personalInfo: AcademicPdfPersonalInfo;
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
  experiences?: AcademicPdfExperience[];

  // CONFIRMED against the project's actual EducationItem
  // (src/components/cv-builder/types/cvTypes.ts / EducationSection.tsx):
  // fields used are degree, institution, year (already a combined
  // "start - end" string, not separate startDate/endDate), and grade.
  // There is no location or description field on an education entry,
  // so Phase 4 does not render either (nothing to fabricate).
  educations?: AcademicPdfEducation[];

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
  languages?: AcademicPdfLanguage[];

  // CONFIRMED against the project's actual AchievementItem
  // (src/components/cv-builder/types/cvTypes.ts / AchievementsSection.tsx):
  // fields used are title, date, description. All fields are optional.
  achievements?: AcademicPdfAchievement[];

  // CONFIRMED against the project's actual CertificationItem
  // (src/components/cv-builder/types/cvTypes.ts / CertificationsSection.tsx):
  // fields used are name, date, credentialId. All fields are optional.
  certifications?: AcademicPdfCertification[];

  // CONFIRMED against the project's actual ProjectItem
  // (src/components/cv-builder/types/cvTypes.ts / ProjectsSection.tsx):
  // fields used are name, tech, description, github. All fields are optional.
  projects?: AcademicPdfProject[];

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
export interface AcademicPdfExperience {
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
//   - grade: string  (optional, e.g. "3.8/4.0" — rendered with a
//                      "Grade:" label prefix, matching the Classic
//                      template's education section)
// There is no description/achievements/coursework field on an
// education entry in the actual data, so none is rendered.
// ------------------------------------------------------------------
export interface AcademicPdfEducation {
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
export interface AcademicPdfLanguage {
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
export interface AcademicPdfAchievement {
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
export interface AcademicPdfCertification {
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
export interface AcademicPdfProject {
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
// generateAcademicPDF, before knowing whether the next section will
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
// Renders the full document exactly once, at whatever SCALE_FACTOR is
// currently in effect (set by recomputeScaledConstants(), called by
// the exported generateAcademicPDF() auto-fit driver near the end of
// this file). Not exported — this is the "render once" half of the
// auto-fit system; generateAcademicPDF() is the public entry point.
function renderAcademicPDFOnce(data: AcademicPdfData): { doc: jsPDF; pageCount: number; lastPageContentHeight: number } {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  let y = TOP_MARGIN;

  y = addHeader(doc, data, y);
  y = addSummary(doc, data, y);
  y = addExperience(doc, data, y);
  y = addEducation(doc, data, y);
  // SECTION ORDER (requested): Summary → Experience → Education →
  // Certifications → Skills → Languages → Achievements → Projects.
  // Each add*() function only reads the running `y` cursor it's handed
  // and returns the next one (skipping its own heading/divider/gap
  // entirely when its data is empty), so reordering these calls is
  // the complete change — no other section's own logic depends on
  // which section runs before or after it.
  y = addCertifications(doc, data, y);
  y = addSkills(doc, data, y);
  y = addLanguages(doc, data, y);
  y = addAchievements(doc, data, y);
  y = addProjects(doc, data, y);

  return {
    doc,
    pageCount: doc.getNumberOfPages(),
    lastPageContentHeight: y - TOP_MARGIN,
  };
}

// ====================================================================
// HEADER SECTION (Phase 1, + circular profile-photo layout)
// Renders: photo (optional, centered, circular) + name (centered) +
// job title (optional, centered) + contact line (optional,
// left-aligned) + divider.
//
// ARRANGEMENT (which elements are centered vs. left-aligned, and their
// stacking order — photo above name above job title above the
// left-aligned contact line) is ported from OLD academicPdf.ts's
// renderHeader(), per request. Typography (name stays normal-weight,
// not bold, per the OLD design note below), all gaps (NAME_TO_TITLE_GAP,
// TITLE_TO_CONTACT_GAP, PHOTO_TO_TEXT_GAP_PT), and margins/divider are
// CURRENT's own unchanged geometry — only the alignment/stacking
// arrangement comes from OLD. The photo's RENDERED size/position carry
// two further requested, render-only adjustments on top of that
// (HEADER_PHOTO_RENDER_SIZE_PT = 105% of HEADER_PHOTO_SIZE_PT;
// HEADER_PHOTO_VERTICAL_SHIFT_PT = 2mm up) — see the constants and the
// photo block below. Both are computed FROM the unchanged
// HEADER_PHOTO_SIZE_PT/cursor, and the cursor advance the rest of the
// header (Name/Job Title/Contact/divider) relies on is left untouched,
// so this cannot cascade into any other header element.
//
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addHeader(doc: jsPDF, data: AcademicPdfData, startY: number): number {
  let y = startY;
  const { personalInfo, phoneNumber, selectedCountryCode } = data;

  const name = sanitizeText((personalInfo?.name || '').trim()) || 'Your Name';
  const jobTitle = sanitizeText((personalInfo?.title || personalInfo?.jobTitle || '').trim());
  const hasPhoto = isValidPhotoSource(personalInfo?.photo);

  // Horizontal center of the content column. OLD design centers the
  // photo, name, and job title on this axis (only the contact line
  // stays left-aligned) — CONTENT_WIDTH/LEFT_MARGIN are CURRENT's own
  // unchanged geometry; only using them to find this center point (an
  // OLD arrangement, not an OLD coordinate) is new.
  const centerX = LEFT_MARGIN + CONTENT_WIDTH / 2;

  if (hasPhoto) {
    // --- Photo: centered above the name/title block (OLD
    // arrangement), instead of beside it. ---
    //
    // photoTopY/photoRadius/photoCenterY are the photo's CURRENT
    // (unchanged) position and size — `photoTopY` is still exactly
    // `y`, the same header cursor value used before this change, so
    // the cursor advance at the end of this block (which the
    // Name/Job Title/Contact/divider all key off) stays IDENTICAL.
    // They are kept only as the reference point the requested 2mm-up
    // shift and 5%-larger render size are computed FROM below — they
    // are never themselves reassigned.
    const photoRadius = HEADER_PHOTO_SIZE_PT / 2;
    const photoTopY = y;
    const photoCenterY = photoTopY + photoRadius;

    // --- Requested render-only adjustments, computed from the
    // CURRENT position/size above: the circle is enlarged to 105% of
    // its current diameter (HEADER_PHOTO_RENDER_SIZE_PT) about its
    // current center, then that center is shifted up by the total
    // requested shift (HEADER_PHOTO_TOTAL_VERTICAL_SHIFT_PT — the
    // original 2mm plus the latest, further +1mm). Neither touches
    // photoTopY/photoRadius/photoCenterY themselves nor
    // HEADER_PHOTO_SIZE_PT — only where/how large the photo is
    // actually painted. ---
    const renderPhotoRadius = HEADER_PHOTO_RENDER_SIZE_PT / 2;
    const renderPhotoCenterY = photoCenterY - HEADER_PHOTO_TOTAL_VERTICAL_SHIFT_PT;
    const renderPhotoTopY = renderPhotoCenterY - renderPhotoRadius;

    // --- Draw the photo, circularly clipped. Aspect ratio is
    // preserved (no distortion) via a "cover" fit: the image is
    // scaled so its shorter side exactly fills the circle's diameter,
    // and centered so the circular clip crops the longer side evenly
    // on both sides. ---
    const photoSource = (personalInfo?.photo as string).trim();
    const imgProps = doc.getImageProperties(photoSource);
    const imgAspect = imgProps.width / imgProps.height;
    const drawWidth = imgAspect >= 1 ? HEADER_PHOTO_RENDER_SIZE_PT * imgAspect : HEADER_PHOTO_RENDER_SIZE_PT;
    const drawHeight = imgAspect >= 1 ? HEADER_PHOTO_RENDER_SIZE_PT : HEADER_PHOTO_RENDER_SIZE_PT / imgAspect;
    const drawX = centerX - renderPhotoRadius - (drawWidth - HEADER_PHOTO_RENDER_SIZE_PT) / 2;
    const drawY = renderPhotoTopY - (drawHeight - HEADER_PHOTO_RENDER_SIZE_PT) / 2;

    doc.saveGraphicsState();
    // `null` (not omitted) is required: jsPDF's default path-paint
    // operation is 'S' (stroke) in pt mode, so an omitted style would
    // stroke a visible circle before clip() below ever runs. Passing
    // null suppresses ALL painting for this path — it exists purely
    // as the clip boundary for clip()/discardPath() immediately after.
    doc.circle(centerX, renderPhotoCenterY, renderPhotoRadius, null);
    doc.clip();
    doc.discardPath();
    doc.addImage(photoSource, getImageFormatFromDataUrl(photoSource), drawX, drawY, drawWidth, drawHeight);
    doc.restoreGraphicsState();

    // --- Advance past the photo before the name/title block below.
    // Reuses PHOTO_TO_TEXT_GAP_PT — CURRENT's existing photo-to-text
    // spacing constant — as the vertical gap now that the arrangement
    // is stacked instead of side-by-side; the gap's VALUE is
    // unchanged, only its axis (vertical instead of horizontal). ---
    y = photoTopY + HEADER_PHOTO_SIZE_PT + PHOTO_TO_TEXT_GAP_PT;
  }

  // --- Name — centered (OLD arrangement). Typography (normal weight,
  // not bold — OLD design note), font size, and Y-advance math
  // (NAME_SIZE) are CURRENT's own unchanged geometry; only the X
  // position/alignment changes from LEFT_MARGIN/left to centerX/center.
  // NAME_VERTICAL_OFFSET_PT (requested: 3mm down) is applied ONLY to
  // the drawn glyph's Y — the cursor (`y`) itself advances by the
  // SAME unchanged amount as before, so the job title/contact/divider
  // below are not shifted by this offset. ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(NAME_SIZE);
  doc.setTextColor(...COLOR_NAME);
  doc.text(name, centerX + NAME_HORIZONTAL_OFFSET_PT, y + NAME_VERTICAL_OFFSET_PT, { align: 'center' } as any);
  y += NAME_SIZE; // move past the line's own height
  y += NAME_TO_TITLE_GAP;

  // --- Job title (optional) — centered (OLD arrangement), directly
  // below the name; size/gap unchanged. ---
  if (jobTitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(TITLE_SIZE);
    doc.setTextColor(...COLOR_TITLE);
    doc.text(jobTitle, centerX, y, { align: 'center' } as any);
    y += TITLE_SIZE;
    y += TITLE_TO_CONTACT_GAP;
  }

  // --- Contact line (email | phone | location | linkedin | github |
  // website) — centered on the same centerX as the name and job title,
  // so it starts at the center and grows evenly to the left and right as
  // its content gets longer, up to the full CONTENT_WIDTH. Independent of
  // the photo. ---
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

    // Clean, separator-free contact line (same layout as ATSPro). Every
    // contact item is placed whole and consecutive items on a line are
    // separated by the SAME gap — the file's existing header horizontal
    // gap (PHOTO_TO_TEXT_GAP_PT), so no new spacing value exists. An item
    // that doesn't fit the remaining CONTENT_WIDTH moves whole to the next
    // line (never split mid-text); an item wider than the entire line is
    // wrapped with the same splitTextToSize() used elsewhere in this file,
    // so no contact text is ever dropped or clipped.
    //
    // Pass 1 groups the items into lines (measuring only); pass 2 draws
    // each line centered on centerX, so every line is symmetric around the
    // center like the name and job title.
    //
    // LINE-SPACING SOURCE OF TRUTH: consecutive contact lines are
    // BODY_LINE_HEIGHT apart — the SAME constant Professional Summary's
    // wrapped paragraph advances by — so the contact block's line-to-line
    // gap is identical to Summary's for any line count.
    const itemGap = PHOTO_TO_TEXT_GAP_PT;

    type ContactLine = { parts: string[]; width: number };
    const contactLines: ContactLine[] = [];
    let currentLine: ContactLine = { parts: [], width: 0 };
    const finishCurrentLine = () => {
      contactLines.push(currentLine);
      currentLine = { parts: [], width: 0 };
    };

    for (const part of contactParts) {
      const itemWidth = doc.getTextWidth(part);

      if (itemWidth > CONTENT_WIDTH) {
        // Oversized single item: gets its own wrapped lines. The last
        // wrapped line stays open so the next item can still join it.
        if (currentLine.parts.length > 0) finishCurrentLine();
        const wrapped: string[] = doc.splitTextToSize(part, CONTENT_WIDTH);
        wrapped.forEach((line, index) => {
          if (index > 0) finishCurrentLine();
          currentLine = { parts: [line], width: doc.getTextWidth(line) };
        });
        continue;
      }

      const hasItems = currentLine.parts.length > 0;
      const widthWithItem = hasItems ? currentLine.width + itemGap + itemWidth : itemWidth;
      if (hasItems && widthWithItem > CONTENT_WIDTH) {
        finishCurrentLine();
        currentLine = { parts: [part], width: itemWidth };
      } else {
        currentLine.parts.push(part);
        currentLine.width = widthWithItem;
      }
    }
    if (currentLine.parts.length > 0) finishCurrentLine();

    const contactLinesStartY = y;
    const lineCount = contactLines.length;
    contactLines.forEach((line, lineIndex) => {
      const lineY = contactLinesStartY + lineIndex * BODY_LINE_HEIGHT;
      let cursorX = centerX - line.width / 2;
      for (const part of line.parts) {
        doc.text(part, cursorX, lineY);
        cursorX += doc.getTextWidth(part) + itemGap;
      }
    });
    // Leave y one BODY_LINE_HEIGHT past the last line's baseline, exactly
    // like the previous per-line loop did (trailing reserve).
    y = contactLinesStartY + lineCount * BODY_LINE_HEIGHT;

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
    const lastContactLine = contactLines[lineCount - 1].parts.join('');
    const lastContactBaselineY = contactLinesStartY + (lineCount - 1) * BODY_LINE_HEIGHT;
    contactInkBottomY = lastContactBaselineY + (hasDescenderChar(lastContactLine) ? METADATA_SIZE * HELVETICA_DESCENT_RATIO : 0);
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

// ====================================================================
// TEXT SANITIZATION — non-WinAnsi "smart" typography fix
// ------------------------------------------------------------------
// ROOT CAUSE of a real bug (ported from executivePdf.ts, same file
// family): jsPDF's standard 14 fonts (helvetica, times, etc.) can only
// encode WinAnsiEncoding's character set. AI-generated content (e.g.
// project/experience descriptions produced by an LLM) very commonly
// contains "smart" typographic punctuation — a non-breaking hyphen
// (U+2011), en/em dashes, curly quotes, an ellipsis character, a
// non-breaking space — that WinAnsiEncoding does not cover. When jsPDF
// hits one of these characters it cannot encode, it has to break the
// text run apart around it, which throws off the per-character
// positioning of everything AFTER that character on the line — the
// visible symptom is text that looks letter-spaced/stretched and can
// run past the right margin, but ONLY on lines that happen to contain
// one of these characters.
//
// Fix: map each such character to its closest plain-ASCII equivalent
// (all safely inside WinAnsiEncoding) BEFORE any measurement
// (splitTextToSize/getTextWidth) or drawing (doc.text) happens, so the
// measured width and the rendered width always agree. Applied to every
// piece of user-supplied text this file renders — not just Projects —
// since AI-generated prose can introduce these characters in any
// section (Summary, Experience, Achievements, Projects, etc.).
function sanitizeText(text: string): string {
  if (!text) {
    return text;
  }
  return text
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-') // hyphens/dashes (incl. non-breaking hyphen) -> "-"
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")               // curly single quotes/prime -> "'"
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')               // curly double quotes/prime -> '"'
    .replace(/\u2026/g, '...')                                  // ellipsis character -> "..."
    .replace(/[\u00A0\u2007\u202F]/g, ' ')                      // non-breaking/figure/narrow spaces -> regular space
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '•')          // other bullet-ish glyphs -> the one bullet char this file already uses/detects
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '');                // zero-width characters -> removed entirely
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
  personalInfo: AcademicPdfPersonalInfo,
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

  if (personalInfo?.address) {
    parts.push(personalInfo.address.trim());
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
function addSummary(doc: jsPDF, data: AcademicPdfData, startY: number): number {
  const summaryText = sanitizeText((data.professionalSummary || '').trim());

  // Nothing to render — skip the section entirely rather than leaving
  // an empty heading or a blank gap.
  if (!summaryText) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (header) and this section.
  // Includes the requested, isolated +1mm added ONLY to this specific
  // gap (Contact Divider -> Professional Summary heading) via
  // CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT above. SECTION_GAP itself
  // is left untouched so every other section-to-section gap in the
  // document (which also reference SECTION_GAP) is unaffected.
  y += SECTION_GAP + CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT;

  // Font must be set BEFORE measuring/wrapping, since jsPDF wraps
  // text based on the currently active font and size.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const wrappedLines: string[] = doc.splitTextToSize(summaryText, CONTENT_WIDTH);

  // Make sure there's room for the heading plus at least the first
  // line of the summary before starting this section on the current
  // page. Otherwise the heading would be orphaned alone at the
  // bottom of the page with its text pushed to the next one.
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + lineInkHeight(BODY_SIZE);
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
    y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));
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
function addExperience(doc: jsPDF, data: AcademicPdfData, startY: number): number {
  const experiences = (data.experiences || []).filter(hasUsableExperienceContent);

  if (experiences.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — this guard used to reserve only "heading + one
  // line" as a stand-in for "the first entry", regardless of what that
  // entry actually contained. A real first entry is usually MORE than
  // one line, so the heading could pass this check, render at the
  // bottom of the page, and then the first entry's OWN (correctly-sized)
  // checkPageBreak() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateExperienceEntryMinimumHeight() addExperienceEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateExperienceEntryMinimumHeight(doc, experiences[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
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
function hasUsableExperienceContent(exp: AcademicPdfExperience | null | undefined): boolean {
  if (!exp) {
    return false;
  }
  return Boolean(
    sanitizeText((exp.title || '').trim()) ||
    sanitizeText((exp.company || '').trim()) ||
    sanitizeText((exp.startDate || '').trim()) ||
    sanitizeText((exp.endDate || '').trim()) ||
    sanitizeText((exp.description || '').trim())
  );
}

// Computes the exact minimum vertical space one Experience entry needs
// (title/date row + company line + FULL wrapped description), without
// drawing anything. Used by addExperienceEntry() itself for its own
// checkPageBreak() call AND by addExperience() to size its
// heading-guard against the REAL first entry instead of a generic
// one-line guess — see the ROOT-CAUSE FIX note on that guard above for
// why a generic guess isn't sufficient. Single source of truth, so the
// estimate and the entry's own render can never disagree. Mirrors,
// step for step, the advances addExperienceEntry() applies while
// rendering.
//
// An entry that fits on a single page must move to the next page as a
// WHOLE; an entry taller than a full page can never do that, so it is
// reserved only up to its header plus first description line and its
// remaining lines flow across pages (see keepTogetherHeight()).
function estimateExperienceEntryMinimumHeight(doc: jsPDF, exp: AcademicPdfExperience): number {
  const title = sanitizeText((exp.title || '').trim());
  const company = sanitizeText((exp.company || '').trim());
  const startDate = sanitizeText((exp.startDate || '').trim());
  const endDate = sanitizeText((exp.endDate || '').trim());
  const description = sanitizeText((exp.description || '').trim());
  const dateRange = [startDate, endDate].filter(Boolean).join(' – ');

  // BULLET-AWARE: each manual line break the user typed in the
  // description is one bullet item — see buildBulletDescriptionItems()/
  // renderBulletDescriptionLines() above (shared with Achievements and
  // Projects) — so this estimate's line count/wrap-width can never
  // drift out of parity with what addExperienceEntry() actually draws.
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);
  const titleRowHeightEstimate = estimateTitleRowHeight(doc, title, dateRange);
  const hasTitleRow = Boolean(title || dateRange);

  const titleToCompanyGap = hasTitleRow && company ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;
  const headerHeight = titleRowHeightEstimate + titleToCompanyGap + (company ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const hasHeaderLine = hasTitleRow || Boolean(company);
  const descriptionGap = hasHeaderLine && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const descriptionTotalHeight = descriptionLines.length * BODY_LINE_HEIGHT;

  const hasDescription = descriptionLines.length > 0;
  const lastLineFontSize = hasDescription ? BODY_SIZE
    : company ? EXPERIENCE_SUBTITLE_SIZE
    : title ? EXPERIENCE_TITLE_SIZE
    : EXPERIENCE_SUBTITLE_SIZE;
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSize;

  return keepTogetherHeight(
    inkBottomHeight(headerHeight + descriptionGap + descriptionTotalHeight, lastLineAdvance, lastLineFontSize),
    hasDescription
      ? inkBottomHeight(headerHeight + descriptionGap + firstDescriptionLineHeight, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(headerHeight, lastLineAdvance, lastLineFontSize)
  );
}

// Renders a single experience entry and returns the new Y position.
function addExperienceEntry(doc: jsPDF, exp: AcademicPdfExperience, startY: number): number {
  let y = startY;

  const title = sanitizeText((exp.title || '').trim());
  const company = sanitizeText((exp.company || '').trim());
  const startDate = sanitizeText((exp.startDate || '').trim());
  const endDate = sanitizeText((exp.endDate || '').trim());
  const description = sanitizeText((exp.description || '').trim());

  // Date now renders RIGHT-ALIGNED on the SAME row as the job title
  // (previously its own line above/below company) — via the shared
  // renderTitleRowWithDate() helper (see its own doc comment above),
  // also used by Education and Achievements. Company keeps its own
  // line directly below, unchanged in every other respect.
  const dateRange = [startDate, endDate].filter(Boolean).join(' – ');

  // The description textarea allows the user to type their own line
  // breaks (e.g. one line per responsibility). Those manual breaks are
  // preserved — each typed line becomes one bullet item (see
  // buildBulletDescriptionItems()/renderBulletDescriptionLines() above),
  // matching the CV builder's own form/preview where each line is
  // already shown as one point.
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  // --- Determine how much space this ENTIRE entry needs — header
  // (title/date row + company line) AND every wrapped description line,
  // not just the first — so the whole entry moves to a new page
  // together rather than splitting mid-entry (a job title separated
  // from its own company or description). Computed via the shared
  // estimateExperienceEntryMinimumHeight() (see its own comment above
  // addExperienceEntry) rather than inline here, so this entry's own
  // page-break check and addExperience()'s heading-guard (which
  // estimates the section's FIRST entry the same way) can never drift
  // out of parity with each other. ---
  const minimumEntrySpaceNeeded = estimateExperienceEntryMinimumHeight(doc, exp);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  const hasTitleRow = Boolean(title || dateRange);
  const hasHeaderLine = hasTitleRow || Boolean(company);

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

  // --- Description (rendered as bullets — see
  // buildBulletDescriptionItems()/renderBulletDescriptionLines() above) ---
  if (descriptionLines.length > 0) {
    y = renderBulletDescriptionLines(doc, descriptionItems, y);
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
//   Grade (optional, rendered with a "Grade:" label)
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
function addEducation(doc: jsPDF, data: AcademicPdfData, startY: number): number {
  const educations = (data.educations || []).filter(hasUsableEducationContent);

  if (educations.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — same relationship
  // as "previous section -> Experience heading", so the same constant.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — this guard used to reserve only "heading + one
  // line" as a stand-in for "the first entry", regardless of what that
  // entry actually contained. A real first entry is usually MORE than
  // one line, so the heading could pass this check, render at the
  // bottom of the page, and then the first entry's OWN (correctly-sized)
  // checkPageBreak() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateEducationEntryMinimumHeight() addEducationEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateEducationEntryMinimumHeight(doc, educations[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
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
function hasUsableEducationContent(edu: AcademicPdfEducation | null | undefined): boolean {
  if (!edu) {
    return false;
  }
  return Boolean(
    sanitizeText((edu.degree || '').trim()) ||
    sanitizeText((edu.institution || '').trim()) ||
    sanitizeText((edu.year || '').trim()) ||
    sanitizeText((edu.grade || '').trim())
  );
}

// Computes the exact minimum vertical space one Education entry needs
// (degree + institution + grade + date), without drawing anything. Used
// by addEducationEntry() itself for its own checkPageBreak() call AND
// by addEducation() to size its heading-guard against the REAL first
// entry instead of a generic one-line guess — see the ROOT-CAUSE FIX
// note above that guard. Single source of truth, so the estimate and
// the entry's own render can never disagree: it mirrors, step for step,
// the actual advances applied during rendering in addEducationEntry().
function estimateEducationEntryMinimumHeight(doc: jsPDF, edu: AcademicPdfEducation): number {
  const degree = sanitizeText((edu.degree || '').trim());
  const institution = sanitizeText((edu.institution || '').trim());
  const year = sanitizeText((edu.year || '').trim());
  const grade = sanitizeText((edu.grade || '').trim());

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, CONTENT_WIDTH) : [];
  const gradeLines: string[] = grade ? doc.splitTextToSize(`Grade: ${grade}`, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const degreeLines: string[] = degree ? doc.splitTextToSize(degree, CONTENT_WIDTH) : [];

  const hasDegree = degreeLines.length > 0;
  const hasInstitution = institutionLines.length > 0;
  const hasGrade = gradeLines.length > 0;
  const hasDate = Boolean(year);

  const degreeInternalWrapAdvance = degreeLines.length > 1
    ? (degreeLines.length - 1) * EXPERIENCE_TITLE_SIZE
    : 0;
  const degreeTrailingAdvance = !hasDegree ? 0
    : hasInstitution ? (EXPERIENCE_TITLE_SIZE + EXPERIENCE_TITLE_TO_SUBTITLE_GAP)
    : (hasGrade || hasDate) ? BODY_LINE_HEIGHT
    : EXPERIENCE_TITLE_SIZE;
  const degreeSpaceNeeded = hasDegree ? degreeInternalWrapAdvance + degreeTrailingAdvance : 0;

  const institutionInternalWrapAdvance = institutionLines.length > 1
    ? (institutionLines.length - 1) * EXPERIENCE_SUBTITLE_SIZE
    : 0;
  const institutionTrailingAdvance = !hasInstitution ? 0
    : (hasGrade || hasDate) ? BODY_LINE_HEIGHT
    : EXPERIENCE_SUBTITLE_SIZE;
  const institutionSpaceNeeded = hasInstitution ? institutionInternalWrapAdvance + institutionTrailingAdvance : 0;

  // Date renders BEFORE Grade: Date -> Grade is a single BODY_LINE_HEIGHT
  // step when Grade is present; Grade is the last field, so its own last
  // line advances by the tight metadata-line height.
  const dateTrailingAdvance = !hasDate ? 0
    : hasGrade ? BODY_LINE_HEIGHT
    : EXPERIENCE_SUBTITLE_SIZE;
  const dateSpaceNeeded = hasDate ? dateTrailingAdvance : 0;

  const gradeInternalWrapAdvance = gradeLines.length > 1
    ? (gradeLines.length - 1) * EXPERIENCE_SUBTITLE_SIZE
    : 0;
  const gradeTrailingAdvance = hasGrade ? EXPERIENCE_SUBTITLE_SIZE : 0;
  const gradeSpaceNeeded = hasGrade ? gradeInternalWrapAdvance + gradeTrailingAdvance : 0;

  const fullHeight = degreeSpaceNeeded + institutionSpaceNeeded + dateSpaceNeeded + gradeSpaceNeeded;
  const lastLineFontSize = (hasDate || hasGrade || hasInstitution) ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE;
  const inkHeight = inkBottomHeight(fullHeight, lastLineFontSize, lastLineFontSize);
  return keepTogetherHeight(inkHeight, inkHeight);
}

// Renders a single education entry and returns the new Y position,
// normalized so every entry (not just the section's last one) ends on
// an equivalent trailing space — see the TRAILING-SPACE PARITY comment
// near the end of this function.
function addEducationEntry(
  doc: jsPDF,
  edu: AcademicPdfEducation,
  startY: number
): number {
  let y = startY;

  const degree = sanitizeText((edu.degree || '').trim());
  const institution = sanitizeText((edu.institution || '').trim());
  const year = sanitizeText((edu.year || '').trim());
  const grade = sanitizeText((edu.grade || '').trim());

  // Date (year) renders as its own normal content line, AFTER
  // Institution/University Name and BEFORE Grade (previously right-aligned on
  // the same row as the degree name). Degree renders via
  // renderTitleRowWithDate() with an EMPTY date (same helper, same font/
  // wrap/color behavior it already used whenever no date was present —
  // no new rendering path introduced for the degree itself).
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, CONTENT_WIDTH) : [];
  const gradeLines: string[] = grade ? doc.splitTextToSize(`Grade: ${grade}`, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const degreeLines: string[] = degree ? doc.splitTextToSize(degree, CONTENT_WIDTH) : [];

  const hasDegree = degreeLines.length > 0;
  const hasInstitution = institutionLines.length > 0;
  const hasGrade = gradeLines.length > 0;
  const hasDate = Boolean(year);

  // ------------------------------------------------------------------
  // ROOT-CAUSE FIX — University Name -> Grade / University Name -> Date
  // gap was too large because the OLD code advanced y by a field's own
  // (tight, no-leading) metadata-line height AND THEN separately added
  // a full BODY_LINE_HEIGHT gap on top of that before the next field —
  // i.e. it was double-counting: "own line height" + "normal
  // content-line gap", stacked. That is exactly why the space grew
  // larger than a real content-line gap.
  //
  // The fix below removes the double-count: whichever field
  // (Degree, or Institution/University Name) immediately precedes
  // Grade, and whichever field (Grade, or Institution/Degree if Grade
  // is blank) immediately precedes Date, treats ITS OWN transition
  // into that next field as a single BODY_LINE_HEIGHT step — the exact
  // same per-line vertical advance already used between consecutive
  // lines of ordinary wrapped body/content text elsewhere in this file
  // (Summary's paragraph, Experience/Achievement/Project description
  // lines). This REPLACES that field's own tight last-line advance for
  // that transition, rather than adding to it. No separate "before
  // Grade" / "before Date" gap constant exists any more; the preceding
  // field's own trailing step supplies it, so there is nothing left to
  // double-count.
  //
  // A field's OWN internal text-wrap (e.g. a long institution name
  // wrapping to two lines) is untouched by this fix and still advances
  // between ITS OWN wrapped lines using the existing tight
  // metadata-line spacing (own font size, no extra leading) — the same
  // convention already used for the header's wrapped contact line.
  // Only the FINAL line of each field's transition into the next field
  // changes.
  // ------------------------------------------------------------------

  // --- Determine how much space this entry needs, so the whole block
  // moves to a new page together rather than splitting mid-entry. ---
  const degreeInternalWrapAdvance = degreeLines.length > 1
    ? (degreeLines.length - 1) * EXPERIENCE_TITLE_SIZE
    : 0;
  const degreeTrailingAdvance = !hasDegree ? 0
    : hasInstitution ? (EXPERIENCE_TITLE_SIZE + EXPERIENCE_TITLE_TO_SUBTITLE_GAP)
    : (hasGrade || hasDate) ? BODY_LINE_HEIGHT
    : EXPERIENCE_TITLE_SIZE;

  const institutionInternalWrapAdvance = institutionLines.length > 1
    ? (institutionLines.length - 1) * EXPERIENCE_SUBTITLE_SIZE
    : 0;
  const institutionTrailingAdvance = !hasInstitution ? 0
    : (hasGrade || hasDate) ? BODY_LINE_HEIGHT
    : EXPERIENCE_SUBTITLE_SIZE;

  // Date renders BEFORE Grade: Date -> Grade is a single BODY_LINE_HEIGHT
  // step when Grade is present; Grade is the last field, so its own last
  // line advances by the tight metadata-line height.
  const dateTrailingAdvance = !hasDate ? 0
    : hasGrade ? BODY_LINE_HEIGHT
    : EXPERIENCE_SUBTITLE_SIZE;
  const gradeTrailingAdvance = hasGrade ? EXPERIENCE_SUBTITLE_SIZE : 0;

  // Page-flow: the whole-entry space check is computed via the shared
  // estimateEducationEntryMinimumHeight() (see its own comment above
  // addEducationEntry), which mirrors the advances above step for step,
  // so this entry's own check and addEducation()'s heading-guard can
  // never drift out of parity with each other.
  const minimumEntrySpaceNeeded = estimateEducationEntryMinimumHeight(doc, edu);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Degree / Program (title only — date no longer shares this row) ---
  const degreeRow = renderTitleRowWithDate(doc, degree, '', y);
  if (degreeRow.hasContent) {
    y += degreeInternalWrapAdvance;
    y += degreeTrailingAdvance;
  }

  // --- Institution / University Name (its own line, below the degree) ---
  if (hasInstitution) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(institutionLines, LEFT_MARGIN, y);
    y += institutionInternalWrapAdvance;
    // University Name -> Grade (or -> Date, if Grade is blank): the
    // normal content-line gap, replacing University Name's own tight
    // last-line advance rather than stacking on top of it.
    y += institutionTrailingAdvance;
  }

  // --- Date, directly below whatever precedes it (University Name, or
  // Degree if University Name is blank) ---
  if (hasDate) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(year, LEFT_MARGIN, y);
    // Date -> Grade (when Grade is present): the normal content-line gap,
    // replacing Date's own tight advance rather than stacking on top of it.
    y += dateTrailingAdvance;
  }

  // --- Grade, directly below Date (or whatever precedes it when there is
  // no Date) ---
  if (hasGrade) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);

    gradeLines.forEach((line, index) => {
      y = checkPageBreak(doc, y, lineInkHeight(EXPERIENCE_SUBTITLE_SIZE));
      doc.text(line, LEFT_MARGIN, y);
      const isLastGradeLine = index === gradeLines.length - 1;
      // Grade's own internal wrap uses the tight metadata spacing; its last
      // line is the entry's last field, so it advances the same tight step.
      y += isLastGradeLine ? gradeTrailingAdvance : EXPERIENCE_SUBTITLE_SIZE;
    });
  }

  // --- TRAILING-SPACE PARITY (applies to EVERY entry, not just the last) ---
  // Whatever gap is added next — EXPERIENCE_ENTRY_GAP before another
  // entry, or SECTION_GAP before the next section — sits directly on
  // top of y, so if y weren't normalized here, an entry ending on a
  // different field would leave a visibly smaller or larger gap
  // depending on which fields happened to be filled in. Grade (when
  // present) is the last field in the block, otherwise Date, Institution
  // or Degree — all but Degree share the same subtitle font size, which
  // is what the trailing-line reference below uses.
  const lastLineFontSize = hasDate || hasGrade || hasInstitution
    ? EXPERIENCE_SUBTITLE_SIZE
    : EXPERIENCE_TITLE_SIZE;
  y = topUpToLineHeight(y, lastLineFontSize);

  return y;
}

// ====================================================================
// SKILLS SECTION (3-column arrangement)
// Renders: "SKILLS" heading, then skills arranged into THREE columns
// (left, center, right), split into three consecutive groups — left
// column takes the first third of the list, center column the second
// third, right column the last third — paired row-by-row across the
// three columns.
//
// COLUMN LAYOUT (left/right UNCHANGED from the original 2-column
// design; only a center column is inserted between them):
//   - LEFT column: bullet at LEFT_MARGIN, text
//     BULLET_DOT_TO_TEXT_GAP_PT further right — exactly the same,
//     untouched formula/position this file has always used.
//   - RIGHT column: TEXT start X is the same original DERIVED
//     formula — content area's right edge minus the widest actual
//     skill word in the right column (measured live via
//     doc.getTextWidth) — so the widest right-column skill still ends
//     exactly at the page's right margin, same as before; its bullet
//     sits BULLET_DOT_TO_TEXT_GAP_PT to the left of that, unchanged.
//   - CENTER column is the only new element. Its horizontal position
//     is DERIVED (not a fixed/guessed coordinate) from the real,
//     measured extent of the left and right columns:
//       leftColumnRightEdge  = left column's own widest rendered word
//                               (measured live), i.e. where the left
//                               column's ink actually ends
//       rightColumnLeftEdge  = the right column's bullet X (unchanged
//                               from above), i.e. where the right
//                               column's ink actually begins
//       centerBlockWidth     = BULLET_DOT_TO_TEXT_GAP_PT + the center
//                               column's own widest rendered word
//       gap                  = (rightColumnLeftEdge - leftColumnRightEdge
//                                 - centerBlockWidth) / 2
//     The SAME `gap` value is then used on both sides — from the left
//     column's right edge to the center column's bullet, AND from the
//     center column's widest text's right edge to the right column's
//     bullet — which is exactly what makes the center column's gap to
//     the left column equal to its gap to the right column, without
//     moving the left or right column at all.
// Skill text is drawn at BODY_SIZE, same as before. The bullet dot
// reuses COLOR_SECTION_HEADING, same as before. Skills heading
// size/color (HEADING_SIZE/COLOR_SECTION_HEADING, via
// renderSectionHeading()) are untouched.
// If there are no usable skills at all, the whole section (including
// the heading) is skipped and startY is returned unchanged.
//
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addSkills(doc: jsPDF, data: AcademicPdfData, startY: number): number {
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

  // Font must be set BEFORE measuring, since every column's start X
  // below measures text width at the currently active font/size.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  // --- Split skills into three columns: left takes the first third,
  // center the second third, right the last third; rows are paired
  // left[i]/center[i]/right[i]. ---
  const thirdCount = Math.ceil(skillsList.length / 3);
  const leftSkills = skillsList.slice(0, thirdCount);
  const centerSkills = skillsList.slice(thirdCount, thirdCount * 2);
  const rightSkills = skillsList.slice(thirdCount * 2);
  const rowCount = Math.max(leftSkills.length, centerSkills.length, rightSkills.length);

  // Make sure there's room for the heading plus at least the first
  // row of skills before starting this section on the current page.
  // Otherwise the heading would be orphaned alone at the bottom of
  // the page with its content pushed to the next one.
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + lineInkHeight(BODY_SIZE);
  y = checkPageBreak(doc, y, minimumSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'SKILLS', y, BODY_SIZE);

  // renderSectionHeading() internally sets the font to bold/HEADING_SIZE
  // to draw the "SKILLS" heading itself, then leaves that font active
  // on the doc. Every other section (Summary, Experience, Education,
  // Languages, Achievements, Certifications, Projects) explicitly resets
  // the font back to normal/its own content size right after calling
  // renderSectionHeading() — this section must do the same, otherwise
  // the skill bullets/text below would inherit the heading's bold
  // HEADING_SIZE font instead of the normal BODY_SIZE content font.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  // --- LEFT column: bullet at LEFT_MARGIN, text offset past it by
  // BULLET_DOT_TO_TEXT_GAP_PT — UNCHANGED, original position. ---
  const leftBulletX = LEFT_MARGIN;
  const leftTextX = LEFT_MARGIN + BULLET_DOT_TO_TEXT_GAP_PT;
  const leftColumnMaxTextWidth = leftSkills.reduce(
    (maxWidth, skill) => Math.max(maxWidth, doc.getTextWidth(skill)),
    0
  );
  const leftColumnRightEdge = leftTextX + leftColumnMaxTextWidth; // where the left column's ink actually ends

  // --- RIGHT column: TEXT start X is the UNCHANGED original formula —
  // content-area right edge minus the right column's own widest
  // rendered word — so the widest right-column skill still ends
  // exactly at the page's right margin, same as before this change.
  // Its bullet sits BULLET_DOT_TO_TEXT_GAP_PT to its left, unchanged. ---
  const skillsContentRightEdge = LEFT_MARGIN + CONTENT_WIDTH; // == PAGE_WIDTH - RIGHT_MARGIN
  const rightColumnMaxTextWidth = rightSkills.reduce(
    (maxWidth, skill) => Math.max(maxWidth, doc.getTextWidth(skill)),
    0
  );
  const rightTextX = skillsContentRightEdge - rightColumnMaxTextWidth;
  const rightBulletX = rightTextX - BULLET_DOT_TO_TEXT_GAP_PT; // where the right column's ink actually begins

  // --- CENTER column: the only new element. Positioned so its gap to
  // the left column's right edge equals its gap to the right column's
  // left edge (rightBulletX) — WITHOUT moving either of those. ---
  const centerColumnMaxTextWidth = centerSkills.reduce(
    (maxWidth, skill) => Math.max(maxWidth, doc.getTextWidth(skill)),
    0
  );
  const centerBlockWidth = BULLET_DOT_TO_TEXT_GAP_PT + centerColumnMaxTextWidth;
  const equalGap = (rightBulletX - leftColumnRightEdge - centerBlockWidth) / 2;
  const centerBulletX = leftColumnRightEdge + equalGap;
  const centerTextX = centerBulletX + BULLET_DOT_TO_TEXT_GAP_PT;

  for (let i = 0; i < rowCount; i++) {
    y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));

    if (i < leftSkills.length) {
      doc.setTextColor(...COLOR_SECTION_HEADING); // bullet dot — same color as this file's Achievements bullet dot
      doc.text('•', leftBulletX, y);
      doc.setTextColor(...COLOR_BODY);
      doc.text(leftSkills[i], leftTextX, y);
    }

    if (i < centerSkills.length) {
      doc.setTextColor(...COLOR_SECTION_HEADING);
      doc.text('•', centerBulletX, y);
      doc.setTextColor(...COLOR_BODY);
      doc.text(centerSkills[i], centerTextX, y);
    }

    if (i < rightSkills.length) {
      doc.setTextColor(...COLOR_SECTION_HEADING);
      doc.text('•', rightBulletX, y);
      doc.setTextColor(...COLOR_BODY);
      doc.text(rightSkills[i], rightTextX, y);
    }

    y += BODY_LINE_HEIGHT;
  }

  return y;
}

// Splits the raw `skills` string into individual skill strings, using
// the EXACT same rule as the CV editor's own getSkillArray()
// (SkillsSection.tsx): comma-separated if it contains a comma,
// otherwise one skill per line with an optional leading bullet
// marker stripped. This is intentionally duplicated logic rather than
// a shared import, since academicPdf.ts is a self-contained renderer —
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
// Experience and Education entries already use.
//
// ROOT-CAUSE FIX — Language 2 onward previously landed much further
// down than a normal content-line gap because TWO increments were
// stacked for every entry after the first: addLanguageEntry()'s own
// trailing normalization (topUpToLineHeight(), see the note inside it)
// already advances y by exactly one normal content-line step
// (BODY_LINE_HEIGHT) past the entry's last rendered line — that step,
// by itself, already IS the gap into whatever comes next. The OLD loop
// then ALSO added EXPERIENCE_ENTRY_GAP (the same entry-to-entry
// constant Experience/Education/Achievements use, whose larger,
// deliberately section-like separation is appropriate for job/degree-
// style entries) on top of that already-normalized position —
// double-counting "normal content gap" + "entry gap", stacked, which is
// why consecutive languages visually read as SECTION_GAP-sized.
//
// Fixed by treating consecutive languages as continuous normal content
// (a compact list, not separate entry "cards"): the loop no longer adds
// anything between entries, because each entry's own topUpToLineHeight()
// step already produces exactly the same Y/cursor advance used between
// two consecutive lines of ordinary body/content text elsewhere in this
// file. This only changes language-to-language spacing — the
// heading -> first language gap (headingSpaceNeeded, untouched) and
// SECTION_GAP into whatever section follows Languages (still measured
// from the last entry's identically-normalized trailing position) are
// unaffected. Every other section's own use of EXPERIENCE_ENTRY_GAP
// between ITS entries is untouched.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addLanguages(doc: jsPDF, data: AcademicPdfData, startY: number): number {
  const languages = (data.languages || []).filter(hasUsableLanguageContent);

  if (languages.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — the same
  // relationship as every other "previous section -> next section" gap
  // in this file.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — this guard used to reserve only "heading + one
  // line" as a stand-in for "the first entry", regardless of what that
  // entry actually contained. A real first entry is usually MORE than
  // one line, so the heading could pass this check, render at the
  // bottom of the page, and then the first entry's OWN (correctly-sized)
  // checkPageBreak() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateLanguageEntryMinimumHeight() addLanguageEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateLanguageEntryMinimumHeight(doc, languages[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'LANGUAGES', y, EXPERIENCE_TITLE_SIZE);

  // --- Entries — no gap added between them here: each entry already
  // ends on a normal-content-line-equivalent position (see the
  // ROOT-CAUSE FIX note above), so that trailing position IS the gap
  // into the next language. ---
  languages.forEach((lang) => {
    y = addLanguageEntry(doc, lang, y);
  });

  return y;
}

// An entry counts as "usable" if it has ANY content worth printing —
// same rule as hasUsableExperienceContent()/hasUsableEducationContent().
function hasUsableLanguageContent(lang: AcademicPdfLanguage | null | undefined): boolean {
  if (!lang) {
    return false;
  }
  return Boolean(sanitizeText((lang.language || '').trim()) || sanitizeText((lang.proficiency || '').trim()));
}

// Expands the form's stored short proficiency code to the same
// human-readable label LanguagesSection.tsx's own getProficiencyLabel()
// shows in its preview line. Intentionally duplicated (not imported)
// for the same reason parseSkillsList() duplicates getSkillArray()'s
// rule instead of sharing it: academicPdf.ts is a self-contained
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

// Computes the exact minimum vertical space one Language entry needs
// (language name + proficiency line), without drawing anything. Used
// by addLanguageEntry() itself for its own checkPageBreak() call AND
// by addLanguages() to size its heading-guard against the REAL first
// entry instead of a generic one-line guess — see the ROOT-CAUSE FIX
// note on that guard. Single source of truth, so the estimate and the
// entry's own render can never disagree.
function estimateLanguageEntryMinimumHeight(doc: jsPDF, lang: AcademicPdfLanguage): number {
  const language = sanitizeText((lang.language || '').trim());
  const proficiencyRaw = sanitizeText((lang.proficiency || '').trim());
  const proficiencyLabel = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const languageLines: string[] = language ? doc.splitTextToSize(language, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const proficiencyLines: string[] = proficiencyLabel
    ? doc.splitTextToSize(proficiencyLabel, CONTENT_WIDTH)
    : [];

  const languageHeight = languageLines.length * EXPERIENCE_TITLE_SIZE;
  const proficiencyHeight = proficiencyLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const titleToSubtitleGap = languageLines.length > 0 && proficiencyLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;

  const fullHeight = languageHeight + titleToSubtitleGap + proficiencyHeight;
  const lastLineFontSize = proficiencyLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE;
  const inkHeight = inkBottomHeight(fullHeight, lastLineFontSize, lastLineFontSize);
  return keepTogetherHeight(inkHeight, inkHeight);
}

// Renders a single language entry and returns the new Y position,
// normalized (like every Education entry) so every entry — not only
// the section's last one — ends on an equivalent trailing space. See
// the ENTRY-GAP CONSISTENCY note above addLanguages().
function addLanguageEntry(doc: jsPDF, lang: AcademicPdfLanguage, startY: number): number {
  let y = startY;

  const language = sanitizeText((lang.language || '').trim());
  const proficiencyRaw = sanitizeText((lang.proficiency || '').trim());
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
  // its own proficiency line. Computed via the shared
  // estimateLanguageEntryMinimumHeight() (see its own comment above)
  // rather than inline here, so this entry's own page-break check and
  // addLanguages()'s heading-guard can never drift out of parity. ---
  const minimumEntrySpaceNeeded = estimateLanguageEntryMinimumHeight(doc, lang);
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

  // Normalize every entry's end (not only the last) to a
  // body-line-equivalent trailing space — see the ROOT-CAUSE FIX note
  // above addLanguages() for why this makes that trailing space double
  // as the gap into the next language, and the matching comment inside
  // addEducationEntry() for the same topUpToLineHeight() convention.
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
function addAchievements(doc: jsPDF, data: AcademicPdfData, startY: number): number {
  const achievements = (data.achievements || []).filter(hasUsableAchievementContent);

  if (achievements.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — the same
  // relationship as every other "previous section -> next section" gap
  // in this file.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — this guard used to reserve only "heading + one
  // line" as a stand-in for "the first entry", regardless of what that
  // entry actually contained. A real first entry is usually MORE than
  // one line, so the heading could pass this check, render at the
  // bottom of the page, and then the first entry's OWN (correctly-sized)
  // checkPageBreak() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateAchievementEntryMinimumHeight() addAchievementEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateAchievementEntryMinimumHeight(doc, achievements[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
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
    sanitizeText((ach.title || '').trim()) ||
    sanitizeText((ach.date || '').trim()) ||
    sanitizeText((ach.description || '').trim())
  );
}

// Renders a single achievement entry and returns the new Y position,
// normalized (like every Education/Language entry) so every entry —
// not only the section's last one — ends on an equivalent trailing space.
// Computes the exact height renderTitleRowWithDate() will consume for a
// given title/date pair, without drawing anything — used by every
// caller's pre-render "does this entry fit" estimate. Mirrors
// renderTitleRowWithDate()'s own wrap-width / line-count / height logic
// exactly, so the estimate and the actual render can never disagree.
function estimateTitleRowHeight(doc: jsPDF, title: string, date: string): number {
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
  const lineCount = title ? doc.splitTextToSize(title, titleWrapWidth).length : 0;

  return lineCount > 0
    ? lineCount * EXPERIENCE_TITLE_SIZE
    : (date ? EXPERIENCE_SUBTITLE_SIZE : 0);
}

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
//
// PAGE-FLOW NOTE: estimateTitleRowHeight() directly below is the
// measurement-only twin of this function — it computes the exact height
// this function will consume for a given title/date pair, using the same
// wrap-width/line-count rules, so every pre-render "does this entry fit"
// estimate and the actual render can never disagree.
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

// Computes the exact height renderTitleWithDateBelow() will consume for a
// given title/date pair, without drawing anything — the measurement-only
// twin of that function (same wrap widths, same title->date step, same
// date line count), so a pre-render "does this entry fit" estimate and
// the actual render can never disagree.
function estimateTitleWithDateBelowHeight(doc: jsPDF, title: string, date: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleLineCount = title ? doc.splitTextToSize(title, CONTENT_WIDTH).length : 0;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateLineCount = date ? doc.splitTextToSize(date, CONTENT_WIDTH).length : 0;

  let height = 0;
  if (titleLineCount > 0) {
    // Title's own internal wrap lines + the title->date step
    // (BODY_LINE_HEIGHT when a date follows, else the title's own font
    // size) — exactly renderTitleWithDateBelow()'s cursor advances.
    height += (titleLineCount - 1) * EXPERIENCE_TITLE_SIZE;
    height += date ? BODY_LINE_HEIGHT : EXPERIENCE_TITLE_SIZE;
  }
  height += dateLineCount * EXPERIENCE_SUBTITLE_SIZE;
  return height;
}

// Renders a left-aligned title (bold, COLOR_HEADING, EXPERIENCE_TITLE_SIZE)
// with its date on its own line DIRECTLY BELOW the title (normal weight,
// COLOR_METADATA, EXPERIENCE_SUBTITLE_SIZE) — the stacked counterpart to
// renderTitleRowWithDate() above, used by Achievements only (Experience
// keeps the original same-row layout via renderTitleRowWithDate() —
// unchanged; Education renders its own date separately, after Institution
// and Grade — see addEducationEntry()).
//
// The title wraps at the FULL CONTENT_WIDTH (no width is reserved for a
// date beside it, since the date no longer shares its row) — so the
// title/Achievement Name always gets the full usable width and wraps
// normally by words, regardless of how long the date is. This is what
// keeps requirement "Name must never collapse into an unusably narrow
// width" satisfied unconditionally, by construction.
//
// TITLE -> DATE GAP: the vertical step from the title's LAST line down to
// the date reuses BODY_LINE_HEIGHT — the same vertical advance already
// used between two consecutive lines of normal body/content text
// elsewhere in this file (the Summary paragraph, and the Experience/
// Achievement/Project description lines) — so the title-to-date gap is
// EXACTLY the file's existing normal content-line advance, not a new
// value invented for this pass.
//
// DATE OVERFLOW FIX (root cause): the date used to be drawn with
// `doc.text(date, LEFT_MARGIN, cursorY)` — a single unwrapped, unbounded
// string with no width constraint at all. A short date happened to fit,
// but nothing stopped a longer date from running straight past the
// right content boundary (PAGE_WIDTH - RIGHT_MARGIN) and off the page,
// since its width was never measured or capped against CONTENT_WIDTH.
// The fix wraps the date the exact same way every other multi-line
// field in this file already wraps (doc.splitTextToSize() against
// CONTENT_WIDTH — the same helper the title itself, degreeLines,
// descriptionItems, etc. all use), so however long the date is, it
// always stays within the same left/right content boundaries the title
// above it already respects, instead of assuming it always fits on one
// line. Multi-line dates advance own-font-size-per-line (no extra
// leading), the same convention already used for every other metadata
// field in this file.
//
// Everything else keeps its pre-existing convention: if the title itself
// wraps onto more than one line, its OWN internal line-to-line advance is
// still EXPERIENCE_TITLE_SIZE (own font size, no extra leading — the same
// convention already used for every other metadata field in this file),
// unchanged.
//
// Returns the total height consumed so the caller advances its own Y
// cursor exactly as it did when the date was rendered beside the title.
function renderTitleWithDateBelow(
  doc: jsPDF,
  title: string,
  date: string,
  y: number
): { height: number; hasContent: boolean } {
  let cursorY = y;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleLines: string[] = title ? doc.splitTextToSize(title, CONTENT_WIDTH) : [];

  if (titleLines.length > 0) {
    doc.setTextColor(...COLOR_HEADING);
    doc.text(titleLines, LEFT_MARGIN, cursorY);

    // Title's OWN internal wrap advance (line 1 -> line 2 -> ...), unchanged:
    // still EXPERIENCE_TITLE_SIZE per line, no extra leading.
    if (titleLines.length > 1) {
      cursorY += (titleLines.length - 1) * EXPERIENCE_TITLE_SIZE;
    }

    // The one step this pass changes: title's last line -> date. Reuses
    // BODY_LINE_HEIGHT (see doc comment above) instead of the title's own
    // font size. When there's no date, the title's last line simply
    // advances by its own font size as before (no date follows to change
    // the gap for).
    cursorY += date ? BODY_LINE_HEIGHT : EXPERIENCE_TITLE_SIZE;
  }

  if (date) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    // ROOT-CAUSE FIX: wrap the date against CONTENT_WIDTH (the same
    // splitTextToSize machinery every other field in this file already
    // uses) instead of drawing it as a single unbounded string. A
    // normal short date still produces exactly one line, so this is a
    // no-op for the common case; only a genuinely long date now wraps
    // onto additional lines instead of overflowing the right boundary.
    const dateLines: string[] = doc.splitTextToSize(date, CONTENT_WIDTH);
    doc.text(dateLines, LEFT_MARGIN, cursorY);
    // Date's own line(s) — own font size per line, no extra leading,
    // the same convention already used for every other multi-line
    // metadata field in this file (degreeLines, institution, etc.).
    cursorY += dateLines.length * EXPERIENCE_SUBTITLE_SIZE;
  }

  const hasContent = titleLines.length > 0 || Boolean(date);
  const height = cursorY - y;

  return { height, hasContent };
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
// BULLET RENDERING (shared by Experience, Achievements, and Projects):
// every manual line break the user typed in a description textarea
// (split on '\n') is ONE BULLET ITEM and always gets a "•" dot — this
// matches the CV builder's own form/preview, where each line the user
// types is already shown as one point. If the user's own text for a
// line happens to already start with a marker character (one of the
// ones below, followed by whitespace — e.g. they typed "- Led a team"
// themselves), that marker is stripped first so it isn't shown twice
// alongside the dot this file draws.
const BULLET_MARKER_PATTERN = /^[•●◦▪‣∙‧–—*-]\s+/;

function parseBulletLine(rawLine: string): { text: string } {
  const trimmed = rawLine.trim();
  const match = trimmed.match(BULLET_MARKER_PATTERN);
  if (match) {
    return { text: trimmed.slice(match[0].length).trim() };
  }
  return { text: trimmed };
}

// Splits a description into logical bullet items (one per typed line,
// manual '\n' breaks respected exactly like before) and wraps each
// item's text to the page width minus BULLET_DOT_TO_TEXT_GAP_PT, since
// every item's text is indented past its dot. Shared by every
// section's own estimate*EntryMinimumHeight() (space estimate) AND its
// add*Entry() (the actual render) so the pre-render estimate and the
// real output can never disagree about line counts or wrap width.
function buildBulletDescriptionItems(
  doc: jsPDF,
  description: string
): { lines: string[] }[] {
  if (!description) {
    return [];
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  return description
    .split('\n')
    .map((rawLine: string) => parseBulletLine(rawLine))
    .filter((item) => item.text.length > 0)
    .map((item) => ({
      lines: doc.splitTextToSize(item.text, CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT),
    }));
}

// Renders a bulleted description: every item gets a "•" dot at
// LEFT_MARGIN with its text indented by BULLET_DOT_TO_TEXT_GAP_PT (the
// dot's X position never moves; only the text is offset from it).
//
// ONE-BULLET-PER-ITEM: `items` is an array of BULLET ITEMS (see
// buildBulletDescriptionItems() above), each already carrying its own
// wrapped lines. The dot is drawn only once — against an item's FIRST
// wrapped line — and every subsequent wrapped line belonging to the
// SAME item is rendered at the bullet's text indentation with no dot,
// so a sentence that wraps onto 2, 10, or 20 lines still shows exactly
// one bullet. Returns the new Y position.
function renderBulletDescriptionLines(
  doc: jsPDF,
  items: { lines: string[] }[],
  startY: number
): number {
  let y = startY;
  const bulletX = LEFT_MARGIN;
  const bulletTextX = LEFT_MARGIN + BULLET_DOT_TO_TEXT_GAP_PT;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  for (const item of items) {
    item.lines.forEach((line, lineIndex) => {
      y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));
      if (lineIndex === 0) {
        // First wrapped line of this item — draw its dot.
        doc.setTextColor(...COLOR_SECTION_HEADING); // bullet dot — Academic PDF's own section-heading/accent color
        doc.text('•', bulletX, y);
      }
      // Continuation lines of the same item render no dot, but still
      // start at the bullet-text indentation, exactly like the first line.
      doc.setTextColor(...COLOR_BODY);
      doc.text(line, bulletTextX, y);
      y += BODY_LINE_HEIGHT;
    });
  }

  return y;
}

// Computes the exact minimum vertical space one Achievement entry
// needs (title + date block + FULL wrapped description), without
// drawing anything. Used by addAchievementEntry() itself for its own
// checkPageBreak() call AND by addAchievements() to size its
// heading-guard against the REAL first entry instead of a generic
// one-line guess — see the ROOT-CAUSE FIX note on that guard.
// Single source of truth, so the estimate and the entry's own render
// can never disagree. Mirrors renderTitleWithDateBelow()'s height (via
// estimateTitleWithDateBelowHeight()) plus the header->description gap
// and every wrapped description line, exactly as
// renderBulletDescriptionLines() advances.
//
// An entry that fits on a single page moves to the next page as a
// WHOLE; an entry taller than a full page is reserved only up to its
// header plus first description line and flows across pages (see
// keepTogetherHeight()).
function estimateAchievementEntryMinimumHeight(doc: jsPDF, ach: any): number {
  const title = sanitizeText((ach.title || '').trim());
  const date = sanitizeText((ach.date || '').trim());
  const description = sanitizeText((ach.description || '').trim());

  // Uses the SAME buildBulletDescriptionItems() the real render
  // uses (see its own doc comment above), so this estimate's line
  // count/wrap-width can never drift out of parity with what
  // addAchievementEntry() actually draws.
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  const titleRowHeightEstimate = estimateTitleWithDateBelowHeight(doc, title, date);
  const hasHeaderContent = Boolean(title || date);
  const headerToDescriptionGap = hasHeaderContent && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const descriptionTotalHeight = descriptionLines.length * BODY_LINE_HEIGHT;

  const hasDescription = descriptionLines.length > 0;
  const lastLineFontSize = hasDescription ? BODY_SIZE
    : date ? EXPERIENCE_SUBTITLE_SIZE
    : EXPERIENCE_TITLE_SIZE;
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSize;

  return keepTogetherHeight(
    inkBottomHeight(titleRowHeightEstimate + headerToDescriptionGap + descriptionTotalHeight, lastLineAdvance, lastLineFontSize),
    hasDescription
      ? inkBottomHeight(titleRowHeightEstimate + headerToDescriptionGap + firstDescriptionLineHeight, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(titleRowHeightEstimate, lastLineAdvance, lastLineFontSize)
  );
}

function addAchievementEntry(
  doc: jsPDF,
  ach: any,
  startY: number
): number {
  let y = startY;

  const title = sanitizeText((ach.title || '').trim());
  const date = sanitizeText((ach.date || '').trim());
  const description = sanitizeText((ach.description || '').trim());

  // Date renders on its own line directly BELOW the achievement
  // title/name — via the shared renderTitleWithDateBelow() helper (see
  // its own doc comment above). (Experience keeps the original same-row
  // date placement via renderTitleRowWithDate() — unchanged.)

  // Description uses body text size and line height with 1.4 multiplier
  // (same as Summary and Experience description).
  //
  // BULLET-AWARE, ONE-BULLET-PER-ITEM: each manual line break the user
  // typed (split on '\n') is one ACHIEVEMENT ITEM and always gets a
  // bullet dot — see BULLET_MARKER_PATTERN/parseBulletLine() above —
  // never more than one dot regardless of how many lines that item
  // wraps into. `descriptionItems` keeps that grouping — one array
  // entry per item, each carrying its own wrapped lines — so
  // renderBulletDescriptionLines() can draw exactly one dot per item.
  // `descriptionLines` (the flat list of every wrapped line, across
  // all items) is kept alongside it purely for the page-break/space
  // estimates below, which only ever cared about total line count.
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a title from its
  // date/description. Computed via the shared
  // estimateAchievementEntryMinimumHeight() (see its own comment above)
  // rather than inline here, so this entry's own page-break check and
  // addAchievements()'s heading-guard can never drift out of parity. ---
  const hasHeaderContent = Boolean(title || date);
  const minimumEntrySpaceNeeded = estimateAchievementEntryMinimumHeight(doc, ach);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Achievement Title, with Date on its own line directly below it
  // (normal content flow — no longer a side-by-side row) ---
  const titleRow = renderTitleWithDateBelow(doc, title, date, y);
  if (titleRow.hasContent) {
    y += titleRow.height;
  }

  // --- Description (optional, wrapped body text, rendered as bullets) ---
  if (descriptionLines.length > 0) {
    // Only add the gap if there was header content before it
    if (hasHeaderContent) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }

    y = renderBulletDescriptionLines(doc, descriptionItems, y);
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
  // NOTE: with the date now stacked directly below the title (rather
  // than beside it), the date — when present — is the last line of the
  // title/date block, regardless of whether a title is also present.
  let lastLineFontSize: number;
  if (descriptionLines.length > 0) {
    // Description already ends at body-line-equivalent
    return y;
  } else if (date) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
  } else if (title) {
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
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
function addCertifications(doc: jsPDF, data: AcademicPdfData, startY: number): number {
  const certifications = (data.certifications || []).filter(hasUsableCertificationContent);

  if (certifications.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (Education) and this section.
  // This is the SAME SECTION_GAP used by all other section transitions.
  // No special Education→Certifications gap constant exists or is needed.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — this guard used to reserve only "heading + one
  // line" as a stand-in for "the first entry", regardless of what that
  // entry actually contained. A real first entry is usually MORE than
  // one line, so the heading could pass this check, render at the
  // bottom of the page, and then the first entry's OWN (correctly-sized)
  // checkPageBreak() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateCertificationEntryMinimumHeight() addCertificationEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateCertificationEntryMinimumHeight(doc, certifications[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
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
    sanitizeText((cert.name || '').trim()) ||
    sanitizeText((cert.date || '').trim()) ||
    sanitizeText((cert.credentialId || '').trim())
  );
}

// Computes the exact minimum vertical space one Certification entry
// needs (name + date + credential ID), without drawing anything. Used
// by addCertificationEntry() itself for its own checkPageBreak() call
// AND by addCertifications() to size its heading-guard against the
// REAL first entry instead of a generic one-line guess — see the
// ROOT-CAUSE FIX note on that guard. Single source of truth, so the
// estimate and the entry's own render can never disagree: it mirrors,
// step for step, the advances addCertificationEntry() applies.
function estimateCertificationEntryMinimumHeight(doc: jsPDF, cert: any): number {
  const name = sanitizeText((cert.name || '').trim());
  const date = sanitizeText((cert.date || '').trim());
  const credentialId = sanitizeText((cert.credentialId || '').trim());

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const nameLines: string[] = name ? doc.splitTextToSize(name, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateLines: string[] = date ? doc.splitTextToSize(date, CONTENT_WIDTH) : [];
  const credentialLines: string[] = credentialId ? doc.splitTextToSize(credentialId, CONTENT_WIDTH) : [];

  const nameHeight = nameLines.length * EXPERIENCE_TITLE_SIZE;
  const nameToDateGap = nameLines.length > 0 && dateLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const nameToCredentialGap = nameLines.length > 0 && credentialLines.length > 0 && dateLines.length === 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;

  const dateInternalWrapAdvance = dateLines.length > 1
    ? (dateLines.length - 1) * EXPERIENCE_SUBTITLE_SIZE
    : 0;
  const dateTrailingAdvance = dateLines.length === 0 ? 0
    : credentialLines.length > 0 ? BODY_LINE_HEIGHT
    : EXPERIENCE_SUBTITLE_SIZE;
  const dateSpaceNeeded = dateLines.length > 0 ? dateInternalWrapAdvance + dateTrailingAdvance : 0;

  const credentialHeight = credentialLines.length * EXPERIENCE_SUBTITLE_SIZE;

  const fullHeight = nameHeight + nameToDateGap + dateSpaceNeeded +
    credentialHeight + nameToCredentialGap;
  const lastLineFontSize = (credentialLines.length > 0 || dateLines.length > 0)
    ? EXPERIENCE_SUBTITLE_SIZE
    : EXPERIENCE_TITLE_SIZE;
  const inkHeight = inkBottomHeight(fullHeight, lastLineFontSize, lastLineFontSize);
  return keepTogetherHeight(inkHeight, inkHeight);
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

  const name = sanitizeText((cert.name || '').trim());
  const date = sanitizeText((cert.date || '').trim());
  const credentialId = sanitizeText((cert.credentialId || '').trim());

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

  // ------------------------------------------------------------------
  // ROOT-CAUSE FIX — Date <-> Credential ID gap was too large for the
  // same reason University Name -> Grade/Date was in Education: the OLD
  // code advanced y by Date's own tight (no-leading) metadata-line
  // height AND THEN separately added an EXPERIENCE_TITLE_TO_SUBTITLE_GAP
  // on top of that before Credential ID — double-counting "own line
  // height" + "a gap", stacked.
  //
  // Fixed the same way as Education: Date's transition INTO Credential
  // ID is now a single BODY_LINE_HEIGHT step — the exact same per-line
  // vertical advance already used between consecutive lines of ordinary
  // wrapped body/content text elsewhere in this file (Summary's
  // paragraph, Experience/Achievement/Project description lines,
  // and Education's University Name -> Grade/Date). This REPLACES,
  // rather than adds to, Date's own tight last-line advance. Date's own
  // internal text-wrap (if the date string itself wraps to more than one
  // line) is untouched and still advances between ITS OWN wrapped lines
  // using the existing tight metadata-line spacing — only the FINAL
  // line's transition into Credential ID changes.
  //
  // Name -> Date and Name -> Credential ID (when there's no Date) are
  // unaffected by this fix and keep using EXPERIENCE_TITLE_TO_SUBTITLE_GAP,
  // exactly as before.
  // ------------------------------------------------------------------
  const dateInternalWrapAdvance = dateLines.length > 1
    ? (dateLines.length - 1) * EXPERIENCE_SUBTITLE_SIZE
    : 0;
  const dateTrailingAdvance = dateLines.length === 0 ? 0
    : credentialLines.length > 0 ? BODY_LINE_HEIGHT
    : EXPERIENCE_SUBTITLE_SIZE;

  const credentialHeight = credentialLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a name from its date
  // or credential ID. Computed via the shared
  // estimateCertificationEntryMinimumHeight() (see its own comment
  // above) rather than inline here, so this entry's own page-break
  // check and addCertifications()'s heading-guard can never drift out
  // of parity. ---
  const minimumEntrySpaceNeeded = estimateCertificationEntryMinimumHeight(doc, cert);
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
    y += dateInternalWrapAdvance;
    // Date -> Credential ID: the normal content-line gap, replacing
    // Date's own tight last-line advance rather than stacking on top
    // of it.
    y += dateTrailingAdvance;
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
function addProjects(doc: jsPDF, data: AcademicPdfData, startY: number): number {
  const projects = (data.projects || []).filter(hasUsableProjectContent);

  if (projects.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (Achievements) and this section.
  // This is the SAME SECTION_GAP used by all other section transitions.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — this guard used to reserve only "heading + one
  // line" as a stand-in for "the first entry", regardless of what that
  // entry actually contained. A real first entry is usually MORE than
  // one line, so the heading could pass this check, render at the
  // bottom of the page, and then the first entry's OWN (correctly-sized)
  // checkPageBreak() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateProjectEntryMinimumHeight() addProjectEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateProjectEntryMinimumHeight(doc, projects[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
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
    sanitizeText((project.name || '').trim()) ||
    sanitizeText((project.tech || '').trim()) ||
    sanitizeText((project.description || '').trim()) ||
    sanitizeText((project.github || '').trim())
  );
}

// Computes the exact minimum vertical space one Project entry needs
// (name + tech + FULL wrapped description + github), without drawing
// anything. Used by addProjectEntry() itself for its own
// checkPageBreak() call AND by addProjects() to size its heading-guard
// against the REAL first entry instead of a generic one-line guess —
// see the ROOT-CAUSE FIX note on that guard. Single source of truth, so
// the estimate and the entry's own render can never disagree.
//
// An entry that fits on a single page moves to the next page as a
// WHOLE; an entry taller than a full page is reserved only up to its
// header plus first description line and flows across pages (see
// keepTogetherHeight()).
function estimateProjectEntryMinimumHeight(doc: jsPDF, project: any): number {
  const name = sanitizeText((project.name || '').trim());
  const tech = sanitizeText((project.tech || '').trim());
  const description = sanitizeText((project.description || '').trim());
  const github = sanitizeText((project.github || '').trim());

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const nameLines: string[] = name ? doc.splitTextToSize(name, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const techLines: string[] = tech ? doc.splitTextToSize(tech, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  // BULLET SUPPORT (same shared rule as Experience and Achievements —
  // see buildBulletDescriptionItems()/renderBulletDescriptionLines()
  // above, reused here as-is since neither function contains anything
  // achievement-specific): every typed line always renders as a
  // bullet item, and bulleted items are wrapped narrower
  // (CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT) so they never cross
  // the right margin at their indented draw position.
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const githubLines: string[] = github ? doc.splitTextToSize(github, CONTENT_WIDTH) : [];

  const nameHeight = nameLines.length * EXPERIENCE_TITLE_SIZE;
  const techHeight = techLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const descriptionHeight = descriptionLines.length * BODY_LINE_HEIGHT;
  const githubHeight = githubLines.length * EXPERIENCE_SUBTITLE_SIZE;

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
  // NOTE: there are deliberately no separate "nameToDescriptionGap" or
  // "techToDescriptionGap" terms here. headerToDescriptionGap above
  // already covers EVERY header -> description transition (name-only,
  // tech-only, or name+tech), since its own condition is
  // `hasHeaderContent && descriptionLines.length > 0`. Two narrower terms
  // used to re-add the same gap a second time for the name-only and
  // tech-present cases respectively — that double-counted the single gap
  // addProjectEntry() actually draws. Removed so this estimate mirrors
  // the render function's single-gap fix exactly (see the matching
  // comment in addProjectEntry()'s Description block) instead of the
  // estimate being patched to match a render bug.
  const techToGithubGap = techLines.length > 0 && githubLines.length > 0 && descriptionLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const nameToGithubGap = nameLines.length > 0 && githubLines.length > 0 && techLines.length === 0 && descriptionLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;

  const fullHeight = nameHeight + nameToTechGap + techHeight +
    headerToDescriptionGap + descriptionHeight +
    descriptionToGithubGap + githubHeight + techToGithubGap + nameToGithubGap;

  // Lead = everything up to and including the FIRST description line
  // (only meaningful when a description exists; otherwise the whole
  // entry is its own lead).
  const hasDescription = descriptionLines.length > 0;
  const lastLineFontSize = githubLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE
    : hasDescription ? BODY_SIZE
    : techLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE
    : EXPERIENCE_TITLE_SIZE;
  const lastLineAdvance = (githubLines.length === 0 && hasDescription) ? BODY_LINE_HEIGHT : lastLineFontSize;
  const fullInkHeight = inkBottomHeight(fullHeight, lastLineAdvance, lastLineFontSize);
  const leadInkHeight = hasDescription
    ? inkBottomHeight(
        nameHeight + nameToTechGap + techHeight +
          headerToDescriptionGap + BODY_LINE_HEIGHT,
        BODY_LINE_HEIGHT,
        BODY_SIZE
      )
    : fullInkHeight;

  return keepTogetherHeight(fullInkHeight, leadInkHeight);
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

  const name = sanitizeText((project.name || '').trim());
  const tech = sanitizeText((project.tech || '').trim());
  const description = sanitizeText((project.description || '').trim());
  const github = sanitizeText((project.github || '').trim());

  // Wrap each field independently (any could be long).
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const nameLines: string[] = name ? doc.splitTextToSize(name, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const techLines: string[] = tech ? doc.splitTextToSize(tech, CONTENT_WIDTH) : [];

  // Description uses body text size and line height with 1.4 multiplier
  // (same as Summary and Experience description). BULLET SUPPORT: see
  // the matching comment in estimateProjectEntryMinimumHeight() above —
  // reuses the same shared bullet-detection/wrap helper Achievements
  // already uses, so Projects' bulleted descriptions are wrapped and
  // page-broken exactly the same overflow-safe way as the rest of the PDF.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const githubLines: string[] = github ? doc.splitTextToSize(github, CONTENT_WIDTH) : [];

  // Multi-line metadata fields (name/tech/github) use their own font
  // size as the per-line height, with no extra leading — the same
  // metadata-line convention used by the header's contact line and every
  // Education field.
  const nameHeight = nameLines.length * EXPERIENCE_TITLE_SIZE;
  const techHeight = techLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const githubHeight = githubLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a name from its tech,
  // description, or GitHub link. Computed via the shared
  // estimateProjectEntryMinimumHeight() (see its own comment above)
  // rather than inline here, so this entry's own page-break check and
  // addProjects()'s heading-guard can never drift out of parity. ---
  const minimumEntrySpaceNeeded = estimateProjectEntryMinimumHeight(doc, project);
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
  // NOTE: the gap ABOVE description is already added by whichever field
  // immediately precedes it — the Name block's own forward-looking gap
  // (above, when there's no Tech) or the Tech block's own forward-looking
  // gap (above, when Tech is present). This block must NOT add
  // EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP again here: doing so
  // double-counted the same single gap (2x the intended spacing —
  // visibly bigger than the identical gap used everywhere else in this
  // file, e.g. Experience/Achievement/Certification's header ->
  // description spacing). Fixed by simply not re-adding it — same
  // single-gap convention every other section already follows correctly.
  if (descriptionLines.length > 0) {
    y = renderBulletDescriptionLines(doc, descriptionItems, y);

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
//
// HOW THE PAGE-FLOW SYSTEM FITS TOGETHER (one system, used everywhere):
//   1. Every entry-based section has ONE shared estimateXxxEntryMinimum-
//      Height() helper that measures — from the real wrapped text, with
//      no drawing — exactly how much vertical space the whole entry
//      consumes. The entry's own checkPageBreak() and the section's
//      heading guard both call that same helper, so they can never
//      disagree with each other or with the render.
//   2. The section heading guard reserves heading + the REAL first
//      entry, so a heading is never left alone at the bottom of a page.
//   3. Each entry reserves its WHOLE height, so an entry that fits on a
//      page is never split; it moves to the next page together.
//   4. Wrapped body/bullet lines are ALSO checked one at a time as they
//      are drawn, so anything too tall for one page (see
//      keepTogetherHeight()) keeps flowing onto new pages instead of
//      being clipped.
// ====================================================================
export function checkPageBreak(doc: jsPDF, y: number, spaceNeeded: number): number {
  const willOverflow = y + spaceNeeded > PAGE_HEIGHT - BOTTOM_MARGIN;
  if (willOverflow) {
    doc.addPage();
    return TOP_MARGIN;
  }
  return y;
}

// ====================================================================
// KEEP-TOGETHER HEIGHT (part of the page-flow system above)
// Decides how much space an entry should RESERVE before it starts.
//   - If the whole entry (`fullHeight`) fits on one page, reserve all of
//     it: if it doesn't fit in what's left of the current page, it moves
//     to the next page as a whole (no partial entries).
//   - If the whole entry could NEVER fit on any single page, moving it
//     to a new page can't help — it would only waste the rest of the
//     current page (or, at the very top of a page, add a needless
//     near-blank one) — so reserve only its `leadHeight` (header plus
//     first content line) and let its remaining lines flow across pages
//     via the per-line checkPageBreak() calls made while rendering.
// The result is always capped at PAGE_USABLE_HEIGHT, so a reservation
// can never be larger than a page and checkPageBreak() can therefore
// never demand a fresh page that still would not fit it.
// ====================================================================
function keepTogetherHeight(fullHeight: number, leadHeight: number): number {
  if (fullHeight <= PAGE_USABLE_HEIGHT) {
    return fullHeight;
  }
  return Math.min(leadHeight, PAGE_USABLE_HEIGHT);
}

// ====================================================================
// INK-BOTTOM HEIGHTS (part of the page-flow system above)
// BOTTOM_MARGIN is the blank space left between the last thing drawn on
// a page and the physical bottom edge of that page. "The last thing
// drawn" means the lowest INK of the last line (its descender), not
// the position where the NEXT line's baseline would land — a line's
// advance (its font size, or BODY_LINE_HEIGHT for body text) is
// spacing meant for whatever comes after it, and reserving it at the
// page bottom would silently add extra blank space on top of
// BOTTOM_MARGIN. Every space reservation passed to checkPageBreak() is
// therefore measured from the block's first baseline down to the ink
// bottom of its LAST line:
//   inkBottomHeight() — a whole block: its total advance height, with
//     the last line's advance swapped for that line's descender.
//   lineInkHeight()   — a single line: baseline -> descender.
// Descender depth uses the file's existing HELVETICA_DESCENT_RATIO.
// ====================================================================
function lineInkHeight(fontSize: number): number {
  return fontSize * HELVETICA_DESCENT_RATIO;
}

function inkBottomHeight(blockHeight: number, lastLineAdvance: number, lastLineFontSize: number): number {
  return blockHeight - lastLineAdvance + lineInkHeight(lastLineFontSize);
}

// ====================================================================
// AUTO-FIT-TO-ONE-PAGE (dynamic scale)
// If a resume overflows onto a second page by only a SMALL amount,
// shrink the bulk constants above (body/entry text sizes, section and
// entry spacing — every BASE_*/let pair converted above) slightly, in
// small steps, to try to bring it back onto one page. Never touches
// page margins, the header's own name/title/contact typography or
// photo, colors, or stroke widths — none of those were converted to
// BASE_*/let pairs above, so recomputeScaledConstants() below has no
// way to touch them. Never shrinks below AUTO_FIT_MIN_SCALE (85% of
// original size), and never attempts to shrink a resume that overflows
// by more than AUTO_FIT_MAX_OVERFLOW_PT or that is already 3+ pages —
// those render untouched, at full size, exactly as before.
// ====================================================================

// Recomputes every scalable BASE_*/let constant at the given scale,
// and every constant derived from one of them (BODY_LINE_HEIGHT and
// the four MM->PT conversions), in that order. SCALE_FACTOR itself is
// also updated so it always reflects whatever scale is currently
// applied. Called with 1 to reset back to full size.
function recomputeScaledConstants(scale: number): void {
  SCALE_FACTOR = scale;

  HEADING_SIZE = BASE_HEADING_SIZE * scale;
  BODY_SIZE = BASE_BODY_SIZE * scale;
  EXPERIENCE_TITLE_SIZE = BASE_EXPERIENCE_TITLE_SIZE * scale;
  EXPERIENCE_SUBTITLE_SIZE = BASE_EXPERIENCE_SUBTITLE_SIZE * scale;

  NAME_TO_TITLE_GAP = BASE_NAME_TO_TITLE_GAP * scale;
  TITLE_TO_CONTACT_GAP = BASE_TITLE_TO_CONTACT_GAP * scale;
  HEADER_RULE_GAP = BASE_HEADER_RULE_GAP * scale;
  SECTION_GAP = BASE_SECTION_GAP * scale;
  HEADING_TO_CONTENT_GAP = BASE_HEADING_TO_CONTENT_GAP * scale;
  ITEM_GAP = BASE_ITEM_GAP * scale;
  BULLET_GAP = BASE_BULLET_GAP * scale;

  DIVIDER_SIDE_GAP_MM = BASE_DIVIDER_SIDE_GAP_MM * scale;
  CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_MM = BASE_CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_MM * scale;
  BULLET_DOT_TO_TEXT_GAP_MM = BASE_BULLET_DOT_TO_TEXT_GAP_MM * scale;
  TITLE_TO_DATE_GAP_MM = BASE_TITLE_TO_DATE_GAP_MM * scale;

  EXPERIENCE_TITLE_TO_SUBTITLE_GAP = BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP * scale;
  EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP * scale;
  EXPERIENCE_ENTRY_GAP = BASE_EXPERIENCE_ENTRY_GAP * scale;

  // BODY_LINE_HEIGHT must be recomputed after BODY_SIZE, above.
  BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;

  // mm->pt conversions must be recomputed after their mm bases, above.
  DIVIDER_SIDE_GAP_PT = DIVIDER_SIDE_GAP_MM * MM_TO_PT;
  CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT = CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_MM * MM_TO_PT;
  BULLET_DOT_TO_TEXT_GAP_PT = BULLET_DOT_TO_TEXT_GAP_MM * MM_TO_PT;
  TITLE_TO_DATE_GAP_PT = TITLE_TO_DATE_GAP_MM * MM_TO_PT;
}

const AUTO_FIT_MIN_SCALE = 0.85;
const AUTO_FIT_MAX_OVERFLOW_PT = PAGE_USABLE_HEIGHT * 0.35;

// Public entry point. Renders once at full size; if that overflows to
// a second page by only a small amount, tries progressively smaller
// scales (largest first) until one fits on a single page, and returns
// the first (most readable) scale that works. Falls back to the
// full-size, untouched multi-page result if no scale down to
// AUTO_FIT_MIN_SCALE achieves one page, or if the resume is already
// genuinely multi-page. Always resets SCALE_FACTOR/every scaled
// constant back to 1 before returning, so back-to-back calls with
// different data never leak scale state into each other.
// ====================================================================
// TEXT SANITIZATION (WinAnsi-safety pass)
// ------------------------------------------------------------------
// ROOT CAUSE: jsPDF's standard/core fonts ("helvetica" etc.) can only
// encode characters present in WinAnsiEncoding (~= Windows-1252). Most
// "smart"/typographic punctuation that AI-generated text (e.g. from
// Groq) tends to produce — en dash, em dash, curly quotes, ellipsis,
// bullet, non-breaking space — IS actually part of WinAnsiEncoding and
// renders fine. But a few look-alike characters are NOT part of it,
// most notably U+2011 NON-BREAKING HYPHEN (visually identical to a
// normal hyphen, but a distinct code point). When jsPDF hits one of
// these unencodable characters mid-string, it cannot map it to a glyph
// and the line gets split into fragments with broken spacing/overflow
// — exactly the "gap inside a word" artifact this pass exists to
// prevent.
//
// FIX STRATEGY: rather than patching every individual doc.text() /
// splitTextToSize() call site (dozens of them across every section),
// this is applied ONCE, at the public entry point, to the entire
// incoming `data` object (deep-walked, since text lives at every
// nesting level: summary, experience bullets, education, skills,
// languages, achievements, certifications, projects). Every string
// field is normalized before any measurement or rendering happens, so
// wrapping/width calculations and the actual glyphs drawn always agree.
//
// sanitizeTextForPdf() first maps KNOWN look-alike/typographic
// characters to their closest plain-ASCII equivalent (covers non-
// breaking hyphen and other dash variants explicitly, plus curly
// quotes/ellipsis/nbsp/zero-width characters for extra robustness even
// though most of those already work). As a final safety net, any
// remaining character outside WinAnsi's effective safe range is
// dropped rather than left to break jsPDF's line layout again later.
// ====================================================================
function sanitizeTextForPdf(text: string): string {
  if (!text) return text;
  return text
    // Non-breaking hyphen + other dash/hyphen look-alikes -> plain "-"
    // (U+2011 non-breaking hyphen is the specific character that broke
    // rendering; the rest are normalized too for consistency/safety).
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
    // Curly single quotes / low-9 / reversed -> plain "'"
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    // Curly double quotes -> plain '"'
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Horizontal ellipsis -> three periods
    .replace(/\u2026/g, '...')
    // Non-breaking / narrow / thin / figure spaces -> plain space
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F]/g, ' ')
    // Zero-width characters / BOM -> removed entirely
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    // Final safety net: any other character jsPDF's core font can't
    // encode (WinAnsi is effectively Latin-1 plus a defined set of
    // 0x80-0x9F symbols, all of which are already normalized above) —
    // drop it rather than let it re-break line layout downstream.
    .replace(/[^\x00-\xFF]/g, '');
}

// Recursively walks any value (string / array / plain object) and
// returns a deep copy with every string sanitized via
// sanitizeTextForPdf(). Non-string primitives (numbers, booleans,
// null, undefined) and non-plain-object values (e.g. Date) pass
// through unchanged.
function deepSanitizeForPdf<T>(value: T): T {
  if (typeof value === 'string') {
    return sanitizeTextForPdf(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepSanitizeForPdf(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      result[key] = deepSanitizeForPdf((value as Record<string, unknown>)[key]);
    }
    return result as T;
  }
  return value;
}

// Public entry point. Renders once at full size; if that overflows to
// a second page by only a small amount, tries progressively smaller
// scales (largest first) until one fits on a single page, and returns
// the first (most readable) scale that works. Falls back to the
// full-size, untouched multi-page result if no scale down to
// AUTO_FIT_MIN_SCALE achieves one page, or if the resume is already
// genuinely multi-page. Always resets SCALE_FACTOR/every scaled
// constant back to 1 before returning, so back-to-back calls with
// different data never leak scale state into each other.
export function generateAcademicPDF(data: AcademicPdfData): jsPDF {
  // WinAnsi-safety pass — see sanitizeTextForPdf() above. Every string
  // field in `data` is normalized ONCE here, before any measurement or
  // rendering, so the rest of the file (unchanged below) never sees an
  // unencodable character like U+2011 again.
  const sanitizedData = deepSanitizeForPdf(data);

  recomputeScaledConstants(1);
  const fullScaleResult = renderAcademicPDFOnce(sanitizedData);

  const overflowsBySmallAmount =
    fullScaleResult.pageCount === 2 &&
    fullScaleResult.lastPageContentHeight <= AUTO_FIT_MAX_OVERFLOW_PT;

  if (!overflowsBySmallAmount) {
    recomputeScaledConstants(1);
    return fullScaleResult.doc;
  }

  const SCALE_STEP = 0.02;
  let bestFit: { doc: jsPDF; scale: number } | null = null;

  for (let scale = 1 - SCALE_STEP; scale >= AUTO_FIT_MIN_SCALE - 1e-9; scale -= SCALE_STEP) {
    recomputeScaledConstants(scale);
    const attempt = renderAcademicPDFOnce(sanitizedData);
    if (attempt.pageCount === 1) {
      bestFit = { doc: attempt.doc, scale };
      break;
    }
  }

  recomputeScaledConstants(1);
  return bestFit ? bestFit.doc : fullScaleResult.doc;
}
