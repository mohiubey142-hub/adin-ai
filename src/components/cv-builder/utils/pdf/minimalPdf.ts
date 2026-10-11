/**
 * minimalPdf.ts
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
const BOTTOM_MARGIN = 40; // matches modernPdf.ts's bottom-safety margin exactly, per user request

// Usable horizontal space for text, after subtracting both margins.
// Used for text-wrapping calculations.
const CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;

// Usable VERTICAL space on a single page, after subtracting both
// margins — i.e. the absolute most any single reservation passed to
// checkPageBreak() could ever fit into. Used by keepTogetherHeight()
// below to cap "keep this whole block together" reservations at a
// realistic ceiling, so an entry that could never fit on any one page
// doesn't force checkPageBreak() into an infinite/needless page churn,
// and by the AUTO-FIT-TO-ONE-PAGE pass to judge how much a 2-page
// result overflows by. Page-flow logic only — never read by any
// visual/positioning code in this file.
const PAGE_USABLE_HEIGHT = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

// ====================================================================
// TYPOGRAPHY CONSTANTS (font sizes, in points)
//
// AUTO-FIT-TO-ONE-PAGE (dynamic scale): the constants below that
// actually drive a multi-page resume's bulk (body/entry text sizes and
// the SPACING CONSTANTS further down) — NOT the header's own
// typography/photo, which stays fixed regardless — are declared as
// BASE_* originals plus a mutable current value, so generateMinimalPDF()
// can uniformly shrink them (never the header, margins, or colors) when
// a resume spills only a small amount onto a second page. See
// recomputeScaledConstants() and generateMinimalPDF() near the end of
// this file for the full feature. SCALE_FACTOR stays at 1 (every value
// below equal to its BASE_*) unless that auto-fit pass decides a
// smaller factor is needed — so a resume that already fits on one page
// renders byte-for-byte identical to before this feature existed. This
// mirrors the SAME auto-fit mechanism used by modernPdf.ts — the scaled
// SET of constants below is chosen the same way modernPdf.ts chooses
// its own (typography/spacing that drives bulk; never header/margins/
// colors/hairline strokes) — but every one of Minimal's own values
// (sizes, gaps, colors, layout) is untouched and comes from this file
// alone.
// ====================================================================
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
// than being redefined per section. Not itself scaled — it's a pure
// ratio applied to BODY_SIZE, which IS scaled.
const BODY_LINE_HEIGHT_MULTIPLIER = 1.4;

// The actual computed line height used whenever BODY_SIZE text wraps
// across multiple lines. Computed once here instead of recomputing
// `BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER` inline in every section.
// Recomputed by recomputeScaledConstants() whenever BODY_SIZE changes.
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
let DIVIDER_SIDE_GAP_PT = BASE_DIVIDER_SIDE_GAP_PT; // scaled by the auto-fit pass, see SCALE_FACTOR above

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
// these constants at all.
const NO_PHOTO_NAME_DOWN_SHIFT_MM = 2;
const NO_PHOTO_NAME_DOWN_SHIFT_PT = NO_PHOTO_NAME_DOWN_SHIFT_MM * MM_TO_PT; // 2mm, ≈ 5.6693pt
const NO_PHOTO_TITLE_DOWN_SHIFT_MM = 1;
const NO_PHOTO_TITLE_DOWN_SHIFT_PT = NO_PHOTO_TITLE_DOWN_SHIFT_MM * MM_TO_PT; // 1mm, ≈ 2.8346pt

// --- Photo-present header: whole-block downward shift ---
// With a profile photo the ENTIRE header block (photo, name, job title,
// contact line) starts this much lower. Fed into the real cursor math in
// addHeader()'s photo branch (every photo/title/contact position derives
// from nameBaselineY), so the divider and every section below move by
// this SAME amount and no gap changes. Without a photo nothing changes.
// Mirrors PHOTO_CONTENT_DOWN_SHIFT in MinimalTemplate.tsx 1:1.
const PHOTO_CONTENT_DOWN_SHIFT_MM = 3;
const PHOTO_CONTENT_DOWN_SHIFT_PT = PHOTO_CONTENT_DOWN_SHIFT_MM * MM_TO_PT; // 3mm, ≈ 8.5039pt

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
//
// HEADER_PHOTO_SIZE_BASE_PT: the photo's diameter BEFORE the requested
// +4pt increase. Declared as its own constant — rather than inlining
// 75 again — because it is now also the fixed VERTICAL-POSITION anchor
// used below in addHeader() (see photoBottomY): growing the drawn
// diameter is intentionally decoupled from where the photo's BOTTOM
// edge sits, so the Contact line's own Y position and the Image <->
// Contact gap never move when this size changes, only the drawn circle
// does. Root cause this avoids: the previous formula centered the
// photo purely from HEADER_PHOTO_SIZE_PT itself (both the "how big"
// and "where centered" questions read the same, growing number), so
// any size change would have shifted the photo's bottom edge — and,
// through the photoOverhang calculation, the Contact line under it —
// by half of the size delta, even though Contact's own text position
// never changed. Anchoring the bottom edge to this fixed BASE value
// instead removes that coupling entirely.
const HEADER_PHOTO_SIZE_BASE_PT = 75; // pt — the pre-increase diameter, also the fixed vertical anchor

// SIZE UPDATE (+4pt): requested increase on top of
// HEADER_PHOTO_SIZE_BASE_PT, declared as its own explicit term (rather
// than folded into a new literal) so this file's history of size
// changes stays legible and independently traceable.
const HEADER_PHOTO_SIZE_INCREASE_PT = 4; // pt — requested +4px increase (kept as-is; this was the CURRENT rendered increase before this change)

// SIZE UPDATE (+6pt): a second, later requested increase, applied on
// top of the CURRENT rendered size (base + the +4pt above) rather than
// on top of HEADER_PHOTO_SIZE_BASE_PT — declared as its own explicit
// term for the same "legible, independently traceable" reason as
// HEADER_PHOTO_SIZE_INCREASE_PT above, and kept separate from it so
// neither term has to be rewritten/merged to record this history.
const HEADER_PHOTO_SIZE_ADDITIONAL_INCREASE_PT = 6; // pt — requested +6px increase on top of the current (75+4=79pt) rendered size

// HEADER_PHOTO_SIZE_PT: the single source of truth for the header
// photo's DRAWN size — every rendering consumer (circle radius, image
// draw width/height, aspect-ratio "cover" fit, and the horizontal
// photo-to-text gap calculation) reads this one constant, so the
// increase is automatically proportional and never distorts the
// image. HEADER_PHOTO_SIZE_BASE_PT above (not this constant) is what
// governs the image's vertical anchor (see photoBottomY in
// addHeader()), so this value changing only ever changes how big the
// circle is drawn — never where its bottom edge, the Contact line, or
// the Image <-> Contact gap sit.
// SIZE UPDATE (-10%): requested reduction applied to the CURRENT
// rendered size (base + both increases above = 85pt), declared as its
// own explicit named factor for the same "legible, independently
// traceable" reason as the two increase terms above, rather than
// folding a new literal into the sum or replacing it with a fresh
// pixel value. This is the single semantic scale factor for the
// requested "current size × 90%" change — every rendering consumer
// below (circle radius, image draw width/height, the photo-to-text
// gap math) reads it automatically because it only ever reads
// HEADER_PHOTO_SIZE_PT, never HEADER_PHOTO_SIZE_BASE_PT +
// HEADER_PHOTO_SIZE_INCREASE_PT + HEADER_PHOTO_SIZE_ADDITIONAL_INCREASE_PT
// directly.
const HEADER_PHOTO_SIZE_REDUCTION_FACTOR = 0.9; // 90% of the current rendered size (i.e. an exact 10% reduction)
const HEADER_PHOTO_SIZE_PT = (HEADER_PHOTO_SIZE_BASE_PT + HEADER_PHOTO_SIZE_INCREASE_PT + HEADER_PHOTO_SIZE_ADDITIONAL_INCREASE_PT) * HEADER_PHOTO_SIZE_REDUCTION_FACTOR; // pt — (75pt base + 4pt + 6pt = 85pt) × 90% = 76.5pt
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

// --- Bullet-formatted descriptions (Achievements) ---
// No bullet-dot rendering existed anywhere in this file before this
// change — there is no prior "Experience/Projects bullet system" to
// reuse, so this is a new, single, centralized helper
// (renderBulletDescriptionLines(), declared near addAchievementEntry()
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

// --- Experience vertical timeline (ported from OLD minimalPdf.ts's
// per-entry timeline — see renderTimelineEntry() there) ---
// OLD drew a thin vertical rule to the left of each Experience entry,
// with the entry's own title/company/date/description content indented
// to its right, out of the rule's way. Reproducing that same "marker
// column, then indented text" structure here reuses the file's EXISTING
// marker-to-text gap (BULLET_DOT_TO_TEXT_GAP_PT — already used between a
// bullet dot and its text in Achievements/Projects) rather than inventing
// a new, timeline-specific indent: the timeline rule plays exactly the
// same "marker" role the bullet dot already plays elsewhere in this
// file. The rule itself sits at LEFT_MARGIN (the same X every other
// marker in this file — bullet dots included — is drawn at), so no new
// X-coordinate constant is introduced either.
let EXPERIENCE_TIMELINE_CONTENT_INDENT_PT = BULLET_DOT_TO_TEXT_GAP_PT; // scaled alongside BULLET_DOT_TO_TEXT_GAP_PT — see recomputeScaledConstants()

// EXPERIENCE_TIMELINE_START_EXTENSION: requested change — the timeline
// rule's START (its top end) should begin 0.5mm EARLIER (i.e. further
// up the page, at a smaller Y) than wherever it currently starts, while
// its END (bottom) stays exactly where it already is (locked/unchanged).
// Declared in mm and converted through the file's existing MM_TO_PT
// conversion constant — same convention as every other mm-based offset
// in this file (DIVIDER_SIDE_GAP_PT, NO_PHOTO_NAME_DOWN_SHIFT_PT,
// BULLET_DOT_TO_TEXT_GAP_PT, TITLE_TO_DATE_GAP_PT, etc.) — rather than
// hardcoding a raw pt number. Only the top-edge calculation (timelineTopY)
// below subtracts this; the bottom-edge calculation (timelineBottomY) is
// untouched, which is what keeps the ending locked.
const EXPERIENCE_TIMELINE_START_EXTENSION_MM = 0.5;
const EXPERIENCE_TIMELINE_START_EXTENSION_PT = EXPERIENCE_TIMELINE_START_EXTENSION_MM * MM_TO_PT; // ≈ 1.4173pt

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
// no per-section hardcoding. OLD theme's `primary`.
const COLOR_SECTION_HEADING = [40, 40, 45] as const;
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

export interface MinimalPdfData {
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
// generateMinimalPDF, before knowing whether the next section will
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
// ====================================================================
// AUTO-FIT-TO-ONE-PAGE (dynamic scale)
// ====================================================================
// Applies SCALE_FACTOR to every scalable constant declared above
// (body/entry text sizes, section/entry/bullet gaps, the divider gap,
// and the language-separator/timeline-indent constants derived from
// them) by deriving each one fresh from its BASE_* original.
// Deliberately excludes: page dimensions/margins, the header's own
// typography and photo geometry, all colors, and every hairline
// stroke width (HEADER_RULE_THICKNESS, SECTION_DIVIDER_THICKNESS,
// EXPERIENCE_TIMELINE_START_EXTENSION_PT) — none of those are touched
// by auto-fit, so the header, the page's physical safe area, and every
// stroke Minimal already draws stay exactly as designed whatever scale
// the body content ends up at. This is the SAME auto-fit mechanism
// modernPdf.ts uses (see its own recomputeScaledConstants()), applied
// here to Minimal's own set of constants and Minimal's own values —
// none of Modern's spacing/sizes are introduced by this function.
//
// scale === 1 restores every constant to its original, hand-tuned
// Minimal value exactly — this is what runs by default and on the
// first attempt inside generateMinimalPDF() below, so a resume that
// already fits on one page renders byte-for-byte identical to before
// this feature existed.
function recomputeScaledConstants(scale: number): void {
  SCALE_FACTOR = scale;

  HEADING_SIZE = BASE_HEADING_SIZE * scale;
  BODY_SIZE = BASE_BODY_SIZE * scale;
  BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;
  EXPERIENCE_TITLE_SIZE = BASE_EXPERIENCE_TITLE_SIZE * scale;
  EXPERIENCE_SUBTITLE_SIZE = BASE_EXPERIENCE_SUBTITLE_SIZE * scale;

  SECTION_GAP = BASE_SECTION_GAP * scale;
  DIVIDER_SIDE_GAP_PT = BASE_DIVIDER_SIDE_GAP_PT * scale;
  EXPERIENCE_TITLE_TO_SUBTITLE_GAP = BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP * scale;
  EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP * scale;
  EXPERIENCE_ENTRY_GAP = BASE_EXPERIENCE_ENTRY_GAP * scale;
  BULLET_DOT_TO_TEXT_GAP_PT = BASE_BULLET_DOT_TO_TEXT_GAP_PT * scale;
  TITLE_TO_DATE_GAP_PT = BASE_TITLE_TO_DATE_GAP_PT * scale;

  // Derived constants that key off ones scaled above — recomputed here
  // rather than left stale, same rationale as BODY_LINE_HEIGHT above.
  EXPERIENCE_TIMELINE_CONTENT_INDENT_PT = BULLET_DOT_TO_TEXT_GAP_PT;
  LANGUAGE_SEPARATOR_SIZE = EXPERIENCE_TITLE_SIZE + 2;
}

// Renders the full document once at the CURRENT scale (whatever
// recomputeScaledConstants() last set) and reports back how it turned
// out, so generateMinimalPDF() below can decide whether another attempt
// at a smaller scale is needed.
function renderMinimalPDFOnce(data: MinimalPdfData): { doc: jsPDF; pageCount: number; lastPageContentHeight: number } {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  let y = TOP_MARGIN;

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
    // How far down the LAST page the final content reaches — used only
    // to decide whether a 2-page result is a small, worth-compacting
    // overflow or a genuinely multi-page resume (see AUTO_FIT_MAX_
    // OVERFLOW_PT below).
    lastPageContentHeight: y - TOP_MARGIN,
  };
}

// The auto-fit pass only ever shrinks text/spacing down to this floor
// (a maximum 15% reduction) — far short of anything that would make
// the resume hard to read — matching how top resume builders' own
// "shrink to fit" features cap how far they'll compact content rather
// than shrinking indefinitely.
const AUTO_FIT_MIN_SCALE = 0.85;
// How much of a second page's worth of content is still considered a
// "small overflow" worth auto-compacting back onto one page, rather
// than a genuinely multi-page resume that auto-fit shouldn't touch
// (shrinking to force 3+ pages of real content onto one page would
// require an unreadably tiny font). ~35% of one page's usable height.
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

export function generateMinimalPDF(data: MinimalPdfData): jsPDF {
  // WinAnsi-safety pass — see sanitizeTextForPdf() above. Every string
  // field in `data` is normalized ONCE here, before any measurement or
  // rendering, so the rest of the file (unchanged below) never sees an
  // unencodable character like U+2011 again.
  const sanitizedData = deepSanitizeForPdf(data);

  // Always start from the original, unscaled Minimal design — makes
  // this function idempotent regardless of what any earlier call in
  // the same process left SCALE_FACTOR at.
  recomputeScaledConstants(1);
  const fullScaleResult = renderMinimalPDFOnce(sanitizedData);

  const overflowsBySmallAmount =
    fullScaleResult.pageCount === 2 &&
    fullScaleResult.lastPageContentHeight <= AUTO_FIT_MAX_OVERFLOW_PT;

  if (!overflowsBySmallAmount) {
    // Either it already fits on one page, or it's genuinely long
    // enough that shrinking within AUTO_FIT_MIN_SCALE couldn't make it
    // fit anyway — leave the design at its original, full-size values.
    recomputeScaledConstants(1);
    return fullScaleResult.doc;
  }

  // --- AUTO-FIT: try progressively smaller scales, largest first, so
  // the resume ends up at the LARGEST (most readable) scale that still
  // achieves exactly one page. Stops at the first scale that fits. ---
  const SCALE_STEP = 0.02;
  let bestFit: { doc: jsPDF; scale: number } | null = null;

  for (let scale = 1 - SCALE_STEP; scale >= AUTO_FIT_MIN_SCALE - 1e-9; scale -= SCALE_STEP) {
    recomputeScaledConstants(scale);
    const attempt = renderMinimalPDFOnce(sanitizedData);
    if (attempt.pageCount === 1) {
      bestFit = { doc: attempt.doc, scale };
      break;
    }
  }

  // Reset to the original design for whatever the NEXT generateMinimalPDF()
  // call does, regardless of which branch this call took.
  recomputeScaledConstants(1);

  // If no scale down to the floor achieved one page, fall back to the
  // untouched, full-size multi-page result rather than shipping a
  // smaller font for no page-count benefit.
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
function addHeader(doc: jsPDF, data: MinimalPdfData, startY: number): number {
  let y = startY;
  const { personalInfo, phoneNumber, selectedCountryCode } = data;

  const name = (personalInfo?.name || '').trim() || 'Your Name';
  const jobTitle = (personalInfo?.title || personalInfo?.jobTitle || '').trim();
  const hasPhoto = isValidPhotoSource(personalInfo?.photo);

  if (hasPhoto) {
    // --- Name & job title baselines — identical Y math to the
    // no-photo branch below; the photo changes X positioning only. ---
    // Photo-only whole-block shift (see PHOTO_CONTENT_DOWN_SHIFT_PT): every
    // value below derives from nameBaselineY, so nothing's gap changes.
    const nameBaselineY = y + PHOTO_CONTENT_DOWN_SHIFT_PT;

    // The job-title SLOT is ALWAYS reserved, even when there is no
    // title, so the photo is centered against the same fixed block in
    // both cases (otherwise a name-only block is far shorter than the
    // photo and the photo rides upward). Only the title TEXT is skipped
    // when empty — titleBaselineY stays null for "nothing to draw".
    const titleSlotBaselineY = nameBaselineY + NAME_SIZE + NAME_TO_TITLE_GAP;
    const titleBaselineY = jobTitle ? titleSlotBaselineY : null;

    // --- Real ink-space vertical span of the name + title-slot block, so
    // the photo centers against actual text height, not a guess. ---
    const blockTopY = nameBaselineY - NAME_SIZE * HELVETICA_ASCENT_RATIO;
    const blockBottomY = titleSlotBaselineY + TITLE_SIZE * HELVETICA_DESCENT_RATIO;
    const blockHeight = blockBottomY - blockTopY;

    // --- Photo geometry: top-left of the header. The BOTTOM edge is
    // anchored using HEADER_PHOTO_SIZE_BASE_PT (the fixed, pre-increase
    // diameter — see its declaration above), NOT HEADER_PHOTO_SIZE_PT
    // (the current, drawn diameter), so this anchor is completely
    // independent of the requested size increase. The top edge is then
    // derived from that fixed bottom anchor and the actual drawn size,
    // so the requested +4pt extends the circle upward only — it cannot
    // shift the photo's bottom edge, and therefore cannot shift the
    // photoOverhang/Contact-line calculation below this block, at all.
    const photoX = LEFT_MARGIN;
    const photoBottomYAnchor = blockTopY + (blockHeight - HEADER_PHOTO_SIZE_BASE_PT) / 2 + HEADER_PHOTO_SIZE_BASE_PT;
    const photoTopY = photoBottomYAnchor - HEADER_PHOTO_SIZE_PT;
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
    // Measured from the always-reserved title slot, so the contact line
    // starts at the same position whether or not a job title exists.
    y = titleSlotBaselineY + TITLE_SIZE + TITLE_TO_CONTACT_GAP;
    const photoBottomY = photoTopY + HEADER_PHOTO_SIZE_PT;
    const photoOverhang = Math.max(0, photoBottomY - blockBottomY);
    y += photoOverhang;
  } else {
    // --- NO PHOTO (original Minimal PDF layout, + the requested
    // no-photo-only Name/Job Title downward nudge below) ---

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
    doc.setTextColor(...COLOR_METADATA);

    // Clean, separator-free contact line (same layout as ATSPro). Every
    // contact item is placed whole and every item is followed by the SAME
    // gap — the width of the file's existing SKILLS_SEPARATOR in this
    // font, so the horizontal rhythm matches the rest of the document and
    // no new spacing value exists. An item that doesn't fit the remaining
    // width moves whole to the next line (never split mid-text); an item
    // wider than the entire line is wrapped with the same
    // splitTextToSize() used elsewhere in this file, so no contact text is
    // ever dropped or clipped. Consecutive contact lines advance by
    // BODY_LINE_HEIGHT — the same normal body/content-line spacing
    // Professional Summary uses — so nothing below moves for a
    // same-line-count contact block.
    const contactRight = LEFT_MARGIN + CONTENT_WIDTH;
    const itemGap = doc.getTextWidth(SKILLS_SEPARATOR);

    let cursorX = LEFT_MARGIN;
    let currentLineText = ''; // text on the line currently being filled (for the descender check below)
    const startNewLine = () => {
      y += BODY_LINE_HEIGHT;
      cursorX = LEFT_MARGIN;
      currentLineText = '';
    };

    for (const part of contactParts) {
      const itemWidth = doc.getTextWidth(part);

      if (itemWidth > CONTENT_WIDTH) {
        // Oversized single item: gets its own wrapped lines.
        if (cursorX > LEFT_MARGIN) startNewLine();
        const wrapped: string[] = doc.splitTextToSize(part, CONTENT_WIDTH);
        wrapped.forEach((line, index) => {
          if (index > 0) startNewLine();
          doc.text(line, LEFT_MARGIN, y);
          currentLineText = line;
        });
        // An oversized item fills its whole line (same as the live
        // preview, which sets the cursor to the full content width), so
        // the next item always starts on a new line instead of continuing
        // after the last wrapped fragment.
        cursorX = contactRight;
        continue;
      }

      if (cursorX > LEFT_MARGIN && cursorX + itemWidth > contactRight) {
        startNewLine();
      }
      doc.text(part, cursorX, y);
      currentLineText += part;
      cursorX += itemWidth + itemGap;
    }
    // Leave y one BODY_LINE_HEIGHT past the last line's baseline, exactly
    // like the previous per-line loop did (trailing reserve).
    y += BODY_LINE_HEIGHT;

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
    //
    // The loop above leaves `y` one BODY_LINE_HEIGHT past the last
    // line's own baseline (it advances after every line, including the
    // last — the same trailing-reserve behavior addSummary()'s loop
    // ends with), so the last line's real baseline is `y -
    // BODY_LINE_HEIGHT`, not `y` itself.
    const lastContactLine = currentLineText;
    const lastContactBaselineY = y - BODY_LINE_HEIGHT;
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

// Plain-text labels shown before each contact value (same labels as the
// Executive template). The label is part of the part's text, so the
// contact line's measuring/wrapping and drawing treat it as one string.
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
function addSummary(doc: jsPDF, data: MinimalPdfData, startY: number): number {
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
  //
  // PAGE-FLOW (ink-bottom reservation — see lineInkHeight()/
  // inkBottomHeight() near the end of this file): only the first
  // line's real ink extent below its own baseline needs reserving
  // here, not its full BODY_LINE_HEIGHT advance, which also bakes in
  // leading meant for the line after it — so this guard no longer
  // over-reserves relative to what BOTTOM_MARGIN actually protects.
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
    // Per-line reservation is this line's own ink-bottom only (see
    // lineInkHeight() near the end of this file), not the full
    // BODY_LINE_HEIGHT advance, which includes leading meant for
    // whatever line comes after it.
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
function addExperience(doc: jsPDF, data: MinimalPdfData, startY: number): number {
  const experiences = (data.experiences || []).filter(hasUsableExperienceContent);

  if (experiences.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — this guard used to reserve only "heading + one
  // EXPERIENCE_TITLE_SIZE line" as a stand-in for "the first entry",
  // regardless of what that entry actually contained. A real first
  // entry is usually MORE than one line (title row + company +
  // description), so the heading could pass this check, render at the
  // bottom of the page, and then the first entry's OWN (correctly
  // sized) checkPageBreak() would immediately push IT to the next
  // page — orphaning the heading exactly like the bug this guard was
  // meant to prevent. Sizing the guard against the REAL first entry
  // (via the same estimateExperienceEntryMinimumHeight()
  // addExperienceEntry() itself checks against) guarantees the
  // heading and its first entry can never be split across a page
  // boundary.
  const firstEntryMinimumHeight = estimateExperienceEntryMinimumHeight(doc, experiences[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'EXPERIENCE', y, EXPERIENCE_TITLE_SIZE);

  // --- Entries ---
  // TIMELINE CONTINUITY: each entry is now told what (if anything)
  // follows it, so its own timeline rule (drawn inside
  // addExperienceEntry()) can decide whether to extend down through
  // the entry-to-entry gap to meet the next entry's rule — see the
  // "EXPERIENCE VERTICAL TIMELINE CONTINUITY" comment inside
  // addExperienceEntry() for why a look-ahead at the next entry is the
  // root-cause fix rather than a fixed extension.
  experiences.forEach((exp, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }
    const nextExp = index < experiences.length - 1 ? experiences[index + 1] : null;
    y = addExperienceEntry(doc, exp, y, nextExp);
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
// (title/date row + company line + FULL wrapped description), without
// drawing anything. Used by addExperienceEntry() itself for its own
// checkPageBreak() call AND by addExperience() to size its
// heading-guard against the REAL first entry instead of a generic
// one-line guess — see the ROOT-CAUSE FIX note on that guard for why a
// generic guess isn't sufficient. Single source of truth, so the
// estimate and the entry's own render can never disagree. Mirrors
// addExperienceEntry()'s own layout exactly (including the timeline's
// content indent), just without touching the page.
function estimateExperienceEntryMinimumHeight(doc: jsPDF, exp: MinimalPdfExperience): number {
  const title = (exp.title || '').trim();
  const company = (exp.company || '').trim();
  const startDate = (exp.startDate || '').trim();
  const endDate = (exp.endDate || '').trim();
  const description = (exp.description || '').trim();
  const dateRange = [startDate, endDate].filter(Boolean).join(' – ');

  const contentIndentX = EXPERIENCE_TIMELINE_CONTENT_INDENT_PT;
  const indentedContentWidth = CONTENT_WIDTH - contentIndentX;

  // Description renders as bullets INSIDE the timeline-indented content
  // area: the dot sits at contentIndentX (right after the timeline rule)
  // and the text is indented a further BULLET_DOT_TO_TEXT_GAP_PT past
  // the dot — see addExperienceEntry()'s own comment for the layout.
  const descriptionItems = buildBulletDescriptionItems(
    doc,
    description,
    indentedContentWidth - BULLET_DOT_TO_TEXT_GAP_PT
  );
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateWidthForEstimate = dateRange ? doc.getTextWidth(dateRange) : 0;
  const titleWrapWidthForEstimate = dateRange
    ? Math.max(0, indentedContentWidth - dateWidthForEstimate - TITLE_TO_DATE_GAP_PT)
    : indentedContentWidth;
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
  const descriptionTotalHeight = descriptionLines.length * BODY_LINE_HEIGHT;

  const hasDescription = descriptionLines.length > 0;
  const lastLineFontSize = hasDescription ? BODY_SIZE
    : company ? EXPERIENCE_SUBTITLE_SIZE
    : title ? EXPERIENCE_TITLE_SIZE
    : EXPERIENCE_SUBTITLE_SIZE;
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSize;

  // PAGE-FLOW (ported from modernPdf.ts/academicPdf.ts, logic only —
  // Minimal's own timeline-indented widths above are unchanged):
  // reserve the whole entry's ink-bottom height when it fits on one
  // page; otherwise reserve only the header + first description line,
  // so a description too long for any single page still flows across
  // pages via the per-line checkPageBreak() calls in
  // addExperienceEntry() instead of forcing a reservation
  // checkPageBreak() could never satisfy. See keepTogetherHeight()/
  // inkBottomHeight() near the end of this file.
  return keepTogetherHeight(
    inkBottomHeight(headerHeight + descriptionGap + descriptionTotalHeight, lastLineAdvance, lastLineFontSize),
    hasDescription
      ? inkBottomHeight(headerHeight + descriptionGap + firstDescriptionLineHeight, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(headerHeight, lastLineAdvance, lastLineFontSize)
  );
}

// Renders a single experience entry and returns the new Y position.
// `nextExp` is the Experience entry that will be rendered immediately
// after this one (null if this is the last entry) — passed so the
// timeline-continuity check below can look ahead at it without this
// function needing to know about the section's entry list itself.
function addExperienceEntry(doc: jsPDF, exp: MinimalPdfExperience, startY: number, nextExp: MinimalPdfExperience | null): number {
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

  // EXPERIENCE VERTICAL TIMELINE: every field below is indented right by
  // EXPERIENCE_TIMELINE_CONTENT_INDENT_PT to leave room for the timeline
  // rule (drawn at LEFT_MARGIN, after all content below), so the wrap
  // width for every field narrows by that same amount. See the constant's
  // own doc comment for why this reuses BULLET_DOT_TO_TEXT_GAP_PT instead
  // of a new value.
  const contentIndentX = EXPERIENCE_TIMELINE_CONTENT_INDENT_PT;
  const contentX = LEFT_MARGIN + contentIndentX;
  const indentedContentWidth = CONTENT_WIDTH - contentIndentX;

  // The description textarea allows the user to type their own line
  // breaks (e.g. one line per responsibility). Those manual breaks are
  // preserved — each typed line becomes one bullet item, rendered with
  // a "•" dot INSIDE the timeline-indented content area: the dot sits
  // right after the timeline rule (at contentX) and the text is
  // indented a further BULLET_DOT_TO_TEXT_GAP_PT past the dot — see
  // the render call below.
  const descriptionItems = buildBulletDescriptionItems(
    doc,
    description,
    indentedContentWidth - BULLET_DOT_TO_TEXT_GAP_PT
  );
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  // --- Determine how much space this ENTIRE entry needs — header
  // (title/date row + company line) AND every wrapped description line,
  // not just the first — so the whole entry always moves to a new page
  // together rather than splitting mid-entry. This is required for the
  // timeline rule below: since that rule is one continuous line drawn
  // from this entry's first line to its last, the entry can never be
  // allowed to split across a page break, or the rule would have to
  // (incorrectly) split too. Computed via the shared
  // estimateExperienceEntryMinimumHeight() (see its own comment above)
  // rather than inline here, so this entry's own page-break check and
  // addExperience()'s heading-guard (which estimates the section's
  // FIRST entry the same way) can never drift out of parity with each
  // other. ---
  const hasTitleRow = Boolean(title || dateRange);
  const hasHeaderLine = hasTitleRow || Boolean(company);
  const minimumEntrySpaceNeeded = estimateExperienceEntryMinimumHeight(doc, exp);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // entryTopY is where this entry's content actually begins, AFTER the
  // page-break check above — i.e. the true starting baseline the
  // timeline rule's top edge is measured from, whether or not a new
  // page was just started.
  const entryTopY = y;

  // Tracks the baseline Y and font size of whichever line was drawn
  // LAST, updated after each field below, so the timeline rule's bottom
  // edge can hug the entry's actual last line of ink (via
  // HELVETICA_DESCENT_RATIO) rather than an arbitrary offset.
  let lastLineBaselineY = entryTopY;
  let lastLineFontSizeDrawn = EXPERIENCE_TITLE_SIZE;

  // --- Job title (left) + Date (right, same row) ---
  const titleRow = renderTitleRowWithDate(doc, title, dateRange, y, contentIndentX);
  if (titleRow.hasContent) {
    const titleRowFontSize = title ? EXPERIENCE_TITLE_SIZE : EXPERIENCE_SUBTITLE_SIZE;
    const titleRowLineCount = titleRow.height / titleRowFontSize;
    lastLineBaselineY = y + (titleRowLineCount - 1) * titleRowFontSize;
    lastLineFontSizeDrawn = titleRowFontSize;
    y += titleRow.height;
    if (company) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Company (its own line, below the title/date row) ---
  if (company) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_BODY);
    doc.text(company, contentX, y);
    lastLineBaselineY = y;
    lastLineFontSizeDrawn = EXPERIENCE_SUBTITLE_SIZE;
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

  // --- Description (rendered as bullets inside the timeline-indented
  // content area — dot at contentX, text at contentX + BULLET_DOT_TO_TEXT_GAP_PT) ---
  if (descriptionLines.length > 0) {
    const bulletX = contentX;
    const bulletTextX = contentX + BULLET_DOT_TO_TEXT_GAP_PT;
    y = renderBulletDescriptionLines(doc, descriptionItems, y, bulletX, bulletTextX);
    // renderBulletDescriptionLines() only returns the final Y — recover
    // the last line's own baseline/font size (same values every
    // iteration of the old per-line loop used to track) so the timeline
    // rule's bottom edge below still hugs the entry's actual last line
    // of ink exactly as before.
    lastLineBaselineY = y - BODY_LINE_HEIGHT;
    lastLineFontSizeDrawn = BODY_SIZE;
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
  //
  // Computed here, BEFORE the timeline rule below, instead of after it
  // as before — same values, same condition, only reordered — because
  // the timeline-continuity check right below needs to know this
  // entry's real, final return value (finalY) to work out the exact Y
  // the NEXT entry will start from (finalY + EXPERIENCE_ENTRY_GAP, the
  // same arithmetic the caller performs), not the pre-top-up y.
  let finalY = y;
  if (descriptionLines.length === 0 && hasHeaderLine) {
    const lastLineFontSize = company ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE;
    finalY = topUpToLineHeight(finalY, lastLineFontSize);
  }

  // --- EXPERIENCE VERTICAL TIMELINE RULE ---
  // Ported from OLD minimalPdf.ts's per-entry timeline (renderTimelineEntry()):
  // a single vertical rule drawn once per entry. Drawn at LEFT_MARGIN
  // (the same X every marker in this file uses), spanning from this
  // entry's first line's real ink-top down to its last line's real
  // ink-bottom — computed via the file's existing
  // HELVETICA_ASCENT_RATIO/HELVETICA_DESCENT_RATIO font metrics (already
  // used elsewhere for exact ink-edge measurement) rather than an
  // arbitrary fixed inset, and using the file's existing divider color/
  // thickness (COLOR_SECTION_DIVIDER/SECTION_DIVIDER_THICKNESS — the same
  // stroke every section-heading divider already uses) rather than a new
  // one-off weight. Because the full-entry space check above guarantees
  // this entire entry rendered on one page, this rule can never be left
  // broken or disconnected by a page break WITHIN itself.
  const firstLineFontSizeDrawn = hasTitleRow
    ? (title ? EXPERIENCE_TITLE_SIZE : EXPERIENCE_SUBTITLE_SIZE)
    : (company ? EXPERIENCE_SUBTITLE_SIZE : BODY_SIZE);
  // Top edge: same ink-top calculation as before, then pulled up an
  // extra EXPERIENCE_TIMELINE_START_EXTENSION_PT (0.5mm) so the rule
  // starts earlier than its previous position.
  const timelineTopY =
    entryTopY - firstLineFontSizeDrawn * HELVETICA_ASCENT_RATIO - EXPERIENCE_TIMELINE_START_EXTENSION_PT;
  const timelineBottomY = lastLineBaselineY + lastLineFontSizeDrawn * HELVETICA_DESCENT_RATIO;

  // EXPERIENCE VERTICAL TIMELINE CONTINUITY (root-cause fix): the
  // visible gap this fixes was never inside a single entry's own
  // rule — it was the space BETWEEN one entry's ink-bottom
  // (timelineBottomY above) and the next entry's ink-top, which is
  // exactly EXPERIENCE_ENTRY_GAP (the same constant the caller in
  // addExperience() already adds between entries) plus the next
  // entry's own upward pull (HELVETICA_ASCENT_RATIO +
  // EXPERIENCE_TIMELINE_START_EXTENSION_PT). Rather than drawing an
  // extra patch line over that space, or guessing a fixed extension,
  // this entry's OWN rule is extended down to exactly the Y the next
  // entry will start from — finalY + EXPERIENCE_ENTRY_GAP, the same
  // sum the caller's `y += EXPERIENCE_ENTRY_GAP` / addExperienceEntry(
  // ..., y) sequence produces for entryTopY of the next entry. Because
  // the next entry's own rule then starts even higher than that point
  // (pulled up by its first line's ascent + the same start extension),
  // the two rules always overlap where they meet rather than needing
  // to land on one exact shared pixel — robust regardless of the next
  // entry's own title/company/description makeup or line count.
  //
  // This must NOT happen when a page break will fall between the two
  // entries: nextEntryStaysOnThisPage below mirrors checkPageBreak()'s
  // own condition (see checkPageBreak() near the end of this file)
  // exactly, using the next entry's own real minimum-height estimate
  // (estimateExperienceEntryMinimumHeight() — the same function that
  // decides the REAL page break for it, so this can never predict
  // differently from what actually happens next). When the next entry
  // is going to start on a fresh page, there is nothing on THIS page
  // to connect to, so the rule stays at its own ink-bottom exactly as
  // before — extending it further would draw past BOTTOM_MARGIN into
  // blank page space.
  let timelineBottomYFinal = timelineBottomY;
  if (nextExp) {
    const nextEntryMinimumHeight = estimateExperienceEntryMinimumHeight(doc, nextExp);
    const nextEntryStartY = finalY + EXPERIENCE_ENTRY_GAP;
    const nextEntryStaysOnThisPage = nextEntryStartY + nextEntryMinimumHeight <= PAGE_HEIGHT - BOTTOM_MARGIN;
    if (nextEntryStaysOnThisPage) {
      timelineBottomYFinal = nextEntryStartY;
    }
  }

  doc.setDrawColor(...COLOR_SECTION_DIVIDER);
  doc.setLineWidth(SECTION_DIVIDER_THICKNESS);
  doc.line(LEFT_MARGIN, timelineTopY, LEFT_MARGIN, timelineBottomYFinal);

  return finalY;
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
function addEducation(doc: jsPDF, data: MinimalPdfData, startY: number): number {
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
// (degree/institution/date header block + FULL wrapped grade), without
// drawing anything. Used by addEducationEntry() itself for its own
// checkPageBreak() call AND by addEducation() to size its heading-guard
// against the REAL first entry — same rationale as
// estimateExperienceEntryMinimumHeight() above. Mirrors
// addEducationEntry()'s own layout exactly, including where the Date
// attaches (institution line vs. degree line fallback).
//
// PAGE-BREAK FIX: the trailing Grade term now reserves its FULL wrapped
// height (every line), not just its first line — a multi-line Grade
// could previously pass this guard while only one line of room was
// actually reserved, letting the entry's own per-line checkPageBreak()
// (inside the Grade render loop below) split Grade away from its
// Degree/Institution mid-entry. This does not change any spacing
// value — only how much of the entry's real content this estimate
// accounts for, mirroring the same full-height principle every other
// section's estimate already uses for its own trailing multi-line field
// (e.g. Experience's/Project's description, Achievement's description).
function estimateEducationEntryMinimumHeight(doc: jsPDF, edu: MinimalPdfEducation): number {
  const degree = (edu.degree || '').trim();
  const institution = (edu.institution || '').trim();
  const year = (edu.year || '').trim();
  const grade = (edu.grade || '').trim();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, CONTENT_WIDTH) : [];
  const gradeLines: string[] = grade ? doc.splitTextToSize(`Grade: ${grade}`, CONTENT_WIDTH) : [];
  const dateAttachesToInstitution = institutionLines.length > 0;

  const institutionHeight = institutionLines.length * EXPERIENCE_SUBTITLE_SIZE;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const estimatedDegreeLineCount = degree ? doc.splitTextToSize(degree, CONTENT_WIDTH).length : 0;
  let degreeRowHeightEstimate = 0;
  if (estimatedDegreeLineCount > 0) {
    degreeRowHeightEstimate = (year && !dateAttachesToInstitution)
      ? (estimatedDegreeLineCount - 1) * EXPERIENCE_TITLE_SIZE + BODY_LINE_HEIGHT + EXPERIENCE_SUBTITLE_SIZE
      : estimatedDegreeLineCount * EXPERIENCE_TITLE_SIZE;
  } else if (year && !dateAttachesToInstitution) {
    degreeRowHeightEstimate = EXPERIENCE_SUBTITLE_SIZE;
  }
  const hasDegreeRow = Boolean(degree) || (Boolean(year) && !dateAttachesToInstitution);

  const titleToSubtitleGap = hasDegreeRow && institutionLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const institutionBlockHeight = (dateAttachesToInstitution && year)
    ? (institutionLines.length - 1) * EXPERIENCE_SUBTITLE_SIZE + BODY_LINE_HEIGHT + EXPERIENCE_SUBTITLE_SIZE
    : institutionHeight;
  const headerHeight = degreeRowHeightEstimate + titleToSubtitleGap + institutionBlockHeight;
  const hasHeaderContent = hasDegreeRow || institutionLines.length > 0;
  const headerToGradeGap = hasHeaderContent && gradeLines.length > 0
    ? (year
        ? BODY_LINE_HEIGHT - EXPERIENCE_SUBTITLE_SIZE
        : EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP)
    : 0;
  // Full Grade height (every wrapped line) — see the PAGE-BREAK FIX
  // note above this function for why this is no longer just the first
  // line.
  const gradeTotalHeight = gradeLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const fullHeight = headerHeight + headerToGradeGap + gradeTotalHeight;

  // PAGE-FLOW (ported from modernPdf.ts/academicPdf.ts, logic only):
  // Education entries have no unbounded body-text field (unlike
  // Experience's description), so the whole entry always reserves as
  // one ink-bottom-measured block — see keepTogetherHeight()/
  // inkBottomHeight() near the end of this file. Same trailing-field
  // logic addEducationEntry() itself already uses for topUpToLineHeight().
  const lastLineFontSize = gradeLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : institutionLines.length > 0
      ? EXPERIENCE_SUBTITLE_SIZE
      : year
        ? EXPERIENCE_SUBTITLE_SIZE
        : EXPERIENCE_TITLE_SIZE;
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

  // Date (year) now renders on its own line directly BELOW the
  // University Name (institution) — moved from below the degree name.
  // When there IS an institution line, the Date attaches there,
  // reusing the file's existing BODY_LINE_HEIGHT normal content/body
  // text line advance (the same advance renderTitleWithDateBelow()
  // already uses for Achievements' title -> date step, and the same
  // one every wrapped body paragraph in this file uses line to line) —
  // not a new Education-specific value. When there is NO institution
  // line at all, there is no "University Name" for the Date to sit
  // below, so it falls back to its original placement directly below
  // the Degree line via renderTitleWithDateBelow() (unchanged
  // pre-existing behavior for that edge case — outside the scope of
  // this request, which is specifically about the University Name ->
  // Date relationship).
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, CONTENT_WIDTH) : [];
  const gradeLines: string[] = grade ? doc.splitTextToSize(`Grade: ${grade}`, CONTENT_WIDTH) : [];
  const dateAttachesToInstitution = institutionLines.length > 0;

  // Multi-line metadata fields (institution/grade) use their own font
  // size as the per-line height, with no extra leading — the same
  // convention already used for the header's wrapped contact line in
  // addHeader(). BODY_LINE_HEIGHT (with its 1.4 multiplier) is
  // reserved for actual paragraph body text, which none of these
  // fields are.
  const institutionHeight = institutionLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const hasDegreeRow = Boolean(degree) || (Boolean(year) && !dateAttachesToInstitution);
  const hasHeaderContent = hasDegreeRow || institutionLines.length > 0;

  // --- Determine how much space this entry's degree/institution/date
  // block needs, so the whole block moves to a new page together
  // rather than splitting a degree from its own institution line or
  // grade. Computed via the shared estimateEducationEntryMinimumHeight()
  // (see its own comment above) rather than inline here, so this
  // entry's own page-break check and addEducation()'s heading-guard
  // (which estimates the section's FIRST entry the same way) can never
  // drift out of parity with each other. ---
  const minimumEntrySpaceNeeded = estimateEducationEntryMinimumHeight(doc, edu);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Degree / Program. Renders alone (no date) whenever the Date
  // attaches to the institution below instead — same call shape the
  // pre-existing "no year" case already used, just taken whenever an
  // institution line is present. ---
  const degreeRow = renderTitleWithDateBelow(
    doc,
    degree,
    dateAttachesToInstitution ? '' : year,
    y
  );
  if (degreeRow.hasContent) {
    y += degreeRow.height;
    if (institutionLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Institution / University Name, with Date directly below it
  // (moved here per request) ---
  if (institutionLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_BODY);
    doc.text(institutionLines, LEFT_MARGIN, y);

    if (dateAttachesToInstitution && year) {
      // Institution's own internal wrap advance (unchanged: own font
      // size, no extra leading) for every line except the last.
      if (institutionLines.length > 1) {
        y += (institutionLines.length - 1) * EXPERIENCE_SUBTITLE_SIZE;
      }
      // University Name -> Date: the file's existing normal
      // content/body text line advance (BODY_LINE_HEIGHT) — the same
      // one renderTitleWithDateBelow() already uses for title -> date,
      // not a new Education-specific value.
      y += BODY_LINE_HEIGHT;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
      doc.setTextColor(...COLOR_BODY);
      doc.text(year, LEFT_MARGIN, y);
      // Date's own line — own font size, no extra leading, same
      // convention used everywhere else in this file.
      y += EXPERIENCE_SUBTITLE_SIZE;
    } else {
      y += institutionHeight;
    }
  }

  if (hasHeaderContent && gradeLines.length > 0) {
    // See the matching DATE -> GRADE GAP ESTIMATE comment above (near
    // headerToGradeGap) for the full analysis: when Date is present it
    // is always the line immediately above Grade, and its own advance
    // above was font-size-only (EXPERIENCE_SUBTITLE_SIZE). Topping that
    // up to BODY_LINE_HEIGHT — reusing the same constant/mechanism as
    // University Name -> Date and topUpToLineHeight() — makes the
    // rendered Date -> Grade gap equal to the normal body/content
    // line-to-line gap. When there is no Date (Grade follows
    // institution or degree directly instead), the gap is unchanged.
    y += year
      ? BODY_LINE_HEIGHT - EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
  }

  // --- Grade (optional, rendered with a "Grade:" label) ---
  if (gradeLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_BODY);

    for (const line of gradeLines) {
      // Reserves only this line's own ink-bottom (see lineInkHeight()
      // near the end of this file) — metadata lines have no extra
      // leading, so their advance already equals their font size, but
      // routing through the shared helper keeps every per-line
      // reservation in this file using the same convention.
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
  // NOTE: with the date now stacked directly below the University Name
  // (or below the degree, in the no-institution fallback case) rather
  // than beside the degree, the date — when present — is the last line
  // of whichever block it attached to. So when grade doesn't follow it,
  // the date's own font size (EXPERIENCE_SUBTITLE_SIZE) is the correct
  // trailing-line reference, same as when institution/grade is present.
  const lastLineFontSize = gradeLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : institutionLines.length > 0
      ? EXPERIENCE_SUBTITLE_SIZE
      : year
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
function addSkills(doc: jsPDF, data: MinimalPdfData, startY: number): number {
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
  //
  // PAGE-FLOW (ink-bottom reservation — see lineInkHeight() near the
  // end of this file): only the first line's real ink extent below
  // its own baseline needs reserving here, not its full
  // BODY_LINE_HEIGHT advance, which also bakes in leading meant for
  // the line after it.
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
    // Per-line reservation is this line's own ink-bottom only (see
    // lineInkHeight() near the end of this file).
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
// Renders: "LANGUAGES" heading, then one line per entry:
//   Language Name: Proficiency label (optional, expanded from the
//   form's short code — see getProficiencyDisplayLabel())
//
// FORMAT NOTE: name and level render on the SAME line ("Name: Level")
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
function addLanguages(doc: jsPDF, data: MinimalPdfData, startY: number): number {
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

// LANGUAGE NAME/LEVEL SEPARATOR
// Each language entry displays as a single line: "Name : Level" — the
// colon is drawn as its own segment (see addLanguageEntry()) so its
// gap from the name and its gap from the level can be measured
// identically on both sides, and so it can be sized slightly larger
// than the surrounding text to stay clearly visible. This raw-colon
// form (no spaces baked in) is used for that same-line render; the
// space-padded form below is only for wrap-estimation and the rare
// multi-line fallback, where the colon is drawn inline as plain text.
const LANGUAGE_SEPARATOR_CHAR = ':';
const LANGUAGE_NAME_LEVEL_SEPARATOR = ' : ';

// The colon's own font size — a small, deliberate bump over
// EXPERIENCE_TITLE_SIZE (the language name's size, itself the larger
// of the two surrounding styles) so the separator reads clearly at a
// glance instead of blending into the text around it. Derived from the
// existing title-size constant rather than a bare magic number, so it
// stays in proportion if that constant ever changes.
let LANGUAGE_SEPARATOR_SIZE = EXPERIENCE_TITLE_SIZE + 2; // scaled alongside EXPERIENCE_TITLE_SIZE — see recomputeScaledConstants()

// Computes the exact minimum vertical space one Language entry needs
// (the combined "Name : Level" line(s)), without drawing anything. Used
// by addLanguageEntry() itself for its own checkPageBreak() call AND
// by addLanguages() to size its heading-guard against the REAL first
// entry — same rationale as estimateExperienceEntryMinimumHeight()
// above.
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

  // PAGE-FLOW (ported from modernPdf.ts/academicPdf.ts, logic only): a
  // Language entry has no unbounded body-text field, so it always
  // reserves as one ink-bottom-measured block — see
  // keepTogetherHeight()/inkBottomHeight() near the end of this file.
  const inkHeight = inkBottomHeight(fullHeight, EXPERIENCE_TITLE_SIZE, EXPERIENCE_TITLE_SIZE);
  return keepTogetherHeight(inkHeight, inkHeight);
}

// Renders a single language entry and returns the new Y position,
// normalized so every entry — not only the section's last one — ends
// on a normal-content-line-equivalent trailing space, which is what
// lets addLanguages() place consecutive languages with no extra gap of
// its own. See the ROOT-CAUSE FIX note above addLanguages().
//
// Name, colon, and Level render on the SAME line ("Name : Level") as
// THREE independent segments — not one string — using the same
// same-line technique renderSectionHeading() already uses for its
// accent/rest heading split: each segment is drawn with doc.text() in
// its own style, and the next segment's start X is measured with
// doc.getTextWidth() — never a hardcoded offset. Splitting the colon
// out into its own segment (rather than baking it into the level
// string) is what lets it carry its own, slightly larger
// LANGUAGE_SEPARATOR_SIZE, and lets the SAME measured gap
// (separatorSideGapWidth, a real space glyph's width — never a bare
// number) be applied identically on both sides of it, so "name -> colon"
// and "colon -> level" are always exactly equal. The language name
// keeps its existing bold/COLOR_HEADING styling; the level keeps its
// existing normal/COLOR_METADATA styling — only the colon's size and
// the symmetric spacing around it are new.
function addLanguageEntry(doc: jsPDF, lang: MinimalPdfLanguage, startY: number): number {
  let y = startY;

  const language = (lang.language || '').trim();
  const proficiencyRaw = (lang.proficiency || '').trim();
  const proficiencyLabel = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';

  // The " : Level" segment, including its separator, empty when there
  // is no proficiency (matching the form's own preview convention — no
  // artificial space reserved when absent). Used only for wrap
  // measurement and the multi-line fallback below — the one-line render
  // path draws name/colon/level as three separate segments instead.
  const levelPart = proficiencyLabel ? `${LANGUAGE_NAME_LEVEL_SEPARATOR}${proficiencyLabel}` : '';
  const combinedText = `${language}${levelPart}`;

  // Measure/wrap the combined "Name : Level" text as one field, the
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
    // Common case: "Name : Level" fits on one line. Draw the name, the
    // colon, and the level as three same-line segments, each in its own
    // style, chaining each next segment's start X off the previous
    // segment's measured width via doc.getTextWidth() — never a
    // hardcoded offset.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(language, LEFT_MARGIN, y);
    const languageWidth = doc.getTextWidth(language);

    // A real space glyph's width, measured once at the language's own
    // bold/EXPERIENCE_TITLE_SIZE styling (still the active font/size at
    // this point) so it is a single, consistent value — reused for BOTH
    // sides of the colon, which is exactly what makes "name -> colon"
    // and "colon -> level" measure identically.
    const separatorSideGapWidth = doc.getTextWidth(' ');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(LANGUAGE_SEPARATOR_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    const separatorX = LEFT_MARGIN + languageWidth + separatorSideGapWidth;
    doc.text(LANGUAGE_SEPARATOR_CHAR, separatorX, y);
    const separatorWidth = doc.getTextWidth(LANGUAGE_SEPARATOR_CHAR);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_BODY);
    const levelX = separatorX + separatorWidth + separatorSideGapWidth;
    doc.text(proficiencyLabel, levelX, y);
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
function addAchievements(doc: jsPDF, data: MinimalPdfData, startY: number): number {
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
function renderTitleRowWithDate(
  doc: jsPDF,
  title: string,
  date: string,
  y: number,
  indentX: number = 0
): { lines: string[]; height: number; hasContent: boolean } {
  let dateWidth = 0;
  if (date) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    dateWidth = doc.getTextWidth(date);
  }

  const titleWrapWidth = date
    ? Math.max(0, CONTENT_WIDTH - indentX - dateWidth - TITLE_TO_DATE_GAP_PT)
    : CONTENT_WIDTH - indentX;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleLines: string[] = title ? doc.splitTextToSize(title, titleWrapWidth) : [];

  if (titleLines.length > 0) {
    doc.setTextColor(...COLOR_HEADING);
    doc.text(titleLines, LEFT_MARGIN + indentX, y);
  }

  if (date) {
    const rightBoundary = PAGE_WIDTH - RIGHT_MARGIN;
    const dateX = rightBoundary - dateWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_BODY);
    doc.text(date, dateX, y); // same baseline row as the title's first line
  }

  const hasContent = titleLines.length > 0 || Boolean(date);
  const height = titleLines.length > 0
    ? titleLines.length * EXPERIENCE_TITLE_SIZE
    : (date ? EXPERIENCE_SUBTITLE_SIZE : 0);

  return { lines: titleLines, height, hasContent };
}

// Renders a left-aligned title (bold, COLOR_HEADING, EXPERIENCE_TITLE_SIZE)
// with its date on its own line DIRECTLY BELOW the title (normal weight,
// COLOR_METADATA, EXPERIENCE_SUBTITLE_SIZE) — the stacked counterpart to
// renderTitleRowWithDate() above, used by Education and Achievements only
// (Experience keeps the original same-row layout via
// renderTitleRowWithDate() — unchanged).
//
// The title wraps at the FULL CONTENT_WIDTH (no width is reserved for a
// date beside it, since the date no longer shares its row).
//
// TITLE -> DATE GAP: the vertical step from the title's LAST line down to
// the date reuses BODY_LINE_HEIGHT — the same vertical advance already
// used between two consecutive lines of normal body/content text
// elsewhere in this file (the Summary paragraph, and the Experience/
// Achievement/Project description lines) — so the title-to-date gap is
// EXACTLY the file's existing normal content-line advance, not a new
// value invented for this pass.
//
// Everything else keeps its pre-existing convention: if the title itself
// wraps onto more than one line, its OWN internal line-to-line advance is
// still EXPERIENCE_TITLE_SIZE (own font size, no extra leading — the same
// convention already used for every other metadata field in this file),
// unchanged. The date's own line likewise still advances by its own font
// size (EXPERIENCE_SUBTITLE_SIZE) with no extra leading, governing the
// step from the date down to whatever the caller renders next
// (institution/grade or description) — untouched by this pass.
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
    doc.setTextColor(...COLOR_BODY);
    doc.text(date, LEFT_MARGIN, cursorY);
    // Date's own line — own font size, no extra leading, unchanged.
    cursorY += EXPERIENCE_SUBTITLE_SIZE;
  }

  const hasContent = titleLines.length > 0 || Boolean(date);
  const height = cursorY - y;

  return { height, hasContent };
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
// field in this file) and wraps each item's text to `wrapWidth` (the
// caller passes the width already narrowed for its own bullet-dot
// indent — e.g. CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT for a
// flush-left section, or a further-narrowed width for Experience's
// timeline-indented content). Shared by every section's own
// estimate*EntryMinimumHeight() (space estimate) AND its add*Entry()
// (the actual render) so the pre-render estimate and the real output
// can never disagree about line counts or wrap width.
function buildBulletDescriptionItems(
  doc: jsPDF,
  description: string,
  wrapWidth: number
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
      lines: doc.splitTextToSize(item.text, wrapWidth),
    }));
}

// Renders a bulleted description: every item gets a "•" dot at
// `bulletX` with its text starting at `bulletTextX` (the dot's X
// position never moves; only the text is offset from it). Callers pass
// their own X positions — LEFT_MARGIN / LEFT_MARGIN + BULLET_DOT_TO_TEXT_GAP_PT
// for a flush-left section (Achievements, Projects), or positions
// shifted further right for Experience's timeline-indented content —
// so this one implementation stays the single source of truth for how
// a bulleted description is drawn everywhere in this file.
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
  startY: number,
  bulletX: number,
  bulletTextX: number
): number {
  let y = startY;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  for (const item of items) {
    item.lines.forEach((line, lineIndex) => {
      // Reserves only this line's own ink-bottom (see lineInkHeight()
      // near the end of this file), not the full BODY_LINE_HEIGHT
      // advance, which includes leading meant for the next line.
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
// needs (title/date block + FULL wrapped description), without drawing
// anything. Used by addAchievementEntry() itself for its own
// checkPageBreak() call AND by addAchievements() to size its
// heading-guard against the REAL first entry — same rationale as
// estimateExperienceEntryMinimumHeight() above. Mirrors
// addAchievementEntry()'s own layout exactly (including
// renderTitleWithDateBelow()'s title->date-below placement).
//
// PAGE-BREAK FIX: the trailing description term now reserves its FULL
// wrapped height (every line across every bulleted item), not just its
// first line — a multi-line description could previously pass this
// guard while only one line of room was actually reserved, letting the
// entry's own per-line checkPageBreak() (inside
// renderBulletDescriptionLines() below) split the description away
// from its Title/Date mid-entry. This does not change any spacing
// value — only how much of the entry's real content this estimate
// accounts for, mirroring the same full-height principle Experience's
// and Project's own description estimates already use.
function estimateAchievementEntryMinimumHeight(doc: jsPDF, ach: any): number {
  const title = (ach.title || '').trim();
  const date = (ach.date || '').trim();
  const description = (ach.description || '').trim();

  // Uses the SAME buildBulletDescriptionItems() the real render
  // uses (see its own doc comment above), so this estimate's line
  // count/wrap-width can never drift out of parity with what
  // addAchievementEntry() actually draws.
  const descriptionItems = buildBulletDescriptionItems(doc, description, CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const estimatedTitleLineCount = title ? doc.splitTextToSize(title, CONTENT_WIDTH).length : 0;
  let titleRowHeightEstimate = 0;
  if (estimatedTitleLineCount > 0) {
    titleRowHeightEstimate = date
      ? (estimatedTitleLineCount - 1) * EXPERIENCE_TITLE_SIZE + BODY_LINE_HEIGHT + EXPERIENCE_SUBTITLE_SIZE
      : estimatedTitleLineCount * EXPERIENCE_TITLE_SIZE;
  } else if (date) {
    titleRowHeightEstimate = EXPERIENCE_SUBTITLE_SIZE;
  }
  const hasHeaderContent = Boolean(title || date);
  const headerToDescriptionGap = hasHeaderContent && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  // Full description height (every wrapped line) — see the PAGE-BREAK
  // FIX note above this function for why this is no longer just the
  // first line.
  const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const descriptionTotalHeight = descriptionLines.length * BODY_LINE_HEIGHT;

  const hasDescription = descriptionLines.length > 0;
  const lastLineFontSize = hasDescription ? BODY_SIZE
    : date ? EXPERIENCE_SUBTITLE_SIZE
    : title ? EXPERIENCE_TITLE_SIZE
    : EXPERIENCE_TITLE_SIZE;
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSize;

  // PAGE-FLOW (ported from modernPdf.ts/academicPdf.ts, logic only):
  // reserve the whole entry when it fits on one page; otherwise
  // reserve only the header + first description line, so a description
  // too long for any single page still flows across pages via
  // renderBulletDescriptionLines()'s own per-line checkPageBreak()
  // calls. See keepTogetherHeight()/inkBottomHeight() near the end of
  // this file.
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

  const title = (ach.title || '').trim();
  const date = (ach.date || '').trim();
  const description = (ach.description || '').trim();

  // Date renders on its own line directly BELOW the achievement
  // title/name — via the shared renderTitleWithDateBelow() helper (see
  // its own doc comment above), also used by Education. (Experience
  // keeps the original same-row date placement via
  // renderTitleRowWithDate() — unchanged.)

  // Description uses body text size and line height with 1.4 multiplier
  // (same as Summary and Experience description).
  //
  // BULLET-AWARE, ONE-BULLET-PER-ITEM: each manual line break the user
  // typed (split on '\n') is one ACHIEVEMENT ITEM. An item only gets a
  // bullet dot if the user's own text for that line already started
  // with a bullet marker — see BULLET_MARKER_PATTERN/parseBulletLine()
  // above — never invented for a plain line, and never more than one
  // dot regardless of how many lines that item wraps into.
  // `descriptionItems` (built via the shared buildBulletDescriptionItems(),
  // also used by the page-break estimate above, so the two can never
  // disagree) keeps that grouping — one array entry per item, each
  // carrying whether it's bulleted and its own wrapped lines — so
  // renderBulletDescriptionLines() can draw a dot only where the
  // input actually had one. `descriptionLines` (the flat list of every
  // wrapped line, across all items) is kept alongside it purely for
  // the page-break/space estimates below, which only ever cared about
  // total line count.
  const descriptionItems = buildBulletDescriptionItems(doc, description, CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT);
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

    y = renderBulletDescriptionLines(doc, descriptionItems, y, LEFT_MARGIN, LEFT_MARGIN + BULLET_DOT_TO_TEXT_GAP_PT);
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
function addCertifications(doc: jsPDF, data: MinimalPdfData, startY: number): number {
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
// needs (name + date + credential ID, all full wrapped heights),
// without drawing anything. Used by addCertificationEntry() itself for
// its own checkPageBreak() call AND by addCertifications() to size its
// heading-guard against the REAL first entry — same rationale as
// estimateExperienceEntryMinimumHeight() above.
function estimateCertificationEntryMinimumHeight(doc: jsPDF, cert: any): number {
  const name = (cert.name || '').trim();
  const date = (cert.date || '').trim();
  const credentialId = (cert.credentialId || '').trim();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const nameLines: string[] = name ? doc.splitTextToSize(name, CONTENT_WIDTH) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateLines: string[] = date ? doc.splitTextToSize(date, CONTENT_WIDTH) : [];
  const credentialLines: string[] = credentialId ? doc.splitTextToSize(credentialId, CONTENT_WIDTH) : [];

  const nameHeight = nameLines.length * EXPERIENCE_TITLE_SIZE;
  const dateHeight = dateLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const credentialHeight = credentialLines.length * EXPERIENCE_SUBTITLE_SIZE;

  const nameToDateGap = nameLines.length > 0 && dateLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const dateToCredentialGap = dateLines.length > 0 && credentialLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const nameToCredentialGap = nameLines.length > 0 && credentialLines.length > 0 && dateLines.length === 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;

  const fullHeight = nameHeight + nameToDateGap + dateHeight +
    dateToCredentialGap + credentialHeight + nameToCredentialGap;

  // PAGE-FLOW (ported from modernPdf.ts/academicPdf.ts, logic only): a
  // Certification entry has no unbounded body-text field, so it always
  // reserves as one ink-bottom-measured block — see
  // keepTogetherHeight()/inkBottomHeight() near the end of this file.
  const lastLineFontSize = credentialLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE
    : dateLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE
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
    doc.setTextColor(...COLOR_BODY);
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
    doc.setTextColor(...COLOR_BODY);
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
function addProjects(doc: jsPDF, data: MinimalPdfData, startY: number): number {
  const projects = (data.projects || []).filter(hasUsableProjectContent);

  if (projects.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (Achievements) and this section.
  // This is the SAME SECTION_GAP used by all other section transitions.
  y += SECTION_GAP;

  // ROOT-CAUSE FIX — sized against the REAL first entry (via the same
  // estimateProjectEntryMinimumHeight() addProjectEntry() itself checks
  // against) rather than a generic one-line guess — see the matching
  // note on addExperience()'s heading-guard for the full analysis of
  // why a generic guess can still orphan the heading.
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
// (name + tech + FULL wrapped description + github, all full wrapped
// heights), without drawing anything. Used by addProjectEntry() itself
// for its own checkPageBreak() call AND by addProjects() to size its
// heading-guard against the REAL first entry — same rationale as
// estimateExperienceEntryMinimumHeight() above.
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

  const descriptionItems = buildBulletDescriptionItems(doc, description, CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT);
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

  const fullHeight = nameHeight + nameToTechGap + techHeight +
    headerToDescriptionGap + descriptionHeight +
    descriptionToGithubGap + githubHeight + techToGithubGap + nameToGithubGap;

  // PAGE-FLOW (ported from modernPdf.ts/academicPdf.ts, logic only):
  // reserve the whole entry when it fits on one page; otherwise
  // reserve only up to the first description line, so a description
  // too long for any single page still flows across pages via the
  // per-line checkPageBreak() calls in addProjectEntry(). See
  // keepTogetherHeight()/inkBottomHeight() near the end of this file.
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

  // Description: each typed line becomes one bullet item (see
  // buildBulletDescriptionItems()/renderBulletDescriptionLines() above),
  // matching the CV builder's own form/preview where each line is
  // already shown as one point.
  const descriptionItems = buildBulletDescriptionItems(doc, description, CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT);
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
    doc.setTextColor(...COLOR_BODY);
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
  // (line ~3040, when there's no Tech) or the Tech block's own
  // forward-looking gap (line ~3054, when Tech is present). This block
  // must NOT add EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP again here: doing
  // so double-counted the same single gap (rendering 2x the intended
  // spacing — visibly bigger than the identical gap used everywhere else
  // in this file, e.g. Experience/Achievement/Certification's header ->
  // description spacing, and than the normal BODY_LINE_HEIGHT content
  // spacing used inside a paragraph like Professional Summary). Fixed by
  // simply not re-adding it — same single-gap convention every other
  // section already follows correctly.
  if (descriptionLines.length > 0) {
    y = renderBulletDescriptionLines(doc, descriptionItems, y, LEFT_MARGIN, LEFT_MARGIN + BULLET_DOT_TO_TEXT_GAP_PT);

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

// ====================================================================
// KEEP-TOGETHER HEIGHT (page-flow system, ported unchanged from
// modernPdf.ts/academicPdf.ts — logic only, no Minimal design values
// are read or changed by this function)
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
// INK-BOTTOM HEIGHTS (page-flow system, ported unchanged from
// modernPdf.ts/academicPdf.ts)
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