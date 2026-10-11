/**
 * creativePdf.ts
 * ------------------------------------------------------------------
 * A two-column "Creative" resume PDF generator, built with jsPDF.
 *
 * DOUBLE-COLUMN CREATIVE UPDATE:
 *   This file was reshaped from a single-column layout into a
 *   double-column layout — a full-bleed dark sidebar (left column) plus
 *   a white body (right column) — to match the OLD double-column
 *   Creative PDF generator's own visual design (see "TWO-COLUMN LAYOUT"
 *   below for the exact column geometry, and the sidebar/body COLOR_*
 *   constants for its color palette). Every GAP, margin, and
 *   page-break calculation in this file is UNCHANGED from before this
 *   update and is unrelated to the OLD file's own spacing — only the
 *   column structure and colors were adopted from it.
 *
 *   Left column (sidebar): optional profile photo, Contact, Skills,
 *   Languages, Certifications.
 *   Right column (body): centered Name/Job Title header, Professional
 *   Summary, Experience, Education, Projects, Achievements.
 *
 * STATUS: PHASE 1 + PHASE 2 + PHASE 3 + PHASE 4 + PHASE 5 + PHASE 6 + PHASE 7 + PHASE 8 + PHASE 9
 *   (+ a global section-gap consistency pass — see
 *   "SECTION-GAP ARCHITECTURE" / topUpToLineHeight() below)
 *   (+ universal section-heading dividers — see
 *   "UNIVERSAL SECTION HEADING + DIVIDER" / renderSectionHeading() below.
 *   Every section heading (Contact, Summary, Experience, Education, Skills,
 *   Languages, Achievements, Certifications, Projects) is followed by a
 *   divider line before its content — colored/positioned per its own column.)
 *   (+ double-column layout — see "TWO-COLUMN LAYOUT" /
 *   "TWO-COLUMN PAGE SHARING" below.)
 *   - A4 page setup
 *   - Margins
 *   - Header (centered name, job title — right column only)
 *   - Contact (photo, email, phone, address, linkedin, github, portfolio —
 *     left/sidebar column, skipped entirely if empty)
 *   - Professional Summary (heading + wrapped paragraph, skipped if empty)
 *   - Experience (heading + entries: title, company/dates, description),
 *     skipped entirely if there are no usable entries
 *   - Education (heading + entries: degree, institution/year, grade),
 *     skipped entirely if there are no usable entries
 *   - Skills (heading + one bulleted line per skill, in the sidebar),
 *     skipped entirely if empty
 *   - Languages (heading + entries: language name, expanded proficiency
 *     label — sidebar), skipped entirely if there are no usable entries
 *   - Achievements (heading + entries: title, date, description — body),
 *     skipped entirely if there are no usable entries
 *   - Certifications (heading + entries: name, date, credentialId —
 *     sidebar), skipped entirely if there are no usable entries
 *   - Projects (heading + entries: name, tech, description, github —
 *     body), skipped entirely if there are no usable entries
 *
 * DEPENDENCY:
 *   This file requires the "jspdf" package.
 *   If it is not already installed, run:  npm install jspdf
 *
 * DESIGN RULE FOLLOWED IN THIS FILE:
 *   Every spacing/size value is a named constant below. Nothing is
 *   hardcoded inline. If you want to change spacing, change a
 *   constant here — you should never need to hunt through the
 *   rendering functions for a stray number. Column X/width geometry is
 *   likewise always derived from PAGE_WIDTH/RIGHT_MARGIN/MM_TO_PT —
 *   never a hardcoded coordinate (see "TWO-COLUMN LAYOUT" below).
 *
 * COLOR PALETTE SOURCE:
 *   Every COLOR_ and COLOR_SIDEBAR_ constant below is ported from the OLD
 *   double-column Creative PDF's own `creativeColors` palette (a dark
 *   sidebar / white body, monochrome design), used here as a DESIGN
 *   reference only. Every gap, position, margin, and page-break
 *   calculation in this file is unrelated to that OLD file and comes
 *   from this file's own pre-existing geometry, unchanged.
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
// Used for text-wrapping calculations. Still used by any single-column
// measurement that predates the two-column layout below; the two
// columns themselves use their own *_COLUMN_WIDTH constants instead.
const CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;

// Usable vertical space for content on a single page, after both
// margins. Used as the hard ceiling for any single "keep this block
// together" page-break reservation (see keepTogetherHeight() near
// checkPageBreak() below) so a reservation can never demand a fresh
// page that still wouldn't fit it.
const PAGE_USABLE_HEIGHT = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

// ====================================================================
// TWO-COLUMN LAYOUT (DOUBLE-COLUMN CREATIVE TEMPLATE)
// ------------------------------------------------------------------
// DESIGN SOURCE: the OLD Creative PDF generator (CreativePDFGenerator /
// creativeTheme in the old, class-based creativePdf.ts) — a full-bleed
// dark sidebar (left column) plus a white body (right column). This
// file reproduces that column STRUCTURE and its relationship to the
// page, derived from this file's own existing PAGE_WIDTH/LEFT_MARGIN/
// RIGHT_MARGIN constants (never a hardcoded X coordinate), while every
// GAP inside each column (SECTION_GAP, ITEM_GAP, EXPERIENCE_ENTRY_GAP,
// etc.) stays exactly what this file already declares above/below —
// none of those values are ported from the OLD file.
//
// Left column: full-bleed sidebar, from the page's left edge (x = 0)
// to LEFT_COLUMN_WIDTH — same 32%-of-page-width proportion the OLD
// design uses, computed from THIS file's own PAGE_WIDTH rather than a
// fixed pt value, so it stays correct if PAGE_WIDTH ever changes.
// Holds: Contact, Skills, Languages, Certifications.
//
// Right column: the remaining white body, from RIGHT_COLUMN_X (the
// sidebar's right edge plus a body inset) to this file's existing
// right page margin (PAGE_WIDTH - RIGHT_MARGIN) — i.e. the right
// column reuses this file's own RIGHT_MARGIN as its own outer margin,
// rather than inventing a second one. Holds: Name/Title header,
// Professional Summary, Experience, Education, Projects, Achievements.
// ====================================================================
const LEFT_COLUMN_WIDTH_RATIO = 0.32; // OLD design's sidebar proportion
const LEFT_COLUMN_WIDTH = PAGE_WIDTH * LEFT_COLUMN_WIDTH_RATIO;

// Inner text insets, in mm (OLD design's own sidebar/body padding),
// converted through this file's existing MM_TO_PT conversion further
// below — declared here as forward references resolved once MM_TO_PT
// itself is declared (see SIDEBAR/BODY *_PAD_X_PT just after it).
const SIDEBAR_PAD_X_MM = 7; // OLD design's sidebar inner padding
const BODY_PAD_X_MM = 10; // OLD design's body inner padding (sidebar -> body text gap)

// ====================================================================
// TYPOGRAPHY CONSTANTS (font sizes, in points)
// ====================================================================
const NAME_SIZE = 22;
const TITLE_SIZE = 13;

// Current auto-fit scale (1 = full size). Recomputed by
// recomputeScaledConstants() below; reset to 1 at the end of every
// generateCreativePDF() call so back-to-back calls never leak state.
let SCALE_FACTOR = 1;
const BASE_METADATA_SIZE = 9.5; // contact line (email / phone / location / links)
let METADATA_SIZE = BASE_METADATA_SIZE;

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
const NAME_TO_TITLE_GAP = 6;
const TITLE_TO_CONTACT_GAP = 10;
const HEADER_RULE_GAP = 12; // space above AND below the divider line under the header

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
const HEADING_TO_CONTENT_GAP = 8;
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

// Sidebar/body insets (see SIDEBAR_PAD_X_MM/BODY_PAD_X_MM declared with
// the rest of the two-column layout constants above), converted through
// MM_TO_PT — same convention as every other mm value in this file.
const SIDEBAR_PAD_X_PT = SIDEBAR_PAD_X_MM * MM_TO_PT;
const BODY_PAD_X_PT = BODY_PAD_X_MM * MM_TO_PT;

// Left column (sidebar) text geometry: inset by SIDEBAR_PAD_X_PT on
// both sides of the full-bleed LEFT_COLUMN_WIDTH sidebar declared above.
const LEFT_COLUMN_X = SIDEBAR_PAD_X_PT;
const LEFT_COLUMN_TEXT_WIDTH = LEFT_COLUMN_WIDTH - SIDEBAR_PAD_X_PT * 2;

// Right column (body) text geometry: starts BODY_PAD_X_PT past the
// sidebar's right edge, and extends to this file's own existing right
// page margin (PAGE_WIDTH - RIGHT_MARGIN) — the same outer margin the
// single-column layout already used, not a new one.
const RIGHT_COLUMN_X = LEFT_COLUMN_WIDTH + BODY_PAD_X_PT;
const RIGHT_COLUMN_WIDTH = PAGE_WIDTH - RIGHT_MARGIN - RIGHT_COLUMN_X;

// The exact whitespace required on EACH side of the divider (heading
// -> divider, and divider -> content), as real, visible, empty space —
// not a baseline-to-baseline distance. One constant, reused for both
// sides and for every section, so "heading->divider" and
// "divider->content" can never drift apart from each other.
const DIVIDER_SIDE_GAP_MM = 4; // requested: 2mm -> 4mm on each side
const BASE_DIVIDER_SIDE_GAP_PT = DIVIDER_SIDE_GAP_MM * MM_TO_PT; // 4mm, ≈ 11.3386pt
let DIVIDER_SIDE_GAP_PT = BASE_DIVIDER_SIDE_GAP_PT;

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

// --- Profile photo adjustment (requested tweak: 10mm up, +23px size) ---
// Two isolated, named adjustments to the sidebar profile photo's own
// DRAW geometry only — reusing this file's existing MM_TO_PT
// conversion, plus a new, equally explicit px->pt conversion (CSS px,
// 96px/inch) declared right here since this file otherwise only works
// in pt/mm. Neither constant is used anywhere except inside
// renderSidebarPhoto()'s own draw-size/draw-position math below — the
// CURSOR position renderSidebarPhoto() returns (and therefore the
// Contact heading and every section after it) is computed from the
// original HEADER_PHOTO_SIZE_PT/PHOTO_TO_TEXT_GAP_PT, completely
// unaffected by either adjustment.
const PT_PER_PX = 72 / 96;
const PROFILE_PHOTO_UPWARD_SHIFT_MM = 11;
const PROFILE_PHOTO_UPWARD_SHIFT_PT = PROFILE_PHOTO_UPWARD_SHIFT_MM * MM_TO_PT;
const PROFILE_PHOTO_SIZE_INCREASE_PX = 28;
const PROFILE_PHOTO_SIZE_INCREASE_PT = PROFILE_PHOTO_SIZE_INCREASE_PX * PT_PER_PX;

// --- Sidebar content: always-on downward shift ---
// The whole left sidebar content (photo + Contact + every sidebar
// section) starts this much lower, with or without a photo. Applied
// only to the sidebar's own start Y in renderCreativePDFOnce(); the
// photo, Contact and every later sidebar section derive from that Y, so
// no gap inside the sidebar changes. The name/title header and the body
// column are untouched. Mirrors SIDEBAR_CONTENT_DOWN_SHIFT in
// CreativeTemplate.tsx 1:1.
const SIDEBAR_CONTENT_DOWN_SHIFT_MM = 2;
const SIDEBAR_CONTENT_DOWN_SHIFT_PT = SIDEBAR_CONTENT_DOWN_SHIFT_MM * MM_TO_PT; // 2mm, ≈ 5.6693pt

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
const BASE_BULLET_DOT_TO_TEXT_GAP_PT = BULLET_DOT_TO_TEXT_GAP_MM * MM_TO_PT;
let BULLET_DOT_TO_TEXT_GAP_PT = BASE_BULLET_DOT_TO_TEXT_GAP_PT;

// --- Right-aligned date on a title/degree/achievement-name row
// (Experience, Education, Achievements) ---
// Horizontal gap reserved between the end of the wrapped title text
// and the start of its right-aligned date, expressed in mm and
// converted through the existing MM_TO_PT conversion — same
// convention as BULLET_DOT_TO_TEXT_GAP_MM/DIVIDER_SIDE_GAP_PT above —
// so no raw pt magic number is introduced.
const TITLE_TO_DATE_GAP_MM = 3;
const BASE_TITLE_TO_DATE_GAP_PT = TITLE_TO_DATE_GAP_MM * MM_TO_PT;
let TITLE_TO_DATE_GAP_PT = BASE_TITLE_TO_DATE_GAP_PT;

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
// DESIGN SOURCE (this phase): every COLOR_* value below is now ported
// from the OLD double-column Creative PDF's `creativeColors` palette
// (dark sidebar / white body, monochrome) instead of the earlier
// minimalPdf.ts reference — per this phase's explicit instruction to
// treat that OLD double-column file as the A-to-Z color/design source.
// Only the RGB values changed; which named constant governs which
// piece of text is unchanged.
const COLOR_NAME = [26, 26, 26] as const; // OLD creativeColors.primary (right-column name)
const COLOR_TITLE = [60, 60, 60] as const; // OLD's explicit job-title gray (renderRightColumn's title color)
const COLOR_METADATA = [53, 56, 63] as const; // COLOR-ONLY UPDATE: final target is 30% darker toward black than the original color ([75, 80, 90] × 0.70) — replaces the earlier 20% pass (× 0.80) so this is derived from the original, not compounded on top of it — every use of this constant (Experience Company Name, Experience/Education Date, Education University Name, Education Grade, Project Technology) is in the requested darkening scope, so the shared constant itself was darkened rather than duplicated.
const COLOR_RULE = [26, 26, 26] as const; // OLD creativeColors.divider

// Universal section-heading divider color (right column / body
// sections only — see COLOR_SIDEBAR_DIVIDER below for the sidebar's
// own, distinct divider color). Declared separately from COLOR_RULE
// for the same reason SECTION_DIVIDER_THICKNESS is declared separately
// from HEADER_RULE_THICKNESS above.
const COLOR_SECTION_DIVIDER = [26, 26, 26] as const; // OLD creativeColors.divider

// --- Sidebar (left column) palette — DESIGN SOURCE: OLD's
// `creativeColors`/sidebar-only tones (secondary, border, and the
// sidebar-specific grays declared alongside creativeColors: white,
// sidebarValue, sidebarBody, sidebarMuted). Used only by the sidebar
// sections (Contact, Skills, Languages, Certifications) — the right
// column never references these. ---
const COLOR_SIDEBAR_BG = [22, 22, 22] as const; // OLD creativeColors.secondary — sidebar background
const COLOR_SIDEBAR_HEADING = [255, 255, 255] as const; // OLD's white sidebar heading text
const COLOR_SIDEBAR_DIVIDER = [58, 58, 58] as const; // OLD creativeColors.border — sidebar heading divider
const COLOR_SIDEBAR_TEXT = [255, 255, 255] as const; // OLD's white — contact labels, skill/language/cert names
const COLOR_SIDEBAR_VALUE = [209, 213, 219] as const; // OLD's sidebarValue (gray-300) — contact values
const COLOR_SIDEBAR_BODY = [229, 231, 235] as const; // OLD's sidebarBody (gray-200) — skills list text
const COLOR_SIDEBAR_MUTED = [156, 163, 175] as const; // OLD's sidebarMuted (gray-400) — proficiency/date/issuer/credential

// Entry titles (job title, degree, language name, achievement title,
// certification name, project name) — OLD theme's `text`.
const COLOR_HEADING = [31, 41, 55] as const; // OLD creativeColors.text (gray-800) — entry titles in the right column

// COLOR-ONLY UPDATE: 30%-darker-toward-black copy of COLOR_HEADING,
// computed from the ORIGINAL COLOR_HEADING value (superseding the
// earlier 24% pass), used ONLY by the Achievement Date (see
// renderAchievementTitleRowWithDate()). Declared as its own constant,
// rather than darkening COLOR_HEADING itself, because COLOR_HEADING is
// also shared by the Achievement Title, the Experience/Education title
// row, and the Project Name — none of which were requested to change.
const COLOR_ACHIEVEMENT_DATE = [15, 20, 27] as const; // COLOR-ONLY UPDATE: final target is 30% darker toward black than the original color ([22, 29, 39] × 0.70) — replaces the earlier 20% pass (× 0.80) so this is derived from the original, not compounded on top of it

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
// DOUBLE-COLUMN CREATIVE UPDATE: this file's earlier "purple" override
// (a leftover identity marker from when this file was a clone of a
// different, single-column minimalPdf.ts) is now replaced with the
// double-column OLD Creative PDF's own body-heading color
// (creativeColors.primary) — this phase's OLD design reference draws
// every right-column section heading in this near-black tone, not
// purple. Only the COLOR value changes; renderSectionHeading()'s font
// size, weight, position, and divider logic are untouched. (Sidebar
// section headings use their own COLOR_SIDEBAR_HEADING, declared above.)
const COLOR_SECTION_HEADING = [26, 26, 26] as const; // OLD creativeColors.primary (right-column headings)
const COLOR_BODY = [39, 46, 57] as const; // COLOR-ONLY UPDATE: final target is 30% darker toward black than the original color ([55, 65, 81] × 0.70) — replaces the earlier 20% pass (× 0.80) so this is derived from the original, not compounded on top of it — used by Professional Summary body, Experience/Project description bullets, and Achievement bullet descriptions

// GitHub link text (Projects section only) — OLD theme's `link`, kept
// as its own constant (rather than folded into COLOR_METADATA) because
// OLD deliberately renders links in a distinct, more prominent tone
// than ordinary metadata.
const COLOR_LINK = [31, 41, 55] as const; // OLD creativeColors.link (gray-800)

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
  address?: string;
  streetAddress?: string; // fallback for `address`, same as the other templates
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
//   - grade: string  (optional, e.g. "3.8/4.0" — rendered with a
//                      "Grade:" label prefix, matching the Classic
//                      template's education section)
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
// The divider itself is drawn at full column width (the calling
// section's own x to x+width — see the `column` parameter below),
// using SECTION_DIVIDER_THICKNESS / a column-appropriate divider color
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
// `column` selects WHICH column this heading belongs to — 'right' (the
// default, unchanged behavior) for the white body, or 'left' for the
// dark sidebar. Only the heading/divider X position, width, and colors
// differ per column (matching the OLD double-column design's own
// distinct sidebar-heading vs. body-heading styles: white bold label +
// thin muted border in the sidebar, dark bold label + a bolder dark
// rule in the body) — the heading->divider->content SPACING geometry
// (DIVIDER_SIDE_GAP_PT, SECTION_DIVIDER_THICKNESS,
// sectionHeadingToContentOffset()) is identical for both columns, since
// this file's own existing gap architecture — not the OLD file's — is
// the source of truth for spacing.
function renderSectionHeading(
  doc: jsPDF,
  headingText: string,
  startY: number,
  firstContentFontSize: number,
  column: 'left' | 'right' = 'right'
): number {
  const x = column === 'left' ? LEFT_COLUMN_X : RIGHT_COLUMN_X;
  const width = column === 'left' ? LEFT_COLUMN_TEXT_WIDTH : RIGHT_COLUMN_WIDTH;
  // Explicitly typed as a fixed-length tuple (rather than left to
  // infer as `readonly number[]`) so the spread into
  // doc.setTextColor(...) below type-checks the same way every other
  // COLOR_* spread call in this file already does.
  const headingColor: readonly [number, number, number] = column === 'left' ? COLOR_SIDEBAR_HEADING : COLOR_SECTION_HEADING;
  const dividerColor: readonly [number, number, number] = column === 'left' ? COLOR_SIDEBAR_DIVIDER : COLOR_SECTION_DIVIDER;

  // --- Heading text (baseline at startY, unchanged) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(HEADING_SIZE);
  doc.setTextColor(...headingColor);
  doc.text(headingText, x, startY);

  // --- Divider (heading -> divider -> content, per the geometry
  // guarantee documented above). Drawn at its CENTER Y, exactly
  // DIVIDER_SIDE_GAP_PT (DIVIDER_SIDE_GAP_MM mm) below the heading's own ink-bottom, at
  // the full width of THIS heading's own column. Color/thickness come
  // from the same two constants used in every distance calculation
  // above, so the drawn line and the reserved whitespace can never
  // disagree. ---
  const headingInkBottomY = startY; // ALL-CAPS heading, no descender ink — see note above
  const dividerTopEdgeY = headingInkBottomY + DIVIDER_SIDE_GAP_PT;
  const dividerCenterY = dividerTopEdgeY + SECTION_DIVIDER_THICKNESS / 2;

  doc.setDrawColor(...dividerColor);
  doc.setLineWidth(SECTION_DIVIDER_THICKNESS);
  doc.line(x, dividerCenterY, x + width, dividerCenterY);

  // --- Content baseline, placed so the content's own ink-top sits
  // exactly DIVIDER_SIDE_GAP_PT (DIVIDER_SIDE_GAP_MM mm) below the divider's bottom edge ---
  return startY + sectionHeadingToContentOffset(firstContentFontSize);
}

// ====================================================================
// AUTO-FIT-TO-ONE-PAGE: SCALED-CONSTANT RECOMPUTATION
// ------------------------------------------------------------------
// Recomputes every BASE_*-derived constant above at the given scale.
// Called with 1 for a normal, full-size render; called with a smaller
// scale (down to AUTO_FIT_MIN_SCALE) by generateCreativePDF()'s
// auto-fit driver below when a resume overflows onto a second page by
// only a small amount. Never touches page margins, the header's own
// name/title typography, the profile photo, colors, or any hairline
// stroke width (divider/rule thickness) — none of those are BASE_*
// constants.
// ====================================================================
function recomputeScaledConstants(scale: number): void {
  SCALE_FACTOR = scale;

  HEADING_SIZE = BASE_HEADING_SIZE * scale;
  BODY_SIZE = BASE_BODY_SIZE * scale;
  EXPERIENCE_TITLE_SIZE = BASE_EXPERIENCE_TITLE_SIZE * scale;
  EXPERIENCE_SUBTITLE_SIZE = BASE_EXPERIENCE_SUBTITLE_SIZE * scale;
  METADATA_SIZE = BASE_METADATA_SIZE * scale;

  SECTION_GAP = BASE_SECTION_GAP * scale;
  ITEM_GAP = BASE_ITEM_GAP * scale;
  BULLET_GAP = BASE_BULLET_GAP * scale;
  EXPERIENCE_TITLE_TO_SUBTITLE_GAP = BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP * scale;
  EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP * scale;
  EXPERIENCE_ENTRY_GAP = BASE_EXPERIENCE_ENTRY_GAP * scale;
  BULLET_DOT_TO_TEXT_GAP_PT = BASE_BULLET_DOT_TO_TEXT_GAP_PT * scale;
  TITLE_TO_DATE_GAP_PT = BASE_TITLE_TO_DATE_GAP_PT * scale;
  DIVIDER_SIDE_GAP_PT = BASE_DIVIDER_SIDE_GAP_PT * scale;

  // Derived from BODY_SIZE — must be recomputed AFTER BODY_SIZE above.
  BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;
}

// ====================================================================
// ENTRY POINT
// ====================================================================
// Renders the full two-column document once, at whatever scale
// recomputeScaledConstants() last set, and returns it along with the
// page count and how much content ended up on the actual LAST page.
// Used both for the normal full-size render and, by the auto-fit
// driver below, for each trial render at a reduced scale.
//
// TWO-COLUMN NOTE: left and right columns are independent render
// passes that share the same physical pages (see TWO-COLUMN PAGE
// SHARING above), so either one (or both) can be the column that
// spills onto the final page. lastPageContentHeight is the larger of
// the two columns' own content height on that final page — that's
// the amount auto-fit actually needs to compact back onto page 1.
function renderCreativePDFOnce(data: CreativePdfData): { doc: jsPDF; pageCount: number; lastPageContentHeight: number } {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  // Reset the module-level page-sharing state for this document (see
  // TWO-COLUMN PAGE SHARING above) — generateCreativePDF() can be
  // called more than once (e.g. re-downloading), and each call must
  // start from a clean page count.
  creativeReservedPages = 1;
  paintPageBackground(doc);

  // --- LEFT COLUMN (sidebar): Contact, Skills, Languages,
  // Certifications — rendered first, in full, so however many pages it
  // ends up needing are reserved before the right column starts. ---
  let leftY = TOP_MARGIN + SIDEBAR_CONTENT_DOWN_SHIFT_PT;
  leftY = addContact(doc, data, leftY);
  leftY = addSkills(doc, data, leftY);
  leftY = addLanguages(doc, data, leftY);
  leftY = addCertifications(doc, data, leftY);
  const leftEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

  // The left column may have overflowed onto later pages of its own —
  // remember how many pages it reserved, then bring the cursor back to
  // page 1 so the right column starts there and reuses those same
  // pages as it goes (see goToNextCreativePage() above).
  creativeReservedPages = doc.getNumberOfPages();
  doc.setPage(1);

  // --- RIGHT COLUMN (body): Name/Title header, Professional Summary,
  // Experience, Education, Projects, Achievements. ---
  let rightY = TOP_MARGIN;
  rightY = addHeader(doc, data, rightY);
  rightY = addSummary(doc, data, rightY);
  rightY = addExperience(doc, data, rightY);
  rightY = addEducation(doc, data, rightY);
  rightY = addProjects(doc, data, rightY);
  rightY = addAchievements(doc, data, rightY);
  const rightEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

  const pageCount = doc.getNumberOfPages();

  // A column that ended on an earlier page contributes 0 — nothing of
  // its own spilled onto the actual last page.
  const leftLastPageHeight = leftEndPage === pageCount ? leftY - TOP_MARGIN : 0;
  const rightLastPageHeight = rightEndPage === pageCount ? rightY - TOP_MARGIN : 0;
  const lastPageContentHeight = Math.max(leftLastPageHeight, rightLastPageHeight);

  return { doc, pageCount, lastPageContentHeight };
}

// A resume that overflows onto a second page by only a SMALL amount is
// automatically shrunk (text/spacing scaled down together, never below
// AUTO_FIT_MIN_SCALE) so it fits back onto one page. Page margins, the
// header's own typography/photo, colors, and hairline stroke widths
// are never touched (see recomputeScaledConstants() above — none of
// those are BASE_* constants). A resume that's genuinely too long (3+
// pages, or overflows by more than AUTO_FIT_MAX_OVERFLOW_PT) is never
// force-shrunk — it renders untouched at full size.
const AUTO_FIT_MIN_SCALE = 0.85;
const AUTO_FIT_MAX_OVERFLOW_PT = PAGE_USABLE_HEIGHT * 0.35;

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

export function generateCreativePDF(data: CreativePdfData): jsPDF {
  // WinAnsi-safety pass — see sanitizeTextForPdf() above. Every string
  // field in `data` is normalized ONCE here, before any measurement or
  // rendering, so the rest of the file (unchanged below) never sees an
  // unencodable character like U+2011 again.
  const sanitizedData = deepSanitizeForPdf(data);

  recomputeScaledConstants(1);
  const fullScaleResult = renderCreativePDFOnce(sanitizedData);

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
    const attempt = renderCreativePDFOnce(sanitizedData);
    if (attempt.pageCount === 1) {
      bestFit = { doc: attempt.doc, scale };
      break;
    }
  }

  // Reset scaled constants back to 1 before returning — whichever
  // result is returned — so back-to-back calls with different data
  // never leak scale state into each other.
  recomputeScaledConstants(1);
  return bestFit ? bestFit.doc : fullScaleResult.doc;
}

// ====================================================================
// HEADER SECTION (right column) — DOUBLE-COLUMN CREATIVE UPDATE
// ------------------------------------------------------------------
// DESIGN SOURCE: the OLD double-column Creative PDF's renderRightColumn()
// header — centered, bold, uppercase Name + normal-weight uppercase
// Job Title at the top of the white body (right column). The profile
// photo and every contact detail move to the sidebar's Contact section
// below (addContact()), matching the OLD design's own column
// assignment: photo + contact info live in the dark sidebar, not the
// body header.
//
// Renders: name (bold, uppercase, centered) + job title (optional,
// centered, below it). No contact line and no divider — the OLD design
// draws neither under its body header; the next section (Professional
// Summary) simply follows after this file's own SECTION_GAP, exactly
// like any other section transition.
//
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addHeader(doc: jsPDF, data: CreativePdfData, startY: number): number {
  let y = startY;
  const { personalInfo } = data;

  const name = ((personalInfo?.name || '').trim() || 'Your Name').toUpperCase();
  const jobTitle = (personalInfo?.title || personalInfo?.jobTitle || '').trim().toUpperCase();
  const centerX = RIGHT_COLUMN_X + RIGHT_COLUMN_WIDTH / 2;

  // --- Name (bold, centered — OLD design's own header typography) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(NAME_SIZE);
  doc.setTextColor(...COLOR_NAME);
  const nameLines: string[] = doc.splitTextToSize(name, RIGHT_COLUMN_WIDTH);
  for (const line of nameLines) {
    doc.text(line, centerX, y, { align: 'center', charSpace: 1.2 } as any);
    y += NAME_SIZE;
  }
  y += NAME_TO_TITLE_GAP;

  // --- Job title (optional, centered, below the name) ---
  let lastLineFontSize = NAME_SIZE;
  if (jobTitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(TITLE_SIZE);
    doc.setTextColor(...COLOR_TITLE);
    const titleLines: string[] = doc.splitTextToSize(jobTitle, RIGHT_COLUMN_WIDTH);
    for (const line of titleLines) {
      doc.text(line, centerX, y, { align: 'center', charSpace: 0.8 } as any);
      y += TITLE_SIZE;
    }
    lastLineFontSize = TITLE_SIZE;
  }

  // Normalize the header's ending Y to a body-line-equivalent trailing
  // space — same topUpToLineHeight() convention every other
  // metadata-ending section/entry in this file already uses — so
  // SECTION_GAP (applied by addSummary()/addExperience()/whichever
  // section follows) measures the same visual distance here as it does
  // after any other section.
  return topUpToLineHeight(y, lastLineFontSize);
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

// ====================================================================
// SIDEBAR PROFILE PHOTO
// ------------------------------------------------------------------
// DESIGN SOURCE: the OLD design's sidebar photo — a plain circle,
// horizontally centered on the FULL sidebar width (not the inset text
// width — matching the OLD file's own centering math), at the very top
// of the left column. Geometry (diameter, "cover" aspect-preserving
// fit, circular clip) reuses this file's own existing
// HEADER_PHOTO_SIZE_PT/PHOTO_TO_TEXT_GAP_PT constants and clipping
// approach (previously used inside the single-column header) — only
// WHERE it is drawn (centered in the sidebar, not beside the name)
// changes, per the OLD design's own column assignment.
//
// PHOTO-ONLY ADJUSTMENT: the photo's DRAWN circle is shifted
// PROFILE_PHOTO_UPWARD_SHIFT_PT upward and enlarged by
// PROFILE_PHOTO_SIZE_INCREASE_PT (both declared above, alongside
// HEADER_PHOTO_SIZE_PT), using `renderedPhotoSize`/`photoDrawTopY`
// below in place of HEADER_PHOTO_SIZE_PT/`y` wherever this function
// decides WHAT TO DRAW and WHERE. The CURSOR math at the very end of
// this function (the only thing any caller — addContact() — actually
// uses to position the Contact heading and everything after it) still
// advances by the ORIGINAL HEADER_PHOTO_SIZE_PT + PHOTO_TO_TEXT_GAP_PT,
// exactly as before this adjustment, so moving/enlarging the photo
// cannot move anything else in the sidebar or body.
// Returns the new Y position for whatever gets rendered next in the
// sidebar (the Contact heading).
// ====================================================================
function renderSidebarPhoto(doc: jsPDF, photo: string, startY: number): number {
  let y = startY;
  try {
    const photoSource = photo.trim();

    // Rendered diameter for THIS drawn circle only — original size
    // plus the isolated size adjustment. Used for every draw-geometry
    // calculation below; never for the cursor advance at the end.
    const renderedPhotoSize = HEADER_PHOTO_SIZE_PT + PROFILE_PHOTO_SIZE_INCREASE_PT;
    // Draw-position top edge — original top-of-sidebar Y, shifted up
    // by the isolated upward adjustment. `y` (the cursor) itself is
    // never reassigned here.
    const photoDrawTopY = y - PROFILE_PHOTO_UPWARD_SHIFT_PT;

    const photoX = (LEFT_COLUMN_WIDTH - renderedPhotoSize) / 2;
    const photoRadius = renderedPhotoSize / 2;
    const photoCenterX = photoX + photoRadius;
    const photoCenterY = photoDrawTopY + photoRadius;

    const imgProps = doc.getImageProperties(photoSource);
    const imgAspect = imgProps.width / imgProps.height;
    const drawWidth = imgAspect >= 1 ? renderedPhotoSize * imgAspect : renderedPhotoSize;
    const drawHeight = imgAspect >= 1 ? renderedPhotoSize : renderedPhotoSize / imgAspect;
    const drawX = photoX - (drawWidth - renderedPhotoSize) / 2;
    const drawY = photoDrawTopY - (drawHeight - renderedPhotoSize) / 2;

    doc.saveGraphicsState();
    // `null` (not omitted) is required: jsPDF's default path-paint
    // operation is 'S' (stroke) in pt mode, so an omitted style would
    // stroke a visible circle before clip() below ever runs. Passing
    // null suppresses ALL painting for this path — it exists purely as
    // the clip boundary for clip()/discardPath() immediately after.
    doc.circle(photoCenterX, photoCenterY, photoRadius, null);
    doc.clip();
    doc.discardPath();
    doc.addImage(photoSource, getImageFormatFromDataUrl(photoSource), drawX, drawY, drawWidth, drawHeight);
    doc.restoreGraphicsState();

    // Cursor advances by the ORIGINAL photo size + existing gap —
    // deliberately untouched by either adjustment above — so the
    // Contact heading (and everything after it) stays exactly where
    // it already was.
    y += HEADER_PHOTO_SIZE_PT + PHOTO_TO_TEXT_GAP_PT;
  } catch (_) {
    // Unusable image data — skip the photo rather than breaking the
    // rest of the sidebar.
  }
  return y;
}

// Labels for the sidebar's contact fields (same labels as
// CreativeTemplate.tsx). Address and Location are separate fields.
const CONTACT_LABELS = {
  email: 'Email:',
  phone: 'Phone:',
  address: 'Address:',
  location: 'Location:',
  linkedin: 'LinkedIn:',
  github: 'GitHub:',
  website: 'Portfolio:',
} as const;

// Builds the list of non-empty contact fields, each as its own
// {label, value} pair — same field selection, order, and fallbacks
// (email, phone with dial prefix, location/city, linkedin, github,
// website/portfolio) this file's single-column header previously used,
// just structured for the sidebar's own labeled/stacked field layout
// (see addContact() below) instead of a single "|"-joined line.
function buildContactFields(
  personalInfo: CreativePdfPersonalInfo,
  phoneNumber: string,
  selectedCountryCode: string
): Array<{ label: string; value: string }> {
  const fields: Array<{ label: string; value: string }> = [];

  if (personalInfo?.email) {
    fields.push({ label: CONTACT_LABELS.email, value: personalInfo.email.trim() });
  }

  if (phoneNumber) {
    const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
    fields.push({ label: CONTACT_LABELS.phone, value: `${dialPrefix}${phoneNumber}`.trim() });
  }

  const address = personalInfo?.address || personalInfo?.streetAddress;
  if (address) {
    fields.push({ label: CONTACT_LABELS.address, value: address.trim() });
  }

  const location = personalInfo?.location || personalInfo?.city;
  if (location) {
    fields.push({ label: CONTACT_LABELS.location, value: location.trim() });
  }

  if (personalInfo?.linkedin) {
    fields.push({ label: CONTACT_LABELS.linkedin, value: personalInfo.linkedin.trim() });
  }

  if (personalInfo?.github) {
    fields.push({ label: CONTACT_LABELS.github, value: personalInfo.github.trim() });
  }

  const webLink = personalInfo?.website || personalInfo?.portfolio;
  if (webLink) {
    fields.push({ label: CONTACT_LABELS.website, value: webLink.trim() });
  }

  return fields;
}

// ====================================================================
// CONTACT SECTION (sidebar / left column)
// ------------------------------------------------------------------
// DESIGN SOURCE: the OLD design's sidebar Contact block — the optional
// circular photo, then a "CONTACT" heading, then each present field as
// a bold white label line followed by a lighter value line/lines.
// Reuses this file's OWN existing gap constants for the field-to-field
// and label-to-value spacing (ITEM_GAP, BULLET_GAP — both already
// declared above and previously reserved/unused) rather than any OLD
// spacing value, and this file's own renderSectionHeading()/
// checkPageBreak()/topUpToLineHeight() architecture for the heading,
// pagination, and trailing-space normalization — the same machinery
// every other section in this file already uses.
//
// If there is no photo and no contact fields at all, this renders
// nothing and returns startY unchanged (same "skip entirely" rule
// every other section in this file follows).
// Returns the new Y position for whatever gets rendered next in the
// sidebar (Skills).
// ====================================================================
function addContact(doc: jsPDF, data: CreativePdfData, startY: number): number {
  const { personalInfo, phoneNumber, selectedCountryCode } = data;
  let y = startY;

  if (isValidPhotoSource(personalInfo?.photo)) {
    y = renderSidebarPhoto(doc, personalInfo.photo as string, y);
  }

  const fields = buildContactFields(personalInfo, phoneNumber, selectedCountryCode);
  if (fields.length === 0) {
    return y;
  }

  // Room for the heading plus the FULL first field (label + every
  // wrapped value line, kept together) — not just one value line.
  // Computed with the exact same formula the fields.forEach() loop
  // below uses for its own keep-together check, so the two can never
  // disagree. (Previously this only reserved one value line, which
  // under-counted a field whose value wraps to 2+ lines and let the
  // loop's own check push the whole field to the next page — orphaning
  // the heading alone at the bottom of this one.)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(METADATA_SIZE);
  const firstFieldValueLines: string[] = doc.splitTextToSize(fields[0].value, LEFT_COLUMN_TEXT_WIDTH);
  const firstFieldHeightRaw = METADATA_SIZE + BULLET_GAP + firstFieldValueLines.length * METADATA_SIZE;
  const firstFieldHeightInk = inkBottomHeight(firstFieldHeightRaw, METADATA_SIZE, METADATA_SIZE);
  const firstFieldHeight = keepTogetherHeight(firstFieldHeightInk, firstFieldHeightInk);
  const headingSpaceNeeded = sectionHeadingToContentOffset(METADATA_SIZE) + firstFieldHeight;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (sidebar column — see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'CONTACT', y, METADATA_SIZE, 'left');

  fields.forEach((field, index) => {
    if (index > 0) {
      y += ITEM_GAP;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(METADATA_SIZE);
    const valueLines: string[] = doc.splitTextToSize(field.value, LEFT_COLUMN_TEXT_WIDTH);
    const fieldHeightRaw = METADATA_SIZE + BULLET_GAP + valueLines.length * METADATA_SIZE;
    const fieldHeightInk = inkBottomHeight(fieldHeightRaw, METADATA_SIZE, METADATA_SIZE);
    const fieldHeight = keepTogetherHeight(fieldHeightInk, fieldHeightInk);
    y = checkPageBreak(doc, y, fieldHeight);

    // --- Label (bold, white) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(METADATA_SIZE);
    doc.setTextColor(...COLOR_SIDEBAR_TEXT);
    doc.text(field.label, LEFT_COLUMN_X, y);
    y += METADATA_SIZE + BULLET_GAP;

    // --- Value (normal, lighter — may wrap onto multiple lines) ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(METADATA_SIZE);
    doc.setTextColor(...COLOR_SIDEBAR_VALUE);
    for (const line of valueLines) {
      y = checkPageBreak(doc, y, lineInkHeight(METADATA_SIZE));
      doc.text(line, LEFT_COLUMN_X, y);
      y += METADATA_SIZE;
    }
  });

  return topUpToLineHeight(y, METADATA_SIZE);
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
  const wrappedLines: string[] = doc.splitTextToSize(summaryText, RIGHT_COLUMN_WIDTH);

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
    doc.text(line, RIGHT_COLUMN_X, y);
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

  // Make sure there's room for the heading plus the FULL first entry's
  // keep-together block (title/date row + company + at least the first
  // description line) — not just the title's own first line. Computed
  // with the exact same formula addExperienceEntry() uses for its own
  // keep-together check, so the two can never disagree. (Previously
  // this only reserved one line, which under-counted an entry with a
  // company line or description and let addExperienceEntry()'s own
  // check push the whole entry to the next page — orphaning the
  // heading alone at the bottom of this one.)
  const firstExp = experiences[0];
  const firstExpTitle = (firstExp.title || '').trim();
  const firstExpCompany = (firstExp.company || '').trim();
  const firstExpStartDate = (firstExp.startDate || '').trim();
  const firstExpEndDate = (firstExp.endDate || '').trim();
  const firstExpDescription = (firstExp.description || '').trim();
  const firstExpDateRange = [firstExpStartDate, firstExpEndDate].filter(Boolean).join(' – ');
  const firstExpDescriptionLines: string[] = buildBulletedDescriptionItems(doc, firstExpDescription)
    .flatMap((item) => item.lines);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const firstExpDateWidth = firstExpDateRange ? doc.getTextWidth(firstExpDateRange) : 0;
  const firstExpTitleWrapWidth = firstExpDateRange
    ? Math.max(0, RIGHT_COLUMN_WIDTH - firstExpDateWidth - TITLE_TO_DATE_GAP_PT)
    : RIGHT_COLUMN_WIDTH;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const firstExpTitleLineCount = firstExpTitle ? doc.splitTextToSize(firstExpTitle, firstExpTitleWrapWidth).length : 0;
  const firstExpTitleRowHeight = firstExpTitleLineCount > 0
    ? firstExpTitleLineCount * EXPERIENCE_TITLE_SIZE
    : (firstExpDateRange ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const firstExpHasTitleRow = Boolean(firstExpTitle || firstExpDateRange);
  const firstExpTitleToCompanyGap = firstExpHasTitleRow && firstExpCompany ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;
  const firstExpHeaderHeight = firstExpTitleRowHeight + firstExpTitleToCompanyGap + (firstExpCompany ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const firstExpHasHeaderLine = firstExpHasTitleRow || Boolean(firstExpCompany);
  const firstExpDescriptionGap = firstExpHasHeaderLine && firstExpDescriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstExpFirstDescriptionLineHeight = firstExpDescriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const firstExpHasDescription = firstExpDescriptionLines.length > 0;
  const firstExpLastLineFontSize = firstExpHasDescription ? BODY_SIZE : (firstExpCompany ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE);
  const firstExpLastLineAdvance = firstExpHasDescription ? BODY_LINE_HEIGHT : firstExpLastLineFontSize;
  const firstExpRawSpace = firstExpHeaderHeight + firstExpDescriptionGap + firstExpFirstDescriptionLineHeight;
  const firstExpEntryHeight = keepTogetherHeight(
    inkBottomHeight(firstExpRawSpace, firstExpLastLineAdvance, firstExpLastLineFontSize),
    firstExpHasDescription
      ? inkBottomHeight(firstExpHeaderHeight + firstExpDescriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(firstExpHeaderHeight, firstExpLastLineAdvance, firstExpLastLineFontSize)
  );
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstExpEntryHeight;
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
  // preserved — each typed line becomes one bullet item (see
  // buildBulletedDescriptionItems()/renderBulletedDescriptionLines()
  // above), matching the CV builder's own form/preview where each line
  // is already shown as one point.
  const descriptionItems = buildBulletedDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

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
    ? Math.max(0, RIGHT_COLUMN_WIDTH - dateWidthForEstimate - TITLE_TO_DATE_GAP_PT)
    : RIGHT_COLUMN_WIDTH;
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
  const hasDescription = descriptionLines.length > 0;
  const lastLineFontSizeForEntry = hasDescription ? BODY_SIZE : (company ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE);
  const lastLineAdvanceForEntry = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSizeForEntry;
  const rawMinimumEntrySpaceNeeded = headerHeight + descriptionGap + firstDescriptionLineHeight;
  const minimumEntrySpaceNeeded = keepTogetherHeight(
    inkBottomHeight(rawMinimumEntrySpaceNeeded, lastLineAdvanceForEntry, lastLineFontSizeForEntry),
    hasDescription
      ? inkBottomHeight(headerHeight + descriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(headerHeight, lastLineAdvanceForEntry, lastLineFontSizeForEntry)
  );
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
    doc.text(company, RIGHT_COLUMN_X, y);
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
  // buildBulletedDescriptionItems()/renderBulletedDescriptionLines() above) ---
  if (descriptionLines.length > 0) {
    y = renderBulletedDescriptionLines(doc, descriptionItems, y);
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
function addEducation(doc: jsPDF, data: CreativePdfData, startY: number): number {
  const educations = (data.educations || []).filter(hasUsableEducationContent);

  if (educations.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — same relationship
  // as "previous section -> Experience heading", so the same constant.
  y += SECTION_GAP;

  // Room for the heading plus the FULL first entry (degree/date row +
  // institution + grade, kept together) — not just the degree's own
  // first line. Computed with the exact same formula addEducationEntry()
  // uses for its own keep-together check, so the two can never disagree.
  // (Previously this only reserved one line, which under-counted an
  // entry with an institution or grade line and let addEducationEntry()'s
  // own check push the whole entry to the next page — orphaning the
  // heading alone at the bottom of this one.)
  const firstEdu = educations[0];
  const firstEduDegree = (firstEdu.degree || '').trim();
  const firstEduInstitution = (firstEdu.institution || '').trim();
  const firstEduYear = (firstEdu.year || '').trim();
  const firstEduGrade = (firstEdu.grade || '').trim();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const firstEduInstitutionLines: string[] = firstEduInstitution ? doc.splitTextToSize(firstEduInstitution, RIGHT_COLUMN_WIDTH) : [];
  const firstEduGradeLines: string[] = firstEduGrade ? doc.splitTextToSize(`Grade: ${firstEduGrade}`, RIGHT_COLUMN_WIDTH) : [];
  const firstEduInstitutionHeight = firstEduInstitutionLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const firstEduDateWidth = firstEduYear ? doc.getTextWidth(firstEduYear) : 0;
  const firstEduDegreeWrapWidth = firstEduYear
    ? Math.max(0, RIGHT_COLUMN_WIDTH - firstEduDateWidth - TITLE_TO_DATE_GAP_PT)
    : RIGHT_COLUMN_WIDTH;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const firstEduDegreeLineCount = firstEduDegree ? doc.splitTextToSize(firstEduDegree, firstEduDegreeWrapWidth).length : 0;
  const firstEduDegreeRowHeight = firstEduDegreeLineCount > 0
    ? firstEduDegreeLineCount * EXPERIENCE_TITLE_SIZE
    : (firstEduYear ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const firstEduHasDegreeRow = Boolean(firstEduDegree || firstEduYear);
  const firstEduTitleToSubtitleGap = firstEduHasDegreeRow && firstEduInstitutionLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const firstEduHeaderHeight = firstEduDegreeRowHeight + firstEduTitleToSubtitleGap + firstEduInstitutionHeight;
  const firstEduHasHeaderContent = firstEduHasDegreeRow || firstEduInstitutionLines.length > 0;
  const firstEduHeaderToGradeGap = firstEduHasHeaderContent && firstEduGradeLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const firstEduFirstGradeLineHeight = firstEduGradeLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : 0;
  const firstEduLastLineFontSize = firstEduGradeLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : firstEduInstitutionLines.length > 0
      ? EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_TITLE_SIZE;
  const firstEduRawSpace = firstEduHeaderHeight + firstEduHeaderToGradeGap + firstEduFirstGradeLineHeight;
  const firstEduEntryHeight = keepTogetherHeight(
    inkBottomHeight(firstEduRawSpace, firstEduLastLineFontSize, firstEduLastLineFontSize),
    inkBottomHeight(firstEduRawSpace, firstEduLastLineFontSize, firstEduLastLineFontSize)
  );
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEduEntryHeight;
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
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, RIGHT_COLUMN_WIDTH) : [];
  const gradeLines: string[] = grade ? doc.splitTextToSize(`Grade: ${grade}`, RIGHT_COLUMN_WIDTH) : [];

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
    ? Math.max(0, RIGHT_COLUMN_WIDTH - dateWidthForEstimate - TITLE_TO_DATE_GAP_PT)
    : RIGHT_COLUMN_WIDTH;
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
  // Grade is a metadata line — the same kind of line institution is —
  // not a paragraph, so it reuses EXPERIENCE_TITLE_TO_SUBTITLE_GAP (the
  // same gap already used between degree and institution just above),
  // not EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP (reserved for an actual
  // paragraph, like Experience's description). This keeps
  // institution->grade visually identical to degree->institution
  // instead of the noticeably larger paragraph gap.
  const headerToGradeGap = hasHeaderContent && gradeLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const firstGradeLineHeight = gradeLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : 0;
  const lastLineFontSizeForEntry = gradeLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : institutionLines.length > 0
      ? EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_TITLE_SIZE;
  const rawMinimumEntrySpaceNeeded = headerHeight + headerToGradeGap + firstGradeLineHeight;
  const entryInkHeight = inkBottomHeight(rawMinimumEntrySpaceNeeded, lastLineFontSizeForEntry, lastLineFontSizeForEntry);
  const minimumEntrySpaceNeeded = keepTogetherHeight(entryInkHeight, entryInkHeight);
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
    doc.text(institutionLines, RIGHT_COLUMN_X, y);
    y += institutionHeight;
  }

  if (hasHeaderContent && gradeLines.length > 0) {
    y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
  }

  // --- Grade (optional, rendered with a "Grade:" label) ---
  if (gradeLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);

    for (const line of gradeLines) {
      y = checkPageBreak(doc, y, lineInkHeight(EXPERIENCE_SUBTITLE_SIZE));
      doc.text(line, RIGHT_COLUMN_X, y);
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
// SKILLS SECTION (sidebar / left column) — DOUBLE-COLUMN CREATIVE UPDATE
// ------------------------------------------------------------------
// DESIGN SOURCE: the OLD design's sidebar Skills list — a plain
// bulleted list, one skill per bullet (wrapping onto additional lines
// only when a single skill itself is too long for the column), not the
// previous single-column "Skill A  •  Skill B  •  Skill C" inline
// format. Reuses this file's OWN existing SECTION_GAP/heading
// architecture and BULLET_DOT_TO_TEXT_GAP_PT/BODY_LINE_HEIGHT spacing —
// the same bullet-gap and line-height constants Achievements already
// uses for its own bulleted list — rather than any OLD spacing value.
// If there are no usable skills at all, the whole section (including
// the heading) is skipped and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next in the
// sidebar (Languages).
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

  // Font must be set BEFORE measuring, since the line-wrapping below
  // measures text width at the currently active font/size.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const bulletTextWidth = LEFT_COLUMN_TEXT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT;
  const skillItems: string[][] = skillsList.map((skill) => doc.splitTextToSize(skill, bulletTextWidth));

  // Make sure there's room for the heading plus at least the first
  // skill's first line before starting this section on the current
  // page. Otherwise the heading would be orphaned alone at the bottom
  // of the page with its content pushed to the next one.
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + lineInkHeight(BODY_SIZE);
  y = checkPageBreak(doc, y, minimumSpaceNeeded);

  // --- Heading + divider (sidebar column — see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'SKILLS', y, BODY_SIZE, 'left');

  // --- Bulleted skill list ---
  // One bullet dot per skill (never per wrapped line — same
  // ONE-BULLET-PER-ITEM convention renderBulletedDescriptionLines()
  // uses for Achievements), rendered one line at a time so a long
  // skills list can continue naturally onto a new page.
  const bulletX = LEFT_COLUMN_X;
  const textX = LEFT_COLUMN_X + BULLET_DOT_TO_TEXT_GAP_PT;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  for (const itemLines of skillItems) {
    itemLines.forEach((line, lineIndex) => {
      y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));
      if (lineIndex === 0) {
        doc.setTextColor(...COLOR_SIDEBAR_HEADING);
        doc.text('•', bulletX, y);
      }
      doc.setTextColor(...COLOR_SIDEBAR_BODY);
      doc.text(line, textX, y);
      y += BODY_LINE_HEIGHT;
    });
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
//
// DOUBLE-COLUMN CREATIVE UPDATE: no longer called by addSkills() above,
// which now renders one bullet per skill (matching the OLD sidebar
// design) instead of this inline "Skill A  •  Skill B" joined format.
// Left in place, unused, rather than deleted — removing functions is
// outside the scope of this change, same convention this file already
// follows for other superseded-but-undeleted constants (see
// HEADING_TO_CONTENT_GAP above).
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
// LANGUAGES SECTION (sidebar / left column) — DOUBLE-COLUMN CREATIVE
// UPDATE: moved from the body column into the dark sidebar, matching
// the OLD design's own column assignment.
// Renders: "LANGUAGES" heading, then one block per entry:
//   Language Name
//   Proficiency label (optional, expanded from the form's short code —
//   see getProficiencyDisplayLabel())
//
// SHARED CONSTANT NOTE: reuses EXPERIENCE_TITLE_SIZE/COLOR_SIDEBAR_TEXT
// for the language name and EXPERIENCE_SUBTITLE_SIZE/COLOR_SIDEBAR_MUTED
// for the proficiency line — the exact same title/subtitle visual
// relationship Experience and Education entries already use in the body
// column (just the sidebar's own colors).
//
// ROOT-CAUSE FIX — Language 2 onward previously landed much further
// down than a normal content-line gap because TWO increments were
// stacked for every entry after the first: addLanguageEntry()'s own
// trailing normalization (topUpToLineHeight(), see the note inside it)
// already advances y by exactly one normal content-line step past the
// entry's last rendered line — that step, by itself, already IS the gap
// into whatever comes next. The OLD loop then ALSO added
// EXPERIENCE_ENTRY_GAP (the same entry-to-entry constant Experience/
// Education/Achievements use, whose larger, deliberately section-like
// separation is appropriate for job/degree-style entries) on top of
// that already-normalized position — double-counting "normal content
// gap" + "entry gap", stacked.
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

  // Room for the heading plus the FULL first entry (name + proficiency,
  // kept together) — not just a single line. Computed with the exact
  // same formula addLanguageEntry() uses for its own keep-together
  // check below, so the two can never disagree. (Previously this only
  // reserved one line, which under-counted a two-line entry and let
  // addLanguageEntry()'s own check push the whole entry to the next
  // page — orphaning the heading alone at the bottom of this one.)
  const firstLanguage = languages[0];
  const firstLangProficiencyRaw = (firstLanguage.proficiency || '').trim();
  const firstLangProficiencyLabel = firstLangProficiencyRaw ? getProficiencyDisplayLabel(firstLangProficiencyRaw) : '';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const firstLangNameLines: string[] = (firstLanguage.language || '').trim()
    ? doc.splitTextToSize((firstLanguage.language || '').trim(), LEFT_COLUMN_TEXT_WIDTH)
    : [];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const firstLangProficiencyLines: string[] = firstLangProficiencyLabel
    ? doc.splitTextToSize(firstLangProficiencyLabel, LEFT_COLUMN_TEXT_WIDTH)
    : [];
  const firstLangNameHeight = firstLangNameLines.length * EXPERIENCE_TITLE_SIZE;
  const firstLangProficiencyHeight = firstLangProficiencyLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const firstLangGap = firstLangNameLines.length > 0 && firstLangProficiencyLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const firstLangLastLineFontSize = firstLangProficiencyLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE;
  const firstLangRawSpace = firstLangNameHeight + firstLangGap + firstLangProficiencyHeight;
  const firstLangEntryHeight = keepTogetherHeight(
    inkBottomHeight(firstLangRawSpace, firstLangLastLineFontSize, firstLangLastLineFontSize),
    inkBottomHeight(firstLangRawSpace, firstLangLastLineFontSize, firstLangLastLineFontSize)
  );
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstLangEntryHeight;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'LANGUAGES', y, EXPERIENCE_TITLE_SIZE, 'left');

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
// normalized so every entry — not only the section's last one — ends
// on a normal-content-line-equivalent trailing space, which is what
// lets addLanguages() place consecutive languages with no extra gap of
// its own. See the ROOT-CAUSE FIX note above addLanguages().
function addLanguageEntry(doc: jsPDF, lang: CreativePdfLanguage, startY: number): number {
  let y = startY;

  const language = (lang.language || '').trim();
  const proficiencyRaw = (lang.proficiency || '').trim();
  const proficiencyLabel = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';

  // Wrap each field independently (either could be long), the same way
  // addEducationEntry() wraps degree/subtitle/grade.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const languageLines: string[] = language ? doc.splitTextToSize(language, LEFT_COLUMN_TEXT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const proficiencyLines: string[] = proficiencyLabel
    ? doc.splitTextToSize(proficiencyLabel, LEFT_COLUMN_TEXT_WIDTH)
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
  const lastLineFontSizeForEntry = proficiencyLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE;
  const rawMinimumEntrySpaceNeeded = languageHeight + titleToSubtitleGap + proficiencyHeight;
  const entryInkHeight = inkBottomHeight(rawMinimumEntrySpaceNeeded, lastLineFontSizeForEntry, lastLineFontSizeForEntry);
  const minimumEntrySpaceNeeded = keepTogetherHeight(entryInkHeight, entryInkHeight);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Language name ---
  if (languageLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_SIDEBAR_TEXT);
    doc.text(languageLines, LEFT_COLUMN_X, y);
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
    // COLOR-ONLY UPDATE: Language Level (proficiency) now matches the
    // Skills section's CONTENT color (COLOR_SIDEBAR_BODY) instead of
    // COLOR_SIDEBAR_MUTED. No other property changed.
    doc.setTextColor(...COLOR_SIDEBAR_BODY);
    doc.text(proficiencyLines, LEFT_COLUMN_X, y);
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
// SHARED CONSTANT NOTE: reuses EXPERIENCE_TITLE_SIZE/COLOR_SIDEBAR_TEXT for
// the achievement title and EXPERIENCE_SUBTITLE_SIZE/COLOR_SIDEBAR_MUTED for
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

  // Room for the heading plus the FULL first entry (title/date row +
  // at least the first description line, kept together) — not just
  // the title's own first line. Computed with the exact same formula
  // addAchievementEntry() uses for its own keep-together check
  // (via measureAchievementTitleRowWithDate()), so the two can never
  // disagree. (Previously this only reserved one line, which
  // under-counted an entry with a description and let
  // addAchievementEntry()'s own check push the whole entry to the
  // next page — orphaning the heading alone at the bottom of this one.)
  const firstAch = achievements[0];
  const firstAchTitle = (firstAch.title || '').trim();
  const firstAchDate = (firstAch.date || '').trim();
  const firstAchDescription = (firstAch.description || '').trim();
  const firstAchDescriptionLines: string[] = buildBulletedDescriptionItems(doc, firstAchDescription)
    .flatMap((item) => item.lines);
  const firstAchTitleRowMeasurement = measureAchievementTitleRowWithDate(doc, firstAchTitle, firstAchDate);
  const firstAchHasHeaderContent = Boolean(firstAchTitle || firstAchDate);
  const firstAchHeaderToDescriptionGap = firstAchHasHeaderContent && firstAchDescriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstAchFirstDescriptionLineHeight = firstAchDescriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const firstAchHasDescription = firstAchDescriptionLines.length > 0;
  const firstAchLastLineFontSize = firstAchHasDescription
    ? BODY_SIZE
    : (firstAchTitleRowMeasurement.dateLines.length > firstAchTitleRowMeasurement.titleLines.length ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE);
  const firstAchLastLineAdvance = firstAchHasDescription ? BODY_LINE_HEIGHT : firstAchLastLineFontSize;
  const firstAchRawSpace = firstAchTitleRowMeasurement.height + firstAchHeaderToDescriptionGap + firstAchFirstDescriptionLineHeight;
  const firstAchEntryHeight = keepTogetherHeight(
    inkBottomHeight(firstAchRawSpace, firstAchLastLineAdvance, firstAchLastLineFontSize),
    firstAchHasDescription
      ? inkBottomHeight(firstAchTitleRowMeasurement.height + firstAchHeaderToDescriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(firstAchTitleRowMeasurement.height, firstAchLastLineAdvance, firstAchLastLineFontSize)
  );
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstAchEntryHeight;
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
// subtracted from RIGHT_COLUMN_WIDTH — so a long title can never collide
// with the date; it simply wraps onto additional lines the normal
// way, with the date only ever drawn on the row of that title's FIRST
// line. Every subsequent wrapped line still starts at RIGHT_COLUMN_X but
// is naturally narrower than RIGHT_COLUMN_WIDTH while a date is present —
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
    ? Math.max(0, RIGHT_COLUMN_WIDTH - dateWidth - TITLE_TO_DATE_GAP_PT)
    : RIGHT_COLUMN_WIDTH;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleLines: string[] = title ? doc.splitTextToSize(title, titleWrapWidth) : [];

  if (titleLines.length > 0) {
    doc.setTextColor(...COLOR_HEADING);
    doc.text(titleLines, RIGHT_COLUMN_X, y);
  }

  if (date) {
    const rightBoundary = RIGHT_COLUMN_X + RIGHT_COLUMN_WIDTH;
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

// ====================================================================
// ACHIEVEMENT TITLE-ROW-WITH-DATE HELPER (bug fix)
// ------------------------------------------------------------------
// Achievement-only variant of the row layout above. Experience and
// Education keep calling renderTitleRowWithDate() exactly as before —
// this file's own comment on that helper already documents its
// trade-off for a long date: the title's wrap width is whatever's
// left of RIGHT_COLUMN_WIDTH after the date's own full unwrapped
// width (plus TITLE_TO_DATE_GAP_PT) is subtracted, with no floor.
// That's fine for Experience/Education, whose date is a short
// structured "start – end" range, but an Achievement Date is free
// text a user can type anything into, so that same trade-off is what
// produced the bug: once the date alone is wider than roughly half
// RIGHT_COLUMN_WIDTH, the title's remaining wrap width collapses
// toward zero and doc.splitTextToSize() has no choice but to put one
// character per line; and because the date's own X position is
// (right column boundary − its full unwrapped width), a date wider
// than the column pushes that X left of RIGHT_COLUMN_X — outside the
// right column's own valid content area (and, for a date long enough,
// even into the sidebar).
//
// ROOT-CAUSE FIX: never let the title's wrap width fall below what
// its own content actually needs. The true minimum a title needs to
// avoid character-by-character wrapping is the width of its OWN
// widest single word (doc.splitTextToSize() only ever resorts to
// splitting mid-word when even one whole word doesn't fit the given
// width) — measured with doc.getTextWidth(), the same text-
// measurement helper already used throughout this file, not a
// guessed constant. Whenever the date would squeeze the title below
// that, the title is floor-protected at a generous width instead
// (ACHIEVEMENT_TITLE_MIN_SHARE below — a fair 50/50 split of
// RIGHT_COLUMN_WIDTH, the same kind of even, proportion-based
// division this file's own two-column PAGE layout already uses via
// LEFT_COLUMN_WIDTH_RATIO), and the date is simply given whatever
// width remains — reusing the SAME doc.splitTextToSize() wrapping
// helper every other section of this file already uses — so it wraps
// onto as many right-aligned lines as it needs, each still ending
// exactly at RIGHT_COLUMN_X + RIGHT_COLUMN_WIDTH like before, and can
// never draw outside the right column's own content area. The
// Creative double-column structure itself (LEFT_COLUMN_WIDTH,
// RIGHT_COLUMN_X, RIGHT_COLUMN_WIDTH) is never touched — only how the
// Achievement row divides its own already-existing column width.
//
// Keying the trigger off the title's OWN measured content (rather
// than, say, unconditionally floor-protecting at 50% any time the
// date is on the longer side) matters: plenty of everyday entries
// have a short title and a longish-but-not-pathological date that was
// already rendering perfectly fine — comfortably on one line, title
// comfortably word-wrapped — under the old single-line-date math.
// Those must keep rendering exactly as before. Only a date that would
// ACTUALLY force the title into mid-word splitting should change
// anything.
// ====================================================================
const ACHIEVEMENT_TITLE_MIN_SHARE = 0.5; // fair 50/50 split of RIGHT_COLUMN_WIDTH — the generous width the title floor-protects to once protection is actually needed

// Pure measurement pass (no drawing) shared by the page-break estimate
// and the actual render below, so the two can never drift apart.
function measureAchievementTitleRowWithDate(
  doc: jsPDF,
  title: string,
  date: string
): { titleLines: string[]; dateLines: string[]; height: number; hasContent: boolean } {
  let dateWidth = 0;
  if (date) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    dateWidth = doc.getTextWidth(date);
  }

  // Same calculation renderTitleRowWithDate() uses: how much width
  // would be left for the title if the date rendered on one
  // unwrapped line, the way it always used to.
  const naiveTitleWrapWidth = date
    ? Math.max(0, RIGHT_COLUMN_WIDTH - dateWidth - TITLE_TO_DATE_GAP_PT)
    : RIGHT_COLUMN_WIDTH;

  // The true minimum the title needs at that width to still wrap by
  // WORDS rather than by character: the width of its own widest word.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleWords = title ? title.split(/\s+/).filter(Boolean) : [];
  const widestTitleWordWidth = titleWords.reduce(
    (maxWidth, word) => Math.max(maxWidth, doc.getTextWidth(word)),
    0
  );

  let titleWrapWidth: number;
  let dateColumnWidth: number;
  if (!date || naiveTitleWrapWidth >= widestTitleWordWidth) {
    // Normal case: the date leaves the title enough room to wrap by
    // words on its own — identical to renderTitleRowWithDate(), so
    // every entry that already rendered correctly keeps rendering
    // exactly the same way.
    titleWrapWidth = naiveTitleWrapWidth;
    dateColumnWidth = dateWidth;
  } else {
    // The date would squeeze the title below even its own widest
    // word — floor-protect the title at a generous guaranteed share
    // of RIGHT_COLUMN_WIDTH and let the date wrap inside whatever
    // width is left over instead.
    titleWrapWidth = Math.max(widestTitleWordWidth, RIGHT_COLUMN_WIDTH * ACHIEVEMENT_TITLE_MIN_SHARE);
    dateColumnWidth = Math.max(0, RIGHT_COLUMN_WIDTH - titleWrapWidth - TITLE_TO_DATE_GAP_PT);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleLines: string[] = title ? doc.splitTextToSize(title, titleWrapWidth) : [];

  let dateLines: string[] = [];
  if (date) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    dateLines = dateWidth <= dateColumnWidth ? [date] : doc.splitTextToSize(date, dateColumnWidth);
  }

  const hasContent = titleLines.length > 0 || dateLines.length > 0;
  const titleBlockHeight = titleLines.length * EXPERIENCE_TITLE_SIZE;
  const dateBlockHeight = dateLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const height = hasContent ? Math.max(titleBlockHeight, dateBlockHeight) : 0;

  return { titleLines, dateLines, height, hasContent };
}

function renderAchievementTitleRowWithDate(
  doc: jsPDF,
  title: string,
  date: string,
  y: number
): { titleLines: string[]; dateLines: string[]; height: number; hasContent: boolean } {
  const measured = measureAchievementTitleRowWithDate(doc, title, date);

  if (measured.titleLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(measured.titleLines, RIGHT_COLUMN_X, y);
  }

  if (measured.dateLines.length > 0) {
    // Same right boundary renderTitleRowWithDate() uses — every date
    // line ends exactly at RIGHT_COLUMN_X + RIGHT_COLUMN_WIDTH, never
    // past it, and never left of RIGHT_COLUMN_X either.
    const rightBoundary = RIGHT_COLUMN_X + RIGHT_COLUMN_WIDTH;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    // COLOR-ONLY UPDATE: Achievement Date uses its own darkened tone
    // (COLOR_ACHIEVEMENT_DATE), distinct from the Achievement title's
    // color (COLOR_HEADING), rather than sharing COLOR_HEADING exactly.
    // No other property (font, size, alignment, position) changed.
    doc.setTextColor(...COLOR_ACHIEVEMENT_DATE);
    doc.text(measured.dateLines, rightBoundary, y, { align: 'right' });
  }

  return measured;
}

// ====================================================================
// (Achievement rendering continues below at addAchievementEntry().)

// Marker a description line may start with in the user's own typed
// text (e.g. "- Led a team"). Stripped before wrapping so it is never
// shown twice alongside the dot this file always draws — see the
// BULLET RENDERING block below.
const BULLET_MARKER_PATTERN = /^[•\-*]\s*/;

function parseBulletLine(rawLine: string): { text: string } {
  const trimmed = rawLine.trim();
  const match = trimmed.match(BULLET_MARKER_PATTERN);
  if (match) {
    return { text: trimmed.slice(match[0].length).trim() };
  }
  return { text: trimmed };
}

// ====================================================================
// BULLET RENDERING (shared by Experience, Achievements, and Projects)
// ------------------------------------------------------------------
// Every manual line break the user typed in a description textarea
// (split on '\n') is ONE BULLET ITEM and ALWAYS gets a "•" dot — a
// plain line with no marker of its own still gets one, matching the CV
// builder's own form/preview where each typed line is already shown as
// one point. This replaces this file's previous per-section behavior
// (Experience and Projects drew no bullets at all; Achievements drew a
// dot only for lines that already started with a marker character) with
// one consistent behavior across all three bulleted sections.
//
// Splits a description into logical bullet items (one per typed line)
// and wraps each item's text to RIGHT_COLUMN_WIDTH minus
// BULLET_DOT_TO_TEXT_GAP_PT, since every item's text is indented past
// its dot — this also fixes a pre-existing wrap-width bug where
// Achievements' bulleted text used to wrap at the FULL column width and
// then render indented past it, letting long lines run past the right
// column boundary by the indent amount.
function buildBulletedDescriptionItems(doc: jsPDF, description: string): { lines: string[] }[] {
  if (!description) {
    return [];
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const wrapWidth = RIGHT_COLUMN_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT;
  return description
    .split('\n')
    .map((rawLine) => parseBulletLine(rawLine))
    .filter((item) => item.text.length > 0)
    .map((item) => ({ lines: doc.splitTextToSize(item.text, wrapWidth) }));
}

// Renders a bulleted list of description items: a "•" dot at
// RIGHT_COLUMN_X, then the item's text indented by
// BULLET_DOT_TO_TEXT_GAP_PT — the bullet dot's X position never moves;
// only the text is offset from it. Single centralized helper shared by
// Experience, Achievements, and Projects.
//
// ONE-BULLET-PER-ITEM: `items` is an array of BULLET ITEMS (see
// buildBulletedDescriptionItems() above), each already carrying its own
// wrapped lines. The dot is drawn only once per item — against that
// item's FIRST wrapped line — and every subsequent wrapped line
// belonging to the SAME item is rendered at the bullet's text
// indentation with no dot, so a sentence that wraps onto 2, 10, or 20
// lines still shows exactly one bullet. Returns the new Y position.
function renderBulletedDescriptionLines(
  doc: jsPDF,
  items: { lines: string[] }[],
  startY: number
): number {
  let y = startY;
  const bulletX = RIGHT_COLUMN_X;
  const textX = RIGHT_COLUMN_X + BULLET_DOT_TO_TEXT_GAP_PT;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  for (const item of items) {
    item.lines.forEach((line, lineIndex) => {
      y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));
      if (lineIndex === 0) {
        // First wrapped line of this item — draw its dot.
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
  // ONE-BULLET-PER-ITEM: each manual line break the user typed (split
  // on '\n') is one ACHIEVEMENT ITEM and always gets a rendered bullet
  // dot (see buildBulletedDescriptionItems()/renderBulletedDescriptionLines()
  // above) — a plain line with no marker of its own still gets one. Any
  // marker the user already typed is stripped first so it's never
  // duplicated alongside the dot. `descriptionItems` keeps one array
  // entry per item (its wrapped lines) so renderBulletedDescriptionLines()
  // can draw exactly one bullet per item — never one per wrapped line.
  // `descriptionLines` (the flat list of every wrapped line, across all
  // items) is kept alongside it purely for the page-break/space
  // estimates below, which only ever cared about total line count.
  const descriptionItems = buildBulletedDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a title from its
  // date/description. Uses the SAME measurement pass
  // (measureAchievementTitleRowWithDate()) the actual render below
  // calls, so this estimate can never drift out of sync with what
  // actually gets drawn. ---
  const titleRowMeasurement = measureAchievementTitleRowWithDate(doc, title, date);
  const titleRowHeightEstimate = titleRowMeasurement.height;
  const hasHeaderContent = Boolean(title || date);
  const headerToDescriptionGap = hasHeaderContent && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const hasDescription = descriptionLines.length > 0;
  const lastLineFontSizeForEntry = hasDescription
    ? BODY_SIZE
    : (titleRowMeasurement.dateLines.length > titleRowMeasurement.titleLines.length ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE);
  const lastLineAdvanceForEntry = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSizeForEntry;
  const rawMinimumEntrySpaceNeeded = titleRowHeightEstimate + headerToDescriptionGap + firstDescriptionLineHeight;
  const minimumEntrySpaceNeeded = keepTogetherHeight(
    inkBottomHeight(rawMinimumEntrySpaceNeeded, lastLineAdvanceForEntry, lastLineFontSizeForEntry),
    hasDescription
      ? inkBottomHeight(titleRowHeightEstimate + headerToDescriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(titleRowHeightEstimate, lastLineAdvanceForEntry, lastLineFontSizeForEntry)
  );
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Achievement Title (left) + Date (right, same row — the Date
  // wraps onto additional right-aligned lines instead of overflowing
  // the right column if it's long; see renderAchievementTitleRowWithDate()) ---
  const titleRow = renderAchievementTitleRowWithDate(doc, title, date, y);
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
  // When there is NO description: the last line is the title row —
  // ordinarily the title's own font size (11), or the date's (10) if
  // only a date was present with no title. The Title and Date no
  // longer necessarily wrap to the same number of lines (the Date can
  // now wrap onto extra lines of its own — see
  // renderAchievementTitleRowWithDate()), so the bottommost baseline
  // — and therefore the font size topUpToLineHeight() must use — is
  // whichever of the two has MORE lines. topUpToLineHeight() adds the
  // difference between BODY_LINE_HEIGHT and that font size, resulting
  // in the same body-line-equivalent (14.7 from the start of the last
  // line).
  //
  // Both cases result in the SAME Y position baseline, ensuring that
  // EXPERIENCE_ENTRY_GAP and SECTION_GAP are consistent regardless of
  // whether achievements have descriptions or not.
  let lastLineFontSize: number;
  if (descriptionLines.length > 0) {
    // Description already ends at body-line-equivalent
    return y;
  } else if (titleRow.hasContent) {
    const titleLineCount = titleRow.titleLines.length;
    const dateLineCount = titleRow.dateLines.length;
    lastLineFontSize = dateLineCount > titleLineCount ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE;
  } else {
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
  }
  y = topUpToLineHeight(y, lastLineFontSize);

  return y;
}

// ====================================================================
// CERTIFICATIONS SECTION (sidebar / left column) — DOUBLE-COLUMN
// CREATIVE UPDATE: moved from the single body column into the dark
// sidebar, matching the OLD design's own column assignment (Contact,
// Skills, Languages, Certifications all live in the sidebar there).
// Renders: "CERTIFICATIONS" heading, then one block per certification:
//   Certification Name
//   Date (optional)
//   Credential ID (optional)
//
// SHARED CONSTANT NOTE: reuses EXPERIENCE_TITLE_SIZE/COLOR_SIDEBAR_TEXT
// for the certification name and EXPERIENCE_SUBTITLE_SIZE/
// COLOR_SIDEBAR_MUTED for the date and credential ID lines — the same
// title/subtitle visual relationship Experience and Education entries
// already use in the body column (just the sidebar's own colors) —
// and reuses EXPERIENCE_ENTRY_GAP for the gap between one certification
// and the next (same semantic: one complete entry to the next), rather
// than inventing a separate constant.
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

  // Room for the heading plus the FULL first entry (name + date +
  // credential ID, kept together) — not just the name's own first
  // line. Computed with the exact same formula addCertificationEntry()
  // uses for its own keep-together check, so the two can never
  // disagree. (Previously this only reserved one line, which
  // under-counted an entry with a date or credential ID line and let
  // addCertificationEntry()'s own check push the whole entry to the
  // next page — orphaning the heading alone at the bottom of this one.)
  const firstCert = certifications[0];
  const firstCertName = (firstCert.name || '').trim();
  const firstCertDate = (firstCert.date || '').trim();
  const firstCertCredentialId = (firstCert.credentialId || '').trim();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const firstCertNameLines: string[] = firstCertName ? doc.splitTextToSize(firstCertName, LEFT_COLUMN_TEXT_WIDTH) : [];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const firstCertDateLines: string[] = firstCertDate ? doc.splitTextToSize(firstCertDate, LEFT_COLUMN_TEXT_WIDTH) : [];
  const firstCertCredentialLines: string[] = firstCertCredentialId ? doc.splitTextToSize(firstCertCredentialId, LEFT_COLUMN_TEXT_WIDTH) : [];
  const firstCertNameHeight = firstCertNameLines.length * EXPERIENCE_TITLE_SIZE;
  const firstCertDateHeight = firstCertDateLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const firstCertCredentialHeight = firstCertCredentialLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const firstCertNameToDateGap = firstCertNameLines.length > 0 && firstCertDateLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const firstCertDateToCredentialGap = firstCertDateLines.length > 0 && firstCertCredentialLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const firstCertNameToCredentialGap = firstCertNameLines.length > 0 && firstCertCredentialLines.length > 0 && firstCertDateLines.length === 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const firstCertLastLineFontSize = firstCertCredentialLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : firstCertDateLines.length > 0
      ? EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_TITLE_SIZE;
  const firstCertRawSpace = firstCertNameHeight + firstCertNameToDateGap + firstCertDateHeight +
    firstCertDateToCredentialGap + firstCertCredentialHeight + firstCertNameToCredentialGap;
  const firstCertEntryHeight = keepTogetherHeight(
    inkBottomHeight(firstCertRawSpace, firstCertLastLineFontSize, firstCertLastLineFontSize),
    inkBottomHeight(firstCertRawSpace, firstCertLastLineFontSize, firstCertLastLineFontSize)
  );
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstCertEntryHeight;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'CERTIFICATIONS', y, EXPERIENCE_TITLE_SIZE, 'left');

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
  const nameLines: string[] = name ? doc.splitTextToSize(name, LEFT_COLUMN_TEXT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateLines: string[] = date ? doc.splitTextToSize(date, LEFT_COLUMN_TEXT_WIDTH) : [];
  const credentialLines: string[] = credentialId ? doc.splitTextToSize(credentialId, LEFT_COLUMN_TEXT_WIDTH) : [];

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
  
  const lastLineFontSizeForEntry = credentialLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : dateLines.length > 0
      ? EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_TITLE_SIZE;
  const rawMinimumEntrySpaceNeeded = nameHeight + nameToDateGap + dateHeight +
    dateToCredentialGap + credentialHeight + nameToCredentialGap;
  const entryInkHeight = inkBottomHeight(rawMinimumEntrySpaceNeeded, lastLineFontSizeForEntry, lastLineFontSizeForEntry);
  const minimumEntrySpaceNeeded = keepTogetherHeight(entryInkHeight, entryInkHeight);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Certification Name ---
  if (nameLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_SIDEBAR_TEXT);
    doc.text(nameLines, LEFT_COLUMN_X, y);
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
    // COLOR-ONLY UPDATE: Certificate Date now matches the Skills
    // section's CONTENT color (COLOR_SIDEBAR_BODY) instead of
    // COLOR_SIDEBAR_MUTED. No other property changed.
    doc.setTextColor(...COLOR_SIDEBAR_BODY);
    doc.text(dateLines, LEFT_COLUMN_X, y);
    y += dateHeight;
    if (credentialLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Credential ID (optional) ---
  if (credentialLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    // COLOR-ONLY UPDATE: Credential ID now matches the Skills section's
    // CONTENT color (COLOR_SIDEBAR_BODY) instead of COLOR_SIDEBAR_MUTED.
    // No other property changed.
    doc.setTextColor(...COLOR_SIDEBAR_BODY);
    doc.text(credentialLines, LEFT_COLUMN_X, y);
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

  // Room for the heading plus the FULL first entry (name + tech + at
  // least the first description line, kept together) — not just the
  // name's own first line. Computed with the exact same formula
  // addProjectEntry() uses for its own keep-together check, so the two
  // can never disagree. (Previously this only reserved one line, which
  // under-counted an entry with a tech line or description and let
  // addProjectEntry()'s own check push the whole entry to the next
  // page — orphaning the heading alone at the bottom of this one.)
  const firstProject = projects[0];
  const firstProjectName = (firstProject.name || '').trim();
  const firstProjectTech = (firstProject.tech || '').trim();
  const firstProjectDescription = (firstProject.description || '').trim();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const firstProjectNameLines: string[] = firstProjectName ? doc.splitTextToSize(firstProjectName, RIGHT_COLUMN_WIDTH) : [];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const firstProjectTechLines: string[] = firstProjectTech ? doc.splitTextToSize(firstProjectTech, RIGHT_COLUMN_WIDTH) : [];
  const firstProjectDescriptionLines: string[] = buildBulletedDescriptionItems(doc, firstProjectDescription)
    .flatMap((item) => item.lines);
  const firstProjectNameHeight = firstProjectNameLines.length * EXPERIENCE_TITLE_SIZE;
  const firstProjectTechHeight = firstProjectTechLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const firstProjectNameToTechGap = firstProjectNameLines.length > 0 && firstProjectTechLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const firstProjectHasHeaderContent = firstProjectNameLines.length > 0 || firstProjectTechLines.length > 0;
  const firstProjectHeaderToDescriptionGap = firstProjectHasHeaderContent && firstProjectDescriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstProjectHasDescription = firstProjectDescriptionLines.length > 0;
  const firstProjectHeaderHeight = firstProjectNameHeight + firstProjectNameToTechGap + firstProjectTechHeight;
  const firstProjectLastLineFontSize = firstProjectHasDescription
    ? BODY_SIZE
    : (firstProjectTechLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE);
  const firstProjectLastLineAdvance = firstProjectHasDescription ? BODY_LINE_HEIGHT : firstProjectLastLineFontSize;
  const firstProjectRawSpace = firstProjectHeaderHeight + firstProjectHeaderToDescriptionGap + (firstProjectHasDescription ? BODY_LINE_HEIGHT : 0);
  const firstProjectEntryHeight = keepTogetherHeight(
    inkBottomHeight(firstProjectRawSpace, firstProjectLastLineAdvance, firstProjectLastLineFontSize),
    firstProjectHasDescription
      ? inkBottomHeight(firstProjectHeaderHeight + firstProjectHeaderToDescriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(firstProjectHeaderHeight, firstProjectLastLineAdvance, firstProjectLastLineFontSize)
  );
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstProjectEntryHeight;
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
  const nameLines: string[] = name ? doc.splitTextToSize(name, RIGHT_COLUMN_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const techLines: string[] = tech ? doc.splitTextToSize(tech, RIGHT_COLUMN_WIDTH) : [];

  // Description: each typed line becomes one bullet item (see
  // buildBulletedDescriptionItems()/renderBulletedDescriptionLines()
  // above), matching the CV builder's own form/preview where each line
  // is already shown as one point.
  const descriptionItems = buildBulletedDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const githubLines: string[] = github ? doc.splitTextToSize(github, RIGHT_COLUMN_WIDTH) : [];

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
  // NOTE: there is deliberately no separate "nameToDescriptionGap" term
  // here. headerToDescriptionGap above already covers EVERY header ->
  // description transition (name-only, tech-only, or name+tech), since
  // its own condition is `hasHeaderContent && descriptionLines.length > 0`.
  // A second, narrower term that re-added the same gap specifically for
  // the "name present, no tech" case used to double-count that single
  // gap — this estimate must mirror the render's single-gap fix below
  // exactly (see the matching comment in the Description block).
  const techToGithubGap = techLines.length > 0 && githubLines.length > 0 && descriptionLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const nameToGithubGap = nameLines.length > 0 && githubLines.length > 0 && techLines.length === 0 && descriptionLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;

  const hasDescription = descriptionLines.length > 0;
  const projectHeaderHeight = nameHeight + nameToTechGap + techHeight;
  const lastLineFontSizeForEntry = hasDescription
    ? BODY_SIZE
    : (techLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE);
  const lastLineAdvanceForEntry = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSizeForEntry;
  const rawMinimumEntrySpaceNeeded = projectHeaderHeight + headerToDescriptionGap + (hasDescription ? BODY_LINE_HEIGHT : 0);
  const minimumEntrySpaceNeeded = keepTogetherHeight(
    inkBottomHeight(rawMinimumEntrySpaceNeeded, lastLineAdvanceForEntry, lastLineFontSizeForEntry),
    hasDescription
      ? inkBottomHeight(projectHeaderHeight + headerToDescriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(projectHeaderHeight, lastLineAdvanceForEntry, lastLineFontSizeForEntry)
  );
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);
  // NOTE: unlike the raw sum this replaces, this reservation only
  // guards the header (+ first description line, if any) — a
  // description too long for one page flows across pages via its own
  // per-line checkPageBreak() calls below, instead of being force-
  // reserved as a single unbreakable block. The trailing GitHub field
  // (which can follow the description) gets its own small guard,
  // immediately before it renders — see the GitHub block below.

  // --- Project Name ---
  if (nameLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(nameLines, RIGHT_COLUMN_X, y);
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
    doc.text(techLines, RIGHT_COLUMN_X, y);
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
    y = renderBulletedDescriptionLines(doc, descriptionItems, y);

    if (githubLines.length > 0) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }
  }

  // --- GitHub (optional) ---
  if (githubLines.length > 0) {
    y = checkPageBreak(doc, y, inkBottomHeight(githubHeight, EXPERIENCE_SUBTITLE_SIZE, EXPERIENCE_SUBTITLE_SIZE));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_LINK); // OLD design renders links in their own tone, distinct from ordinary metadata
    doc.text(githubLines, RIGHT_COLUMN_X, y);
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
// INK-BOTTOM PAGE-BREAK MEASUREMENT HELPERS
// ------------------------------------------------------------------
// A line's "advance" (its font size, or BODY_LINE_HEIGHT for wrapped
// body text) includes leading meant for the line AFTER it. Reserving
// that full advance for the very LAST line of a block, right at the
// page-break decision, silently wastes extra space on top of the real
// BOTTOM_MARGIN. These helpers measure down to the actual ink bottom
// (descender) of a block's last line instead.
// ====================================================================
function keepTogetherHeight(fullHeight: number, leadHeight: number): number {
  if (fullHeight <= PAGE_USABLE_HEIGHT) {
    return fullHeight;
  }
  return Math.min(leadHeight, PAGE_USABLE_HEIGHT);
}

function lineInkHeight(fontSize: number): number {
  return fontSize * HELVETICA_DESCENT_RATIO;
}

function inkBottomHeight(blockHeight: number, lastLineAdvance: number, lastLineFontSize: number): number {
  return blockHeight - lastLineAdvance + lineInkHeight(lastLineFontSize);
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
    return goToNextCreativePage(doc);
  }
  return y;
}

// ====================================================================
// TWO-COLUMN PAGE SHARING
// ------------------------------------------------------------------
// Both columns are rendered as two separate passes over the SAME
// document (left/sidebar column first, then the right/body column —
// see generateCreativePDF() below), each with its own independent
// checkPageBreak() calls. Left column reserves however many pages IT
// needs; once the right column starts, it must reuse those exact same
// pages (repainting the same two-tone background) instead of each
// column silently building its own separate page count. This mirrors
// the OLD double-column file's own leftReservedPages/
// startNewCreativePage() approach, adapted to this file's existing
// checkPageBreak()-based pagination (no new pagination engine — every
// page-break DECISION still comes from checkPageBreak()'s existing
// space-needed math above).
// ====================================================================
let creativeReservedPages = 1;

// Paints the current page's two-tone background: a white full page
// plus the full-bleed dark sidebar rectangle, exactly matching page 1
// (drawn once in generateCreativePDF()) — so every later page, however
// many the document ends up needing, looks the same.
function paintPageBackground(doc: jsPDF): void {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
  doc.setFillColor(...COLOR_SIDEBAR_BG);
  doc.rect(0, 0, LEFT_COLUMN_WIDTH, PAGE_HEIGHT, 'F');
}

// Advances to the next page for whichever column is currently
// rendering. If the OTHER column already reserved a page ahead (from
// its own earlier overflow), that exact page is reused instead of
// adding a new one — keeping both columns' content on the same
// physical set of pages no matter which column runs longer. Otherwise
// a genuinely new page is added and repainted with the same
// background. Always resets the cursor to TOP_MARGIN, matching this
// file's existing single-column page-break behavior.
function goToNextCreativePage(doc: jsPDF): number {
  const currentPageNum = (doc as any).internal.getCurrentPageInfo().pageNumber;
  const nextPageNum = currentPageNum + 1;

  if (nextPageNum <= creativeReservedPages) {
    doc.setPage(nextPageNum);
    return TOP_MARGIN;
  }

  doc.addPage();
  paintPageBackground(doc);
  return TOP_MARGIN;
}