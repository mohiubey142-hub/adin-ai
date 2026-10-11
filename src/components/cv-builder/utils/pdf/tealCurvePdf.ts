/**
 * tealCurvePdf.ts
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

// Usable VERTICAL space for content on a single page, after subtracting
// both margins. Used by keepTogetherHeight() (see near checkPageBreak()
// at the end of this file) as a hard ceiling on any single "keep this
// entry together" reservation, so checkPageBreak() can never demand a
// fresh page that still wouldn't fit the reservation.
const PAGE_USABLE_HEIGHT = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

// ====================================================================
// TYPOGRAPHY CONSTANTS (font sizes, in points)
// ====================================================================

// AUTO-FIT-TO-ONE-PAGE: the current scale applied to every BASE_*
// constant below via recomputeScaledConstants() (see near the entry
// point at the end of this file). 1 = full size, unscaled. Never
// applied to the header's own typography/photo, margins, colors, or
// any hairline stroke width — see recomputeScaledConstants() for the
// exact, complete list of what this DOES scale.
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
const BASE_DIVIDER_SIDE_GAP_PT = DIVIDER_SIDE_GAP_MM * MM_TO_PT; // 4mm, ≈ 11.3386pt
let DIVIDER_SIDE_GAP_PT = BASE_DIVIDER_SIDE_GAP_PT;

// TealCurve: extra breathing room between the header's contact line and
// the header divider, on top of the universal DIVIDER_SIDE_GAP_PT above.
// Declared as its own constant (not a change to DIVIDER_SIDE_GAP_PT
// itself) because DIVIDER_SIDE_GAP_PT is shared by every section
// heading's own divider via renderSectionHeading() — changing it there
// would widen every section's heading-to-divider gap too. This constant
// is added only where the header computes its own contact->divider gap.
const HEADER_CONTACT_TO_DIVIDER_EXTRA_GAP_MM = 1;
const HEADER_CONTACT_TO_DIVIDER_EXTRA_GAP_PT = HEADER_CONTACT_TO_DIVIDER_EXTRA_GAP_MM * MM_TO_PT;

// Requested increase to the section-heading divider's stroke thickness:
// +0.2mm on top of the existing visual weight (previously equal to
// HEADER_RULE_THICKNESS/HEADER's own 0.75pt rule). Expressed in mm and
// converted through the single MM_TO_PT constant — same convention as
// DIVIDER_SIDE_GAP_PT above — so no raw pt magic number is introduced.
const SECTION_DIVIDER_THICKNESS_INCREASE_MM = 0.2;
const SECTION_DIVIDER_THICKNESS_INCREASE_PT = SECTION_DIVIDER_THICKNESS_INCREASE_MM * MM_TO_PT; // ≈ 0.5669pt

// --- No-photo header nudge (Name/Job Title only) ---
// Requested only for the NO-PHOTO header layout: the Name's rendered
// ink should sit 2mm lower, and the Job Title's rendered ink 1mm
// lower, than their current positions — with everything else in the
// header (and every section after it, including Contact) staying
// exactly where it already is. Expressed in mm and converted through
// the single MM_TO_PT constant, same convention as DIVIDER_SIDE_GAP_PT
// and SECTION_DIVIDER_THICKNESS_INCREASE_PT above, so no raw pt magic
// number is introduced. These are applied ONLY to the no-photo
// branch's doc.text() draw calls below (as a pure visual offset on
// where the ink is painted) — never to the cursor/Y-advancement math
// that positions Contact, the divider, or anything after them, so
// nothing downstream shifts. The photo-present branch never reads
// these constants at all. Also never read by
// computeHeaderDividerBottomEdgeY() above, which only duplicates
// addHeader()'s cursor math (not its ink-offset draw calls) — so the
// header background band's height, which is measured from that
// cursor math, is correctly unaffected by this purely visual nudge.
const NO_PHOTO_NAME_DOWN_SHIFT_MM = 2;
const NO_PHOTO_NAME_DOWN_SHIFT_PT = NO_PHOTO_NAME_DOWN_SHIFT_MM * MM_TO_PT; // 2mm, ≈ 5.6693pt
const NO_PHOTO_TITLE_DOWN_SHIFT_MM = 1;
const NO_PHOTO_TITLE_DOWN_SHIFT_PT = NO_PHOTO_TITLE_DOWN_SHIFT_MM * MM_TO_PT; // 1mm, ≈ 2.8346pt

// --- Header contact-line position nudge ---
// Moves the contact line (email/phone/location/links) 0.5mm down and
// 0.5mm right of its previous position. UNLIKE the no-photo Name/Title
// nudges above (which are decorative-only: the cursor `y` stays
// unshifted, so nothing after Name/Title moves), this down-shift is
// fed into the REAL cursor math in both addHeader() and
// computeHeaderDividerBottomEdgeY() (see HEADER_CONTACT_DOWN_SHIFT_PT's
// usage there) — on purpose. A decorative-only nudge here would move
// the contact line's ink closer to the header divider (a fixed line)
// without moving the divider itself, which would shrink the real
// contact->divider gap by exactly this shift — precisely the risk this
// change must avoid. Feeding the shift into the real cursor instead
// moves the divider, the header background band, and the returned
// header height down by this SAME amount, so every gap derived from
// them (contact->divider, header->Professional-Summary, and every
// section gap after it, all still computed via the file's existing
// DIVIDER_SIDE_GAP_PT / SECTION_GAP / topUpToLineHeight() formulas)
// is preserved exactly — only the whole header's absolute position on
// the page shifts down by this constant. The right-shift, in contrast,
// is purely horizontal and only ever affects the contact line's own
// drawn X position — it has no vertical/gap consequences and does not
// touch Photo/Name/Job-Title/the divider in any way.
const HEADER_CONTACT_DOWN_SHIFT_MM = 0.5;
const HEADER_CONTACT_DOWN_SHIFT_PT = HEADER_CONTACT_DOWN_SHIFT_MM * MM_TO_PT; // 0.5mm, ≈ 1.4173pt
const HEADER_CONTACT_RIGHT_SHIFT_MM = 0.5;
const HEADER_CONTACT_RIGHT_SHIFT_PT = HEADER_CONTACT_RIGHT_SHIFT_MM * MM_TO_PT; // 0.5mm, ≈ 1.4173pt

// --- Photo-present header: whole-block downward shift ---
// When a profile photo is present, the ENTIRE header block (photo, name,
// job title, contact line) starts this much lower. The shift is fed into
// the real cursor math (computePhotoHeaderLayout() below, the single
// source of truth for both the band measurement and the drawing), so the
// divider, the header background band and the returned header height all
// move down by this SAME amount. Every gap derived from them (contact ->
// divider, header -> Professional Summary, every section gap) is
// therefore preserved exactly. Without a photo the shift is 0, so the
// no-photo layout stays exactly as it was. Mirrors
// PHOTO_CONTENT_DOWN_SHIFT in TealCurveTemplate.tsx 1:1.
const PHOTO_CONTENT_DOWN_SHIFT_MM = 2;
const PHOTO_CONTENT_DOWN_SHIFT_PT = PHOTO_CONTENT_DOWN_SHIFT_MM * MM_TO_PT; // 2mm, ≈ 5.6693pt

// --- No-photo header: whole-block upward shift ---
// Mirror of the photo shift above, in the opposite direction: without a
// photo the ENTIRE header block (name, job title, contact line) starts
// this much HIGHER. Applied through noPhotoHeaderStartY() below, which
// both the band measurement and the drawing use, so the divider, the
// header background band and the returned header height all move up by
// this SAME amount and every gap derived from them is preserved.
// Mirrors NO_PHOTO_CONTENT_UP_SHIFT in TealCurveTemplate.tsx 1:1.
const NO_PHOTO_CONTENT_UP_SHIFT_MM = 2;
const NO_PHOTO_CONTENT_UP_SHIFT_PT = NO_PHOTO_CONTENT_UP_SHIFT_MM * MM_TO_PT; // 2mm, ≈ 5.6693pt

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
// TealCurve: rendered diameter increased by exactly 8 (this file's
// only unit is pt, and px/pt are already treated as equivalent here —
// see the note above), per request. Every downstream photo
// calculation — radius, aspect-preserving image draw width/height,
// vertical centering against the name/job-title block, text start X,
// and bottom-edge overhang — already derives from this single
// constant (in both addHeader() and its computeHeaderDividerBottomEdgeY()
// measurement mirror above), so this one change is the complete,
// centralized implementation of the size increase: no separate
// coordinates or offsets needed anywhere else.
const HEADER_PHOTO_SIZE_PT = 83; // was 75; +8
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
const COLOR_NAME = [255, 255, 255] as const; // TealCurve: OLD header name color (white, for the dark header band)
const COLOR_TITLE = [255, 255, 255] as const; // TealCurve: white, same as COLOR_NAME
const COLOR_METADATA = [70, 70, 75] as const; // OLD theme's `textLight` (subtitles, institution, grade, proficiency, tech, credential — NOT the header contact line or dates, see COLOR_HEADER_CONTACT/COLOR_DATE below)
const COLOR_RULE = [195, 195, 200] as const; // OLD theme's `divider`

// TealCurve: header-only contact-line color (OLD's light teal tint,
// legible against COLOR_HEADER_BACKGROUND below). Declared separately
// from COLOR_METADATA — which the contact line used before this
// change — because COLOR_METADATA is also reused throughout this file
// for entry subtitles/institution/grade/proficiency/tech/credential
// text that stays on the plain white page body, not the header band,
// and must keep its own unchanged tone.
const COLOR_HEADER_CONTACT = [200, 220, 220] as const;

// TealCurve: solid header background band color (OLD's `primary`/dark
// teal). Painted behind the header's name/title/photo/contact text —
// see computeHeaderDividerBottomEdgeY() and its use in addHeader()
// below for how tall that band is drawn.
const COLOR_HEADER_BACKGROUND = [13, 43, 43] as const;

// TealCurve: Experience/Education/Achievement date color (OLD's date
// tone). Declared separately from COLOR_METADATA because
// renderTitleRowWithDate() — the single shared helper that draws all
// three of those dates — previously drew them via COLOR_METADATA,
// which is also used for unrelated non-date text (company,
// institution, grade, tech, credential, proficiency) that must keep
// its current color.
const COLOR_DATE = [110, 110, 124] as const;

// Universal section-heading divider color. TealCurve: OLD's divider
// color (dark teal, matching COLOR_HEADER_BACKGROUND/
// COLOR_SECTION_HEADLINE — OLD uses one core tone for its heading text,
// divider lines, and header band alike).
// Declared separately from COLOR_RULE for the same reason
// SECTION_DIVIDER_THICKNESS is declared separately from
// HEADER_RULE_THICKNESS above — the Header's rule stays fully
// independent even though the values match today.
const COLOR_SECTION_DIVIDER = [13, 43, 43] as const;

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
// no per-section hardcoding. OLD theme's `primary`.
const COLOR_SECTION_HEADING = [40, 40, 45] as const;

// TealCurve: section headline text color — OLD TealCurve's `primary`
// dark teal (same tone as COLOR_HEADER_BACKGROUND/COLOR_SECTION_DIVIDER
// above — OLD uses one core color across its header band, dividers,
// and section headline text alike). Declared as its own constant —
// same [r, g, b] tuple architecture as every other COLOR_* constant
// above — rather than changing COLOR_SECTION_HEADING's value directly,
// because COLOR_SECTION_HEADING is also reused elsewhere in this file
// as the Experience/Achievements/Projects bullet-dot color (see
// renderBulletDescriptionLines()), which must stay exactly as it is
// in Minimal. Only renderSectionHeading() below references this
// constant, so every section heading in the document (Professional
// Summary, Experience, Education, Skills, Languages, Achievements,
// Certifications, Projects) shares this exact same color — one source
// of truth, no per-section hardcoding.
const COLOR_SECTION_HEADLINE = [13, 43, 43] as const;
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
export interface MinimalPdfPersonalInfo {
  name?: string;
  title?: string;
  jobTitle?: string;
  email?: string;
  location?: string;
  city?: string;
  // Same ASSUMPTION/TO-VERIFY status as the rest of this interface
  // (see comment above): the exact field name for a personal-info
  // Address is not confirmed against a shared type in the codebase,
  // so a couple of common alternative names are accepted, matching
  // the location/city and title/jobTitle fallback pattern already
  // used here.
  address?: string;
  streetAddress?: string;
  linkedin?: string;
  github?: string; // header contact-line GitHub URL — CONFIRMED field
  // name (`personalInfo.github`) against the actual ATSPro generator
  // (atsProPdf.ts), which already reads this same field for its own
  // contact line. Distinct from MinimalPdfProject.github below, which
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

export interface TealCurvePdfData {
  personalInfo: MinimalPdfPersonalInfo;
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
  experiences?: MinimalPdfExperience[];

  // CONFIRMED against the project's actual EducationItem
  // (src/components/cv-builder/types/cvTypes.ts / EducationSection.tsx):
  // fields used are degree, institution, year (already a combined
  // "start - end" string, not separate startDate/endDate), and grade.
  // There is no location or description field on an education entry,
  // so Phase 4 does not render either (nothing to fabricate).
  educations?: MinimalPdfEducation[];

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
  languages?: MinimalPdfLanguage[];

  // CONFIRMED against the project's actual AchievementItem
  // (src/components/cv-builder/types/cvTypes.ts / AchievementsSection.tsx):
  // fields used are title, date, description. All fields are optional.
  achievements?: MinimalPdfAchievement[];

  // CONFIRMED against the project's actual CertificationItem
  // (src/components/cv-builder/types/cvTypes.ts / CertificationsSection.tsx):
  // fields used are name, date, credentialId. All fields are optional.
  certifications?: MinimalPdfCertification[];

  // CONFIRMED against the project's actual ProjectItem
  // (src/components/cv-builder/types/cvTypes.ts / ProjectsSection.tsx):
  // fields used are name, tech, description, github. All fields are optional.
  projects?: MinimalPdfProject[];

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
export interface MinimalPdfExperience {
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
export interface MinimalPdfEducation {
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
export interface MinimalPdfLanguage {
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
export interface MinimalPdfAchievement {
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
export interface MinimalPdfCertification {
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
export interface MinimalPdfProject {
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
// generateTealCurvePDF, before knowing whether the next section will
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
  doc.setTextColor(...COLOR_SECTION_HEADLINE); // TealCurve: section headline color, purple — see COLOR_SECTION_HEADLINE above
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
// AUTO-FIT-TO-ONE-PAGE (DYNAMIC SCALE)
// ------------------------------------------------------------------
// Recomputes every scalable constant (converted to a BASE_*/mutable
// pair above) from its BASE_* value at the given scale. Never touches
// the header's own typography/photo, margins, colors, or any hairline
// stroke width — none of those were converted to BASE_*/mutable pairs
// above, so none of them are set here.
// ====================================================================
function recomputeScaledConstants(scale: number): void {
  SCALE_FACTOR = scale;

  HEADING_SIZE = BASE_HEADING_SIZE * scale;
  BODY_SIZE = BASE_BODY_SIZE * scale;
  EXPERIENCE_TITLE_SIZE = BASE_EXPERIENCE_TITLE_SIZE * scale;
  EXPERIENCE_SUBTITLE_SIZE = BASE_EXPERIENCE_SUBTITLE_SIZE * scale;
  SECTION_GAP = BASE_SECTION_GAP * scale;
  DIVIDER_SIDE_GAP_PT = BASE_DIVIDER_SIDE_GAP_PT * scale;
  EXPERIENCE_TITLE_TO_SUBTITLE_GAP = BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP * scale;
  EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP * scale;
  EXPERIENCE_ENTRY_GAP = BASE_EXPERIENCE_ENTRY_GAP * scale;
  BULLET_DOT_TO_TEXT_GAP_PT = BASE_BULLET_DOT_TO_TEXT_GAP_PT * scale;
  TITLE_TO_DATE_GAP_PT = BASE_TITLE_TO_DATE_GAP_PT * scale;

  // BODY_LINE_HEIGHT must be recomputed after BODY_SIZE, since it's
  // derived from it (BODY_LINE_HEIGHT_MULTIPLIER itself is a ratio,
  // not a size, and is never scaled).
  BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;
}

// ====================================================================
// ENTRY POINT
// ------------------------------------------------------------------
// renderTealCurvePDFOnce() is the exact same render sequence the old
// single-pass generateTealCurvePDF() body used to run, unchanged, now
// wrapped so it can be invoked repeatedly at different scales. The
// exported generateTealCurvePDF() below is the auto-fit driver: it
// renders once at full scale, and only if that overflows to a second
// page by a SMALL amount does it retry at progressively smaller
// scales (in AUTO_FIT_MIN_SCALE..1 steps) looking for the largest
// scale that brings the whole resume back to one page.
// ====================================================================
function renderTealCurvePDFOnce(data: TealCurvePdfData): { doc: jsPDF; pageCount: number; lastPageContentHeight: number } {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  let y = TOP_MARGIN;

  // SECTION ORDER (requested): Summary -> Experience -> Education ->
  // Certifications -> Skills -> Languages -> Achievements -> Projects.
  // Each add*() function only reads the running `y` cursor it's handed
  // and returns the next one (skipping its own heading/divider/gap
  // entirely when its data is empty), so reordering these calls is
  // the complete change — no other section's own logic depends on
  // which section runs before or after it.
  y = addHeader(doc, data, y);
  y = addSummary(doc, data, y);
  y = addExperience(doc, data, y);
  y = addEducation(doc, data, y);
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

// Floor on how far auto-fit will shrink text/spacing — never below 85%
// of original size, so a resume is never scaled down to the point of
// being hard to read just to save one page.
const AUTO_FIT_MIN_SCALE = 0.85;
// Auto-fit only ever engages for a SMALL page-2 overflow — at most 35%
// of one page's usable height. A resume overflowing by more than this
// is genuinely too long and renders untouched at full size instead of
// being force-shrunk for little benefit.
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

export function generateTealCurvePDF(data: TealCurvePdfData): jsPDF {
  // WinAnsi-safety pass — see sanitizeTextForPdf() above. Every string
  // field in `data` is normalized ONCE here, before any measurement or
  // rendering, so the rest of the file (unchanged below) never sees an
  // unencodable character like U+2011 again.
  const sanitizedData = deepSanitizeForPdf(data);

  recomputeScaledConstants(1);
  const fullScaleResult = renderTealCurvePDFOnce(sanitizedData);

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
    const attempt = renderTealCurvePDFOnce(sanitizedData);
    if (attempt.pageCount === 1) {
      bestFit = { doc: attempt.doc, scale };
      break;
    }
  }

  // Reset every scaled constant back to its full-size value regardless
  // of outcome, so back-to-back calls with different data never leak
  // scale state from one call into the next.
  recomputeScaledConstants(1);
  return bestFit ? bestFit.doc : fullScaleResult.doc;
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
// ====================================================================
// PHOTO HEADER LAYOUT (shared by measurement + drawing)
// ------------------------------------------------------------------
// Single source of truth for the photo header's vertical geometry,
// used by BOTH computeHeaderDividerBottomEdgeY() (pre-paint measurement)
// and addHeader() (actual drawing), so they can never disagree.
//
// WHY THE TITLE SLOT IS ALWAYS RESERVED: the photo is vertically
// centered against the name/job-title text block. If that block shrank
// to "name only" whenever the job title was empty, the (much taller)
// photo would be centered on a smaller block and ride upward. Treating
// the title row as a fixed slot - drawn or not - keeps the block, the
// photo position, and the contact-line start identical in both cases.
// Only the title TEXT is skipped when empty; no layout value changes.
// ====================================================================
interface PhotoHeaderLayout {
  nameBaselineY: number;
  titleBaselineY: number; // baseline of the (possibly empty) title slot
  photoTopY: number;
  contactStartY: number; // where the contact line begins
}

// Single source of truth for where the NO-PHOTO header block starts
// (shared by the band measurement and the drawing, like
// computePhotoHeaderLayout() is for the photo header).
function noPhotoHeaderStartY(startY: number): number {
  return startY - NO_PHOTO_CONTENT_UP_SHIFT_PT;
}

function computePhotoHeaderLayout(startY: number): PhotoHeaderLayout {
  // Photo-only whole-block shift (see PHOTO_CONTENT_DOWN_SHIFT_PT). Every
  // value below derives from nameBaselineY, so the photo, title, contact
  // start (and thus divider + band) all move together and no gap changes.
  const nameBaselineY = startY + PHOTO_CONTENT_DOWN_SHIFT_PT;
  const titleBaselineY = nameBaselineY + NAME_SIZE + NAME_TO_TITLE_GAP;

  // Real ink-space span of the name + title-slot block.
  const blockTopY = nameBaselineY - NAME_SIZE * HELVETICA_ASCENT_RATIO;
  const blockBottomY = titleBaselineY + TITLE_SIZE * HELVETICA_DESCENT_RATIO;
  const blockHeight = blockBottomY - blockTopY;

  const photoTopY = blockTopY + (blockHeight - HEADER_PHOTO_SIZE_PT) / 2;
  const photoBottomY = photoTopY + HEADER_PHOTO_SIZE_PT;

  // Advance past whichever is taller: the text block or the photo.
  const photoOverhang = Math.max(0, photoBottomY - blockBottomY);
  const contactStartY = titleBaselineY + TITLE_SIZE + TITLE_TO_CONTACT_GAP + photoOverhang;

  return { nameBaselineY, titleBaselineY, photoTopY, contactStartY };
}

// ====================================================================
// HEADER BACKGROUND BAND HEIGHT (TealCurve)
// ====================================================================
// OLD TealCurve always paints a solid-color header background block,
// and that block's HEIGHT is dynamic — it grows past a base size
// whenever the header's own content (there: the wrapped contact line)
// needs more room. OLD gets this by measuring first: it works out how
// many lines the name/job-title/contact text will wrap to (with the
// exact font sizes/gaps it's about to draw with) to get a content
// "bottom Y", and only THEN paints its background rectangle sized to
// reach that computed bottom — never a hardcoded fixed height.
//
// This function reproduces that same measure-before-paint behavior
// using the CURRENT file's own header geometry: it duplicates ONLY the
// pure Y-position arithmetic addHeader() below performs (no drawing —
// just the same doc.splitTextToSize() measurement call, against the
// exact same constants addHeader() itself uses: NAME_SIZE, TITLE_SIZE,
// METADATA_SIZE, NAME_TO_TITLE_GAP, TITLE_TO_CONTACT_GAP,
// HEADER_PHOTO_SIZE_PT, CONTENT_WIDTH, DIVIDER_SIDE_GAP_PT,
// SECTION_DIVIDER_THICKNESS), so the background band this produces
// always ends exactly where addHeader()'s own divider does — however
// many lines the contact line actually wraps to for this person's
// data. Duplicating this small amount of arithmetic (rather than
// having addHeader() compute it once and reuse it) is unavoidable here
// only because the background must be PAINTED before the header's
// text/photo are drawn on top of it, while these Y positions are
// otherwise only produced by addHeader() WHILE it draws.
function computeHeaderDividerBottomEdgeY(
  doc: jsPDF,
  data: TealCurvePdfData,
  startY: number
): number {
  const { personalInfo, phoneNumber, selectedCountryCode } = data;
  const jobTitle = (personalInfo?.title || personalInfo?.jobTitle || '').trim();
  const hasPhoto = isValidPhotoSource(personalInfo?.photo);

  let y = startY;

  if (hasPhoto) {
    y = computePhotoHeaderLayout(startY).contactStartY;
  } else {
    y = noPhotoHeaderStartY(startY);
    y += NAME_SIZE;
    y += NAME_TO_TITLE_GAP;
    if (jobTitle) {
      y += TITLE_SIZE;
      y += TITLE_TO_CONTACT_GAP;
    }
  }

  const contactParts = buildContactParts(personalInfo, phoneNumber, selectedCountryCode);
  let contactInkBottomY = y;
  if (contactParts.length > 0) {
    const contactLayoutLines = layoutContactLines(doc, contactParts);
    const lastContactLine = contactLayoutLines[contactLayoutLines.length - 1].lineText;
    // Consecutive contact lines advance by BODY_LINE_HEIGHT (Professional
    // Summary's own body-text line spacing — see the matching fix in
    // addHeader() below for the full rationale), not METADATA_SIZE, so
    // this measurement stays in sync with what's actually drawn.
    // HEADER_CONTACT_DOWN_SHIFT_PT: must match addHeader()'s own
    // contact draw position exactly, or this pre-pass (used only to
    // size the header background band) would disagree with what's
    // actually drawn.
    const lastContactBaselineY = y + (contactLayoutLines.length - 1) * BODY_LINE_HEIGHT + HEADER_CONTACT_DOWN_SHIFT_PT;
    contactInkBottomY = lastContactBaselineY + (hasDescenderChar(lastContactLine) ? METADATA_SIZE * HELVETICA_DESCENT_RATIO : 0);
  }

  const headerDividerTopEdgeY = contactInkBottomY + DIVIDER_SIDE_GAP_PT + HEADER_CONTACT_TO_DIVIDER_EXTRA_GAP_PT;
  const headerDividerCenterY = headerDividerTopEdgeY + SECTION_DIVIDER_THICKNESS / 2;
  return headerDividerCenterY + SECTION_DIVIDER_THICKNESS / 2;
}

function addHeader(doc: jsPDF, data: TealCurvePdfData, startY: number): number {
  let y = startY;
  const { personalInfo, phoneNumber, selectedCountryCode } = data;

  const name = (personalInfo?.name || '').trim() || 'Your Name';
  const jobTitle = (personalInfo?.title || personalInfo?.jobTitle || '').trim();
  const hasPhoto = isValidPhotoSource(personalInfo?.photo);

  // --- TealCurve: header background band --------------------------------
  // Painted FIRST so the name/title/photo/contact text drawn below lands
  // on top of it. Its height is dynamic, not a fixed number — see
  // computeHeaderDividerBottomEdgeY() above for how/why it grows with
  // wrapped header content, mirroring OLD TealCurve's own header-height
  // behavior. Drawn full page-width, from the page's top edge down to
  // exactly where this same header's own divider ends below — nothing
  // here changes the header's existing text/photo positions or gaps.
  const headerBackgroundBottomY = computeHeaderDividerBottomEdgeY(doc, data, startY);
  doc.setFillColor(...COLOR_HEADER_BACKGROUND);
  doc.rect(0, 0, PAGE_WIDTH, headerBackgroundBottomY, 'F');

  if (hasPhoto) {
    // --- Geometry comes from the shared computePhotoHeaderLayout(), which
    // ALWAYS reserves the job-title slot. The photo is therefore centered
    // against the same fixed block whether or not a job title exists, so
    // its position can never shift when the title is empty. ---
    const { nameBaselineY, titleBaselineY, photoTopY, contactStartY } = computePhotoHeaderLayout(startY);
    const photoX = LEFT_MARGIN;
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
    if (jobTitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TITLE_SIZE);
      doc.setTextColor(...COLOR_TITLE);
      doc.text(jobTitle, textStartX, titleBaselineY);
    }

    // --- Contact line start: precomputed by computePhotoHeaderLayout(),
    // identical whether or not a job title exists. ---
    y = contactStartY;
  } else {
    // --- NO PHOTO (original TealCurve layout, + the requested
    // no-photo-only Name/Job Title downward nudge below) ---

    // Whole no-photo block starts higher (see NO_PHOTO_CONTENT_UP_SHIFT_PT).
    y = noPhotoHeaderStartY(startY);

    // --- Name ---
    // OLD design renders the name in normal (not bold) weight — text
    // weight/style copied from the OLD design reference; font size and
    // Y-advance math (NAME_SIZE) are unchanged geometry.
    //
    // NO-PHOTO NUDGE: the Name is painted NO_PHOTO_NAME_DOWN_SHIFT_PT
    // (2mm) lower than `y` — a pure ink-position offset on this
    // doc.text() call only. The cursor (`y` itself, and everything
    // derived from it below — Job Title's gap, Contact, the header
    // divider, every later section) still advances from the ORIGINAL,
    // unshifted `y`, exactly as before, so nothing downstream moves.
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(NAME_SIZE);
    doc.setTextColor(...COLOR_NAME);
    doc.text(name, LEFT_MARGIN, y + NO_PHOTO_NAME_DOWN_SHIFT_PT);
    y += NAME_SIZE; // move past the line's own height
    y += NAME_TO_TITLE_GAP;

    // --- Job title (optional) ---
    if (jobTitle) {
      // NO-PHOTO NUDGE: same idea as the Name above — the Job Title is
      // painted NO_PHOTO_TITLE_DOWN_SHIFT_PT (1mm) lower than `y`, as a
      // pure ink-position offset on this doc.text() call only. `y`
      // itself keeps advancing from its original, unshifted value, so
      // TITLE_TO_CONTACT_GAP below still measures from the SAME cursor
      // position as before this change, and Contact's starting
      // position is unaffected.
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TITLE_SIZE);
      doc.setTextColor(...COLOR_TITLE);
      doc.text(jobTitle, LEFT_MARGIN, y + NO_PHOTO_TITLE_DOWN_SHIFT_PT);
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
    doc.setTextColor(...COLOR_HEADER_CONTACT);

    // Clean, separator-free layout — see layoutContactLines() above.
    const contactLayoutLines = layoutContactLines(doc, contactParts);

    // Drawn one line at a time (rather than handing jsPDF the whole
    // wrapped array in a single doc.text() call) so each consecutive
    // line advances by BODY_LINE_HEIGHT — the EXACT same vertical
    // spacing Professional Summary's own wrapped body-text lines use
    // (see addSummary()'s line-drawing loop) — instead of jsPDF's own
    // internal default multi-line spacing, which does not match it.
    for (let i = 0; i < contactLayoutLines.length; i++) {
      for (const item of contactLayoutLines[i].items) {
        // +HEADER_CONTACT_RIGHT_SHIFT_PT / +HEADER_CONTACT_DOWN_SHIFT_PT:
        // moves the drawn contact text 0.5mm right and 0.5mm down. The
        // right-shift is purely cosmetic (X only, no gap consequence).
        // The down-shift, unlike the no-photo Name/Title nudges above,
        // is NOT decorative-only — see contactInkBottomY below, which
        // is deliberately computed FROM this same shifted position so
        // every gap after it stays correct (see HEADER_CONTACT_DOWN_
        // SHIFT_PT's own comment for the full reasoning).
        doc.text(item.text, item.x + HEADER_CONTACT_RIGHT_SHIFT_PT, y + i * BODY_LINE_HEIGHT + HEADER_CONTACT_DOWN_SHIFT_PT);
      }
    }

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
    const lastContactLine = contactLayoutLines[contactLayoutLines.length - 1].lineText;
    // Consecutive contact lines advance by BODY_LINE_HEIGHT (Professional
    // Summary's own body-text line spacing), matching the draw loop above.
    // +HEADER_CONTACT_DOWN_SHIFT_PT: matches the same shift applied to
    // the actual drawn position two blocks up, so contactInkBottomY
    // reflects the real, shifted ink position the divider gap below is
    // measured from.
    const lastContactBaselineY = y + (contactLayoutLines.length - 1) * BODY_LINE_HEIGHT + HEADER_CONTACT_DOWN_SHIFT_PT;
    contactInkBottomY = lastContactBaselineY + (hasDescenderChar(lastContactLine) ? METADATA_SIZE * HELVETICA_DESCENT_RATIO : 0);

    y += contactLayoutLines.length * BODY_LINE_HEIGHT;
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
  const headerDividerTopEdgeY = contactInkBottomY + DIVIDER_SIDE_GAP_PT + HEADER_CONTACT_TO_DIVIDER_EXTRA_GAP_PT;
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

// ====================================================================
// CLEAN CONTACT LAYOUT (shared by the header's pre-paint measurement and
// the actual draw, so the two can never disagree)
// ------------------------------------------------------------------
// Separator-free contact line (same layout as ATSPro). Every contact item
// is placed whole and every item is followed by the SAME gap — the width
// of the file's existing SKILLS_SEPARATOR in this font, so the horizontal
// rhythm matches the rest of the document and no new spacing value
// exists. An item that doesn't fit the remaining width moves whole to the
// next line (never split mid-text); an item wider than the entire line is
// wrapped with the same splitTextToSize() used elsewhere in this file, so
// no contact text is ever dropped or clipped. Returns one entry per
// rendered line (its positioned items + the line's full text, used for
// the descender check); consecutive lines are BODY_LINE_HEIGHT apart at
// draw time, exactly as before.
// ====================================================================
interface ContactLayoutLine {
  lineText: string;
  items: { text: string; x: number }[];
}

function layoutContactLines(doc: jsPDF, contactParts: string[]): ContactLayoutLine[] {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(METADATA_SIZE);

  const contactRight = LEFT_MARGIN + CONTENT_WIDTH;
  const itemGap = doc.getTextWidth(SKILLS_SEPARATOR);

  const lines: ContactLayoutLine[] = [{ lineText: '', items: [] }];
  let cursorX = LEFT_MARGIN;
  const startNewLine = () => {
    lines.push({ lineText: '', items: [] });
    cursorX = LEFT_MARGIN;
  };
  const place = (text: string, x: number) => {
    const line = lines[lines.length - 1];
    line.items.push({ text, x });
    line.lineText += text;
  };

  for (const part of contactParts) {
    const itemWidth = doc.getTextWidth(part);

    if (itemWidth > CONTENT_WIDTH) {
      // Oversized single item: gets its own wrapped lines.
      if (cursorX > LEFT_MARGIN) startNewLine();
      const wrapped: string[] = doc.splitTextToSize(part, CONTENT_WIDTH);
      wrapped.forEach((wrappedLine, index) => {
        if (index > 0) startNewLine();
        place(wrappedLine, LEFT_MARGIN);
      });
      cursorX = LEFT_MARGIN + doc.getTextWidth(wrapped[wrapped.length - 1]) + itemGap;
      continue;
    }

    if (cursorX > LEFT_MARGIN && cursorX + itemWidth > contactRight) {
      startNewLine();
    }
    place(part, cursorX);
    cursorX += itemWidth + itemGap;
  }

  return lines;
}

// Plain-text labels shown before each contact value (same labels and
// same order as TealCurveTemplate.tsx). Label + value is ONE string, so
// the contact line's measuring/wrapping/drawing all include the label and
// the PDF breaks lines exactly like the live preview.
const CONTACT_LABELS = {
  email: 'Email: ',
  phone: 'Phone: ',
  location: 'Location: ',
  address: 'Address: ',
  linkedin: 'LinkedIn: ',
  github: 'GitHub: ',
  website: 'Portfolio URL: ',
} as const;

// Builds the list of non-empty contact details, in display order.
function buildContactParts(
  personalInfo: MinimalPdfPersonalInfo,
  phoneNumber: string,
  selectedCountryCode: string
): string[] {
  const parts: string[] = [];

  if (personalInfo?.email) {
    parts.push(`${CONTACT_LABELS.email}${personalInfo.email.trim()}`);
  }

  if (phoneNumber) {
    const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
    parts.push(`${CONTACT_LABELS.phone}${dialPrefix}${phoneNumber}`.trim());
  }

  const location = personalInfo?.location || personalInfo?.city;
  if (location) {
    parts.push(`${CONTACT_LABELS.location}${location.trim()}`);
  }

  // Address (new): same "only push if present" rule as every other
  // part above — an empty/whitespace-only Address contributes nothing,
  // so it can never produce an empty segment or stray separator in the
  // joined contact line. Long addresses wrap naturally because they
  // flow through the exact same contactLine -> splitTextToSize() call
  // every other part already goes through in addHeader() — no separate
  // wrap width, no fixed Y position.
  const address = personalInfo?.address || personalInfo?.streetAddress;
  if (address) {
    parts.push(`${CONTACT_LABELS.address}${address.trim()}`);
  }

  if (personalInfo?.linkedin) {
    parts.push(`${CONTACT_LABELS.linkedin}${personalInfo.linkedin.trim()}`);
  }

  if (personalInfo?.github) {
    parts.push(`${CONTACT_LABELS.github}${personalInfo.github.trim()}`);
  }

  const webLink = personalInfo?.website || personalInfo?.portfolio;
  if (webLink) {
    parts.push(`${CONTACT_LABELS.website}${webLink.trim()}`);
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
function addSummary(doc: jsPDF, data: TealCurvePdfData, startY: number): number {
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
function addExperience(doc: jsPDF, data: TealCurvePdfData, startY: number): number {
  const experiences = (data.experiences || []).filter(hasUsableExperienceContent);

  if (experiences.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — this guard used to reserve only
  // "heading + one EXPERIENCE_TITLE_SIZE line" as a stand-in for "the
  // first entry", regardless of what that entry actually contained. A
  // real first entry is usually MORE than one line (title row +
  // company + description), so the heading could pass this check,
  // render at the bottom of the page, and then the first entry's OWN
  // (correctly-sized) checkPageBreak() would immediately push IT to
  // the next page — orphaning the heading exactly like the bug this
  // guard was meant to prevent. Sizing the guard against the REAL
  // first entry (via the same estimateExperienceEntryMinimumHeight()
  // addExperienceEntry() itself checks against) guarantees the heading
  // and its first entry can never be split across a page boundary.
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
function hasUsableExperienceContent(exp: MinimalPdfExperience | null | undefined): boolean {
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

// Computes the exact minimum vertical space one Experience entry needs
// (header row + company + FULL wrapped description), without drawing
// anything. Used by addExperienceEntry() itself for its own
// checkPageBreak() call AND by addExperience() to size its
// heading-guard against the REAL first entry instead of a generic
// one-line guess — see the ROOT-CAUSE FIX note on that guard above for
// why a generic guess isn't sufficient. Single source of truth, so the
// estimate and the entry's own render can never disagree.
function estimateExperienceEntryMinimumHeight(doc: jsPDF, exp: MinimalPdfExperience): number {
  const title = (exp.title || '').trim();
  const company = (exp.company || '').trim();
  const startDate = (exp.startDate || '').trim();
  const endDate = (exp.endDate || '').trim();
  const description = (exp.description || '').trim();
  const dateRange = [startDate, endDate].filter(Boolean).join(' – ');

  // BULLET-AWARE: each manual line break the user typed in the
  // description is one bullet item — see buildBulletDescriptionItems()/
  // renderBulletDescriptionLines() above (shared with Achievements and
  // Projects) — so this estimate's line count/wrap-width can never
  // drift out of parity with what addExperienceEntry() actually draws.
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const companyLines: string[] = company ? doc.splitTextToSize(company, CONTENT_WIDTH) : [];
  const companyHeight = companyLines.length * EXPERIENCE_SUBTITLE_SIZE;

  const titleRow = estimateTitleRowHeight(doc, title, dateRange);
  const hasTitleRow = Boolean(title || dateRange);

  const titleToCompanyGap = hasTitleRow && companyLines.length > 0 ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;
  const headerHeight = titleRow.height + titleToCompanyGap + companyHeight;
  const hasHeaderLine = hasTitleRow || companyLines.length > 0;
  const descriptionGap = hasHeaderLine && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const descriptionTotalHeight = descriptionLines.length * BODY_LINE_HEIGHT;
  const fullHeight = headerHeight + descriptionGap + descriptionTotalHeight;

  // INK-BOTTOM / KEEP-TOGETHER: this entry has an unbounded body-text
  // field (description), so a description too long for any single page
  // must still be able to flow across pages via its own per-line
  // checkPageBreak() calls (see the loop in addExperienceEntry()),
  // instead of being force-reserved as one unsplittable block.
  const hasDescription = descriptionLines.length > 0;
  const noDescriptionLastLineFontSize = companyLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : titleRow.lastLineFontSize;
  const lastLineFontSize = hasDescription ? BODY_SIZE : noDescriptionLastLineFontSize;
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSize;

  return keepTogetherHeight(
    inkBottomHeight(fullHeight, lastLineAdvance, lastLineFontSize),
    hasDescription
      ? inkBottomHeight(headerHeight + descriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(headerHeight, lastLineAdvance, lastLineFontSize)
  );
}

// Renders a single experience entry and returns the new Y position.
function addExperienceEntry(doc: jsPDF, exp: MinimalPdfExperience, startY: number): number {
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
  // buildBulletDescriptionItems()/renderBulletDescriptionLines() above),
  // matching the CV builder's own form/preview where each line is
  // already shown as one point.
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  // ROOT-CAUSE FIX — Company/employer line was previously drawn with a
  // single unwrapped doc.text(company, ...) call, unlike every other
  // metadata field in this file (institution in addEducationEntry,
  // credential in addCertificationEntry, tech/github in
  // addProjectEntry — all wrapped via doc.splitTextToSize()). A short
  // company name never exposed this, but once the company field holds
  // enough text to exceed CONTENT_WIDTH, the unwrapped line ran
  // straight past the right margin instead of wrapping onto a second
  // line — and because the entry's space budget below only ever
  // reserved EXPERIENCE_SUBTITLE_SIZE (one line) for it, the following
  // content (description) still started immediately underneath, so the
  // overflowing company text visually crowded/overlapped the next
  // block. Fixed by wrapping company the exact same way
  // institution/credential/tech/github already wrap in this file: same
  // helper (doc.splitTextToSize), same per-line advance convention
  // (own font size, no extra leading), same CONTENT_WIDTH every other
  // Experience-entry field already wraps against.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const companyLines: string[] = company ? doc.splitTextToSize(company, CONTENT_WIDTH) : [];
  const companyHeight = companyLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this ENTIRE entry needs — header
  // (title/date row + company line) AND every wrapped description
  // line, not just the first — so the whole entry always moves to a
  // new page together rather than splitting mid-entry (a job title
  // separated from its own company or description). Computed via the
  // shared estimateExperienceEntryMinimumHeight() (see its own comment
  // above addExperienceEntry) rather than inline here, so this
  // entry's own page-break check and addExperience()'s heading-guard
  // (which estimates the section's FIRST entry the same way) can never
  // drift out of parity with each other. ---
  const minimumEntrySpaceNeeded = estimateExperienceEntryMinimumHeight(doc, exp);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  const hasTitleRow = Boolean(title || dateRange);
  const hasHeaderLine = hasTitleRow || companyLines.length > 0;

  // --- Job title (left) + Date (right, same row) ---
  const titleRow = renderTitleRowWithDate(doc, title, dateRange, y);
  if (titleRow.hasContent) {
    y += titleRow.height;
    if (companyLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Company (its own line(s), below the title/date row). Wrapped
  // via companyLines (see the ROOT-CAUSE FIX comment above where
  // companyLines is built) instead of a single unwrapped doc.text()
  // call, so a long company/employer string wraps onto additional
  // lines — own font size per line, no extra leading, same convention
  // institutionLines/credentialLines already use elsewhere in this
  // file — instead of overflowing past the right margin. ---
  if (companyLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(companyLines, LEFT_MARGIN, y);
    y += companyHeight;
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
    // Uses titleRow.lastLineFontSize (rather than assuming the title
    // row always ends at EXPERIENCE_TITLE_SIZE) because the stacked-date
    // fallback in renderTitleRowWithDate() can make the date — not the
    // title — the row's true last line when there's no company after it.
    const lastLineFontSize = companyLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : titleRow.lastLineFontSize;
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
function addEducation(doc: jsPDF, data: TealCurvePdfData, startY: number): number {
  const educations = (data.educations || []).filter(hasUsableEducationContent);

  if (educations.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — same relationship
  // as "previous section -> Experience heading", so the same constant.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — sized against the REAL first entry (via the same
  // estimateEducationEntryMinimumHeight() addEducationEntry() itself
  // checks against) rather than a generic one-line guess — see the
  // matching note on addExperience()'s heading-guard for the full
  // analysis of why a generic guess can still orphan the heading.
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
function hasUsableEducationContent(edu: MinimalPdfEducation | null | undefined): boolean {
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

// Computes the exact minimum vertical space one Education entry needs
// (degree/date row + institution + grade), without drawing anything.
// Used by addEducationEntry() itself for its own checkPageBreak() call
// AND by addEducation() to size its heading-guard against the REAL
// first entry instead of a generic one-line guess — see the
// ROOT-CAUSE FIX note above addEducation() for the full analysis.
// Single source of truth, so the estimate and the entry's own render
// can never disagree.
function estimateEducationEntryMinimumHeight(doc: jsPDF, edu: MinimalPdfEducation): number {
  const degree = (edu.degree || '').trim();
  const institution = (edu.institution || '').trim();
  const year = (edu.year || '').trim();
  const grade = (edu.grade || '').trim();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, CONTENT_WIDTH) : [];
  const gradeLines: string[] = grade ? doc.splitTextToSize(`Grade: ${grade}`, CONTENT_WIDTH) : [];

  const institutionInternalWrapAdvance = institutionLines.length > 1
    ? (institutionLines.length - 1) * EXPERIENCE_SUBTITLE_SIZE
    : 0;
  const institutionTrailingAdvance = institutionLines.length === 0
    ? 0
    : gradeLines.length > 0 ? BODY_LINE_HEIGHT
    : EXPERIENCE_SUBTITLE_SIZE;
  const institutionSpaceNeeded = institutionLines.length > 0
    ? institutionInternalWrapAdvance + institutionTrailingAdvance
    : 0;

  const degreeRow = estimateTitleRowHeight(doc, degree, year);
  const hasDegreeRow = Boolean(degree || year);

  const titleToSubtitleGap = hasDegreeRow && institutionLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const headerHeight = degreeRow.height + titleToSubtitleGap + institutionSpaceNeeded;
  const headerToGradeGapForDegreeRowOnly = hasDegreeRow && institutionLines.length === 0 && gradeLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const gradeTotalHeight = gradeLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const fullHeight = headerHeight + headerToGradeGapForDegreeRowOnly + gradeTotalHeight;

  // INK-BOTTOM: no unbounded body-text field here — just title/date,
  // institution, and grade metadata lines — so this is the simple
  // "keep the whole entry together" case (see the matching comment in
  // estimateCertificationEntryMinimumHeight()).
  const lastLineFontSize = gradeLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : institutionLines.length > 0
      ? EXPERIENCE_SUBTITLE_SIZE
      : degreeRow.lastLineFontSize;
  const inkHeight = inkBottomHeight(fullHeight, lastLineFontSize, lastLineFontSize);
  return keepTogetherHeight(inkHeight, inkHeight);
}

// Renders a single education entry and returns the new Y position,
// normalized so every entry (not just the section's last one) ends on
// an equivalent trailing space — see the TRAILING-SPACE PARITY comment
// near the end of this function.
function addEducationEntry(
  doc: jsPDF,
  edu: MinimalPdfEducation,
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
  const gradeLines: string[] = grade ? doc.splitTextToSize(`Grade: ${grade}`, CONTENT_WIDTH) : [];

  // Multi-line metadata fields (institution/grade) use their own font
  // size as the per-line height, with no extra leading — the same
  // convention already used for the header's wrapped contact line in
  // addHeader(). BODY_LINE_HEIGHT (with its 1.4 multiplier) is
  // reserved for actual paragraph body text, which none of these
  // fields are.
  //
  // ROOT-CAUSE FIX — University Name -> Grade gap was too large because
  // the OLD code advanced y by Institution's own tight (no-leading)
  // metadata-line height AND THEN separately added
  // EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP on top of that before Grade —
  // double-counting "own line height" + "a gap", stacked (10pt + 6pt =
  // 16pt total, versus the 14.7pt BODY_LINE_HEIGHT used between two
  // consecutive lines of ordinary body/content text elsewhere in this
  // file).
  //
  // Fixed the same way as every other "metadata field -> next field"
  // gap that turned out to be a normal content-line transition: when
  // Grade follows Institution, Institution's transition INTO Grade is
  // now a single BODY_LINE_HEIGHT step, REPLACING (not stacking on top
  // of) Institution's own tight last-line advance. Institution's own
  // internal text-wrap (if the institution name itself wraps to more
  // than one line) is untouched and still advances between ITS OWN
  // wrapped lines using the existing tight metadata-line spacing — only
  // the FINAL line's transition into Grade changes. When there's no
  // Grade, Institution's own tight last-line advance is used, exactly
  // as before.
  //
  // The Degree/Date row -> Grade transition (when there's no
  // Institution at all) is unaffected by this fix and keeps using
  // EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP, exactly as before.
  const institutionInternalWrapAdvance = institutionLines.length > 1
    ? (institutionLines.length - 1) * EXPERIENCE_SUBTITLE_SIZE
    : 0;
  const institutionTrailingAdvance = institutionLines.length === 0
    ? 0
    : gradeLines.length > 0 ? BODY_LINE_HEIGHT
    : EXPERIENCE_SUBTITLE_SIZE;
  const institutionSpaceNeeded = institutionLines.length > 0
    ? institutionInternalWrapAdvance + institutionTrailingAdvance
    : 0;

  // --- Determine how much space this entry's degree/date row +
  // institution block needs, so the whole block moves to a new page
  // together rather than splitting a degree from its own institution
  // line. Computed via the shared estimateEducationEntryMinimumHeight()
  // (see its own comment above) rather than inline here, so this
  // entry's own page-break check and addEducation()'s heading-guard
  // can never drift out of parity with each other. ---
  const hasDegreeRow = Boolean(degree || year);
  const minimumEntrySpaceNeeded = estimateEducationEntryMinimumHeight(doc, edu);
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
    y += institutionInternalWrapAdvance;
    // University Name -> Grade: the normal content-line gap, replacing
    // Institution's own tight last-line advance rather than stacking on
    // top of it. When there's no Grade, this is Institution's own tight
    // last-line advance, unchanged.
    y += institutionTrailingAdvance;
  }

  // Degree/Date row -> Grade, only when there's no Institution line at
  // all — unchanged from before this fix.
  if (hasDegreeRow && institutionLines.length === 0 && gradeLines.length > 0) {
    y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
  }

  // --- Grade (optional, rendered with a "Grade:" label) ---
  if (gradeLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);

    for (const line of gradeLines) {
      y = checkPageBreak(doc, y, lineInkHeight(EXPERIENCE_SUBTITLE_SIZE));
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
      : degreeRow.lastLineFontSize;
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
function addSkills(doc: jsPDF, data: TealCurvePdfData, startY: number): number {
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
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + lineInkHeight(BODY_SIZE);
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
    y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));
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
// a shared import, since tealCurvePdf.ts is a self-contained renderer —
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
// Renders: "LANGUAGES" heading, then one line per entry:
//   Language Name — Proficiency label (optional, expanded from the
//   form's short code — see getProficiencyDisplayLabel())
//
// FORMAT NOTE: name and level render on the SAME line ("Name — Level")
// rather than stacked, using the same two-tone same-line technique
// renderSectionHeading() already uses for its accent/rest heading
// split: each segment is drawn with doc.text() in its own style, and
// the next segment's start X is measured with doc.getTextWidth() —
// never a hardcoded offset. The language name keeps its existing
// bold/COLOR_HEADING styling; the level keeps its existing
// normal/COLOR_METADATA styling — this file's own colors, unchanged.
//
// SHARED CONSTANT NOTE: reuses EXPERIENCE_TITLE_SIZE/COLOR_HEADING for
// the language name and EXPERIENCE_SUBTITLE_SIZE/COLOR_METADATA for the
// proficiency segment — the exact same title/subtitle visual
// relationship Experience and Education entries already use.
//
// ENTRY-TO-ENTRY SPACING (ROOT-CAUSE FIX): each language entry is a
// single compact line, not a multi-field stacked block — so, unlike
// Experience/Education/Achievements, no separate EXPERIENCE_ENTRY_GAP
// is added between entries here. topUpToLineHeight() (the same helper
// Education entries use) already normalizes each entry's trailing
// space up to one full BODY_LINE_HEIGHT-equivalent line — exactly the
// spacing every other simple line-based list in this file already
// relies on (e.g. Skills' bullet rows, wrapped description lines),
// with no additional gap layered on top. That normalization is what
// makes every language entry — 2, 3, 4, or more — follow the previous
// one on the immediate next line, and it still measures the same
// equal distance to whatever section comes next (via SECTION_GAP)
// regardless of which entry happens to be last, exactly as before —
// this file's own SECTION_GAP, untouched.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addLanguages(doc: jsPDF, data: TealCurvePdfData, startY: number): number {
  const languages = (data.languages || []).filter(hasUsableLanguageContent);

  if (languages.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — the same
  // relationship as every other "previous section -> next section" gap
  // in this file.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — sized against the REAL first entry (via the same
  // estimateLanguageEntryMinimumHeight() addLanguageEntry() itself
  // checks against) rather than a generic one-line guess — see the
  // matching note on addExperience()'s heading-guard for the full
  // analysis of why a generic guess can still orphan the heading.
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
function hasUsableLanguageContent(lang: MinimalPdfLanguage | null | undefined): boolean {
  if (!lang) {
    return false;
  }
  return Boolean((lang.language || '').trim() || (lang.proficiency || '').trim());
}

// Expands the form's stored short proficiency code to the same
// human-readable label LanguagesSection.tsx's own getProficiencyLabel()
// shows in its preview line. Intentionally duplicated (not imported)
// for the same reason parseSkillsList() duplicates getSkillArray()'s
// rule instead of sharing it: tealCurvePdf.ts is a self-contained
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

// LANGUAGE NAME/LEVEL SEPARATOR
// Each language entry displays as a single line: "Name — Level". This
// is the display separator between the two fields — a formatting
// constant, not a spacing/position value, so it does not affect any
// layout math, gap, or coordinate elsewhere in this file.
const LANGUAGE_NAME_LEVEL_SEPARATOR = ' — ';

// Computes the exact minimum vertical space one Language entry needs
// (the combined "Name — Level" line(s)), without drawing anything. Used
// by addLanguageEntry() itself for its own checkPageBreak() call AND
// by addLanguages() to size its heading-guard against the REAL first
// entry instead of a generic one-line guess — see the ROOT-CAUSE FIX
// note above addLanguages() for the full analysis. Single source of
// truth, so the estimate and the entry's own render can never disagree.
function estimateLanguageEntryMinimumHeight(doc: jsPDF, lang: MinimalPdfLanguage): number {
  const language = (lang.language || '').trim();
  const proficiencyRaw = (lang.proficiency || '').trim();
  const proficiencyLabel = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';
  const levelPart = proficiencyLabel ? `${LANGUAGE_NAME_LEVEL_SEPARATOR}${proficiencyLabel}` : '';
  const combinedText = `${language}${levelPart}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const combinedLines: string[] = combinedText ? doc.splitTextToSize(combinedText, CONTENT_WIDTH) : [];

  const fullHeight = combinedLines.length * EXPERIENCE_TITLE_SIZE;

  // INK-BOTTOM: a language entry is always a single metadata-style
  // block (no unbounded body-text field) — the simple "keep the whole
  // entry together" case.
  const inkHeight = inkBottomHeight(fullHeight, EXPERIENCE_TITLE_SIZE, EXPERIENCE_TITLE_SIZE);
  return keepTogetherHeight(inkHeight, inkHeight);
}

// Renders a single language entry and returns the new Y position,
// normalized so every entry — not only the section's last one — ends
// on a normal-content-line-equivalent trailing space, which is what
// lets addLanguages() place consecutive languages with no extra gap of
// its own. See the ROOT-CAUSE FIX note above addLanguages().
//
// Name and Level render on the SAME line ("Name — Level") rather than
// stacked, using the same two-tone same-line technique
// renderSectionHeading() already uses for its accent/rest heading
// split: each segment is drawn with doc.text() in its own style, and
// the next segment's start X is measured with doc.getTextWidth() —
// never a hardcoded offset. The language name keeps its existing
// bold/COLOR_HEADING styling; the level keeps its existing
// normal/COLOR_METADATA styling. Only the position changed (same line
// instead of a stacked line) — the styling itself is unchanged.
function addLanguageEntry(doc: jsPDF, lang: MinimalPdfLanguage, startY: number): number {
  let y = startY;

  const language = (lang.language || '').trim();
  const proficiencyRaw = (lang.proficiency || '').trim();
  const proficiencyLabel = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';

  // The " — Level" segment, including its separator, empty when there
  // is no proficiency (matching the form's own preview convention — no
  // artificial space reserved when absent).
  const levelPart = proficiencyLabel ? `${LANGUAGE_NAME_LEVEL_SEPARATOR}${proficiencyLabel}` : '';
  const combinedText = `${language}${levelPart}`;

  // Measure/wrap the combined "Name — Level" text as one field, the
  // same way addEducationEntry() wraps a single field. Measured with
  // the bold/EXPERIENCE_TITLE_SIZE font — the larger of the two styles
  // actually rendered below — so the wrap decision is conservative: it
  // never under-wraps relative to the widest of the two fonts in use.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const combinedLines: string[] = combinedText ? doc.splitTextToSize(combinedText, CONTENT_WIDTH) : [];

  // Multi-line fields use their own font size as the per-line height,
  // with no extra leading — the same metadata-line convention used by
  // the header's contact line and every Education field.
  const combinedHeight = combinedLines.length * EXPERIENCE_TITLE_SIZE;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a language name from
  // its own level. Computed via the shared
  // estimateLanguageEntryMinimumHeight() (see its own comment above)
  // rather than inline here, so this entry's own page-break check and
  // addLanguages()'s heading-guard can never drift out of parity. ---
  const minimumEntrySpaceNeeded = estimateLanguageEntryMinimumHeight(doc, lang);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  if (combinedLines.length === 1 && language && levelPart) {
    // Common case: "Name — Level" fits on one line. Draw the name and
    // the level as two same-line segments, each in its existing style,
    // with the level's start X measured via doc.getTextWidth().
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(language, LEFT_MARGIN, y);
    const languageWidth = doc.getTextWidth(language);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(levelPart, LEFT_MARGIN + languageWidth, y);
  } else if (combinedLines.length > 0) {
    // Language-name-only entry (no proficiency), or a combined string
    // long enough to wrap onto more than one line. Rendered in a
    // single style — the language name's existing bold/COLOR_HEADING
    // styling — rather than splitting a wrapped line across two fonts.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(combinedLines, LEFT_MARGIN, y);
  }

  y += combinedHeight;

  // Normalize every entry's end (not only the last) to a
  // body-line-equivalent trailing space — see the ROOT-CAUSE FIX note
  // above addLanguages() for why this makes that trailing space double
  // as the gap into the next language, and the matching comment inside
  // addEducationEntry() for the same topUpToLineHeight() convention.
  // This file's own topUpToLineHeight(), untouched.
  y = topUpToLineHeight(y, EXPERIENCE_TITLE_SIZE);

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
function addAchievements(doc: jsPDF, data: TealCurvePdfData, startY: number): number {
  const achievements = (data.achievements || []).filter(hasUsableAchievementContent);

  if (achievements.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one — the same
  // relationship as every other "previous section -> next section" gap
  // in this file.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — sized against the REAL first entry (via the same
  // estimateAchievementEntryMinimumHeight() addAchievementEntry() itself
  // checks against) rather than a generic one-line guess — see the
  // matching note on addExperience()'s heading-guard for the full
  // analysis of why a generic guess can still orphan the heading.
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
// ====================================================================
// TITLE + DATE SAME-ROW LAYOUT
// Shared by every pre-render "does this entry fit" estimate (Experience,
// Education, Achievements) AND renderTitleRowWithDate() itself, so
// measurement and rendering can never disagree — the same principle
// already used by sectionHeadingToContentOffset() above.
//
// ROOT-CAUSE FIX: the pre-existing formula reserved
// `CONTENT_WIDTH - dateWidth - TITLE_TO_DATE_GAP_PT` for the title
// whenever a date was present, assuming that width would always be
// large enough to hold real text. When a wide date (a long date range,
// or a long single date string) left only a few points of room, that
// assumption broke: doc.splitTextToSize() falls back to breaking a
// word one CHARACTER at a time whenever the word doesn't fit the given
// width at all — which is exactly what produced a vertical,
// one-letter-per-line rendering for a title sharing a row with a wide
// date, along with the date itself running past the page edge.
// Comparing the reserved width against the title's own longest word
// (measured from the real title text, not an invented constant) is
// what detects that failure mode before it happens, so the fallback
// below only ever engages when it's genuinely needed — a title/date
// pairing that already fits keeps rendering exactly as it did before
// this fix.
// ====================================================================
function computeTitleRowLayout(
  doc: jsPDF,
  title: string,
  date: string
): { titleWrapWidth: number; dateSharesRow: boolean; dateWidth: number } {
  if (!date) {
    return { titleWrapWidth: CONTENT_WIDTH, dateSharesRow: false, dateWidth: 0 };
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateWidth = doc.getTextWidth(date);
  const sharedRowTitleWidth = Math.max(0, CONTENT_WIDTH - dateWidth - TITLE_TO_DATE_GAP_PT);

  if (!title) {
    // Nothing to wrap-check against — the date sits alone on the row,
    // exactly as before this fix.
    return { titleWrapWidth: sharedRowTitleWidth, dateSharesRow: true, dateWidth };
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const longestTitleWordWidth = title
    .split(/\s+/)
    .filter(Boolean)
    .reduce((max, word) => Math.max(max, doc.getTextWidth(word)), 0);

  // The row can only host the title AND the date if: (a) a real word of
  // the title still fits in the space the date leaves behind — if it
  // doesn't, sharing the row is what forces the character-by-character
  // wrap — and (b) that space is at least half the content width, so an
  // extremely wide date can't squeeze the title into a technically-word-
  // wrapping but absurdly narrow, tall column instead (still wrong, just
  // a milder version of the same failure). When either check fails, the
  // title instead gets the FULL content width (wrapping normally on
  // whitespace) and the date moves to its own line below.
  const minSharedRowTitleWidth = CONTENT_WIDTH / 2;
  const dateSharesRow = sharedRowTitleWidth >= longestTitleWordWidth
    && sharedRowTitleWidth >= minSharedRowTitleWidth;
  return {
    titleWrapWidth: dateSharesRow ? sharedRowTitleWidth : CONTENT_WIDTH,
    dateSharesRow,
    dateWidth,
  };
}

// Computes the exact height renderTitleRowWithDate() will consume for a
// given title/date pair, without drawing anything — used by every
// caller's pre-render "does this entry fit" estimate. Mirrors
// renderTitleRowWithDate()'s own line-count/height logic exactly
// (including the stacked-date fallback from computeTitleRowLayout()
// above), so the estimate and the actual render can never disagree.
function estimateTitleRowHeight(doc: jsPDF, title: string, date: string): { height: number; lastLineFontSize: number } {
  const { titleWrapWidth, dateSharesRow } = computeTitleRowLayout(doc, title, date);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const lineCount = title ? doc.splitTextToSize(title, titleWrapWidth).length : 0;

  // Mirrors renderTitleRowWithDate()'s own line-count/height/
  // lastLineFontSize logic exactly (including the stacked-date
  // fallback), so this pre-render estimate and the actual render can
  // never disagree about which line — and which font size — is truly
  // the row's last one.
  if (lineCount === 0) {
    return { height: date ? EXPERIENCE_SUBTITLE_SIZE : 0, lastLineFontSize: EXPERIENCE_SUBTITLE_SIZE };
  }
  if (dateSharesRow) {
    return { height: lineCount * EXPERIENCE_TITLE_SIZE, lastLineFontSize: EXPERIENCE_TITLE_SIZE };
  }
  // Stacked fallback: title's own internal wrap advance for every line
  // except the last ((lineCount - 1) * EXPERIENCE_TITLE_SIZE), then the
  // title->date step (BODY_LINE_HEIGHT — the file's normal content-line
  // advance), then the date's own line — the date is the true last line.
  return {
    height: (lineCount - 1) * EXPERIENCE_TITLE_SIZE + BODY_LINE_HEIGHT + EXPERIENCE_SUBTITLE_SIZE,
    lastLineFontSize: EXPERIENCE_SUBTITLE_SIZE,
  };
}

function renderTitleRowWithDate(
  doc: jsPDF,
  title: string,
  date: string,
  y: number
): { lines: string[]; height: number; hasContent: boolean; lastLineFontSize: number } {
  const { titleWrapWidth, dateSharesRow, dateWidth } = computeTitleRowLayout(doc, title, date);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleLines: string[] = title ? doc.splitTextToSize(title, titleWrapWidth) : [];

  if (titleLines.length > 0) {
    doc.setTextColor(...COLOR_HEADING);
    doc.text(titleLines, LEFT_MARGIN, y);
  }

  if (date && dateSharesRow) {
    const rightBoundary = PAGE_WIDTH - RIGHT_MARGIN;
    // Clamped to LEFT_MARGIN so a date that's (rarely) wider than the
    // whole content area still starts inside the page instead of
    // running off the left edge.
    const dateX = Math.max(LEFT_MARGIN, rightBoundary - dateWidth);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    // DATE COLOR FIX: the date must render in EXACTLY the same color as
    // its own section's heading. This helper is shared by Experience,
    // Education, and Achievements, and every section heading (drawn via
    // renderSectionHeading() above) already gets its color from the one
    // shared COLOR_SECTION_HEADLINE constant — so reusing that same
    // constant here automatically satisfies "Experience Date =
    // Experience Heading", "Education Date = Education Heading", and
    // "Achievement Date = Achievement Heading" all at once, for every
    // section that calls this function, and stays in sync automatically
    // if COLOR_SECTION_HEADLINE ever changes. COLOR_DATE (the previous
    // source) is left declared, just unused here now, since removing
    // constants is outside the scope of this change.
    doc.setTextColor(...COLOR_SECTION_HEADLINE);
    doc.text(date, dateX, y); // same baseline row as the title's first line
  } else if (date) {
    // FALLBACK — the date doesn't leave enough room to share the
    // title's row without forcing a character-by-character wrap (see
    // computeTitleRowLayout()'s doc comment above). Render it on its
    // own line directly below the title instead, using BODY_LINE_HEIGHT
    // for the title->date step — the same normal content-line advance
    // already used everywhere else in this file for a line that
    // follows body/title content — and still right-aligned, matching
    // this row's usual date placement.
    const dateY = titleLines.length > 0
      ? y + (titleLines.length - 1) * EXPERIENCE_TITLE_SIZE + BODY_LINE_HEIGHT
      : y;
    const rightBoundary = PAGE_WIDTH - RIGHT_MARGIN;
    const dateX = Math.max(LEFT_MARGIN, rightBoundary - dateWidth);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_SECTION_HEADLINE);
    doc.text(date, dateX, dateY);
  }

  const hasContent = titleLines.length > 0 || Boolean(date);
  let height: number;
  // The font size of whatever line this function ACTUALLY drew last —
  // normally the title's own size, but the stacked-date fallback above
  // means the date (at its own, smaller size) can be the true last
  // line instead. Callers use this (rather than re-deriving their own
  // title/date assumption) to keep their own trailing-space top-up
  // correct in both cases.
  let lastLineFontSize: number;
  if (titleLines.length === 0) {
    height = date ? EXPERIENCE_SUBTITLE_SIZE : 0;
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
  } else if (dateSharesRow) {
    height = titleLines.length * EXPERIENCE_TITLE_SIZE;
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
  } else {
    height = (titleLines.length - 1) * EXPERIENCE_TITLE_SIZE + BODY_LINE_HEIGHT + EXPERIENCE_SUBTITLE_SIZE;
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE; // stacked date is the true last line
  }

  return { lines: titleLines, height, hasContent, lastLineFontSize };
}

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
// manual '\n' breaks respected exactly like every other description
// field in this file) and wraps each item's text to the page width
// minus BULLET_DOT_TO_TEXT_GAP_PT, since every item's text is indented
// past its dot. Shared by every section's own
// estimate*EntryMinimumHeight() (space estimate) AND its add*Entry()
// (the actual render) so the pre-render estimate and the real output
// can never disagree about line counts or wrap width.
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
    .map((rawLine) => parseBulletLine(rawLine))
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
        doc.setTextColor(...COLOR_SECTION_HEADING); // bullet dot — Minimal PDF's own section-heading/accent color
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
// needs (title/date row + FULL wrapped description), without drawing
// anything. Used by addAchievementEntry() itself for its own
// checkPageBreak() call AND by addAchievements() to size its
// heading-guard against the REAL first entry instead of a generic
// one-line guess — see the ROOT-CAUSE FIX note above addAchievements()
// for the full analysis. Single source of truth, so the estimate and
// the entry's own render can never disagree.
function estimateAchievementEntryMinimumHeight(doc: jsPDF, ach: any): number {
  const title = (ach.title || '').trim();
  const date = (ach.date || '').trim();
  const description = (ach.description || '').trim();

  // Uses the SAME buildBulletDescriptionItems() the real render
  // uses (see its own doc comment above), so this estimate's line
  // count/wrap-width can never drift out of parity with what
  // addAchievementEntry() actually draws.
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const titleRow = estimateTitleRowHeight(doc, title, date);
  const hasHeaderContent = Boolean(title || date);
  const headerToDescriptionGap = hasHeaderContent && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const descriptionTotalHeight = descriptionLines.length * BODY_LINE_HEIGHT;
  const headerHeight = titleRow.height;
  const fullHeight = headerHeight + headerToDescriptionGap + descriptionTotalHeight;

  // INK-BOTTOM / KEEP-TOGETHER: an achievement's description is an
  // unbounded body-text field — a description too long for any single
  // page must still be able to flow across pages via its own per-line
  // checkPageBreak() calls (see renderBulletDescriptionLines()),
  // instead of being force-reserved as one unsplittable block.
  const hasDescription = descriptionLines.length > 0;
  const lastLineFontSize = hasDescription ? BODY_SIZE : titleRow.lastLineFontSize;
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSize;

  return keepTogetherHeight(
    inkBottomHeight(fullHeight, lastLineAdvance, lastLineFontSize),
    hasDescription
      ? inkBottomHeight(headerHeight + headerToDescriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(headerHeight, lastLineAdvance, lastLineFontSize)
  );
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
  // BULLET-AWARE, ONE-BULLET-PER-ITEM: each manual line break the user
  // typed (split on '\n') is one ACHIEVEMENT ITEM and always gets a
  // bullet dot — see BULLET_MARKER_PATTERN/parseBulletLine() above —
  // never more than one dot regardless of how many lines that item
  // wraps into. `descriptionItems` (built via the shared
  // buildBulletDescriptionItems(), also used by the page-break estimate
  // above, so the two can never disagree) keeps that grouping — one
  // array entry per item, each carrying its own wrapped lines — so
  // renderBulletDescriptionLines() can draw exactly one dot per item.
  // `descriptionLines` (the flat list of every wrapped line, across all
  // items) is kept alongside it purely for the page-break/space
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
  let lastLineFontSize: number;
  if (descriptionLines.length > 0) {
    // Description already ends at body-line-equivalent
    return y;
  } else {
    // Uses titleRow.lastLineFontSize (rather than assuming the title
    // row always ends at EXPERIENCE_TITLE_SIZE) because the stacked-date
    // fallback in renderTitleRowWithDate() can make the date — not the
    // title — the row's true last line.
    lastLineFontSize = titleRow.lastLineFontSize;
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
function addCertifications(doc: jsPDF, data: TealCurvePdfData, startY: number): number {
  const certifications = (data.certifications || []).filter(hasUsableCertificationContent);

  if (certifications.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (Education) and this section.
  // This is the SAME SECTION_GAP used by all other section transitions.
  // No special Education→Certifications gap constant exists or is needed.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — sized against the REAL first entry (via the same
  // estimateCertificationEntryMinimumHeight() addCertificationEntry()
  // itself checks against) rather than a generic one-line guess — see
  // the matching note on addExperience()'s heading-guard for the full
  // analysis of why a generic guess can still orphan the heading.
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
    (cert.name || '').trim() ||
    (cert.date || '').trim() ||
    (cert.credentialId || '').trim()
  );
}

// Computes the exact minimum vertical space one Certification entry
// needs (name + date + credential ID), without drawing anything. Used
// by addCertificationEntry() itself for its own checkPageBreak() call
// AND by addCertifications() to size its heading-guard against the
// REAL first entry instead of a generic one-line guess — see the
// ROOT-CAUSE FIX note above addCertifications() for the full analysis.
// Single source of truth, so the estimate and the entry's own render
// can never disagree.
// NAME/DATE FORMAT: name + date now share a single title row — name on
// the left, date right-aligned on the SAME line — computed via the
// shared estimateTitleRowHeight() helper, the exact same one
// estimateExperienceEntryMinimumHeight() uses for its own title/date
// row. This is a deliberate parity choice: Certifications' date should
// look and behave identically to Experience's date (same position,
// same size, same color, same shared-row/stacked-fallback wrapping
// rule), not a Certifications-specific format. Credential ID keeps
// its own line below, the same role Experience's company line plays.
function estimateCertificationEntryMinimumHeight(doc: jsPDF, cert: any): number {
  const name = (cert.name || '').trim();
  const date = (cert.date || '').trim();
  const credentialId = (cert.credentialId || '').trim();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const credentialLines: string[] = credentialId ? doc.splitTextToSize(credentialId, CONTENT_WIDTH) : [];
  const credentialHeight = credentialLines.length * EXPERIENCE_SUBTITLE_SIZE;

  const titleRow = estimateTitleRowHeight(doc, name, date);
  const hasTitleRow = Boolean(name || date);

  const titleRowToCredentialGap = hasTitleRow && credentialLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;

  const fullHeight = titleRow.height + titleRowToCredentialGap + credentialHeight;

  // INK-BOTTOM: no unbounded body-text field here — just a name/date
  // row and an optional credential-ID metadata line — so this is the
  // simple "keep the whole entry together" case.
  const lastLineFontSize = credentialLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : titleRow.lastLineFontSize;
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

  const name = (cert.name || '').trim();
  const date = (cert.date || '').trim();
  const credentialId = (cert.credentialId || '').trim();

  // Date now renders RIGHT-ALIGNED on the SAME row as the certification
  // name (previously its own line below the name, in COLOR_METADATA) —
  // via the shared renderTitleRowWithDate() helper (see its own doc
  // comment above), the exact same helper/format Experience, Education,
  // and Achievements already use for their own title/date rows (same
  // position, same size, same shared-row/stacked-fallback wrapping
  // rule). Color comes along for free too: renderTitleRowWithDate()
  // always paints its date in COLOR_SECTION_HEADLINE, so Certifications'
  // date now matches Experience's date color exactly, automatically
  // staying in sync if that shared constant ever changes. Credential ID
  // keeps its own line directly below, unchanged in every other respect
  // — same role Experience's company line plays.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const credentialLines: string[] = credentialId ? doc.splitTextToSize(credentialId, CONTENT_WIDTH) : [];
  const credentialHeight = credentialLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a name/date row from
  // its credential ID. Computed via the shared
  // estimateCertificationEntryMinimumHeight() (see its own comment
  // above) rather than inline here, so this entry's own page-break
  // check and addCertifications()'s heading-guard can never drift out
  // of parity. ---
  const minimumEntrySpaceNeeded = estimateCertificationEntryMinimumHeight(doc, cert);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  const hasTitleRow = Boolean(name || date);

  // --- Certification Name (left) + Date (right, same row) ---
  const titleRow = renderTitleRowWithDate(doc, name, date, y);
  if (titleRow.hasContent) {
    y += titleRow.height;
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
  // The last line could be credential (EXPERIENCE_SUBTITLE_SIZE) or
  // whatever renderTitleRowWithDate() actually drew last — normally
  // the name (EXPERIENCE_TITLE_SIZE), but its stacked-date fallback
  // can make the date (EXPERIENCE_SUBTITLE_SIZE) the row's true last
  // line instead, exactly like addExperienceEntry() accounts for via
  // titleRow.lastLineFontSize.
  const hasHeaderLine = hasTitleRow || credentialLines.length > 0;
  if (hasHeaderLine) {
    const lastLineFontSize = credentialLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : titleRow.lastLineFontSize;
    y = topUpToLineHeight(y, lastLineFontSize);
  }

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
function addProjects(doc: jsPDF, data: TealCurvePdfData, startY: number): number {
  const projects = (data.projects || []).filter(hasUsableProjectContent);

  if (projects.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (Achievements) and this section.
  // This is the SAME SECTION_GAP used by all other section transitions.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — sized against the REAL first entry (via the same
  // estimateProjectEntryMinimumHeight() addProjectEntry() itself
  // checks against) rather than a generic one-line guess — see the
  // matching note on addExperience()'s heading-guard for the full
  // analysis of why a generic guess can still orphan the heading.
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
    (project.name || '').trim() ||
    (project.tech || '').trim() ||
    (project.description || '').trim() ||
    (project.github || '').trim()
  );
}

// Computes the exact minimum vertical space one Project entry needs
// (name + tech + FULL wrapped description + github), without drawing
// anything. Used by addProjectEntry() itself for its own
// checkPageBreak() call AND by addProjects() to size its heading-guard
// against the REAL first entry instead of a generic one-line guess —
// see the ROOT-CAUSE FIX note above addProjects() for the full
// analysis. Single source of truth, so the estimate and the entry's
// own render can never disagree.
function estimateProjectEntryMinimumHeight(doc: jsPDF, project: any): number {
  const name = (project.name || '').trim();
  const tech = (project.tech || '').trim();
  const description = (project.description || '').trim();
  const github = (project.github || '').trim();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const nameLines: string[] = name ? doc.splitTextToSize(name, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const techLines: string[] = tech ? doc.splitTextToSize(tech, CONTENT_WIDTH) : [];

  // BULLET-AWARE: each manual line break the user typed in the
  // description is one bullet item — see buildBulletDescriptionItems()/
  // renderBulletDescriptionLines() above (shared with Experience and
  // Achievements) — so this estimate's line count/wrap-width can never
  // drift out of parity with what addProjectEntry() actually draws.
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
  // NOTE: there is deliberately no separate "nameToDescriptionGap" term
  // here. headerToDescriptionGap above already covers EVERY header ->
  // description transition (name-only, tech-only, or name+tech), since
  // its own condition is `hasHeaderContent && descriptionLines.length > 0`.
  // A second, narrower term that re-added the same gap specifically for
  // the "name present, no tech" case used to double-count that single
  // gap — this estimate must mirror the render function's single-gap
  // fix in addProjectEntry() exactly, or the two would drift out of
  // parity again (see the matching comment there).
  const techToGithubGap = techLines.length > 0 && githubLines.length > 0 && descriptionLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const nameToGithubGap = nameLines.length > 0 && githubLines.length > 0 && techLines.length === 0 && descriptionLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;

  const headerHeight = nameHeight + nameToTechGap + techHeight;
  const fullHeight = headerHeight +
    headerToDescriptionGap + descriptionHeight +
    descriptionToGithubGap + githubHeight + techToGithubGap + nameToGithubGap;

  // INK-BOTTOM / KEEP-TOGETHER: a project's description is an
  // unbounded body-text field — a description too long for any single
  // page must still be able to flow across pages via its own per-line
  // checkPageBreak() calls (see the loop in addProjectEntry()), instead
  // of being force-reserved as one unsplittable block.
  const hasDescription = descriptionLines.length > 0;
  const noDescriptionLastLineFontSize = githubLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : techLines.length > 0
      ? EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_TITLE_SIZE;
  const lastLineFontSize = hasDescription ? BODY_SIZE : noDescriptionLastLineFontSize;
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSize;

  return keepTogetherHeight(
    inkBottomHeight(fullHeight, lastLineAdvance, lastLineFontSize),
    hasDescription
      ? inkBottomHeight(headerHeight + headerToDescriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(headerHeight, lastLineAdvance, lastLineFontSize)
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

  // The description textarea allows the user to type their own line
  // breaks (e.g. one line per bullet point). Those manual breaks are
  // preserved — each typed line becomes one bullet item (see
  // buildBulletDescriptionItems()/renderBulletDescriptionLines() above),
  // matching the CV builder's own form/preview where each line is
  // already shown as one point.
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
  const descriptionHeight = descriptionLines.length * BODY_LINE_HEIGHT;
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
// INK-BOTTOM PAGE-BREAK MEASUREMENT
// ------------------------------------------------------------------
// Every checkPageBreak() reservation below this comment used to
// reserve a full line-advance (e.g. BODY_LINE_HEIGHT, which bakes in
// leading meant for the line AFTER it) for the LAST line of whatever
// it was measuring. At the very bottom of a page that silently wastes
// extra space on top of the real BOTTOM_MARGIN, since there is no
// "next line" to lead into. These three helpers measure instead from a
// block's first baseline down to the actual INK BOTTOM (descender) of
// its last line — pure logic, no design values of their own.
// ====================================================================

// Caps a "keep this entry together" reservation at the page's usable
// height: if the full entry doesn't fit on any single page anyway
// (fullHeight > PAGE_USABLE_HEIGHT), reserving the full amount would
// mean checkPageBreak() could demand a fresh page that STILL can't
// hold it — starting an infinite run of blank pages. In that case,
// only leadHeight (the smaller, header-only reservation) is reserved,
// capped at PAGE_USABLE_HEIGHT, and the entry's own per-line
// checkPageBreak() calls handle flowing the rest across pages.
function keepTogetherHeight(fullHeight: number, leadHeight: number): number {
  if (fullHeight <= PAGE_USABLE_HEIGHT) {
    return fullHeight;
  }
  return Math.min(leadHeight, PAGE_USABLE_HEIGHT);
}

// The real ink-height of a single line at a given font size — how far
// its glyphs actually extend below the baseline they're drawn on
// (HELVETICA_DESCENT_RATIO, declared above), rather than the fuller
// baseline-to-baseline leading (e.g. BODY_LINE_HEIGHT) meant for the
// line that would follow it.
function lineInkHeight(fontSize: number): number {
  return fontSize * HELVETICA_DESCENT_RATIO;
}

// The real ink-bottom height of a whole block: its full baseline-to-
// baseline blockHeight, minus the last line's own full advance
// (lastLineAdvance — whatever leading that line was given), plus that
// last line's real ink-bottom (lineInkHeight(lastLineFontSize)).
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
    doc.addPage();
    return TOP_MARGIN;
  }
  return y;
}