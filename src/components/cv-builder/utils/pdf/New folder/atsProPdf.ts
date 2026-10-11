/**
 * atsProPdf.ts
 * ------------------------------------------------------------------
 * A from-scratch, single-file CV PDF generator built with jsPDF.
 *
 * ATS PRO: this file is a structural clone of simplePdf.ts. Every
 * layout, spacing, typography, pagination, and content-rendering
 * behavior is identical to simplePdf.ts. Exactly two intentional
 * differences exist:
 *   1. Template identity — this generator is named/exported as the
 *      "ATS Pro" template (generateAtsProPDF / AtsPro* types) rather
 *      than "Simple PDF".
 *   2. Section-heading color — the 8 section headings (PROFESSIONAL
 *      SUMMARY, EXPERIENCE, EDUCATION, SKILLS, LANGUAGES,
 *      ACHIEVEMENTS, CERTIFICATIONS, PROJECTS) render in red via the
 *      new COLOR_SECTION_HEADING constant. COLOR_HEADING stays
 *      dedicated to entry-level bold titles (job titles, degrees,
 *      language names, achievement titles, certification names,
 *      project names) — those never turn red. See COLOR_SECTION_
 *      HEADING below. (COLOR_HEADING's own RGB value was later
 *      updated by the visual color pass in point 3 below — it is
 *      still never used for section headings.)
 *   3. Visual color pass (design-only, reference: ATSProTemplate.tsx)
 *      — six existing color constants (COLOR_RULE, COLOR_SECTION_
 *      DIVIDER, COLOR_TITLE, COLOR_NAME, COLOR_HEADING, COLOR_BODY)
 *      were re-pointed to a maroon/near-black/sienna palette. No
 *      geometry, typography size, spacing, wrapping, pagination, or
 *      content-rendering logic changed — see each constant's value
 *      below for specifics.
 *   4. Date-position pass — Experience, Education, and Achievement
 *      dates are now RIGHT-ALIGNED on the SAME ROW as their entry's
 *      title/degree/name (previously each date rendered on its own
 *      line below). The positioning PATTERN (not coordinates) is
 *      ported from modernPdf.ts's renderTitleRowWithDate() helper,
 *      reimplemented against ATSPro's own constants (COLOR_DATE,
 *      COLOR_HEADING, CONTENT_WIDTH, PAGE_WIDTH, RIGHT_MARGIN, and
 *      the new TITLE_TO_DATE_GAP_PT). Every other ATSPro constant,
 *      color, gap, and section is unchanged.
 *
 * STATUS: PHASE 1 + PHASE 2 + PHASE 3 + PHASE 4 + PHASE 5 + PHASE 6 + PHASE 7 + PHASE 8 + PHASE 9 + PHASE 10 (DESIGN PASS) + PHASE 11 (LAYOUT REFINEMENT) + PHASE 12 (RIGHT-ALIGNED DATES)
 *   (+ a global section-gap consistency pass — see
 *   "SECTION-GAP ARCHITECTURE" / topUpToLineHeight() below)
 *   (+ universal section-heading dividers — see
 *   "UNIVERSAL SECTION HEADING + DIVIDER" / renderSectionHeading() below.
 *   Every section heading (Summary, Experience, Education, Skills,
 *   Languages, Achievements, Certifications, Projects) is now followed
 *   by a divider line before its content. Header's own separate divider
 *   is unchanged.)
 *   (+ Design pass: section-heading color formula (first 3 chars maroon,
 *      rest near-black), date color system (maroon), content rhythm
 *      alignment with reference ATSProTemplate, section order alignment)
 *   (+ Layout refinement pass: Experience date moved under company,
 *      Education date moved under university, Achievement descriptions
 *      bulletted, all bullet dots maroon)
 *   (+ Date-position pass: Experience/Education/Achievement dates are
 *      now right-aligned on the same row as their title/degree/name,
 *      matching the Modern PDF reference's row relationship.)
 *   - A4 page setup
 *   - Margins
 *   - Header (name, job title, contact line)
 *   - Professional Summary (heading + wrapped paragraph, skipped if empty)
 *   - Experience (heading + entries: title+date row, company, description),
 *     skipped entirely if there are no usable entries
 *   - Education (heading + entries: degree+year row, institution, grade),
 *     skipped entirely if there are no usable entries
 *   - Certifications (heading + entries: name, date, credentialId),
 *     skipped entirely if there are no usable entries
 *   - Languages (heading + entries: language name, expanded proficiency
 *     label), skipped entirely if there are no usable entries
 *   - Skills (heading + TWO-COLUMN vertical bullet list),
 *     skipped entirely if empty
 *   - Projects (heading + entries: name, tech, description, github),
 *     skipped entirely if there are no usable entries
 *   - Achievements (heading + entries: title+date row, bulleted description),
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

// --- Header profile photo (circular header layout) ---
// Exact rendered diameter of the circular header photo. This file's
// entire coordinate system is already in points everywhere (see
// PAGE LAYOUT CONSTANTS above) — there is no separate px unit or
// px/pt conversion helper anywhere in this file, so the requested
// "75px" diameter is expressed directly as 75pt, the same convention
// every other size in this file already follows (e.g. NAME_SIZE,
// TITLE_SIZE are point sizes, not px-converted values). No new
// unit-conversion constant is introduced because none was needed.
//
// HEADER_PHOTO_SIZE_BASE_PT: the photo's diameter BEFORE the requested
// size increase. Declared as its own constant — rather than inlining
// 75 again — because it is also the fixed VERTICAL-POSITION anchor
// used below in addHeader() for the photo-overhang/Contact-line
// calculation: growing the drawn diameter is intentionally decoupled
// from how far the photo's bottom edge is allowed to push the Contact
// line down, so that calculation (and therefore Contact's own Y
// position and the Image <-> Contact gap) never moves when this size
// changes, only the drawn circle does.
const HEADER_PHOTO_SIZE_BASE_PT = 75; // pt — the pre-increase diameter, also the fixed overhang anchor

// SIZE UPDATE (+6pt): requested increase on top of
// HEADER_PHOTO_SIZE_BASE_PT, declared as its own explicit term (rather
// than folded into a new literal) so this file's history of size
// changes stays legible and independently traceable. Supersedes the
// file's previous +4pt increase per explicit request — not additive
// on top of it.
const HEADER_PHOTO_SIZE_INCREASE_PT = 6; // pt — requested +6px increase (replaces the previous +4px)

// HEADER_PHOTO_SIZE_PT: the single source of truth for the header
// photo's DRAWN size — every rendering consumer (circle radius, image
// draw width/height, aspect-ratio "cover" fit, and the horizontal
// photo-to-text gap calculation) reads this one constant, so the
// increase is automatically proportional and never distorts the
// image. HEADER_PHOTO_SIZE_BASE_PT above (not this constant) is what
// governs the photo-overhang/Contact-line anchor (see addHeader()
// below), so this value changing only ever changes how big the circle
// is drawn — never Contact's Y position or the Image <-> Contact gap.
const HEADER_PHOTO_SIZE_PT = HEADER_PHOTO_SIZE_BASE_PT + HEADER_PHOTO_SIZE_INCREASE_PT; // pt — 75pt base + exactly 6pt (81pt)

// Horizontal whitespace between the photo's right edge and the
// name/job-title text block that now sits directly beside it
// (Kickresume-style layout), instead of at the opposite end of the
// header. Declared as its own named constant — same convention as
// every other spacing value in this file (NAME_TO_TITLE_GAP,
// TITLE_TO_CONTACT_GAP, etc.) — so nothing is hardcoded inline at the
// call site.
const PHOTO_TO_TEXT_GAP_PT = 15;
// NOTE: the header's own divider used to have a separate, hardcoded
// HEADER_RULE_GAP (12pt) on each side — a different value from the
// 1mm (DIVIDER_SIDE_GAP_PT) gap every section-heading divider uses via
// renderSectionHeading(). That constant has been removed; addHeader()
// below reuses DIVIDER_SIDE_GAP_PT (declared further down, next to the
// universal section-heading divider spacing) for the gap ABOVE its own
// divider (contact line -> rule), matching every section-heading
// divider's own internal spacing convention.
//
// Below the rule, addHeader() does NOT reuse DIVIDER_SIDE_GAP_PT again —
// that constant is 1mm, far smaller than the reserved buffer every
// other section normalizes to. Instead it normalizes its return value
// with the same topUpToLineHeight() helper every other addXxx()
// section already calls before its real content end is handed back
// (see the SECTION-GAP ARCHITECTURE note above addSummary()). That
// helper is what makes every section's returned Y measure from an
// equivalent point regardless of what the section actually ended on
// (a wrapped paragraph vs. a single metadata line) — the header's own
// ending (a drawn rule, not a text baseline) needs that same
// normalization so the gap SECTION_GAP produces afterward matches
// every other section-to-section gap, instead of being measured from
// a different kind of starting point.

// UNIT CONVERSION: the whole file works in points (jsPDF's unit for
// this doc — see PAGE LAYOUT CONSTANTS above), but some required
// whitespace values (below, and the divider spacing further down) are
// specified in millimeters. One centralized conversion constant is
// the single source of truth for that unit change — no mm value is
// ever hand-converted to a decimal point value anywhere in this file.
// Declared here (rather than further down, next to the divider
// constants that used to be its only consumer) so SECTION_GAP below —
// now also an mm-sourced value — can use it too.
const MM_TO_PT = 72 / 25.4;

// SECTION_GAP: the vertical gap between every consecutive CV section
// (see SECTION-GAP ARCHITECTURE below), expressed as the file's
// original, pre-increase gap plus an explicit +1mm increase term —
// not a new unrelated hardcoded number. SECTION_GAP_BASE_PT (18) is
// the CURRENT existing section-to-section gap this change is defined
// relative to; SECTION_GAP_INCREASE_PT is that requested +1mm,
// converted through MM_TO_PT exactly like every other mm-sourced
// value in this file (e.g. DIVIDER_SIDE_GAP_PT below). Declaring the
// increase as its own named term (rather than folding it into a new
// literal) keeps this file's history of spacing changes legible and
// independently traceable, matching the convention already used for
// HEADER_PHOTO_SIZE_INCREASE_PT above.
//
// Because every addXxx() section function (Summary, Experience,
// Education, Certifications, Languages, Skills, Projects,
// Achievements) applies this SAME constant, and because addHeader()
// normalizes its own ending via topUpToLineHeight() to the identical
// "equivalent point" every other section returns before SECTION_GAP
// is added (see the note above addHeader()'s `return y;` and the
// SECTION-GAP ARCHITECTURE block below), the Header→Professional
// Summary gap — i.e. Contact Divider → Professional Summary — is
// driven by this exact same source of truth, not a separate
// Contact-specific value. The +1mm therefore applies uniformly to
// every section transition, including that one, with no per-section
// or per-call-site special-casing.
const SECTION_GAP_BASE_PT = 18; // pt — the original, pre-increase section-to-section gap
const SECTION_GAP_INCREASE_PT = 1 * MM_TO_PT; // 1mm, ≈ 2.8346pt — requested increase on top of SECTION_GAP_BASE_PT
const SECTION_GAP = SECTION_GAP_BASE_PT + SECTION_GAP_INCREASE_PT; // pt — 18pt + exactly 1mm
// NOTE: HEADING_TO_CONTENT_GAP, ITEM_GAP, and BULLET_GAP were removed
// here — all three were declared but never referenced by any
// rendering logic in this file (every section's heading->content
// transition is governed by renderSectionHeading() /
// sectionHeadingToContentOffset() instead, and no bulleted list in
// this file ever consumed BULLET_GAP or ITEM_GAP). Removing them is a
// pure dead-code cleanup — no behavior changes.

// --- Contact Divider -> Professional Summary: isolated +1mm ---
// A second, LATER request asked for exactly 1mm of EXTRA whitespace
// between the header's Contact divider and the Professional Summary
// heading — and ONLY there, with every normal section-to-section gap
// (Summary->Experience, Experience->Education, etc.) explicitly
// required to stay exactly as SECTION_GAP above already produces.
// Because SECTION_GAP is shared by every addXxx() section, it cannot
// be the vehicle for a transition-specific change — doing so would
// (correctly, per the SECTION-GAP ARCHITECTURE note above) move every
// other section gap too. This constant is therefore deliberately kept
// separate from SECTION_GAP and consumed in exactly one place:
// addSummary()'s own `y += SECTION_GAP` step (see addSummary() below).
// That call site is the sole, fixed representation of the Contact
// Divider -> Professional Summary transition in this file (addSummary()
// always runs immediately after addHeader() — see generateAtsProPDF()),
// so adding it only there cannot leak into any other section's gap.
// Expressed in mm and converted through the file's existing MM_TO_PT
// constant, same convention as every other mm-sourced spacing value.
const CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT = 1 * MM_TO_PT; // 1mm, ≈ 2.8346pt — extra whitespace, Contact Divider -> Professional Summary only

// --- Universal section-heading divider spacing ---
//
// The exact whitespace required on EACH side of the divider (heading
// -> divider, and divider -> content), as real, visible, empty space —
// not a baseline-to-baseline distance. One constant, reused for both
// sides and for every section.
// NOTE: this constant now governs ONLY the header's own divider (see
// addHeader() below) — the section-heading divider's own two gaps
// were restored to the old ATS Pro geometry (attached to the heading,
// 3mm before content) and now use SECTION_DIVIDER_BASELINE_OFFSET_RATIO
// and SECTION_DIVIDER_TO_CONTENT_GAP_PT below instead.
const DIVIDER_SIDE_GAP_PT = 1 * MM_TO_PT; // 1mm, ≈ 2.8346pt

// --- Section-heading divider position (restored to match the old ATS
// Pro layout — see renderSectionHeading() / sectionHeadingToContentOffset()
// below) ---
//
// HORIZONTAL: the divider starts EXACTLY SECTION_HEADING_TO_DIVIDER_
// GAP_PT (1.5mm) after the heading's own final rendered character — the
// start X is the running X position after drawing the heading text
// (the heading's real, actual rendered end — not an estimate), plus
// that one named gap constant.
//
// VERTICAL: the old ATS Pro divider was drawn at
// `headingBaselineY - (fontSize * 0.13) + (fontSize * 0.1)`, i.e.
// `fontSize * 0.03` ABOVE the heading's own baseline — a "subscript"
// position sitting in the lower/base portion of the capital letters'
// ink rather than centered through their full cap-height. That
// derivation collapses to a single ratio of the heading font size,
// reproduced here as a named constant (not the old raw two-term
// expression, and not any of the old per-section 0.1mm/0.2mm/0.3mm
// hand-tuned shifts, which were one-off visual patches, not real
// geometry).
const SECTION_DIVIDER_BASELINE_OFFSET_RATIO = 0.03; // fraction of HEADING_SIZE the divider sits above the heading baseline

// The exact horizontal whitespace between the heading's own real,
// rendered end (LEFT_MARGIN + actual heading text width, measured via
// doc.getTextWidth() — not an estimate) and the divider's start X.
// Independent of, and not to be confused with, SECTION_DIVIDER_TO_
// CONTENT_GAP_PT below — one governs the heading->divider relationship
// (this row), the other governs divider->content (the next row).
const SECTION_HEADING_TO_DIVIDER_GAP_PT = 1.5 * MM_TO_PT; // 1.5mm, ≈ 4.2519pt

// The visible whitespace between the divider's bottom edge and the
// first content line's ink-top, as real empty space (same convention
// as DIVIDER_SIDE_GAP_PT above) — required to be exactly 3mm.
const SECTION_DIVIDER_TO_CONTENT_GAP_PT = 3 * MM_TO_PT; // 3mm, ≈ 8.5039pt

// Requested: when there is NO profile photo, the header's Name and Job
// Title each need to move down by their own small, fixed amount (Name
// 2mm, Job Title 1mm) — and ONLY in that no-photo case; the
// photo-present header branch (CASE 1 in addHeader()) is completely
// unaffected. Expressed in mm and converted through the file's
// existing MM_TO_PT constant, same convention as every other
// mm-sourced offset above — no raw pt magic number. These two
// constants are read in exactly one place (addHeader()'s CASE 2 /
// no-photo branch) and only add to the Y value used to DRAW the Name/
// Job Title text — the plain cursor `y` that goes on to position the
// Contact line and header divider is deliberately left unaffected by
// either offset, so Contact/divider/everything below stays exactly
// where it already was.
const NO_IMAGE_NAME_Y_OFFSET_MM = 2;
const NO_IMAGE_NAME_Y_OFFSET_PT = NO_IMAGE_NAME_Y_OFFSET_MM * MM_TO_PT;
const NO_IMAGE_TITLE_Y_OFFSET_MM = 1;
const NO_IMAGE_TITLE_Y_OFFSET_PT = NO_IMAGE_TITLE_Y_OFFSET_MM * MM_TO_PT;

// --- Right-aligned date on a title/degree/achievement-name row
// (Experience, Education, Achievements) ---
// Horizontal gap reserved between the end of the wrapped title text
// and the start of its right-aligned date, expressed in mm and
// converted through the file's existing MM_TO_PT conversion — same
// convention as every other mm-sourced spacing constant in this file
// (SECTION_HEADING_TO_DIVIDER_GAP_PT, DIVIDER_SIDE_GAP_PT, etc.) — so
// no raw pt magic number is introduced. PORTED IN POSITION ONLY from
// the Modern PDF reference's TITLE_TO_DATE_GAP_MM/PT (same 3mm);
// ATSPro did not previously have a right-aligned date anywhere, so
// this is a new named constant rather than a reuse of an existing one.
// It is read ONLY by renderTitleRowWithDate() below (and by each of
// the three entry functions' page-break space estimates, which must
// predict the same wrap width that helper will actually use), and it
// does not affect any other section, gap, or coordinate in this file.
const TITLE_TO_DATE_GAP_MM = 3;
const TITLE_TO_DATE_GAP_PT = TITLE_TO_DATE_GAP_MM * MM_TO_PT;

// Standard Adobe Core-14 Helvetica AFM font metrics, expressed as a
// fraction of font size. jsPDF's 'helvetica' standard font IS this
// font, so these ratios are real rendering geometry, not assumptions:
//   - ascender  = 718/1000 em  (how far a line's ink rises above its
//     own baseline — already used by the previous phase's fix)
//   - descender = 207/1000 em  (how far a line's ink — e.g. the tail
//     of a "g" or "y" — extends below its own baseline)
// Both are needed now because "exactly 1mm of whitespace" must be
// measured between actual ink edges, not between the baseline
// reference points doc.text()/checkPageBreak() otherwise use.
const HELVETICA_ASCENT_RATIO = 0.718;

// The descender ratio from the same AFM metrics block above (207/1000
// em) — declared as an actual constant now (it was previously only
// documented in the comment above, not usable in code) because the
// entry-trailing-space normalizer below needs it to correct for the
// specific visual effect described in VISUAL DESCENDER PARITY further
// down: real content (unlike the hardcoded ALL-CAPS headings) can
// contain lowercase descenders (g, j, p, q, y), and different entries'
// last lines don't all happen to contain one.
const HELVETICA_DESCENT_RATIO = 0.207;

// English CV content is plain Latin text, so checking for the 5
// lowercase letters whose descender actually extends below the
// baseline in Helvetica (g, j, p, q, y) is sufficient — this is a
// content check, not a new spacing value.
function hasDescenderChar(text: string): boolean {
  return /[gjpqy]/.test(text);
}

// Computes the exact Y distance from a section heading's own baseline
// (the startY passed into renderSectionHeading()) down to the BASELINE
// of the first line of content that will be drawn beneath its divider,
// given the divider's real geometry. This is the SINGLE formula behind
// both the actual rendering in renderSectionHeading() and every
// section's pre-heading checkPageBreak() reservation, so measurement
// and rendering can never disagree (see both call sites below).
//
//   headingInkBottomY  = headingBaselineY                      (see note below — no descent term)
//   dividerCenterY      = headingBaselineY - HEADING_SIZE * SECTION_DIVIDER_BASELINE_OFFSET_RATIO
//   dividerBottomEdgeY  = dividerCenterY + SECTION_DIVIDER_THICKNESS / 2
//   contentInkTopY      = dividerBottomEdgeY + SECTION_DIVIDER_TO_CONTENT_GAP_PT
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
// is still needed for the content side.)
//
// HEADING->DIVIDER: restored to the old ATS Pro geometry — the
// divider is attached directly to the heading (no horizontal gap;
// see renderSectionHeading()) and sits HEADING_SIZE *
// SECTION_DIVIDER_BASELINE_OFFSET_RATIO ABOVE the heading's own
// baseline, in the lower/base portion of the heading's ink rather
// than centered through it. That places the divider's center slightly
// above startY, so the offset term below is negative.
//
// DIVIDER->CONTENT: exactly SECTION_DIVIDER_TO_CONTENT_GAP_PT (3mm) of
// real empty space below the divider's bottom edge.
//
// `firstContentFontSize` is the font size of whatever gets drawn
// immediately under the divider (BODY_SIZE for Summary/Skills'
// paragraph text, EXPERIENCE_TITLE_SIZE for every entry-based
// section's title) — passing it in, rather than assuming one size,
// is what makes the 3mm whitespace exact for every section instead of
// merely "at least 3mm" for whichever sections use a smaller font.
function sectionHeadingToContentOffset(firstContentFontSize: number): number {
  const dividerCenterOffset = -(HEADING_SIZE * SECTION_DIVIDER_BASELINE_OFFSET_RATIO); // heading baseline -> divider center (above baseline)
  const dividerBottomEdgeOffset = dividerCenterOffset + SECTION_DIVIDER_THICKNESS / 2;
  const contentInkTopOffset = dividerBottomEdgeOffset + SECTION_DIVIDER_TO_CONTENT_GAP_PT;
  return contentInkTopOffset + firstContentFontSize * HELVETICA_ASCENT_RATIO;
}

// --- Experience entry spacing (Phase 3) ---
const EXPERIENCE_TITLE_TO_SUBTITLE_GAP = 3; // job title -> company/dates line
const EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = 6; // company/dates (or title) -> description
const EXPERIENCE_ENTRY_GAP = 14; // space between one experience entry and the next

// --- Skills two-column layout constants ---
// The SKILLS_SEPARATOR constant is no longer used (Skills section now
// uses a two-column bullet list instead of an inline list), but is kept
// for reference in case the inline list is ever needed again.
const SKILLS_SEPARATOR = '   •   ';
//
// NOTE: the previous SKILLS_COLUMN_GAP_PT / SKILLS_RIGHT_COLUMN_START
// constants split the content width exactly in half, which visually
// reads as "the right column sits in the middle of the page" rather
// than flush against the right margin. They have been removed: the
// right column's start X is now measured directly from its own actual
// skill text inside addSkills() (via doc.getTextWidth) so it always
// ends exactly at the content area's right edge — genuinely full
// right, never past the page, with no fixed split-point constant
// needed here.

// Divider line under the header
// THICKNESS PASS: increased by exactly 0.5mm (converted via the file's
// one centralized MM_TO_PT constant below — no separate or
// hand-computed conversion) on top of the original 0.75pt base — same
// treatment as SECTION_DIVIDER_THICKNESS below, applied to this
// separate constant so the two dividers stay decoupled (see note
// below). Divider position, start-X/end-X, and every gap around it
// are untouched — only the stroke weight changes. This constant is
// also reused (unrelated to its line-width role) by addHeader()'s
// topUpToLineHeight() call as the closest existing analog to "the size
// of what was just drawn" when normalizing the header -> first-section
// gap — that reuse picks up the new thickness automatically, exactly
// like SECTION_DIVIDER_THICKNESS's existing divider-to-content-gap
// formula already does for section dividers.
const HEADER_RULE_THICKNESS = 0.75 + 0.5 * MM_TO_PT; // 0.75pt base + 0.5mm

// Universal section-heading divider (added in this phase). Declared as
// its own constant — deliberately NOT aliased to HEADER_RULE_THICKNESS —
// so the Header's divider and the section dividers can never accidentally
// become coupled; they only happen to share the same base value today
// because that's the intended visual weight for a subtle rule line.
// THICKNESS PASS: increased by exactly 0.5mm (converted via the file's
// one centralized MM_TO_PT constant, declared above — no separate or
// hand-computed conversion) on top of the original 0.75pt base. This is
// the single source of truth for every section-heading divider's
// thickness; every section goes through renderSectionHeading(), so this
// one change applies uniformly with no per-section special-casing.
// Divider start-X/end-X, its vertical position, and the heading-to-
// divider and divider-to-content gaps are untouched — only the stroke
// weight changes.
const SECTION_DIVIDER_THICKNESS = 0.75 + 0.5 * MM_TO_PT; // 0.75pt base + 0.5mm

// --- All ATSPro dividers: reduce rendered horizontal width by exactly
// 0.1mm ---
// Both dividers this file draws (the header's own rule, and every
// section-heading divider drawn by renderSectionHeading()) currently
// run from their own start X to the same right edge, PAGE_WIDTH -
// RIGHT_MARGIN (see addHeader()'s and renderSectionHeading()'s
// doc.line() calls below). Shortening "every existing divider" by
// 0.1mm therefore means pulling that one shared end-X in by 0.1mm —
// a single shared constant, so both call sites automatically receive
// the identical adjustment with no per-divider special-casing.
// Expressed in mm and converted through the file's existing MM_TO_PT
// constant, same convention as every other mm-sourced value here.
// Only the END X moves; each divider's START X (LEFT_MARGIN for the
// header rule, the heading's real rendered end + SECTION_HEADING_TO_
// DIVIDER_GAP_PT for section dividers), its vertical position (Y),
// thickness, and color are all completely untouched by this constant.
const DIVIDER_WIDTH_REDUCTION_PT = 0.1 * MM_TO_PT; // 0.1mm, ≈ 0.2835pt
const DIVIDER_END_X = PAGE_WIDTH - RIGHT_MARGIN - DIVIDER_WIDTH_REDUCTION_PT;

// --- Header's own Contact divider ONLY: one further 0.1mm width
// reduction ---
// Minimally derived from the shared DIVIDER_WIDTH_REDUCTION_PT/
// DIVIDER_END_X calculation above (reused, not reimplemented) so this
// stays a single, centralized formula rather than a new independent
// divider-positioning system. This pulls in ONLY the header rule's
// own end-X by one further DIVIDER_WIDTH_REDUCTION_PT (0.1mm); the
// shared DIVIDER_END_X used by every section-heading divider (see
// renderSectionHeading() below) is completely untouched. Start-X (still
// LEFT_MARGIN), Y position, thickness (HEADER_RULE_THICKNESS), and
// color (COLOR_RULE) of the header rule are all unaffected — only its
// rendered end-X, and therefore only its horizontal width, changes.
const HEADER_DIVIDER_END_X = DIVIDER_END_X - DIVIDER_WIDTH_REDUCTION_PT;

// Text colors (RGB, 0-255). Kept as named constants rather than
// scattering setTextColor(r, g, b) calls with unexplained numbers.
const COLOR_NAME = [17, 24, 39] as const;
const COLOR_TITLE = [128, 0, 0] as const;
const COLOR_METADATA = [90, 90, 90] as const;
const COLOR_RULE = [160, 82, 45] as const;

// Universal section-heading divider color (added in this phase).
// Declared separately from COLOR_RULE for the same reason
// SECTION_DIVIDER_THICKNESS is declared separately from
// HEADER_RULE_THICKNESS above — the Header's rule stays fully
// independent even though the values match today.
const COLOR_SECTION_DIVIDER = [160, 82, 45] as const;

// Reserved for later phases (section headings, body paragraphs).
// NOTE (ATS Pro): COLOR_HEADING no longer controls the 8 section-
// heading titles (those use COLOR_SECTION_HEADING below) — it is the
// active color for every entry-level bold title/name that reuses it
// (Experience job title, Education degree, Language name,
// Achievement title, Certification name, Project name). Its RGB
// value was updated by the visual color pass (design reference:
// ATSProTemplate.tsx) but it must never be pointed at
// COLOR_SECTION_HEADING or vice versa — the two stay fully separate
// constants so entry titles can never accidentally turn red.
const COLOR_HEADING = [17, 24, 39] as const; // entry-level titles (job title, degree, language name, achievement title, cert name, project name) — NOT the section headings in ATS Pro
const COLOR_BODY = [31, 41, 55] as const; // normal paragraph/body text

// ATS PRO DESIGN PASS (Phase 10):
// Section heading color formula — first 3 chars maroon, rest near-black.
// This matches the reference ATSProTemplate.tsx SplitHeading component.
// The first 3 characters of each ALL-CAPS section heading use the accent
// color (maroon), and the remaining characters use the name color (near-black).
//
// COLOR_SECTION_HEADING_ACCENT = Maroon (#800000) — first 3 chars
// COLOR_SECTION_HEADING_REST = Near-black (#111827) — remaining chars
const COLOR_SECTION_HEADING_ACCENT = [128, 0, 0] as const;
const COLOR_SECTION_HEADING_REST = [17, 24, 39] as const;

// ATS PRO DESIGN PASS (Phase 10):
// Date color system — all dates (Experience, Education, Certifications,
// Achievements) use the maroon accent color. This matches the reference
// ATSProTemplate.tsx where dates are rendered in maroon.
const COLOR_DATE = [128, 0, 0] as const;

// ATS PRO LAYOUT REFINEMENT (Phase 11):
// Bullet color — all bullet dots throughout the PDF use maroon.
const COLOR_BULLET = [128, 0, 0] as const;

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
export interface AtsProPersonalInfo {
  name?: string;
  title?: string;
  jobTitle?: string;
  email?: string;
  // Header contact-line street/mailing address — matching the same
  // field name/convention already used for this purpose in the
  // sibling academicPdf.ts/minimalPdf.ts generators (read via
  // personalInfo.address, rendered into the same contact-line flow).
  address?: string;
  location?: string;
  city?: string;
  linkedin?: string;
  // GitHub profile/link for the header contact line — same free-text
  // convention as linkedin/website/portfolio above (no validation, just
  // displayed as typed).
  github?: string;
  website?: string;
  portfolio?: string;
  // ADDED for the circular header photo layout. No photo field
  // existed anywhere in this file before this change (confirmed by
  // inspection — there was no prior photo/image rendering logic to
  // preserve). Expected to be a base64 data URL (e.g.
  // "data:image/png;base64,...") — the same format the file's
  // isValidPhotoSource() check below requires and the only source
  // jsPDF's addImage() can embed without an extra fetch step.
  // ACTION FOR YOU: if your real personalInfo type uses a different
  // field name (e.g. photoUrl, profileImage), rename this to match —
  // it's a straight rename, isValidPhotoSource()/getImageFormatFromDataUrl()
  // don't care what the field is called.
  photo?: string;
}

export interface AtsProData {
  personalInfo: AtsProPersonalInfo;
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
  experiences?: AtsProExperience[];

  // CONFIRMED against the project's actual EducationItem
  // (src/components/cv-builder/types/cvTypes.ts / EducationSection.tsx):
  // fields used are degree, institution, year (already a combined
  // "start - end" string, not separate startDate/endDate), and grade.
  // There is no location or description field on an education entry,
  // so Phase 4 does not render either (nothing to fabricate).
  educations?: AtsProEducation[];

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
  languages?: AtsProLanguage[];

  // CONFIRMED against the project's actual AchievementItem
  // (src/components/cv-builder/types/cvTypes.ts / AchievementsSection.tsx):
  // fields used are title, date, description. All fields are optional.
  achievements?: AtsProAchievement[];

  // CONFIRMED against the project's actual CertificationItem
  // (src/components/cv-builder/types/cvTypes.ts / CertificationsSection.tsx):
  // fields used are name, date, credentialId. All fields are optional.
  certifications?: AtsProCertification[];

  // CONFIRMED against the project's actual ProjectItem
  // (src/components/cv-builder/types/cvTypes.ts / ProjectsSection.tsx):
  // fields used are name, tech, description, github. All fields are optional.
  projects?: AtsProProject[];

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
export interface AtsProExperience {
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
export interface AtsProEducation {
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
export interface AtsProLanguage {
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
export interface AtsProAchievement {
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
export interface AtsProCertification {
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
export interface AtsProProject {
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
// generateAtsProPDF, before knowing whether the next section will
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
//
// VISUAL DESCENDER PARITY (added in this phase):
// Equal BASELINE-to-baseline spacing (the fix above) does not by
// itself guarantee equal VISIBLE whitespace, because that depends on
// actual ink, not baselines. A last line whose real text happens to
// contain a descender (g, j, p, q, y — e.g. "20+ projects.") has ink
// that extends HELVETICA_DESCENT_RATIO * fontSize below its own
// baseline, eating into the reserved trailing buffer. A last line
// whose text has no descender (e.g. "33ffff-fhhhhhhhhhh") leaves that
// same buffer completely untouched. Same reserved buffer, different
// amount of it actually consumed by ink — so the visible gap before
// the next heading/entry ends up looking slightly larger for the
// no-descender case, purely because of which specific letters the
// content happens to contain, not because of any spacing constant.
// The optional `lastLineText` parameter corrects this: when the real
// text has no descender, the reserved buffer is intentionally shrunk
// by the same worst-case descent amount a descender WOULD have used,
// so every ending — regardless of the specific letters in the user's
// content — consumes an equal amount of the buffer and leaves an
// equal amount of visible whitespace behind. Omitting the parameter
// (existing call sites that aren't updated) keeps the exact prior
// behavior — this is a pure addition, not a behavior change for any
// caller that doesn't opt in.
// ====================================================================
function topUpToLineHeight(y: number, lastLineFontSize: number, lastLineText?: string): number {
  const baseTopUp = BODY_LINE_HEIGHT - lastLineFontSize;
  if (lastLineText === undefined) {
    return y + baseTopUp; // unchanged prior behavior
  }
  const descentReserve = lastLineFontSize * HELVETICA_DESCENT_RATIO;
  const noDescenderPenalty = hasDescenderChar(lastLineText) ? 0 : descentReserve;
  return y + baseTopUp - noDescenderPenalty;
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
//   dividerStartX       = (LEFT_MARGIN + heading text width) + SECTION_HEADING_TO_DIVIDER_GAP_PT   (exactly 1.5mm after the heading's real rendered end)
//   dividerCenterY      = headingBaselineY - HEADING_SIZE * SECTION_DIVIDER_BASELINE_OFFSET_RATIO  (lower/base portion of the heading, not vertically centered through it)
//   dividerBottomEdgeY  = dividerCenterY + SECTION_DIVIDER_THICKNESS / 2
//   contentInkTopY      = dividerBottomEdgeY + SECTION_DIVIDER_TO_CONTENT_GAP_PT   (exactly 3mm)
//   contentBaselineY    = contentInkTopY + firstContentFontSize * HELVETICA_ASCENT_RATIO (returned)
//
// Every term above is either a fixed constant (SECTION_DIVIDER_BASELINE_OFFSET_RATIO,
// SECTION_DIVIDER_THICKNESS, SECTION_DIVIDER_TO_CONTENT_GAP_PT, HELVETICA_ASCENT_RATIO)
// or the caller-supplied `firstContentFontSize` — never a content
// measurement (line count, wrapped text height, entry count). Because
// every section's heading goes through this exact function with no
// per-section branching, the divider position and the 3mm whitespace
// below it are mathematically guaranteed identical everywhere this is
// called.
//
// The divider runs from the heading's own end X plus the 1.5mm gap (not
// LEFT_MARGIN, and not attached directly) to DIVIDER_END_X — the same
// shared right-edge constant the Header's own divider uses (0.1mm
// short of PAGE_WIDTH - RIGHT_MARGIN; see DIVIDER_END_X above) — using
// SECTION_DIVIDER_THICKNESS / COLOR_SECTION_DIVIDER — both
// declared once, above, and used only here. The stroke is drawn at its
// CENTER Y (jsPDF/PDF strokes are centered on the path), so its bottom
// edge — the actual ink boundary the 3mm gap is measured against — is
// `thickness / 2` below that center.
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
// EXPERIENCE_TITLE_SIZE for an entry title) — required so the 1mm gap
// below the divider is measured against that specific line's real
// ascent, making it exactly 1mm for every section rather than "at
// least 1mm" for whichever sections happen to use a smaller font.
//
// ATS PRO DESIGN PASS (Phase 10):
// Section heading color formula applied here:
// - First 3 characters: COLOR_SECTION_HEADING_ACCENT (Maroon)
// - Remaining characters: COLOR_SECTION_HEADING_REST (Near-black)
// This matches the reference ATSProTemplate.tsx SplitHeading component.
// The heading text is measured and split at the 3-character boundary
// using getTextWidth() to preserve exact geometry.
// ====================================================================
function renderSectionHeading(
  doc: jsPDF,
  headingText: string,
  startY: number,
  firstContentFontSize: number
): number {
  // --- Heading text with two-tone color formula ---
  // First 3 chars: accent color (maroon)
  // Remaining chars: rest color (near-black)
  const accentPart = headingText.slice(0, 3);
  const restPart = headingText.slice(3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(HEADING_SIZE);

  let currentX = LEFT_MARGIN;
  let currentY = startY;

  // Draw accent part (first 3 chars) - maroon
  if (accentPart) {
    doc.setTextColor(...COLOR_SECTION_HEADING_ACCENT);
    doc.text(accentPart, currentX, currentY);
    currentX += doc.getTextWidth(accentPart);
  }

  // Draw rest part (remaining chars) - near-black
  if (restPart) {
    doc.setTextColor(...COLOR_SECTION_HEADING_REST);
    doc.text(restPart, currentX, currentY);
    currentX += doc.getTextWidth(restPart);
  }

  // --- Divider stroke, starting exactly SECTION_HEADING_TO_DIVIDER_
  // GAP_PT (1.5mm) after the heading's own final rendered character
  // (currentX, after both parts above, i.e. the heading's real
  // rendered end) — and vertically pinned to the lower/base portion of
  // the heading rather than centered through it. headingInkBottomY ==
  // startY here: every headingText this function is called with is a
  // hardcoded ALL-CAPS literal (see call sites), and Helvetica's
  // capital letters have no descender ink below the baseline — see
  // the note in sectionHeadingToContentOffset(). ---
  const dividerStartX = currentX + SECTION_HEADING_TO_DIVIDER_GAP_PT;
  const dividerCenterY = startY - HEADING_SIZE * SECTION_DIVIDER_BASELINE_OFFSET_RATIO;

  doc.setDrawColor(...COLOR_SECTION_DIVIDER);
  doc.setLineWidth(SECTION_DIVIDER_THICKNESS);
  doc.line(dividerStartX, dividerCenterY, DIVIDER_END_X, dividerCenterY);

  // --- Content baseline, placed so the content's own ink-top sits
  // exactly SECTION_DIVIDER_TO_CONTENT_GAP_PT (3mm) below the
  // divider's bottom edge ---
  return startY + sectionHeadingToContentOffset(firstContentFontSize);
}

// ====================================================================
// ENTRY POINT
// ====================================================================
export function generateAtsProPDF(data: AtsProData): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  let y = TOP_MARGIN;

  y = addHeader(doc, data, y);
  y = addSummary(doc, data, y);
  y = addExperience(doc, data, y);
  y = addEducation(doc, data, y);
  // ATS PRO DESIGN PASS (Phase 10): Section order alignment
  // New order: Summary → Experience → Education → Certifications → Languages → Skills → Projects → Achievements
  y = addCertifications(doc, data, y);
  y = addLanguages(doc, data, y);
  y = addSkills(doc, data, y);
  y = addProjects(doc, data, y);
  y = addAchievements(doc, data, y);

  return doc;
}

// Returns true only when `photo` is a usable embedded image source —
// a base64 data URL (e.g. "data:image/png;base64,..."). Anything else
// (undefined, empty string, a bare remote URL jsPDF can't embed
// without an extra fetch step) is treated as "no photo", matching
// this file's existing convention of rendering nothing for an
// empty/unusable optional field (see e.g. the jobTitle check in
// addHeader(), or addSummary()'s empty-string check).
function isValidPhotoSource(photo?: string): boolean {
  return typeof photo === 'string' && photo.trim().startsWith('data:image');
}

// Extracts the image subtype (e.g. "PNG", "JPEG") from a data URL, in
// the exact string form jsPDF's addImage() expects as its `format`
// argument. Falls back to "JPEG" if the MIME subtype can't be read,
// rather than throwing.
function getImageFormatFromDataUrl(photo: string): string {
  const match = /^data:image\/([a-zA-Z0-9+.-]+);base64,/.exec(photo.trim());
  const subtype = match ? match[1].toUpperCase() : 'JPEG';
  return subtype === 'JPG' ? 'JPEG' : subtype; // jsPDF expects "JPEG", not "JPG"
}

// ====================================================================
// HEADER SECTION (Phase 1)
// Renders: name, job title (optional), contact line (optional).
//
// CASE 1 — PHOTO PRESENT (see isValidPhotoSource()):
//   [ circular photo ]  NAME
//   [ circular photo ]  JOB TITLE
//   FULL-WIDTH CONTACT LINE (independent of the photo)
//   Name/job title are left-aligned, starting PHOTO_TO_TEXT_GAP_PT after
//   the photo's right edge (LEFT_MARGIN + HEADER_PHOTO_SIZE_PT +
//   PHOTO_TO_TEXT_GAP_PT) — directly beside the photo, Kickresume-style,
//   rather than at the header's right boundary.
//   The photo is vertically centered on the name/job-title block using
//   the file's existing HELVETICA_ASCENT_RATIO/HELVETICA_DESCENT_RATIO
//   metrics (declared earlier in this file, reused here rather than
//   duplicated). The contact line always starts at LEFT_MARGIN and
//   uses the full CONTENT_WIDTH, exactly as in the no-photo case.
//
// CASE 2 — NO PHOTO: unchanged from the original left-aligned layout.
//
// The header's own divider (thickness/color/gaps) is untouched in
// either case — only the photo/name/job-title/contact arrangement
// above it changes.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addHeader(doc: jsPDF, data: AtsProData, startY: number): number {
  let y = startY;
  const { personalInfo, phoneNumber, selectedCountryCode } = data;

  const name = (personalInfo?.name || '').trim() || 'Your Name';
  const jobTitle = (personalInfo?.title || personalInfo?.jobTitle || '').trim();
  const hasPhoto = isValidPhotoSource(personalInfo?.photo);

  if (hasPhoto) {
    // --- Name & job title baselines — identical to the no-photo
    // case below; the photo changes X positioning only, never Y. ---
    const nameBaselineY = y;
    const titleBaselineY = jobTitle ? nameBaselineY + NAME_SIZE + NAME_TO_TITLE_GAP : null;

    // --- Real ink-space vertical span of the name/job-title block,
    // using the file's existing Helvetica ascent/descent ratios
    // (HELVETICA_ASCENT_RATIO / HELVETICA_DESCENT_RATIO, declared
    // above) — the same metrics already used elsewhere in this file —
    // so the photo centers against real text height, not a guess. ---
    const blockTopY = nameBaselineY - NAME_SIZE * HELVETICA_ASCENT_RATIO;
    const blockBottomY = titleBaselineY !== null
      ? titleBaselineY + TITLE_SIZE * HELVETICA_DESCENT_RATIO
      : nameBaselineY + NAME_SIZE * HELVETICA_DESCENT_RATIO;
    const blockHeight = blockBottomY - blockTopY;

    // --- Photo geometry: top-left of the header, vertically centered
    // on the name/job-title block computed above.
    //
    // NOTE ON photoCenterY: centering a circle of diameter S within a
    // fixed vertical span [blockTopY, blockBottomY] via
    // `blockTopY + (blockHeight - S) / 2 + S / 2` always simplifies to
    // `blockTopY + blockHeight / 2`, regardless of S — the diameter
    // term cancels out. So the photo's vertical CENTER is already,
    // algebraically, independent of its size; computing it directly
    // (rather than through a size-dependent top+radius formula) makes
    // that independence explicit instead of incidental. ---
    const photoX = LEFT_MARGIN;
    const photoCenterY = blockTopY + blockHeight / 2;

    // --- Drawn circle geometry: uses the full (possibly increased)
    // HEADER_PHOTO_SIZE_PT, centered at the size-invariant
    // photoCenterY above. Growing HEADER_PHOTO_SIZE_PT only ever makes
    // the drawn circle bigger around that same center — it cannot move
    // the center itself. ---
    const photoRadius = HEADER_PHOTO_SIZE_PT / 2;
    const photoCenterX = photoX + photoRadius;
    const photoTopY = photoCenterY - photoRadius;

    // --- Draw the photo, circularly clipped. Aspect ratio is
    // preserved (no distortion) via a "cover" fit: the image is
    // scaled so its shorter side exactly fills the circle's diameter,
    // and centered so the circular clip crops the longer side evenly
    // on both sides — the standard non-distorting way to fit an
    // arbitrary photo into a fixed circular frame. ---
    const photoSource = (personalInfo?.photo as string).trim();
    const imgProps = doc.getImageProperties(photoSource);
    const imgAspect = imgProps.width / imgProps.height;
    const drawWidth = imgAspect >= 1 ? HEADER_PHOTO_SIZE_PT * imgAspect : HEADER_PHOTO_SIZE_PT;
    const drawHeight = imgAspect >= 1 ? HEADER_PHOTO_SIZE_PT : HEADER_PHOTO_SIZE_PT / imgAspect;
    const drawX = photoX - (drawWidth - HEADER_PHOTO_SIZE_PT) / 2;
    const drawY = photoTopY - (drawHeight - HEADER_PHOTO_SIZE_PT) / 2;

    doc.saveGraphicsState();
    // `null` (not omitted) is required here: jsPDF's default path-paint
    // operation is 'S' (stroke) in compat/mm-pt mode, so an omitted
    // style would stroke a visible circle before clip() below ever
    // runs. Passing null explicitly suppresses ALL painting for this
    // path — it exists purely as the clip boundary for clip()/
    // discardPath() immediately after.
    doc.circle(photoCenterX, photoCenterY, photoRadius, null);
    doc.clip();
    doc.discardPath();
    doc.addImage(photoSource, getImageFormatFromDataUrl(photoSource), drawX, drawY, drawWidth, drawHeight);
    doc.restoreGraphicsState();

    // --- Text block X: starts right after the photo's own right edge,
    // with PHOTO_TO_TEXT_GAP_PT of breathing room — so name/job title
    // sit directly beside the photo instead of at the header's opposite
    // (right) boundary. ---
    const textStartX = photoX + HEADER_PHOTO_SIZE_PT + PHOTO_TO_TEXT_GAP_PT;

    // --- Name (left-aligned, immediately beside the photo) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(NAME_SIZE);
    doc.setTextColor(...COLOR_NAME);
    doc.text(name, textStartX, nameBaselineY);

    // --- Job title (optional, left-aligned, same start X as name) ---
    if (jobTitle && titleBaselineY !== null) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TITLE_SIZE);
      doc.setTextColor(...COLOR_TITLE);
      doc.text(jobTitle, textStartX, titleBaselineY);
    }

    // --- Advance Y past whichever is taller: the text block or the
    // photo — so a photo larger than a title-less name row doesn't
    // have its bottom edge overlapped by the contact line below. The
    // non-overhang term here is identical to the no-photo case's Y
    // advance (see the else-branch below), so the two cases only
    // diverge by however far the photo actually sticks out past the
    // text, never by an arbitrary extra amount. ---
    y = jobTitle && titleBaselineY !== null
      ? titleBaselineY + TITLE_SIZE + TITLE_TO_CONTACT_GAP
      : nameBaselineY + NAME_SIZE + NAME_TO_TITLE_GAP;
    // Anchored to HEADER_PHOTO_SIZE_BASE_PT (not the current, possibly
    // larger, HEADER_PHOTO_SIZE_PT) — see that constant's declaration
    // above. This reproduces the exact same overhang value the file
    // computed at the base (pre-increase) size, so any size increase
    // on top of it cannot push the Contact line (or the Image <->
    // Contact gap) down at all.
    const photoBottomY = photoCenterY + HEADER_PHOTO_SIZE_BASE_PT / 2;
    const photoOverhang = Math.max(0, photoBottomY - blockBottomY);
    y += photoOverhang;
  } else {
    // --- CASE 2 — NO PHOTO (unchanged original layout, except the
    // requested Name/Job-Title downward offsets below) ---

    // --- Name ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(NAME_SIZE);
    doc.setTextColor(...COLOR_NAME);
    doc.text(name, LEFT_MARGIN, y + NO_IMAGE_NAME_Y_OFFSET_PT);
    y += NAME_SIZE; // move past the line's own height — unaffected by the no-image offset, so Contact/divider stay exactly where they were
    y += NAME_TO_TITLE_GAP;

    // --- Job title (optional) ---
    if (jobTitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TITLE_SIZE);
      doc.setTextColor(...COLOR_TITLE);
      doc.text(jobTitle, LEFT_MARGIN, y + NO_IMAGE_TITLE_Y_OFFSET_PT);
      y += TITLE_SIZE;
      y += TITLE_TO_CONTACT_GAP;
    }
  }

  // --- Contact line (email | phone | location | linkedin | github | website)
  // Always starts at the normal full LEFT_MARGIN and uses the full
  // CONTENT_WIDTH, independent of the photo — identical in both
  // cases above. ---
  const contactParts = buildContactParts(personalInfo, phoneNumber, selectedCountryCode);
  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(METADATA_SIZE);
    doc.setTextColor(...COLOR_METADATA);

    const contactLine = contactParts.join('   |   ');
    // Wrap in case a very long combination of contact details doesn't
    // fit on one line at this font size.
    const wrappedLines = doc.splitTextToSize(contactLine, CONTENT_WIDTH);
    // Drawn one wrapped line at a time (instead of handing jsPDF the
    // whole array at once) — the same per-line content-flow pattern
    // addSummary() uses for the Professional Summary paragraph — so
    // the ACTUAL rendered gap between consecutive Contact lines is
    // exactly BODY_LINE_HEIGHT (the same normal body/content-line
    // spacing Professional Summary already uses), for any number of
    // Contact lines. jsPDF's own default multi-line spacing for an
    // array passed to doc.text() — and the previous METADATA_SIZE
    // cursor step — were both unrelated to BODY_LINE_HEIGHT, which was
    // the root cause of the mismatch this replaces.
    let contactLineY = y;
    for (const line of wrappedLines) {
      doc.text(line, LEFT_MARGIN, contactLineY);
      contactLineY += BODY_LINE_HEIGHT;
    }
    y += wrappedLines.length * BODY_LINE_HEIGHT;
  }

  y += DIVIDER_SIDE_GAP_PT;

  // --- Divider rule under the header (UNTOUCHED geometry: thickness,
  // color, gap-above, and Y position are exactly as before this change —
  // only its horizontal end-X, via HEADER_DIVIDER_END_X above, is pulled
  // in by a further 0.1mm; the value RETURNED below is otherwise
  // unaffected) ---
  doc.setDrawColor(...COLOR_RULE);
  doc.setLineWidth(HEADER_RULE_THICKNESS);
  doc.line(LEFT_MARGIN, y, HEADER_DIVIDER_END_X, y);

  // Return the rule's own end, normalized to the SAME "equivalent
  // ending point" every other section already returns before
  // SECTION_GAP is applied — via the exact same topUpToLineHeight()
  // helper used everywhere else in this file (see the SECTION-GAP
  // ARCHITECTURE note above addSummary()). Every text-ending section
  // returns baseline + BODY_LINE_HEIGHT (minus a tiny descender-parity
  // correction) so that SECTION_GAP always measures from one common
  // reference point, regardless of what the section actually ended on.
  // The header's last visual element is a drawn rule, not a text
  // baseline — HEADER_RULE_THICKNESS (already declared above, for the
  // rule itself) is the closest existing analog to "the size of what
  // was just drawn" that topUpToLineHeight expects as lastLineFontSize.
  // No lastLineText is passed (there's no text to check for
  // descenders), which is the function's own documented no-op default
  // for callers that don't have that concept.
  y = topUpToLineHeight(y, HEADER_RULE_THICKNESS);

  return y;
}

// Builds the list of non-empty contact details, in display order.
function buildContactParts(
  personalInfo: AtsProPersonalInfo,
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
function addSummary(doc: jsPDF, data: AtsProData, startY: number): number {
  const summaryText = (data.professionalSummary || '').trim();

  // Nothing to render — skip the section entirely rather than leaving
  // an empty heading or a blank gap.
  if (!summaryText) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (header) and this section.
  // startY here is always the header's own returned Y (addSummary()
  // is always called immediately after addHeader() — see
  // generateAtsProPDF()), so this is specifically the Contact Divider
  // -> Professional Summary transition. It uses the exact same
  // untouched SECTION_GAP every other section transition uses, PLUS
  // the isolated CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT (see its
  // declaration above) that applies ONLY here — no other addXxx()
  // section adds this extra term, so no other section-to-section gap
  // is affected by it.
  y += SECTION_GAP + CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT;

  // Font must be set BEFORE measuring/wrapping, since jsPDF wraps
  // text based on the currently active font and size.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const wrappedLines: string[] = doc.splitTextToSize(summaryText, CONTENT_WIDTH);

  // Make sure there's room for the heading plus at least the first
  // line of the summary before starting this section on the current
  // page. Otherwise the heading would be orphaned alone at the bottom
  // of the page with its text pushed to the next one.
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

  // VISUAL DESCENDER PARITY: see the comment above topUpToLineHeight()
  // for the full analysis. Applied here too so the gap before whatever
  // section comes after Summary is consistent with every other
  // section-ending, regardless of whether the summary's last line
  // happens to contain a descender letter.
  if (wrappedLines.length > 0) {
    const lastLine = wrappedLines[wrappedLines.length - 1];
    const descentReserve = BODY_SIZE * HELVETICA_DESCENT_RATIO;
    y -= hasDescenderChar(lastLine) ? 0 : descentReserve;
  }

  return y;
}

// ====================================================================
// SHARED TITLE-ROW-WITH-RIGHT-ALIGNED-DATE HELPER
// ------------------------------------------------------------------
// Renders a left-aligned title/degree/achievement-name (bold,
// COLOR_HEADING, EXPERIENCE_TITLE_SIZE) with its date right-aligned
// on the SAME baseline row (normal weight, COLOR_DATE,
// EXPERIENCE_SUBTITLE_SIZE). This is the SINGLE shared helper used by
// Experience, Education, and Achievements so all three date placements
// stay identical (same fonts, same gap, same right boundary).
//
// POSITIONING PATTERN (ported in structure from the Modern PDF
// reference's renderTitleRowWithDate() — NOT its raw coordinates or
// color choices; every value used here is ATSPro's own existing
// constant or an existing ATSPro right-boundary expression):
//   - The date's own width is measured with doc.getTextWidth() at
//     EXPERIENCE_SUBTITLE_SIZE — never assumed or hardcoded.
//   - The title's wrap width is CONTENT_WIDTH minus the date's
//     measured width minus TITLE_TO_DATE_GAP_PT — so a long title can
//     never collide with the date; it wraps onto additional lines the
//     normal way, with the date only ever drawn on the row of that
//     title's FIRST line. The subsequent wrapped lines still start at
//     LEFT_MARGIN (they are simply naturally narrower).
//   - The date's own right edge is placed at PAGE_WIDTH - RIGHT_MARGIN
//     (the content area's existing right boundary; equals
//     LEFT_MARGIN + CONTENT_WIDTH) — never past it, since it's
//     computed from the existing constants rather than a fixed X.
//
// COLOR: this helper uses ATSPro's OWN color constants (COLOR_HEADING
// for the title, COLOR_DATE for the date) — NOT any color from the
// Modern reference file. This preserves ATSPro's existing maroon date
// system exactly as it was before this change; only the DATE'S
// POSITION (own line → right-aligned same row) changed.
//
// Font sizes and weights match ATSPro's existing title/date styling
// (bold EXPERIENCE_TITLE_SIZE for the title, normal
// EXPERIENCE_SUBTITLE_SIZE for the date) — unchanged.
//
// The date NEVER wraps: its measured width is used as-is. If the date
// is itself wider than CONTENT_WIDTH minus TITLE_TO_DATE_GAP_PT
// (pathological — e.g. a user typed a whole sentence as the date), the
// title's wrap width clamps to 0 via Math.max(0, ...) and the date
// still draws right-aligned from the same boundary; the title simply
// wraps to as many lines as its own first character needs. This is
// the same trade-off the Modern reference makes.
//
// Returns:
//   - lines: the wrapped title lines (empty array if no title)
//   - height: the total height those lines consume (line count ×
//     EXPERIENCE_TITLE_SIZE), or EXPERIENCE_SUBTITLE_SIZE if only a
//     date is present (so the caller's cursor advances correctly even
//     in the date-only case), or 0 if neither is present
//   - hasContent: true iff at least one of title/date was non-empty
//
// The caller is expected to advance its own y cursor by `height` and
// to apply its own trailing-space normalization / page-break logic —
// this helper ONLY draws and measures, it does not advance any caller
// cursor or reserve any trailing space.
// ====================================================================
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
    // The right boundary is derived from the file's existing
    // PAGE_WIDTH / RIGHT_MARGIN constants — the SAME boundary
    // CONTENT_WIDTH itself is built from (LEFT_MARGIN + CONTENT_WIDTH
    // equals PAGE_WIDTH - RIGHT_MARGIN) — so the date can never draw
    // past the content area, on any page size this file ever uses.
    const rightBoundary = PAGE_WIDTH - RIGHT_MARGIN;
    const dateX = rightBoundary - dateWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_DATE);
    doc.text(date, dateX, y); // same baseline row as the title's first line
  }

  const hasContent = titleLines.length > 0 || Boolean(date);
  const height = titleLines.length > 0
    ? titleLines.length * EXPERIENCE_TITLE_SIZE
    : (date ? EXPERIENCE_SUBTITLE_SIZE : 0);

  return { lines: titleLines, height, hasContent };
}

// ====================================================================
// EXPERIENCE SECTION (Phase 3, refined in Phase 5.1, Phase 11, Phase 12)
// Renders: "EXPERIENCE" heading, then one block per entry:
//   Job Title                                Start Date – End Date
//   Company
//   Description (wrapped, manual line breaks preserved)
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is
// skipped and startY is returned unchanged.
//
// PHASE 12 CHANGE: The date is now rendered RIGHT-ALIGNED on the SAME
// row as the job title (previously its own line under the company),
// matching the Modern PDF reference's row relationship. Company keeps
// its own line directly below, unchanged in every other respect. The
// date's own color/weight (COLOR_DATE, normal weight,
// EXPERIENCE_SUBTITLE_SIZE) is unchanged.
//
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addExperience(doc: jsPDF, data: AtsProData, startY: number): number {
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
function hasUsableExperienceContent(exp: AtsProExperience | null | undefined): boolean {
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
// PHASE 12: Date is now right-aligned on the same row as the job title.
function addExperienceEntry(doc: jsPDF, exp: AtsProExperience, startY: number): number {
  let y = startY;

  const title = (exp.title || '').trim();
  const company = (exp.company || '').trim();
  const startDate = (exp.startDate || '').trim();
  const endDate = (exp.endDate || '').trim();
  const description = (exp.description || '').trim();

  // PHASE 12: Date now renders on the SAME row as the job title, right-
  // aligned — via the shared renderTitleRowWithDate() helper (see its
  // own doc comment above), also used by Education and Achievements.
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
  // + company line) plus at least the first description line needs,
  // so the whole block can be pushed to a new page together rather
  // than splitting a job title from its own company/first line. The
  // title/date row's height only depends on how many lines the title
  // itself wraps into at the date-subtracted wrap width (computed here
  // the same way renderTitleRowWithDate() computes it internally), so
  // this estimate stays accurate without having to render twice. ---
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
  // the company line, or rarer, the title/date row alone) needs the
  // same top-up, or the gap before the NEXT entry (not just the next
  // section) would be inconsistent too. Entries that do have a
  // description already end on a BODY_LINE_HEIGHT line, so no top-up
  // is needed for them.
  if (descriptionLines.length === 0 && hasHeaderLine) {
    // Determine the last line font size AND its actual text.
    // PHASE 12: with the date now on the title row, the row is the
    // last visual line only when there is no company line below it.
    // The descender-parity check must consider BOTH texts that share
    // that baseline (title on the left, date on the right), since
    // whichever has a descender governs the row's real ink-bottom.
    let lastLineFontSize: number;
    let lastLineText: string;
    if (company) {
      lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
      lastLineText = company;
    } else if (title) {
      lastLineFontSize = EXPERIENCE_TITLE_SIZE;
      lastLineText = `${titleRow.lines[titleRow.lines.length - 1] ?? ''}${dateRange}`;
    } else {
      lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
      lastLineText = dateRange;
    }
    y = topUpToLineHeight(y, lastLineFontSize, lastLineText);
  } else if (descriptionLines.length > 0) {
    // Description already ends at body-line-equivalent baseline advance —
    // still apply the descender-parity correction (see the matching
    // comment inside addAchievementEntry() for the full analysis).
    const lastDescriptionLine = descriptionLines[descriptionLines.length - 1];
    const descentReserve = BODY_SIZE * HELVETICA_DESCENT_RATIO;
    const noDescenderPenalty = hasDescenderChar(lastDescriptionLine) ? 0 : descentReserve;
    y -= noDescenderPenalty;
  }

  return y;
}

// ====================================================================
// EDUCATION SECTION (Phase 4, refined in Phase 5.1, Phase 11, Phase 12)
// Renders: "EDUCATION" heading, then one block per entry:
//   Degree / Program                                 Year
//   Institution
//   Grade (optional, no label — rendered as typed)
//
// PHASE 12 CHANGE: The date/year is now rendered RIGHT-ALIGNED on the
// SAME row as the degree/program name (previously its own line under
// the institution), matching the Modern PDF reference's row
// relationship. Institution keeps its own line directly below the
// degree/year row, unchanged in every other respect.
//
// SHARED CONSTANT NOTE: this section deliberately reuses
// EXPERIENCE_TITLE_SIZE, EXPERIENCE_SUBTITLE_SIZE,
// EXPERIENCE_TITLE_TO_SUBTITLE_GAP, EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
// and EXPERIENCE_ENTRY_GAP rather than defining Education-specific
// equivalents — an education entry has the exact same visual
// relationship (title -> subtitle -> supporting detail -> gap to next
// entry) as an experience entry, so reusing keeps the whole CV's
// vertical rhythm consistent.
//
// ENTRY-GAP CONSISTENCY: every entry's trailing space is topped up to
// match the leading baked into body-text sections (Summary,
// Experience's description) — not only the section's last entry — so
// EXPERIENCE_ENTRY_GAP measures the same visual distance between EVERY
// pair of entries regardless of grade presence or degree length, and
// the gap before whatever section comes next (via SECTION_GAP) stays
// consistent with every other section transition too.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addEducation(doc: jsPDF, data: AtsProData, startY: number): number {
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
function hasUsableEducationContent(edu: AtsProEducation | null | undefined): boolean {
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
// PHASE 12: Year/Date is now right-aligned on the same row as the degree.
function addEducationEntry(
  doc: jsPDF,
  edu: AtsProEducation,
  startY: number
): number {
  let y = startY;

  const degree = (edu.degree || '').trim();
  const institution = (edu.institution || '').trim();
  const year = (edu.year || '').trim();
  const grade = (edu.grade || '').trim();

  // PHASE 12: Year now renders on the SAME row as the degree name,
  // right-aligned — via the shared renderTitleRowWithDate() helper.
  // Institution keeps its own line directly below the degree/year row.

  // Wrap each field independently (institution and grade can each
  // be long) using the PDF library's existing wrapping capability.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, CONTENT_WIDTH) : [];
  const gradeLines: string[] = grade ? doc.splitTextToSize(grade, CONTENT_WIDTH) : [];

  // Multi-line metadata fields use their own font size as the per-line
  // height, with no extra leading — the same convention already used
  // for the header's wrapped contact line.
  const institutionHeight = institutionLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this entry's degree/year row +
  // institution block needs, so the whole block moves to a new page
  // together. The degree/year row's height only depends on how many
  // lines the degree itself wraps into at the year-subtracted wrap
  // width (computed here the same way renderTitleRowWithDate()
  // computes it internally), so this estimate stays accurate without
  // having to render twice. ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const yearWidthForEstimate = year ? doc.getTextWidth(year) : 0;
  const degreeWrapWidthForEstimate = year
    ? Math.max(0, CONTENT_WIDTH - yearWidthForEstimate - TITLE_TO_DATE_GAP_PT)
    : CONTENT_WIDTH;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const estimatedDegreeLineCount = degree ? doc.splitTextToSize(degree, degreeWrapWidthForEstimate).length : 0;
  const degreeRowHeightEstimate = estimatedDegreeLineCount > 0
    ? estimatedDegreeLineCount * EXPERIENCE_TITLE_SIZE
    : (year ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const hasDegreeRow = Boolean(degree || year);

  const degreeToInstitutionGap = hasDegreeRow && institutionLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const headerHeight = degreeRowHeightEstimate + degreeToInstitutionGap + institutionHeight;
  // Institution -> Grade gap uses EXPERIENCE_TITLE_TO_SUBTITLE_GAP (not
  // EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP) so it visually matches the
  // Degree/Year row -> Institution gap above it — both are "one metadata
  // line to the next metadata line" relationships, unlike a metadata-
  // line-to-paragraph-description relationship, which is what
  // EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP is for elsewhere in this
  // file (Experience/Achievements/Projects, where the following line
  // really is a body paragraph, not another short label).
  const institutionToGradeGap = institutionLines.length > 0 && gradeLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  // Degree/Year row -> Grade, only when there is no Institution line at
  // all (Institution's own transition into Grade, when present, is
  // already folded into institutionToGradeGap above).
  const degreeRowToGradeGap = hasDegreeRow && institutionLines.length === 0 && gradeLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const firstGradeLineHeight = gradeLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : 0;
  const minimumEntrySpaceNeeded = headerHeight + institutionToGradeGap + firstGradeLineHeight + degreeRowToGradeGap;
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Degree / Program (left) + Year (right, same row) ---
  const degreeRow = renderTitleRowWithDate(doc, degree, year, y);
  if (degreeRow.hasContent) {
    y += degreeRow.height;
    if (institutionLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Institution (its own line, below the degree/year row) ---
  if (institutionLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(institutionLines, LEFT_MARGIN, y);
    y += institutionHeight;
    if (gradeLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // Degree/Year row -> Grade, only when there is no Institution line at
  // all.
  if (hasDegreeRow && institutionLines.length === 0 && gradeLines.length > 0) {
    y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
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
  // Every field above advances y by its own font size only, with no extra
  // leading — intentional, matching the header's wrapped contact line.
  // Normalizing EVERY entry's end to a body-line-equivalent trailing space
  // makes EXPERIENCE_ENTRY_GAP mean the same visual distance between every
  // pair of Education entries, regardless of grade presence, degree length,
  // or wrapping.
  //
  // PHASE 12: with the year now on the degree row, the descending
  // order of "last rendered line" candidates is: grade > institution >
  // degree/year row.
  let lastLineFontSize: number;
  let lastLineText: string;
  if (gradeLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
    lastLineText = gradeLines[gradeLines.length - 1];
  } else if (institutionLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
    lastLineText = institutionLines[institutionLines.length - 1];
  } else if (degree) {
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
    lastLineText = `${degreeRow.lines[degreeRow.lines.length - 1] ?? ''}${year}`;
  } else {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
    lastLineText = year;
  }
  y = topUpToLineHeight(y, lastLineFontSize, lastLineText);

  return y;
}

// ====================================================================
// SKILLS SECTION (Phase 5, restored to TWO-COLUMN layout)
// Renders: "SKILLS" heading, then skills in a two-column vertical bullet list:
//   • Skill A                 • Skill B
//   • Skill C                 • Skill D
//   • Skill E                 • Skill F
//   • Skill G
//
// The right column has a fixed, consistent start position (not centered).
// Each skill gets exactly one bullet. Skills are paired row-by-row.
// If there are no usable skills at all, the whole section (including
// the heading) is skipped and startY is returned unchanged.
//
// SHARED CONSTANT NOTE: this section deliberately reuses SECTION_GAP,
// HEADING_SIZE and COLOR_HEADING (same as every other heading), the
// shared renderSectionHeading() heading->content offset, and
// BODY_SIZE/BODY_LINE_HEIGHT/COLOR_BODY
// (same as the Summary paragraph) rather than inventing Skills-only
// typography or spacing — each skill line is just body text, the same
// relationship Summary already has to the page.
//
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addSkills(doc: jsPDF, data: AtsProData, startY: number): number {
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

  // Make sure there's room for the heading plus at least the first
  // skill line before starting this section on the current page.
  // Otherwise the heading would be orphaned alone at the bottom of
  // the page with its content pushed to the next one.
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + BODY_LINE_HEIGHT;
  y = checkPageBreak(doc, y, minimumSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'SKILLS', y, BODY_SIZE);

  // --- Skills in two-column vertical bullet list ---
  // Each skill gets its own bullet. Skills are paired row-by-row
  // (left column takes first half, right column takes second half).
  // The right column has a fixed, consistent start position.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(...COLOR_BODY);

  // Split skills into two columns: left half, right half
  const halfCount = Math.ceil(skillsList.length / 2);
  const leftSkills = skillsList.slice(0, halfCount);
  const rightSkills = skillsList.slice(halfCount);

  // Determine how many rows we need (max of both columns)
  const rowCount = Math.max(leftSkills.length, rightSkills.length);

  // Pre-calculate the bullet position for left column
  const leftBulletX = LEFT_MARGIN;
  const leftTextX = LEFT_MARGIN + 8; // Indent after bullet

  // Right column: flush against the content area's right edge instead
  // of a fixed halfway split. Its start X is derived from the widest
  // actual skill word in that column (measured with doc.getTextWidth,
  // in the font/size already set above), so the longest right-column
  // line always ends exactly at the page's right margin — genuinely
  // full right, and never past the page — no matter which words end
  // up there.
  const skillsContentRightEdge = LEFT_MARGIN + CONTENT_WIDTH; // == PAGE_WIDTH - RIGHT_MARGIN
  const rightColumnMaxTextWidth = rightSkills.reduce(
    (maxWidth, skill) => Math.max(maxWidth, doc.getTextWidth(skill)),
    0
  );
  const rightBulletX = skillsContentRightEdge - 8 - rightColumnMaxTextWidth; // 8 = same bullet-to-text indent as leftTextX above
  const rightTextX = rightBulletX + 8; // Indent after bullet

  for (let i = 0; i < rowCount; i++) {
    y = checkPageBreak(doc, y, BODY_LINE_HEIGHT);

    // --- Left column skill ---
    if (i < leftSkills.length) {
      // Draw bullet dot (maroon)
      doc.setTextColor(...COLOR_BULLET);
      doc.text('•', leftBulletX, y);
      // Draw skill text
      doc.setTextColor(...COLOR_BODY);
      doc.text(leftSkills[i], leftTextX, y);
    }

    // --- Right column skill (at fixed position) ---
    if (i < rightSkills.length) {
      // Draw bullet dot (maroon)
      doc.setTextColor(...COLOR_BULLET);
      doc.text('•', rightBulletX, y);
      // Draw skill text
      doc.setTextColor(...COLOR_BODY);
      doc.text(rightSkills[i], rightTextX, y);
    }

    y += BODY_LINE_HEIGHT;
  }

  // VISUAL DESCENDER PARITY: see the comment above topUpToLineHeight().
  // Check the last rendered skill across both columns.
  let lastSkillText: string | undefined;
  if (rightSkills.length > 0 && rowCount === rightSkills.length) {
    lastSkillText = rightSkills[rightSkills.length - 1];
  } else if (leftSkills.length > 0) {
    lastSkillText = leftSkills[leftSkills.length - 1];
  }
  if (lastSkillText) {
    const descentReserve = BODY_SIZE * HELVETICA_DESCENT_RATIO;
    y -= hasDescenderChar(lastSkillText) ? 0 : descentReserve;
  }

  return y;
}

// Splits the raw `skills` string into individual skill strings, using
// the EXACT same rule as the CV editor's own getSkillArray()
// (SkillsSection.tsx): comma-separated if it contains a comma,
// otherwise one skill per line with an optional leading bullet
// marker stripped. This is intentionally duplicated logic rather than
// a shared import, since atsProPdf.ts is a self-contained renderer —
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
// Renders: "LANGUAGES" heading, then one line per entry:
//   Language Name — Proficiency label (optional, expanded from the
//   form's short code — see getProficiencyDisplayLabel())
//
// SHARED CONSTANT NOTE: reuses EXPERIENCE_TITLE_SIZE/COLOR_HEADING for
// the language name and EXPERIENCE_SUBTITLE_SIZE/COLOR_METADATA for the
// proficiency segment — the exact same title/subtitle visual
// relationship Experience and Education entries already use.
//
// ENTRY-TO-ENTRY SPACING (ROOT-CAUSE FIX): each language entry is a
// single compact line, not a multi-field block like an Experience or
// Education entry — so, unlike those sections, no separate
// EXPERIENCE_ENTRY_GAP is added between entries here. EXPERIENCE_ENTRY_GAP
// exists to separate whole multi-line career/education blocks from each
// other; stacking it on top of a one-line item made every language
// entry sit roughly two body-lines below the previous one instead of on
// the very next line. topUpToLineHeight() (the same helper Education
// entries use) already normalizes each entry's trailing space up to one
// full BODY_LINE_HEIGHT-equivalent line — exactly the spacing every
// other simple line-based list in this file already relies on (e.g.
// Skills' bullet rows, wrapped description lines), with no additional
// gap layered on top. That normalization is what now makes every
// language entry — 2, 3, 4, or more — follow the previous one on the
// immediate next line, and it also still measures the same equal
// distance to whatever section comes next (via SECTION_GAP) regardless
// of which entry happens to be last, exactly as before.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addLanguages(doc: jsPDF, data: AtsProData, startY: number): number {
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
  // No inter-entry gap is added here (see ENTRY-TO-ENTRY SPACING note
  // above) — addLanguageEntry()'s own topUpToLineHeight() call already
  // leaves each entry on a normalized one-line trailing space, which is
  // all the separation a single-line entry needs before the next one.
  languages.forEach((lang) => {
    y = addLanguageEntry(doc, lang, y);
  });

  return y;
}

// An entry counts as "usable" if it has ANY content worth printing —
// same rule as hasUsableExperienceContent()/hasUsableEducationContent().
function hasUsableLanguageContent(lang: AtsProLanguage | null | undefined): boolean {
  if (!lang) {
    return false;
  }
  return Boolean((lang.language || '').trim() || (lang.proficiency || '').trim());
}

// Expands the form's stored short proficiency code to the same
// human-readable label LanguagesSection.tsx's own getProficiencyLabel()
// shows in its preview line. Intentionally duplicated (not imported)
// for the same reason parseSkillsList() duplicates getSkillArray()'s
// rule instead of sharing it: atsProPdf.ts is a self-contained
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

// Renders a single language entry and returns the new Y position,
// normalized (like every Education entry) so every entry — not only
// the section's last one — ends on an equivalent trailing space. See
// the ENTRY-TO-ENTRY SPACING note above addLanguages().
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
function addLanguageEntry(doc: jsPDF, lang: AtsProLanguage, startY: number): number {
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
  // to a new page as a single unit. ---
  y = checkPageBreak(doc, y, combinedHeight);

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

  // ENTRY-TO-ENTRY SPACING: normalize every entry's end (not only the
  // last) to a body-line-equivalent trailing space — see the
  // ENTRY-TO-ENTRY SPACING note above addLanguages() and the matching
  // comment inside addEducationEntry() for the full analysis.
  const lastLineText = combinedLines.length > 0 ? combinedLines[combinedLines.length - 1] : combinedText;
  y = topUpToLineHeight(y, EXPERIENCE_TITLE_SIZE, lastLineText);

  return y;
}

// ====================================================================
// ACHIEVEMENTS SECTION (Phase 7, Phase 11, Phase 12)
// Renders: "ACHIEVEMENTS" heading, then one block per achievement:
//   Achievement Title                                  Date
//   Description (bulleted, matching Projects bullet style)
//
// PHASE 12 CHANGE: The date is now rendered RIGHT-ALIGNED on the SAME
// row as the achievement title (previously its own line below the
// title), matching the Modern PDF reference's row relationship. The
// bulleted description below is unchanged. The date's own
// color/weight (COLOR_DATE, normal weight, EXPERIENCE_SUBTITLE_SIZE)
// is unchanged.
//
// SHARED CONSTANT NOTE: reuses EXPERIENCE_TITLE_SIZE/COLOR_HEADING for
// the achievement title and EXPERIENCE_SUBTITLE_SIZE for the date
// line — the same title/subtitle visual relationship Experience and
// Education entries already use — and reuses EXPERIENCE_ENTRY_GAP
// for the gap between one achievement and the next.
//
// ENTRY-GAP CONSISTENCY: every entry's trailing space is normalized via
// topUpToLineHeight() so EXPERIENCE_ENTRY_GAP measures the same visual
// distance between every pair of achievement entries regardless of date
// presence or description length.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addAchievements(doc: jsPDF, data: AtsProData, startY: number): number {
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
// PHASE 12: Date is now right-aligned on the same row as the title.
function addAchievementEntry(
  doc: jsPDF,
  ach: any,
  startY: number
): number {
  let y = startY;

  const title = (ach.title || '').trim();
  const date = (ach.date || '').trim();
  const description = (ach.description || '').trim();

  // PHASE 12: Date now renders on the SAME row as the achievement
  // title, right-aligned — via the shared renderTitleRowWithDate()
  // helper (see its own doc comment above), also used by Experience
  // and Education.

  // PHASE 11: Description uses the same bullet rendering as Projects.
  // Split on newlines, wrap each line, then render with bullet dots.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const descriptionLines: string[] = description
    ? description
        .split('\n')
        .flatMap((rawLine: string) => {
          const trimmedLine = rawLine.trim();
          return trimmedLine ? doc.splitTextToSize(trimmedLine, CONTENT_WIDTH) : [];
        })
    : [];

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a title from its
  // date/description. The title/date row's height only depends on how
  // many lines the title itself wraps into at the date-subtracted wrap
  // width (computed here the same way renderTitleRowWithDate()
  // computes it internally), so this estimate stays accurate without
  // having to render twice. ---
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

  // --- Description (optional, bulleted matching Projects style) ---
  if (descriptionLines.length > 0) {
    // Only add the gap if there was header content before it
    if (hasHeaderContent) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);
    doc.setTextColor(...COLOR_BODY);

    // Calculate bullet position - same as Projects section
    const bulletX = LEFT_MARGIN;
    const textX = LEFT_MARGIN + 8; // Indent after bullet

    for (const line of descriptionLines) {
      y = checkPageBreak(doc, y, BODY_LINE_HEIGHT);
      // Draw bullet dot (maroon)
      doc.setTextColor(...COLOR_BULLET);
      doc.text('•', bulletX, y);
      // Draw description text
      doc.setTextColor(...COLOR_BODY);
      doc.text(line, textX, y);
      y += BODY_LINE_HEIGHT;
    }
  }

  // ENTRY-GAP CONSISTENCY: normalize every entry's end (not only the
  // last) to a body-line-equivalent trailing space.
  //
  // When there IS a description: the last line uses BODY_LINE_HEIGHT (14.7)
  // which already includes the 1.4 multiplier — still apply the same
  // descender-parity correction the metadata path below gets — using
  // the actual last rendered description line and BODY_SIZE (the font
  // size that line was drawn at) — see VISUAL DESCENDER PARITY comment
  // above topUpToLineHeight().
  //
  // When there is NO description: the last line is the title/date row,
  // which uses its own font size (11, or 10 if only a date was present
  // with no title). topUpToLineHeight() adds the difference between
  // BODY_LINE_HEIGHT and that font size, resulting in the same body-
  // line-equivalent.
  if (descriptionLines.length > 0) {
    const lastDescriptionLine = descriptionLines[descriptionLines.length - 1];
    const descentReserve = BODY_SIZE * HELVETICA_DESCENT_RATIO;
    const noDescenderPenalty = hasDescenderChar(lastDescriptionLine) ? 0 : descentReserve;
    return y - noDescenderPenalty;
  } else if (title) {
    // Title row is the last visual line — check both texts that share
    // that baseline (title on the left, date on the right) for
    // descender-parity, since whichever has a descender governs the
    // row's real ink-bottom.
    const lastTitleLine = titleRow.lines[titleRow.lines.length - 1] ?? '';
    y = topUpToLineHeight(y, EXPERIENCE_TITLE_SIZE, `${lastTitleLine}${date}`);
  } else if (date) {
    // Date-only row — the date alone is the last visual text.
    y = topUpToLineHeight(y, EXPERIENCE_SUBTITLE_SIZE, date);
  } else {
    // Unreachable in practice (hasUsableAchievementContent() would have
    // filtered an entry with neither title nor date nor description
    // out), but kept as a safe default matching the title-less case.
    y = topUpToLineHeight(y, EXPERIENCE_TITLE_SIZE);
  }

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
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addCertifications(doc: jsPDF, data: AtsProData, startY: number): number {
  const certifications = (data.certifications || []).filter(hasUsableCertificationContent);

  if (certifications.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (Education) and this section.
  // This is the SAME SECTION_GAP used by all other section transitions.
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

  // --- Date (optional) - ATS PRO DESIGN PASS (Phase 10): Date color = Maroon ---
  if (dateLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_DATE);
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
  let lastLineText: string;
  if (credentialLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
    lastLineText = credentialLines[credentialLines.length - 1];
  } else if (dateLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
    lastLineText = dateLines[dateLines.length - 1];
  } else {
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
    lastLineText = nameLines[nameLines.length - 1];
  }
  y = topUpToLineHeight(y, lastLineFontSize, lastLineText);

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
function addProjects(doc: jsPDF, data: AtsProData, startY: number): number {
  const projects = (data.projects || []).filter(hasUsableProjectContent);

  if (projects.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section (Skills) and this section.
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
// PHASE 11: Bullet dots use COLOR_BULLET (maroon).
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
  // This section renders its own maroon bullet dot in front of every
  // line (see the bullet-drawing loop below). If the user's own raw
  // description text already starts with a bullet marker of its own
  // (e.g. they typed "• Built an API" or "- Built an API"), that
  // literal character would otherwise render as a second, black bullet
  // immediately to the left of the maroon one this section draws — the
  // same leading-marker case parseSkillsList() already strips for
  // Skills. Stripping it here, before wrapping, removes that duplicate
  // at its actual source instead of layering a visual fix on top.
  const descriptionLines: string[] = description
    ? description
        .split('\n')
        .flatMap((rawLine: string) => {
          const trimmedLine = rawLine.trim().replace(/^[•\-*]\s*/, '');
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
  // PHASE 11: Bullet color uses COLOR_BULLET (maroon)
  if (descriptionLines.length > 0) {
    // Only add the gap if there was header content before it
    if (hasHeaderContent) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);
    doc.setTextColor(...COLOR_BODY);

    // Calculate bullet position
    const bulletX = LEFT_MARGIN;
    const textX = LEFT_MARGIN + 8; // Indent after bullet

    for (const line of descriptionLines) {
      y = checkPageBreak(doc, y, BODY_LINE_HEIGHT);
      // Draw bullet dot (maroon)
      doc.setTextColor(...COLOR_BULLET);
      doc.text('•', bulletX, y);
      // Draw description text
      doc.setTextColor(...COLOR_BODY);
      doc.text(line, textX, y);
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
    doc.setTextColor(...COLOR_METADATA);
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
  let lastLineText: string;
  if (githubLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
    lastLineText = githubLines[githubLines.length - 1];
  } else if (descriptionLines.length > 0) {
    // Description already ends at body-line-equivalent baseline advance —
    // still apply the descender-parity correction (see the matching
    // comment inside addAchievementEntry() for the full analysis).
    const lastDescriptionLine = descriptionLines[descriptionLines.length - 1];
    const descentReserve = BODY_SIZE * HELVETICA_DESCENT_RATIO;
    const noDescenderPenalty = hasDescenderChar(lastDescriptionLine) ? 0 : descentReserve;
    return y - noDescenderPenalty;
  } else if (techLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
    lastLineText = techLines[techLines.length - 1];
  } else {
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
    lastLineText = nameLines[nameLines.length - 1];
  }
  y = topUpToLineHeight(y, lastLineFontSize, lastLineText);

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