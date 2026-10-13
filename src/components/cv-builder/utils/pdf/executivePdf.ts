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
const BOTTOM_MARGIN = 40;

// Usable horizontal space for text, after subtracting both margins.
// Used for text-wrapping calculations.
const CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;

// Usable vertical space for content on a single page, after subtracting
// both the top and bottom margins. Used by keepTogetherHeight() below to
// cap any single "keep this together" reservation at a ceiling that
// could actually fit on a fresh page — otherwise checkPageBreak() could
// demand a new page that still wouldn't be big enough for the block it's
// reserving space for.
const PAGE_USABLE_HEIGHT = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

// ====================================================================
// TYPOGRAPHY CONSTANTS (font sizes, in points)
// ====================================================================
const NAME_SIZE = 22;
const TITLE_SIZE = 13;
const METADATA_SIZE = 9.5; // contact line (email / phone / location / links)

// Reserved for later phases (section headings, body paragraphs).
// Declared now so every size constant lives in one place from the start.
// AUTO-FIT: these drive a resume's overall bulk (not the header's own
// name/title/contact sizes), so each is a BASE_*/mutable pair —
// recomputeScaledConstants() below rescales them when a resume overflows
// to a second page by only a small amount. BASE_* is the authored value;
// the bare name is what every render/measure function actually reads,
// and is reset back to BASE_* (scale 1) at the start/end of every
// generateExecutivePDF() call — see "AUTO-FIT TO ONE PAGE" below.
const BASE_HEADING_SIZE = 12;
let HEADING_SIZE = BASE_HEADING_SIZE;
const BASE_BODY_SIZE = 10.5;
let BODY_SIZE = BASE_BODY_SIZE;

// Multiplier applied to BODY_SIZE to get the vertical distance between
// wrapped lines of paragraph text (a.k.a. "leading"). 1.4 is a normal,
// readable line-height for body copy — tight enough to stay compact,
// loose enough not to feel cramped. Used by every body-text section
// (Summary, Experience, and later ones), so it lives here once rather
// than being redefined per section. Not itself scaled — it's a ratio,
// not a size — but BODY_LINE_HEIGHT (below) is recomputed from it every
// time BODY_SIZE changes.
const BODY_LINE_HEIGHT_MULTIPLIER = 1.4;

// The actual computed line height used whenever BODY_SIZE text wraps
// across multiple lines. Computed once here instead of recomputing
// `BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER` inline in every section.
// AUTO-FIT: recomputed by recomputeScaledConstants() after BODY_SIZE
// changes, so it's `let`, not `const`.
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
// Header's own gaps — NOT scaled by auto-fit (header typography/layout
// is excluded from auto-fit by design).
const NAME_TO_TITLE_GAP = 6;
const TITLE_TO_CONTACT_GAP = 10;
const HEADER_RULE_GAP = 12; // space above AND below the divider line under the header

// Reserved for later phases (sections, list items, bullets).
// AUTO-FIT: bulk spacing constants — BASE_*/mutable pairs, same
// convention as the typography constants above.
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

// The exact whitespace required on EACH side of the divider (heading
// -> divider, and divider -> content), as real, visible, empty space —
// not a baseline-to-baseline distance. One constant, reused for both
// sides and for every section, so "heading->divider" and
// "divider->content" can never drift apart from each other.
// AUTO-FIT: this is a bulk spacing gap (heading<->divider<->content), so
// it's a BASE_*/mutable pair — recomputeScaledConstants() rescales the mm
// figure and DIVIDER_SIDE_GAP_PT is re-derived from it every time.
const BASE_DIVIDER_SIDE_GAP_MM = 4; // requested: 2mm -> 4mm on each side
let DIVIDER_SIDE_GAP_MM = BASE_DIVIDER_SIDE_GAP_MM;
let DIVIDER_SIDE_GAP_PT = DIVIDER_SIDE_GAP_MM * MM_TO_PT; // 4mm, ≈ 11.3386pt

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

// Requested follow-up: on top of the +7px bump above, the photo's
// rendered diameter must grow an additional 5% further. Expressed as
// its own named percentage constant (not a raw 1.05 magic multiplier)
// and applied as a single multiplier over the already-combined
// (HEADER_PHOTO_SIZE_PT + HEADER_PHOTO_SIZE_INCREASE_PT) diameter below
// — so it's one source of truth (HEADER_PHOTO_RENDER_SIZE_PT) that
// every drawn-geometry read (photoRadius, drawWidth/drawHeight, photoX/
// photoTopY centering, drawX/drawY) automatically picks up, exactly
// like the +7px bump already does. Same "HEADER_PHOTO_RENDER_SIZE_PT is
// the ONLY size used for the photo's own drawn geometry" rule from the
// comment above still holds — HEADER_PHOTO_SIZE_PT itself (read by
// textStartX/photoOverhang's footprint-bottom math) is untouched by
// this too.
const HEADER_PHOTO_ADDITIONAL_SIZE_INCREASE_PERCENT = 5;
const HEADER_PHOTO_ADDITIONAL_SIZE_INCREASE_MULTIPLIER =
  1 + HEADER_PHOTO_ADDITIONAL_SIZE_INCREASE_PERCENT / 100;
const HEADER_PHOTO_RENDER_SIZE_PT =
  (HEADER_PHOTO_SIZE_PT + HEADER_PHOTO_SIZE_INCREASE_PT) * HEADER_PHOTO_ADDITIONAL_SIZE_INCREASE_MULTIPLIER;

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
// Requested follow-up: the header photo (when present) needs to sit a
// further 3mm lower than its current vertically-centered position —
// Name/Job Title/Contact must NOT move because of this, and neither
// must the header band/border, which stay driven entirely by
// contactInkBottomY (itself derived from photoFootprintTopY, the
// UNSHIFTED footprint — see photoFootprintTopY's own definition below)
// and never reference this shift at all — so growing this constant can
// never move the band fill, the gold border, or the divider position;
// only the photo's own drawn circle/image moves. Expressed in mm and
// converted through the file's existing MM_TO_PT constant, same
// convention as every other mm-sourced offset in this file (e.g.
// PHOTO_TO_CONTACT_GAP_MM above, NO_IMAGE_NAME_Y_OFFSET_MM below) — no
// raw pt magic number. Read in exactly one place: addHeader()'s photo
// vertical positioning (photoTopY/photoCenterY/drawY). It is NOT added
// to blockTopY/blockBottomY/blockHeight or to the photoOverhang
// reservation that sizes the gap before the Contact line — those stay
// based on the photo's original (unshifted) footprint, which is
// exactly what keeps Name/Job Title/Contact position unaffected by
// this shift.
// UPDATED (cleanly, in place — not stacked as a new constant): per the
// latest request the photo needs to move down a further 1mm on top of
// the previous 9mm, so this single constant is now 10mm total — same
// "one constant, updated value" convention this file already follows
// (see NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_MM's own "UPDATED" comment
// above for the precedent).
const HEADER_PHOTO_VERTICAL_SHIFT_MM = 10;
const HEADER_PHOTO_VERTICAL_SHIFT_PT = HEADER_PHOTO_VERTICAL_SHIFT_MM * MM_TO_PT;

// Requested follow-up: the header photo also needs to move further to
// the RIGHT of its current position. Same convention as
// HEADER_PHOTO_VERTICAL_SHIFT_PT immediately above: added ONLY to the
// photo's own drawn X position (photoX, and everything derived from it
// — photoCenterX/drawX) — never to blockTopY/blockBottomY/blockHeight,
// the photoFootprint*/photoOverhang reservation, or anything the
// header band/border/divider are derived from (those stay keyed off
// PAGE_WIDTH/RIGHT_MARGIN and the existing inset constants), so Name/
// Job Title/Contact and every header-sizing rule are completely
// unaffected by this shift — only the photo's own circle/image moves.
// Expressed in mm and converted through MM_TO_PT, same convention as
// every other offset in this file — no raw pt magic number.
// UPDATED (cleanly, in place — not stacked as a new constant): per the
// latest request the photo needs to move a further 1mm to the right on
// top of the previous 2mm, so this single constant is now 3mm total —
// same "one constant, updated value" convention this file already
// follows (see NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_MM's own "UPDATED"
// comment above for the precedent).
const HEADER_PHOTO_HORIZONTAL_SHIFT_MM = 3;
const HEADER_PHOTO_HORIZONTAL_SHIFT_PT = HEADER_PHOTO_HORIZONTAL_SHIFT_MM * MM_TO_PT;

const PHOTO_TO_CONTACT_GAP_MM = 0.5;
const PHOTO_TO_CONTACT_GAP_PT = PHOTO_TO_CONTACT_GAP_MM * MM_TO_PT;

// FIX: Contact line width rule, copied from classicPdf.ts's addHeader()
// (the "With a photo, the Contact's right boundary is the photo's left
// edge minus a safety gap; without one, the full content width" rule —
// see that file's contactRight/contactWidth/CONTACT_PHOTO_SAFETY_GAP_PT).
// Only the WIDTH rule is ported — this file's own contact
// text/icon/line-wrap layout (buildContactLines(), CONTACT_ITEM_ICON_
// FOOTPRINT_PT, BODY_LINE_HEIGHT line spacing, everything else in
// addHeader()) is completely untouched. Same mm -> pt conversion
// convention as every other offset in this file — no raw pt magic
// number. Read in exactly one place: the contactMaxWidth passed to
// buildContactLines() below.
const CONTACT_PHOTO_SAFETY_GAP_MM = 3;
const CONTACT_PHOTO_SAFETY_GAP_PT = CONTACT_PHOTO_SAFETY_GAP_MM * MM_TO_PT;

// FIX (previously): these two constants used to be added, ONLY in the
// no-photo branch of addHeader(), to the Y value used to draw the
// Name/Job Title baselines. That made Name/Job Title sit lower when no
// photo was present than when one was — position depended on photo
// presence, which is wrong; the header content's position must be
// identical either way. addHeader()'s no-photo branch no longer reads
// either constant (its baseline math now matches the hasPhoto branch
// exactly). Left declared/unused rather than deleted, per this file's
// existing "keep old constants rather than remove them" convention.
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

// Requested follow-up: Name and Job Title now need to move down by
// their OWN separate additional amounts on top of everything
// NAME_TITLE_VERTICAL_SHIFT_PT/NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_PT
// above already add — Contact and the header photo must NOT move
// because of this. Same mm -> pt conversion convention as every other
// offset in this file — no raw pt magic number. Applied ONLY at the
// two Phase B doc.text() draw calls (nameDrawY/titleDrawY below),
// exactly like the two shared shifts above — never to
// nameBaselineY/titleBaselineY themselves, so nothing that reads those
// (photo vertical centering/photoFootprintTopY, the `y` cursor,
// Contact line position, header divider/band position) is affected;
// this is what keeps Contact and the photo locked in place.
// UPDATED (cleanly, in place — not stacked as new constants): per the
// latest request, Name needs a further 1mm on top of the previous 3mm
// (now 4mm total), and Job Title needs a further 0.5mm on top of the
// previous 2.5mm (now 3mm total) — same "one constant, updated value"
// convention this file already follows (see
// NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_MM's own "UPDATED" comment
// above for the precedent).
// UPDATED AGAIN: latest request is Job Title ONLY, moving 0.5mm back
// UP (i.e. less downward shift) from the previous 3mm, so this single
// constant is now 2.5mm — Name (its own separate
// NAME_EXTRA_VERTICAL_SHIFT_MM constant, untouched), Contact, and the
// header photo are read from entirely separate constants/positions
// (CONTACT_Y_OFFSET_PT/CONTACT_X_OFFSET_PT and
// photoX/photoTopY/HEADER_PHOTO_VERTICAL_SHIFT_PT/
// HEADER_PHOTO_HORIZONTAL_SHIFT_PT respectively) that this constant is
// never added to, so none of them move; and this constant is applied
// ONLY at the titleDrawY draw call below — never to titleBaselineY
// itself — so header band/border/divider (all derived from
// titleBaselineY/contactInkBottomY via the unshifted footprint math)
// are completely unaffected too.
const NAME_EXTRA_VERTICAL_SHIFT_MM = 4;
const NAME_EXTRA_VERTICAL_SHIFT_PT = NAME_EXTRA_VERTICAL_SHIFT_MM * MM_TO_PT;
const TITLE_EXTRA_VERTICAL_SHIFT_MM = 2.5;
const TITLE_EXTRA_VERTICAL_SHIFT_PT = TITLE_EXTRA_VERTICAL_SHIFT_MM * MM_TO_PT;

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

// Requested follow-up: Name, Job Title, and Contact must each move
// further to the LEFT of whatever position they already compute above.
// The header band/border/divider (all derived from PAGE_WIDTH/
// RIGHT_MARGIN and the existing inset constants — see COLOR_HEADER_BG's
// band-fill rect and the gold-border rect in addHeader()'s Phase B) are
// keyed off PAGE_WIDTH, never off textStartX or CONTACT_X_OFFSET_PT, so
// this shift cannot move the band, the border, or the divider — only
// the text itself. Same mm -> pt conversion convention as every other
// offset in this file — no raw pt magic number. Applied at exactly two
// points: textStartX (which Name and Job Title both already share) and
// the Contact line's itemX base — never to LEFT_MARGIN itself, so
// CONTENT_WIDTH and every other LEFT_MARGIN-anchored wrap-width
// calculation in this file are untouched.
// UPDATED (cleanly, in place — not stacked as a new constant): per the
// latest request Name/Job Title/Contact need to move a further 1mm to
// the left on top of the previous 2mm, so this single constant is now
// 3mm total — same "one constant, updated value" convention this file
// already follows (see NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_MM's own
// "UPDATED" comment above for the precedent).
const HEADER_TEXT_HORIZONTAL_SHIFT_MM = 3;
const HEADER_TEXT_HORIZONTAL_SHIFT_PT = HEADER_TEXT_HORIZONTAL_SHIFT_MM * MM_TO_PT;

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
// AUTO-FIT: bulk spacing — BASE_*/mutable pairs.
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
// AUTO-FIT: bulk spacing — BASE_*/mutable pair.
const BASE_BULLET_DOT_TO_TEXT_GAP_MM = 3;
let BULLET_DOT_TO_TEXT_GAP_MM = BASE_BULLET_DOT_TO_TEXT_GAP_MM;
let BULLET_DOT_TO_TEXT_GAP_PT = BULLET_DOT_TO_TEXT_GAP_MM * MM_TO_PT;

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
// AUTO-FIT: bulk spacing — BASE_*/mutable pair.
const BASE_TITLE_TO_DATE_GAP_MM = 3;
let TITLE_TO_DATE_GAP_MM = BASE_TITLE_TO_DATE_GAP_MM;
let TITLE_TO_DATE_GAP_PT = TITLE_TO_DATE_GAP_MM * MM_TO_PT;

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

// Requested: reduce the header's overall SIZE by 4mm, from the TOP
// only. FIX (previous attempt only cropped the band's fill color,
// leaving the actual page-top whitespace unchanged since nothing
// downstream moved): this must shrink the true footprint the header
// occupies, so it is applied at the header's own content-start cursor
// (see the FIX comment at the top of addHeader(), where this constant
// is actually read/subtracted) rather than at headerBandTopY. Because
// the band's bottom edge (headerBandBottomY/headerDividerCenterY, and
// therefore the gold border's bottom inset, the divider, and the next
// section's starting Y) is derived FROM that same cursor, subtracting
// this constant there moves the band's bottom up by the same 4mm while
// the band's top edge stays at the true page edge (0) — no white gap,
// and the band's total height genuinely shrinks by exactly 4mm. Name/
// Job Title/Contact/photo positions relative to EACH OTHER are
// unaffected (every gap between them is computed relative to the same
// shifted cursor, so they move together, uniformly). Same mm -> pt
// conversion convention as every other offset in this file — no raw pt
// magic number.
const HEADER_TOP_SIZE_REDUCTION_MM = 4;
const HEADER_TOP_SIZE_REDUCTION_PT = HEADER_TOP_SIZE_REDUCTION_MM * MM_TO_PT;

// Requested: cut a further 3mm of area from the TOP of the header. Same
// mechanism as HEADER_TOP_SIZE_REDUCTION_PT above: it is subtracted from
// addHeader()'s own content-start cursor, so the band (anchored at the
// true page edge, y = 0) shrinks by exactly this much while the gold
// border frame stays inset from the band's edges by the same
// HEADER_BORDER_DRAWN_INSET_PT, every gap inside the header is unchanged
// (all computed relative to the same cursor), and the band bottom,
// divider and next section's start all move up together, so no section
// gap changes. Mirrors HEADER_TOP_CUT in ExecutiveTemplate.tsx 1:1.
const HEADER_TOP_CUT_MM = 3;
const HEADER_TOP_CUT_PT = HEADER_TOP_CUT_MM * MM_TO_PT; // 3mm, ≈ 8.5039pt

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
//   - grade: string  (optional, e.g. "3.8/4.0" — rendered with a
//                      "Grade:" label prefix, matching the Classic
//                      template's education section)
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
// AUTO-FIT TO ONE PAGE
// ------------------------------------------------------------------
// If a resume overflows onto a second page by only a SMALL amount, the
// text/spacing bulk constants converted to BASE_*/mutable pairs above
// are shrunk slightly (never below AUTO_FIT_MIN_SCALE of their authored
// size) so the resume fits back onto one page. This never touches page
// margins, the header's own typography/photo, colors, or any hairline
// stroke width — only the constants explicitly converted above. A
// resume that is genuinely multi-page (3+ pages, or overflows by more
// than AUTO_FIT_MAX_OVERFLOW_PT), or one that already fits on one page,
// is rendered completely untouched at scale 1.
// ====================================================================
let SCALE_FACTOR = 1;

// Recomputes every scaled constant from its BASE_* value at the given
// scale. Order matters where one constant is derived from another that
// was just rescaled (e.g. BODY_LINE_HEIGHT from BODY_SIZE) — those are
// recomputed AFTER their source, never before.
function recomputeScaledConstants(scale: number): void {
  SCALE_FACTOR = scale;

  HEADING_SIZE = BASE_HEADING_SIZE * scale;
  BODY_SIZE = BASE_BODY_SIZE * scale;
  EXPERIENCE_TITLE_SIZE = BASE_EXPERIENCE_TITLE_SIZE * scale;
  EXPERIENCE_SUBTITLE_SIZE = BASE_EXPERIENCE_SUBTITLE_SIZE * scale;

  SECTION_GAP = BASE_SECTION_GAP * scale;
  ITEM_GAP = BASE_ITEM_GAP * scale;
  BULLET_GAP = BASE_BULLET_GAP * scale;

  EXPERIENCE_TITLE_TO_SUBTITLE_GAP = BASE_EXPERIENCE_TITLE_TO_SUBTITLE_GAP * scale;
  EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = BASE_EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP * scale;
  EXPERIENCE_ENTRY_GAP = BASE_EXPERIENCE_ENTRY_GAP * scale;

  DIVIDER_SIDE_GAP_MM = BASE_DIVIDER_SIDE_GAP_MM * scale;
  BULLET_DOT_TO_TEXT_GAP_MM = BASE_BULLET_DOT_TO_TEXT_GAP_MM * scale;
  TITLE_TO_DATE_GAP_MM = BASE_TITLE_TO_DATE_GAP_MM * scale;

  // --- Derived constants, recomputed AFTER their sources above ---
  BODY_LINE_HEIGHT = BODY_SIZE * BODY_LINE_HEIGHT_MULTIPLIER;
  DIVIDER_SIDE_GAP_PT = DIVIDER_SIDE_GAP_MM * MM_TO_PT;
  BULLET_DOT_TO_TEXT_GAP_PT = BULLET_DOT_TO_TEXT_GAP_MM * MM_TO_PT;
  TITLE_TO_DATE_GAP_PT = TITLE_TO_DATE_GAP_MM * MM_TO_PT;
  TIMELINE_CONTINUATION_TOP_OFFSET_PT = BODY_SIZE * HELVETICA_ASCENT_RATIO;
}

const AUTO_FIT_MIN_SCALE = 0.85;
const AUTO_FIT_MAX_OVERFLOW_PT = PAGE_USABLE_HEIGHT * 0.35;

// ====================================================================
// ENTRY POINT
// ====================================================================

// Renders the full document once at whatever scale is currently active
// (see recomputeScaledConstants() above) and reports back how many
// pages it took and how much content landed on the last page — the
// auto-fit driver below uses this to decide whether to try a smaller
// scale, without ever touching this function's own rendering sequence.
function renderExecutivePDFOnce(data: ExecutivePdfData): { doc: jsPDF; pageCount: number; lastPageContentHeight: number } {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  let y = TOP_MARGIN;

  y = addHeader(doc, data, y);
  y = addSummary(doc, data, y);
  y = addExperience(doc, data, y);
  y = addEducation(doc, data, y);
  y = addCertifications(doc, data, y);
  y = addLanguages(doc, data, y);
  y = addSkills(doc, data, y);
  y = addAchievements(doc, data, y);
  y = addProjects(doc, data, y);

  return {
    doc,
    pageCount: doc.getNumberOfPages(),
    lastPageContentHeight: y - TOP_MARGIN,
  };
}

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

export function generateExecutivePDF(data: ExecutivePdfData): jsPDF {
  // WinAnsi-safety pass — see sanitizeTextForPdf() above. Every string
  // field in `data` is normalized ONCE here, before any measurement or
  // rendering, so the rest of the file (unchanged below) never sees an
  // unencodable character like U+2011 again.
  const sanitizedData = deepSanitizeForPdf(data);

  recomputeScaledConstants(1);
  const fullScaleResult = renderExecutivePDFOnce(sanitizedData);

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
    const attempt = renderExecutivePDFOnce(sanitizedData);
    if (attempt.pageCount === 1) {
      bestFit = { doc: attempt.doc, scale };
      break;
    }
  }

  recomputeScaledConstants(1);
  return bestFit ? bestFit.doc : fullScaleResult.doc;
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
  // FIX: HEADER_TOP_SIZE_REDUCTION_PT (the "reduce the header 4mm from
  // the top" request) must shrink the band's actual footprint, not just
  // recolor part of it — cropping headerBandTopY away from the true
  // page edge (0) left a visible WHITE strip above the navy fill
  // instead of actually reducing the header's size, since every
  // downstream position (content, band bottom, divider, the next
  // section's start) still began at the exact same Y as before. Applying
  // the reduction HERE instead — subtracted from the header's own
  // content-start cursor — moves content (and therefore
  // headerDividerCenterY/headerBandBottomY, which are both derived from
  // it) up by the same 4mm, so the band can stay anchored at the true
  // page edge (headerBandTopY = 0 below, no white strip) while its
  // total height still shrinks by exactly 4mm, entirely from the top.
  // Because every gap below this line (NAME_TO_TITLE_GAP, TITLE_TO_
  // CONTACT_GAP, the photo's centering, etc.) is computed relative to
  // this single cursor, the shift is uniform — Name/Job Title/Contact/
  // photo keep their existing distances from EACH OTHER; only their
  // shared distance from the page top (and the band height that
  // encloses them) changes.
  let y = startY + HEADER_TOP_EXTRA_PADDING_PT - HEADER_TOP_SIZE_REDUCTION_PT - HEADER_TOP_CUT_PT;
  const { personalInfo, phoneNumber, selectedCountryCode } = data;

  const name = sanitizeText((personalInfo?.name || '').trim()) || 'Your Name';
  const jobTitle = sanitizeText((personalInfo?.title || personalInfo?.jobTitle || '').trim());
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
  // left-side positioning calculation — textStartX is LEFT_MARGIN
  // (the same constant every other left-aligned header/content element
  // in this file already uses) minus HEADER_TEXT_HORIZONTAL_SHIFT_PT
  // (see that constant's own definition above), not a new/tuned
  // coordinate. Their vertical
  // position (nameBaselineY/titleBaselineY at draw time) is untouched
  // by this revert — see NAME_TITLE_VERTICAL_SHIFT_PT below, which
  // still applies exactly as before.
  let textStartX = LEFT_MARGIN - HEADER_TEXT_HORIZONTAL_SHIFT_PT;

  // Photo-branch-only measurements (left undefined when there's no photo).
  let photoX = 0, photoTopY = 0, photoRadius = 0, photoCenterX = 0, photoCenterY = 0;
  let photoSource = '', imgFormat = '';
  let drawWidth = 0, drawHeight = 0, drawX = 0, drawY = 0;

  // ------------------------------------------------------------------
  // Name/job-title baselines, and the block-height/photo-overhang
  // reservation derived from them, are now computed ONCE here — used
  // identically regardless of hasPhoto. FIX: previously this
  // "photoOverhang" reservation (the extra downward push before the
  // Contact line, added so a photo taller than the name/title block
  // doesn't overlap it) was computed and applied ONLY inside the
  // hasPhoto branch below. Since the reservation's size depends only
  // on HEADER_PHOTO_SIZE_PT/HEADER_PHOTO_RENDER_SIZE_PT (fixed
  // constants) and the name/title block's own height (NAME_SIZE/
  // TITLE_SIZE/NAME_TO_TITLE_GAP — identical whether or not a photo
  // exists), NOT on whether a photo is actually present, this reserved
  // gap was silently only ever added when hasPhoto was true — so the
  // Contact line (and everything that flows from it: header divider,
  // header band height, next section's start Y) sat lower only when a
  // photo was present, even though nothing about the photo's actual
  // presence should change that reservation. Computing it once, always,
  // from the same constants makes the Contact line (and everything
  // below it) land at the SAME position whether or not a photo is
  // present, matching the position that occurs when a photo IS present
  // — no hardcoded/magic number, purely existing named constants.
  // ------------------------------------------------------------------
  nameBaselineY = y;
  titleBaselineY = jobTitle ? nameBaselineY + NAME_SIZE + NAME_TO_TITLE_GAP : null;

  // Real ink-space vertical span of the name/job-title block — used
  // both to center a photo against it (when present) and to size the
  // reserved photo-footprint gap below (always, present or not).
  const blockTopY = nameBaselineY - NAME_SIZE * HELVETICA_ASCENT_RATIO;
  const blockBottomY = titleBaselineY !== null
    ? titleBaselineY + TITLE_SIZE * HELVETICA_DESCENT_RATIO
    : nameBaselineY + NAME_SIZE * HELVETICA_DESCENT_RATIO;
  const blockHeight = blockBottomY - blockTopY;

  if (hasPhoto) {
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
    photoX = PAGE_WIDTH - RIGHT_MARGIN - HEADER_PHOTO_RENDER_SIZE_PT + HEADER_PHOTO_HORIZONTAL_SHIFT_PT;
    // HEADER_PHOTO_VERTICAL_SHIFT_PT (3mm) applied ONLY to the photo's
    // own drawn Y position — photoFootprintTopY below (which sizes the
    // Contact-line reservation) deliberately keeps using the unshifted
    // blockTopY/blockHeight centering, so Name/Job Title/Contact do not
    // move because of this shift.
    photoTopY = blockTopY + (blockHeight - HEADER_PHOTO_RENDER_SIZE_PT) / 2 + HEADER_PHOTO_VERTICAL_SHIFT_PT;
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
  }

  // --- Advance Y past whichever is taller: the text block or the
  // photo's footprint — so a photo larger than a title-less name row
  // never has its bottom edge overlapped by the contact line below.
  // FIX: this reservation is now computed and applied UNCONDITIONALLY
  // (both hasPhoto and no-photo), from blockHeight/HEADER_PHOTO_SIZE_PT/
  // HEADER_PHOTO_RENDER_SIZE_PT alone — see the comment above
  // blockTopY/blockBottomY/blockHeight for why. Still deliberately
  // reads HEADER_PHOTO_SIZE_PT (the ORIGINAL size, not the +7px render
  // size) for photoBottomY — the same "keep the contact line's start Y
  // independent of the photo's cosmetic +7px enlargement" rule as
  // before. ---
  y = jobTitle && titleBaselineY !== null
    ? titleBaselineY + TITLE_SIZE + TITLE_TO_CONTACT_GAP
    : nameBaselineY + NAME_SIZE + NAME_TO_TITLE_GAP;
  const photoFootprintTopY = blockTopY + (blockHeight - HEADER_PHOTO_RENDER_SIZE_PT) / 2;
  const photoFootprintBottomY = photoFootprintTopY + HEADER_PHOTO_SIZE_PT;
  const photoOverhang = Math.max(0, photoFootprintBottomY - blockBottomY);
  y += photoOverhang;
  // This extra breathing-room gap only applies when the photo footprint
  // actually extends past the name/title block (photoOverhang > 0) —
  // gating on that (rather than adding it unconditionally) keeps the
  // gap identical to the plain NAME_TO_TITLE_GAP/TITLE_TO_CONTACT_GAP
  // case whenever the reserved footprint happens to be shorter than the
  // text block, while still protecting against overlap when it is
  // taller — and, per the fix above, this now applies the SAME way
  // whether or not a photo is actually present.
  if (photoOverhang > 0) {
    y += PHOTO_TO_CONTACT_GAP_PT;
  }

  // NOTE: the no-photo branch that used to live here (re-deriving
  // nameBaselineY/titleBaselineY/y independently) has been removed —
  // nameBaselineY, titleBaselineY, and the cursor `y` above are already
  // computed identically for both hasPhoto and no-photo (see the
  // unconditional block above), so no separate no-photo recomputation
  // is needed or correct any more; keeping one here would have
  // double-advanced `y` past the value already set above.

  // --- Contact line (email | phone | location | linkedin | github |
  // website) — text/icon/line-wrap layout (buildContactLines(),
  // CONTACT_ITEM_ICON_FOOTPRINT_PT, BODY_LINE_HEIGHT spacing) is
  // unchanged and identical in both hasPhoto branches. Only the WRAP
  // WIDTH itself now follows classicPdf.ts's rule (see
  // CONTACT_PHOTO_SAFETY_GAP_PT's own definition above for the full
  // port): with a photo present, Contact must stop wrapping before the
  // photo's left edge (photoX) minus that safety gap, instead of
  // running under/behind it at the full CONTENT_WIDTH; without a
  // photo, it still gets the full CONTENT_WIDTH exactly as before.
  const contactMaxWidth = hasPhoto
    ? (photoX - CONTACT_PHOTO_SAFETY_GAP_PT) - LEFT_MARGIN
    : CONTENT_WIDTH;
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
    wrappedContactLines = buildContactLines(doc, contactParts, contactMaxWidth);

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
  // dynamically-computed boundary on every side. FIX: headerBandTopY
  // stays anchored at the literal page edge (0) — HEADER_TOP_SIZE_
  // REDUCTION_PT is now applied further up, at the content cursor (see
  // its own comment at the top of this function), which is what
  // actually shrinks headerBandBottomY (== headerDividerCenterY,
  // derived from that same cursor) instead of just leaving a white gap
  // above an unshrunk band. ---
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
  const nameDrawY = nameBaselineY + NAME_TITLE_VERTICAL_SHIFT_PT + NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_PT + NAME_EXTRA_VERTICAL_SHIFT_PT;
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

    const titleDrawY = titleBaselineY + NAME_TITLE_VERTICAL_SHIFT_PT + NAME_TITLE_ADDITIONAL_VERTICAL_SHIFT_PT + TITLE_EXTRA_VERTICAL_SHIFT_PT;
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
      let itemX = LEFT_MARGIN + CONTACT_X_OFFSET_PT - HEADER_TEXT_HORIZONTAL_SHIFT_PT;
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

// ====================================================================
// TEXT SANITIZATION — non-WinAnsi "smart" typography fix
// ------------------------------------------------------------------
// ROOT CAUSE of a real bug: jsPDF's standard 14 fonts (helvetica,
// times, etc.) can only encode WinAnsiEncoding's character set. AI-
// generated content (e.g. project/experience descriptions produced by
// an LLM) very commonly contains "smart" typographic punctuation —
// a non-breaking hyphen (U+2011), en/em dashes, curly quotes, an
// ellipsis character, a non-breaking space — that WinAnsiEncoding does
// not cover. When jsPDF hits one of these characters it cannot encode,
// it has to break the text run apart around it, which throws off the
// per-character positioning of everything AFTER that character on the
// line — the visible symptom is exactly what was reported: text that
// looks letter-spaced/stretched and can run past the right margin,
// but ONLY on lines that happen to contain one of these characters
// (confirmed: "Material‑UI" / "AI‑generated" both use U+2011, not a
// plain ASCII hyphen U+002D — every other, unaffected bullet had none
// of these characters at all).
//
// Fix: map each such character to its closest plain-ASCII equivalent
// (all safely inside WinAnsiEncoding) BEFORE any measurement
// (splitTextToSize/getTextWidth) or drawing (doc.text) happens, so the
// measured width and the rendered width always agree. Applied to every
// piece of user-supplied text this file renders — not just Projects —
// since AI-generated prose can introduce these characters in any
// section (Summary, Experience, Achievements, etc.).
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

// Builds the list of non-empty contact details, in display order, each
// tagged with its ContactItemType so drawContactIcon() (see above)
// knows which glyph to draw before it. Same fields/order as before —
// only the return shape changed (from plain strings to {type, text}).
export interface ContactItem {
  type: ContactItemType;
  text: string;
}

// Plain-text labels shown before each contact value (no icons/emojis).
// The label is part of item.text, so buildContactLines() measures and
// wraps it together with the value and the draw loop prints it as-is.
const CONTACT_LABELS: Record<ContactItemType, string> = {
  email: 'Email: ',
  phone: 'Phone: ',
  location: 'Location: ',
  address: 'Address: ',
  linkedin: 'LinkedIn: ',
  github: 'GitHub: ',
  website: 'Portfolio URL: ',
};

function buildContactParts(
  personalInfo: ExecutivePdfPersonalInfo,
  phoneNumber: string,
  selectedCountryCode: string
): ContactItem[] {
  const parts: ContactItem[] = [];

  if (personalInfo?.email) {
    parts.push({ type: 'email', text: `${CONTACT_LABELS.email}${personalInfo.email.trim()}` });
  }

  if (phoneNumber) {
    const dialPrefix = selectedCountryCode ? `${selectedCountryCode} ` : '';
    parts.push({ type: 'phone', text: `${CONTACT_LABELS.phone}${dialPrefix}${phoneNumber}`.trim() });
  }

  const location = personalInfo?.location || personalInfo?.city;
  if (location) {
    parts.push({ type: 'location', text: `${CONTACT_LABELS.location}${location.trim()}` });
  }

  if (personalInfo?.address) {
    parts.push({ type: 'address', text: `${CONTACT_LABELS.address}${personalInfo.address.trim()}` });
  }

  if (personalInfo?.linkedin) {
    parts.push({ type: 'linkedin', text: `${CONTACT_LABELS.linkedin}${personalInfo.linkedin.trim()}` });
  }

  if (personalInfo?.github) {
    parts.push({ type: 'github', text: `${CONTACT_LABELS.github}${personalInfo.github.trim()}` });
  }

  const webLink = personalInfo?.website || personalInfo?.portfolio;
  if (webLink) {
    parts.push({ type: 'website', text: `${CONTACT_LABELS.website}${webLink.trim()}` });
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
  const summaryText = sanitizeText((data.professionalSummary || '').trim());

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
    y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));
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
// ascent ratio the rest of this file uses, not a new number. AUTO-FIT:
// derived from BODY_SIZE, so it's `let` and gets recomputed alongside it.
let TIMELINE_CONTINUATION_TOP_OFFSET_PT = BODY_SIZE * HELVETICA_ASCENT_RATIO;

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

  // Make sure there's room for the heading plus the FIRST entry's own
  // full "keep together" estimate before starting the section on the
  // current page — otherwise the heading would be orphaned alone at the
  // bottom of a page while the first entry (or even just its first
  // line) gets pushed to the next one.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE)
    + calculateExperienceEntryHeight(doc, experiences[0], EXPERIENCE_CONTENT_WIDTH);
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
    sanitizeText((exp.title || '').trim()) ||
    sanitizeText((exp.company || '').trim()) ||
    sanitizeText((exp.startDate || '').trim()) ||
    sanitizeText((exp.endDate || '').trim()) ||
    sanitizeText((exp.description || '').trim())
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
  const title = sanitizeText((exp.title || '').trim());
  const company = sanitizeText((exp.company || '').trim());
  const startDate = sanitizeText((exp.startDate || '').trim());
  const endDate = sanitizeText((exp.endDate || '').trim());
  const description = sanitizeText((exp.description || '').trim());
  const dateRange = [startDate, endDate].filter(Boolean).join(' – ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  // ALWAYS-BULLETED (matches Modern's method): every manually-typed line
  // is one bullet item, wrapped to contentWidth minus the bullet indent
  // (see BULLET_DOT_TO_TEXT_GAP_PT), so this estimate's line count never
  // drifts from what addExperienceEntry() actually draws.
  const descriptionLines: string[] = description
    ? description
        .split('\n')
        .flatMap((rawLine) => {
          const trimmedLine = rawLine.trim().replace(BULLET_MARKER_REGEX, '').trim();
          return trimmedLine ? doc.splitTextToSize(trimmedLine, contentWidth - BULLET_DOT_TO_TEXT_GAP_PT) : [];
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

  const totalHeight = headerHeight + descriptionGap + descriptionHeight;

  // --- Ink-bottom "keep this entry together" estimate (see
  // keepTogetherHeight()/inkBottomHeight() near checkPageBreak()):
  // reserve down to the real ink-bottom of the entry's last rendered
  // line, not a full extra line-advance past it, and cap the
  // reservation at what could actually fit on a fresh page so an entry
  // too tall for any single page still flows across pages via its own
  // per-line checkPageBreak() calls (see addExperienceEntry()) instead
  // of forcing a page break that still wouldn't fit it whole.
  const hasDescription = descriptionLines.length > 0;
  const lastLineFontSize = hasDescription
    ? BODY_SIZE
    : (company ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE);
  const lastLineAdvance = hasDescription ? BODY_LINE_HEIGHT : lastLineFontSize;

  return keepTogetherHeight(
    inkBottomHeight(totalHeight, lastLineAdvance, lastLineFontSize),
    hasDescription
      ? inkBottomHeight(headerHeight + descriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
      : inkBottomHeight(headerHeight, lastLineAdvance, lastLineFontSize)
  );
}

// Renders a single experience entry and returns the new Y position.
function addExperienceEntry(
  doc: jsPDF,
  exp: ExecutivePdfExperience,
  startY: number,
  timelineState: ExperienceTimelineState
): number {
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

  // ALWAYS-BULLETED (matches Modern's method): the description textarea
  // allows the user to type their own line breaks (e.g. one line per
  // responsibility). Those manual breaks are preserved — split on them
  // first — and EVERY resulting line is one bullet item that always gets
  // a "•" dot, matching the CV builder's own form/preview where each
  // typed line is already shown as one point. If a line happens to
  // already start with a marker character the user typed themselves
  // (BULLET_MARKER_REGEX), that marker is stripped first so it isn't
  // shown twice alongside the dot this file draws. `descriptionItems`
  // keeps one array entry per logical item (its own wrapped lines, to
  // the timeline-narrowed width minus the bullet indent), so the render
  // below draws exactly one dot per item — a sentence wrapping onto
  // several lines still shows exactly one bullet. `descriptionLines` is
  // the flat list of every wrapped line, kept for the height/gap
  // decisions below exactly as before.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);
  const descriptionItems: string[][] = description
    ? description
        .split('\n')
        .map((rawLine) => rawLine.trim().replace(BULLET_MARKER_REGEX, '').trim())
        .filter((text) => text.length > 0)
        .map((text) => doc.splitTextToSize(text, EXPERIENCE_CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT))
    : [];
  const descriptionLines: string[] = descriptionItems.flat();

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
  // calculateExperienceEntryHeight() now returns the ink-bottom "keep
  // together" estimate directly (see keepTogetherHeight()/
  // inkBottomHeight() near checkPageBreak()): the whole entry's real
  // ink-bottom height when that fits on a fresh page, or just the
  // header-plus-first-description-line ink-bottom height (capped at a
  // page's usable height) when the entry is too tall to ever fit on a
  // single page whole — in which case it starts here and the remaining
  // description lines flow across pages via their own per-line
  // checkPageBreak() calls further down, so nothing is ever lost or
  // clipped.
  const minimumEntrySpaceNeeded = calculateExperienceEntryHeight(doc, exp, EXPERIENCE_CONTENT_WIDTH);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

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

  // --- Description (always rendered as bullets — see descriptionItems
  // construction above) ---
  if (descriptionItems.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);

    const bulletX = EXPERIENCE_CONTENT_START_X;
    const textX = EXPERIENCE_CONTENT_START_X + BULLET_DOT_TO_TEXT_GAP_PT;

    for (const itemLines of descriptionItems) {
      itemLines.forEach((line, lineIndex) => {
        // Per-line overflow guard (OLD Executive's "no clipped/lost text"
        // rule): kept as the safety net for the rare oversized entry that
        // skipped the atomic whole-entry check above. For a normal-sized
        // entry this never actually triggers, since the atomic check
        // already guaranteed the whole entry fits from here on.
        y = checkPageBreakWithTimeline(doc, y, lineInkHeight(BODY_SIZE), timelineState);
        if (lineIndex === 0) {
          // First wrapped line of this item — draw its bullet dot.
          doc.setTextColor(...COLOR_SECTION_HEADING);
          doc.text('•', bulletX, y);
        }
        // Continuation lines of the same item render no dot, but still
        // start at the bullet-text indentation, exactly like the first line.
        doc.setTextColor(...COLOR_BODY);
        doc.text(line, textX, y);
        y += BODY_LINE_HEIGHT;
        trackTimelineContentEnd(timelineState, y);
      });
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
// EDUCATION, CERTIFICATIONS and LANGUAGES — three separate sections
// ------------------------------------------------------------------
// Each one is a normal, full-width section, exactly like Achievements
// and Projects (and exactly like the live ExecutiveTemplate preview,
// which no longer has a 3-column row): section heading + divider via
// renderSectionHeading(), then its entries stacked at LEFT_MARGIN /
// CONTENT_WIDTH. Fixed order: Education -> Certifications -> Languages
// (between Experience and Skills); a section with no usable entries is
// skipped entirely and startY is returned unchanged.
//
// SPACING: every section starts with `y += SECTION_GAP`, and every
// render*Column() helper below ends on a BODY_LINE_HEIGHT-normalized
// trailing advance (topUpToLineHeight()), so the gap between any two
// sections is the same SECTION_GAP — no per-section special case.
//
// PAGE BREAKS (same behaviour as the preview's pagination): the heading
// is only drawn together with its FIRST entry (headingSpaceWithFirstEntry()),
// and every entry is kept whole — each render*Column() call
// checkPageBreak()s per entry, so an entry that does not fit the room
// left on the page moves whole to the next page.
// Returns the new Y position for whatever gets rendered next.
// ====================================================================

// Room the heading + divider + the section's first entry need together.
// Sized from the real first entry (measured via the same render*Column()
// helper that later draws it, in its non-drawing "measuring" mode) down
// to real ink-bottom, using the largest entry font size so it can never
// be smaller than the entry's own checkPageBreak() reservation — the
// heading therefore can't be left alone at the bottom of a page.
function headingSpaceWithFirstEntry(firstEntryRawHeight: number): number {
  const inkHeight = inkBottomHeight(firstEntryRawHeight, BODY_LINE_HEIGHT, EXPERIENCE_TITLE_SIZE);
  return sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + keepTogetherHeight(inkHeight, inkHeight);
}

function addEducation(doc: jsPDF, data: ExecutivePdfData, startY: number): number {
  const educations = (data.educations || []).filter(hasUsableEducationContent);
  if (educations.length === 0) {
    return startY;
  }

  let y = startY + SECTION_GAP;
  const firstEntryHeight = measureEducationColumnHeight(doc, [educations[0]], CONTENT_WIDTH);
  y = checkPageBreak(doc, y, headingSpaceWithFirstEntry(firstEntryHeight));
  y = renderSectionHeading(doc, 'EDUCATION', y, EXPERIENCE_TITLE_SIZE, 'education');

  return renderEducationColumn(doc, educations, LEFT_MARGIN, CONTENT_WIDTH, y).rawEndY;
}

function addCertifications(doc: jsPDF, data: ExecutivePdfData, startY: number): number {
  const certifications = (data.certifications || []).filter(hasUsableCertificationContent);
  if (certifications.length === 0) {
    return startY;
  }

  let y = startY + SECTION_GAP;
  const firstEntryHeight = measureCertificationColumnHeight(doc, [certifications[0]], CONTENT_WIDTH);
  y = checkPageBreak(doc, y, headingSpaceWithFirstEntry(firstEntryHeight));
  y = renderSectionHeading(doc, 'CERTIFICATIONS', y, EXPERIENCE_TITLE_SIZE, 'certifications');

  return renderCertificationColumn(doc, certifications, LEFT_MARGIN, CONTENT_WIDTH, y).rawEndY;
}

function addLanguages(doc: jsPDF, data: ExecutivePdfData, startY: number): number {
  const languages = (data.languages || []).filter(hasUsableLanguageContent);
  if (languages.length === 0) {
    return startY;
  }

  let y = startY + SECTION_GAP;
  const firstEntryHeight = measureLanguageColumnHeight(doc, [languages[0]], CONTENT_WIDTH);
  y = checkPageBreak(doc, y, headingSpaceWithFirstEntry(firstEntryHeight));
  y = renderSectionHeading(doc, 'LANGUAGES', y, EXPERIENCE_TITLE_SIZE, 'languages');

  return renderLanguageColumn(doc, languages, LEFT_MARGIN, CONTENT_WIDTH, y).rawEndY;
}

// An entry counts as "usable" if it has ANY content worth printing —
// same rule as hasUsableExperienceContent().
function hasUsableEducationContent(edu: ExecutivePdfEducation | null | undefined): boolean {
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

// Measures Education/Certifications/Languages' REAL content height (used
// to reserve room for a section's heading + first entry), WITHOUT drawing
// any ink or ever adding a page —
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

// Renders the Education section's entries, one block per entry, each
// field on its own line: Degree (bold, COLOR_HEADING), Institution,
// Date (year) and Grade (all COLOR_BODY) — this file's own existing
// entry typography/gap constants, wrapped to the width it is given
// (CONTENT_WIDTH for the full-width section). Same field-sequence/
// gap-conditional pattern renderCertificationColumn() uses. Returns the
// section's normal ("raw") end Y — the next section's SECTION_GAP is
// measured from it — and its real, visible content-bottom Y (excluding
// the per-entry trailing normalization).
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

    const degree = sanitizeText((edu.degree || '').trim());
    const institution = sanitizeText((edu.institution || '').trim());
    const year = sanitizeText((edu.year || '').trim());
    const grade = sanitizeText((edu.grade || '').trim());
    // Date (year) and Grade render as two SEPARATE lines — Date
    // first, Grade below it. See the Date->Grade gap note below for why
    // that specific transition uses a different step than every other
    // gap in this column.

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    const degreeLines: string[] = degree ? doc.splitTextToSize(degree, colWidth) : [];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    const institutionLines: string[] = institution ? doc.splitTextToSize(institution, colWidth) : [];
    const gradeLines: string[] = grade ? doc.splitTextToSize(`Grade: ${grade}`, colWidth) : [];
    const dateLines: string[] = year ? doc.splitTextToSize(year, colWidth) : [];

    const degreeHeight = degreeLines.length * EXPERIENCE_TITLE_SIZE;
    const institutionHeight = institutionLines.length * EXPERIENCE_SUBTITLE_SIZE;
    const gradeHeight = gradeLines.length * EXPERIENCE_SUBTITLE_SIZE;
    const dateHeight = dateLines.length * EXPERIENCE_SUBTITLE_SIZE;

    const degreeToInstitutionGap = degreeLines.length > 0 && institutionLines.length > 0
      ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
      : 0;
    // Gap LEADING INTO the first of Date/Grade (Date now renders first,
    // Grade below it; when there is no Date, Grade takes that slot).
    const hasHeaderBeforeDateOrGrade = degreeLines.length > 0 || institutionLines.length > 0;
    // After the institution line the step is the normal content line step
    // (BODY_LINE_HEIGHT baseline-to-baseline); directly after the degree
    // (no institution) the existing subtitle->description gap is kept.
    const afterHeaderGap = institutionLines.length > 0
      ? BODY_LINE_HEIGHT - EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    const headerToDateGap = hasHeaderBeforeDateOrGrade && dateLines.length > 0
      ? afterHeaderGap
      : 0;
    const headerToGradeGapWhenNoDate = hasHeaderBeforeDateOrGrade && dateLines.length === 0 && gradeLines.length > 0
      ? afterHeaderGap
      : 0;
    // Date -> Grade gap: BODY_LINE_HEIGHT baseline-to-baseline step
    // (Date's own line advances y by EXPERIENCE_SUBTITLE_SIZE; topping up
    // to BODY_LINE_HEIGHT, same math as topUpToLineHeight()).
    const dateToGradeTopUp = dateLines.length > 0 && gradeLines.length > 0
      ? BODY_LINE_HEIGHT - EXPERIENCE_SUBTITLE_SIZE
      : 0;

    const fullEntryHeight = degreeHeight + degreeToInstitutionGap + institutionHeight +
      headerToDateGap + dateHeight + dateToGradeTopUp + headerToGradeGapWhenNoDate + gradeHeight;
    // No unbounded/multi-line body-text field in this entry (just
    // degree/institution/grade/date metadata lines), so the ink-bottom
    // "keep together" estimate is simply this whole block measured down
    // to whichever field renders last's real ink-bottom, capped at a
    // page's usable height (see keepTogetherHeight()/inkBottomHeight()
    // near checkPageBreak()).
    const lastLineFontSizeForEstimate = (dateLines.length > 0 || gradeLines.length > 0 || institutionLines.length > 0)
      ? EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_TITLE_SIZE;
    const inkHeight = inkBottomHeight(fullEntryHeight, lastLineFontSizeForEstimate, lastLineFontSizeForEstimate);
    const minimumEntrySpaceNeeded = keepTogetherHeight(inkHeight, inkHeight);
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
        y += BODY_LINE_HEIGHT - EXPERIENCE_SUBTITLE_SIZE;
      }
    }

    // --- Date (renders before Grade) ---
    if (dateLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
      doc.setTextColor(...COLOR_BODY); // Date matches the Professional Summary body-content color — see the "DATE/CREDENTIAL FIELDS THAT MATCH PROFESSIONAL SUMMARY BODY TEXT" block above
      if (!measuring) {
        doc.text(dateLines, colX, y);
      }
      y += dateHeight;
      contentEndY = y;
      if (gradeLines.length > 0) {
        // Date -> Grade: BODY_LINE_HEIGHT baseline-to-baseline step (see note above).
        y += BODY_LINE_HEIGHT - EXPERIENCE_SUBTITLE_SIZE;
      }
    }

    // --- Grade (below Date when Date is present; otherwise in Date's slot) ---
    if (gradeLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
      doc.setTextColor(...COLOR_BODY); // Grade matches the Professional Summary body-content color — see the "DATE/CREDENTIAL FIELDS THAT MATCH PROFESSIONAL SUMMARY BODY TEXT" block above
      if (!measuring) {
        doc.text(gradeLines, colX, y);
      }
      y += gradeHeight;
      contentEndY = y;
    }

    const lastLineFontSize = EXPERIENCE_SUBTITLE_SIZE; // every field in this column shares one size
    y = topUpToLineHeight(y, degreeLines.length > 0 && institutionLines.length === 0 && gradeLines.length === 0 && dateLines.length === 0 ? EXPERIENCE_TITLE_SIZE : lastLineFontSize);
  });

  return { rawEndY: y, contentEndY };
}

// Renders the Certifications section's entries: Name
// (bold, COLOR_HEADING), Date (COLOR_BODY), Credential ID (COLOR_BODY —
// both match the Professional Summary's body-content color). Mirrors
// renderCertificationColumn()'s exact field-sequence/gap-conditional
// pattern, wrapped to the width it is given. See renderEducationColumn()
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

    const name = sanitizeText((cert.name || '').trim());
    const date = sanitizeText((cert.date || '').trim());
    const credentialId = sanitizeText((cert.credentialId || '').trim());

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

    const fullEntryHeight = nameHeight + nameToDateGap + dateHeight +
      dateToCredentialGap + credentialHeight + nameToCredentialGap;
    // No unbounded/multi-line body-text field in this entry — ink-bottom
    // "keep together" estimate down to whichever field renders last's
    // real ink-bottom (see keepTogetherHeight()/inkBottomHeight() near
    // checkPageBreak()).
    const lastLineFontSizeForEstimate = (credentialLines.length > 0 || dateLines.length > 0)
      ? EXPERIENCE_SUBTITLE_SIZE
      : EXPERIENCE_TITLE_SIZE;
    const inkHeight = inkBottomHeight(fullEntryHeight, lastLineFontSizeForEstimate, lastLineFontSizeForEstimate);
    const minimumEntrySpaceNeeded = keepTogetherHeight(inkHeight, inkHeight);
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
  return Boolean(sanitizeText((lang.language || '').trim()) || sanitizeText((lang.proficiency || '').trim()));
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

// Renders the Languages section's entries. VISUAL FORMAT
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
    const language = sanitizeText((lang.language || '').trim());
    const proficiencyRaw = sanitizeText((lang.proficiency || '').trim());
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

    const fullEntryHeight = languageHeight + nameToLevelGap + proficiencyHeight;
    // No unbounded/multi-line body-text field in this entry — ink-bottom
    // "keep together" estimate down to whichever field renders last's
    // real ink-bottom (see keepTogetherHeight()/inkBottomHeight() near
    // checkPageBreak()).
    const lastLineFontSizeForEstimate = proficiencyLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE;
    const inkHeight = inkBottomHeight(fullEntryHeight, lastLineFontSizeForEstimate, lastLineFontSizeForEstimate);
    const minimumEntrySpaceNeeded = keepTogetherHeight(inkHeight, inkHeight);
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
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + lineInkHeight(BODY_SIZE);
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

  // ROOT-CAUSE FIX — sized against the REAL first entry (via the same
  // calculateAchievementEntryHeight() addAchievementEntry() itself
  // checks against) rather than a generic one-line guess. A bare title
  // line under-reserves whenever the first achievement also has a
  // date and/or description: the heading+divider would then fit and
  // render here, but the entry's OWN (correctly-sized) checkPageBreak()
  // call immediately after could still decide the entry itself doesn't
  // fit and push it whole to the next page — orphaning the heading
  // exactly like the bug this fixes.
  const firstEntryMinimumHeight = calculateAchievementEntryHeight(doc, achievements[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
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
    sanitizeText((ach.title || '').trim()) ||
    sanitizeText((ach.date || '').trim()) ||
    sanitizeText((ach.description || '').trim())
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

// Computes the exact minimum vertical space one Achievement entry
// needs, without drawing anything. Used by addAchievements() to size
// its heading-guard against the REAL first entry (via the same
// computation addAchievementEntry() itself checks against) rather than
// a generic one-line guess — same rationale as
// calculateExperienceEntryHeight() above, and the fix for the
// orphaned-heading bug that affected every entry-based section still
// using a generic guess instead of this real measurement.
function calculateAchievementEntryHeight(doc: jsPDF, ach: any): number {
  const title = sanitizeText((ach.title || '').trim());
  const date = sanitizeText((ach.date || '').trim());
  const description = sanitizeText((ach.description || '').trim());

  const rawDescriptionLines: string[] = description
    ? description
        .split('\n')
        .map((rawLine) => rawLine.trim())
        .filter((trimmedLine) => trimmedLine.length > 0)
    : [];

  // ALWAYS-BULLETED (matches Modern's method): every typed line is one
  // bullet item — see the matching comment in calculateAchievementEntryHeight's
  // render counterpart (addAchievementEntry) below for the full rationale.
  const descriptionLines: string[] = rawDescriptionLines
    .map((rawLine) => rawLine.replace(BULLET_MARKER_REGEX, '').trim())
    .flatMap((text) => doc.splitTextToSize(text, CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT));

  const headerLayoutEstimate = computeAchievementHeaderLayout(doc, title, date);
  const titleRowHeightEstimate = headerLayoutEstimate.height;
  const hasHeaderContent = Boolean(title || date);
  const headerToDescriptionGap = hasHeaderContent && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const rawMinimumEntrySpaceNeeded = titleRowHeightEstimate +
    headerToDescriptionGap + firstDescriptionLineHeight;

  const hasDescriptionForEstimate = descriptionLines.length > 0;
  const lastLineFontSizeForEstimate = hasDescriptionForEstimate
    ? BODY_SIZE
    : (title ? EXPERIENCE_TITLE_SIZE : (date ? EXPERIENCE_SUBTITLE_SIZE : EXPERIENCE_TITLE_SIZE));
  const lastLineAdvanceForEstimate = hasDescriptionForEstimate ? BODY_LINE_HEIGHT : lastLineFontSizeForEstimate;
  const inkMinimumEntrySpaceNeeded = inkBottomHeight(
    rawMinimumEntrySpaceNeeded,
    lastLineAdvanceForEstimate,
    lastLineFontSizeForEstimate
  );
  return keepTogetherHeight(inkMinimumEntrySpaceNeeded, inkMinimumEntrySpaceNeeded);
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
      y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));
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
    y = checkPageBreak(doc, y, lineInkHeight(BODY_SIZE));
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

  const title = sanitizeText((ach.title || '').trim());
  const date = sanitizeText((ach.date || '').trim());
  const description = sanitizeText((ach.description || '').trim());

  // Date now renders RIGHT-ALIGNED on the SAME row as the achievement
  // title/name (previously its own line below the title) — via the
  // shared renderTitleRowWithDate() helper (see its own doc comment
  // above), also used by Experience and Education.

  // Description uses body text size and line height with 1.4 multiplier
  // (same as Summary and Experience description).
  //
  // ALWAYS-BULLETED (matches Modern's method): every manual line break
  // the user typed ('\n') is ONE ACHIEVEMENT ITEM and always gets a "•"
  // dot — this matches the CV builder's own form/preview, where each
  // typed line is already shown as one point. If a line happens to
  // already start with a marker character the user typed themselves
  // (BULLET_MARKER_REGEX), that marker is stripped first so it isn't
  // shown twice alongside the dot this file draws. `descriptionItems`
  // keeps one array entry per logical item (that item's own wrapped
  // lines, to CONTENT_WIDTH minus the bullet indent — see the FIX note
  // this replaced, still true here: wrapping to the indented width keeps
  // the drawn line from crossing the right margin), so
  // renderBulletedDescriptionLines() can draw exactly one dot per item —
  // a sentence that wraps onto 2, 10, or 20 lines still shows exactly
  // one bullet.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  const rawDescriptionLines: string[] = description
    ? description
        .split('\n')
        .map((rawLine) => rawLine.trim())
        .filter((trimmedLine) => trimmedLine.length > 0)
    : [];

  const descriptionItems: string[][] = rawDescriptionLines
    .map((rawLine) => rawLine.replace(BULLET_MARKER_REGEX, '').trim())
    .map((text) => doc.splitTextToSize(text, CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT));
  const descriptionLines: string[] = descriptionItems.flat();

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting a title from its
  // date/description. Computed via the shared
  // calculateAchievementEntryHeight() (see its own comment above)
  // rather than inline here, so this entry's own page-break check and
  // addAchievements()'s heading-guard can never drift out of parity. ---
  const minimumEntrySpaceNeeded = calculateAchievementEntryHeight(doc, ach);
  y = checkPageBreak(doc, y, minimumEntrySpaceNeeded);

  // Still needed below to decide whether the header->description gap
  // applies (this entry's render logic, not the height estimate above).
  const hasHeaderContent = Boolean(title || date);

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

  // ROOT-CAUSE FIX — sized against the REAL first entry (via the same
  // calculateProjectEntryHeight() addProjectEntry() itself checks
  // against) rather than a generic one-line guess. A bare name line
  // under-reserves whenever the first project also has tech/description/
  // github: the heading+divider would then fit and render here, but the
  // entry's OWN (correctly-sized) checkPageBreak() call immediately
  // after could still decide the entry itself doesn't fit and push it
  // whole to the next page — orphaning the heading exactly like the
  // bug this fixes (see the same fix on addAchievements() above).
  const firstEntryMinimumHeight = calculateProjectEntryHeight(doc, projects[0]);
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + firstEntryMinimumHeight;
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
    sanitizeText((project.name || '').trim()) ||
    sanitizeText((project.tech || '').trim()) ||
    sanitizeText((project.description || '').trim()) ||
    sanitizeText((project.github || '').trim())
  );
}

// Renders a single project entry and returns the new Y position,
// normalized (like every Education/Language/Achievement/Certification
// entry) so every entry — not only the section's last one — ends on an
// equivalent trailing space.
// Computes the exact minimum vertical space one Project entry needs,
// without drawing anything. Used by addProjects() to size its
// heading-guard against the REAL first entry AND by addProjectEntry()
// itself for its own checkPageBreak() call — same single-source-of-
// truth rationale as calculateAchievementEntryHeight()/
// calculateExperienceEntryHeight() above.
function calculateProjectEntryHeight(doc: jsPDF, project: any): number {
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

  const rawDescriptionLines: string[] = description
    ? description
        .split('\n')
        .map((rawLine) => rawLine.trim())
        .filter((trimmedLine) => trimmedLine.length > 0)
    : [];

  // ALWAYS-BULLETED (matches Modern's method): every typed line is one
  // bullet item — see the matching comment in addProjectEntry() below
  // for the full rationale.
  const descriptionLines: string[] = rawDescriptionLines
    .map((rawLine) => rawLine.replace(BULLET_MARKER_REGEX, '').trim())
    .flatMap((text) => doc.splitTextToSize(text, CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT));

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
  const techToGithubGap = techLines.length > 0 && githubLines.length > 0 && descriptionLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const nameToGithubGap = nameLines.length > 0 && githubLines.length > 0 && techLines.length === 0 && descriptionLines.length === 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;

  const fullEntryHeight = nameHeight + nameToTechGap + techHeight +
    headerToDescriptionGap + descriptionHeight +
    descriptionToGithubGap + githubHeight + techToGithubGap + nameToGithubGap;

  const headerHeight = nameHeight + nameToTechGap + techHeight;
  const hasDescription = descriptionLines.length > 0;
  let lastLineFontSizeForEstimate: number;
  let lastLineAdvanceForEstimate: number;
  if (githubLines.length > 0) {
    lastLineFontSizeForEstimate = EXPERIENCE_SUBTITLE_SIZE;
    lastLineAdvanceForEstimate = EXPERIENCE_SUBTITLE_SIZE;
  } else if (hasDescription) {
    lastLineFontSizeForEstimate = BODY_SIZE;
    lastLineAdvanceForEstimate = BODY_LINE_HEIGHT;
  } else if (techLines.length > 0) {
    lastLineFontSizeForEstimate = EXPERIENCE_SUBTITLE_SIZE;
    lastLineAdvanceForEstimate = EXPERIENCE_SUBTITLE_SIZE;
  } else {
    lastLineFontSizeForEstimate = EXPERIENCE_TITLE_SIZE;
    lastLineAdvanceForEstimate = EXPERIENCE_TITLE_SIZE;
  }
  const inkFullHeight = inkBottomHeight(fullEntryHeight, lastLineAdvanceForEstimate, lastLineFontSizeForEstimate);
  const inkLeadHeight = hasDescription
    ? inkBottomHeight(headerHeight + headerToDescriptionGap + BODY_LINE_HEIGHT, BODY_LINE_HEIGHT, BODY_SIZE)
    : inkBottomHeight(headerHeight, lastLineFontSizeForEstimate, lastLineFontSizeForEstimate);
  return keepTogetherHeight(inkFullHeight, inkLeadHeight);
}

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
  // (same as Summary and Experience description).
  //
  // ALWAYS-BULLETED (matches Modern's method, same convention as
  // Achievements/Experience above): every manual line break the user
  // typed ('\n') is ONE PROJECT ITEM and always gets a "•" dot. If a
  // line happens to already start with a marker character the user
  // typed themselves (BULLET_MARKER_REGEX), that marker is stripped
  // first so it isn't shown twice alongside the dot this file draws.
  // One bullet dot per logical item, continuation lines hanging-indented
  // at the bullet's text column (not flush at LEFT_MARGIN), and wrapped
  // to a width that actually fits inside the right margin at that
  // indentation.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_SIZE);

  const rawDescriptionLines: string[] = description
    ? description
        .split('\n')
        .map((rawLine) => rawLine.trim())
        .filter((trimmedLine) => trimmedLine.length > 0)
    : [];

  const descriptionItems: string[][] = rawDescriptionLines
    .map((rawLine) => rawLine.replace(BULLET_MARKER_REGEX, '').trim())
    .map((text) => doc.splitTextToSize(text, CONTENT_WIDTH - BULLET_DOT_TO_TEXT_GAP_PT));
  const descriptionLines: string[] = descriptionItems.flat();

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
  // calculateProjectEntryHeight() (see its own comment above) rather
  // than inline here, so this entry's own page-break check and
  // addProjects()'s heading-guard can never drift out of parity. ---
  const minimumEntrySpaceNeeded = calculateProjectEntryHeight(doc, project);
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
    y = renderBulletedDescriptionLines(doc, descriptionItems, y);

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
// INK-BOTTOM PAGE-BREAK MEASUREMENT
// ------------------------------------------------------------------
// Every checkPageBreak() reservation below used to reserve a full
// line-advance (e.g. BODY_LINE_HEIGHT, or a whole entry's summed field
// heights) for the LAST line/field of whatever it was measuring. But a
// line's "advance" bakes in leading meant for the line AFTER it —
// reserving that at the very bottom of a page silently wastes extra
// space on top of BOTTOM_MARGIN. These three helpers measure from a
// block's first baseline down to the actual INK BOTTOM (descender) of
// its last line instead, so a page break only actually happens when the
// content itself would overflow — not when its trailing leading would.
// Pure logic — no design values of this file's own live here.
// ====================================================================

// How far real ink extends below its own baseline for a given font
// size, using the same standard Adobe Core-14 Helvetica descender ratio
// already used elsewhere in this file (see HELVETICA_DESCENT_RATIO
// above).
function lineInkHeight(fontSize: number): number {
  return fontSize * HELVETICA_DESCENT_RATIO;
}

// Converts a block-height measurement (baseline of the first line to
// where the NEXT line after the block would start) into the true
// ink-bottom measurement (baseline of the first line to the ink-bottom
// of the block's own last line): subtract the last line's own advance,
// then add back only the real ink it leaves below its baseline.
function inkBottomHeight(blockHeight: number, lastLineAdvance: number, lastLineFontSize: number): number {
  return blockHeight - lastLineAdvance + lineInkHeight(lastLineFontSize);
}

// Caps a "keep this entry/block together" reservation at what could
// actually fit on a fresh page. If the full ink-bottom height already
// fits within a page's usable height, reserve exactly that (so the
// whole block moves to a new page together when it doesn't fit here).
// If the full block is taller than an entire page's usable height (a
// very long single entry), reserving its full height would make
// checkPageBreak() demand a fresh page that STILL wouldn't be enough —
// so instead reserve only `leadHeight` (e.g. just the header/first-line
// portion), capped at the page ceiling, letting the rest flow across
// pages via its own per-line checkPageBreak() calls.
function keepTogetherHeight(fullHeight: number, leadHeight: number): number {
  if (fullHeight <= PAGE_USABLE_HEIGHT) {
    return fullHeight;
  }
  return Math.min(leadHeight, PAGE_USABLE_HEIGHT);
}

// ====================================================================
// PAGE-BREAK HELPER
// Used by addSummary(), addExperience()/addExperienceEntry(),
// addEducation()/addCertifications()/addLanguages() (and their renderEducationColumn()/
// renderCertificationColumn()/renderLanguageColumn() entry helpers), addSkills(),
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