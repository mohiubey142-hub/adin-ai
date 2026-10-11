/**
 * classicPdf.ts
 * ------------------------------------------------------------------
 * A from-scratch, single-file CV PDF generator built with jsPDF.
 *
 * ORIGIN: an independent, standalone copy of simplePdf.ts. Every
 * page/typography/spacing/layout constant, calculation, and rendering
 * function below is identical to simplePdf.ts. The ONLY visual
 * difference is that section headline text (e.g. "PROFESSIONAL
 * SUMMARY", "EXPERIENCE") is rendered in a centralized green
 * (CLASSIC_SECTION_HEADING_COLOR, used only inside
 * renderSectionHeading()) instead of COLOR_HEADING. This file does not
 * import from or depend on simplePdf.ts or any other PDF generator.
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
 *   - Experience (heading + entries: title, company/dates — company in
 *     body text color, dates in accent teal — description), skipped
 *     entirely if there are no usable entries
 *   - Education (heading + entries: degree, institution/year —
 *     institution muted, year bold accent teal —, grade with a
 *     "Grade: " label), skipped entirely if there are no usable entries
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
// checkPageBreakClassic()) to tell a block that merely doesn't fit on
// the CURRENT page (move it to the next one) from a block that can
// never fit on ANY single page (let it flow across pages line by line).
const PAGE_USABLE_HEIGHT = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

// ====================================================================
// TYPOGRAPHY CONSTANTS (font sizes, in points)
// ====================================================================
const NAME_SIZE = 22;
const TITLE_SIZE = 13;
const METADATA_SIZE = 9.5; // contact line (email / phone / location / links)

// Reserved for later phases (section headings, body paragraphs).
// Declared now so every size constant lives in one place from the start.
//
// AUTO-FIT: these two sizes drive a resume's BULK (every section
// heading and every wrapped body/entry paragraph reads BODY_SIZE), so
// they are declared as BASE_*/mutable `let` pairs and rescaled by
// recomputeScaledConstants() (see AUTO-FIT-TO-ONE-PAGE, near the
// entry point) when a resume overflows to page 2 by only a small
// amount. The header's own NAME_SIZE/TITLE_SIZE/METADATA_SIZE above
// are deliberately left as plain `const` — never scaled.
const BASE_HEADING_SIZE = 12;
let HEADING_SIZE = BASE_HEADING_SIZE;
const BASE_BODY_SIZE = 10.5;
let BODY_SIZE = BASE_BODY_SIZE;

// SCALE_FACTOR: 1 = full size (the default/untouched state). Set by
// recomputeScaledConstants() during the auto-fit pass in
// generateClassicPDF(); always reset to 1 before that function
// returns, so back-to-back calls never leak scale state into each
// other.
let SCALE_FACTOR = 1;

// Multiplier applied to BODY_SIZE to get the vertical distance between
// wrapped lines of paragraph text (a.k.a. "leading"). 1.4 is a normal,
// readable line-height for body copy — tight enough to stay compact,
// loose enough not to feel cramped. Used by every body-text section
// (Summary, Experience, and later ones), so it lives here once rather
// than being redefined per section. Not itself scaled — it's a ratio,
// not an absolute size.
const BODY_LINE_HEIGHT_MULTIPLIER = 1.4;

// The actual computed line height used whenever BODY_SIZE text wraps
// across multiple lines. Computed once here instead of recomputing
// `BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER` inline in every section.
// AUTO-FIT: derived from BODY_SIZE, so it must be a `let` too and is
// recomputed inside recomputeScaledConstants() every time BODY_SIZE
// changes — never fixed at load time.
let BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;

// --- Experience entry typography (Phase 3) ---
// Job title: slightly smaller than a section heading, but still bold,
// so entries are clearly distinguishable from the section heading
// above them.
// AUTO-FIT: scaled, same reasoning as HEADING_SIZE/BODY_SIZE above.
const BASE_EXPERIENCE_TITLE_SIZE = 11;
let EXPERIENCE_TITLE_SIZE = BASE_EXPERIENCE_TITLE_SIZE;
// Company / dates line: supporting text, same visual weight as the
// header's contact line.
const BASE_EXPERIENCE_SUBTITLE_SIZE = 10;
let EXPERIENCE_SUBTITLE_SIZE = BASE_EXPERIENCE_SUBTITLE_SIZE;

// --- Header profile photo (circular) ---
// Single source of truth for the header photo's size: both its width
// and height, since the photo is always rendered as a perfect circle
// (a circle's diameter is one number, not a separate width/height
// pair). Anywhere the photo's size is needed — drawing the circular
// clip path or placing the image inside it — this is the only
// constant referenced; nothing is ever hardcoded inline.
// PHOTO_SIZE_BASE: the photo's diameter BEFORE the +7pt increase
// (65pt base * 1.13). Declared as its own constant — rather than
// inlining 65 * 1.13 again — because it is now also the fixed
// VERTICAL-POSITION anchor used below (see photoBottomY in
// addHeader()): the +7pt growth is intentionally decoupled from
// vertical placement, so the image's bottom edge (and therefore the
// Image <-> Contact gap) never moves when this size changes, only the
// drawn diameter does. Root cause of the earlier regression: the old
// formula centered the photo using PHOTO_SIZE itself, so growing
// PHOTO_SIZE pushed BOTH the top edge up AND the bottom edge down by
// half of the increase — silently eating into the Image <-> Contact
// gap even though Contact's own position never moved. Anchoring the
// bottom edge to PHOTO_SIZE_BASE (fixed) instead of PHOTO_SIZE
// (growing) removes that coupling entirely.
const PHOTO_SIZE_BASE = 65 * 1.13; // pt — 73.45pt, the pre-increase diameter, also the fixed vertical anchor

// SIZE UPDATE (+7pt): requested increase on top of PHOTO_SIZE_BASE,
// added as its own explicit term rather than baked into a new
// multiplier, so this file's history of size changes stays legible.
const PHOTO_SIZE_INCREASE_PT = 7; // pt — historical +7px increase

// SIZE UPDATE (-4pt): requested reduction, declared as its own
// explicit term for the same legibility reason as
// PHOTO_SIZE_INCREASE_PT above — rather than collapsing the two into
// a single combined literal, each requested adjustment stays visible
// and independently traceable here.
const PHOTO_SIZE_DECREASE_PT = 4; // pt — requested -4px reduction

// PHOTO_SIZE: the single source of truth for the header photo's DRAWN
// size — every rendering consumer (circle radius, image draw
// width/height, aspect-ratio "cover" fit) reads this one constant, so
// any change to it is automatically proportional and never distorts
// the image. Currently PHOTO_SIZE_BASE + 7 - 4 = PHOTO_SIZE_BASE + 3
// (76.45pt). PHOTO_SIZE_BASE above (not this constant) is what governs
// the image's vertical anchor (see photoBottomY in addHeader()), so
// changing PHOTO_SIZE_INCREASE_PT/PHOTO_SIZE_DECREASE_PT only ever
// changes how big the circle is drawn — never where its bottom edge,
// and therefore the Image <-> Contact gap, sits. (A drawn-size change
// necessarily moves the image's TOP edge by the same amount, since the
// bottom edge is fixed and diameter = bottom - top; there is no
// mathematically possible way to change the diameter while holding
// BOTH edges fixed. This file's established priority, from the
// previous fix, is to keep the bottom edge — and therefore
// Image <-> Contact — exactly fixed; the Image <-> Name / Image <->
// Job Title gap absorbs the size delta instead.)
// SIZE UPDATE (+5%): requested increase of the CURRENT drawn size by
// exactly 5%, applied as a multiplier on top of the existing
// BASE + INCREASE - DECREASE result (so every earlier adjustment above
// stays visible and untouched). Diameter only — the bottom-edge anchor
// and right-margin flush position are unchanged, so the larger circle
// grows upward/leftward from that anchored corner.
const PHOTO_SIZE_SCALE_UP_PERCENT = 5;
const PHOTO_SIZE_SCALE_FACTOR = 1 + PHOTO_SIZE_SCALE_UP_PERCENT / 100;
const PHOTO_SIZE = (PHOTO_SIZE_BASE + PHOTO_SIZE_INCREASE_PT - PHOTO_SIZE_DECREASE_PT) * PHOTO_SIZE_SCALE_FACTOR; // pt — previous 76.45pt × 1.05

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
// AUTO-FIT: SECTION_GAP drives a resume's BULK (it's added between
// every section), so it's scaled like the typography constants above.
const BASE_SECTION_GAP = 20;
let SECTION_GAP = BASE_SECTION_GAP;
// NOTE: as of this phase, HEADING_TO_CONTENT_GAP is no longer used to
// position section content directly under a heading — every section
// now renders a divider between heading and content, via
// renderSectionHeading(), and that transition is governed instead by
// HEADING_TO_DIVIDER_GAP + DIVIDER_TO_CONTENT_GAP below. Left in place
// (unused) rather than deleted, since removing constants is outside
// the scope of this phase and nothing outside this file depends on it
// being absent. Converted to a BASE_*/let pair for consistency with
// every other gap constant here, even though it's currently unread.
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
// sides and for every section.
// AUTO-FIT: this is the "heading -> divider -> content" gap that
// applies to every section, so it drives bulk like SECTION_GAP does
// and is scaled the same way.
const BASE_DIVIDER_SIDE_GAP_PT = 1 * MM_TO_PT; // 1mm, ≈ 2.8346pt
let DIVIDER_SIDE_GAP_PT = BASE_DIVIDER_SIDE_GAP_PT;

// Additional whitespace requested on top of the base divider->content
// gap above — applied ONLY to the divider-bottom-edge -> content side
// of the transition, never to the heading -> divider-top-edge side.
// Kept as its own constant (rather than folded into DIVIDER_SIDE_GAP_PT,
// which is shared by both sides — see comment above) specifically so
// widening it can only ever push the section's first content line
// further down; it can never move the heading or the divider itself,
// both of which are computed from DIVIDER_SIDE_GAP_PT/HEADING_SIZE
// alone. Expressed via the same MM_TO_PT unit-conversion constant
// already used for DIVIDER_SIDE_GAP_PT — no new unit, no arbitrary pt
// literal.
// AUTO-FIT: same reasoning as DIVIDER_SIDE_GAP_PT above — scaled.
const BASE_CONTENT_GAP_EXTRA_PT = 2 * MM_TO_PT; // 2mm, ≈ 5.6693pt
let CONTENT_GAP_EXTRA_PT = BASE_CONTENT_GAP_EXTRA_PT;

// The header profile photo's requested 5.5mm upward adjustment, expressed
// through the same centralized MM_TO_PT conversion used above — the
// single source of truth for this offset, applied where the photo's Y
// position is computed in addHeader().
const PHOTO_VERTICAL_OFFSET_PT = 5.5 * MM_TO_PT; // 5.5mm, ≈ 15.5906pt

// Requested: move ONLY the header photo down by exactly 4mm. Applied
// solely to the photo's own Y anchor (photoBottomY in addHeader()); the
// Name, Job Title, Contact, header divider and everything below are
// positioned from `y`/startY and are therefore untouched. Expressed
// through the same MM_TO_PT conversion as every other mm value here.
const PHOTO_DOWN_SHIFT_MM = 4;
const PHOTO_DOWN_SHIFT_PT = PHOTO_DOWN_SHIFT_MM * MM_TO_PT; // 4mm, ≈ 11.3386pt

// Requested follow-up: move the SAME photo an ADDITIONAL 2mm down, on
// top of PHOTO_DOWN_SHIFT_PT above (total = original + 6mm). Added as its
// own term to the existing photoBottomY calculation in addHeader() —
// still photo-only; nothing else in the header reads this value.
const PHOTO_EXTRA_DOWN_SHIFT_MM = 2;
const PHOTO_EXTRA_DOWN_SHIFT_PT = PHOTO_EXTRA_DOWN_SHIFT_MM * MM_TO_PT; // 2mm, ≈ 5.6693pt

// Requested follow-up: a FURTHER 1.5mm down (current = original + 6mm,
// final = original + 7.5mm), added as its own term to the same
// photoBottomY calculation — not a replacement of the terms above.
const PHOTO_FINAL_DOWN_SHIFT_MM = 1.5;
const PHOTO_FINAL_DOWN_SHIFT_PT = PHOTO_FINAL_DOWN_SHIFT_MM * MM_TO_PT; // 1.5mm, ≈ 4.2520pt

// Requested: header Name moves exactly 0.1mm LEFT of its current X.
const NAME_X_SHIFT_LEFT_MM = 0.1;
const NAME_X_SHIFT_LEFT_PT = NAME_X_SHIFT_LEFT_MM * MM_TO_PT; // 0.1mm, ≈ 0.2835pt

// Requested correction: a FURTHER 0.1mm left from the Name's current X
// (total = 0.2mm left of LEFT_MARGIN). Its own term, added on top of
// NAME_X_SHIFT_LEFT_PT above rather than replacing it.
const NAME_X_EXTRA_SHIFT_LEFT_MM = 0.1;
const NAME_X_EXTRA_SHIFT_LEFT_PT = NAME_X_EXTRA_SHIFT_LEFT_MM * MM_TO_PT; // 0.1mm, ≈ 0.2835pt

// Requested: when a photo is present, the Contact content's RIGHT
// boundary is the photo's LEFT edge minus this safety gap (measured from
// the photo's real geometry in addHeader(), never a fixed width).
const CONTACT_PHOTO_SAFETY_GAP_MM = 3;
const CONTACT_PHOTO_SAFETY_GAP_PT = CONTACT_PHOTO_SAFETY_GAP_MM * MM_TO_PT; // 3mm, ≈ 8.5039pt

// Additional top-of-page starting offset applied ONLY when the CV has
// a profile photo (see generateClassicPDF()'s hasPhoto check below) —
// the current header sits too tight against the page's top margin
// once a photo is present. This is a single, top-level addition to the
// initial cursor position, not a per-element offset: because every
// element in the header (Name, Job Title, Contact, and the photo
// itself — see addHeader()'s headerBlockTopY/headerBlockCenterY/
// photoBottomY, all derived from the startY it's passed) is positioned
// relative to that one shared startY, adding this constant to startY
// before the flow begins moves the whole header down together, with
// every internal gap (Image<->Name, Image<->Job Title, Image<->Contact,
// Name<->Job Title, Job Title<->Contact, and every section gap after
// it) completely unaffected — they are all relative distances, never
// absolute coordinates. When no photo is present, this constant is
// simply never added, so the no-photo flow's starting Y is bit-for-bit
// identical to before this change.
const PHOTO_TOP_SPACING_PT = 3 * MM_TO_PT; // 3mm, ≈ 8.5039pt

// Requested: when there is NO profile photo, the header's Name and Job
// Title each need to move down by their own small, fixed amount (Name
// 2mm, Job Title 1mm) — and ONLY in that no-photo case; the
// photo-present header branch is completely unaffected. Expressed in
// mm and converted through the file's existing MM_TO_PT constant, same
// convention as every other mm-sourced offset above — no raw pt magic
// number. These two constants are read in exactly one place
// (addHeader()'s Name/Job-Title draw calls, gated on hasPhoto) and only
// add to the Y value used to DRAW the Name/Job Title baselines — the
// plain cursor that goes on to position the Contact line and header
// divider is deliberately left unaffected by either offset, so
// Contact/divider/everything below stays exactly where it already was.
const NO_IMAGE_NAME_Y_OFFSET_MM = 2;
const NO_IMAGE_NAME_Y_OFFSET_PT = NO_IMAGE_NAME_Y_OFFSET_MM * MM_TO_PT;
const NO_IMAGE_TITLE_Y_OFFSET_MM = 1;
const NO_IMAGE_TITLE_Y_OFFSET_PT = NO_IMAGE_TITLE_Y_OFFSET_MM * MM_TO_PT;

// Standard Adobe Core-14 Helvetica AFM font metrics, expressed as a
// fraction of font size. jsPDF's 'helvetica' standard font IS this
// font, so these ratios are real rendering geometry, not assumptions:
//   - ascender  = 718/1000 em  (how far a line's ink rises above its
//     own baseline — already used by the previous phase's fix)
//   - descender = 207/1000 em  (how far a line's ink — e.g. the tail
//     of a "g" or "y" — extends below its own baseline)
// Both are needed now because "exactly 1mm of whitespace" must be
// measured between actual ink edges, not between the baseline
// reference points doc.text()/checkPageBreakClassic() otherwise use.
const HELVETICA_ASCENT_RATIO = 0.718;
// Helvetica's descender depth (207/1000 em — see the geometry note
// above). Used by the page-flow system (lineInkHeight()/
// inkBottomHeight(), near checkPageBreakClassic()) to measure every
// space reservation to the INK bottom of a block's last line.
const HELVETICA_DESCENT_RATIO = 0.207;

// Computes the exact Y distance from a section heading's own baseline
// (the startY passed into renderSectionHeading()) down to the BASELINE
// of the first line of content that will be drawn beneath its divider,
// given the divider's real geometry. This is the SINGLE formula behind
// both the actual rendering in renderSectionHeading() and every
// section's pre-heading checkPageBreakClassic() reservation, so measurement
// and rendering can never disagree (see both call sites below).
//
//   headingInkBottomY  = headingBaselineY                      (see note below — no descent term)
//   dividerTopEdgeY     = headingInkBottomY + DIVIDER_SIDE_GAP_PT
//   dividerBottomEdgeY  = dividerTopEdgeY + SECTION_DIVIDER_THICKNESS
//   contentInkTopY      = dividerBottomEdgeY + DIVIDER_SIDE_GAP_PT + CONTENT_GAP_EXTRA_PT
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
// term has been removed so heading->divider is exactly 1mm, not
// 1mm-plus-a-phantom-descender.
//
// `firstContentFontSize` is the font size of whatever gets drawn
// immediately under the divider (BODY_SIZE for Summary/Skills'
// paragraph text, EXPERIENCE_TITLE_SIZE for every entry-based
// section's title) — passing it in, rather than assuming one size,
// is what makes the divider->content whitespace exact for every
// section instead of merely "at least X" for whichever sections use
// a smaller font.
//
// SPACING UPDATE: the divider->content side of this transition is now
// DIVIDER_SIDE_GAP_PT + CONTENT_GAP_EXTRA_PT (1mm + 2mm = 3mm total),
// while the heading->divider side stays exactly DIVIDER_SIDE_GAP_PT
// (1mm), unchanged. Because both the heading's own position (startY,
// set by the caller) and the divider's position (dividerTopEdgeOffset/
// dividerBottomEdgeOffset below, and the divider's own draw position in
// renderSectionHeading(), which is derived independently from startY
// and HEADING_SIZE) are untouched by CONTENT_GAP_EXTRA_PT, only the
// gap between the divider and the first content line grows — the
// heading and the divider itself do not move.
function sectionHeadingToContentOffset(firstContentFontSize: number): number {
  const dividerTopEdgeOffset = DIVIDER_SIDE_GAP_PT; // heading baseline -> divider top edge (unchanged)
  const dividerBottomEdgeOffset = dividerTopEdgeOffset + SECTION_DIVIDER_THICKNESS;
  const contentInkTopOffset = dividerBottomEdgeOffset + DIVIDER_SIDE_GAP_PT + CONTENT_GAP_EXTRA_PT;
  return contentInkTopOffset + firstContentFontSize * HELVETICA_ASCENT_RATIO;

}

// --- Experience entry spacing (Phase 3) ---
// AUTO-FIT: these three gaps are reused by every entry-based section
// (Experience, Education, Languages, Achievements, Certifications,
// Projects — see the grep-able "reuses EXPERIENCE_ENTRY_GAP" comments
// throughout this file), so they drive a resume's bulk directly and
// are scaled like every other gap here.
const BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP = 3; // job title -> company/dates line
let EXPERIENCE_TITLE_TO_SUBTITLE_GAP = BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
const BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = 6; // company/dates (or title) -> description
let EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
const BASE_EXPERIENCE_ENTRY_GAP = 14; // space between one experience entry and the next
let EXPERIENCE_ENTRY_GAP = BASE_EXPERIENCE_ENTRY_GAP;

// --- Date-column / right-aligned-date layout (image-reference pass) ---
// Reused everywhere a date/year sits beside other text on the same
// line without overlapping it: Education's degree -> year row,
// Achievements' title -> date row (both right-aligned to the page's
// own right margin), and Experience's new left-hand date column (the
// same value doubles as the column's gap there). This is NOT a wrap
// width or column width itself — those are always measured from the
// real text via doc.getTextWidth(), never assumed — it is only the
// small horizontal clearance kept between the date and whatever text
// sits next to it.
// AUTO-FIT: scaled — same reasoning as the entry-gap constants above.
const BASE_DATE_TEXT_GAP_PT = 14;
let DATE_TEXT_GAP_PT = BASE_DATE_TEXT_GAP_PT;

// Safety floor for any wrap width computed as "available width minus a
// measured reservation" (date column, right-aligned date, bullet
// indent). Guards only against a pathological input (e.g. an
// extremely long date string) collapsing a wrap width to zero or
// negative — it is never the normal, expected wrap width.
const MIN_WRAP_WIDTH_PT = 20;

// The bullet marker prefixed to each Experience description line
// (image reference shows the description as a bulleted list, not a
// plain wrapped paragraph).
const BULLET_MARKER = '•';

// Extra horizontal whitespace requested between the bullet dot and its
// text, on top of the marker's own natural "dot + space" width — added
// ONLY to the text side of the gap, never to the dot's own X position
// (see computeBulletTextIndent() below). Expressed through the same
// centralized MM_TO_PT conversion used everywhere else in this file
// (e.g. DIVIDER_SIDE_GAP_PT) — no new unit, no hand-converted decimal.
// AUTO-FIT: scaled — bullet-to-text gap, same reasoning as above.
const BASE_BULLET_TEXT_EXTRA_GAP_PT = 0.4 * MM_TO_PT; // 0.4mm, ≈ 1.1339pt
let BULLET_TEXT_EXTRA_GAP_PT = BASE_BULLET_TEXT_EXTRA_GAP_PT;

// Single source of truth for the bullet-dot -> bullet-text horizontal
// offset, shared by every bulleted section (Experience, Achievements,
// Projects — see addExperienceEntry()/addAchievementEntry()/
// addProjectEntry()). The dot itself is always drawn at the section's
// own unchanged start X (contentX or LEFT_MARGIN); only this offset,
// added to that same X, decides where the bullet TEXT begins. Because
// every section calls this one function instead of re-deriving the
// measurement inline, the extra gap (BULLET_TEXT_EXTRA_GAP_PT above,
// and any future change to it) is guaranteed identical everywhere it's
// used, and the
// dot's own position is never touched by it.
function computeBulletTextIndent(doc: jsPDF): number {
  return doc.getTextWidth(`${BULLET_MARKER} `) + BULLET_TEXT_EXTRA_GAP_PT;
}

// Extra horizontal clearance added ONLY between Experience's date
// column and its content column (title/company/description), on top
// of DATE_TEXT_GAP_PT. Declared as its own constant — deliberately NOT
// merged into DATE_TEXT_GAP_PT — because DATE_TEXT_GAP_PT is shared
// with Education's year-reserve and Achievements' date-reserve
// calculations; widening DATE_TEXT_GAP_PT itself would shrink those
// sections' wrap widths too. This constant is read only inside
// addExperience()'s contentX/contentWidth calculation below, so
// changing it can only ever move Experience's content column — the
// date column (still anchored at LEFT_MARGIN) and every other
// section's spacing stay completely unaffected.
// AUTO-FIT: scaled — same reasoning as the other gap constants above.
const BASE_EXPERIENCE_CONTENT_EXTRA_GAP_PT = 2 * MM_TO_PT; // 2mm, ≈ 5.6693pt
let EXPERIENCE_CONTENT_EXTRA_GAP_PT = BASE_EXPERIENCE_CONTENT_EXTRA_GAP_PT;

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

// Derived (not re-typed) from SKILLS_SEPARATOR above — the leading
// spaces, the bullet dot itself, and the trailing spaces — so addSkills()
// can color just the dot without SKILLS_SEPARATOR ever having two
// separately-maintained copies of the same literal.
const SKILLS_SEPARATOR_DOT_INDEX = SKILLS_SEPARATOR.indexOf('•');
const SKILLS_SEPARATOR_LEADING = SKILLS_SEPARATOR.slice(0, SKILLS_SEPARATOR_DOT_INDEX);
const SKILLS_SEPARATOR_TRAILING = SKILLS_SEPARATOR.slice(SKILLS_SEPARATOR_DOT_INDEX + 1);

// Divider line under the header
const HEADER_RULE_THICKNESS = 0.75; // pt — jsPDF requires an explicit line width

// Universal section-heading divider (added in this phase). Declared as
// its own constant — deliberately NOT aliased to HEADER_RULE_THICKNESS —
// so the Header's divider and the section dividers can never accidentally
// become coupled; they only happen to share the same BASE value because
// that's the intended visual weight for a subtle rule line.
//
// THICKNESS UPDATE: section dividers (NOT the Header's own divider,
// which stays exactly HEADER_RULE_THICKNESS/0.75pt, untouched) are
// now 0.2mm thicker than that shared base weight. The 0.2mm increase
// is expressed via the same centralized MM_TO_PT unit-conversion
// constant already used everywhere else in this file for mm -> pt
// (DIVIDER_SIDE_GAP_PT, CONTENT_GAP_EXTRA_PT) — no new unit, no
// hand-converted decimal literal. Every section divider is drawn via
// the single renderSectionHeading() call site (see below), so this
// one constant change applies uniformly to all of them with no
// per-section branching.
const SECTION_DIVIDER_THICKNESS = 0.75 + 0.2 * MM_TO_PT; // 0.75pt base + 0.2mm (≈0.5669pt) = ≈1.3169pt

// Text colors (RGB, 0-255). Kept as named constants rather than
// scattering setTextColor(r, g, b) calls with unexplained numbers.
//
// --- classicPdf.ts DESIGN SOURCE ---
// Every value below was updated to match the Classic Template design
// reference (ClassicTemplate.tsx) — its actual teal-based color
// system, NOT the earlier placeholder green. Only the RGB VALUES
// changed; every role, every constant name, and everywhere each
// constant is used is exactly as in simplePdf.ts's architecture — no
// new color roles were invented beyond what the reference visually
// requires (see CLASSIC_ACCENT_COLOR and CLASSIC_LINK_COLOR below).
// Nothing here touches thickness, gaps, or geometry.
const COLOR_NAME = [15, 118, 110] as const; // #0f766e — reference's headerAccentColor, used for the Name
const COLOR_TITLE = [13, 148, 136] as const; // #0d9488 — reference's headerTitleColor, used for the Job Title
const COLOR_METADATA = [75, 85, 99] as const; // #4b5563 — reference's muted supporting-text gray (contact line, tech, grade, credential, proficiency); also the company (Experience) / institution (Education) portions of the shared company-dates / institution-year line — the date/year portion of that same line uses CLASSIC_ACCENT_COLOR instead, see below
const COLOR_RULE = [183, 214, 212] as const; // #b7d6d4 — reference's header <hr> is headerAccentColor (#0f766e) at ~0.35 opacity on white; this is that blend, computed once as a flat RGB since jsPDF line strokes here don't use alpha

// Universal section-heading divider color (added in this phase).
//
// COLOR UPDATE: no longer used. Every section divider must render in
// the SAME color as that section's own heading text — and in this
// file every section heading already goes through the single
// centralized CLASSIC_SECTION_HEADING_COLOR (declared below, applied
// once inside renderSectionHeading()), so renderSectionHeading() now
// draws the divider with CLASSIC_SECTION_HEADING_COLOR directly
// instead of this separate, differently-blended constant. That keeps
// "divider color = this section's heading color" true automatically
// and centrally: if CLASSIC_SECTION_HEADING_COLOR is ever changed,
// every section's heading AND its divider move together with no
// second color to update. Left declared (unused) rather than deleted,
// matching this file's existing convention of not removing constants
// outside a phase's scope (see HEADING_TO_CONTENT_GAP above).
const COLOR_SECTION_DIVIDER = [183, 214, 212] as const; // no longer referenced — superseded by CLASSIC_SECTION_HEADING_COLOR, see above

// Reserved for later phases (section headings, body paragraphs).
const COLOR_HEADING = [17, 24, 39] as const; // #111827 — reference's entry-title color (job title, degree, achievement/cert/project name, language name) — section titles, e.g. "PROFESSIONAL SUMMARY"
const COLOR_BODY = [55, 65, 81] as const; // #374151 — reference's Profile/description paragraph color; normal paragraph/body text; also reference's Experience company-name color

// --- classicPdf.ts-only addition ---
// The single centralized color used for section HEADLINE text only
// (e.g. "PROFESSIONAL SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS",
// "LANGUAGES", "ACHIEVEMENTS", "CERTIFICATIONS", "PROJECTS") in the
// Classic template. This is the ONLY visual difference from
// simplePdf.ts: renderSectionHeading() below uses this constant
// instead of COLOR_HEADING for the heading text itself. Every other
// use of COLOR_HEADING in this file (entry titles such as an
// experience job title, education degree, language name, achievement
// title, certification name, or project name — none of which are
// section headings) is left exactly as in simplePdf.ts and keeps
// using COLOR_HEADING, unchanged.
const CLASSIC_SECTION_HEADING_COLOR = [15, 118, 110] as const; // #0f766e — matches the Classic Template reference's own SectionDivider heading color exactly (headerAccentColor)

// --- classicPdf.ts DESIGN SOURCE (additional roles) ---
// Two more colors the reference design uses in ways distinct enough
// from the roles above that reusing an existing constant would be
// wrong, so — per the "only genuinely necessary named design
// constants" rule — exactly two new roles were added:
//
// CLASSIC_ACCENT_COLOR: the reference's headerTitleColor (#0d9488),
// reused wherever the reference colors a field this same accent teal —
// the Achievement and Certification date lines (each its own fully
// isolated line/call, so recoloring needed no wrapping/geometry
// changes), and also the Experience date range and Education year,
// which live INSIDE one combined "Company | Dates" / "Institution |
// Year" string. For those two, the accent color (and, for the year,
// bold weight) is painted onto just that substring of the existing
// line — addExperienceEntry()/addEducationEntry() locate it the same
// way addAchievementEntry() already locates its date substring — with
// no change to the wrapping, line count, or any gap/geometry around
// it. NOTE: the reference also colors the header's website line this
// same accent, but in classicPdf.ts (inherited from simplePdf.ts) the
// website is merged into the single pipe-separated contact line (not
// its own line — buildContactParts()/rule 11 forbids restructuring
// that), so that one stays COLOR_METADATA.
const CLASSIC_ACCENT_COLOR = [13, 148, 136] as const; // #0d9488

// CLASSIC_LINK_COLOR: the reference renders a Project's GitHub link in
// blue. classicPdf.ts already renders GitHub on its own isolated line
// (addProjectEntry's githubLines block), so only its color changes —
// no new line, no new geometry.
const CLASSIC_LINK_COLOR = [37, 99, 235] as const; // #2563eb

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
export interface ClassicPdfPersonalInfo {
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
  website?: string;
  portfolio?: string;
  // Personal GitHub URL/handle for the Contact section — distinct from
  // a Project's own `github` field (ClassicPdfProject.github below),
  // which is unrelated. Same naming-uncertainty fallback as above.
  github?: string;
  githubUrl?: string;
  // Header profile photo, as a data URL (e.g. "data:image/png;base64,...").
  // Optional — the header renders exactly as before when absent.
  photo?: string;
}

export interface ClassicPdfData {
  personalInfo: ClassicPdfPersonalInfo;
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
  experiences?: ClassicPdfExperience[];

  // CONFIRMED against the project's actual EducationItem
  // (src/components/cv-builder/types/cvTypes.ts / EducationSection.tsx):
  // fields used are degree, institution, year (already a combined
  // "start - end" string, not separate startDate/endDate), and grade.
  // There is no location or description field on an education entry,
  // so Phase 4 does not render either (nothing to fabricate).
  educations?: ClassicPdfEducation[];

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
  languages?: ClassicPdfLanguage[];

  // CONFIRMED against the project's actual AchievementItem
  // (src/components/cv-builder/types/cvTypes.ts / AchievementsSection.tsx):
  // fields used are title, date, description. All fields are optional.
  achievements?: ClassicPdfAchievement[];

  // CONFIRMED against the project's actual CertificationItem
  // (src/components/cv-builder/types/cvTypes.ts / CertificationsSection.tsx):
  // fields used are name, date, credentialId. All fields are optional.
  certifications?: ClassicPdfCertification[];

  // CONFIRMED against the project's actual ProjectItem
  // (src/components/cv-builder/types/cvTypes.ts / ProjectsSection.tsx):
  // fields used are name, tech, description, github. All fields are optional.
  projects?: ClassicPdfProject[];

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
export interface ClassicPdfExperience {
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
export interface ClassicPdfEducation {
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
export interface ClassicPdfLanguage {
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
export interface ClassicPdfAchievement {
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
export interface ClassicPdfCertification {
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
export interface ClassicPdfProject {
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
// generateClassicPDF, before knowing whether the next section will
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
//   dividerTopEdgeY     = headingInkBottomY + DIVIDER_SIDE_GAP_PT    (exactly 1mm)
//   dividerCenterY      = dividerTopEdgeY + SECTION_DIVIDER_THICKNESS / 2
//   dividerBottomEdgeY  = dividerTopEdgeY + SECTION_DIVIDER_THICKNESS
//   contentInkTopY      = dividerBottomEdgeY + DIVIDER_SIDE_GAP_PT + CONTENT_GAP_EXTRA_PT   (1mm + 2mm = 3mm)
//   contentBaselineY    = contentInkTopY + firstContentFontSize * HELVETICA_ASCENT_RATIO (returned)
//
// Every term above is either a fixed constant (DIVIDER_SIDE_GAP_PT,
// CONTENT_GAP_EXTRA_PT, SECTION_DIVIDER_THICKNESS, HELVETICA_ASCENT_RATIO)
// or the caller-supplied `firstContentFontSize` — never a content
// measurement (line count, wrapped text height, entry count). Because
// every section's heading goes through this exact function with no
// per-section branching, the divider->content whitespace is
// mathematically guaranteed identical everywhere this is called.
//
// The divider itself is drawn at full content width (LEFT_MARGIN to
// PAGE_WIDTH - RIGHT_MARGIN), matching the Header's own divider width
// convention, using SECTION_DIVIDER_THICKNESS / CLASSIC_SECTION_HEADING_COLOR
// — both declared once, above, and used only here (the divider color
// is the same constant the heading text itself uses, see the
// DIVIDER COLOR FIX comment at the actual draw call below). The stroke is drawn
// at its CENTER Y (jsPDF/PDF strokes are centered on the path), so its
// top and bottom edges — the actual ink boundaries the 1mm gaps are
// measured against — are `thickness / 2` above and below that center.
//
// This function returns the exact BASELINE Y the caller must pass to
// doc.text() for its first content line — not an approximation the
// caller then adjusts. It does NOT apply SECTION_GAP (still the
// caller's responsibility) and does NOT decide page-break placement
// (still checkPageBreakClassic(), called by the caller first, using the same
// sectionHeadingToContentOffset() formula — see each addXxx() section).
//
// `firstContentFontSize` is the font size of whatever the caller is
// about to draw immediately below (BODY_SIZE for a paragraph,
// EXPERIENCE_TITLE_SIZE for an entry title) — required so the 1mm gap
// below the divider is measured against that specific line's real
// ascent, making it exactly 1mm for every section rather than "at
// least 1mm" for whichever sections happen to use a smaller font.
// ====================================================================
function renderSectionHeading(
  doc: jsPDF,
  headingText: string,
  startY: number,
  firstContentFontSize: number
): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(HEADING_SIZE);
  // classicPdf.ts-only change: section headline text uses the
  // centralized Classic green instead of COLOR_HEADING. This is the
  // ONLY color changed anywhere in this file (see
  // CLASSIC_SECTION_HEADING_COLOR above for the full explanation).
  doc.setTextColor(...CLASSIC_SECTION_HEADING_COLOR);

  // --- Reproduce the Classic Template reference's actual divider
  // style: a leader-line on EACH SIDE of the heading text, all on the
  // heading's own row ("line — HEADING — line"), instead of a
  // left-aligned heading with one full-width rule below it.
  //
  // This only changes what gets drawn ON the heading's row (X-axis).
  // startY (the heading's own baseline) and
  // sectionHeadingToContentOffset() (the vertical gap down to the
  // section's content) are BOTH completely untouched below — the
  // amount of vertical space before the next content stays exactly
  // what it always was; only its content changed from "a line" to
  // "nothing" (the flanking lines already occupy the heading's row).
  //
  // Every value used for the new horizontal layout is an EXISTING
  // constant, reused rather than invented (per the "reuse before
  // inventing" rule):
  //  - CONTENT_WIDTH: already the row's total available width.
  //  - DIVIDER_SIDE_GAP_PT: already exists elsewhere as a small
  //    (1mm) clearance constant; reused here as the horizontal gap
  //    between each leader-line and the heading text — same "small
  //    clearance" role, just applied on the horizontal axis instead
  //    of the vertical one. (This is smaller than the reference's own
  //    CSS gap, which per the master rule is never copied directly.)
  //  - HELVETICA_ASCENT_RATIO: already exists to convert a font size
  //    into a cap-height/ascent distance; reused here to vertically
  //    center the leader-lines on the heading text's own cap-height,
  //    instead of inventing a new vertical offset.
  const textWidth = doc.getTextWidth(headingText);
  const sideLineWidth = Math.max(0, (CONTENT_WIDTH - textWidth - 2 * DIVIDER_SIDE_GAP_PT) / 2);
  const textX = LEFT_MARGIN + sideLineWidth + DIVIDER_SIDE_GAP_PT;
  const lineY = startY - (HEADING_SIZE * HELVETICA_ASCENT_RATIO) / 2;

  if (sideLineWidth > 0) {
    // DIVIDER COLOR FIX: reuse the exact same centralized color this
    // heading was just drawn with (see doc.setTextColor(...) above),
    // instead of the separate COLOR_SECTION_DIVIDER constant, so each
    // section's divider always matches that section's own heading
    // color — automatically, for every section, with no per-section
    // color literal.
    doc.setDrawColor(...CLASSIC_SECTION_HEADING_COLOR);
    doc.setLineWidth(SECTION_DIVIDER_THICKNESS);
    doc.line(LEFT_MARGIN, lineY, LEFT_MARGIN + sideLineWidth, lineY);
    doc.line(textX + textWidth + DIVIDER_SIDE_GAP_PT, lineY, PAGE_WIDTH - RIGHT_MARGIN, lineY);
  }

  doc.text(headingText, textX, startY);

  // --- Content baseline: exactly the same vertical gap as before —
  // only the heading row's own visual content changed, not the
  // distance to whatever comes after it. ---
  return startY + sectionHeadingToContentOffset(firstContentFontSize);
}

// ====================================================================
// RENDER (ONCE, AT WHATEVER SCALE IS CURRENTLY SET)
// This is the file's original entry point, renamed and no longer
// exported: it renders exactly one full pass of the resume at
// whichever scale recomputeScaledConstants() (see AUTO-FIT-TO-ONE-PAGE,
// near the bottom of this file) last set. The exported entry point
// below (generateClassicPDF()) is the auto-fit driver — it calls this
// function once or several times at different scales and decides which
// result to return. The rendering sequence itself is completely
// unchanged from before auto-fit was added.
// ====================================================================
function renderClassicPDFOnce(data: ClassicPdfData): {
  doc: jsPDF;
  pageCount: number;
  lastPageContentHeight: number;
} {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  // ROOT-CAUSE PLACEMENT: this is the single shared top-level starting
  // point every section (starting with the header) flows from. Adding
  // the photo-only top spacing HERE — once, before any element is
  // drawn — is what lets the entire existing header/content flow shift
  // down together as a unit, rather than requiring individual +3mm
  // offsets scattered across Name/Job Title/Contact/Image (which would
  // risk drifting their internal gaps apart). The condition reflects
  // actual data, not an assumption: a CV with no photo produces
  // hasPhoto === false and this constant is never added, so that flow
  // renders at exactly TOP_MARGIN, unchanged from before.
  const hasPhoto = !!(data.personalInfo?.photo || '').trim();
  let y = TOP_MARGIN + (hasPhoto ? PHOTO_TOP_SPACING_PT : 0);

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

// Detects the image format doc.addImage() needs from a data URL's MIME
// type (e.g. "data:image/png;base64,..."). Falls back to 'JPEG' — the
// most common upload format — if the MIME type is missing/unrecognized,
// rather than throwing.
function getPhotoImageFormat(photoDataUrl: string): string {
  const match = /^data:image\/([a-z0-9+.-]+)/i.exec(photoDataUrl.trim());
  const subtype = (match?.[1] || '').toLowerCase();
  if (subtype === 'png') return 'PNG';
  if (subtype === 'webp') return 'WEBP';
  return 'JPEG'; // covers jpeg/jpg and any unrecognized subtype
}

// ====================================================================
// HEADER SECTION (Phase 1)
// Renders: name, job title (optional), contact line (optional), and
// (new) an optional circular profile photo, top-right, level with the
// Name + Job Title block.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addHeader(doc: jsPDF, data: ClassicPdfData, startY: number): number {
  let y = startY;
  const { personalInfo, phoneNumber, selectedCountryCode } = data;

  const name = (personalInfo?.name || '').trim() || 'Your Name';
  const jobTitle = (personalInfo?.title || personalInfo?.jobTitle || '').trim();
  const photo = (personalInfo?.photo || '').trim();
  const hasPhoto = !!photo;

  // --- Name (baseline computed here; DRAWN after the Job Title block
  // below, because its final Y depends on the Job Title -> Contact gap) ---
  const nameBaselineY = hasPhoto ? y : y + NO_IMAGE_NAME_Y_OFFSET_PT;
  y += NAME_SIZE; // move past the line's own height — unaffected by the no-image offset, so Contact/divider/photo math below stay exactly where they were
  y += NAME_TO_TITLE_GAP;

  // --- Job title (optional) ---
  let jobTitleBaselineY: number | null = null;
  if (jobTitle) {
    jobTitleBaselineY = hasPhoto ? y : y + NO_IMAGE_TITLE_Y_OFFSET_PT;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(TITLE_SIZE);
    doc.setTextColor(...COLOR_TITLE);
    doc.text(jobTitle, LEFT_MARGIN, jobTitleBaselineY);
    y += TITLE_SIZE;
    y += TITLE_TO_CONTACT_GAP;
  }

  // --- Name draw ---
  // NAME -> JOB TITLE GAP = the CURRENT JOB TITLE -> CONTACT GAP, with
  // no extra spacing added anywhere.
  //
  // "Gap" here is the VISIBLE whitespace between two consecutive header
  // lines: from the upper line's baseline down to the top of the lower
  // line's glyphs (lower baseline minus lower font size *
  // HELVETICA_ASCENT_RATIO — the same ink-top convention this file
  // already uses, e.g. in the header/section-heading geometry). Both
  // pairs are measured the identical way, from the header's real
  // baselines:
  //   Job Title -> Contact gap = (Contact baseline - METADATA_SIZE *
  //     ASCENT) - Job Title baseline. `y` is at the Contact baseline
  //     here; nothing about Job Title/Contact is changed.
  // The Name's baseline is then placed so (Job Title ink top - Name
  // baseline) equals that same gap. Only the Name's own Y is derived
  // from this; Job Title, Contact and the photo (whose centering reads
  // the ORIGINAL startY/nameBaselineY) do not move. Without a Job Title
  // there is no gap to match, so the Name stays put.
  const titleToContactVisibleGap = jobTitleBaselineY !== null
    ? (y - METADATA_SIZE * HELVETICA_ASCENT_RATIO) - jobTitleBaselineY
    : 0;
  const nameDrawY = jobTitleBaselineY !== null
    ? (jobTitleBaselineY - TITLE_SIZE * HELVETICA_ASCENT_RATIO) - titleToContactVisibleGap
    : nameBaselineY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(NAME_SIZE);
  doc.setTextColor(...COLOR_NAME);
  doc.text(name, LEFT_MARGIN - NAME_X_SHIFT_LEFT_PT - NAME_X_EXTRA_SHIFT_LEFT_PT, nameDrawY);

  // --- Profile photo (optional), top-right, exactly opposite the
  // Name + Job Title block on the left. ---
  //
  // HORIZONTAL: right edge flush with the page's own right margin —
  // the same LEFT_MARGIN/RIGHT_MARGIN boundary every other header/
  // divider element in this file is measured against (e.g. the header
  // rule below spans LEFT_MARGIN to PAGE_WIDTH - RIGHT_MARGIN).
  //
  // VERTICAL: centered on the Name + Job Title block using only
  // values already computed in this function — startY (the block's
  // top, i.e. the same reference the Name's own baseline is drawn at)
  // and the last-drawn line's baseline (Job Title's if present, else
  // Name's) as the block's bottom. No new arbitrary offset.
  // Photo's left edge (its real, drawn geometry: right-margin-flush,
  // PHOTO_SIZE wide). Declared outside the photo block so the Contact
  // line below can derive its right boundary from it.
  const photoX = PAGE_WIDTH - RIGHT_MARGIN - PHOTO_SIZE;

  if (photo) {
    const headerBlockTopY = startY;
    const headerBlockBottomY = jobTitleBaselineY !== null ? jobTitleBaselineY : nameBaselineY;
    const headerBlockCenterY = (headerBlockTopY + headerBlockBottomY) / 2;

    // GAP FIX (Image <-> Contact): the photo's BOTTOM edge is the
    // single anchor that controls how much whitespace sits between the
    // photo and the Contact line below it. That anchor is computed
    // here using PHOTO_SIZE_BASE (the fixed, pre-increase diameter —
    // see its declaration above), NOT PHOTO_SIZE (the current, drawn
    // diameter), so this value is now completely independent of
    // whatever PHOTO_SIZE happens to be. This is exactly the same
    // "vertically centered on the Name + Job Title block, then shifted
    // upward by PHOTO_VERTICAL_OFFSET_PT" formula this file already
    // used — only the size term feeding it is now fixed rather than
    // growing — so it reproduces the exact original (pre-+7px) bottom
    // position, and therefore the exact original Image <-> Contact
    // gap, byte for byte.
    const photoBottomY = headerBlockCenterY + PHOTO_SIZE_BASE / 2 - PHOTO_VERTICAL_OFFSET_PT + PHOTO_DOWN_SHIFT_PT + PHOTO_EXTRA_DOWN_SHIFT_PT + PHOTO_FINAL_DOWN_SHIFT_PT;
    // The top edge is then derived FROM that fixed bottom anchor and
    // the actual drawn size (PHOTO_SIZE), rather than the previous
    // center-based formula deriving both edges from PHOTO_SIZE at
    // once. Practical effect: the requested +7pt now extends the photo
    // upward only — away from Contact, not into it — which is what
    // keeps the Image <-> Contact gap fixed while the image still
    // grows by exactly 7pt overall.
    const photoY = photoBottomY - PHOTO_SIZE;
    const photoRadius = PHOTO_SIZE / 2;
    const photoCenterX = photoX + photoRadius;
    const photoCenterY = photoY + photoRadius;

    // Aspect ratio is preserved (no distortion) via a "cover" fit: the
    // image is scaled so its shorter side exactly fills the circle's
    // diameter, and centered so the circular clip crops the longer
    // side evenly on both sides. Same non-distorting method used for
    // the header photo elsewhere in this codebase — PHOTO_SIZE is
    // still the only size input, nothing new is introduced.
    const imgProps = doc.getImageProperties(photo);
    const imgAspect = imgProps.width / imgProps.height;
    const drawWidth = imgAspect >= 1 ? PHOTO_SIZE * imgAspect : PHOTO_SIZE;
    const drawHeight = imgAspect >= 1 ? PHOTO_SIZE : PHOTO_SIZE / imgAspect;
    const drawX = photoX - (drawWidth - PHOTO_SIZE) / 2;
    const drawY = photoY - (drawHeight - PHOTO_SIZE) / 2;

    // Circular clip via jsPDF's native path/clip API (no new library,
    // no canvas hacks): draw the circle as an unpainted path, clip to
    // it, discard the path so it isn't stroked/filled, then draw the
    // image — only the circular region of it ends up visible.
    doc.saveGraphicsState();
    doc.circle(photoCenterX, photoCenterY, photoRadius, null);
    doc.clip();
    doc.discardPath();
    doc.addImage(photo, getPhotoImageFormat(photo), drawX, drawY, drawWidth, drawHeight);
    doc.restoreGraphicsState();
  }

  // --- Contact line (email | phone | location | linkedin | website) ---
  const contactParts = buildContactParts(personalInfo, phoneNumber, selectedCountryCode);
  // Header divider is drawn only when at least one non-empty contact value
  // exists (mirrors ClassicTemplate.tsx's hasContact).
  const hasContact = contactParts.some(Boolean);
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
    // ever dropped or clipped. Consecutive contact lines are exactly
    // BODY_LINE_HEIGHT apart (the same normal body/content-line spacing
    // Professional Summary uses), for any number of lines.
    // With a photo, the Contact's right boundary is the photo's left edge
    // minus CONTACT_PHOTO_SAFETY_GAP_PT; without one, the full content width.
    const contactRight = hasPhoto
      ? photoX - CONTACT_PHOTO_SAFETY_GAP_PT
      : LEFT_MARGIN + CONTENT_WIDTH;
    const contactWidth = contactRight - LEFT_MARGIN;
    const itemGap = doc.getTextWidth(SKILLS_SEPARATOR);

    let lineCount = 1;
    let cursorX = LEFT_MARGIN;
    let contactLineY = y;
    const startNewLine = () => {
      lineCount += 1;
      cursorX = LEFT_MARGIN;
      contactLineY += BODY_LINE_HEIGHT;
    };

    for (const part of contactParts) {
      const itemWidth = doc.getTextWidth(part);

      if (itemWidth > contactWidth) {
        // Oversized single item: gets its own wrapped lines.
        if (cursorX > LEFT_MARGIN) startNewLine();
        const wrapped: string[] = doc.splitTextToSize(part, contactWidth);
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

  y += HEADER_RULE_GAP;

  // --- BUG FIX (same issue as renderSectionHeading(), inherited from
  // simplePdf.ts): HEADER_RULE_THICKNESS was declared and this exact Y
  // position was already reserved (HEADER_RULE_GAP above), but no line
  // was ever actually drawn here. Drawing it now at the already-reserved
  // y — no new gap, no new coordinate.
  //
  // COLOR FIX: this divider now reuses CLASSIC_SECTION_HEADING_COLOR —
  // the SAME centralized constant every section divider and every
  // section heading is already drawn with (see renderSectionHeading()
  // above) — instead of the separate, lighter COLOR_RULE constant, so
  // the header's own divider matches the color of every other divider
  // and headline in the document exactly, with no new color introduced.
  //
  // The y position stays reserved either way so spacing below the header
  // never shifts; the line itself is only stroked when contact info exists.
  if (hasContact) {
    doc.setDrawColor(...CLASSIC_SECTION_HEADING_COLOR);
    doc.setLineWidth(HEADER_RULE_THICKNESS);
    doc.line(LEFT_MARGIN, y, PAGE_WIDTH - RIGHT_MARGIN, y);
  }

  // HEADER DIVIDER -> PROFESSIONAL SUMMARY GAP FIX (root cause, verified
  // against actual rendered coordinates, not just code comparison):
  //
  // The previous version of this comment claimed no other section bakes
  // any extra trailing space into its own return value, and that
  // SECTION_GAP alone is always the full gap. That claim is false — every
  // OTHER addXxx() section in this file (see "SECTION-GAP ARCHITECTURE"
  // above addSummary()) returns its last content BASELINE plus a full
  // BODY_LINE_HEIGHT, not the bare baseline:
  //   - addSummary()/every wrapped-paragraph ending: each line already
  //     advances by `y += BODY_LINE_HEIGHT`, so the returned y IS
  //     lastBaselineY + BODY_LINE_HEIGHT.
  //   - Every entry-based section ending on a short metadata line calls
  //     topUpToLineHeight(y, lastLineFontSize), which — since y is already
  //     lastBaselineY + lastLineFontSize at that point — algebraically
  //     reduces to lastBaselineY + BODY_LINE_HEIGHT too.
  // So the real invariant this file relies on is:
  //     nextHeadingBaselineY = (prevBaselineY + BODY_LINE_HEIGHT) + SECTION_GAP
  // i.e. every normal transition is BODY_LINE_HEIGHT + SECTION_GAP apart,
  // not SECTION_GAP alone. Returning the divider's raw y here (as the
  // previous fix did) skipped that BODY_LINE_HEIGHT top-up entirely, so
  // Header -> Summary ended up only SECTION_GAP apart — visibly tighter
  // than every other section-to-section gap. Confirmed by instrumenting
  // an actual render: divider->heading baseline delta was 20pt (bare
  // SECTION_GAP) versus 34.7pt (BODY_LINE_HEIGHT + SECTION_GAP) for a
  // normal transition in the same PDF.
  //
  // Fix: reuse the SAME topUpToLineHeight() helper every other section
  // already uses for this exact purpose, treating the just-drawn divider
  // like a zero-height line (it has no font size of its own) so it gets
  // topped up to the identical BODY_LINE_HEIGHT rhythm before the next
  // section's own SECTION_GAP is added on top — no new constant, no
  // magic number, the existing centralized mechanism only.
  return topUpToLineHeight(y, 0);
}

// Plain-text labels shown before each contact value — identical to the
// labels ClassicTemplate.tsx (live preview) and atsProPdf.ts render. The
// label is part of the part's text, so the contact line's measuring/
// wrapping and drawing treat label + value as ONE string; that is what
// keeps the PDF's per-line content identical to the preview.
const CONTACT_LABELS = {
  email: 'Email: ',
  phone: 'Phone: ',
  location: 'Location: ',
  address: 'Address: ',
  linkedin: 'LinkedIn: ',
  website: 'Portfolio URL: ',
  github: 'GitHub: ',
} as const;

// Builds the list of non-empty contact details, in display order.
function buildContactParts(
  personalInfo: ClassicPdfPersonalInfo,
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

  const webLink = personalInfo?.website || personalInfo?.portfolio;
  if (webLink) {
    parts.push(`${CONTACT_LABELS.website}${webLink.trim()}`);
  }

  // GitHub URL (new): same treatment as every other optional contact
  // part — pushed only when non-empty, rendered using the actual
  // user-provided value, and merged into the same pipe-separated
  // contact line/typography/measurement flow as everything else here.
  const githubUrl = personalInfo?.github || personalInfo?.githubUrl;
  if (githubUrl) {
    parts.push(`${CONTACT_LABELS.github}${githubUrl.trim()}`);
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
function addSummary(doc: jsPDF, data: ClassicPdfData, startY: number): number {
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
  y = checkPageBreakClassic(doc, y, minimumSpaceNeeded);

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
    y = checkPageBreakClassic(doc, y, lineInkHeight(BODY_SIZE));
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
function addExperience(doc: jsPDF, data: ClassicPdfData, startY: number): number {
  const experiences = (data.experiences || []).filter(hasUsableExperienceContent);

  if (experiences.length === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this one.
  y += SECTION_GAP;

  // --- Date column width (image-reference two-column layout) ---
  // Measured, not hardcoded: the widest rendered date-range string
  // across every usable entry in this section, at the exact font/size
  // the date is actually drawn in (see addExperienceEntry() below).
  // Sizing the column to the real widest date — rather than a guessed
  // fixed width — guarantees every entry's date always fits on its own
  // single line with no wrap, and every entry's right-hand content
  // column starts at the exact same X, keeping the two-column layout
  // aligned down the whole section regardless of how long any one
  // entry's dates happen to be.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateColumnWidth = experiences.reduce((maxWidth, exp) => {
    const startDate = (exp.startDate || '').trim();
    const endDate = (exp.endDate || '').trim();
    const dateRange = `${startDate || 'Start'} – ${endDate || 'Present'}`;
    return Math.max(maxWidth, doc.getTextWidth(dateRange));
  }, 0);
  const contentX = LEFT_MARGIN + dateColumnWidth + DATE_TEXT_GAP_PT + EXPERIENCE_CONTENT_EXTRA_GAP_PT;
  const contentWidth = Math.max(
    MIN_WRAP_WIDTH_PT,
    CONTENT_WIDTH - dateColumnWidth - DATE_TEXT_GAP_PT - EXPERIENCE_CONTENT_EXTRA_GAP_PT
  );

  // ROOT-CAUSE FIX — this guard used to reserve only "heading + one
  // line" as a stand-in for "the first entry", regardless of what that
  // entry actually contained. A real first entry is usually MORE than
  // one line, so the heading could pass this check, render at the
  // bottom of the page, and then the first entry's OWN (correctly-sized)
  // checkPageBreakClassic() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateExperienceEntryMinimumHeight() addExperienceEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateExperienceEntryMinimumHeight(doc, experiences[0], contentWidth);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
  y = checkPageBreakClassic(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'EXPERIENCE', y, EXPERIENCE_TITLE_SIZE);

  // --- Entries ---
  experiences.forEach((exp, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }
    y = addExperienceEntry(doc, exp, y, contentX, contentWidth);
  });

  return y;
}

// An entry counts as "usable" if it has ANY content worth printing —
// this mirrors the empty-summary rule from Phase 2: don't render a
// heading for entries that are entirely blank placeholders.
function hasUsableExperienceContent(exp: ClassicPdfExperience | null | undefined): boolean {
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
// (title + company + FULL wrapped bulleted description; the date sits
// in its own column on the entry's first line and adds no height),
// without drawing anything, measured from the entry's first baseline
// down to the ink bottom of its last line (see inkBottomHeight()). Used
// by addExperienceEntry() itself for its own checkPageBreakClassic()
// call AND by addExperience() to size its heading-guard against the
// REAL first entry instead of a generic one-line guess — see the
// ROOT-CAUSE FIX note on that guard. Single source of truth, so the
// estimate and the entry's own render can never disagree: it wraps the
// description at the same contentWidth/bullet-indent the render uses
// and mirrors, step for step, the advances addExperienceEntry()
// applies.
//
// An entry that fits on a single page must move to the next page as a
// WHOLE; an entry taller than a full page can never do that, so it is
// reserved only up to its header plus first description line and its
// remaining lines flow across pages (see keepTogetherHeight()).
function estimateExperienceEntryMinimumHeight(
  doc: jsPDF,
  exp: ClassicPdfExperience,
  contentWidth: number
): number {
  const title = (exp.title || '').trim();
  const company = (exp.company || '').trim();
  const description = (exp.description || '').trim();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const bulletIndent = computeBulletTextIndent(doc);
  const bulletWrapWidth = Math.max(MIN_WRAP_WIDTH_PT, contentWidth - bulletIndent);
  const descriptionLineCount = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim().replace(/^[•\-*]\s*/, '');
          return trimmedLine ? doc.splitTextToSize(trimmedLine, bulletWrapWidth) : [];
        })
        .length
    : 0;

  const titleToSubtitleGap = title && company ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;
  const headerHeight =
    (title ? EXPERIENCE_TITLE_SIZE : 0) +
    titleToSubtitleGap +
    (company ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const hasHeaderLine = Boolean(title || company);
  const hasDescription = descriptionLineCount > 0;
  const descriptionGap = hasHeaderLine && hasDescription ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP : 0;
  const descriptionTotalHeight = descriptionLineCount * BODY_LINE_HEIGHT;
  const firstDescriptionLineHeight = hasDescription ? BODY_LINE_HEIGHT : 0;

  // Without a title/company the date column itself still needs one
  // line (or, when a description exists, the description starts on
  // the date's own baseline and adds only its own lines).
  const fullHeight = hasHeaderLine
    ? headerHeight + descriptionGap + descriptionTotalHeight
    : (hasDescription ? descriptionTotalHeight : EXPERIENCE_SUBTITLE_SIZE);
  const leadHeight = hasHeaderLine
    ? headerHeight + descriptionGap + firstDescriptionLineHeight
    : (hasDescription ? firstDescriptionLineHeight : EXPERIENCE_SUBTITLE_SIZE);

  const lastLineFontSize = hasDescription ? BODY_SIZE
    : company ? EXPERIENCE_SUBTITLE_SIZE
    : title ? EXPERIENCE_TITLE_SIZE
    : EXPERIENCE_SUBTITLE_SIZE;
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSize;

  return keepTogetherHeight(
    inkBottomHeight(fullHeight, lastLineAdvance, lastLineFontSize),
    hasDescription
      ? inkBottomHeight(leadHeight, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(fullHeight, lastLineAdvance, lastLineFontSize)
  );
}

// Renders a single experience entry and returns the new Y position.
//
// IMAGE-REFERENCE TWO-COLUMN LAYOUT: the date range now renders in its
// own left-hand column (contentX/contentWidth, computed once for the
// whole section by addExperience() from the real widest date — see
// there), aligned to this entry's very first line, while title/company/
// description all render in the right-hand content column starting at
// contentX. The date is drawn as one unwrapped doc.text() call sized to
// exactly the measured column width, so it is guaranteed to stay on a
// single line and never wrap. The description renders as a hanging-
// indent bullet list wrapped to contentWidth (minus the bullet's own
// measured indent), so bullet text never overflows past the right
// margin.
function addExperienceEntry(
  doc: jsPDF,
  exp: ClassicPdfExperience,
  startY: number,
  contentX: number,
  contentWidth: number
): number {
  let y = startY;

  const title = (exp.title || '').trim();
  const company = (exp.company || '').trim();
  const startDate = (exp.startDate || '').trim();
  const endDate = (exp.endDate || '').trim();
  const description = (exp.description || '').trim();

  // Date format matches the Classic Template reference exactly: always
  // "Start – Present" with those literal fallback words when a date is
  // missing (ClassicTemplate.tsx: `${exp.startDate || 'Start'} – ${exp.endDate || 'Present'}`),
  // instead of silently omitting a missing side. 'Start' and 'Present'
  // are content strings the reference itself displays, not layout
  // hardcodes. Unlike before, this no longer shares a line with
  // company — it now renders alone in the left date column.
  const dateRange = `${startDate || 'Start'} – ${endDate || 'Present'}`;

  // Bullet indent: measured, not hardcoded — the width of the marker
  // plus one space, at the exact font/size the description text is
  // drawn in, so bullet text always lines up the same distance from
  // its marker regardless of font metrics.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const bulletIndent = computeBulletTextIndent(doc);
  const bulletWrapWidth = Math.max(MIN_WRAP_WIDTH_PT, contentWidth - bulletIndent);

  // The description textarea allows the user to type their own line
  // breaks (e.g. one line per responsibility). Each manual line becomes
  // one bullet point (matching the reference image's bulleted list) —
  // any bullet/dash marker the user already typed is stripped first
  // (same convention as parseSkillsList()'s bullet-stripping) so it
  // isn't doubled. Continuation lines produced by wrapping keep the
  // marker's hanging indent but get no marker of their own.
  const descriptionBulletLines: { text: string; isStart: boolean }[] = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim().replace(/^[•\-*]\s*/, '');
          if (!trimmedLine) {
            return [];
          }
          return doc
            .splitTextToSize(trimmedLine, bulletWrapWidth)
            .map((line: string, idx: number) => ({ text: line, isStart: idx === 0 }));
        })
    : [];

  // --- Determine how much space this ENTIRE entry needs — header
  // (title + company) AND every wrapped description line, not just the
  // first — so the whole entry moves to a new page together rather
  // than splitting mid-entry (a job title separated from its own
  // company or bullets). Computed via the shared
  // estimateExperienceEntryMinimumHeight() (see its own comment above
  // addExperienceEntry) rather than inline here, so this entry's own
  // page-break check and addExperience()'s heading-guard (which
  // estimates the section's FIRST entry the same way) can never drift
  // out of parity with each other. ---
  const hasHeaderLine = Boolean(title || company);
  const minimumEntrySpaceNeeded = estimateExperienceEntryMinimumHeight(doc, exp, contentWidth);
  y = checkPageBreakClassic(doc, y, minimumEntrySpaceNeeded);

  // --- Date (left column) ---
  // Drawn once, at this entry's very first line, in the exact column
  // width the caller measured from the section's real widest date —
  // so it is never wrapped and can never spill onto a second line.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  doc.setTextColor(...CLASSIC_ACCENT_COLOR);
  doc.text(dateRange, LEFT_MARGIN, y);

  // --- Job title (right column) ---
  if (title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(title, contentX, y);
    y += EXPERIENCE_TITLE_SIZE;
    if (company) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Company (own line, right column — no date attached anymore,
  // matching the reference image's title / company / bullets stack) ---
  if (company) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_BODY);
    doc.text(company, contentX, y);
    y += EXPERIENCE_SUBTITLE_SIZE;
  }

  // PHASE 5.1 FIX (still applies): this gap is the space BETWEEN the
  // header (title/company) and the description, so it must only apply
  // when a description actually follows.
  if (hasHeaderLine && descriptionBulletLines.length > 0) {
    y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
  }

  // --- Description (right column, bulleted, hanging indent) ---
  if (descriptionBulletLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);

    for (const item of descriptionBulletLines) {
      y = checkPageBreakClassic(doc, y, lineInkHeight(BODY_SIZE));
      if (item.isStart) {
        // BULLET DOT COLOR FIX: the dot reuses the same centralized
        // heading/accent color every section heading is drawn with
        // (CLASSIC_SECTION_HEADING_COLOR, set inside
        // renderSectionHeading()) instead of COLOR_BODY, so it always
        // matches its section's heading color automatically — no new
        // color constant, no per-section branching. Only the dot's
        // color changes here; the bullet TEXT right after it keeps
        // COLOR_BODY on the very next line, unchanged.
        doc.setTextColor(...CLASSIC_SECTION_HEADING_COLOR);
        doc.text(BULLET_MARKER, contentX, y);
      }
      doc.setTextColor(...COLOR_BODY);
      doc.text(item.text, contentX + bulletIndent, y);
      y += BODY_LINE_HEIGHT;
    }
  }

  // Same trailing-space parity applied to every Education entry (see
  // the comment inside addEducationEntry() for the full analysis) — it
  // applies here whenever THIS entry ends on a metadata line, whether
  // or not it's the section's last entry. An entry-to-entry gap
  // (EXPERIENCE_ENTRY_GAP, added by the caller) sits on top of whatever
  // y this function returns, exactly like SECTION_GAP does for the
  // section after it.
  if (descriptionBulletLines.length === 0) {
    if (hasHeaderLine) {
      const lastLineFontSize = company ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE;
      y = topUpToLineHeight(y, lastLineFontSize);
    } else {
      // Entry has only a date (no title, company, or description) —
      // still advance and normalize by one date-column line so the
      // next entry/section doesn't overlap it.
      y += EXPERIENCE_SUBTITLE_SIZE;
      y = topUpToLineHeight(y, EXPERIENCE_SUBTITLE_SIZE);
    }
  }

  return y;
}

// ====================================================================
// EDUCATION SECTION (Phase 4, refined in Phase 5.1)
// Renders: "EDUCATION" heading, then one block per entry:
//   Degree / Program
//   Institution   |   Year
//   Grade (optional, rendered with a "Grade: " label, matching the reference)
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
function addEducation(doc: jsPDF, data: ClassicPdfData, startY: number): number {
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
  // checkPageBreakClassic() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateEducationEntryMinimumHeight() addEducationEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateEducationEntryMinimumHeight(doc, educations[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
  y = checkPageBreakClassic(doc, y, headingSpaceNeeded);

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
function hasUsableEducationContent(edu: ClassicPdfEducation | null | undefined): boolean {
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
// (degree + institution + year + FULL wrapped grade), without drawing
// anything, measured from the entry's first baseline down to the ink
// bottom of its last line (see inkBottomHeight()). Used by
// addEducationEntry() itself for its own checkPageBreakClassic() call
// AND by addEducation() to size its heading-guard against the REAL
// first entry instead of a generic one-line guess — see the ROOT-CAUSE
// FIX note on that guard. Single source of truth, so the estimate and
// the entry's own render can never disagree: it wraps every field at
// the same width the render uses and mirrors, step for step, the
// advances addEducationEntry() applies.
function estimateEducationEntryMinimumHeight(doc: jsPDF, edu: ClassicPdfEducation): number {
  const degree = (edu.degree || '').trim();
  const institution = (edu.institution || '').trim();
  const year = (edu.year || '').trim();
  const grade = (edu.grade || '').trim();
  const gradeText = grade ? `Grade: ${grade}` : '';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const yearWidth = year ? doc.getTextWidth(year) : 0;
  const yearReserve = year ? yearWidth + DATE_TEXT_GAP_PT : 0;
  const yearOnDegreeLine = Boolean(degree);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const degreeWrapWidth = year && yearOnDegreeLine
    ? Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - yearReserve)
    : CONTENT_WIDTH;
  const degreeLines: string[] = degree ? doc.splitTextToSize(degree, degreeWrapWidth) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const institutionWrapWidth = year && !yearOnDegreeLine
    ? Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - yearReserve)
    : CONTENT_WIDTH;
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, institutionWrapWidth) : [];
  const gradeLines: string[] = gradeText ? doc.splitTextToSize(gradeText, CONTENT_WIDTH) : [];

  const degreeHeight = degreeLines.length * EXPERIENCE_TITLE_SIZE;
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

  const titleToSubtitleGap = degreeLines.length > 0 && institutionLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const headerHeight = degreeHeight + titleToSubtitleGap + institutionSpaceNeeded;
  const hasHeaderContent = degreeLines.length > 0 || institutionLines.length > 0;
  const yearAloneHeight = !hasHeaderContent && year ? EXPERIENCE_SUBTITLE_SIZE : 0;
  const headerToGradeGap = institutionLines.length === 0 && (hasHeaderContent || yearAloneHeight > 0) && gradeLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const gradeHeight = gradeLines.length * EXPERIENCE_SUBTITLE_SIZE;

  const fullHeight = headerHeight + yearAloneHeight + headerToGradeGap + gradeHeight;
  const lastLineFontSize = (gradeLines.length > 0 || institutionLines.length > 0)
    ? EXPERIENCE_SUBTITLE_SIZE
    : (hasHeaderContent ? EXPERIENCE_TITLE_SIZE : EXPERIENCE_SUBTITLE_SIZE);
  const inkHeight = inkBottomHeight(fullHeight, lastLineFontSize, lastLineFontSize);
  return keepTogetherHeight(inkHeight, inkHeight);
}

// Renders a single education entry and returns the new Y position,
// normalized so every entry (not just the section's last one) ends on
// an equivalent trailing space — see the TRAILING-SPACE PARITY comment
// near the end of this function.
function addEducationEntry(
  doc: jsPDF,
  edu: ClassicPdfEducation,
  startY: number
): number {
  let y = startY;

  const degree = (edu.degree || '').trim();
  const institution = (edu.institution || '').trim();
  const year = (edu.year || '').trim();
  const grade = (edu.grade || '').trim();

  // Matches the Classic Template reference's grade content design,
  // which renders a "Grade: " label in front of the value
  // (ClassicTemplate.tsx: `Grade: {safeText(edu.grade)}`), instead of
  // the value alone with no label.
  const gradeText = grade ? `Grade: ${grade}` : '';

  // --- Year: measured, not hardcoded, and right-aligned to the page's
  // own right margin on whichever field ends up first (degree if
  // present, else institution) — matching the reference image's
  // degree/institution ... year row, instead of the year trailing the
  // institution text inline on the same combined line.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const yearWidth = year ? doc.getTextWidth(year) : 0;
  const yearReserve = year ? yearWidth + DATE_TEXT_GAP_PT : 0;
  const yearOnDegreeLine = Boolean(degree);

  // Wrap each field independently (degree, institution, grade can each
  // be long) using the PDF library's existing wrapping capability, the
  // same way addExperienceEntry() wraps its description text. Whichever
  // field the year sits beside wraps to a narrower width so the year
  // never overlaps it.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const degreeWrapWidth = year && yearOnDegreeLine
    ? Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - yearReserve)
    : CONTENT_WIDTH;
  const degreeLines: string[] = degree ? doc.splitTextToSize(degree, degreeWrapWidth) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const institutionWrapWidth = year && !yearOnDegreeLine
    ? Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - yearReserve)
    : CONTENT_WIDTH;
  const institutionLines: string[] = institution ? doc.splitTextToSize(institution, institutionWrapWidth) : [];
  const gradeLines: string[] = gradeText ? doc.splitTextToSize(gradeText, CONTENT_WIDTH) : [];

  // Multi-line metadata fields (degree/institution/grade) use their own
  // font size as the per-line height, with no extra leading — the
  // same convention already used for the header's wrapped contact
  // line in addHeader(). BODY_LINE_HEIGHT (with its 1.4 multiplier)
  // is reserved for actual paragraph body text, which none of these
  // fields are.
  const degreeHeight = degreeLines.length * EXPERIENCE_TITLE_SIZE;

  // ------------------------------------------------------------------
  // ROOT-CAUSE FIX — University Name (Institution) -> Grade gap was too
  // large because the OLD code advanced y by Institution's own tight
  // (no-leading) metadata-line height AND THEN separately added
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
  // The Degree-only -> Grade transition (no Institution present) and
  // the Year-alone -> Grade transition (no degree, no institution) are
  // both unaffected by this fix and keep using
  // EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP, exactly as before.
  // ------------------------------------------------------------------
  const institutionInternalWrapAdvance = institutionLines.length > 1
    ? (institutionLines.length - 1) * EXPERIENCE_SUBTITLE_SIZE
    : 0;
  const institutionTrailingAdvance = institutionLines.length === 0
    ? 0
    : gradeLines.length > 0 ? BODY_LINE_HEIGHT
    : EXPERIENCE_SUBTITLE_SIZE;

  const hasHeaderContent = degreeLines.length > 0 || institutionLines.length > 0;
  const yearAloneHeight = !hasHeaderContent && year ? EXPERIENCE_SUBTITLE_SIZE : 0;

  // --- Determine how much space this ENTIRE entry needs (degree +
  // institution + year + every wrapped grade line), so the whole block
  // moves to a new page together rather than splitting mid-entry.
  // Computed via the shared estimateEducationEntryMinimumHeight() (see
  // its own comment above addEducationEntry) rather than inline here,
  // so this entry's own page-break check and addEducation()'s
  // heading-guard can never drift out of parity with each other. ---
  const minimumEntrySpaceNeeded = estimateEducationEntryMinimumHeight(doc, edu);
  y = checkPageBreakClassic(doc, y, minimumEntrySpaceNeeded);

  // --- Degree / Program (with right-aligned year on its first line) ---
  if (degreeLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(degreeLines, LEFT_MARGIN, y);
    if (year && yearOnDegreeLine) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
      doc.setTextColor(...CLASSIC_ACCENT_COLOR);
      doc.text(year, PAGE_WIDTH - RIGHT_MARGIN - yearWidth, y);
    }
    y += degreeHeight;
    if (institutionLines.length > 0) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
  }

  // --- Institution (own line — no year attached unless there was no
  // degree for the year to sit beside instead) ---
  if (institutionLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(institutionLines, LEFT_MARGIN, y);
    if (year && !yearOnDegreeLine) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CLASSIC_ACCENT_COLOR);
      doc.text(year, PAGE_WIDTH - RIGHT_MARGIN - yearWidth, y);
    }
    y += institutionInternalWrapAdvance;
    // University Name -> Grade: the normal content-line gap, replacing
    // Institution's own tight last-line advance rather than stacking on
    // top of it. When there's no Grade, this is Institution's own tight
    // last-line advance, unchanged.
    y += institutionTrailingAdvance;
  }

  // --- Year alone (no degree, no institution) ---
  if (!hasHeaderContent && year) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...CLASSIC_ACCENT_COLOR);
    doc.text(year, LEFT_MARGIN, y);
    y += EXPERIENCE_SUBTITLE_SIZE;
  }

  // Degree-only -> Grade, or Year-alone -> Grade — only when there's no
  // Institution line at all — unchanged from before this fix.
  if (institutionLines.length === 0 && (hasHeaderContent || yearAloneHeight > 0) && gradeLines.length > 0) {
    y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
  }

  // --- Grade (optional, rendered with a "Grade: " label, matching the reference) ---
  if (gradeLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);

    for (const line of gradeLines) {
      y = checkPageBreakClassic(doc, y, lineInkHeight(EXPERIENCE_SUBTITLE_SIZE));
      doc.text(line, LEFT_MARGIN, y);
      y += EXPERIENCE_SUBTITLE_SIZE;
    }
  }

  // --- TRAILING-SPACE PARITY (applies to EVERY entry, not just the last) ---
  // Every field above (degree/subtitle/grade) advances y by its own font
  // size only, with no extra leading — intentional, matching the header's
  // wrapped contact line. A body-text line (Summary's paragraph,
  // Experience's description) instead advances by BODY_LINE_HEIGHT, which
  // bakes in extra leading (~40% more than the font size alone). Whatever
  // gap is added next — EDUCATION_ENTRY_GAP before another entry, or
  // SECTION_GAP before the next section — sits directly on top of y, so
  // if y weren't normalized here, an entry ending on grade would leave a
  // visibly smaller gap than one ending on subtitle-only (different font
  // sizes) or one ending on degree-only, and the entry-to-entry rhythm
  // would depend on which fields happened to be filled in.
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
      : hasHeaderContent
        ? EXPERIENCE_TITLE_SIZE
        : EXPERIENCE_SUBTITLE_SIZE;
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
function addSkills(doc: jsPDF, data: ClassicPdfData, startY: number): number {
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
  y = checkPageBreakClassic(doc, y, minimumSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'SKILLS', y, BODY_SIZE);

  // --- Wrapped skill list ---
  // Rendered one line at a time (same pattern as addSummary()) so a
  // long skill list can continue naturally onto a new page without
  // losing, duplicating, or clipping any skill. Each skill and each
  // separator between them is drawn as its own doc.text() call (rather
  // than one joined string) purely so the separator's bullet dot can be
  // colored differently from the skill text — the resulting layout,
  // spacing, and wrapping are identical to the single joined string,
  // since the same SKILLS_SEPARATOR text and widths are used either way.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  for (const lineSkills of skillLines) {
    y = checkPageBreakClassic(doc, y, lineInkHeight(BODY_SIZE));
    let x = LEFT_MARGIN;
    lineSkills.forEach((skill, index) => {
      doc.setTextColor(...COLOR_BODY);
      doc.text(skill, x, y);
      x += doc.getTextWidth(skill);

      if (index < lineSkills.length - 1) {
        doc.setTextColor(...COLOR_BODY);
        doc.text(SKILLS_SEPARATOR_LEADING, x, y);
        x += doc.getTextWidth(SKILLS_SEPARATOR_LEADING);

        // BULLET DOT COLOR: reuses the same centralized heading/accent
        // color the SKILLS heading itself is drawn with
        // (CLASSIC_SECTION_HEADING_COLOR, set inside
        // renderSectionHeading()) — only the dot's color changes; the
        // skill text on either side of it keeps COLOR_BODY, unchanged.
        doc.setTextColor(...CLASSIC_SECTION_HEADING_COLOR);
        doc.text('•', x, y);
        x += doc.getTextWidth('•');

        doc.setTextColor(...COLOR_BODY);
        doc.text(SKILLS_SEPARATOR_TRAILING, x, y);
        x += doc.getTextWidth(SKILLS_SEPARATOR_TRAILING);
      }
    });
    y += BODY_LINE_HEIGHT;
  }

  return y;
}

// Splits the raw `skills` string into individual skill strings, using
// the EXACT same rule as the CV editor's own getSkillArray()
// (SkillsSection.tsx): comma-separated if it contains a comma,
// otherwise one skill per line with an optional leading bullet
// marker stripped. This is intentionally duplicated logic rather than
// a shared import, since classicPdf.ts is a self-contained renderer —
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
function buildSkillLines(doc: jsPDF, skills: string[], maxWidth: number): string[][] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentLineText = '';

  for (const skill of skills) {
    const candidateText = currentLineText ? `${currentLineText}${SKILLS_SEPARATOR}${skill}` : skill;
    const candidateWidth = doc.getTextWidth(candidateText);

    if (candidateWidth <= maxWidth || !currentLineText) {
      currentLine.push(skill);
      currentLineText = candidateText;
    } else {
      lines.push(currentLine);
      currentLine = [skill];
      currentLineText = skill;
    }
  }

  if (currentLine.length > 0) {
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
function addLanguages(doc: jsPDF, data: ClassicPdfData, startY: number): number {
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
  // checkPageBreakClassic() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateLanguageEntryMinimumHeight() addLanguageEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateLanguageEntryMinimumHeight(doc, languages[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
  y = checkPageBreakClassic(doc, y, headingSpaceNeeded);

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
function hasUsableLanguageContent(lang: ClassicPdfLanguage | null | undefined): boolean {
  if (!lang) {
    return false;
  }
  return Boolean((lang.language || '').trim() || (lang.proficiency || '').trim());
}

// Expands the form's stored short proficiency code to the same
// human-readable label LanguagesSection.tsx's own getProficiencyLabel()
// shows in its preview line. Intentionally duplicated (not imported)
// for the same reason parseSkillsList() duplicates getSkillArray()'s
// rule instead of sharing it: classicPdf.ts is a self-contained
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
// itself for its own checkPageBreakClassic() call AND by
// addLanguages() to size its heading-guard against the REAL first
// entry instead of a generic one-line guess — see the ROOT-CAUSE FIX
// note on that guard. Single source of truth, so the estimate and the
// entry's own render can never disagree.
function estimateLanguageEntryMinimumHeight(doc: jsPDF, lang: ClassicPdfLanguage): number {
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
function addLanguageEntry(doc: jsPDF, lang: ClassicPdfLanguage, startY: number): number {
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
  y = checkPageBreakClassic(doc, y, minimumEntrySpaceNeeded);

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
function addAchievements(doc: jsPDF, data: ClassicPdfData, startY: number): number {
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
  // checkPageBreakClassic() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateAchievementEntryMinimumHeight() addAchievementEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateAchievementEntryMinimumHeight(doc, achievements[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
  y = checkPageBreakClassic(doc, y, headingSpaceNeeded);

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
function hasUsableAchievementContent(ach: ClassicPdfAchievement | null | undefined): boolean {
  if (!ach) {
    return false;
  }
  return Boolean(
    (ach.title || '').trim() ||
    (ach.date || '').trim() ||
    (ach.description || '').trim()
  );
}

// BULLET RENDERING (Achievements): matching the Experience and Projects
// sections' own behavior in this file (see addExperienceEntry()/
// addProjectEntry()), every manual line break the user typed in the
// description textarea (split on '\n') is ONE BULLET ITEM and ALWAYS
// gets a "•" dot — a plain line with no marker of its own still gets
// one, matching the CV builder's own form/preview where each typed
// line is already shown as one point. This replaces the previous
// Achievements-only behavior, which drew a dot only for lines that
// already started with a marker character ('•', '-', '*') and left
// plain lines with no dot at all — inconsistent with how Experience and
// Projects already render their own bulleted descriptions. Any marker
// the user did type is still stripped first, so it isn't shown twice
// alongside the dot this file draws.
const ACHIEVEMENT_BULLET_MARKER_PATTERN = /^[•\-*]\s*/;

// Computes the exact minimum vertical space one Achievement entry
// needs (title/date header + FULL wrapped bulleted description),
// without drawing anything, measured from the entry's first baseline
// down to the ink bottom of its last line (see inkBottomHeight()). Used
// by addAchievementEntry() itself for its own checkPageBreakClassic()
// call AND by addAchievements() to size its heading-guard against the
// REAL first entry instead of a generic one-line guess — see the
// ROOT-CAUSE FIX note on that guard. Single source of truth, so the
// estimate and the entry's own render can never disagree: it makes the
// same date-shares-title-line decision and wraps title and description
// at the same widths the render uses.
//
// An entry that fits on a single page moves to the next page as a
// WHOLE; an entry taller than a full page is reserved only up to its
// header plus first description line and flows across pages (see
// keepTogetherHeight()).
function estimateAchievementEntryMinimumHeight(doc: jsPDF, ach: ClassicPdfAchievement): number {
  const title = (ach.title || '').trim();
  const date = (ach.date || '').trim();
  const description = (ach.description || '').trim();

  const hasTitle = title.length > 0;
  const hasDate = date.length > 0;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const dateLines: string[] = hasDate ? doc.splitTextToSize(date, CONTENT_WIDTH) : [];
  const dateFirstLineWidth = dateLines.length > 0 ? doc.getTextWidth(dateLines[0]) : 0;
  const dateReserve = hasDate ? dateFirstLineWidth + DATE_TEXT_GAP_PT : 0;

  const titleWords = hasTitle ? title.split(/\s+/).filter(Boolean) : [];
  const widestTitleWordWidth = titleWords.length > 0
    ? Math.max(...titleWords.map((word) => doc.getTextWidth(word)))
    : 0;
  const dateSharesTitleLine =
    hasTitle && hasDate && dateLines.length === 1 &&
    CONTENT_WIDTH - dateReserve >= widestTitleWordWidth;
  const dateOnOwnLine = hasDate && !dateSharesTitleLine;

  const titleWrapWidth = dateSharesTitleLine
    ? Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - dateReserve)
    : CONTENT_WIDTH;
  const titleLines: string[] = title ? doc.splitTextToSize(title, titleWrapWidth) : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const bulletIndent = computeBulletTextIndent(doc);
  const bulletWrapWidth = Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - bulletIndent);
  const descriptionLineCount = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim().replace(ACHIEVEMENT_BULLET_MARKER_PATTERN, '');
          return trimmedLine ? doc.splitTextToSize(trimmedLine, bulletWrapWidth) : [];
        })
        .length
    : 0;

  const titleHeight = titleLines.length * EXPERIENCE_TITLE_SIZE;
  const dateOwnLinesHeight = dateOnOwnLine ? dateLines.length * EXPERIENCE_TITLE_SIZE : 0;
  const titleToDateGap = hasTitle && dateOnOwnLine ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;

  const headerHeight = titleHeight + titleToDateGap + dateOwnLinesHeight;
  const hasHeaderContent = titleLines.length > 0 || hasDate;
  const hasDescription = descriptionLineCount > 0;
  const headerToDescriptionGap = hasHeaderContent && hasDescription
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = hasDescription ? BODY_LINE_HEIGHT : 0;
  const descriptionTotalHeight = descriptionLineCount * BODY_LINE_HEIGHT;

  // Every header line (title, or a date on its own line) is drawn at
  // EXPERIENCE_TITLE_SIZE in this section.
  const lastLineFontSize = hasDescription ? BODY_SIZE : EXPERIENCE_TITLE_SIZE;
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : EXPERIENCE_TITLE_SIZE;

  return keepTogetherHeight(
    inkBottomHeight(headerHeight + headerToDescriptionGap + descriptionTotalHeight, lastLineAdvance, lastLineFontSize),
    hasDescription
      ? inkBottomHeight(headerHeight + headerToDescriptionGap + firstDescriptionLineHeight, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(headerHeight, lastLineAdvance, lastLineFontSize)
  );
}

// Renders a single achievement entry and returns the new Y position,
// normalized (like every Education/Language entry) so every entry —
// not only the section's last one — ends on an equivalent trailing space.
//
// ACHIEVEMENT NAME/DATE WIDTH BUG FIX (root cause):
// A previous pass already fixed a font mismatch (the date used to be
// MEASURED at BODY_SIZE but DRAWN at EXPERIENCE_TITLE_SIZE bold, so the
// measured width was smaller than the real drawn width). That is
// correct and is kept below. But it wasn't the whole story: even with
// measurement and drawing fonts matched, the code still ALWAYS forced
// the Date onto the title's first line and reserved space for it via
// `Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - dateReserve)`. When the
// Date is long enough that its reservation eats most of the content
// width, that floor (MIN_WRAP_WIDTH_PT = 20pt) is what actually gets
// used as the title's wrap width — 20pt is narrower than almost any
// single word, so splitTextToSize has no legal word-break point left
// and is forced to break WORDS themselves apart, which is what renders
// as "character-by-character vertical wrapping". A 20pt-wide column is
// also nowhere near enough to guarantee the Date's own first line
// doesn't collide with the reduced-width title beneath it either.
//
// The actual root cause is therefore the unconditional assumption that
// Name and Date must always share the exact same first line. The fix
// keeps that shared-line layout for every normal-length date (so
// nothing changes visually for the common case) but decides, from the
// measured content itself, whether the title can still wrap normally
// (by whole words) if it has to share its first line with the date: if
// the space left after reserving the date is narrower than the title's
// OWN widest single word, the two cannot coexist on that line without
// breaking the title apart — so the Date instead renders on its own
// line directly under the Name, still right-aligned to the exact same
// right content boundary. This is a content-driven decision (does the
// title's longest word actually fit), not a hardcoded width, an
// offset, or an entry-specific special case, and it reuses the same
// CONTENT_WIDTH / DATE_TEXT_GAP_PT / MIN_WRAP_WIDTH_PT / PAGE_WIDTH /
// RIGHT_MARGIN / EXPERIENCE_TITLE_TO_SUBTITLE_GAP machinery every other
// section already uses (the last one for the Name -> Date-below gap,
// the same semantic as Experience's name -> company/date gap). The
// Date is also now wrapped (via the same splitTextToSize helper every
// other multi-line field in this file already uses — institutionLines,
// degreeLines, githubLines) instead of assumed to always fit on one
// line, so even a pathologically long date can never render wider than
// the valid content area.
function addAchievementEntry(
  doc: jsPDF,
  ach: ClassicPdfAchievement,
  startY: number
): number {
  let y = startY;

  const title = (ach.title || '').trim();
  const date = (ach.date || '').trim();
  const description = (ach.description || '').trim();

  const hasTitle = title.length > 0;
  const hasDate = date.length > 0;
  // BRACKET REMOVAL: dateText renders the raw date value with no
  // surrounding parentheses/brackets. Everything downstream (dateLines
  // measurement/wrapping, dateReserve, right-alignment against
  // PAGE_WIDTH - RIGHT_MARGIN, font/color/size) derives from this same
  // dateText string.
  const dateText = hasDate ? date : '';

  // --- Date: measured AND wrapped with the exact same font family,
  // weight, and size it is actually DRAWN with (helvetica bold at
  // EXPERIENCE_TITLE_SIZE) — measuring at one font and drawing at
  // another is what previously pushed the date's computed position
  // outside the right content boundary. Wrapping it (instead of
  // assuming it always fits on one line) guarantees the date itself can
  // never be wider than CONTENT_WIDTH, however long it is. ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const dateLines: string[] = hasDate ? doc.splitTextToSize(dateText, CONTENT_WIDTH) : [];
  const dateLineWidths: number[] = dateLines.map((line) => doc.getTextWidth(line));
  const dateFirstLineWidth = dateLineWidths.length > 0 ? dateLineWidths[0] : 0;
  const dateReserve = hasDate ? dateFirstLineWidth + DATE_TEXT_GAP_PT : 0;

  // --- Can the Date's first line share the Name's first line without
  // crushing the Name's own wrap width? True only when there IS a
  // title, the date is a single line, and the space left after
  // reserving the date is at least as wide as the title's own widest
  // single word (measured at the same font the title is drawn with,
  // since font hasn't changed since the block above). Short/normal
  // dates always satisfy this, so their layout is unchanged from
  // before; only a genuinely long date falls through to its own line. ---
  const titleWords = hasTitle ? title.split(/\s+/).filter(Boolean) : [];
  const widestTitleWordWidth = titleWords.length > 0
    ? Math.max(...titleWords.map((word) => doc.getTextWidth(word)))
    : 0;
  const dateSharesTitleLine =
    hasTitle && hasDate && dateLines.length === 1 &&
    CONTENT_WIDTH - dateReserve >= widestTitleWordWidth;
  // When the Date can't share the Name's line — either because it's
  // too long, or because there is no title for it to sit beside at
  // all — it renders on its own line(s) directly below instead, still
  // right-aligned to the exact same right content boundary, so it
  // never overlaps the Name and never forces the Name's width to
  // collapse.
  const dateOnOwnLine = hasDate && !dateSharesTitleLine;

  // Title wrap width = full content width minus the date reservation,
  // ONLY when the date is confirmed to share the title's first line —
  // the exact same "available width minus a measured reservation,
  // floored by MIN_WRAP_WIDTH_PT as a defensive guard" pattern
  // Education's year-reserve and Experience's date column already use.
  // In every other case the title gets the full content width, exactly
  // like every other section's title/name field.
  const titleWrapWidth = dateSharesTitleLine
    ? Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - dateReserve)
    : CONTENT_WIDTH;
  const titleLines: string[] = title ? doc.splitTextToSize(title, titleWrapWidth) : [];

  // Description renders as a bulleted list — same hanging-indent bullet
  // structure as the Experience section's description (see
  // addExperienceEntry()) — using body text size and line height with
  // 1.4 multiplier (same as Summary and Experience description). The
  // wrap width is measured against the bullet marker's own width, not
  // the full content width, so wrapped text never overflows past the
  // right margin.
  //
  // Each manual line break the user typed is one ACHIEVEMENT ITEM and
  // always gets a bullet dot (see ACHIEVEMENT_BULLET_MARKER_PATTERN's
  // own comment above) — never more than one dot regardless of how many
  // lines that item wraps into. Any marker the user already typed is
  // stripped first so it isn't doubled alongside the dot this file
  // draws.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const bulletIndent = computeBulletTextIndent(doc);
  const bulletWrapWidth = Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - bulletIndent);
  const descriptionLines: { text: string; isStart: boolean }[] = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim().replace(ACHIEVEMENT_BULLET_MARKER_PATTERN, '');
          if (!trimmedLine) {
            return [];
          }
          return doc
            .splitTextToSize(trimmedLine, bulletWrapWidth)
            .map((line: string, idx: number) => ({ text: line, isStart: idx === 0 }));
        })
    : [];

  // Multi-line metadata fields use their own font size as the per-line
  // height, with no extra leading — the same metadata-line convention
  // used by the header's contact line and every Education field.
  const titleHeight = titleLines.length * EXPERIENCE_TITLE_SIZE;

  // Gap between the Name and the Date, ONLY when the date couldn't
  // share the title's first line AND a title is actually present above
  // it (if there's no title, the date-alone line needs no gap before
  // it). Reuses the same title -> subtitle-style gap every other
  // section uses for an equivalent transition (e.g. Experience's
  // name -> company/date line), rather than inventing a new constant.
  const titleToDateGap = hasTitle && dateOnOwnLine ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;

  // --- Determine how much space this whole entry needs (header + EVERY
  // wrapped description line), so it moves to a new page together
  // rather than splitting the Name from its Date, or either from the
  // description. Computed via the shared
  // estimateAchievementEntryMinimumHeight() (see its own comment above)
  // rather than inline here, so this entry's own page-break check and
  // addAchievements()'s heading-guard can never drift out of parity. ---
  const hasHeaderContent = titleLines.length > 0 || hasDate;
  const minimumEntrySpaceNeeded = estimateAchievementEntryMinimumHeight(doc, ach);
  y = checkPageBreakClassic(doc, y, minimumEntrySpaceNeeded);

  // --- Name (left) + Date. When the date fits beside the name, both
  // render on the same first line (right-aligned Date), exactly as
  // before. Otherwise the Date renders on its own line(s) directly
  // below the Name — or alone, right-aligned, if there's no title at
  // all — never sharing a line it would have to crush the Name to fit
  // on. ---
  if (titleLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(titleLines, LEFT_MARGIN, y);
    if (dateSharesTitleLine) {
      doc.setTextColor(...CLASSIC_ACCENT_COLOR);
      doc.text(dateLines[0], PAGE_WIDTH - RIGHT_MARGIN - dateFirstLineWidth, y);
    }
    y += titleHeight;
    if (dateOnOwnLine) {
      y += titleToDateGap;
    }
  }

  if (dateOnOwnLine) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...CLASSIC_ACCENT_COLOR);
    dateLines.forEach((line, idx) => {
      doc.text(line, PAGE_WIDTH - RIGHT_MARGIN - dateLineWidths[idx], y);
      y += EXPERIENCE_TITLE_SIZE;
    });
  }

  // --- Description (optional, wrapped bullet points, hanging indent —
  // same bulleted-list structure as the Experience section's
  // description; see addExperienceEntry()) ---
  if (descriptionLines.length > 0) {
    // Only add the gap if there was header content before it
    if (hasHeaderContent) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);

    for (const item of descriptionLines) {
      y = checkPageBreakClassic(doc, y, lineInkHeight(BODY_SIZE));
      if (item.isStart) {
        // BULLET DOT COLOR: reuses the same centralized heading/accent
        // color the ACHIEVEMENTS heading itself is drawn with
        // (CLASSIC_SECTION_HEADING_COLOR, set inside
        // renderSectionHeading()) — only the dot's color changes here;
        // the bullet text right after it keeps COLOR_BODY, unchanged.
        doc.setTextColor(...CLASSIC_SECTION_HEADING_COLOR);
        doc.text(BULLET_MARKER, LEFT_MARGIN, y);
      }
      doc.setTextColor(...COLOR_BODY);
      // Every item is a bullet now, so its text always sits past the
      // dot's hanging indent, exactly like Experience/Projects.
      doc.text(item.text, LEFT_MARGIN + bulletIndent, y);
      y += BODY_LINE_HEIGHT;
    }
  }

  // ENTRY-GAP CONSISTENCY: normalize every entry's end (not only the
  // last) to a body-line-equivalent trailing space.
  // 
  // When there IS a description: the last line uses BODY_LINE_HEIGHT (14.7)
  // which already includes the 1.4 multiplier — this is the body-line-equivalent.
  // 
  // When there is NO description: the last line is the combined title(+date)
  // line, which always renders at EXPERIENCE_TITLE_SIZE now that title and
  // date share one line. topUpToLineHeight() adds the difference between
  // BODY_LINE_HEIGHT and that font size, resulting in the same
  // body-line-equivalent (14.7 from the start of the last line).
  //
  // Both cases result in the SAME Y position baseline, ensuring that
  // EXPERIENCE_ENTRY_GAP and SECTION_GAP are consistent regardless of
  // whether achievements have descriptions or not.
  if (descriptionLines.length > 0) {
    // Description already ends at body-line-equivalent
    return y;
  }
  y = topUpToLineHeight(y, EXPERIENCE_TITLE_SIZE);

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
// SECTION_GAP (20pt). Achievements returns its actual content end, and
// Certifications applies SECTION_GAP at its start. This is the same
// architecture used by every other section transition in this file.
//
// Entries with no usable content are skipped. If there are no usable
// entries at all, the whole section (including the heading) is skipped
// and startY is returned unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addCertifications(doc: jsPDF, data: ClassicPdfData, startY: number): number {
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
  // checkPageBreakClassic() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateCertificationEntryMinimumHeight() addCertificationEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateCertificationEntryMinimumHeight(doc, certifications[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
  y = checkPageBreakClassic(doc, y, headingSpaceNeeded);

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
function hasUsableCertificationContent(cert: ClassicPdfCertification | null | undefined): boolean {
  if (!cert) {
    return false;
  }
  return Boolean(
    (cert.name || '').trim() ||
    (cert.date || '').trim() ||
    (cert.credentialId || '').trim()
  );
}

// --------------------------------------------------------------------
// TITLE + RIGHT-ALIGNED DATE LAYOUT (Certificate Date = Achievement Date)
// Measures a bold EXPERIENCE_TITLE_SIZE title together with a bold,
// accent-colored, right-aligned date EXACTLY the way
// addAchievementEntry()/estimateAchievementEntryMinimumHeight() do
// (that logic is inline there; this helper is its single mirrored
// implementation for Certifications, so the estimate and the render of
// a certificate can never disagree):
//   - the date is measured AND wrapped at the font it is drawn in
//     (helvetica bold, EXPERIENCE_TITLE_SIZE) against CONTENT_WIDTH;
//   - dateReserve = first-line width + DATE_TEXT_GAP_PT;
//   - the date shares the title's first line only when there is a
//     title, the date is a single line, and the width left after the
//     reservation still fits the title's widest single word; otherwise
//     it renders on its own line(s) below the title;
//   - the title wraps to CONTENT_WIDTH - dateReserve when sharing the
//     line (floored by MIN_WRAP_WIDTH_PT), else to CONTENT_WIDTH.
// The right edge used to place the date is PAGE_WIDTH - RIGHT_MARGIN
// (the right content boundary), applied by the caller.
// Leaves the doc font at helvetica bold / EXPERIENCE_TITLE_SIZE.
// --------------------------------------------------------------------
interface TitleWithRightDateLayout {
  titleLines: string[];
  dateLines: string[];
  dateLineWidths: number[];
  dateFirstLineWidth: number;
  dateSharesTitleLine: boolean;
  dateOnOwnLine: boolean;
}

function layoutTitleWithRightAlignedDate(doc: jsPDF, title: string, date: string): TitleWithRightDateLayout {
  const hasTitle = title.length > 0;
  const hasDate = date.length > 0;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const dateLines: string[] = hasDate ? doc.splitTextToSize(date, CONTENT_WIDTH) : [];
  const dateLineWidths: number[] = dateLines.map((line) => doc.getTextWidth(line));
  const dateFirstLineWidth = dateLineWidths.length > 0 ? dateLineWidths[0] : 0;
  const dateReserve = hasDate ? dateFirstLineWidth + DATE_TEXT_GAP_PT : 0;

  const titleWords = hasTitle ? title.split(/\s+/).filter(Boolean) : [];
  const widestTitleWordWidth = titleWords.length > 0
    ? Math.max(...titleWords.map((word) => doc.getTextWidth(word)))
    : 0;
  const dateSharesTitleLine =
    hasTitle && hasDate && dateLines.length === 1 &&
    CONTENT_WIDTH - dateReserve >= widestTitleWordWidth;
  const dateOnOwnLine = hasDate && !dateSharesTitleLine;

  const titleWrapWidth = dateSharesTitleLine
    ? Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - dateReserve)
    : CONTENT_WIDTH;
  const titleLines: string[] = title ? doc.splitTextToSize(title, titleWrapWidth) : [];

  return { titleLines, dateLines, dateLineWidths, dateFirstLineWidth, dateSharesTitleLine, dateOnOwnLine };
}

// Computes the exact minimum vertical space one Certification entry
// needs (name/date header + credential ID), without drawing anything,
// measured from the entry's first baseline down to the ink bottom of
// its last line (see inkBottomHeight()). Used by
// addCertificationEntry() itself for its own checkPageBreakClassic()
// call AND by addCertifications() to size its heading-guard against
// the REAL first entry instead of a generic one-line guess — see the
// ROOT-CAUSE FIX note on that guard. Single source of truth, so the
// estimate and the entry's own render can never disagree: it mirrors,
// step for step, the advances addCertificationEntry() applies.
function estimateCertificationEntryMinimumHeight(doc: jsPDF, cert: ClassicPdfCertification): number {
  const name = (cert.name || '').trim();
  const date = (cert.date || '').trim();
  const credentialId = (cert.credentialId || '').trim();

  const hasTitle = name.length > 0;
  const layout = layoutTitleWithRightAlignedDate(doc, name, date);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const credentialLines: string[] = credentialId ? doc.splitTextToSize(credentialId, CONTENT_WIDTH) : [];

  const titleHeight = layout.titleLines.length * EXPERIENCE_TITLE_SIZE;
  const titleToDateGap = hasTitle && layout.dateOnOwnLine ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;
  const dateOwnLinesHeight = layout.dateOnOwnLine ? layout.dateLines.length * EXPERIENCE_TITLE_SIZE : 0;
  const headerHeight = titleHeight + titleToDateGap + dateOwnLinesHeight;
  const hasHeaderContent = layout.titleLines.length > 0 || date.length > 0;
  const headerToCredentialGap = hasHeaderContent && credentialLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const credentialHeight = credentialLines.length * EXPERIENCE_SUBTITLE_SIZE;

  const fullHeight = headerHeight + headerToCredentialGap + credentialHeight;
  const lastLineFontSize = credentialLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : EXPERIENCE_TITLE_SIZE;
  const inkHeight = inkBottomHeight(fullHeight, lastLineFontSize, lastLineFontSize);
  return keepTogetherHeight(inkHeight, inkHeight);
}

// Renders a single certification entry and returns the new Y position,
// normalized (like every Education/Language/Achievement entry) so every
// entry — not only the section's last one — ends on an equivalent
// trailing space.
//
// The Date renders exactly like addAchievementEntry()'s Date (see
// layoutTitleWithRightAlignedDate() above): bold, EXPERIENCE_TITLE_SIZE,
// CLASSIC_ACCENT_COLOR, right-aligned to PAGE_WIDTH - RIGHT_MARGIN on the
// name's first line (or on its own right-aligned line(s) below when it
// can't share that line).
function addCertificationEntry(
  doc: jsPDF,
  cert: ClassicPdfCertification,
  startY: number
): number {
  let y = startY;

  const name = (cert.name || '').trim();
  const date = (cert.date || '').trim();
  const credentialId = (cert.credentialId || '').trim();

  const hasTitle = name.length > 0;
  const layout = layoutTitleWithRightAlignedDate(doc, name, date);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const credentialLines: string[] = credentialId ? doc.splitTextToSize(credentialId, CONTENT_WIDTH) : [];

  // Multi-line metadata fields use their own font size as the per-line
  // height, with no extra leading — the same metadata-line convention
  // used by the header's contact line and every Education field.
  const titleHeight = layout.titleLines.length * EXPERIENCE_TITLE_SIZE;
  const titleToDateGap = hasTitle && layout.dateOnOwnLine ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;
  const credentialHeight = credentialLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const hasHeaderContent = layout.titleLines.length > 0 || date.length > 0;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a name from its date
  // or credential ID. Computed via the shared
  // estimateCertificationEntryMinimumHeight() (see its own comment
  // above) rather than inline here, so this entry's own page-break
  // check and addCertifications()'s heading-guard can never drift out
  // of parity. ---
  const minimumEntrySpaceNeeded = estimateCertificationEntryMinimumHeight(doc, cert);
  y = checkPageBreakClassic(doc, y, minimumEntrySpaceNeeded);

  // --- Certification Name (+ right-aligned Date on the same first line
  // when it fits, exactly like Achievements) ---
  if (layout.titleLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(layout.titleLines, LEFT_MARGIN, y);
    if (layout.dateSharesTitleLine) {
      doc.setTextColor(...CLASSIC_ACCENT_COLOR);
      doc.text(layout.dateLines[0], PAGE_WIDTH - RIGHT_MARGIN - layout.dateFirstLineWidth, y);
    }
    y += titleHeight;
    if (layout.dateOnOwnLine) {
      y += titleToDateGap;
    }
  }

  // --- Date on its own right-aligned line(s) (too long to share the
  // name's line, or no name at all) ---
  if (layout.dateOnOwnLine) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...CLASSIC_ACCENT_COLOR);
    layout.dateLines.forEach((line, idx) => {
      doc.text(line, PAGE_WIDTH - RIGHT_MARGIN - layout.dateLineWidths[idx], y);
      y += EXPERIENCE_TITLE_SIZE;
    });
  }

  // --- Credential ID (optional) ---
  if (credentialLines.length > 0) {
    if (hasHeaderContent) {
      y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);
    doc.text(credentialLines, LEFT_MARGIN, y);
    y += credentialHeight;
  }

  // ENTRY-GAP CONSISTENCY: normalize every entry's end (not only the
  // last) to a body-line-equivalent trailing space — see the matching
  // comment inside addEducationEntry() for the full analysis.
  // The last line is either the credential (EXPERIENCE_SUBTITLE_SIZE)
  // or the name/date header (EXPERIENCE_TITLE_SIZE).
  const lastLineFontSize = credentialLines.length > 0
    ? EXPERIENCE_SUBTITLE_SIZE
    : EXPERIENCE_TITLE_SIZE;
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
function addProjects(doc: jsPDF, data: ClassicPdfData, startY: number): number {
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
  // checkPageBreakClassic() would immediately push IT to the next page —
  // orphaning the heading. Sizing the guard against the REAL first
  // entry (via the same estimateProjectEntryMinimumHeight() addProjectEntry() itself checks
  // against) guarantees the heading and its first entry can never be
  // split across a page boundary.
  const firstEntryMinimumHeight = estimateProjectEntryMinimumHeight(doc, projects[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
  y = checkPageBreakClassic(doc, y, headingSpaceNeeded);

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
function hasUsableProjectContent(project: ClassicPdfProject | null | undefined): boolean {
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
// (name + tech + FULL wrapped bulleted description + github), without
// drawing anything, measured from the entry's first baseline down to
// the ink bottom of its last line (see inkBottomHeight()). Used by
// addProjectEntry() itself for its own checkPageBreakClassic() call AND
// by addProjects() to size its heading-guard against the REAL first
// entry instead of a generic one-line guess — see the ROOT-CAUSE FIX
// note on that guard. Single source of truth, so the estimate and the
// entry's own render can never disagree.
//
// An entry that fits on a single page moves to the next page as a
// WHOLE; an entry taller than a full page is reserved only up to its
// header plus first description line and flows across pages (see
// keepTogetherHeight()).
function estimateProjectEntryMinimumHeight(doc: jsPDF, project: ClassicPdfProject): number {
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

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const bulletIndent = computeBulletTextIndent(doc);
  const bulletWrapWidth = Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - bulletIndent);
  const descriptionLineCount = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim().replace(/^[•\-*]\s*/, '');
          return trimmedLine ? doc.splitTextToSize(trimmedLine, bulletWrapWidth) : [];
        })
        .length
    : 0;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const githubLines: string[] = github ? doc.splitTextToSize(github, CONTENT_WIDTH) : [];

  const nameHeight = nameLines.length * EXPERIENCE_TITLE_SIZE;
  const techHeight = techLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const descriptionHeight = descriptionLineCount * BODY_LINE_HEIGHT;
  const githubHeight = githubLines.length * EXPERIENCE_SUBTITLE_SIZE;
  const hasDescription = descriptionLineCount > 0;

  const nameToTechGap = nameLines.length > 0 && techLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const hasHeaderContent = nameLines.length > 0 || techLines.length > 0;
  const headerToDescriptionGap = hasHeaderContent && hasDescription
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const descriptionToGithubGap = hasDescription && githubLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  // NOTE: there are deliberately no separate "nameToDescriptionGap" or
  // "techToDescriptionGap" terms here. headerToDescriptionGap above
  // already covers EVERY header -> description transition (name-only,
  // tech-only, or name+tech), since its own condition is
  // `hasHeaderContent && hasDescription`. Two narrower terms used to
  // re-add the same gap a second time for the name-only and tech-present
  // cases respectively — that double-counted the single gap
  // addProjectEntry() actually draws. Removed so this estimate mirrors
  // the render function's single-gap fix exactly (see the matching
  // comment in addProjectEntry()'s Description block) instead of the
  // estimate being patched to match a render bug.
  const techToGithubGap = techLines.length > 0 && githubLines.length > 0 && !hasDescription
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const nameToGithubGap = nameLines.length > 0 && githubLines.length > 0 && techLines.length === 0 && !hasDescription
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;

  const fullHeight = nameHeight + nameToTechGap + techHeight +
    headerToDescriptionGap + descriptionHeight +
    descriptionToGithubGap + githubHeight + techToGithubGap + nameToGithubGap;

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
  project: ClassicPdfProject,
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

  // Description renders as a bulleted list — same hanging-indent bullet
  // structure as the Experience section's description (see
  // addExperienceEntry()) — using body text size and line height with
  // 1.4 multiplier (same as Summary and Experience description). The
  // wrap width is measured against the bullet marker's own width, not
  // the full content width, so wrapped text never overflows past the
  // right margin.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const bulletIndent = computeBulletTextIndent(doc);
  const bulletWrapWidth = Math.max(MIN_WRAP_WIDTH_PT, CONTENT_WIDTH - bulletIndent);
  const descriptionLines: { text: string; isStart: boolean }[] = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim().replace(/^[•\-*]\s*/, '');
          if (!trimmedLine) {
            return [];
          }
          return doc
            .splitTextToSize(trimmedLine, bulletWrapWidth)
            .map((line: string, idx: number) => ({ text: line, isStart: idx === 0 }));
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
  const githubHeight = githubLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a name from its tech,
  // description, or GitHub link. Computed via the shared
  // estimateProjectEntryMinimumHeight() (see its own comment above)
  // rather than inline here, so this entry's own page-break check and
  // addProjects()'s heading-guard can never drift out of parity. ---
  const minimumEntrySpaceNeeded = estimateProjectEntryMinimumHeight(doc, project);
  y = checkPageBreakClassic(doc, y, minimumEntrySpaceNeeded);

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

  // --- Description (optional, wrapped bullet points, hanging indent —
  // same bulleted-list structure as the Experience section's
  // description; see addExperienceEntry()) ---
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
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);

    for (const item of descriptionLines) {
      y = checkPageBreakClassic(doc, y, lineInkHeight(BODY_SIZE));
      if (item.isStart) {
        // BULLET DOT COLOR: reuses the same centralized heading/accent
        // color the PROJECTS heading itself is drawn with
        // (CLASSIC_SECTION_HEADING_COLOR, set inside
        // renderSectionHeading()) — only the dot's color changes here;
        // the bullet text right after it keeps COLOR_BODY, unchanged.
        doc.setTextColor(...CLASSIC_SECTION_HEADING_COLOR);
        doc.text(BULLET_MARKER, LEFT_MARGIN, y);
      }
      doc.setTextColor(...COLOR_BODY);
      doc.text(item.text, LEFT_MARGIN + bulletIndent, y);
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
    doc.setTextColor(...CLASSIC_LINK_COLOR);
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
//      consumes. The entry's own checkPageBreakClassic() and the
//      section's heading guard both call that same helper, so they can
//      never disagree with each other or with the render.
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
export function checkPageBreakClassic(doc: jsPDF, y: number, spaceNeeded: number): number {
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
//     via the per-line checkPageBreakClassic() calls made while
//     rendering.
// The result is always capped at PAGE_USABLE_HEIGHT, so a reservation
// can never be larger than a page and checkPageBreakClassic() can
// therefore never demand a fresh page that still would not fit it.
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
// BOTTOM_MARGIN. Every space reservation passed to
// checkPageBreakClassic() is therefore measured from the block's first
// baseline down to the ink bottom of its LAST line:
//   inkBottomHeight() — a whole block: its total advance height, with
//     the last line's advance swapped for that line's descender.
//   lineInkHeight()   — a single line: baseline -> descender.
// Descender depth uses HELVETICA_DESCENT_RATIO.
// ====================================================================
function lineInkHeight(fontSize: number): number {
  return fontSize * HELVETICA_DESCENT_RATIO;
}

function inkBottomHeight(blockHeight: number, lastLineAdvance: number, lastLineFontSize: number): number {
  return blockHeight - lastLineAdvance + lineInkHeight(lastLineFontSize);
}

// ====================================================================
// AUTO-FIT-TO-ONE-PAGE (DYNAMIC SCALE)
// ====================================================================
// Goal: if a resume overflows onto a second page by only a SMALL
// amount, automatically shrink text/spacing slightly (never below 85%
// of original size) so it fits back onto one page. This never touches
// page margins, the header's own typography/photo, colors, or any
// hairline stroke width — only the BASE_*/let constants converted
// above (section headings, body/entry text sizes, and every
// section/entry/bullet spacing constant) are ever scaled. A resume
// that is genuinely too long (already 3+ pages, or overflowing by a
// large amount) is never force-shrunk — it renders untouched at full
// size.
//
// recomputeScaledConstants(scale) is the single place that applies
// `scale` to every BASE_* constant declared above. Anything computed
// FROM one of those constants at call time (sectionHeadingToContentOffset(),
// computeBulletTextIndent(), every addXxxEntry()'s own arithmetic) reads
// the live `let` value automatically, since JS/TS closures always read
// a module-level `let`'s current value — the only constant that must be
// recomputed explicitly here is BODY_LINE_HEIGHT, since it is stored
// once rather than recalculated inline wherever it's used.
// ====================================================================
function recomputeScaledConstants(scale: number): void {
  SCALE_FACTOR = scale;

  HEADING_SIZE = BASE_HEADING_SIZE * scale;
  BODY_SIZE = BASE_BODY_SIZE * scale;
  EXPERIENCE_TITLE_SIZE = BASE_EXPERIENCE_TITLE_SIZE * scale;
  EXPERIENCE_SUBTITLE_SIZE = BASE_EXPERIENCE_SUBTITLE_SIZE * scale;

  SECTION_GAP = BASE_SECTION_GAP * scale;
  HEADING_TO_CONTENT_GAP = BASE_HEADING_TO_CONTENT_GAP * scale;
  ITEM_GAP = BASE_ITEM_GAP * scale;
  BULLET_GAP = BASE_BULLET_GAP * scale;

  DIVIDER_SIDE_GAP_PT = BASE_DIVIDER_SIDE_GAP_PT * scale;
  CONTENT_GAP_EXTRA_PT = BASE_CONTENT_GAP_EXTRA_PT * scale;

  EXPERIENCE_TITLE_TO_SUBTITLE_GAP = BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP * scale;
  EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP * scale;
  EXPERIENCE_ENTRY_GAP = BASE_EXPERIENCE_ENTRY_GAP * scale;

  DATE_TEXT_GAP_PT = BASE_DATE_TEXT_GAP_PT * scale;
  BULLET_TEXT_EXTRA_GAP_PT = BASE_BULLET_TEXT_EXTRA_GAP_PT * scale;
  EXPERIENCE_CONTENT_EXTRA_GAP_PT = BASE_EXPERIENCE_CONTENT_EXTRA_GAP_PT * scale;

  // BODY_LINE_HEIGHT must be recomputed after BODY_SIZE, since it is
  // derived from it and is otherwise stored (not recalculated inline).
  BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;
}

// Never shrink below 85% of full size — past that point text stops
// being comfortably readable, so a resume that still doesn't fit at
// 0.85 is left at full size and multi-page instead (see the fallback
// in generateClassicPDF() below).
const AUTO_FIT_MIN_SCALE = 0.85;

// Auto-fit only ever engages for a SMALL overflow: at most 35% of one
// page's usable height spilling onto page 2. Anything larger is a
// genuinely longer resume, not a near-miss, and is left untouched.
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

// ====================================================================
// ENTRY POINT (public API — unchanged signature)
// Renders once at full size. If that overflows to a second page by
// only a small amount, tries progressively smaller scales (1 -> 0.85,
// in 0.02 steps, largest first) and returns the first one that fits on
// one page. Falls back to the untouched full-size, multi-page result
// if no scale down to 0.85 achieves one page, or if the resume is
// already 3+ pages, or overflows by more than the small-overflow
// threshold above (auto-fit is skipped entirely in those cases).
// SCALE_FACTOR/every scaled constant is reset to 1 before this
// function returns, so back-to-back calls with different data never
// leak scale state into each other.
// ====================================================================
export function generateClassicPDF(data: ClassicPdfData): jsPDF {
  // WinAnsi-safety pass — see sanitizeTextForPdf() above. Every string
  // field in `data` is normalized ONCE here, before any measurement or
  // rendering, so the rest of the file (unchanged below) never sees an
  // unencodable character like U+2011 again.
  const sanitizedData = deepSanitizeForPdf(data);

  recomputeScaledConstants(1);
  const fullScaleResult = renderClassicPDFOnce(sanitizedData);

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
    const attempt = renderClassicPDFOnce(sanitizedData);
    if (attempt.pageCount === 1) {
      bestFit = { doc: attempt.doc, scale };
      break;
    }
  }

  recomputeScaledConstants(1);
  return bestFit ? bestFit.doc : fullScaleResult.doc;
}
