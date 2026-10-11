/**
 * executivePdf.ts
 * ------------------------------------------------------------------
 * Originally a direct clone of minimalPdf.ts (see
 * src/components/cv-builder/utils/pdf/minimalPdf.ts) with only a
 * generator-identity rename and a headline-color override. This file
 * has since had an OLD EXECUTIVE PDF DESIGN TRANSFER applied on top of
 * that base:
 *
 *   THIS FILE remains the single source of truth for every gap,
 *   spacing value, geometry/measurement calculation, page-break
 *   threshold, and general architecture (all of that is IDENTICAL to
 *   the Minimal-derived base — nothing below changes it).
 *
 *   The OLD Executive PDF generator (a separate, class-based
 *   ExecutivePDFGenerator/EXECUTIVE_THEME implementation, supplied as
 *   a one-time design reference and not imported or reused here) is
 *   the source for this file's VISUAL DESIGN ONLY:
 *     - Every COLOR_* constant below (header background/name/job-title/
 *       contact colors, section-headline color, divider/accent gold,
 *       entry-title color, body/date/metadata colors, link color) is
 *       ported from that generator's EXECUTIVE_THEME palette (or, for
 *       the header contact line, its literal rendered color) — see the
 *       "DESIGN SOURCE (current)" comment at the color constants below
 *       for the full mapping.
 *     - The header is now rendered as a solid navy band spanning the
 *       full page width, framed by a double gold border, with the
 *       name/job title/contact recolored for legibility on that dark
 *       background, and the header photo (when present) ringed in the
 *       same gold accent — reproducing the OLD Executive header's
 *       visual design. The band's height is derived entirely from this
 *       file's own existing header-content measurements (the same
 *       nameBaselineY/titleBaselineY/contact-wrapping/header-divider
 *       math the Minimal-derived base already computed) — it is NOT a
 *       hardcoded number, and growing/shrinking header content (extra
 *       contact items, wrapped text, presence/absence of a photo)
 *       still grows/shrinks the band exactly as it already grew/shrank
 *       the plain header before this change. See addHeader() below.
 *   No gap, spacing value, coordinate, or page-break threshold was
 *   imported from that OLD Executive generator — only colors and the
 *   header's decorative treatment, layered onto this file's own,
 *   unchanged geometry.
 *
 * Font family/size/position/alignment/line-height/spacing/divider
 * relationship/pagination/rendering flow are unchanged from the
 * Minimal-derived base throughout, except where explicitly noted
 * above (the header band's decorative fill/border/photo-ring, and the
 * header name's font weight, which OLD Executive renders bold).
 *
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

// Requested follow-up: increase the profile photo's rendered diameter by
// exactly 7px, WITHOUT letting that growth ripple into textStartX or the
// photo-overhang/Y-advancement math below (both of which key off
// HEADER_PHOTO_SIZE_PT and would otherwise push the name/title block or
// grow the header). PX_TO_PT is the standard CSS-pixel (96dpi) -> PDF
// point (72dpi) conversion — introduced here, once, as its own named
// constant (same convention as MM_TO_PT above), since this file had no
// px unit before this request. HEADER_PHOTO_RENDER_SIZE_PT is the ONLY
// size used for the photo's own drawn geometry (its centering formula,
// radius, clip circle, and image scaling) below — HEADER_PHOTO_SIZE_PT
// itself is left completely untouched so every OTHER header calculation
// that reads it (textStartX, photoOverhang) keeps its exact prior value.
const PX_TO_PT = 72 / 96;
const HEADER_PHOTO_SIZE_INCREASE_PX = 7;
const HEADER_PHOTO_SIZE_INCREASE_PT = HEADER_PHOTO_SIZE_INCREASE_PX * PX_TO_PT;
const HEADER_PHOTO_RENDER_SIZE_PT = HEADER_PHOTO_SIZE_PT + HEADER_PHOTO_SIZE_INCREASE_PT;

// Requested follow-up: when the photo is taller than the name/title
// block (photoOverhang > 0 below), the contact line used to start
// exactly flush with the photo's bottom edge — zero breathing room.
// This is the extra vertical gap inserted there, expressed in mm and
// converted through the existing MM_TO_PT constant like every other
// mm-sourced gap in this file, not a raw pt number. Added AFTER
// photoOverhang (see below), so it shifts the header's own total
// height/border down by the same fixed amount rather than shrinking or
// stretching the content-to-border gap already established above — that
// gap stays exactly as derived.
const PHOTO_TO_CONTACT_GAP_MM = 0.5;
const PHOTO_TO_CONTACT_GAP_PT = PHOTO_TO_CONTACT_GAP_MM * MM_TO_PT;

// Requested follow-up: when there is NO profile photo, the header's
// Name and Job Title each need to move down by their own small, fixed
// amount (Name 2mm, Job Title 1mm) — and ONLY in that no-photo case;
// the photo-present header branch is completely unaffected. Expressed
// in mm and converted through the file's existing MM_TO_PT constant,
// same convention as every other mm-sourced offset above — no raw pt
// magic number. These two constants are read in exactly one place
// (addHeader()'s no-photo branch) and only add to the Y value used to
// DRAW the Name/Job Title baselines — the cursor that goes on to
// position the Contact line and header divider is deliberately left
// unaffected by either offset, so Contact/divider/everything below
// stays exactly where it already was.
const NO_IMAGE_NAME_Y_OFFSET_MM = 2;
const NO_IMAGE_NAME_Y_OFFSET_PT = NO_IMAGE_NAME_Y_OFFSET_MM * MM_TO_PT;
const NO_IMAGE_TITLE_Y_OFFSET_MM = 1;
const NO_IMAGE_TITLE_Y_OFFSET_PT = NO_IMAGE_TITLE_Y_OFFSET_MM * MM_TO_PT;

// Separate, unconditional follow-up request: Name and Job Title each
// move an ADDITIONAL 2mm further down than whatever their branch above
// already computes (photo branch: no prior offset at all; no-photo
// branch: on top of the two offsets just above) — the SAME 2mm amount
// for both, so the existing vertical distance between them is
// preserved automatically. Same mm -> pt conversion convention as
// every other offset in this file. Applied ONLY at the two Phase B
// doc.text() draw calls (nameDrawY/titleDrawY below) — never to
// nameBaselineY/titleBaselineY themselves, so nothing that reads those
// (photo vertical centering, the `y` cursor, Contact line position,
// header divider position) is affected.
const NAME_TITLE_VERTICAL_SHIFT_MM = 2;
const NAME_TITLE_VERTICAL_SHIFT_PT = NAME_TITLE_VERTICAL_SHIFT_MM * MM_TO_PT;

// Separate, unconditional follow-up request: Name and Job Title each
// move an ADDITIONAL amount further down than whatever
// NAME_TITLE_VERTICAL_SHIFT_PT above already computes — the SAME
// amount for both, so the existing vertical distance between them
// (and every other header measurement derived from
// nameBaselineY/titleBaselineY) is preserved automatically. Same mm
// -> pt conversion convention as every other offset in this file.
// Applied ONLY at the two Phase B doc.text() draw calls (nameDrawY/
// titleDrawY below) — never to nameBaselineY/titleBaselineY
// themselves, so nothing that reads those (photo vertical centering,
// the `y` cursor, Contact line position, header divider position) is
// affected. Horizontal position (textStartX) is completely untouched.
// UPDATED (cleanly, in place — not stacked as a third constant): this
// was 1.5mm; per the latest request the Name/Job Title's FINAL total
// downward adjustment must be exactly 2mm, so this single constant is
// now 2mm.
const NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_MM = 2;
const NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_PT = NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_MM * MM_TO_PT;

// Same convention/purpose as the two offsets just above, for the
// Contact line instead of Name/Job Title: read in exactly one place
// (addHeader()'s shared Contact-drawing loop) and added ONLY to the X/Y
// values used to DRAW the Contact line — never to contactBaselineY's
// own downstream uses (lastContactBaselineY, contactInkBottomY, the `y`
// cursor, or LEFT_MARGIN's own downstream uses like the wrap-width
// calculation), which is what headerDividerTopEdgeY/band height/
// content-width are derived from. Image, Name, and Job Title positions
// are untouched by either constant entirely. So Contact renders
// CONTACT_Y_OFFSET_PT lower and CONTACT_X_OFFSET_PT further right while
// the header's own height/divider/every other header-sizing rule stay
// exactly as they were.
const CONTACT_Y_OFFSET_MM = 2;
const CONTACT_Y_OFFSET_PT = CONTACT_Y_OFFSET_MM * MM_TO_PT;
const CONTACT_X_OFFSET_MM = 0.5;
const CONTACT_X_OFFSET_PT = CONTACT_X_OFFSET_MM * MM_TO_PT;

// ------------------------------------------------------------------
// HEADER NAME/TITLE — reference-image design transfer (serif name with
// letter-spacing, job title flanked by short ornamental lines). Font
// FAMILY changes from 'helvetica' to 'times' for the Name and Job
// Title ONLY — everything else in this file keeps using 'helvetica',
// so no other section is affected. Size (NAME_SIZE/TITLE_SIZE),
// position (nameBaselineY/titleBaselineY/textStartX), and every
// existing header gap are untouched — this only changes the glyphs
// drawn at those already-computed coordinates.
//
// doc.setCharSpace() is jsPDF's own letter-spacing API (a real PDF
// "Tc" character-spacing operator) — used instead of manually
// inserting spaces into the string, which would corrupt the actual
// name/title text. IMPORTANT: charSpace is global document state, not
// scoped to one doc.text() call, so it is always explicitly reset to
// 0 immediately after the Name/Title are drawn — every other doc.text()
// call in this file (Contact line, every section below) must keep
// rendering with zero letter-spacing, exactly as before.
// doc.getTextWidth() does NOT include charSpace in its measurement
// (verified before writing this) — TITLE_ORNAMENT_LINE_GAP_PT below is
// therefore positioned against a width estimate that adds
// charSpace * character-count on top of getTextWidth()'s own number,
// the same approximation the PDF "Tc" operator itself applies per
// glyph shown.
// ------------------------------------------------------------------
const NAME_LETTER_SPACING_MM = 1;
const NAME_LETTER_SPACING_PT = NAME_LETTER_SPACING_MM * MM_TO_PT;
const TITLE_LETTER_SPACING_MM = 0.6;
const TITLE_LETTER_SPACING_PT = TITLE_LETTER_SPACING_MM * MM_TO_PT;

// Short gold ornamental line flanking the Job Title on both sides
// (reference image). Length/gap are new named constants, mm-sourced
// like every other spacing value in this file; color/thickness reuse
// COLOR_TITLE (the title's own gold) and HEADER_RULE_THICKNESS (this
// file's existing small fixed stroke width) — no new color or magic
// thickness introduced. Vertically centered on the title text using
// the same "baseline minus half cap-height" convention drawTimelineDot()/
// drawSectionIconBadge() already use elsewhere in this file.
const TITLE_ORNAMENT_LINE_LENGTH_MM = 8;
const TITLE_ORNAMENT_LINE_LENGTH_PT = TITLE_ORNAMENT_LINE_LENGTH_MM * MM_TO_PT;
const TITLE_ORNAMENT_LINE_GAP_MM = 2.2;
const TITLE_ORNAMENT_LINE_GAP_PT = TITLE_ORNAMENT_LINE_GAP_MM * MM_TO_PT;

// ------------------------------------------------------------------
// HEADER CONTACT ICONS — reference-image design transfer (a small
// pictogram before each contact item: email, phone, location,
// LinkedIn). Drawn the same way SECTION_ICON badges are (plain jsPDF
// vector shapes, not emoji text — see that block's own comment for why),
// just much smaller and without a filled circle behind them, in
// COLOR_TITLE (the reference image's contact icons are the same gold
// as the job title/its ornament lines/the border — NOT the contact
// line's own lighter text color) so they pick up the header's one
// accent color rather than blending into the text. Adding an icon
// does not change the Contact line's existing vertical geometry
// (contactBaselineY, BODY_LINE_HEIGHT per-line advance,
// contactInkBottomY, header divider position) — it only adds ink
// BEFORE each item's own text and pushes that item's text right by
// CONTACT_ITEM_ICON_FOOTPRINT_PT, the same single-source-of-truth
// pattern SECTION_ICON_TEXT_SHIFT_PT already uses for section headings.
// GitHub/portfolio contact items are not present in the reference
// image at all — their icons (see drawContactIcon() below) are
// therefore self-designed rather than copied, but reuse this exact
// same size/gap/color/line-width so they still look like they belong
// to the same set.
// ------------------------------------------------------------------
const CONTACT_ICON_SIZE_MM = 3.4;
const CONTACT_ICON_SIZE_PT = CONTACT_ICON_SIZE_MM * MM_TO_PT;
const CONTACT_ICON_TO_TEXT_GAP_MM = 1.6;
const CONTACT_ICON_TO_TEXT_GAP_PT = CONTACT_ICON_TO_TEXT_GAP_MM * MM_TO_PT;
const CONTACT_ITEM_ICON_FOOTPRINT_PT = CONTACT_ICON_SIZE_PT + CONTACT_ICON_TO_TEXT_GAP_PT;
const CONTACT_ICON_LINE_WIDTH_PT = 0.6; // small fixed stroke width for contact glyph linework — same "explicit small line width" convention as HEADER_RULE_THICKNESS/SECTION_ICON_GLYPH_LINE_WIDTH_PT

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

// INPUT-DRIVEN BULLET DETECTION: matches a bullet marker at the start
// of a manually-typed description line (after trimming), so bullets
// are rendered only when the INPUT itself already contains bullet
// markers/items — never added automatically for every Achievement.
// Recognizes the common plain-text bullet glyphs a user might type or
// paste (•, -, *, ‣, ◦, ●, ·), each followed by at least one space.
// Matched text is stripped before the line is treated as that bullet
// item's content, so the marker itself is never duplicated alongside
// the dot this file draws.
const BULLET_MARKER_REGEX = /^[•\-*‣◦●·]\s+/;

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
// DESIGN SOURCE (current): every value below is ported from the OLD
// EXECUTIVE PDF generator (the separate, class-based
// ExecutivePDFGenerator / EXECUTIVE_THEME file provided as this file's
// design reference), per the "OLD Executive design transfer" task.
// This REPLACES the color values this file held before (which were in
// turn ported from an unrelated OLD minimalPdf.ts palette, and before
// that a one-off yellow headline override) — only the RGB values
// changed; which named constant governs which piece of text (this
// file's own color architecture) is untouched, so no new per-section
// color logic was introduced. Historical comments elsewhere in this
// file that describe minimalPdf.ts's own design lineage are unrelated
// to this file's current colors and are left as-is.
const COLOR_NAME = [255, 255, 255] as const; // OLD Executive header name — white, drawn on the navy header band
const COLOR_TITLE = [184, 164, 106] as const; // OLD Executive header job title — theme `secondary` (muted gold), drawn on the navy header band
// OLD Executive theme's `textLight` — supporting metadata lines that
// are NOT dates and NOT the header contact line: company (Experience),
// institution (Education), tech (Projects), credential (Certifications),
// proficiency-adjacent text. Dates have their own, lighter color
// (COLOR_DATE below) and the header's contact line has its own color
// (COLOR_HEADER_CONTACT below) — OLD Executive renders all three as
// visibly different tones, so each gets its own constant instead of
// one shared "metadata" gray.
const COLOR_METADATA = [74, 74, 90] as const; // OLD Executive theme's `textLight`
// OLD Executive theme's `textLighter` — used only for right-aligned
// dates (Experience/Education/Achievements title rows), which OLD
// Executive renders visibly lighter than the company/institution line
// above them. See renderTitleRowWithDate() below, its only call site.
const COLOR_DATE = [122, 122, 138] as const;
const COLOR_RULE = [26, 58, 92] as const; // OLD Executive theme's `divider` (unused — see comment at its declaration)

// Gold/tan accent used throughout OLD Executive for every decorative
// line and border: the header's double border frame, the header photo's
// ring, every section-heading divider, and the Education/Certifications/
// Languages row's own heading divider and vertical column separators.
// Declared once and reused everywhere it appears in OLD Executive
// (matching OLD Executive's own single `colors.accent` value) rather
// than duplicating the same RGB triplet under several names.
const COLOR_SECTION_DIVIDER = [198, 167, 94] as const; // OLD Executive theme's `accent`

// Entry titles (job title, degree, language name, achievement title,
// certification name, project name) — OLD Executive's actual rendered
// color for every bold entry-title line (job title, degree, cert name,
// achievement title, project name), used consistently across its
// timeline/education/achievements/projects code — slightly darker than
// its declared theme.text, but this is the color OLD Executive actually
// paints, so it is what's reproduced here.
const COLOR_HEADING = [10, 10, 15] as const;

// Centralized color for the literal section-heading strings drawn by
// renderSectionHeading() ('PROFESSIONAL SUMMARY', 'EXPERIENCE',
// 'EDUCATION', 'SKILLS', 'LANGUAGES', 'ACHIEVEMENTS', 'CERTIFICATIONS',
// 'PROJECTS') — declared separately from COLOR_HEADING (above) so that
// entry-level titles, which also draw via COLOR_HEADING elsewhere in
// this file, stay on their own tone, exactly as OLD Executive keeps its
// section-title color (`colors.divider`, a navy-blue — used by OLD
// Executive's renderSectionTitle() and its Education/Certifications/
// Languages row heading) distinct from its entry-title color
// (COLOR_HEADING above). Only renderSectionHeading() below references
// this constant, so every section heading in the document is guaranteed
// to share this exact same color — one source of truth, no per-section
// hardcoding.
const COLOR_SECTION_HEADLINE = [26, 58, 92] as const; // OLD Executive theme's `divider` (navy-blue), used by OLD Executive for its section-heading text itself
// OLD Executive's bullet-dot accent (Achievements' bulleted
// description lines) — its theme `primary` (dark navy), distinct from
// the section-headline navy-blue above and from the near-black entry
// titles above.
const COLOR_SECTION_HEADING = [13, 27, 42] as const;
const COLOR_BODY = [26, 26, 46] as const; // normal paragraph/body text — OLD Executive theme's `text`

// GitHub/project link text (Projects section only) — OLD Executive's
// `link` color, kept as its own constant (rather than folded into
// COLOR_METADATA) because OLD Executive deliberately renders links in
// their own, more prominent tone (its theme `primary`/`link`, both the
// same dark navy) than ordinary metadata.
const COLOR_LINK = [13, 27, 42] as const;

// ------------------------------------------------------------------
// DATE/CREDENTIAL FIELDS THAT MATCH PROFESSIONAL SUMMARY BODY TEXT
// ------------------------------------------------------------------
// Requested: Experience Date, Education Date, Education Grade,
// Achievement Date, Certificate Credential ID, and Certificate Date
// must all render in EXACTLY the same color as the Professional
// Summary's normal body/content text — not a new color, not a
// derived/darkened shade, and not independently duplicated literals.
// The Professional Summary's body text itself is colored via
// COLOR_BODY (see addSummary() below, its only relevant call site) —
// COLOR_BODY IS the existing "Professional Summary body content color"
// source of truth. These six fields therefore reuse COLOR_BODY
// directly at their own doc.setTextColor(...) call sites below (no
// separate constant is declared here, since that would just be another
// copy of the exact same value COLOR_BODY already holds). See
// addExperienceEntry() (via renderTitleRowWithDate()),
// renderEducationColumn(), addAchievementEntry() (via
// renderTitleRowWithDate()), and renderCertificationColumn() below for
// the actual call sites.


// ------------------------------------------------------------------
// HEADER-ONLY COLORS (OLD Executive design transfer)
// ------------------------------------------------------------------
// OLD Executive's header is not plain white like the rest of the page —
// it is a solid navy band (its theme `primary`) framed by a double gold
// border (its theme `accent`, reusing COLOR_SECTION_DIVIDER above), with
// the header's own name/job-title/contact text recolored for
// legibility against that dark background (COLOR_NAME/COLOR_TITLE
// above, and COLOR_HEADER_CONTACT below). These constants exist only
// for that header band; nothing outside addHeader() uses them.
const COLOR_HEADER_BG = [13, 27, 42] as const; // OLD Executive theme's `primary`
// OLD Executive's literal header contact-line color — a light
// blue-gray distinct from both COLOR_METADATA and COLOR_DATE, chosen by
// OLD Executive specifically for legibility on the navy header band.
const COLOR_HEADER_CONTACT = [200, 220, 220] as const;

// Header border frame geometry. OLD Executive originally drew two
// nested gold rectangles inset from the header band's own edges;
// per request, only the OUTER rectangle is drawn now (see addHeader()
// below) — HEADER_BORDER_DRAWN_INSET_PT is its actual drawn position.
// HEADER_BORDER_INNER_INSET_PT is kept as a pure spacing reference:
// every header-sizing rule below (band height, divider position,
// content gaps) was derived from it and still is, even though no ink
// is drawn at that inset anymore — removing the inner rectangle's ink
// must not change where the header decides it needs more or less
// space, so this value is untouched. Expressed in mm, like every other
// mm-sourced constant in this file, and converted through the existing
// MM_TO_PT constant.
// Header border frame geometry. OLD Executive originally drew two
// nested gold rectangles inset from the header band's own edges, both
// at fixed/arbitrary mm insets; only the OUTER rectangle is drawn now
// (see addHeader() below), and per request it must sit fully ON the
// navy band on every side — not straddling navy/white at the bottom,
// and not leaving a visible strip of navy beyond it on any side either
// (top, left, right, or bottom). A fixed mm inset can't guarantee that
// (too small and the stroke bleeds past the band edge and gets clipped
// off the page; too large and it leaves that unwanted visible strip),
// so HEADER_BORDER_DRAWN_INSET_PT is derived purely from the stroke's
// own geometry instead of a tuned number: jsPDF strokes a rect centered
// on its own path, so a straight edge's ink reaches HALF the line
// width beyond that path, and a rectangle's CORNERS are square (miter)
// joins, whose own outer point reaches sqrt(2) times further out than
// a straight edge does (basic 90-degree miter-join geometry, not a
// tuned/arbitrary number). Insetting the border by exactly that
// worst-case (corner) reach means the stroke's outer edge lands EXACTLY
// on the band's true boundary on every side — fully visible (never
// clipped), and with nothing of the band's own fill color showing
// past it, anywhere.
// HEADER_BORDER_INNER_INSET_PT is kept as a pure spacing reference:
// every header-sizing rule below (band height, divider position,
// content gaps) was derived from it and still is, even though no ink
// is drawn at that inset anymore — removing the inner rectangle's ink
// must not change where the header decides it needs more or less
// space, so this value is untouched. Expressed in mm, like every other
// mm-sourced constant in this file, and converted through the existing
// MM_TO_PT constant.
const HEADER_BORDER_LINE_WIDTH_PT = 0.65 * MM_TO_PT; // OLD Executive's borderLineWidth, mm -> pt
const HEADER_BORDER_DRAWN_INSET_PT = (HEADER_BORDER_LINE_WIDTH_PT / 2) * Math.SQRT2;
const HEADER_BORDER_INNER_INSET_MM = 3.5;
const HEADER_BORDER_INNER_INSET_PT = HEADER_BORDER_INNER_INSET_MM * MM_TO_PT;

// ROOT CAUSE of the header borders feeling too tight: headerDividerTopEdgeY
// below reused the generic DIVIDER_SIDE_GAP_PT (the same gap every section
// heading uses before ITS divider), then the header's inner gold border cuts
// back in by HEADER_BORDER_INNER_INSET_PT from the band's bottom edge (==
// the divider's own center). Net visible space between the contact line's
// ink and the inner border works out to only a couple of points — nowhere
// near OLD Executive's own header, which felt open because its header
// height carried an explicit 8mm content-to-band-edge allowance below the
// contact line before its identical 1mm/3.5mm border insets were applied,
// leaving a real ~4.5mm gap between contact ink and its inner border
// (8mm - 3.5mm inner inset = 4.5mm — derived from OLD Executive's own
// geometry, not copied as a raw header-height number).
//
// This constant reproduces that SAME net visual gap (content ink -> inner
// border) using only this file's own architecture: it does not move the
// contact line itself, only the header's own divider (and therefore the
// band + border frame that are sized from it), so name/title/contact/photo
// positions are completely unaffected.
// Requested follow-up: the header border still felt tight, 2mm short on
// both the top and the bottom. Expressed as its own named "expansion" on
// top of the already-derived base gap, through the same MM_TO_PT
// conversion every other mm-sourced constant in this file uses — not a
// raw pt number folded into the base gap itself, so the original
// derivation above (base 4.5mm = OLD Executive's 8mm - 3.5mm inner inset)
// stays traceable on its own.
const HEADER_BORDER_BOTTOM_EXPANSION_MM = 3;
const HEADER_CONTENT_TO_INNER_BORDER_GAP_MM = 4.5 + HEADER_BORDER_BOTTOM_EXPANSION_MM;
const HEADER_CONTENT_TO_INNER_BORDER_GAP_PT = HEADER_CONTENT_TO_INNER_BORDER_GAP_MM * MM_TO_PT;

// Same follow-up request, top side: extra clearance between the header's
// top border and the name/title/photo block, inserted as its own named
// padding added to addHeader()'s own starting Y — it does not touch
// startY itself (the value every OTHER section still receives unchanged),
// only where the header's own content begins drawing from.
const HEADER_BORDER_TOP_EXPANSION_MM = 3;
const HEADER_TOP_EXTRA_PADDING_PT = HEADER_BORDER_TOP_EXPANSION_MM * MM_TO_PT;

// The actual "contact ink-bottom -> header divider top edge" offset used
// in place of DIVIDER_SIDE_GAP_PT inside addHeader() only. Solved backward
// from HEADER_CONTENT_TO_INNER_BORDER_GAP_PT so that, once the divider is
// drawn (adding SECTION_DIVIDER_THICKNESS / 2 to reach its center, which is
// also the band's bottom edge) and the inner border is inset
// HEADER_BORDER_INNER_INSET_PT back up from that edge, exactly
// HEADER_CONTENT_TO_INNER_BORDER_GAP_PT of clear space remains:
//   contactInkBottomY
//     + HEADER_DIVIDER_TOP_GAP_PT                (this constant)
//     + SECTION_DIVIDER_THICKNESS / 2             (ink-bottom -> band bottom edge)
//     - HEADER_BORDER_INNER_INSET_PT              (band bottom edge -> inner border)
//     == contactInkBottomY + HEADER_CONTENT_TO_INNER_BORDER_GAP_PT
const HEADER_DIVIDER_TOP_GAP_PT =
  HEADER_CONTENT_TO_INNER_BORDER_GAP_PT + HEADER_BORDER_INNER_INSET_PT - SECTION_DIVIDER_THICKNESS / 2;

// Thin gold ring drawn around the circular header photo, per OLD
// Executive's `usePhotoBorder: true` / `photoBorderWidth: 2` (mm).
// Requested follow-up: the ring itself has been removed from addHeader()
// below (the image is now a clean circle with no outline), so this
// constant is now unused — left declared rather than deleted, same
// convention as HEADER_RULE_GAP elsewhere in this file.
const HEADER_PHOTO_BORDER_WIDTH_PT = 2 * MM_TO_PT;

// ------------------------------------------------------------------
// EDUCATION/CERTIFICATIONS/LANGUAGES ROW — column geometry (OLD
// Executive design transfer, explicit follow-up request: OLD
// Executive's Education/Certifications/Languages row-with-column-
// dividers layout, reproduced exactly). None of these existed in the
// current architecture before this request, so they are introduced
// here, once, as their own named constants rather than raw inline
// numbers — mirroring OLD Executive's own tuned values (which were
// mm-based) through the existing MM_TO_PT conversion, same convention
// as every other mm-sourced constant in this file.
// ------------------------------------------------------------------
const COLUMN_GAP_MM = 3; // OLD Executive's `gapAroundLine` — reserved on each side of every vertical column divider
const COLUMN_GAP_PT = COLUMN_GAP_MM * MM_TO_PT;
// Small nudge applied to a column's CONTENT start only (not its heading,
// which stays flush with the column's own X) — expressed as a fraction of
// that column's own width so it scales with column width instead of being
// a raw pt number. Certifications already used this fraction for its own
// content start; Languages now reuses the exact same named constant
// instead of its own separate (much larger) hardcoded fraction, so every
// column's heading-flush / content-inset relationship is identical.
const COLUMN_CONTENT_INSET_FRACTION = 0.02;

// ------------------------------------------------------------------
// SECTION ICON BADGES (reference-image design transfer)
// ------------------------------------------------------------------
// The reference image renders every section heading (Professional
// Summary, Experience, Education, Certifications, Languages, Skills,
// Achievements, Projects) with a small filled circle to the left of
// the heading text, holding a simple white pictogram. This file's
// only font is jsPDF's built-in "helvetica", whose encoding has no
// emoji glyphs — a literal emoji character silently renders as
// unrelated Latin-1 punctuation, not the intended pictogram (verified
// before writing this), so each badge's glyph is drawn as a plain
// jsPDF vector shape (circle/rect/triangle/line) instead of text —
// the only way to reproduce the image's icons reliably with this
// file's existing font.
//
// Badge fill reuses COLOR_HEADER_BG (the same navy already used for
// the header band) and glyph linework reuses COLOR_NAME (the same
// white already used for the header name) — no new colors are
// introduced. Size/spacing are new named constants, mm-sourced through
// the existing MM_TO_PT conversion like every other spacing value in
// this file. Drawing a badge does NOT change any existing vertical gap
// (SECTION_GAP, DIVIDER_SIDE_GAP_PT, sectionHeadingToContentOffset()'s
// geometry, the shared divider's own width/position, or the
// Education/Certifications/Languages column geometry above) — it only
// adds ink to the LEFT of a heading's own text and pushes that single
// line of heading text right by exactly the badge's own footprint
// (SECTION_ICON_TEXT_SHIFT_PT below), so nothing already on the page
// moves.
// ------------------------------------------------------------------
const SECTION_ICON_BADGE_DIAMETER_MM = 7;
const SECTION_ICON_BADGE_DIAMETER_PT = SECTION_ICON_BADGE_DIAMETER_MM * MM_TO_PT;
const SECTION_ICON_BADGE_RADIUS_PT = SECTION_ICON_BADGE_DIAMETER_PT / 2;
const SECTION_ICON_TO_TEXT_GAP_MM = 2.2;
const SECTION_ICON_TO_TEXT_GAP_PT = SECTION_ICON_TO_TEXT_GAP_MM * MM_TO_PT;
// Total horizontal footprint a badge reserves before the heading text
// that follows it — the single source of truth every call site below
// uses to shift its own heading text's X, so the drawn badge and the
// shifted text can never drift apart.
const SECTION_ICON_TEXT_SHIFT_PT = SECTION_ICON_BADGE_DIAMETER_PT + SECTION_ICON_TO_TEXT_GAP_PT;
const SECTION_ICON_BADGE_FILL_COLOR = COLOR_HEADER_BG; // reused header navy
const SECTION_ICON_GLYPH_COLOR = COLOR_NAME; // reused header white
const SECTION_ICON_GLYPH_LINE_WIDTH_PT = 0.9; // small fixed stroke width for glyph linework — same "explicit small line width" convention as HEADER_RULE_THICKNESS

export type SectionIconType =
  | 'summary'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'languages'
  | 'skills'
  | 'achievements'
  | 'projects';

// Draws one circular icon badge, left-anchored at `leftX` (its own left
// edge — the same X a heading's text would otherwise start at) and
// vertically centered on `headingBaselineY` using the exact same
// "baseline minus half cap-height" convention drawTimelineDot()'s dotY
// already uses for the Experience timeline dot elsewhere in this file
// (see EXPERIENCE_TITLE_SIZE * HELVETICA_ASCENT_RATIO / 2 there) —
// applied here with HEADING_SIZE, since a badge sits beside a section
// heading, not an entry title. Every glyph below is sized as a ratio
// of the badge's own radius `r`, so the whole badge scales as one unit
// if SECTION_ICON_BADGE_DIAMETER_MM is ever tuned — no glyph uses a raw
// pt number of its own.
function drawSectionIconBadge(
  doc: jsPDF,
  iconType: SectionIconType,
  leftX: number,
  headingBaselineY: number
): void {
  const cx = leftX + SECTION_ICON_BADGE_RADIUS_PT;
  const cy = headingBaselineY - (HEADING_SIZE * HELVETICA_ASCENT_RATIO) / 2;
  const r = SECTION_ICON_BADGE_RADIUS_PT;

  doc.setFillColor(...SECTION_ICON_BADGE_FILL_COLOR);
  doc.circle(cx, cy, r, 'F');

  doc.setDrawColor(...SECTION_ICON_GLYPH_COLOR);
  doc.setFillColor(...SECTION_ICON_GLYPH_COLOR);
  doc.setLineWidth(SECTION_ICON_GLYPH_LINE_WIDTH_PT);

  switch (iconType) {
    case 'summary': {
      // Person: head + shoulders.
      doc.circle(cx, cy - r * 0.32, r * 0.26, 'F');
      doc.roundedRect(cx - r * 0.42, cy + r * 0.06, r * 0.84, r * 0.5, r * 0.18, r * 0.18, 'F');
      break;
    }
    case 'experience': {
      // Briefcase: handle + body + divider line.
      doc.roundedRect(cx - r * 0.22, cy - r * 0.42, r * 0.44, r * 0.24, r * 0.06, r * 0.06, 'S');
      doc.roundedRect(cx - r * 0.5, cy - r * 0.16, r, r * 0.62, r * 0.08, r * 0.08, 'F');
      doc.setDrawColor(...SECTION_ICON_BADGE_FILL_COLOR);
      doc.line(cx - r * 0.5, cy + r * 0.15, cx + r * 0.5, cy + r * 0.15);
      break;
    }
    case 'education': {
      // Graduation cap: mortarboard diamond + band + tassel.
      doc.triangle(cx - r * 0.55, cy - r * 0.08, cx, cy - r * 0.38, cx + r * 0.55, cy - r * 0.08, 'F');
      doc.triangle(cx - r * 0.55, cy - r * 0.08, cx, cy + r * 0.18, cx + r * 0.55, cy - r * 0.08, 'F');
      doc.roundedRect(cx - r * 0.16, cy - r * 0.06, r * 0.32, r * 0.16, r * 0.03, r * 0.03, 'F');
      doc.line(cx + r * 0.32, cy - r * 0.02, cx + r * 0.44, cy + r * 0.34);
      doc.circle(cx + r * 0.44, cy + r * 0.4, r * 0.07, 'F');
      break;
    }
    case 'certifications': {
      // Medal: ringed medallion + two ribbon tails.
      doc.triangle(cx - r * 0.28, cy + r * 0.08, cx - r * 0.06, cy + r * 0.5, cx - r * 0.4, cy + r * 0.5, 'F');
      doc.triangle(cx + r * 0.28, cy + r * 0.08, cx + r * 0.06, cy + r * 0.5, cx + r * 0.4, cy + r * 0.5, 'F');
      doc.circle(cx, cy - r * 0.1, r * 0.36, 'S');
      doc.circle(cx, cy - r * 0.1, r * 0.16, 'F');
      break;
    }
    case 'languages': {
      // Globe: outer ring + equator + meridian.
      doc.circle(cx, cy, r * 0.42, 'S');
      doc.setDrawColor(...SECTION_ICON_GLYPH_COLOR);
      doc.line(cx - r * 0.42, cy, cx + r * 0.42, cy);
      doc.ellipse(cx, cy, r * 0.18, r * 0.42, 'S');
      break;
    }
    case 'skills': {
      // Gear: outer body ring + center hub + eight radially-oriented
      // rectangular teeth (a real cog silhouette, not a ring of dots —
      // each tooth is a small rectangle rotated to point straight out
      // from the center, computed via basic trig off the same radius
      // ratios every other glyph here uses, not raw coordinates).
      doc.circle(cx, cy, r * 0.5, 'S');
      doc.circle(cx, cy, r * 0.14, 'F');
      const toothCount = 8;
      const toothInnerRadius = r * 0.5;
      const toothOuterRadius = r * 0.74;
      const toothHalfWidth = r * 0.12;
      for (let i = 0; i < toothCount; i += 1) {
        const angle = (i / toothCount) * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const perpX = -sinA;
        const perpY = cosA;
        const innerX = cx + cosA * toothInnerRadius;
        const innerY = cy + sinA * toothInnerRadius;
        const outerX = cx + cosA * toothOuterRadius;
        const outerY = cy + sinA * toothOuterRadius;
        const p1x = innerX + perpX * toothHalfWidth;
        const p1y = innerY + perpY * toothHalfWidth;
        const p2x = outerX + perpX * toothHalfWidth;
        const p2y = outerY + perpY * toothHalfWidth;
        const p3x = outerX - perpX * toothHalfWidth;
        const p3y = outerY - perpY * toothHalfWidth;
        const p4x = innerX - perpX * toothHalfWidth;
        const p4y = innerY - perpY * toothHalfWidth;
        doc.lines(
          [
            [p2x - p1x, p2y - p1y],
            [p3x - p2x, p3y - p2y],
            [p4x - p3x, p4y - p3y],
          ],
          p1x,
          p1y,
          [1, 1],
          'F',
          true
        );
      }
      break;
    }
    case 'achievements': {
      // Trophy: cup bowl + stem + base.
      doc.roundedRect(cx - r * 0.34, cy - r * 0.4, r * 0.68, r * 0.4, r * 0.1, r * 0.1, 'F');
      doc.rect(cx - r * 0.07, cy, r * 0.14, r * 0.22, 'F');
      doc.roundedRect(cx - r * 0.26, cy + r * 0.22, r * 0.52, r * 0.12, r * 0.03, r * 0.03, 'F');
      break;
    }
    case 'projects': {
      // Folder: tab + body.
      doc.roundedRect(cx - r * 0.45, cy - r * 0.32, r * 0.4, r * 0.2, r * 0.05, r * 0.05, 'F');
      doc.roundedRect(cx - r * 0.45, cy - r * 0.16, r * 0.9, r * 0.56, r * 0.06, r * 0.06, 'F');
      break;
    }
  }
}

// ------------------------------------------------------------------
// HEADER CONTACT ICONS (see the CONTACT_ICON_* constants above for the
// full design-transfer rationale). Drawn as thin outline/filled glyphs
// in COLOR_TITLE — the same gold as the job title/ornament lines/gold
// border, matching the reference image (not the contact line's own
// lighter text color).
// ------------------------------------------------------------------
export type ContactItemType = 'email' | 'phone' | 'location' | 'address' | 'linkedin' | 'github' | 'website';

function drawContactIcon(
  doc: jsPDF,
  iconType: ContactItemType,
  leftX: number,
  baselineY: number
): void {
  const cx = leftX + CONTACT_ICON_SIZE_PT / 2;
  const cy = baselineY - (METADATA_SIZE * HELVETICA_ASCENT_RATIO) / 2;
  const s = CONTACT_ICON_SIZE_PT / 2;

  // Reference-image color match: every header contact icon is the
  // same gold as the job title / ornament lines / gold border, NOT the
  // contact line's own (lighter) text color — COLOR_TITLE is this
  // file's single existing constant for that gold, already used by
  // the title and its ornament lines above, so reusing it here
  // introduces no new color.
  doc.setDrawColor(...COLOR_TITLE);
  doc.setFillColor(...COLOR_TITLE);
  doc.setLineWidth(CONTACT_ICON_LINE_WIDTH_PT);

  switch (iconType) {
    case 'email': {
      // Envelope: outline rect + diagonal flap lines.
      doc.roundedRect(cx - s * 0.9, cy - s * 0.6, s * 1.8, s * 1.2, s * 0.08, s * 0.08, 'S');
      doc.line(cx - s * 0.85, cy - s * 0.55, cx, cy + s * 0.1);
      doc.line(cx + s * 0.85, cy - s * 0.55, cx, cy + s * 0.1);
      break;
    }
    case 'phone': {
      // Telephone receiver, redesigned to be UNAMBIGUOUSLY straight and
      // horizontal: the previous version's connecting handle was a
      // one-sided curve (bowed toward one side only), and that kind of
      // asymmetric bow is exactly what reads as a "tilt" even though
      // both of its end bells sit at the same height — so this version
      // drops the curve entirely. Every shape here is mirror-symmetric
      // on BOTH axes (left-right AND top-bottom): a straight filled bar
      // dead-center between two equal-size end bells, each bell built
      // from a circle merged with a symmetric (top/bottom-mirrored)
      // triangular taper — the same "circle + tapered triangle"
      // construction the `location`/`address` pin below uses for its
      // own head, just narrowing back toward the CENTER instead of away
      // from it. With no diagonal line and no one-sided curve anywhere
      // in the shape, there is nothing left that could read as tilted,
      // pointing up, or pointing down — only a level, horizontal glyph.
      // Same COLOR_TITLE gold every other contact icon already uses.
      // Overall icon footprint (bell-tip to bell-tip span) is
      // approximately the same visual size as before.
      const halfLen = s * 0.65;
      const bellR = s * 0.36;
      const bellTaperLen = s * 0.3;
      const bellBaseHalfWidth = bellR * 0.9;
      const bellInset = bellR * 0.25; // how far inside its own bell circle the taper's wide edge sits, so the two shapes merge with no seam
      const barHalfHeight = s * 0.13;

      const startX = cx - halfLen;
      const endX = cx + halfLen;

      const drawBell = (bulbX: number, outward: number): void => {
        // outward = +1 for the right-hand bell, -1 for the left-hand
        // bell, so "inward" (toward the center bar) is just its
        // negation — kept as a direction multiplier (not a full
        // vector) since this glyph is purely horizontal.
        const insideX = bulbX - outward * bellInset;
        const apexX = bulbX - outward * bellTaperLen;
        doc.triangle(insideX, cy - bellBaseHalfWidth, insideX, cy + bellBaseHalfWidth, apexX, cy, 'F');
        doc.circle(bulbX, cy, bellR, 'F');
      };

      // Straight center bar first (so both bells are drawn on top of
      // its ends, covering the join with no visible seam) — a plain
      // filled rectangle, perfectly level, with no bow in either
      // direction.
      doc.rect(startX, cy - barHalfHeight, endX - startX, barHalfHeight * 2, 'F');

      drawBell(startX, -1);
      drawBell(endX, 1);
      break;
    }
    case 'location':
    case 'address': {
      // Map pin: a real teardrop pin — solid filled head merged with a
      // solid pointed base (the head's circle and the base triangle
      // overlap, so there's no seam/gap between them), plus a small
      // punched-through hole near the top for the classic pin look.
      // `address` (street/mailing address) reuses this same pin glyph
      // as `location` (city) — both are place-type contact items and
      // the reference image only shows one place-pin icon design, so
      // `address` isn't given a second, invented pin shape. The old
      // version stroked the head as a hollow ring with the base
      // triangle starting below it, which read as a lollipop (a
      // circle on a separate stick) rather than one fused pin shape —
      // fixed by filling the head solid and overlapping the base's own
      // top edge INSIDE the head's circle instead of below it.
      const pinHeadCy = cy - s * 0.15;
      const pinHeadR = s * 0.5;
      doc.setFillColor(...COLOR_TITLE);
      doc.circle(cx, pinHeadCy, pinHeadR, 'F');
      doc.triangle(
        cx - pinHeadR * 0.85,
        pinHeadCy + pinHeadR * 0.45,
        cx + pinHeadR * 0.85,
        pinHeadCy + pinHeadR * 0.45,
        cx,
        cy + s * 0.85,
        'F'
      );
      // Hole punched through the head, in the header's own navy
      // background color (COLOR_HEADER_BG — the only background this
      // icon is ever drawn on) rather than a new color.
      doc.setFillColor(...COLOR_HEADER_BG);
      doc.circle(cx, pinHeadCy, pinHeadR * 0.4, 'F');
      break;
    }
    case 'linkedin': {
      // "in" glyph only (reference image: no square/badge outline
      // around it, just the gold letterforms). "i": dot + short bar.
      // "n": a tall left stroke, a bridge across the top, and a
      // shorter right stroke starting below the bridge (the arch).
      doc.circle(cx - s * 0.55, cy - s * 0.55, s * 0.12, 'F');
      doc.rect(cx - s * 0.62, cy - s * 0.25, s * 0.14, s * 0.6, 'F');
      doc.rect(cx - s * 0.32, cy - s * 0.25, s * 0.14, s * 0.6, 'F');
      doc.rect(cx - s * 0.32, cy - s * 0.25, s * 0.5, s * 0.14, 'F');
      doc.rect(cx + s * 0.04, cy - s * 0.11, s * 0.14, s * 0.46, 'F');
      break;
    }
    case 'website': {
      // Not in the reference image (self-added, matching the other
      // contact icons' size/weight/gold color): a globe/link glyph —
      // ring + equator, the same generic-link motif the Languages
      // section badge already uses at full size, just scaled to this
      // icon's own radius `s`.
      doc.circle(cx, cy, s * 0.75, 'S');
      doc.line(cx - s * 0.75, cy, cx + s * 0.75, cy);
      break;
    }
    case 'github': {
      // Not in the reference image either (self-added): a code-brackets
      // "</>" glyph — two angled chevrons, read as a developer/code
      // link rather than a generic globe, so it stays visually distinct
      // from 'website' immediately above.
      doc.lines([[-s * 0.35, s * 0.35], [s * 0.35, s * 0.35]], cx - s * 0.85, cy - s * 0.35, [1, 1], 'S', false);
      doc.lines([[s * 0.35, s * 0.35], [-s * 0.35, s * 0.35]], cx + s * 0.15, cy - s * 0.35, [1, 1], 'S', false);
      break;
    }
  }
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
export interface ExecutivePdfPersonalInfo {
  name?: string;
  title?: string;
  jobTitle?: string;
  email?: string;
  location?: string;
  city?: string;
  address?: string; // header contact-line street/mailing address — separate from location/city (e.g. "12 Main St, Apt 4"), shown as its own contact item when present
  linkedin?: string;
  github?: string; // header contact-line GitHub URL — CONFIRMED field
  // name (`personalInfo.github`) against the actual ATSPro generator
  // (atsProPdf.ts), which already reads this same field for its own
  // contact line. Distinct from ExecutivePdfProject.github below, which
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

export interface ExecutivePdfData {
  personalInfo: ExecutivePdfPersonalInfo;
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
  experiences?: ExecutivePdfExperience[];

  // CONFIRMED against the project's actual EducationItem
  // (src/components/cv-builder/types/cvTypes.ts / EducationSection.tsx):
  // fields used are degree, institution, year (already a combined
  // "start - end" string, not separate startDate/endDate), and grade.
  // There is no location or description field on an education entry,
  // so Phase 4 does not render either (nothing to fabricate).
  educations?: ExecutivePdfEducation[];

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
  languages?: ExecutivePdfLanguage[];

  // CONFIRMED against the project's actual AchievementItem
  // (src/components/cv-builder/types/cvTypes.ts / AchievementsSection.tsx):
  // fields used are title, date, description. All fields are optional.
  achievements?: ExecutivePdfAchievement[];

  // CONFIRMED against the project's actual CertificationItem
  // (src/components/cv-builder/types/cvTypes.ts / CertificationsSection.tsx):
  // fields used are name, date, credentialId. All fields are optional.
  certifications?: ExecutivePdfCertification[];

  // CONFIRMED against the project's actual ProjectItem
  // (src/components/cv-builder/types/cvTypes.ts / ProjectsSection.tsx):
  // fields used are name, tech, description, github. All fields are optional.
  projects?: ExecutivePdfProject[];

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
export interface ExecutivePdfExperience {
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
export interface ExecutivePdfEducation {
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
export interface ExecutivePdfLanguage {
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
export interface ExecutivePdfAchievement {
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
export interface ExecutivePdfCertification {
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
export interface ExecutivePdfProject {
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
// generateExecutivePDF, before knowing whether the next section will
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
  firstContentFontSize: number,
  iconType: SectionIconType
): number {
  // --- Icon badge (see drawSectionIconBadge() above) + heading text.
  // The badge sits at LEFT_MARGIN, exactly where the heading text used
  // to start; the text itself now starts SECTION_ICON_TEXT_SHIFT_PT
  // further right, using the single shared constant that also sized
  // the badge, so the two can never drift apart. Nothing else here —
  // font, size, color, divider math, vertical position — changes. ---
  drawSectionIconBadge(doc, iconType, LEFT_MARGIN, startY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(HEADING_SIZE);
  doc.setTextColor(...COLOR_SECTION_HEADLINE); // OLD Executive design transfer: section-headline color — see COLOR_SECTION_HEADLINE above. Everything else in this function (font, size, position, divider math) is unchanged.
  doc.text(headingText, LEFT_MARGIN + SECTION_ICON_TEXT_SHIFT_PT, startY);

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
export function generateExecutivePDF(data: ExecutivePdfData): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  let y = TOP_MARGIN;

  y = addHeader(doc, data, y);
  y = addSummary(doc, data, y);
  y = addExperience(doc, data, y);
  y = addEducationCertificationsLanguagesRow(doc, data, y);
  y = addSkills(doc, data, y);
  y = addAchievements(doc, data, y);
  y = addProjects(doc, data, y);

  return doc;
}

// ====================================================================
// HEADER SECTION (Phase 1, + circular profile-photo layout, + OLD
// EXECUTIVE PDF header design transfer)
// Renders: a navy header band (full page width, single gold border
// frame — the outer of the original two nested rules; the inner one
// has been removed per request) containing photo (optional, top-left,
// circular) + name + job title (optional) + contact line (optional),
// followed by the header's own gold divider.
//
// PHOTO GEOMETRY (size/position only) is ported from the ATSPro
// generator (atsProPdf.ts addHeader()) per an earlier request — this
// file's own margins, gaps (NAME_TO_TITLE_GAP, TITLE_TO_CONTACT_GAP,
// DIVIDER_SIDE_GAP_PT, etc.) are unchanged by that or by the design
// transfer below.
//
// STRUCTURE (OLD Executive header-design transfer): this function is
// now a MEASURE-THEN-DRAW function instead of measuring and drawing
// interleaved. Every Y-position/line-wrapping calculation below is
// completely unchanged (byte-for-byte the same formulas as before this
// transfer) — the only difference is that no actual ink (doc.text /
// doc.circle / doc.addImage / doc.line) is placed until the FULL
// header geometry is known, so the navy band + gold border can be
// drawn first, underneath everything else. This is what makes the
// band's height dynamic (driven by this file's existing header-content
// measurements — name/title line count, contact-line wrapping, photo
// presence) instead of a hardcoded number: growing/shrinking header
// content still grows/shrinks the band exactly as it already grew/
// shrank the header's own footprint before this change.
//
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addHeader(doc: jsPDF, data: ExecutivePdfData, startY: number): number {
  // +HEADER_TOP_EXTRA_PADDING_PT only affects where THIS header's own
  // content (name/title/photo) begins drawing — startY itself (what the
  // caller passed, TOP_MARGIN) is untouched, so nothing outside this
  // function is affected by this padding.
  let y = startY + HEADER_TOP_EXTRA_PADDING_PT;
  const { personalInfo, phoneNumber, selectedCountryCode } = data;

  const name = (personalInfo?.name || '').trim() || 'Your Name';
  const jobTitle = (personalInfo?.title || personalInfo?.jobTitle || '').trim();
  const hasPhoto = isValidPhotoSource(personalInfo?.photo);

  // ------------------------------------------------------------------
  // PHASE A — MEASUREMENT ONLY. Every value below is computed with the
  // exact same formulas the pre-transfer version of this function used
  // while drawing inline. Font/size selection here (doc.setFont /
  // doc.setFontSize) only affects subsequent MEASUREMENT calls
  // (splitTextToSize / getTextWidth / getImageProperties) — none of
  // these paint anything to the page, so no visual ink exists yet.
  // ------------------------------------------------------------------
  let nameBaselineY = 0;
  let titleBaselineY: number | null = null;
  // Horizontal centering (a prior request) has been reverted per this
  // request: Name and Job Title are back to the original, un-centered
  // left-side positioning calculation — textStartX = LEFT_MARGIN, the
  // same constant every other left-aligned header/content element in
  // this file already uses, not a new/tuned coordinate. Their vertical
  // position (nameBaselineY/titleBaselineY at draw time) is untouched
  // by this revert — see NAME_TITLE_VERTICAL_SHIFT_PT below, which
  // still applies exactly as before.
  let textStartX = LEFT_MARGIN;

  // Photo-branch-only measurements (left undefined when there's no photo).
  let photoX = 0, photoTopY = 0, photoRadius = 0, photoCenterX = 0, photoCenterY = 0;
  let photoSource = '', imgFormat = '';
  let drawWidth = 0, drawHeight = 0, drawX = 0, drawY = 0;

  if (hasPhoto) {
    // --- Name & job title baselines — identical Y math to the
    // no-photo branch below; the photo changes X positioning only. ---
    nameBaselineY = y;
    titleBaselineY = jobTitle ? nameBaselineY + NAME_SIZE + NAME_TO_TITLE_GAP : null;

    // --- Real ink-space vertical span of the name/job-title block, so
    // the photo centers against actual text height, not a guess. ---
    const blockTopY = nameBaselineY - NAME_SIZE * HELVETICA_ASCENT_RATIO;
    const blockBottomY = titleBaselineY !== null
      ? titleBaselineY + TITLE_SIZE * HELVETICA_DESCENT_RATIO
      : nameBaselineY + NAME_SIZE * HELVETICA_DESCENT_RATIO;
    const blockHeight = blockBottomY - blockTopY;

    // --- Photo geometry: RIGHT edge of the header (requested move from
    // its previous top-left position — see the reference image), still
    // vertically centered on the name/job-title block computed above.
    // photoX is now anchored off PAGE_WIDTH - RIGHT_MARGIN (the exact
    // same right-edge constant every other right-aligned element in
    // this file already uses — e.g. the section dividers' own right
    // endpoint), not a new/tuned number. Uses HEADER_PHOTO_RENDER_SIZE_PT
    // (not HEADER_PHOTO_SIZE_PT) so the +7px increase still applies —
    // vertical centering (blockTopY + blockHeight / 2) is independent of
    // X entirely, so it is unaffected by this move. ---
    photoX = PAGE_WIDTH - RIGHT_MARGIN - HEADER_PHOTO_RENDER_SIZE_PT;
    photoTopY = blockTopY + (blockHeight - HEADER_PHOTO_RENDER_SIZE_PT) / 2;
    photoRadius = HEADER_PHOTO_RENDER_SIZE_PT / 2;
    photoCenterX = photoX + photoRadius;
    photoCenterY = photoTopY + photoRadius;

    // --- Measure the photo (aspect ratio only — no drawing yet).
    // "cover" fit: the image is scaled so its shorter side exactly
    // fills the circle's diameter, and centered so the circular clip
    // crops the longer side evenly on both sides. ---
    photoSource = (personalInfo?.photo as string).trim();
    imgFormat = getImageFormatFromDataUrl(photoSource);
    const imgProps = doc.getImageProperties(photoSource);
    const imgAspect = imgProps.width / imgProps.height;
    drawWidth = imgAspect >= 1 ? HEADER_PHOTO_RENDER_SIZE_PT * imgAspect : HEADER_PHOTO_RENDER_SIZE_PT;
    drawHeight = imgAspect >= 1 ? HEADER_PHOTO_RENDER_SIZE_PT : HEADER_PHOTO_RENDER_SIZE_PT / imgAspect;
    drawX = photoX - (drawWidth - HEADER_PHOTO_RENDER_SIZE_PT) / 2;
    drawY = photoTopY - (drawHeight - HEADER_PHOTO_RENDER_SIZE_PT) / 2;

    // --- Text block X: the photo is now on the RIGHT, so the name/
    // title block never needed to leave room for it — it keeps the
    // same `textStartX = LEFT_MARGIN` default every other (no-photo)
    // case already uses, so this branch does not override it.
    // PHOTO_TO_TEXT_GAP_PT is left declared but now unused here, same
    // "keep the old constant rather than delete it" convention this
    // file already follows for HEADER_RULE_GAP/HEADER_PHOTO_BORDER_WIDTH_PT
    // elsewhere. ---

    // --- Advance Y past whichever is taller: the text block or the
    // photo — so a photo larger than a title-less name row doesn't
    // have its bottom edge overlapped by the contact line below.
    // Also deliberately still reads HEADER_PHOTO_SIZE_PT (the ORIGINAL
    // size) — this is the same "keep every other header calculation
    // exactly as it was" rule: the contact line's start Y (and
    // therefore the header's total height/border) must not shift just
    // because the photo itself got visually larger. ---
    y = jobTitle && titleBaselineY !== null
      ? titleBaselineY + TITLE_SIZE + TITLE_TO_CONTACT_GAP
      : nameBaselineY + NAME_SIZE + NAME_TO_TITLE_GAP;
    const photoBottomY = photoTopY + HEADER_PHOTO_SIZE_PT;
    const photoOverhang = Math.max(0, photoBottomY - blockBottomY);
    y += photoOverhang;
    y += PHOTO_TO_CONTACT_GAP_PT;
  } else {
    // --- NO PHOTO ---
    // Requested: Name drawn 2mm lower, Job Title drawn 1mm lower, than
    // this branch's previously unchanged geometry. The offsets are
    // added ONLY to the baseline Y values used for DRAWING the Name/
    // Job Title text (nameBaselineY/titleBaselineY) — the plain `y`
    // cursor below (which flows into the Contact line's position, and
    // from there into the header divider's position) advances exactly
    // as it always did, so Contact/divider/header height/every gap
    // stay completely unchanged, per request.
    nameBaselineY = y + NO_IMAGE_NAME_Y_OFFSET_PT;
    y += NAME_SIZE; // move past the line's own height
    y += NAME_TO_TITLE_GAP;

    if (jobTitle) {
      titleBaselineY = y + NO_IMAGE_TITLE_Y_OFFSET_PT;
      y += TITLE_SIZE;
      y += TITLE_TO_CONTACT_GAP;
    }
  }

  // --- Contact line (email | phone | location | linkedin | github |
  // website) — always starts at LEFT_MARGIN and uses the full
  // CONTENT_WIDTH, independent of the photo, identical in both
  // branches above. Each item now carries its own icon type (see
  // buildContactParts()/ContactItem above), wrapped via
  // buildContactLines() so a line only breaks between whole items
  // (icon + its text never split apart), reserving
  // CONTACT_ITEM_ICON_FOOTPRINT_PT per item instead of the old
  // plain-string splitTextToSize() wrap. ---
  const contactParts = buildContactParts(personalInfo, phoneNumber, selectedCountryCode);
  const contactBaselineY = y;
  let wrappedContactLines: ContactItem[][] = [];
  // Ink-bottom reference point for whatever the divider gap measures
  // from. Defaults to the current cursor (used as-is when there's no
  // contact line at all — an unchanged edge case). Overwritten below
  // once the contact line's real last-line ink-bottom is known.
  let contactInkBottomY = y;
  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(METADATA_SIZE);

    // Wrap in case a very long combination of contact details doesn't
    // fit on one line at this font size.
    wrappedContactLines = buildContactLines(doc, contactParts, CONTENT_WIDTH);

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
    // Consecutive Contact lines use BODY_LINE_HEIGHT (the same normal
    // content/body line-height Professional Summary's wrapped
    // paragraph already advances by — see addSummary()'s
    // `y += BODY_LINE_HEIGHT` loop) instead of METADATA_SIZE, so the
    // gap between any two consecutive Contact lines matches the
    // Professional Summary body-content line gap exactly, for any
    // number of Contact lines. Font size itself (METADATA_SIZE) is
    // unchanged — only the line-to-line vertical advance changes.
    const lastContactLine = wrappedContactLines[wrappedContactLines.length - 1];
    const lastContactLineText = lastContactLine.map((item) => item.text).join(CONTACT_SEPARATOR);
    const lastContactBaselineY = y + (wrappedContactLines.length - 1) * BODY_LINE_HEIGHT;
    contactInkBottomY = lastContactBaselineY + (hasDescenderChar(lastContactLineText) ? METADATA_SIZE * HELVETICA_DESCENT_RATIO : 0);

    y += wrappedContactLines.length * BODY_LINE_HEIGHT;
  }

  // --- Header divider geometry ---
  // Reuses the SAME divider design system every section already uses
  // (COLOR_SECTION_DIVIDER + SECTION_DIVIDER_THICKNESS, drawn centered
  // on its Y exactly like renderSectionHeading()'s divider) — not the
  // old, never-wired COLOR_RULE/HEADER_RULE_THICKNESS constants, which
  // were declared for this purpose but never actually drawn. Left
  // those two constants in place (unused) since removing constants is
  // outside the scope of this change. HEADER_RULE_GAP is likewise left
  // declared but now unused here. "Contact -> divider" is measured from
  // the exact same kind of reference point every section heading uses
  // before its own divider (real ink-bottom, not baseline) — but, unlike
  // the rest of this function's original design-transfer, this gap now
  // uses its OWN header-specific constant, HEADER_DIVIDER_TOP_GAP_PT,
  // instead of the shared DIVIDER_SIDE_GAP_PT: the header's gold border
  // frame is inset from this divider's position (it doubles as the
  // band's bottom edge, see PHASE B), so DIVIDER_SIDE_GAP_PT left almost
  // no visible space between the contact line and the inner border. See
  // HEADER_DIVIDER_TOP_GAP_PT's own definition above for the full
  // derivation. This divider's thickness is UNCHANGED by the design
  // transfer below — only its color (COLOR_SECTION_DIVIDER's value) and
  // the fact that it now doubles as the navy header band's own bottom
  // edge (see PHASE B) have changed.
  const headerDividerTopEdgeY = contactInkBottomY + HEADER_DIVIDER_TOP_GAP_PT;
  const headerDividerCenterY = headerDividerTopEdgeY + SECTION_DIVIDER_THICKNESS / 2;
  const headerDividerBottomEdgeY = headerDividerCenterY + SECTION_DIVIDER_THICKNESS / 2; // divider's real, visible ink-bottom — unchanged geometry

  // ------------------------------------------------------------------
  // PHASE B — DRAW. Every coordinate used below was computed in PHASE A
  // above; nothing here invents a new position. Paint order: navy band
  // + gold border frame first (so everything else sits on top of it),
  // then photo, then name/title/contact text, then the header divider.
  // ------------------------------------------------------------------

  // --- OLD Executive header band: solid navy fill spanning the full
  // page, from the true page edge (x=0/y=0) on the top/left/right sides
  // down to headerBandBottomY on the bottom — the band's real,
  // dynamically-computed boundary on every side, unchanged from before
  // any of this border work (so band height and every header-sizing
  // rule stay exactly as they were). ---
  const headerBandTopY = 0;
  const headerBandBottomY = headerDividerCenterY;
  doc.setFillColor(...COLOR_HEADER_BG);
  doc.rect(0, headerBandTopY, PAGE_WIDTH, headerBandBottomY - headerBandTopY, 'F');

  // --- Gold border frame, inset from the band's TRUE boundary on every
  // side (top/left/right/bottom) by exactly HEADER_BORDER_DRAWN_INSET_PT
  // — the stroke's own worst-case (corner) reach, derived above from
  // HEADER_BORDER_LINE_WIDTH_PT, not a tuned/arbitrary margin. That
  // makes the border's outer edge land EXACTLY on the band's true
  // boundary everywhere: fully on navy (never straddling navy/white at
  // the bottom), fully visible (never clipped off the page at the top/
  // left/right), and with none of the band's own fill color showing
  // past it on any side. (The inner rule that used to be drawn
  // HEADER_BORDER_INNER_INSET_PT in from the band's edges has been
  // removed per an earlier request — but only its ink: every header-
  // sizing rule that was derived FROM that inset (HEADER_DIVIDER_TOP_GAP_PT,
  // and therefore band height/divider position — see the constant
  // declarations above) still uses HEADER_BORDER_INNER_INSET_PT exactly
  // as before, so the header's own space-increase rules are completely
  // unaffected by any of this.) ---
  doc.setDrawColor(...COLOR_SECTION_DIVIDER);
  doc.setLineWidth(HEADER_BORDER_LINE_WIDTH_PT);
  doc.rect(
    HEADER_BORDER_DRAWN_INSET_PT,
    headerBandTopY + HEADER_BORDER_DRAWN_INSET_PT,
    PAGE_WIDTH - HEADER_BORDER_DRAWN_INSET_PT * 2,
    (headerBandBottomY - headerBandTopY) - HEADER_BORDER_DRAWN_INSET_PT * 2,
    'S'
  );

  // --- Photo (if present): clipped circular image. Requested follow-up:
  // the decorative gold ring around it has been removed — the circular
  // clip/mask below (doc.circle(..., null) + clip()/discardPath()) is
  // untouched, so the image itself stays perfectly circular; only the
  // stroked outline that used to be drawn after it is gone. ---
  if (hasPhoto) {
    doc.saveGraphicsState();
    // `null` (not omitted) is required: jsPDF's default path-paint
    // operation is 'S' (stroke) in pt mode, so an omitted style would
    // stroke a visible circle before clip() below ever runs. Passing
    // null suppresses ALL painting for this path — it exists purely
    // as the clip boundary for clip()/discardPath() immediately after.
    doc.circle(photoCenterX, photoCenterY, photoRadius, null);
    doc.clip();
    doc.discardPath();
    doc.addImage(photoSource, imgFormat, drawX, drawY, drawWidth, drawHeight);
    doc.restoreGraphicsState();
  }

  // --- Name — OLD Executive renders the header name bold and white,
  // on the navy band. X position (textStartX) is back to its original,
  // un-centered left-side value (a prior centering request has been
  // reverted — see the comment above `let textStartX` in PHASE A). Y
  // (nameDrawY) is nameBaselineY plus the still-in-place 2mm downward
  // shift (NAME_TITLE_VERTICAL_SHIFT_PT — see its own comment above,
  // unaffected by this revert). Font FAMILY is 'times' (serif) per the
  // reference image, with NAME_LETTER_SPACING_PT letter-spacing applied
  // via jsPDF's own "Tc" charSpace option — size unchanged. charSpace
  // is reset to 0 right after (see the "HEADER NAME/TITLE" comment
  // above for why: it is global doc state, and every other doc.text()
  // call in this file must keep rendering with zero letter-spacing). ---
  doc.setFont('times', 'bold');
  doc.setFontSize(NAME_SIZE);
  doc.setTextColor(...COLOR_NAME);
  const nameDrawY = nameBaselineY + NAME_TITLE_VERTICAL_SHIFT_PT + NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_PT;
  doc.text(name, textStartX, nameDrawY, { charSpace: NAME_LETTER_SPACING_PT });
  doc.setCharSpace(0);

  // --- Job title (optional). Left-edge X now uses textStartX directly
  // — the exact same calculated left-position reference the Name uses
  // (see `let textStartX = LEFT_MARGIN;` in PHASE A) — so the two share
  // one identical left alignment. The leftover ornament-line offset
  // (leftLineEndX + TITLE_ORNAMENT_LINE_GAP_PT) that used to shift the
  // title right of that reference, a holdover from the now-removed
  // gold ornament lines, has been dropped; the title text itself
  // (font/size/color) and its Y position (titleDrawY, still the
  // existing 2mm-down adjustment) are unchanged. ---
  if (jobTitle && titleBaselineY !== null) {
    doc.setFont('times', 'normal');
    doc.setFontSize(TITLE_SIZE);
    doc.setTextColor(...COLOR_TITLE);

    const titleDrawY = titleBaselineY + NAME_TITLE_VERTICAL_SHIFT_PT + NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_PT;
    const titleTextX = textStartX;

    doc.text(jobTitle, titleTextX, titleDrawY, { charSpace: TITLE_LETTER_SPACING_PT });
    doc.setCharSpace(0);
  }

  // --- Contact line ---
  // Drawn one wrapped line at a time (instead of handing jsPDF the
  // whole array at once) — the same per-line content-flow pattern
  // addSummary() uses for the Professional Summary paragraph — so the
  // ACTUAL rendered gap between consecutive lines is exactly
  // BODY_LINE_HEIGHT (matching the cursor math above that already
  // advances by BODY_LINE_HEIGHT per line), for any number of Contact
  // lines. Each item within a line now draws its own icon (see
  // drawContactIcon() above) before its text, at the exact X the
  // matching buildContactLines() wrap already reserved
  // (CONTACT_ITEM_ICON_FOOTPRINT_PT per item), so wrap and render can
  // never disagree.
  if (wrappedContactLines.length > 0) {
    const contactSeparatorWidth = doc.getTextWidth(CONTACT_SEPARATOR);
    let contactLineY = contactBaselineY + CONTACT_Y_OFFSET_PT;
    for (const line of wrappedContactLines) {
      let itemX = LEFT_MARGIN + CONTACT_X_OFFSET_PT;
      line.forEach((item, index) => {
        // Icons removed per request (see CONTACT_ITEM_ICON_FOOTPRINT_PT's
        // no-longer-reserved space below) — each item's text now starts
        // directly at itemX instead of itemX + icon footprint. This is
        // the "text flow naturally changes because the icon is gone"
        // case the request explicitly allows; the text itself, its
        // font/size/color/line-spacing, and every other header
        // position are otherwise untouched.
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(METADATA_SIZE);
        doc.setTextColor(...COLOR_HEADER_CONTACT);
        doc.text(item.text, itemX, contactLineY);
        itemX = itemX + doc.getTextWidth(item.text);

        if (index < line.length - 1) {
          doc.text(CONTACT_SEPARATOR, itemX, contactLineY);
          itemX += contactSeparatorWidth;
        }
      });
      contactLineY += BODY_LINE_HEIGHT;
    }
  }

  // --- Header divider — this is a pure geometry reference now, NOT
  // drawn: headerDividerCenterY still marks the navy band's own true
  // bottom edge (the fill rect ends exactly there, and the border is
  // inset just inside it — see PHASE B above — so headerBandBottomY/
  // headerDividerCenterY still drive fill height, border position, and
  // the next section's starting Y exactly as before), so drawing a
  // second gold line at that Y was just double ink on top of the
  // border. Removing this ink does not touch headerDividerCenterY/
  // headerDividerBottomEdgeY themselves, so the band height and the
  // next section's starting Y (returned via headerDividerBottomEdgeY
  // below) are completely unaffected. ---

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

// Builds the list of non-empty contact details, in display order, each
// tagged with its ContactItemType so drawContactIcon() (see above)
// knows which glyph to draw before it. Same fields/order as before —
// only the return shape changed (from plain strings to {type, text}).
export interface ContactItem {
  type: ContactItemType;
  text: string;
}

function buildContactParts(
  personalInfo: ExecutivePdfPersonalInfo,
  phoneNumber: string,
  selectedCountryCode: string
): ContactItem[] {
  const parts: ContactItem[] = [];

  if (personalInfo?.email) {
    parts.push({ type: 'email', text: personalInfo.email.trim() });
  }

  if (phoneNumber) {
    const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
    parts.push({ type: 'phone', text: `${dialPrefix}${phoneNumber}`.trim() });
  }

  const location = personalInfo?.location || personalInfo?.city;
  if (location) {
    parts.push({ type: 'location', text: location.trim() });
  }

  if (personalInfo?.address) {
    parts.push({ type: 'address', text: personalInfo.address.trim() });
  }

  if (personalInfo?.linkedin) {
    parts.push({ type: 'linkedin', text: personalInfo.linkedin.trim() });
  }

  if (personalInfo?.github) {
    parts.push({ type: 'github', text: personalInfo.github.trim() });
  }

  const webLink = personalInfo?.website || personalInfo?.portfolio;
  if (webLink) {
    parts.push({ type: 'website', text: webLink.trim() });
  }

  return parts;
}

// Wraps contact ITEMS (icon + text, see ContactItem above) across as
// many lines as needed to fit maxWidth — the same greedy-fill algorithm
// buildSkillLines() already uses for Skills, generalized to measure
// each item's icon footprint (CONTACT_ITEM_ICON_FOOTPRINT_PT) plus its
// own text width instead of a bare word, and the existing
// SKILLS_SEPARATOR-style " | " joiner between items on the same line.
// `|` removed per request — kept the same 7-character width (three
// spaces + the removed `|` replaced with a space + three spaces) so
// the spacing between contact items is otherwise unchanged.
const CONTACT_SEPARATOR = '       ';
function buildContactLines(doc: jsPDF, items: ContactItem[], maxWidth: number): ContactItem[][] {
  const lines: ContactItem[][] = [];
  let currentLine: ContactItem[] = [];
  let currentWidth = 0;
  const separatorWidth = doc.getTextWidth(CONTACT_SEPARATOR);

  for (const item of items) {
    // No longer adds CONTACT_ITEM_ICON_FOOTPRINT_PT — icons are no
    // longer drawn (see the Contact-line draw loop in addHeader()), so
    // wrapping no longer reserves space for them; the natural
    // text-flow consequence of removing the icons, same as there.
    const itemWidth = doc.getTextWidth(item.text);
    const candidateWidth = currentLine.length > 0
      ? currentWidth + separatorWidth + itemWidth
      : itemWidth;

    if (candidateWidth <= maxWidth || currentLine.length === 0) {
      currentLine.push(item);
      currentWidth = candidateWidth;
    } else {
      lines.push(currentLine);
      currentLine = [item];
      currentWidth = itemWidth;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

// ====================================================================
// PROFESSIONAL SUMMARY SECTION (Phase 2)
// Renders: "PROFESSIONAL SUMMARY" heading + the wrapped paragraph.
// If professionalSummary is empty/whitespace-only, this renders
// nothing at all (no heading, no gap) and simply returns startY
// unchanged.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addSummary(doc: jsPDF, data: ExecutivePdfData, startY: number): number {
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
  y = renderSectionHeading(doc, 'PROFESSIONAL SUMMARY', y, BODY_SIZE, 'summary');

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
// EXPERIENCE VERTICAL TIMELINE (OLD Executive PDF transfer)
// ------------------------------------------------------------------
// OLD Executive PDF (the separate, class-based ExecutivePDFGenerator
// reference) draws a thin vertical line with a small dot marker next
// to every Experience entry, connecting consecutive entries down the
// page like a timeline. This is a reproduction of THAT visual element
// only — no other OLD Executive Experience design (fonts, colors,
// title/date/company layout, gaps) is touched; everything else in
// this section remains this file's own existing typography/spacing.
//
// GEOMETRY: adapted to this file's own point-based coordinate system
// (OLD Executive's raw mm-scale numbers are not reusable here — see
// the file-wide "no hardcoded/magic values" requirement). The timeline
// occupies a narrow column immediately to the right of LEFT_MARGIN;
// Experience entry content (title/date row, company line, description)
// is shifted right by TIMELINE_COLUMN_SHIFT_PT to clear it, and its
// wrap width is narrowed by the same amount — this is the ONLY change
// to Experience's existing content geometry, and it applies uniformly
// to every entry regardless of page. The dot's vertical position keys
// off EXPERIENCE_TITLE_SIZE/HELVETICA_ASCENT_RATIO (already-declared
// file constants), not a new magic offset.
const TIMELINE_COLUMN_SHIFT_MM = 5; // Experience content's left edge shifts this far right of LEFT_MARGIN
const TIMELINE_COLUMN_SHIFT_PT = TIMELINE_COLUMN_SHIFT_MM * MM_TO_PT;
const TIMELINE_LINE_OFFSET_MM = 1; // vertical line sits this far right of LEFT_MARGIN
const TIMELINE_LINE_OFFSET_PT = TIMELINE_LINE_OFFSET_MM * MM_TO_PT;
const TIMELINE_LINE_X = LEFT_MARGIN + TIMELINE_LINE_OFFSET_PT;
const TIMELINE_DOT_RADIUS_MM = 1;
const TIMELINE_DOT_RADIUS_PT = TIMELINE_DOT_RADIUS_MM * MM_TO_PT;
// How far above the very first entry's dot the timeline's top edge
// begins, and how much shorter than its natural end (the bottom Y the
// section content ends at) the timeline's closing segment stops.
// Named/converted the same way as every other timeline measurement
// above rather than inlining raw numbers at the draw call sites.
const TIMELINE_START_EXTENSION_MM = 0.5;
const TIMELINE_START_EXTENSION_PT = TIMELINE_START_EXTENSION_MM * MM_TO_PT;
const TIMELINE_END_REDUCTION_MM = 3;
const TIMELINE_END_REDUCTION_PT = TIMELINE_END_REDUCTION_MM * MM_TO_PT;
// Reuses the file's existing thin-rule stroke weight (the Header's own
// divider thickness) rather than inventing a new line-width constant.
const TIMELINE_LINE_WIDTH_PT = HEADER_RULE_THICKNESS;
// OLD Executive draws its timeline dot/line in the same muted-gold tone
// as its header job title (RGB 184,164,106) — already declared here as
// COLOR_TITLE, so it is reused rather than duplicated under a new name.
const TIMELINE_COLOR = COLOR_TITLE;
// Experience entries' own content start/width, shifted right to make
// room for the timeline column. Declared once here so addExperience()/
// addExperienceEntry()/renderTitleRowWithDate() all share the exact
// same geometry.
const EXPERIENCE_CONTENT_START_X = LEFT_MARGIN + TIMELINE_COLUMN_SHIFT_PT;
const EXPERIENCE_CONTENT_WIDTH = CONTENT_WIDTH - TIMELINE_COLUMN_SHIFT_PT;

// Per-document timeline drawing state, threaded through each
// addExperienceEntry() call so consecutive entries connect. Mirrors
// OLD Executive's prevTimelineDotY/prevTimelineDotPage instance fields,
// adapted to this file's function-based (non-class) architecture.
//
// PAGE-BREAK BEHAVIOR: the timeline is tracked as ONE open line segment
// per page. It starts at the first dot (or, after a page break, at the
// first experience content on the new page) and is closed at the end of
// the LAST experience content line actually rendered on that page. So
// when a page break leaves blank space at the bottom, the timeline on
// the previous page stops exactly where the experience content stops
// (no stub running into the blank space), and the next page starts its
// own fresh timeline where its experience content begins.
interface ExperienceTimelineState {
  segmentStartY: number | null; // top of the currently open segment (null = none open)
  segmentPage: number;          // page the open segment lives on
  segmentEndY: number;          // where experience content currently ends on that page
}

// When a page break lands in the MIDDLE of an entry (oversized entry
// split line-by-line), the new page's timeline starts at the ink top
// of the first continued line — derived from the same font-size and
// ascent ratio the rest of this file uses, not a new number.
const TIMELINE_CONTINUATION_TOP_OFFSET_PT = BODY_SIZE * HELVETICA_ASCENT_RATIO;

function openTimelineSegment(state: ExperienceTimelineState, page: number, startY: number): void {
  state.segmentStartY = startY;
  state.segmentPage = page;
  state.segmentEndY = startY;
}

// Records where experience content ends, given the Y just below the
// content line that was rendered. Uses the same end reduction the
// timeline's closing segment has always used.
function trackTimelineContentEnd(state: ExperienceTimelineState, yAfterContent: number): void {
  state.segmentEndY = yAfterContent - TIMELINE_END_REDUCTION_PT;
}

// Draws the open segment on ITS OWN page (down to the last experience
// content line) and restores the page that was current before.
function closeTimelineSegment(doc: jsPDF, state: ExperienceTimelineState): void {
  if (state.segmentStartY === null) {
    return;
  }
  const returnPage = doc.getCurrentPageInfo().pageNumber;
  doc.setPage(state.segmentPage);
  if (state.segmentEndY > state.segmentStartY) {
    drawTimelineSegment(doc, state.segmentStartY, state.segmentEndY);
  }
  doc.setPage(returnPage);
  state.segmentStartY = null;
}

// checkPageBreak() wrapper for lines INSIDE an entry: if it starts a new
// page, the previous page's timeline is closed at the last content line
// and a new timeline is opened on the new page.
function checkPageBreakWithTimeline(
  doc: jsPDF,
  y: number,
  spaceNeeded: number,
  state: ExperienceTimelineState
): number {
  const newY = checkPageBreak(doc, y, spaceNeeded);
  const currentPage = doc.getNumberOfPages();
  if (state.segmentStartY !== null && currentPage !== state.segmentPage) {
    closeTimelineSegment(doc, state);
    openTimelineSegment(state, currentPage, newY - TIMELINE_CONTINUATION_TOP_OFFSET_PT);
  }
  return newY;
}

function drawTimelineDot(doc: jsPDF, dotY: number): void {
  doc.setFillColor(...TIMELINE_COLOR);
  doc.circle(TIMELINE_LINE_X, dotY, TIMELINE_DOT_RADIUS_PT, 'F');
  doc.setDrawColor(...TIMELINE_COLOR);
  doc.setLineWidth(TIMELINE_LINE_WIDTH_PT);
  doc.circle(TIMELINE_LINE_X, dotY, TIMELINE_DOT_RADIUS_PT, 'S');
}

function drawTimelineSegment(doc: jsPDF, fromY: number, toY: number): void {
  doc.setDrawColor(...TIMELINE_COLOR);
  doc.setLineWidth(TIMELINE_LINE_WIDTH_PT);
  doc.line(TIMELINE_LINE_X, fromY, TIMELINE_LINE_X, toY);
}

// ====================================================================
// EXPERIENCE SECTION (Phase 3, refined in Phase 5.1; OLD Executive PDF
// overflow-rules + vertical-timeline transfer)
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
// OVERFLOW-RULES NOTE (OLD Executive transfer): OLD Executive decides,
// BEFORE drawing any entry, how many WHOLE entries fit in the space
// remaining on the current page (by pre-measuring each entry's total
// height), so a normal-sized entry is never split mid-description by a
// page boundary — it moves to the next page as a complete unit instead.
// Only an entry too tall to ever fit on a single blank page falls back
// to being split, line-by-line, via the existing per-line
// checkPageBreak() calls below (so nothing is ever lost or clipped).
// This file's own architecture renders entries one at a time (rather
// than OLD Executive's batch/fitCount pass), so the same rule is
// applied per-entry instead: calculateExperienceEntryHeight() measures
// the WHOLE entry up front, and if it fits on an empty page but not in
// the space remaining here, checkPageBreak() is called with that FULL
// height (rather than just the header's height), which moves the
// entire entry to a new page as a unit. This reuses the existing
// checkPageBreak() function — no second/competing page-break system is
// introduced.
//
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addExperience(doc: jsPDF, data: ExecutivePdfData, startY: number): number {
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
  y = renderSectionHeading(doc, 'EXPERIENCE', y, EXPERIENCE_TITLE_SIZE, 'experience');

  // --- Timeline state, initialized fresh for this section (no
  // connecting line is drawn before the first dot) ---
  const timelineState: ExperienceTimelineState = {
    segmentStartY: null,
    segmentPage: doc.getNumberOfPages(),
    segmentEndY: 0,
  };

  // --- Entries ---
  experiences.forEach((exp, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }
    y = addExperienceEntry(doc, exp, y, timelineState);
  });

  // --- Timeline closing: draw the last open segment on its own page,
  // down to where the experience content ends. ---
  closeTimelineSegment(doc, timelineState);

  return y;
}

// An entry counts as "usable" if it has ANY content worth printing —
// this mirrors the empty-summary rule from Phase 2: don't render a
// heading for entries that are entirely blank placeholders.
function hasUsableExperienceContent(exp: ExecutivePdfExperience | null | undefined): boolean {
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

// Pure measurement helper (draws nothing): computes the FULL height a
// single experience entry will occupy — header (title/date row +
// company line) AND its entire wrapped description, plus the same
// trailing top-up addExperienceEntry() applies when it ends on a
// metadata line. Mirrors addExperienceEntry()'s own rendering math
// exactly (same fonts/gaps/wrap widths) so the measurement and the
// actual render can never disagree. This is the "calculateExperience-
// Height()" equivalent from OLD Executive, used to decide whether a
// whole entry should move to a new page as a single unit rather than
// being split mid-description by a page boundary (see addExperience()'s
// overflow-rules note above).
function calculateExperienceEntryHeight(doc: jsPDF, exp: ExecutivePdfExperience, contentWidth: number): number {
  const title = (exp.title || '').trim();
  const company = (exp.company || '').trim();
  const startDate = (exp.startDate || '').trim();
  const endDate = (exp.endDate || '').trim();
  const description = (exp.description || '').trim();
  const dateRange = [startDate, endDate].filter(Boolean).join(' – ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const descriptionLines: string[] = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim();
          return trimmedLine ? doc.splitTextToSize(trimmedLine, contentWidth) : [];
        })
    : [];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
  const dateWidth = dateRange ? doc.getTextWidth(dateRange) : 0;
  const titleWrapWidth = dateRange
    ? Math.max(0, contentWidth - dateWidth - TITLE_TO_DATE_GAP_PT)
    : contentWidth;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleLineCount = title ? doc.splitTextToSize(title, titleWrapWidth).length : 0;
  const titleRowHeight = titleLineCount > 0
    ? titleLineCount * EXPERIENCE_TITLE_SIZE
    : (dateRange ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const hasTitleRow = Boolean(title || dateRange);

  const titleToCompanyGap = hasTitleRow && company ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;
  const headerHeight = titleRowHeight + titleToCompanyGap + (company ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const hasHeaderLine = hasTitleRow || Boolean(company);

  const descriptionGap = hasHeaderLine && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const descriptionHeight = descriptionLines.length * BODY_LINE_HEIGHT;

  let totalHeight = headerHeight + descriptionGap + descriptionHeight;

  // Same trailing top-up addExperienceEntry() applies when the entry
  // ends on a metadata line rather than a body-paragraph line.
  if (descriptionLines.length === 0 && hasHeaderLine) {
    const lastLineFontSize = company ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE;
    totalHeight += BODY_LINE_HEIGHT - lastLineFontSize;
  }

  return totalHeight;
}

// Renders a single experience entry and returns the new Y position.
function addExperienceEntry(
  doc: jsPDF,
  exp: ExecutivePdfExperience,
  startY: number,
  timelineState: ExperienceTimelineState
): number {
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
  // the page width (narrowed by the timeline column — see
  // EXPERIENCE_CONTENT_WIDTH above). This renders the content the user
  // actually wrote instead of inventing a bullet-point format that
  // isn't in the data.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const descriptionLines: string[] = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim();
          return trimmedLine ? doc.splitTextToSize(trimmedLine, EXPERIENCE_CONTENT_WIDTH) : [];
        })
    : [];

  // --- OLD EXECUTIVE OVERFLOW TRANSFER: decide, BEFORE drawing
  // anything, whether this whole entry should move to a fresh page as
  // one unit rather than starting here and risking a mid-description
  // split. calculateExperienceEntryHeight() measures the ENTIRE entry
  // (header + full description + trailing top-up). If that full
  // height fits within a single blank page's usable area, checkPageBreak()
  // is called with the FULL height — which only breaks the page if the
  // whole entry doesn't fit in the space remaining here, exactly like
  // "does this content fit; if not, move it whole" from OLD Executive's
  // canFit()/fitCount design. If the entry is so large it could never
  // fit on any single page (fullEntryHeight exceeds a whole page), this
  // atomic check is skipped and the existing header-plus-first-line
  // reservation below is used instead, so the entry still starts and
  // is safely split line-by-line by the per-line checkPageBreak() calls
  // further down — nothing is ever lost or clipped, matching OLD
  // Executive's own fallback for oversized entries. ---
  const fullEntryHeight = calculateExperienceEntryHeight(doc, exp, EXPERIENCE_CONTENT_WIDTH);
  const usableFullPageHeight = (PAGE_HEIGHT - BOTTOM_MARGIN) - TOP_MARGIN;
  if (fullEntryHeight <= usableFullPageHeight) {
    y = checkPageBreak(doc, y, fullEntryHeight);
  } else {
    // --- Determine how much space this entry's "header" (title/date row
    // + company line) plus at least the first description line needs, so
    // the whole block can be pushed to a new page together rather than
    // splitting a job title from its own company/first description line.
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    const dateWidthForEstimate = dateRange ? doc.getTextWidth(dateRange) : 0;
    const titleWrapWidthForEstimate = dateRange
      ? Math.max(0, EXPERIENCE_CONTENT_WIDTH - dateWidthForEstimate - TITLE_TO_DATE_GAP_PT)
      : EXPERIENCE_CONTENT_WIDTH;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    const estimatedTitleLineCount = title ? doc.splitTextToSize(title, titleWrapWidthForEstimate).length : 0;
    const titleRowHeightEstimate = estimatedTitleLineCount > 0
      ? estimatedTitleLineCount * EXPERIENCE_TITLE_SIZE
      : (dateRange ? EXPERIENCE_SUBTITLE_SIZE : 0);
    const hasTitleRowForEstimate = Boolean(title || dateRange);

    const titleToCompanyGapForEstimate = hasTitleRowForEstimate && company ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;
    const headerHeightForEstimate = titleRowHeightEstimate + titleToCompanyGapForEstimate + (company ? EXPERIENCE_SUBTITLE_SIZE : 0);
    const hasHeaderLineForEstimate = hasTitleRowForEstimate || Boolean(company);
    const descriptionGapForEstimate = hasHeaderLineForEstimate && descriptionLines.length > 0
      ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
      : 0;
    const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
    const minimumEntrySpaceNeeded = headerHeightForEstimate + descriptionGapForEstimate + firstDescriptionLineHeight;
    y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);
  }

  // --- Timeline dot for this entry, placed at the final page/Y the
  // atomic-fit check above settled on, vertically centered on the
  // title row's cap-height (half the title font's real ascent above
  // its baseline) — see EXPERIENCE VERTICAL TIMELINE above. Connects
  // to the previous entry's dot with a straight segment when both dots
  // land on the same page. When a page break falls BETWEEN two entries
  // instead, the line now continues across it (per request) rather
  // than stopping dead at the previous entry's dot — but only a SHORT
  // way past it, not all the way down the previous page's remaining
  // blank space (that longer stub was itself reported as a problem:
  // a timeline line running through an area with no experience content
  // in it). The previous page's closing stub now extends by exactly
  // EXPERIENCE_ENTRY_GAP — the same gap this file already uses between
  // one experience entry and the next on a single page — so it reads
  // as "there would be a gap before the next entry here" instead of a
  // line trailing off into empty space. The new page still gets an
  // opening segment from its own usable top edge (TOP_MARGIN —
  // checkPageBreak()'s own "new page starts here" value) down to this
  // entry's dot, which is already short by construction (the entry
  // starts near the top of its new page). Both segments are drawn via
  // doc.setPage() onto their own page and then switched back to the
  // current page before continuing, since jsPDF's draw calls always
  // target whichever page was most recently set. The very first dot of
  // the whole timeline is additionally shifted up by
  // TIMELINE_START_EXTENSION_PT, so the timeline's visible top is
  // TIMELINE_START_EXTENSION_PT above where it used to start — and,
  // since a dot is always drawn exactly at its own center, the dot
  // itself is always the line's top-center, never left behind below
  // it. ---
  // If this entry landed on a new page (page break BETWEEN entries),
  // the previous page's timeline ends at its last experience content
  // line, and this page starts a new timeline at this entry's dot.
  const dotPage = doc.getNumberOfPages();
  if (timelineState.segmentStartY !== null && timelineState.segmentPage !== dotPage) {
    closeTimelineSegment(doc, timelineState);
  }
  const startsNewTimelineSegment = timelineState.segmentStartY === null;
  const dotY = y - (EXPERIENCE_TITLE_SIZE * HELVETICA_ASCENT_RATIO) / 2
    - (startsNewTimelineSegment ? TIMELINE_START_EXTENSION_PT : 0);
  if (startsNewTimelineSegment) {
    openTimelineSegment(timelineState, dotPage, dotY);
  }
  drawTimelineDot(doc, dotY);

  // --- Job title (left) + Date (right, same row) ---
  const titleRow = renderTitleRowWithDate(
    doc,
    title,
    dateRange,
    y,
    COLOR_BODY, // Experience Date matches the Professional Summary body-content color — see the "DATE/CREDENTIAL FIELDS THAT MATCH PROFESSIONAL SUMMARY BODY TEXT" block above
    EXPERIENCE_CONTENT_START_X,
    EXPERIENCE_CONTENT_WIDTH
  );
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
    doc.text(company, EXPERIENCE_CONTENT_START_X, y);
    y += EXPERIENCE_SUBTITLE_SIZE;
  }

  const hasTitleRow = Boolean(title || dateRange);
  const hasHeaderLine = hasTitleRow || Boolean(company);

  // PHASE 5.1 FIX: this gap is the space BETWEEN the header
  // (title-row/company) and the description, so it must only apply
  // when a description actually follows — otherwise it silently
  // became a generic "trailing space after the entry" for entries
  // with no description, which happened to mask (rather than fix) the
  // metadata-line-has-no-leading issue below. Now conditioned the same
  // way renderEducationColumn() already conditions its header-to-date gap.
  if (hasHeaderLine && descriptionLines.length > 0) {
    y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
  }

  // --- Description ---
  if (descriptionLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);
    doc.setTextColor(...COLOR_BODY);

    for (const line of descriptionLines) {
      // Per-line overflow guard (OLD Executive's "no clipped/lost text"
      // rule): kept as the safety net for the rare oversized entry that
      // skipped the atomic whole-entry check above. For a normal-sized
      // entry this never actually triggers, since the atomic check
      // already guaranteed the whole entry fits from here on.
      y = checkPageBreakWithTimeline(doc, y, BODY_LINE_HEIGHT, timelineState);
      doc.text(line, EXPERIENCE_CONTENT_START_X, y);
      y += BODY_LINE_HEIGHT;
      trackTimelineContentEnd(timelineState, y);
    }
  }

  // Same trailing-space parity applied to every Education entry (see
  // the comment inside renderEducationColumn() for the full analysis) — it
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

  trackTimelineContentEnd(timelineState, y);

  return y;
}

// ====================================================================
// EDUCATION + CERTIFICATIONS + LANGUAGES ROW (Phase 4 base, replaced
// by an explicit OLD EXECUTIVE PDF design-transfer follow-up request)
// ------------------------------------------------------------------
// OLD Executive PDF renders Education, Certifications, and Languages
// as ONE shared row instead of three stacked full-width sections:
// three column headings on the same baseline, ONE shared divider
// spanning the full content width beneath them, then each column's
// own entries flowing independently underneath, with two thin gold
// vertical divider lines separating the three columns. This is a
// reproduction of that exact row / column-divider STRUCTURE, per an
// explicit request to copy it exactly (unlike the earlier OLD
// Executive color/header transfer, which deliberately left this
// file's own section layout untouched).
//
// Column-width proportions: EQUAL widths across however many of the
// three columns actually have content — see the numColumns-driven
// columnWidth calculation inside the function below (no longer the
// old fixed 34% / 31% / 34% split). The small buffers reserved around
// each vertical divider (COLUMN_GAP_PT) are still ported from OLD
// Executive's own gapAroundLine — see the COLUMN_* constants declared
// earlier in this file. Everything WITHIN each column — font sizes,
// per-field colors, the title/subtitle/detail gap sequence
// (EXPERIENCE_TITLE_TO_SUBTITLE_GAP, EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP),
// per-entry EXPERIENCE_ENTRY_GAP, topUpToLineHeight() normalization, and
// checkPageBreak() reservations — is this file's own existing
// Education/Certifications/Languages typography and spacing, unchanged;
// only the physical arrangement (equal-width columns, one shared
// heading row, vertical dividers between whichever columns are active)
// is new.
//
// Renders only the columns that have usable content, and reflows the
// remaining ones to fill the freed-up space instead of leaving an empty
// slot: 3 usable sections split the row three ways, 2 usable sections
// split it equally in half (with a single divider between them), and 1
// usable section renders full-width with no divider at all — the same
// LEFT_MARGIN/CONTENT_WIDTH behavior every other normal section
// (Summary, Skills, etc.) already uses. If none of the three have any
// usable content, the whole row is skipped and startY is returned
// unchanged, like every other section.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================
function addEducationCertificationsLanguagesRow(doc: jsPDF, data: ExecutivePdfData, startY: number): number {
  const educations = (data.educations || []).filter(hasUsableEducationContent);
  const certifications = (data.certifications || []).filter(hasUsableCertificationContent);
  const languages = (data.languages || []).filter(hasUsableLanguageContent);

  // --- Build the list of columns that actually have content, in the
  // fixed Education -> Certifications -> Languages order, skipping any
  // section the user left empty. Everything below (column count, width,
  // dividers) is driven entirely by how many of these are present —
  // 3 present behaves as before, 2 present splits the row's width
  // equally between just those two, and 1 present renders as a normal,
  // full-width section (no column math at all), instead of a fixed
  // slot per section that leaves an empty gap when one is skipped. ---
  type RowColumn = {
    label: string;
    icon: SectionIconType; // see drawSectionIconBadge() — one badge per column heading, same treatment renderSectionHeading() gives every other section
    contentInsetFraction: number; // fraction of THIS column's own width — 0 for Education (heading and content both flush), COLUMN_CONTENT_INSET_FRACTION for Certifications/Languages (heading flush, content nudged in slightly) — same per-section-type convention as before, just no longer tied to a fixed slot.
    measure: (maxWidth: number) => number;
    render: (x: number, maxWidth: number, y: number) => { rawEndY: number; contentEndY: number };
  };

  const columns: RowColumn[] = [];
  if (educations.length > 0) {
    columns.push({
      label: 'EDUCATION',
      icon: 'education',
      contentInsetFraction: 0,
      measure: (maxWidth) => measureEducationColumnHeight(doc, educations, maxWidth),
      render: (x, maxWidth, y) => renderEducationColumn(doc, educations, x, maxWidth, y),
    });
  }
  if (certifications.length > 0) {
    columns.push({
      label: 'CERTIFICATIONS',
      icon: 'certifications',
      contentInsetFraction: COLUMN_CONTENT_INSET_FRACTION,
      measure: (maxWidth) => measureCertificationColumnHeight(doc, certifications, maxWidth),
      render: (x, maxWidth, y) => renderCertificationColumn(doc, certifications, x, maxWidth, y),
    });
  }
  if (languages.length > 0) {
    columns.push({
      label: 'LANGUAGES',
      icon: 'languages',
      contentInsetFraction: COLUMN_CONTENT_INSET_FRACTION,
      measure: (maxWidth) => measureLanguageColumnHeight(doc, languages, maxWidth),
      render: (x, maxWidth, y) => renderLanguageColumn(doc, languages, x, maxWidth, y),
    });
  }

  const numColumns = columns.length;
  if (numColumns === 0) {
    return startY;
  }

  let y = startY;

  // Space between the previous section and this row — same relationship
  // as every other "previous section -> next section" gap in this file.
  y += SECTION_GAP;

  // --- Column widths: with only ONE column present, it behaves exactly
  // like every other normal, full-width section (LEFT_MARGIN start,
  // full CONTENT_WIDTH, no divider, no content inset) — the same
  // LEFT_MARGIN/CONTENT_WIDTH convention addSkills()/addSummary()/etc.
  // already use. With 2 or 3 columns present, CONTENT_WIDTH minus the
  // gap reserved on both sides of every vertical divider between them
  // (COLUMN_GAP_PT on each side = 2 * COLUMN_GAP_PT per divider) is
  // split into numColumns EQUAL widths — the same equal-width guarantee
  // whether 2 or 3 columns are showing, instead of a value tied to a
  // hardcoded column count. ---
  const numDividers = numColumns - 1;
  const columnWidth = numColumns === 1
    ? CONTENT_WIDTH
    : (CONTENT_WIDTH - numDividers * 2 * COLUMN_GAP_PT) / numColumns;

  // --- Column X-geometry (left to right): heading flush at the
  // column's own X (same convention for every column, regardless of
  // type or position), content nudged in by that column's own inset
  // fraction, and a wrap width measured against whichever boundary
  // comes next — the midpoint of the divider gap before the following
  // column, or the page's own right margin for the last column.
  // Computed here, independent of Y, so it can be used BOTH for
  // measuring each column's real content height up front (right below)
  // and later for actually drawing — the heading text itself isn't
  // drawn until further down, once the row's final Y is settled. ---
  const dividerXs: number[] = [];
  const columnLayouts: { x: number; contentX: number; maxWidth: number }[] = [];
  let cursorX = LEFT_MARGIN;

  columns.forEach((column, index) => {
    const isLast = index === numColumns - 1;
    const x = cursorX;
    const contentX = x + columnWidth * column.contentInsetFraction;
    const nextBoundaryX = isLast
      ? PAGE_WIDTH - RIGHT_MARGIN
      : x + columnWidth + COLUMN_GAP_PT;
    const maxWidth = numColumns === 1
      ? CONTENT_WIDTH
      : nextBoundaryX - contentX - COLUMN_GAP_PT;

    if (!isLast) {
      dividerXs.push(nextBoundaryX);
    }

    columnLayouts.push({ x, contentX, maxWidth });
    cursorX = x + columnWidth + 2 * COLUMN_GAP_PT;
  });

  // --- Measure every active column's REAL content height up front,
  // using the exact same per-entry typography/gap math each
  // render*Column function uses internally (see
  // measureEducationColumnHeight()/measureCertificationColumnHeight()/
  // measureLanguageColumnHeight() below) — but without drawing any ink
  // or calling checkPageBreak(). This is what lets the row make ONE
  // page-break decision for the whole row (right below), instead of
  // each column deciding independently: previously, Education/
  // Certifications/Languages each called checkPageBreak() internally,
  // per-entry, using their OWN copy of y — so if (say) Certifications'
  // content ran long enough to trigger its own doc.addPage() partway
  // through, that moved the ENTIRE document's current page forward
  // while Education (already fully drawn) stayed on the old page, and
  // Languages then rendered at the Y coordinates meant for the OLD
  // page but onto whatever page Certifications had just switched to —
  // scattering the three columns' entries across mismatched pages
  // instead of keeping them aligned as one row. Reserving the tallest
  // column's full measured height for the row up front means none of
  // the three render calls below ever need to trigger their own
  // internal page break in practice, so all three stay column-aligned
  // on whichever single page the row lands on. ---
  const measuredHeights = columns.map((column, index) => column.measure(columnLayouts[index].maxWidth));
  const maxMeasuredHeight = Math.max(...measuredHeights);

  // Room for the heading row plus the row's REAL measured content
  // height (not just a first-line placeholder), so the heading and
  // every column's content move together to a fresh page as one unit
  // whenever the row as a whole doesn't fit.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + maxMeasuredHeight;
  y = checkPageBreak(doc, y, headingSpaceNeeded);

  const headingBaselineY = y;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(HEADING_SIZE);
  doc.setTextColor(...COLOR_SECTION_HEADLINE);
  // Each column heading gets its own icon badge (see drawSectionIconBadge()
  // above), left-anchored at that column's own X — exactly where its
  // label used to start — with the label itself shifted right by the
  // same SECTION_ICON_TEXT_SHIFT_PT every other section heading uses.
  // This only moves each column's HEADING text; contentX/maxWidth (and
  // therefore every column's width, content-wrap, and divider position)
  // are untouched.
  columns.forEach((column, index) => {
    drawSectionIconBadge(doc, column.icon, columnLayouts[index].x, headingBaselineY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(HEADING_SIZE);
    doc.setTextColor(...COLOR_SECTION_HEADLINE);
    doc.text(column.label, columnLayouts[index].x + SECTION_ICON_TEXT_SHIFT_PT, headingBaselineY);
  });

  // --- ONE shared divider spanning the full content width, positioned
  // with the exact same heading->divider->content geometry every other
  // section heading uses (see sectionHeadingToContentOffset() and
  // renderSectionHeading() above) — drawn once here, not once per
  // column, since every active heading shares it. ---
  const headingInkBottomY = headingBaselineY; // ALL-CAPS heading, no descender ink
  const dividerTopEdgeY = headingInkBottomY + DIVIDER_SIDE_GAP_PT;
  const dividerCenterY = dividerTopEdgeY + SECTION_DIVIDER_THICKNESS / 2;
  const dividerBottomEdgeY = dividerTopEdgeY + SECTION_DIVIDER_THICKNESS;
  doc.setDrawColor(...COLOR_SECTION_DIVIDER);
  doc.setLineWidth(SECTION_DIVIDER_THICKNESS);
  doc.line(LEFT_MARGIN, dividerCenterY, PAGE_WIDTH - RIGHT_MARGIN, dividerCenterY);

  const contentStartY = headingBaselineY + sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE);

  // --- Each active column's own entries, independently flowing
  // underneath the shared divider — this file's existing Education/
  // Certification/Language typography, spacing, and per-entry
  // normalization, just re-flowed into that column's own width instead
  // of a fixed slot. ---
  const results = columns.map((column, index) =>
    column.render(columnLayouts[index].contentX, columnLayouts[index].maxWidth, contentStartY)
  );

  const rowBottomY = Math.max(...results.map((r) => r.rawEndY));

  // --- Vertical column divider lines, re-enabled: one at each
  // dividerXs position (already computed above as the exact midpoint of
  // the COLUMN_GAP_PT buffer reserved on each side of every column
  // boundary — untouched, so this draws INTO existing whitespace rather
  // than reserving any new gap or moving any column). Each line runs
  // from the shared heading divider's own bottom edge down to the row's
  // real bottom (the tallest column's rawEndY, same value this function
  // returns), reusing the same divider color/thickness as every other
  // divider in this file — no new color or magic thickness introduced. ---
  if (dividerXs.length > 0) {
    doc.setDrawColor(...COLOR_SECTION_DIVIDER);
    doc.setLineWidth(SECTION_DIVIDER_THICKNESS);
    dividerXs.forEach((dividerX) => {
      doc.line(dividerX, dividerBottomEdgeY, dividerX, rowBottomY);
    });
  }

  return rowBottomY;
}

// An entry counts as "usable" if it has ANY content worth printing —
// same rule as hasUsableExperienceContent().
function hasUsableEducationContent(edu: ExecutivePdfEducation | null | undefined): boolean {
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

// Measures Education/Certifications/Languages' REAL content height for
// the shared row above, WITHOUT drawing any ink or ever adding a page —
// by calling the real render*Column() function in its own "measuring"
// mode (see the `measuring` parameter on each), so this can never drift
// out of sync with what actually gets drawn (the bug a hand-duplicated
// separate height calculation would risk reintroducing). startY is 0
// purely as an arbitrary origin — since these functions only ever ADD
// to y, the returned rawEndY IS the total height needed, regardless of
// what startY was.
function measureEducationColumnHeight(doc: jsPDF, educations: ExecutivePdfEducation[], maxWidth: number): number {
  return renderEducationColumn(doc, educations, 0, maxWidth, 0, true).rawEndY;
}
function measureCertificationColumnHeight(doc: jsPDF, certifications: ExecutivePdfCertification[], maxWidth: number): number {
  return renderCertificationColumn(doc, certifications, 0, maxWidth, 0, true).rawEndY;
}
function measureLanguageColumnHeight(doc: jsPDF, languages: ExecutivePdfLanguage[], maxWidth: number): number {
  return renderLanguageColumn(doc, languages, 0, maxWidth, 0, true).rawEndY;
}

// Renders the Education column of the shared row above: one block per
// entry — Degree (bold, COLOR_HEADING), Institution (COLOR_METADATA),
// then Year/Grade combined on one line (COLOR_BODY, matching the
// Professional Summary's body-content color) — using this file's own
// existing entry
// typography/gap constants, wrapped to this column's own width instead
// of CONTENT_WIDTH. Mirrors the exact field-sequence/gap-conditional
// pattern renderCertificationColumn() already uses for its own three-field
// sequence (name/date/credential here becomes degree/institution/
// dateText). Returns both the column's normal ("raw") end Y — used for
// the row's own next-entry gap and as one input to the whole row's
// return value — and its real, visible content-bottom Y (excluding the
// per-entry trailing normalization), which is what the vertical column
// dividers actually measure against.
function renderEducationColumn(
  doc: jsPDF,
  educations: ExecutivePdfEducation[],
  colX: number,
  colWidth: number,
  startY: number,
  measuring: boolean = false
): { rawEndY: number; contentEndY: number } {
  let y = startY;
  let contentEndY = startY;

  educations.forEach((edu, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }

    const degree = (edu.degree || '').trim();
    const institution = (edu.institution || '').trim();
    const year = (edu.year || '').trim();
    const grade = (edu.grade || '').trim();
    // Grade and Date (year) now render as two SEPARATE lines — Grade
    // first, Date below it — instead of combining onto one
    // "Year | Grade" line. See the Grade->Date gap note below for why
    // that specific transition uses a different step than every other
    // gap in this column.

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    const degreeLines: string[] = degree ? doc.splitTextToSize(degree, colWidth) : [];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    const institutionLines: string[] = institution ? doc.splitTextToSize(institution, colWidth) : [];
    const gradeLines: string[] = grade ? doc.splitTextToSize(grade, colWidth) : [];
    const dateLines: string[] = year ? doc.splitTextToSize(year, colWidth) : [];

    const degreeHeight = degreeLines.length * EXPERIENCE_TITLE_SIZE;
    const institutionHeight = institutionLines.length * EXPERIENCE_SUBTITLE_SIZE;
    const gradeHeight = gradeLines.length * EXPERIENCE_SUBTITLE_SIZE;
    const dateHeight = dateLines.length * EXPERIENCE_SUBTITLE_SIZE;

    const degreeToInstitutionGap = degreeLines.length > 0 && institutionLines.length > 0
      ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
      : 0;
    // Gap LEADING INTO Grade (or, when there is no Grade, leading
    // directly into Date instead — the same slot/gap the old combined
    // "dateText" field used to occupy) — UNCHANGED from the old
    // institutionToDateGap/degreeToDateGap gap.
    const hasHeaderBeforeGradeOrDate = degreeLines.length > 0 || institutionLines.length > 0;
    const headerToGradeGap = hasHeaderBeforeGradeOrDate && gradeLines.length > 0
      ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
      : 0;
    const headerToDateGapWhenNoGrade = hasHeaderBeforeGradeOrDate && gradeLines.length === 0 && dateLines.length > 0
      ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
      : 0;
    // Grade -> Date gap: set to EXACTLY the same baseline-to-baseline
    // step used between two consecutive lines of normal body/content
    // text elsewhere in this file (BODY_LINE_HEIGHT — see Professional
    // Summary/Experience description line-wrapping). Grade's own line
    // already advances y by its own font size (EXPERIENCE_SUBTITLE_SIZE
    // — the standard "no extra leading" metadata-line convention every
    // other field in this column uses); topping that up to
    // BODY_LINE_HEIGHT — the exact same math topUpToLineHeight() already
    // uses elsewhere in this file — is what makes Grade's and Date's
    // baselines exactly BODY_LINE_HEIGHT apart, with no new spacing
    // constant introduced.
    const gradeToDateTopUp = gradeLines.length > 0 && dateLines.length > 0
      ? BODY_LINE_HEIGHT - EXPERIENCE_SUBTITLE_SIZE
      : 0;

    const minimumEntrySpaceNeeded = degreeHeight + degreeToInstitutionGap + institutionHeight +
      headerToGradeGap + gradeHeight + gradeToDateTopUp + headerToDateGapWhenNoGrade + dateHeight;
    // Skipped while measuring (see measureEducationColumnHeight()): a
    // real checkPageBreak() call here could call doc.addPage(), which
    // would corrupt the "as if infinite space" total this call is
    // meant to produce, and would add a page as a SIDE EFFECT of mere
    // measurement, before the row has made its one real page-break
    // decision.
    if (!measuring) {
      y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);
    }

    if (degreeLines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(EXPERIENCE_TITLE_SIZE);
      doc.setTextColor(...COLOR_HEADING);
      if (!measuring) {
        doc.text(degreeLines, colX, y);
      }
      y += degreeHeight;
      contentEndY = y;
      if (institutionLines.length > 0) {
        y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
      } else if (gradeLines.length > 0 || dateLines.length > 0) {
        y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
      }
    }

    if (institutionLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
      doc.setTextColor(...COLOR_BODY); // Education University Name (institution) reuses COLOR_BODY — the existing Professional Summary body/content text color source of truth — instead of COLOR_METADATA. Font/size/position/weight unchanged.
      if (!measuring) {
        doc.text(institutionLines, colX, y);
      }
      y += institutionHeight;
      contentEndY = y;
      if (gradeLines.length > 0 || dateLines.length > 0) {
        y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
      }
    }

    // --- Grade (its own line now, no longer combined with the date) ---
    if (gradeLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
      doc.setTextColor(...COLOR_BODY); // Grade matches the Professional Summary body-content color — see the "DATE/CREDENTIAL FIELDS THAT MATCH PROFESSIONAL SUMMARY BODY TEXT" block above
      if (!measuring) {
        doc.text(gradeLines, colX, y);
      }
      y += gradeHeight;
      contentEndY = y;
      if (dateLines.length > 0) {
        // Grade -> Date: BODY_LINE_HEIGHT baseline-to-baseline step (see note above).
        y += BODY_LINE_HEIGHT - EXPERIENCE_SUBTITLE_SIZE;
      }
    }

    // --- Date (below Grade when Grade is present; otherwise in Grade's old slot) ---
    if (dateLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
      doc.setTextColor(...COLOR_BODY); // Date matches the Professional Summary body-content color — see the "DATE/CREDENTIAL FIELDS THAT MATCH PROFESSIONAL SUMMARY BODY TEXT" block above
      if (!measuring) {
        doc.text(dateLines, colX, y);
      }
      y += dateHeight;
      contentEndY = y;
    }

    const lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE; // every field in this column shares one size
    y = topUpToLineHeight(y, degreeLines.length > 0 && institutionLines.length === 0 && gradeLines.length === 0 && dateLines.length === 0 ? EXPERIENCE_TITLE_SIZE : lastLineFontSize);
  });

  return { rawEndY: y, contentEndY };
}

// Renders the Certifications column of the shared row above: Name
// (bold, COLOR_HEADING), Date (COLOR_BODY), Credential ID (COLOR_BODY —
// both match the Professional Summary's body-content color). Mirrors
// renderCertificationColumn()'s exact field-sequence/gap-conditional
// pattern, wrapped to this column's own width. See renderEducationColumn()
// above for the meaning of the returned {rawEndY, contentEndY} pair.
function renderCertificationColumn(
  doc: jsPDF,
  certifications: ExecutivePdfCertification[],
  colX: number,
  colWidth: number,
  startY: number,
  measuring: boolean = false
): { rawEndY: number; contentEndY: number } {
  let y = startY;
  let contentEndY = startY;

  certifications.forEach((cert, index) => {
    if (index > 0) {
      y += EXPERIENCE_ENTRY_GAP;
    }

    const name = (cert.name || '').trim();
    const date = (cert.date || '').trim();
    const credentialId = (cert.credentialId || '').trim();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    const nameLines: string[] = name ? doc.splitTextToSize(name, colWidth) : [];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    const dateLines: string[] = date ? doc.splitTextToSize(date, colWidth) : [];
    const credentialLines: string[] = credentialId ? doc.splitTextToSize(`ID: ${credentialId}`, colWidth) : [];

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

    const minimumEntrySpaceNeeded = nameHeight + nameToDateGap + dateHeight +
      dateToCredentialGap + credentialHeight + nameToCredentialGap;
    // Skipped while measuring — see the matching note in
    // renderEducationColumn() above.
    if (!measuring) {
      y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);
    }

    if (nameLines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(EXPERIENCE_TITLE_SIZE);
      doc.setTextColor(...COLOR_HEADING);
      if (!measuring) {
        doc.text(nameLines, colX, y);
      }
      y += nameHeight;
      contentEndY = y;
      if (dateLines.length > 0 || credentialLines.length > 0) {
        y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
      }
    }

    if (dateLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
      doc.setTextColor(...COLOR_BODY); // Certificate Date / Credential ID match the Professional Summary body-content color — see the "DATE/CREDENTIAL FIELDS THAT MATCH PROFESSIONAL SUMMARY BODY TEXT" block above
      if (!measuring) {
        doc.text(dateLines, colX, y);
      }
      y += dateHeight;
      contentEndY = y;
      if (credentialLines.length > 0) {
        y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
      }
    }

    if (credentialLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
      doc.setTextColor(...COLOR_BODY); // Certificate Date / Credential ID match the Professional Summary body-content color — see the "DATE/CREDENTIAL FIELDS THAT MATCH PROFESSIONAL SUMMARY BODY TEXT" block above
      if (!measuring) {
        doc.text(credentialLines, colX, y);
      }
      y += credentialHeight;
      contentEndY = y;
    }

    let lastLineFontSize: number;
    if (credentialLines.length > 0 || dateLines.length > 0) {
      lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE;
    } else {
      lastLineFontSize = EXPERIENCE_TITLE_SIZE;
    }
    y = topUpToLineHeight(y, lastLineFontSize);
  });

  return { rawEndY: y, contentEndY };
}

// An entry counts as "usable" if it has ANY content worth printing —
// same rule as hasUsableExperienceContent()/hasUsableEducationContent().
function hasUsableLanguageContent(lang: ExecutivePdfLanguage | null | undefined): boolean {
  if (!lang) {
    return false;
  }
  return Boolean((lang.language || '').trim() || (lang.proficiency || '').trim());
}

// Expands the form's stored short proficiency code to the same
// human-readable label LanguagesSection.tsx's own getProficiencyLabel()
// shows in its preview line. Intentionally duplicated (not imported)
// for the same reason parseSkillsList() duplicates getSkillArray()'s
// rule instead of sharing it: executivePdf.ts is a self-contained
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

// Renders the Languages column of the shared row above. VISUAL FORMAT
// UPDATE: each language entry is now rendered as two stacked lines —
//   Language Name   (bold, COLOR_HEADING, EXPERIENCE_TITLE_SIZE)
//   Language Level  (normal, COLOR_METADATA, EXPERIENCE_SUBTITLE_SIZE)
// — copied from Modern PDF's addLanguageEntry() visual/content
// presentation ONLY (name above, level below, on its own line). No
// coordinate, or architecture was copied from Modern PDF's visual
// design: the gap between name and level reuses this file's own existing
// EXPERIENCE_TITLE_TO_SUBTITLE_GAP (the same title->subtitle gap
// Education/Certification/Experience entries already use for an
// analogous bold-title-to-normal-subtitle transition — not a section
// gap). The entry-to-entry spacing mechanism IS copied from Modern PDF
// (its own addLanguageEntry()/addLanguages()): no separate additive gap
// is inserted between one language item and the next — every entry
// normalizes its own trailing Y via this file's existing
// topUpToLineHeight() helper (the same mechanism this file's own
// renderEducationColumn() already uses between Education entries), and
// that normalized position IS the gap into the next entry. No bullet
// character is used in this format, matching Modern PDF's un-bulleted
// presentation.
// Entries with only one of the two fields simply omit the other line,
// with no artificial space reserved for it — same convention Modern
// PDF's addLanguageEntry() uses. See renderEducationColumn() above for
// the meaning of the returned {rawEndY, contentEndY} pair.
function renderLanguageColumn(
  doc: jsPDF,
  languages: ExecutivePdfLanguage[],
  colX: number,
  colWidth: number,
  startY: number,
  measuring: boolean = false
): { rawEndY: number; contentEndY: number } {
  let y = startY;
  let contentEndY = startY;

  languages.forEach((lang) => {
    const language = (lang.language || '').trim();
    const proficiencyRaw = (lang.proficiency || '').trim();
    const proficiencyLabel = proficiencyRaw ? getProficiencyDisplayLabel(proficiencyRaw) : '';

    if (!language && !proficiencyLabel) {
      return;
    }

    // Wrap language name and level independently, each within this
    // column's own width — the same title/subtitle wrapping pattern
    // renderEducationColumn() uses for degree/institution.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    const languageLines: string[] = language ? doc.splitTextToSize(language, colWidth) : [];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    const proficiencyLines: string[] = proficiencyLabel
      ? doc.splitTextToSize(proficiencyLabel, colWidth)
      : [];

    const languageHeight = languageLines.length * EXPERIENCE_TITLE_SIZE;
    const proficiencyHeight = proficiencyLines.length * EXPERIENCE_SUBTITLE_SIZE;
    const nameToLevelGap = languageLines.length > 0 && proficiencyLines.length > 0
      ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
      : 0;

    const minimumEntrySpaceNeeded = languageHeight + nameToLevelGap + proficiencyHeight;
    // Skipped while measuring — see the matching note in
    // renderEducationColumn() above.
    if (!measuring) {
      y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);
    }

    // --- Language Name ---
    if (languageLines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(EXPERIENCE_TITLE_SIZE);
      doc.setTextColor(...COLOR_HEADING);
      if (!measuring) {
        doc.text(languageLines, colX, y);
      }
      y += languageHeight;
      contentEndY = y;
      if (proficiencyLines.length > 0) {
        y += EXPERIENCE_TITLE_TO_SUBTITLE_GAP;
      }
    }

    // --- Language Level (below the name) ---
    if (proficiencyLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
      doc.setTextColor(...COLOR_METADATA);
      if (!measuring) {
        doc.text(proficiencyLines, colX, y);
      }
      y += proficiencyHeight;
      contentEndY = y;
    }

    // ENTRY-TO-ENTRY SPACING — ported from modernPdf.ts's addLanguageEntry()/
    // addLanguages(): Modern adds NO separate additive gap between one
    // language item and the next; instead every entry normalizes its own
    // trailing Y to a body-line-equivalent position via topUpToLineHeight(),
    // and that normalized position IS the gap into the next entry. This is
    // also exactly the mechanism this file's own renderEducationColumn()
    // above already uses between Education entries — so Languages now
    // shares that same existing internal-item-gap mechanism (this file's
    // own topUpToLineHeight() helper) instead of a fixed additive gap.
    // Keyed to whichever field was actually rendered last, same selection
    // rule renderEducationColumn() uses.
    const lastLineFontSize = proficiencyLines.length > 0
      ? EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_TITLE_SIZE;
    y = topUpToLineHeight(y, lastLineFontSize);
  });

  return { rawEndY: y, contentEndY };
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
function addSkills(doc: jsPDF, data: ExecutivePdfData, startY: number): number {
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
  y = renderSectionHeading(doc, 'SKILLS', y, BODY_SIZE, 'skills');

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
// a shared import, since executivePdf.ts is a self-contained renderer —
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
function addAchievements(doc: jsPDF, data: ExecutivePdfData, startY: number): number {
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
  y = renderSectionHeading(doc, 'ACHIEVEMENTS', y, EXPERIENCE_TITLE_SIZE, 'achievements');

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

// ------------------------------------------------------------------
// ACHIEVEMENT-ONLY SAFEGUARD: Name/Date same-row width floor
// ------------------------------------------------------------------
// renderTitleRowWithDate()'s existing same-row math gives the
// Achievement Name whatever width is left over after the Achievement
// Date (CONTENT_WIDTH - dateWidth - TITLE_TO_DATE_GAP_PT), clamped
// only to a minimum of 0 — it puts no floor on how small that
// leftover can get. An unusually long Achievement Date can shrink it
// to a sliver too narrow for even the Achievement Name's single
// longest word, which is exactly when doc.splitTextToSize() stops
// wrapping by words and starts wrapping by individual characters
// (confirmed by rendering the actual PDF with a long Name + long
// Date, per the RENDERED PDF VERIFICATION requirement). The same
// oversized Date also has no floor stopping it from landing right up
// against — or past — the existing right content boundary once the
// Name's column has collapsed like this.
//
// This is scoped to Achievements only: renderTitleRowWithDate() and
// every one of its other call sites (Experience, Education) are left
// completely untouched below, so their layouts, spacing, and date
// placement are byte-for-byte unchanged.
//
// The check below reuses the exact same doc.getTextWidth() measurement
// approach renderTitleRowWithDate() already uses (no new magic-number
// threshold): it measures the Achievement Name's own widest single
// word and asks whether the same-row leftover width can actually fit
// it. If it can, the entry renders exactly as
// renderTitleRowWithDate() already renders it — same row, same
// widths, same call — nothing changes for the overwhelming majority
// of achievements, whose dates are short. Only when the leftover
// width is too small for even one word does the Date drop to its own
// line directly below the Name, using EXPERIENCE_TITLE_TO_SUBTITLE_GAP
// (the same existing gap already used between a title row and the
// line beneath it, e.g. Experience's company line) — so the Name
// always gets the full CONTENT_WIDTH to wrap normally by words, and
// the Date still right-aligns to the same existing right content
// boundary (PAGE_WIDTH - RIGHT_MARGIN) every other date uses, just on
// its own row instead of sharing the Name's.
function measureWidestWord(doc: jsPDF, text: string): number {
  if (!text) {
    return 0;
  }
  let widest = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    widest = Math.max(widest, doc.getTextWidth(word));
  }
  return widest;
}

// Decides, without drawing anything, whether the Achievement Name and
// Achievement Date can share one row (renderTitleRowWithDate()'s
// existing behavior) or need the Date-drops-below fallback. Used by
// both the page-break space estimate and the actual render below, so
// the two can never disagree about how tall the entry's header is.
function computeAchievementHeaderLayout(
  doc: jsPDF,
  title: string,
  date: string
): { sameRow: boolean; lineCount: number; height: number } {
  let dateWidth = 0;
  if (date) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    dateWidth = doc.getTextWidth(date);
  }

  const sameRowTitleWrapWidth = date
    ? Math.max(0, CONTENT_WIDTH - dateWidth - TITLE_TO_DATE_GAP_PT)
    : CONTENT_WIDTH;

  let sameRow = true;
  if (title && date) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    const widestWord = measureWidestWord(doc, title);
    sameRow = sameRowTitleWrapWidth > 0 && sameRowTitleWrapWidth >= widestWord;
  }

  if (sameRow) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    const lineCount = title ? doc.splitTextToSize(title, sameRowTitleWrapWidth).length : 0;
    const height = lineCount > 0
      ? lineCount * EXPERIENCE_TITLE_SIZE
      : (date ? EXPERIENCE_SUBTITLE_SIZE : 0);
    return { sameRow: true, lineCount, height };
  }

  // Fallback layout: Name wraps across the full CONTENT_WIDTH, Date
  // drops to its own line directly below via EXPERIENCE_TITLE_TO_SUBTITLE_GAP.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const lineCount = title ? doc.splitTextToSize(title, CONTENT_WIDTH).length : 0;
  const titleHeight = lineCount > 0 ? lineCount * EXPERIENCE_TITLE_SIZE : 0;
  const dateRowHeight = lineCount > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP + EXPERIENCE_SUBTITLE_SIZE
    : EXPERIENCE_SUBTITLE_SIZE;
  return { sameRow: false, lineCount, height: titleHeight + dateRowHeight };
}

// Renders the Achievement Name + Achievement Date header using
// computeAchievementHeaderLayout()'s decision above. Same-row case
// delegates straight to the existing, unmodified
// renderTitleRowWithDate() (identical output to before this fix).
// Fallback case draws the Name across the full CONTENT_WIDTH, then the
// Date on its own line below, right-aligned to the same existing
// right content boundary renderTitleRowWithDate() itself uses.
function renderAchievementHeader(
  doc: jsPDF,
  title: string,
  date: string,
  y: number,
  dateColor: readonly [number, number, number]
): { height: number; hasContent: boolean } {
  const layout = computeAchievementHeaderLayout(doc, title, date);

  if (layout.sameRow) {
    const result = renderTitleRowWithDate(doc, title, date, y, dateColor);
    return { height: result.height, hasContent: result.hasContent };
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleLines: string[] = title ? doc.splitTextToSize(title, CONTENT_WIDTH) : [];
  if (titleLines.length > 0) {
    doc.setTextColor(...COLOR_HEADING);
    doc.text(titleLines, LEFT_MARGIN, y);
  }
  const titleHeight = titleLines.length > 0 ? titleLines.length * EXPERIENCE_TITLE_SIZE : 0;

  if (date) {
    const dateY = y + titleHeight + (titleLines.length > 0 ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0);
    const rightBoundary = PAGE_WIDTH - RIGHT_MARGIN;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    const dateWidth = doc.getTextWidth(date);
    const dateX = rightBoundary - dateWidth;
    doc.setTextColor(...dateColor);
    doc.text(date, dateX, dateY);
  }

  return { height: layout.height, hasContent: titleLines.length > 0 || Boolean(date) };
}

// Renders a single achievement entry and returns the new Y position,
// normalized (like every Education/Language entry) so every entry —
// not only the section's last one — ends on an equivalent trailing space.
// Renders a left-aligned title/degree/achievement-name (bold,
// COLOR_HEADING, EXPERIENCE_TITLE_SIZE) with its date right-aligned on
// the SAME baseline row (normal weight, caller-provided dateColor —
// Experience and Achievements both pass COLOR_BODY, matching the
// Professional Summary's body-content color —
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
  dateColor: readonly [number, number, number] = COLOR_DATE,
  // Optional left edge + wrap width for the title text, so a caller
  // whose content column has been shifted (currently only Experience,
  // to make room for its vertical timeline — see EXPERIENCE_CONTENT_
  // START_X/EXPERIENCE_CONTENT_WIDTH above) can pass its own values.
  // Defaulting to LEFT_MARGIN/CONTENT_WIDTH keeps every other existing
  // call site (Achievements) byte-for-byte unchanged. The date itself
  // stays anchored to the page's own right margin regardless of these
  // params — only the title's left edge and wrap width shift.
  x: number = LEFT_MARGIN,
  maxWidth: number = CONTENT_WIDTH
): { lines: string[]; height: number; hasContent: boolean } {
  let dateWidth = 0;
  if (date) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    dateWidth = doc.getTextWidth(date);
  }

  const titleWrapWidth = date
    ? Math.max(0, maxWidth - dateWidth - TITLE_TO_DATE_GAP_PT)
    : maxWidth;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const titleLines: string[] = title ? doc.splitTextToSize(title, titleWrapWidth) : [];

  if (titleLines.length > 0) {
    doc.setTextColor(...COLOR_HEADING);
    doc.text(titleLines, x, y);
  }

  if (date) {
    const rightBoundary = PAGE_WIDTH - RIGHT_MARGIN;
    const dateX = rightBoundary - dateWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...dateColor); // caller-provided date color — Experience/Achievements both now pass COLOR_BODY (Professional Summary's body-content color), see the "DATE/CREDENTIAL FIELDS THAT MATCH PROFESSIONAL SUMMARY BODY TEXT" block above
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
        doc.setTextColor(...COLOR_SECTION_HEADING); // bullet dot — OLD Executive's theme `primary` (dark navy), see COLOR_SECTION_HEADING above
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

// Companion to renderBulletedDescriptionLines() above, for the
// INPUT-DRIVEN bullet rule: used when the Achievement description
// contains NO bullet markers, so it renders as plain flowing body
// text — zero bullet dots, full LEFT_MARGIN indentation — using the
// exact same per-line draw pattern (font/size/color, checkPageBreak,
// BODY_LINE_HEIGHT advance) that Experience's and Projects' own
// (non-bulleted) description blocks already use elsewhere in this
// file, rather than introducing a new spacing/positioning convention.
function renderPlainDescriptionLines(doc: jsPDF, lines: string[], startY: number): number {
  let y = startY;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(...COLOR_BODY);

  for (const line of lines) {
    y = checkPageBreak(doc, y, BODY_LINE_HEIGHT);
    doc.text(line, LEFT_MARGIN, y);
    y += BODY_LINE_HEIGHT;
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
  // INPUT-DRIVEN BULLET RULE: bullets are rendered ONLY when the raw
  // input actually contains bullet markers (see BULLET_MARKER_REGEX
  // above) — never added automatically just because this is an
  // Achievement description. `rawDescriptionLines` is the user's own
  // manual line breaks ('\n'), trimmed, before any bullet/marker
  // decision is made.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  const rawDescriptionLines: string[] = description
    ? description
        .split('\n')
        .map((rawLine) => rawLine.trim())
        .filter((trimmedLine) => trimmedLine.length > 0)
    : [];

  const hasBulletMarkers = rawDescriptionLines.some((rawLine) => BULLET_MARKER_REGEX.test(rawLine));

  let descriptionItems: string[][] = [];
  let descriptionLines: string[] = [];

  if (hasBulletMarkers) {
    // ONE-BULLET-PER-ITEM, using the INPUT'S OWN marker structure: a
    // raw line that starts with a bullet marker begins a new
    // Achievement item (the marker itself is stripped — it is not
    // re-drawn alongside the dot this file already paints). A raw line
    // with NO marker is a manually-typed continuation of the item
    // immediately above it (rather than a new bullet), so it is
    // appended to that item's text instead of starting a new bullet —
    // this is what "detect/use the existing marker structure" means in
    // practice for freeform pasted input. `descriptionItems` keeps one
    // array entry per logical item (that item's own wrapped lines), so
    // renderBulletedDescriptionLines() can draw exactly one dot per
    // item — a sentence that wraps onto 2, 10, or 20 lines still shows
    // exactly one bullet, and the output bullet count exactly matches
    // the number of marked items in the input.
    const itemTexts: string[] = [];
    for (const rawLine of rawDescriptionLines) {
      if (BULLET_MARKER_REGEX.test(rawLine)) {
        itemTexts.push(rawLine.replace(BULLET_MARKER_REGEX, '').trim());
      } else if (itemTexts.length > 0) {
        itemTexts[itemTexts.length - 1] = `${itemTexts[itemTexts.length - 1]} ${rawLine}`.trim();
      } else {
        itemTexts.push(rawLine);
      }
    }
    descriptionItems = itemTexts.map((text) => doc.splitTextToSize(text, CONTENT_WIDTH));
    descriptionLines = descriptionItems.flat();
  } else {
    // No bullet markers anywhere in the input — render as plain
    // flowing body text (renderPlainDescriptionLines() below), the
    // same non-bulleted convention Experience/Projects descriptions
    // already use. Zero bullets, regardless of manual line count.
    descriptionLines = rawDescriptionLines.flatMap((rawLine) => doc.splitTextToSize(rawLine, CONTENT_WIDTH));
  }

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a title from its
  // date/description. The title row's height only depends on how many
  // lines the title itself wraps into (computed here via the same
  // computeAchievementHeaderLayout() the actual render call below
  // uses), so this estimate stays accurate without having to render
  // twice, and always agrees with what actually gets drawn. ---
  const headerLayoutEstimate = computeAchievementHeaderLayout(doc, title, date);
  const titleRowHeightEstimate = headerLayoutEstimate.height;
  const hasHeaderContent = Boolean(title || date);
  const headerToDescriptionGap = hasHeaderContent && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const minimumEntrySpaceNeeded = titleRowHeightEstimate +
    headerToDescriptionGap + firstDescriptionLineHeight;
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // --- Achievement Title (left) + Date (right, same row when the
  // Name has enough width to still wrap normally by words; Date drops
  // to its own line below otherwise — see renderAchievementHeader()
  // above) ---
  const titleRow = renderAchievementHeader(doc, title, date, y, COLOR_BODY); // Achievement Date matches the Professional Summary body-content color — see the "DATE/CREDENTIAL FIELDS THAT MATCH PROFESSIONAL SUMMARY BODY TEXT" block above
  if (titleRow.hasContent) {
    y += titleRow.height;
  }

  // --- Description (optional, wrapped body text, rendered as bullets) ---
  if (descriptionLines.length > 0) {
    // Only add the gap if there was header content before it
    if (hasHeaderContent) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }

    y = hasBulletMarkers
      ? renderBulletedDescriptionLines(doc, descriptionItems, y)
      : renderPlainDescriptionLines(doc, descriptionLines, y);
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
function addProjects(doc: jsPDF, data: ExecutivePdfData, startY: number): number {
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
  y = renderSectionHeading(doc, 'PROJECTS', y, EXPERIENCE_TITLE_SIZE, 'projects');

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

  const minimumEntrySpaceNeeded = nameHeight + nameToTechGap + techHeight +
    headerToDescriptionGap + descriptionHeight +
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
  // comment inside renderEducationColumn() for the full analysis.
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
// addEducationCertificationsLanguagesRow() (and its renderEducationColumn()/
// renderCertificationColumn()/renderLanguageColumn() column helpers), addSkills(),
// addAchievements()/addAchievementEntry(), addProjects()/
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