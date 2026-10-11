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
// AUTO-FIT-TO-ONE-PAGE: the current scale applied to every bulk
// constant below marked BASE_*/mutable (font sizes and spacing/gap
// values only — never margins, colors, stroke widths, or the header's
// own name/title/contact typography and photo geometry). Always reset
// to 1 by generateAtsProPDF() before returning, so SCALE_FACTOR never
// leaks between calls. See recomputeScaledConstants() near
// checkPageBreak() below for where this is applied.
let SCALE_FACTOR = 1;

const NAME_SIZE = 22;
const TITLE_SIZE = 13;
const METADATA_SIZE = 9.5; // contact line (email / phone / location / links)

// Reserved for later phases (section headings, body paragraphs).
// Declared now so every size constant lives in one place from the start.
// AUTO-FIT: these two drive a resume's overall bulk, so each is a
// BASE_*/mutable pair — recomputeScaledConstants() (near the bottom of
// this file, next to checkPageBreak()) scales the mutable copy by
// SCALE_FACTOR; every render call site reads the mutable name exactly
// as before.
const BASE_HEADING_SIZE = 12;
let HEADING_SIZE = BASE_HEADING_SIZE;
const BASE_BODY_SIZE = 10.5;
let BODY_SIZE = BASE_BODY_SIZE;

// Multiplier applied to BODY_SIZE to get the vertical distance between
// wrapped lines of paragraph text (a.k.a. "leading"). 1.4 is a normal,
// readable line-height for body copy — tight enough to stay compact,
// loose enough not to feel cramped. Used by every body-text section
// (Summary, Experience, and later ones), so it lives here once rather
// than being redefined per section. Fixed: this is a RATIO, not a bulk
// value, so auto-fit never scales it directly — only BODY_SIZE scales,
// and BODY_LINE_HEIGHT below is recomputed from the (possibly scaled)
// BODY_SIZE using this same fixed multiplier every time.
const BODY_LINE_HEIGHT_MULTIPLIER = 1.4;

// The actual computed line height used whenever BODY_SIZE text wraps
// across multiple lines. Computed once here instead of recomputing
// `BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER` inline in every section.
// AUTO-FIT: derived from BODY_SIZE, so this is `let` and is
// RECOMPUTED (not independently scaled) inside recomputeScaledConstants()
// immediately after BODY_SIZE is set.
let BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;

// The real, rendered vertical WHITESPACE between two consecutive
// normal wrapped body/content text lines (e.g. one line of the
// Professional Summary paragraph to the next) — i.e. the leading on
// top of the text itself, not the full line-to-line baseline
// distance. Every normal content paragraph in this file advances by
// BODY_LINE_HEIGHT per line, and each of those lines is BODY_SIZE
// tall, so the empty space between them is exactly the difference.
// Declared once, from the existing BODY_LINE_HEIGHT/BODY_SIZE source
// of truth, so any metadata-line transition that needs to match a
// normal content/body line gap reuses this instead of a new or
// hand-picked number.
// AUTO-FIT: derived from BODY_LINE_HEIGHT/BODY_SIZE — `let`,
// recomputed (last, after both of those) inside
// recomputeScaledConstants().
let NORMAL_CONTENT_LINE_GAP = BODY_LINE_HEIGHT - BODY_SIZE;

// --- Experience entry typography (Phase 3) ---
// Job title: slightly smaller than a section heading, but still bold,
// so entries are clearly distinguishable from the section heading
// above them.
// AUTO-FIT: bulk constant — BASE_*/mutable pair, scaled by
// recomputeScaledConstants().
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
// (see SECTION-GAP ARCHITECTURE below). This is the file's original,
// UNCHANGED section-to-section gap — every normal section transition
// (Summary→Experience, Experience→Education, Education→Skills,
// Skills→Languages, Languages→Achievements, Achievements→Projects,
// Projects→Certificates, and every other addXxx() call site) is
// LOCKED to this exact value. Do not add an increase term here: the
// only requested +1mm applies to a single, isolated transition
// (Contact Divider → Professional Summary) and is represented
// entirely by CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT below, added
// only at that one call site (see addSummary()) — never folded into
// this shared constant, which would incorrectly move every other
// section gap too.
const SECTION_GAP_BASE_PT = 18; // pt — the original section-to-section gap
// Normal section-to-section gap increase: exactly +1mm, applied ONCE here
// so every normal transition (Summary->Experience, Experience->Education,
// ... and every later section) grows by the same amount through this
// shared constant.
const SECTION_GAP_INCREASE_PT = 1 * MM_TO_PT; // 1mm, ≈ 2.8346pt
// AUTO-FIT: SECTION_GAP itself (this file's actual section-to-section
// bulk value) is the BASE_*/mutable pair — SECTION_GAP_BASE_PT/
// SECTION_GAP_INCREASE_PT above stay fixed design constants (they only
// exist to document how this file's original, unscaled gap value was
// derived); BASE_SECTION_GAP is their fixed sum, and SECTION_GAP is
// the mutable copy recomputeScaledConstants() scales.
const BASE_SECTION_GAP = SECTION_GAP_BASE_PT + SECTION_GAP_INCREASE_PT; // pt — 18pt + 1mm, shared by every normal section transition
let SECTION_GAP = BASE_SECTION_GAP;
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
// UPDATE: this transition's TOTAL gap must be its previous value
// (SECTION_GAP_BASE_PT + 1mm) + exactly 2.5mm. addSummary() adds
// SECTION_GAP (now BASE + 1mm) plus this constant, so this constant is
// exactly 2.5mm — the previous 1mm extra is already represented by the
// +1mm inside SECTION_GAP, so it is NOT stacked on top (no +3.5mm).
// AUTO-FIT: bulk gap — BASE_*/mutable pair, scaled by
// recomputeScaledConstants().
const BASE_CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT = 2.5 * MM_TO_PT; // 2.5mm, ≈ 7.0866pt — extra whitespace, Contact Divider -> Professional Summary only
let CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT = BASE_CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT;

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
// AUTO-FIT: bulk gap (divider -> first content line, universal to
// every section) — BASE_*/mutable pair, scaled by
// recomputeScaledConstants().
const BASE_SECTION_DIVIDER_TO_CONTENT_GAP_PT = 3 * MM_TO_PT; // 3mm, ≈ 8.5039pt
let SECTION_DIVIDER_TO_CONTENT_GAP_PT = BASE_SECTION_DIVIDER_TO_CONTENT_GAP_PT;

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

// --- Photo-present header: whole-block downward shift ---
// With a profile photo the ENTIRE header block (photo, name, job title,
// contact line) starts this much lower. Fed into the real cursor math in
// addHeader()'s photo branch (every photo/title/contact position derives
// from nameBaselineY), so the divider and every section below move by
// this SAME amount and no gap changes. Without a photo nothing changes.
// Mirrors PHOTO_CONTENT_DOWN_SHIFT in ATSProTemplate.tsx 1:1.
const PHOTO_CONTENT_DOWN_SHIFT_MM = 3;
const PHOTO_CONTENT_DOWN_SHIFT_PT = PHOTO_CONTENT_DOWN_SHIFT_MM * MM_TO_PT; // 3mm, ≈ 8.5039pt

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

// Requested: the Header Contact block (email | phone | location |
// linkedin | github | website) needs to move down by a small, fixed
// amount (1mm) — Name, Job Title, and the Profile Image are completely
// unaffected. Expressed in mm and converted through the file's
// existing MM_TO_PT constant, same convention as every other
// mm-sourced offset above — no raw pt magic number. This constant is
// read in exactly one place (addHeader()'s Contact-line block) and
// only adds to the Y value used to DRAW the contact text (the local
// `contactLineY` cursor) — the plain cursor `y` that goes on to
// position the header divider is deliberately left unaffected, so the
// divider stays exactly where it already was and the Contact-to-
// divider gap simply shrinks by this same 1mm.
const CONTACT_Y_OFFSET_MM = 1;
const CONTACT_Y_OFFSET_PT = CONTACT_Y_OFFSET_MM * MM_TO_PT;

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
// AUTO-FIT: all three drive an entry's bulk (shared by every
// entry-based section — Experience, Education, Languages,
// Achievements, Certifications, Projects) — BASE_*/mutable pairs,
// scaled by recomputeScaledConstants().
const BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP = 3; // job title -> company/dates line
let EXPERIENCE_TITLE_TO_SUBTITLE_GAP = BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
const BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = 6; // company/dates (or title) -> description
let EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
const BASE_EXPERIENCE_ENTRY_GAP = 14; // space between one experience entry and the next
let EXPERIENCE_ENTRY_GAP = BASE_EXPERIENCE_ENTRY_GAP;

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

// --- All ATSPro dividers: ONE authoritative thickness source ---
// A request found that HEADER_RULE_THICKNESS and SECTION_DIVIDER_
// THICKNESS, while both written out to the same value, were two
// independently-computed constants — a structural risk that a future
// edit to one formula alone could silently desync the two dividers'
// rendered thickness, even though today's numbers matched. Per that
// request, there must be exactly ONE thickness calculation that every
// divider draws with. DIVIDER_THICKNESS_PT is now that single source;
// HEADER_RULE_THICKNESS and SECTION_DIVIDER_THICKNESS below are kept
// as names (every existing formula, comment, and call site that reads
// them elsewhere in the file continues to work unchanged) but both are
// now a direct, unmodified reference to this one constant — not a
// second computation of the same numbers. This history (the file's
// original 0.75pt base, an earlier +0.5mm increase, and a later -0.5mm
// reduction back down) is preserved in full here so it isn't lost by
// collapsing the two old formulas into one.
const DIVIDER_THICKNESS_REDUCTION_PT = 0.5 * MM_TO_PT; // 0.5mm, ≈ 1.4173pt — thickness-only reduction, applied once
const DIVIDER_BASE_THICKNESS_PT = 0.75 + 0.5 * MM_TO_PT - DIVIDER_THICKNESS_REDUCTION_PT; // 0.75pt base + 0.5mm − 0.5mm = 0.75pt; the ORIGINAL divider thickness — still the value all LAYOUT math uses (see below)

// Thickness increase: every divider is drawn exactly 0.3mm thicker than
// its original thickness. Applied ONCE, here, to the one shared source.
const DIVIDER_THICKNESS_INCREASE_PT = 0.3 * MM_TO_PT; // 0.3mm, ≈ 0.8504pt

// The ONE thickness every divider is RENDERED with (original + 0.3mm).
// Only drawDivider() reads this. The thickness is grown symmetrically
// around each divider's unchanged center line, so divider length,
// start/end X and Y position are untouched.
// LAYOUT LOCK: sectionHeadingToContentOffset() and addHeader()'s
// topUpToLineHeight() keep using the ORIGINAL thickness
// (DIVIDER_BASE_THICKNESS_PT, via HEADER_RULE_THICKNESS /
// SECTION_DIVIDER_THICKNESS below), so no gap, content position, page
// break or returned Y in the document moves because the ink got thicker.
const DIVIDER_THICKNESS_PT = DIVIDER_BASE_THICKNESS_PT + DIVIDER_THICKNESS_INCREASE_PT;

// Divider line under the header. Length/position (start-X/end-X, Y)
// are entirely separate from thickness — DIVIDER_END_X and each
// divider's own start-X below control those and are untouched by this
// constant. HEADER_RULE_THICKNESS is now a direct reference to the
// single DIVIDER_THICKNESS_PT source above (see its own note) rather
// than an independently written formula, so it can never numerically
// drift from SECTION_DIVIDER_THICKNESS below. This constant is also
// reused (unrelated to its line-width role) by addHeader()'s
// topUpToLineHeight() call as the closest existing analog to "the size
// of what was just drawn" when normalizing the header -> first-section
// gap.
const HEADER_RULE_THICKNESS = DIVIDER_BASE_THICKNESS_PT; // LAYOUT-only (original thickness) — see DIVIDER_THICKNESS_PT note

// Universal section-heading divider thickness. Every section goes
// through renderSectionHeading(), so this one constant applies
// uniformly with no per-section special-casing. Now a direct
// reference to the same single DIVIDER_THICKNESS_PT source
// HEADER_RULE_THICKNESS above uses (see that constant's note) — the
// two are intentionally identical BY CONSTRUCTION now, not merely by
// coincidentally-matching formulas, so the header rule and every
// section divider are guaranteed to render at the exact same stroke
// weight. Divider start-X/end-X, vertical position, and the
// heading-to-divider / divider-to-content gaps are untouched — only
// thickness is sourced from this shared constant.
const SECTION_DIVIDER_THICKNESS = DIVIDER_BASE_THICKNESS_PT; // LAYOUT-only (original thickness) — see DIVIDER_THICKNESS_PT note

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
const COLOR_METADATA = [90, 90, 90] as const;

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

// --- All ATSPro dividers: ONE authoritative color source, reused
// directly from the section-heading accent ---
// A request found that the dividers' own color constants (formerly
// COLOR_RULE and COLOR_SECTION_DIVIDER, both [160, 82, 45] — a sienna
// tone) were separately, manually chosen values that did NOT actually
// match COLOR_SECTION_HEADING_ACCENT ([128, 0, 0], maroon) — the exact
// color renderSectionHeading() above uses for every section heading's
// first 3 letters — even though both were visually in the same family.
// Per that request, every divider must render in the EXACT SAME color
// as the heading accent, sourced from the same constant rather than a
// separately-approximated one. drawDivider() (below) now reads
// COLOR_SECTION_HEADING_ACCENT directly — the old COLOR_RULE and
// COLOR_SECTION_DIVIDER aliases were removed so no second divider
// color name exists anywhere. The header rule, every section divider,
// and every heading's accent lettering therefore share one source.


// ATS PRO DESIGN PASS (Phase 10):
// Date color system — all dates (Experience, Education, Certifications,
// Achievements) use the maroon accent color. This matches the reference
// ATSProTemplate.tsx where dates are rendered in maroon.
const COLOR_DATE = COLOR_SECTION_HEADING_ACCENT; // direct reference (not a copy of the RGB values): dates render with the exact same color source as the section heading's first 3 letters

// Header job title color: a direct reference to COLOR_DATE (the Experience
// date's color source), so the two can never differ. Both are drawn with
// setTextColor(), so their PDF color operand is identical.
const COLOR_TITLE = COLOR_DATE;

// Date font weight: every date (Experience, Education, Certification,
// Achievement) renders bold so its stroke weight matches the bold
// section-heading letters. Used for BOTH measuring and drawing every
// date, so wrap/width/right-alignment math always sees the same font
// the date is drawn in.
const DATE_FONT_STYLE = 'bold';

// Header job title font weight: same weight as the dates (DATE_FONT_STYLE),
// referenced rather than repeated so title and dates can't drift apart.
// Weight only — TITLE_SIZE and all title positions are unchanged.
const TITLE_FONT_STYLE = DATE_FONT_STYLE;

// Divider color: exactly the Minimal template's divider color (its
// COLOR_SECTION_DIVIDER, [195, 195, 200]). drawDivider() applies it
// through the same jsPDF color call Minimal uses (numeric RGB), so the
// PDF color operand — and therefore the rendered color — is identical.
const COLOR_DIVIDER = [195, 195, 200] as const;

// ATS PRO LAYOUT REFINEMENT (Phase 11):
// Bullet color — all bullet dots throughout the PDF use maroon.
const COLOR_BULLET = [128, 0, 0] as const;

// ====================================================================
// BULLET RENDERING (shared by Experience, Achievements, and Projects)
// ------------------------------------------------------------------
// Ported from modernPdf.ts's own shared bullet system, reimplemented
// against ATSPro's own constants (COLOR_BULLET, COLOR_BODY, BODY_SIZE,
// CONTENT_WIDTH, LEFT_MARGIN, BODY_LINE_HEIGHT) so every description
// field behaves exactly like the CV builder's own form/preview: every
// manual line break the user typed in a description textarea (split on
// '\n') is ONE BULLET ITEM and ALWAYS gets a "•" dot — a plain line
// with no marker of its own still gets one, matching what the builder
// already shows the user. This replaces ATSPro's previous, inconsistent
// per-section behavior (Experience drew no bullets at all; Achievements
// drew a dot only for lines that already started with a marker
// character; Projects drew a dot on every WRAPPED line instead of once
// per typed item) with the one behavior modernPdf already uses
// everywhere. If the user's own text for a line happens to already
// start with a marker character (one of the ones below, followed by
// whitespace — e.g. they typed "- Led a team" themselves), that marker
// is stripped first so it isn't shown twice alongside the dot this file
// draws.
// ====================================================================
const BULLET_MARKER_PATTERN = /^[•●◦▪‣∙‧–—*-]\s+/;

function parseBulletLine(rawLine: string): { text: string } {
  const trimmed = rawLine.trim();
  const match = trimmed.match(BULLET_MARKER_PATTERN);
  if (match) {
    return { text: trimmed.slice(match[0].length).trim() };
  }
  return { text: trimmed };
}

// AUTO-FIT: bullet-to-text gap — BASE_*/mutable pair, scaled by
// recomputeScaledConstants(). Shared by every bulleted description
// (Experience, Achievements, Projects) — replaces the old
// Achievement-only ACHIEVEMENT_BULLET_TEXT_INDENT_PT constant and the
// Projects section's hardcoded "8" literal, since all three used the
// exact same 8pt value already.
const BASE_BULLET_DOT_TO_TEXT_GAP_PT = 8;
let BULLET_DOT_TO_TEXT_GAP_PT = BASE_BULLET_DOT_TO_TEXT_GAP_PT;

// Splits a description into logical bullet items (one per typed line,
// manual '\n' breaks respected exactly like every other description
// field in this file) and wraps each item's text to the page width
// minus BULLET_DOT_TO_TEXT_GAP_PT, since every item's text is indented
// past its dot. Shared by each section's own estimate*EntryMinimumHeight()
// (space estimate) AND its add*Entry() (the actual render) so the
// pre-render estimate and the real output can never disagree about line
// counts or wrap width.
function buildBulletDescriptionItems(doc: jsPDF, description: string): { lines: string[] }[] {
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

// Renders a bulleted description: every item gets a maroon "•" dot at
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
function renderBulletDescriptionLines(doc: jsPDF, items: { lines: string[] }[], startY: number): number {
  let y = startY;
  const bulletX = LEFT_MARGIN;
  const bulletTextX = LEFT_MARGIN + BULLET_DOT_TO_TEXT_GAP_PT;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  for (const item of items) {
    item.lines.forEach((line, lineIndex) => {
      y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));
      if (lineIndex === 0) {
        // First wrapped line of this item — draw its dot (maroon).
        doc.setTextColor(...COLOR_BULLET);
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
//   - grade: string  (optional, e.g. "3.8/4.0" — rendered with a
//                      "Grade:" label prefix, matching the Classic
//                      template's education section)
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
// SINGLE DIVIDER RENDERING SYSTEM (drawDivider)
// ------------------------------------------------------------------
// EVERY divider in this file — the header's Contact rule AND every
// section-heading divider drawn by renderSectionHeading() — is drawn
// through this ONE function. Nothing else in the file draws a divider.
//
// ROOT CAUSE this fixes (found by tracing the real PDF output, not the
// source constants): the old code already emitted byte-identical
// operators for every divider (same "0.75 w", same stroke color, same
// doc.line()). The visible thickness/color differences came from the
// divider's Y CENTER: it is derived from accumulated content heights,
// so it lands at an arbitrary fractional position on every section.
// A 0.75pt line whose edges fall at different sub-pixel phases is
// rasterized by viewers as a solid 1px row for one section, a 2px row
// or two anti-aliased half-tone rows (lighter, thicker-looking) for
// another. Rasterizing the generated PDF confirmed it: same operators,
// 1px vs 2px vs blended rows depending only on the fractional Y.
// (Color note: jsPDF encodes stroke AND fill colors with 2 decimals —
// 128/255 -> "0.5" — while text color gets 3 ("0.502"). Both round to
// the same 8-bit value, 128, and the rasterized full-coverage divider
// pixel was verified to equal the heading accent's (128, 0, 0); the
// visible color differences were anti-aliasing blends, not a value
// mismatch.)
//
// HOW IT IS FIXED (one mechanism, every call):
//   - Drawn as a FILLED rectangle, colored with COLOR_DIVIDER (a lighter
//     tint derived from the heading accent, COLOR_SECTION_HEADING_ACCENT). No stroke color / stroke width
//     state is involved, so nothing inherited from earlier operations
//     can affect it; the fill color is set right here before drawing.
//   - Thickness is DIVIDER_THICKNESS_PT (the single thickness source: original + 0.3mm).
//   - The rectangle's top EDGE is snapped to a multiple of the ORIGINAL
//     thickness (DIVIDER_BASE_THICKNESS_PT = 1px at 96dpi), so every divider sits at the same
//     sub-pixel phase and rasterizes with the same visible thickness.
//     The snap shifts ONLY the drawn ink, by at most half a grid step
//     (<= 0.375pt); all layout math (sectionHeadingToContentOffset(),
//     gaps, page-break logic, returned Y values) still uses the
//     unsnapped centerY, so no other position moves.
// Horizontal start/end X are passed through untouched.
// ====================================================================
function drawDivider(doc: jsPDF, startX: number, endX: number, centerY: number): void {
  // Ink top edge: the unchanged center line minus half the RENDERED
  // thickness (so the thicker ink grows symmetrically around the same
  // center), snapped to the ORIGINAL-thickness grid (see SNAP note).
  const snappedTopY =
    Math.round((centerY - DIVIDER_THICKNESS_PT / 2) / DIVIDER_BASE_THICKNESS_PT) * DIVIDER_BASE_THICKNESS_PT;

  // Numeric RGB through jsPDF's own color call — the exact same
  // encoding Minimal's setDrawColor(...COLOR_SECTION_DIVIDER) produces
  // (jsPDF writes fill and stroke color operands identically).
  doc.setFillColor(...COLOR_DIVIDER);
  doc.rect(startX, snappedTopY, endX - startX, DIVIDER_THICKNESS_PT, 'F');
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

  drawDivider(doc, dividerStartX, DIVIDER_END_X, dividerCenterY);

  // --- Content baseline, placed so the content's own ink-top sits
  // exactly SECTION_DIVIDER_TO_CONTENT_GAP_PT (3mm) below the
  // divider's bottom edge ---
  return startY + sectionHeadingToContentOffset(firstContentFontSize);
}

// ====================================================================
// ENTRY POINT
// ====================================================================
// Renders the whole document exactly once, at whatever scale
// recomputeScaledConstants() last set. This is pure rendering — it
// carries no auto-fit decision logic of its own; see
// generateAtsProPDF() below for that.
function renderAtsProPDFOnce(data: AtsProData): { doc: jsPDF; pageCount: number; lastPageContentHeight: number } {
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
// AUTO-FIT-TO-ONE-PAGE (DYNAMIC SCALE)
// If a resume overflows onto a second page by only a SMALL amount,
// automatically shrink the bulk constants (BASE_*/mutable pairs
// above — never margins, colors, stroke widths, or the header's own
// typography/photo) slightly, down to AUTO_FIT_MIN_SCALE, so it fits
// back onto one page. A resume that's already one page renders
// untouched at scale 1. A resume that's genuinely too long (3+ pages,
// or overflow bigger than AUTO_FIT_MAX_OVERFLOW_PT) is never
// force-shrunk — it renders untouched at full size, multi-page.
// ====================================================================
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

export function generateAtsProPDF(data: AtsProData): jsPDF {
  // WinAnsi-safety pass — see sanitizeTextForPdf() above. Every string
  // field in `data` is normalized ONCE here, before any measurement or
  // rendering, so the rest of the file (unchanged below) never sees an
  // unencodable character like U+2011 again.
  const sanitizedData = deepSanitizeForPdf(data);

  recomputeScaledConstants(1);
  const fullScaleResult = renderAtsProPDFOnce(sanitizedData);

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
    const attempt = renderAtsProPDFOnce(sanitizedData);
    if (attempt.pageCount === 1) {
      bestFit = { doc: attempt.doc, scale };
      break;
    }
  }

  recomputeScaledConstants(1);
  return bestFit ? bestFit.doc : fullScaleResult.doc;
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

    // --- Real ink-space vertical span of the name + title-slot block,
    // using the file's existing Helvetica ascent/descent ratios
    // (HELVETICA_ASCENT_RATIO / HELVETICA_DESCENT_RATIO, declared
    // above) — the same metrics already used elsewhere in this file —
    // so the photo centers against real text height, not a guess. ---
    const blockTopY = nameBaselineY - NAME_SIZE * HELVETICA_ASCENT_RATIO;
    const blockBottomY = titleSlotBaselineY + TITLE_SIZE * HELVETICA_DESCENT_RATIO;
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
      doc.setFont('helvetica', TITLE_FONT_STYLE);
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
    // Measured from the always-reserved title slot, so the contact line
    // starts at the same position whether or not a job title exists.
    y = titleSlotBaselineY + TITLE_SIZE + TITLE_TO_CONTACT_GAP;
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
      doc.setFont('helvetica', TITLE_FONT_STYLE);
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
    doc.setTextColor(...COLOR_BODY);

    // Clean, separator-free contact line. Every contact item is placed
    // whole and every item is followed by the SAME gap — the width of the
    // file's existing SKILLS_SEPARATOR in this font, so the horizontal
    // rhythm matches the rest of the document and no new spacing value
    // exists. An item that doesn't fit the remaining width moves whole to
    // the next line (never split mid-text); an item wider than the entire
    // line is wrapped with the same splitTextToSize() used elsewhere in
    // this file, so no contact text is ever dropped or clipped. Lines
    // advance by BODY_LINE_HEIGHT exactly as before, so nothing below
    // moves for a same-line-count contact block.
    const contactRight = LEFT_MARGIN + CONTENT_WIDTH;
    const itemGap = doc.getTextWidth(SKILLS_SEPARATOR);

    let lineCount = 1;
    let cursorX = LEFT_MARGIN;
    let contactLineY = y + CONTACT_Y_OFFSET_PT;
    const startNewLine = () => {
      lineCount += 1;
      cursorX = LEFT_MARGIN;
      contactLineY += BODY_LINE_HEIGHT;
    };

    for (const part of contactParts) {
      const itemWidth = doc.getTextWidth(part);

      if (itemWidth > CONTENT_WIDTH) {
        // Oversized single item: gets its own wrapped lines.
        if (cursorX > LEFT_MARGIN) startNewLine();
        const wrapped: string[] = doc.splitTextToSize(part, CONTENT_WIDTH);
        wrapped.forEach((line, index) => {
          if (index > 0) startNewLine();
          doc.text(line, LEFT_MARGIN, contactLineY);
        });
        // An oversized item fills its whole line box (same as the live
        // preview, where it is a full-width flex item), so the next item
        // always starts on a new line instead of continuing after the
        // last wrapped fragment.
        cursorX = contactRight;
        continue;
      }

      if (cursorX > LEFT_MARGIN && cursorX + itemWidth > contactRight) {
        startNewLine();
      }
      doc.text(part, cursorX, contactLineY);
      cursorX += itemWidth + itemGap;
    }
    y += lineCount * BODY_LINE_HEIGHT;
  }

  y += DIVIDER_SIDE_GAP_PT;

  // --- Divider rule under the header (UNTOUCHED geometry: thickness,
  // color, gap-above, and Y position are exactly as before this change —
  // only its horizontal end-X, via HEADER_DIVIDER_END_X above, is pulled
  // in by a further 0.1mm; the value RETURNED below is otherwise
  // unaffected) ---
  drawDivider(doc, LEFT_MARGIN, HEADER_DIVIDER_END_X, y);

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
  personalInfo: AtsProPersonalInfo,
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

  if (personalInfo?.address) {
    parts.push(`${CONTACT_LABELS.address}${personalInfo.address.trim()}`);
  }

  const location = personalInfo?.location || personalInfo?.city;
  if (location) {
    parts.push(`${CONTACT_LABELS.location}${location.trim()}`);
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

// Computes the exact height renderTitleRowWithDate() will consume for a
// given title/date pair, without drawing anything — used by every
// caller's pre-render "does this entry fit" estimate. Mirrors
// renderTitleRowWithDate()'s own wrap-width / line-count / height logic
// exactly, so the estimate and the actual render can never disagree.
function estimateTitleRowHeight(doc: jsPDF, title: string, date: string): number {
  let dateWidth = 0;
  if (date) {
    doc.setFont('helvetica', DATE_FONT_STYLE);
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
    doc.setFont('helvetica', DATE_FONT_STYLE);
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
    doc.setFont('helvetica', DATE_FONT_STYLE);
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
// ACHIEVEMENT TITLE-ROW-WITH-DATE HELPER (bug fix)
// ------------------------------------------------------------------
// Achievement-only variant of the row layout above. Experience and
// Education keep calling renderTitleRowWithDate() exactly as before —
// this file's own comment on that helper already documents its
// trade-off for a pathologically long date: "the title's wrap width
// clamps to 0 ... and the date still draws right-aligned from the
// same boundary; the title simply wraps to as many lines as its own
// first character needs." That is fine for Experience/Education,
// whose date is a short structured "start – end" range, but an
// Achievement Date is free text a user can type anything into, so
// that same trade-off is what produced the bug: once the date alone
// is wider than roughly half the content row, the title's remaining
// wrap width collapses toward zero and doc.splitTextToSize() has no
// choice but to put one character per line; and because the date's
// own X position is (right boundary − its full unwrapped width), a
// date wider than the content row pushes that X left of LEFT_MARGIN —
// outside the valid content area.
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
// (ACHIEVEMENT_TITLE_MIN_SHARE below — the same 50/50 fair-split
// policy this file already uses to divide the Skills section into two
// columns, see halfCount there), and the date is simply given
// whatever width remains — reusing the SAME doc.splitTextToSize()
// wrapping helper every other section of this file already uses — so
// it wraps onto as many right-aligned lines as it needs, each still
// ending exactly at PAGE_WIDTH - RIGHT_MARGIN like before, and can
// never draw outside the content area.
//
// Keying the trigger off the title's OWN measured content (rather
// than, say, unconditionally floor-protecting at 50% any time the
// date is on the longer side) matters: plenty of everyday entries
// have a short title and a longish-but-not-pathological date that
// was already rendering perfectly fine — comfortably on one line,
// title comfortably word-wrapped — under the old single-line-date
// math. Those must keep rendering exactly as before. Only a date
// that would ACTUALLY force the title into mid-word splitting should
// change anything.
// ====================================================================
const ACHIEVEMENT_TITLE_MIN_SHARE = 0.5; // same fair 50/50 split convention as the Skills section's two-column layout (see halfCount above) — the generous width the title floor-protects to once protection is actually needed

// Pure measurement pass (no drawing) shared by the page-break estimate
// and the actual render below, so the two can never drift apart.
function measureAchievementTitleRowWithDate(
  doc: jsPDF,
  title: string,
  date: string
): { titleLines: string[]; dateLines: string[]; height: number; hasContent: boolean } {
  let dateWidth = 0;
  if (date) {
    doc.setFont('helvetica', DATE_FONT_STYLE);
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    dateWidth = doc.getTextWidth(date);
  }

  // Same calculation renderTitleRowWithDate() uses: how much width
  // would be left for the title if the date rendered on one
  // unwrapped line, the way it always used to.
  const naiveTitleWrapWidth = date
    ? Math.max(0, CONTENT_WIDTH - dateWidth - TITLE_TO_DATE_GAP_PT)
    : CONTENT_WIDTH;

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
    // and let the date wrap inside whatever width is left over
    // instead.
    titleWrapWidth = Math.max(widestTitleWordWidth, CONTENT_WIDTH * ACHIEVEMENT_TITLE_MIN_SHARE);
    dateColumnWidth = Math.max(0, CONTENT_WIDTH - titleWrapWidth - TITLE_TO_DATE_GAP_PT);
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
    doc.text(measured.titleLines, LEFT_MARGIN, y);
  }

  if (measured.dateLines.length > 0) {
    // Same right boundary renderTitleRowWithDate() uses — every date
    // line ends exactly at PAGE_WIDTH - RIGHT_MARGIN, never past it.
    const rightBoundary = PAGE_WIDTH - RIGHT_MARGIN;
    doc.setFont('helvetica', DATE_FONT_STYLE);
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_DATE);
    doc.text(measured.dateLines, rightBoundary, y, { align: 'right' });
  }

  return measured;
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

// Computes the exact minimum vertical space one Experience entry needs
// (title/date row + company line + FULL wrapped description), without
// drawing anything, measured from the entry's first baseline down to
// the ink bottom of its last line (see inkBottomHeight()). Used by
// addExperienceEntry() itself for its own checkPageBreak() call AND by
// addExperience() to size its heading-guard against the REAL first
// entry instead of a generic one-line guess — see the ROOT-CAUSE FIX
// note on that guard. Single source of truth, so the estimate and the
// entry's own render can never disagree. Mirrors, step for step, the
// advances addExperienceEntry() applies while rendering.
//
// An entry that fits on a single page must move to the next page as a
// WHOLE; an entry taller than a full page can never do that, so it is
// reserved only up to its header plus first description line and its
// remaining lines flow across pages (see keepTogetherHeight()).
function estimateExperienceEntryMinimumHeight(doc: jsPDF, exp: AtsProExperience): number {
  const title = (exp.title || '').trim();
  const company = (exp.company || '').trim();
  const startDate = (exp.startDate || '').trim();
  const endDate = (exp.endDate || '').trim();
  const description = (exp.description || '').trim();
  const dateRange = [startDate, endDate].filter(Boolean).join(' – ');

  // Uses the SAME buildBulletDescriptionItems() the real render uses
  // (see its own doc comment above), so this estimate's line
  // count/wrap-width can never drift out of parity with what
  // addExperienceEntry() actually draws.
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
    doc.setTextColor(...COLOR_BODY);
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
//   Grade (optional, rendered with a "Grade:" label)
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

// Computes the exact minimum vertical space one Education entry needs
// (degree/year row + institution + FULL wrapped grade), without
// drawing anything, measured from the entry's first baseline down to
// the ink bottom of its last line (see inkBottomHeight()). Used by
// addEducationEntry() itself for its own checkPageBreak() call AND by
// addEducation() to size its heading-guard against the REAL first
// entry instead of a generic one-line guess — see the ROOT-CAUSE FIX
// note on that guard. Single source of truth, so the estimate and the
// entry's own render can never disagree: it mirrors, step for step,
// the advances addEducationEntry() applies while rendering.
function estimateEducationEntryMinimumHeight(doc: jsPDF, edu: AtsProEducation): number {
  const degree = (edu.degree || '').trim();
  const institution = (edu.institution || '').trim();
  const year = (edu.year || '').trim();
  const grade = (edu.grade || '').trim();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, CONTENT_WIDTH) : [];
  const gradeLines: string[] = grade ? doc.splitTextToSize(`Grade: ${grade}`, CONTENT_WIDTH) : [];

  const degreeRowHeightEstimate = estimateTitleRowHeight(doc, degree, year);
  const hasDegreeRow = Boolean(degree || year);

  const institutionHeight = institutionLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const gradeHeight = gradeLines.length * EXPERIENCE_SUBTITLE_SIZE;

  const degreeToInstitutionGap = hasDegreeRow && institutionLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const institutionToGradeGap = institutionLines.length > 0 && gradeLines.length > 0
    ? NORMAL_CONTENT_LINE_GAP
    : 0;
  const degreeRowToGradeGap = hasDegreeRow && institutionLines.length === 0 && gradeLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;

  const fullHeight = degreeRowHeightEstimate + degreeToInstitutionGap + institutionHeight +
    institutionToGradeGap + degreeRowToGradeGap + gradeHeight;

  const lastLineFontSize = (gradeLines.length > 0 || institutionLines.length > 0)
    ? EXPERIENCE_SUBTITLE_SIZE
    : (degree ? EXPERIENCE_TITLE_SIZE : EXPERIENCE_SUBTITLE_SIZE);
  const inkHeight = inkBottomHeight(fullHeight, lastLineFontSize, lastLineFontSize);
  return keepTogetherHeight(inkHeight, inkHeight);
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
  const gradeLines: string[] = grade ? doc.splitTextToSize(`Grade: ${grade}`, CONTENT_WIDTH) : [];

  // Multi-line metadata fields use their own font size as the per-line
  // height, with no extra leading — the same convention already used
  // for the header's wrapped contact line.
  const institutionHeight = institutionLines.length * EXPERIENCE_SUBTITLE_SIZE;

  const hasDegreeRow = Boolean(degree || year);

  // --- Determine how much space this ENTIRE entry needs (degree/year
  // row + institution + every wrapped grade line), so the whole block
  // moves to a new page together rather than splitting mid-entry.
  // Computed via the shared estimateEducationEntryMinimumHeight() (see
  // its own comment above addEducationEntry) rather than inline here,
  // so this entry's own page-break check and addEducation()'s
  // heading-guard can never drift out of parity with each other. ---
  const minimumEntrySpaceNeeded = estimateEducationEntryMinimumHeight(doc, edu);
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
    doc.setTextColor(...COLOR_BODY);
    doc.text(institutionLines, LEFT_MARGIN, y);
    y += institutionHeight;
    if (gradeLines.length > 0) {
      y += NORMAL_CONTENT_LINE_GAP;
    }
  }

  // Degree/Year row -> Grade, only when there is no Institution line at
  // all.
  if (hasDegreeRow && institutionLines.length === 0 && gradeLines.length > 0) {
    y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
  }

  // --- Grade (optional, rendered with a "Grade:" label) ---
  if (gradeLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_BODY);

    for (const line of gradeLines) {
      y = checkPageBreak(doc, y, lineInkHeight(EXPERIENCE_SUBTITLE_SIZE));
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
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + lineInkHeight(BODY_SIZE);
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
    y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));

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

// Computes the exact minimum vertical space one Language entry needs
// (the combined "Name — Level" line(s)), without drawing anything,
// measured from the entry's first baseline down to the ink bottom of
// its last line (see inkBottomHeight()). Used by addLanguageEntry()
// itself for its own checkPageBreak() call AND by addLanguages() to
// size its heading-guard against the REAL first entry instead of a
// generic one-line guess — see the ROOT-CAUSE FIX note on that guard.
// Single source of truth, so the estimate and the entry's own render
// can never disagree.
function estimateLanguageEntryMinimumHeight(doc: jsPDF, lang: AtsProLanguage): number {
  const language = (lang.language || '').trim();
  const proficiencyRaw = (lang.proficiency || '').trim();
  const proficiencyLabel = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';
  const levelPart = proficiencyLabel ? `${LANGUAGE_NAME_LEVEL_SEPARATOR}${proficiencyLabel}` : '';
  const combinedText = `${language}${levelPart}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const combinedLines: string[] = combinedText ? doc.splitTextToSize(combinedText, CONTENT_WIDTH) : [];
  const combinedHeight = combinedLines.length * EXPERIENCE_TITLE_SIZE;

  const inkHeight = inkBottomHeight(combinedHeight, EXPERIENCE_TITLE_SIZE, EXPERIENCE_TITLE_SIZE);
  return keepTogetherHeight(inkHeight, inkHeight);
}

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
  // to a new page as a single unit. Computed via the shared
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
    doc.setTextColor(...COLOR_BODY);
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
    (ach.title || '').trim() ||
    (ach.date || '').trim() ||
    (ach.description || '').trim()
  );
}

// Renders a single achievement entry and returns the new Y position,
// normalized (like every Education/Language entry) so every entry —
// not only the section's last one — ends on an equivalent trailing space.
// PHASE 12: Date is now right-aligned on the same row as the title.
// Computes the exact minimum vertical space one Achievement entry
// needs (title/date row + FULL wrapped description), without drawing
// anything, measured from the entry's first baseline down to the ink
// bottom of its last line (see inkBottomHeight()). Used by
// addAchievementEntry() itself for its own checkPageBreak() call AND
// by addAchievements() to size its heading-guard against the REAL
// first entry instead of a generic one-line guess — see the ROOT-CAUSE
// FIX note on that guard. Single source of truth, so the estimate and
// the entry's own render can never disagree: the header height comes
// from the SAME measureAchievementTitleRowWithDate() pass the render
// itself uses.
//
// An entry that fits on a single page moves to the next page as a
// WHOLE; an entry taller than a full page is reserved only up to its
// header plus first description line and flows across pages (see
// keepTogetherHeight()).
function estimateAchievementEntryMinimumHeight(doc: jsPDF, ach: any): number {
  const title = (ach.title || '').trim();
  const date = (ach.date || '').trim();
  const description = (ach.description || '').trim();

  const titleRowMeasurement = measureAchievementTitleRowWithDate(doc, title, date);
  const titleRowHeightEstimate = titleRowMeasurement.height;
  const titleBlockHeight = titleRowMeasurement.titleLines.length * EXPERIENCE_TITLE_SIZE;
  const dateBlockHeight = titleRowMeasurement.dateLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // Uses the SAME buildBulletDescriptionItems() the real render uses
  // (see its own doc comment above), so this estimate's line
  // count/wrap-width can never drift out of parity with what
  // addAchievementEntry() actually draws.
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  const hasHeaderContent = Boolean(title || date);
  const headerToDescriptionGap = hasHeaderContent && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const descriptionTotalHeight = descriptionLines.length * BODY_LINE_HEIGHT;

  const hasDescription = descriptionLines.length > 0;
  // The bottommost line of the title/date row is whichever of the two
  // columns is taller (same rule measureAchievementTitleRowWithDate()
  // uses for the row's height).
  const lastHeaderFontSize = dateBlockHeight > titleBlockHeight
    ? EXPERIENCE_SUBTITLE_SIZE
    : EXPERIENCE_TITLE_SIZE;
  const lastLineFontSize = hasDescription ? BODY_SIZE : lastHeaderFontSize;
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : lastHeaderFontSize;

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

  // PHASE 12: Date now renders on the SAME row as the achievement
  // title, right-aligned — via the shared renderTitleRowWithDate()
  // helper (see its own doc comment above), also used by Experience
  // and Education.

  // Description uses the same shared bullet rendering as Experience and
  // Projects (see buildBulletDescriptionItems()/renderBulletDescriptionLines()
  // above): each manual line break becomes one bullet item and always
  // gets a dot, matching the CV builder's own form/preview.
  const descriptionItems = buildBulletDescriptionItems(doc, description);
  const descriptionLines: string[] = descriptionItems.flatMap((item) => item.lines);

  // --- Determine how much space this whole entry needs (title/date
  // row + EVERY wrapped description line), so it moves to a new page
  // together rather than splitting a title from its date/description.
  // Computed via the shared estimateAchievementEntryMinimumHeight()
  // (see its own comment above), which uses the SAME measurement pass
  // (measureAchievementTitleRowWithDate()) the actual render below
  // calls, so this entry's own page-break check and addAchievements()'s
  // heading-guard can never drift out of parity with what gets drawn. ---
  const hasHeaderContent = Boolean(title || date);
  const minimumEntrySpaceNeeded = estimateAchievementEntryMinimumHeight(doc, ach);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Achievement Title (left) + Date (right, same row — the Date
  // wraps onto additional right-aligned lines instead of overflowing
  // the content area if it's long; see renderAchievementTitleRowWithDate()) ---
  const titleRow = renderAchievementTitleRowWithDate(doc, title, date, y);
  if (titleRow.hasContent) {
    y += titleRow.height;
  }

  // --- Description (optional, rendered as bullets — see
  // buildBulletDescriptionItems()/renderBulletDescriptionLines() above) ---
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
  } else if (titleRow.hasContent) {
    // Title row is the last visual line. The Title and Date no longer
    // necessarily wrap to the same number of lines (the Date can now
    // wrap onto extra lines of its own — see
    // renderAchievementTitleRowWithDate()), so the bottommost baseline
    // is whichever of the two has MORE lines; check that one's own
    // last line for descender-parity (both, on the rare row where
    // they tie) since whichever has a descender governs the row's
    // real ink-bottom.
    const titleLineCount = titleRow.titleLines.length;
    const dateLineCount = titleRow.dateLines.length;
    const lastTitleLine = titleRow.titleLines[titleLineCount - 1] ?? '';
    const lastDateLine = titleRow.dateLines[dateLineCount - 1] ?? '';
    if (dateLineCount > titleLineCount) {
      // The Date wrapped past the Title — its own last line is the
      // only text on the bottommost baseline.
      y = topUpToLineHeight(y, EXPERIENCE_SUBTITLE_SIZE, lastDateLine);
    } else {
      y = topUpToLineHeight(y, EXPERIENCE_TITLE_SIZE, `${lastTitleLine}${lastDateLine}`);
    }
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
    (cert.name || '').trim() ||
    (cert.date || '').trim() ||
    (cert.credentialId || '').trim()
  );
}

// Renders a single certification entry and returns the new Y position,
// normalized (like every Education/Language/Achievement entry) so every
// entry — not only the section's last one — ends on an equivalent
// trailing space.
// Computes the exact minimum vertical space one Certification entry
// needs (name + date + credential ID), without drawing anything,
// measured from the entry's first baseline down to the ink bottom of
// its last line (see inkBottomHeight()). Used by
// addCertificationEntry() itself for its own checkPageBreak() call AND
// by addCertifications() to size its heading-guard against the REAL
// first entry instead of a generic one-line guess — see the ROOT-CAUSE
// FIX note on that guard. Single source of truth, so the estimate and
// the entry's own render can never disagree: it mirrors, step for
// step, the advances addCertificationEntry() applies.
function estimateCertificationEntryMinimumHeight(doc: jsPDF, cert: any): number {
  const name = (cert.name || '').trim();
  const date = (cert.date || '').trim();
  const credentialId = (cert.credentialId || '').trim();

  // Date now shares the name's row (right-aligned), exactly like
  // Experience and Education — measured by the same shared helper.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const credentialLines: string[] = credentialId ? doc.splitTextToSize(credentialId, CONTENT_WIDTH) : [];

  const nameRowHeightEstimate = estimateTitleRowHeight(doc, name, date);
  const hasNameRow = Boolean(name || date);

  const credentialHeight = credentialLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const nameRowToCredentialGap = hasNameRow && credentialLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;

  const fullHeight = nameRowHeightEstimate + nameRowToCredentialGap + credentialHeight;
  const lastLineFontSize = credentialLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : (name ? EXPERIENCE_TITLE_SIZE : EXPERIENCE_SUBTITLE_SIZE);
  const inkHeight = inkBottomHeight(fullHeight, lastLineFontSize, lastLineFontSize);
  return keepTogetherHeight(inkHeight, inkHeight);
}

function addCertificationEntry(
  doc: jsPDF,
  cert: any,
  startY: number
): number {
  let y = startY;

  const name = (cert.name || '').trim();
  const date = (cert.date || '').trim();
  const credentialId = (cert.credentialId || '').trim();

  // The certificate date now uses the SAME format as the Experience
  // (and Education) date: right-aligned on the same row as the name,
  // drawn by the shared renderTitleRowWithDate() helper — same fonts,
  // same maroon date color, same right boundary, same title/date gap.
  // Credential ID keeps its own line directly below the name/date row.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const credentialLines: string[] = credentialId ? doc.splitTextToSize(credentialId, CONTENT_WIDTH) : [];
  const credentialHeight = credentialLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a name from its
  // credential ID. Computed via the shared
  // estimateCertificationEntryMinimumHeight() (see its own comment
  // above) rather than inline here, so this entry's own page-break
  // check and addCertifications()'s heading-guard can never drift out
  // of parity. ---
  const minimumEntrySpaceNeeded = estimateCertificationEntryMinimumHeight(doc, cert);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Certification Name (left) + Date (right, same row) ---
  const nameRow = renderTitleRowWithDate(doc, name, date, y);
  if (nameRow.hasContent) {
    y += nameRow.height;
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
  // The last line is the credential ID (EXPERIENCE_SUBTITLE_SIZE) if
  // present, otherwise the name/date row (title size if a name exists).
  let lastLineFontSize: number;
  let lastLineText: string | undefined;
  if (credentialLines.length > 0) {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
    lastLineText = credentialLines[credentialLines.length - 1];
  } else if (nameRow.lines.length > 0) {
    lastLineFontSize = EXPERIENCE_TITLE_SIZE;
    lastLineText = nameRow.lines[nameRow.lines.length - 1];
  } else {
    lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
    lastLineText = date;
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
// Computes the exact minimum vertical space one Project entry needs
// (name + tech + FULL wrapped description + github), without drawing
// anything, measured from the entry's first baseline down to the ink
// bottom of its last line (see inkBottomHeight()). Used by
// addProjectEntry() itself for its own checkPageBreak() call AND by
// addProjects() to size its heading-guard against the REAL first entry
// instead of a generic one-line guess — see the ROOT-CAUSE FIX note on
// that guard. Single source of truth, so the estimate and the entry's
// own render can never disagree.
//
// An entry that fits on a single page moves to the next page as a
// WHOLE; an entry taller than a full page is reserved only up to its
// header plus first description line and flows across pages (see
// keepTogetherHeight()).
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

  // Uses the SAME buildBulletDescriptionItems() the real render uses
  // (see its own doc comment above), so this estimate's line
  // count/wrap-width can never drift out of parity with what
  // addProjectEntry() actually draws.
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
  // PHASE 11: Bullet color uses COLOR_BULLET (maroon)
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
//   5. Every reservation is measured to the INK bottom of the last
//      line (see inkBottomHeight()), so BOTTOM_MARGIN is the real
//      visible gap between the last line and the page edge.
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
// AUTO-FIT SCALING (part of the AUTO-FIT-TO-ONE-PAGE system — see
// generateAtsProPDF() above)
// Recomputes every bulk BASE_*/mutable constant at the given scale.
// Called with 1 before every full-size render and before returning
// from generateAtsProPDF(), so SCALE_FACTOR/every scaled constant is
// always reset and never leaks between calls. Never touches margins,
// colors, stroke widths, or the header's own name/title/contact
// typography and photo geometry — those stay fixed at every scale.
// ====================================================================
function recomputeScaledConstants(scale: number): void {
  SCALE_FACTOR = scale;

  HEADING_SIZE = BASE_HEADING_SIZE * scale;
  BODY_SIZE = BASE_BODY_SIZE * scale;
  EXPERIENCE_TITLE_SIZE = BASE_EXPERIENCE_TITLE_SIZE * scale;
  EXPERIENCE_SUBTITLE_SIZE = BASE_EXPERIENCE_SUBTITLE_SIZE * scale;

  SECTION_GAP = BASE_SECTION_GAP * scale;
  CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT = BASE_CONTACT_DIVIDER_TO_SUMMARY_EXTRA_GAP_PT * scale;
  SECTION_DIVIDER_TO_CONTENT_GAP_PT = BASE_SECTION_DIVIDER_TO_CONTENT_GAP_PT * scale;
  EXPERIENCE_TITLE_TO_SUBTITLE_GAP = BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP * scale;
  EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP * scale;
  EXPERIENCE_ENTRY_GAP = BASE_EXPERIENCE_ENTRY_GAP * scale;
  BULLET_DOT_TO_TEXT_GAP_PT = BASE_BULLET_DOT_TO_TEXT_GAP_PT * scale;

  // Derived constants — recomputed from the (possibly scaled) values
  // above, never scaled a second time on their own.
  BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;
  NORMAL_CONTENT_LINE_GAP = BODY_LINE_HEIGHT - BODY_SIZE;
}
