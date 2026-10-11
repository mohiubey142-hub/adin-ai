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

// --- Header profile photo (circular) ---
// Single source of truth for the header photo's size: both its width
// and height, since the photo is always rendered as a perfect circle
// (a circle's diameter is one number, not a separate width/height
// pair). Anywhere the photo's size is needed — drawing the circular
// clip path or placing the image inside it — this is the only
// constant referenced; nothing is ever hardcoded inline.
const PHOTO_SIZE = 65 * 1.13; // pt — 65pt base diameter + the requested 13% size increase, still the single source of truth for the header photo's size (73.45pt)

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
const SECTION_GAP = 20;
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
// sides and for every section.
const DIVIDER_SIDE_GAP_PT = 1 * MM_TO_PT; // 1mm, ≈ 2.8346pt

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
const CONTENT_GAP_EXTRA_PT = 2 * MM_TO_PT; // 2mm, ≈ 5.6693pt

// The header profile photo's requested 5.5mm upward adjustment, expressed
// through the same centralized MM_TO_PT conversion used above — the
// single source of truth for this offset, applied where the photo's Y
// position is computed in addHeader().
const PHOTO_VERTICAL_OFFSET_PT = 5.5 * MM_TO_PT; // 5.5mm, ≈ 15.5906pt

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
const EXPERIENCE_TITLE_TO_SUBTITLE_GAP = 3; // job title -> company/dates line
const EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP = 6; // company/dates (or title) -> description
const EXPERIENCE_ENTRY_GAP = 14; // space between one experience entry and the next

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
const DATE_TEXT_GAP_PT = 14;

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
const BULLET_TEXT_EXTRA_GAP_PT = 0.4 * MM_TO_PT; // 0.4mm, ≈ 1.1339pt

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
const EXPERIENCE_CONTENT_EXTRA_GAP_PT = 2 * MM_TO_PT; // 2mm, ≈ 5.6693pt

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
  linkedin?: string;
  website?: string;
  portfolio?: string;
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
// ENTRY POINT
// ====================================================================
export function generateClassicPDF(data: ClassicPdfData): jsPDF {
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

  // --- Name ---
  const nameBaselineY = y;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(NAME_SIZE);
  doc.setTextColor(...COLOR_NAME);
  doc.text(name, LEFT_MARGIN, y);
  y += NAME_SIZE; // move past the line's own height
  y += NAME_TO_TITLE_GAP;

  // --- Job title (optional) ---
  let jobTitleBaselineY: number | null = null;
  if (jobTitle) {
    jobTitleBaselineY = y;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(TITLE_SIZE);
    doc.setTextColor(...COLOR_TITLE);
    doc.text(jobTitle, LEFT_MARGIN, y);
    y += TITLE_SIZE;
    y += TITLE_TO_CONTACT_GAP;
  }

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
  const photo = (personalInfo?.photo || '').trim();
  if (photo) {
    const headerBlockTopY = startY;
    const headerBlockBottomY = jobTitleBaselineY !== null ? jobTitleBaselineY : nameBaselineY;
    const headerBlockCenterY = (headerBlockTopY + headerBlockBottomY) / 2;

    const photoX = PAGE_WIDTH - RIGHT_MARGIN - PHOTO_SIZE;
    // Vertically centered on the Name + Job Title block (as before),
    // then shifted upward by PHOTO_VERTICAL_OFFSET_PT — the single
    // source of truth for that adjustment (see its declaration above).
    const photoY = headerBlockCenterY - PHOTO_SIZE / 2 - PHOTO_VERTICAL_OFFSET_PT;
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
  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(METADATA_SIZE);
    doc.setTextColor(...COLOR_METADATA);

    const contactLine = contactParts.join('   |   ');
    // Wrap in case a very long combination of contact details doesn't
    // fit on one line at this font size.
    const wrappedLines = doc.splitTextToSize(contactLine, CONTENT_WIDTH);
    doc.text(wrappedLines, LEFT_MARGIN, y);
    y += wrappedLines.length * METADATA_SIZE;
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
  doc.setDrawColor(...CLASSIC_SECTION_HEADING_COLOR);
  doc.setLineWidth(HEADER_RULE_THICKNESS);
  doc.line(LEFT_MARGIN, y, PAGE_WIDTH - RIGHT_MARGIN, y);

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

// Builds the list of non-empty contact details, in display order.
function buildContactParts(
  personalInfo: ClassicPdfPersonalInfo,
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
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + BODY_LINE_HEIGHT;
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
    y = checkPageBreakClassic(doc, y, BODY_LINE_HEIGHT);
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

  // Make sure there's room for the heading plus at least the first
  // entry's job-title line before starting the section on the current
  // page — otherwise the heading would be orphaned alone at the
  // bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
  y = checkPageBreakClassic(doc, y, headingSpaceNeeded);

  // --- Heading + divider (single source of truth, see renderSectionHeading()) ---
  y = renderSectionHeading(doc, 'EXPERIENCE', y, EXPERIENCE_TITLE_SIZE);

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

  // --- Determine how much space this entry's "header" (title +
  // company) plus at least the first description line needs, so the
  // whole block can be pushed to a new page together rather than
  // splitting a job title from its own company/first bullet line. If
  // there's no header at all, the entry still needs at least one line
  // for the date column itself. ---
  const titleToSubtitleGap = title && company ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP : 0;
  const headerHeight =
    (title ? EXPERIENCE_TITLE_SIZE : 0) +
    titleToSubtitleGap +
    (company ? EXPERIENCE_SUBTITLE_SIZE : 0);
  const hasHeaderLine = Boolean(title || company);
  const descriptionGap = hasHeaderLine && descriptionBulletLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = descriptionBulletLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const minimumEntrySpaceNeeded = hasHeaderLine
    ? headerHeight + descriptionGap + firstDescriptionLineHeight
    : (descriptionBulletLines.length > 0 ? firstDescriptionLineHeight : EXPERIENCE_SUBTITLE_SIZE);
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
      y = checkPageBreakClassic(doc, y, BODY_LINE_HEIGHT);
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

  // Room for the heading plus at least the first entry's degree line,
  // so the heading is never left alone at the bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
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
  const institutionHeight = institutionLines.length * EXPERIENCE_SUBTITLE_SIZE;

  // --- Determine how much space this entry's degree + institution
  // block needs, so the whole block moves to a new page together
  // rather than splitting a degree from its own institution line. If
  // there's neither, but a year still needs to render alone, reserve
  // one line for it. ---
  const titleToSubtitleGap = degreeLines.length > 0 && institutionLines.length > 0
    ? EXPERIENCE_TITLE_TO_SUBTITLE_GAP
    : 0;
  const headerHeight = degreeHeight + titleToSubtitleGap + institutionHeight;
  const hasHeaderContent = degreeLines.length > 0 || institutionLines.length > 0;
  const yearAloneHeight = !hasHeaderContent && year ? EXPERIENCE_SUBTITLE_SIZE : 0;
  const headerToGradeGap = (hasHeaderContent || yearAloneHeight > 0) && gradeLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstGradeLineHeight = gradeLines.length > 0 ? EXPERIENCE_SUBTITLE_SIZE : 0;
  const minimumEntrySpaceNeeded = headerHeight + yearAloneHeight + headerToGradeGap + firstGradeLineHeight;
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
    y += institutionHeight;
  }

  // --- Year alone (no degree, no institution) ---
  if (!hasHeaderContent && year) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...CLASSIC_ACCENT_COLOR);
    doc.text(year, LEFT_MARGIN, y);
    y += EXPERIENCE_SUBTITLE_SIZE;
  }

  if ((hasHeaderContent || yearAloneHeight > 0) && gradeLines.length > 0) {
    y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
  }

  // --- Grade (optional, rendered with a "Grade: " label, matching the reference) ---
  if (gradeLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(EXPERIENCE_SUBTITLE_SIZE);
    doc.setTextColor(...COLOR_METADATA);

    for (const line of gradeLines) {
      y = checkPageBreakClassic(doc, y, EXPERIENCE_SUBTITLE_SIZE);
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
  const minimumSpaceNeeded = sectionHeadingToContentOffset(BODY_SIZE) + BODY_LINE_HEIGHT;
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
    y = checkPageBreakClassic(doc, y, BODY_LINE_HEIGHT);
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

  // Room for the heading plus at least the first entry's language-name
  // line, so the heading is never left alone at the bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
  y = checkPageBreakClassic(doc, y, headingSpaceNeeded);

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

// Renders a single language entry and returns the new Y position,
// normalized (like every Education entry) so every entry — not only
// the section's last one — ends on an equivalent trailing space. See
// the ENTRY-GAP CONSISTENCY note above addLanguages().
function addLanguageEntry(doc: jsPDF, lang: ClassicPdfLanguage, startY: number): number {
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
  y = checkPageBreakClassic(doc, y, minimumEntrySpaceNeeded);

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

  // Room for the heading plus at least the first entry's title line,
  // so the heading is never left alone at the bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
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
function addAchievementEntry(
  doc: jsPDF,
  ach: any,
  startY: number
): number {
  let y = startY;

  const title = (ach.title || '').trim();
  const date = (ach.date || '').trim();
  const description = (ach.description || '').trim();

  const hasTitle = title.length > 0;
  const hasDate = date.length > 0;
  const dateText = hasDate ? `(${date})` : '';

  // --- Date: measured, not hardcoded, and right-aligned to the page's
  // own right margin on the title's first line — matching the
  // reference image's title ... (date) row, instead of the date
  // trailing the title text inline in the same string.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(EXPERIENCE_TITLE_SIZE);
  const dateWidth = hasDate ? doc.getTextWidth(dateText) : 0;
  const dateReserve = hasDate ? dateWidth + DATE_TEXT_GAP_PT : 0;
  const titleWrapWidth = hasTitle && hasDate
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

  // Multi-line metadata fields use their own font size as the per-line
  // height, with no extra leading — the same metadata-line convention
  // used by the header's contact line and every Education field.
  const titleHeight = titleLines.length * EXPERIENCE_TITLE_SIZE;

  // --- Determine how much space this whole entry needs, so it moves
  // to a new page together rather than splitting the title/date line
  // from the description. If there's no title but a date still needs
  // to render alone, reserve one line for it. ---
  const hasHeaderContent = titleLines.length > 0 || hasDate;
  const dateAloneHeight = titleLines.length === 0 && hasDate ? EXPERIENCE_TITLE_SIZE : 0;
  const headerToDescriptionGap = hasHeaderContent && descriptionLines.length > 0
    ? EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP
    : 0;
  const firstDescriptionLineHeight = descriptionLines.length > 0 ? BODY_LINE_HEIGHT : 0;
  const minimumEntrySpaceNeeded = titleHeight + dateAloneHeight + headerToDescriptionGap + firstDescriptionLineHeight;
  y = checkPageBreakClassic(doc, y, minimumEntrySpaceNeeded);

  // --- Title (left) + Date (right-aligned, same first line) ---
  if (titleLines.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(EXPERIENCE_TITLE_SIZE);
    doc.setTextColor(...COLOR_HEADING);
    doc.text(titleLines, LEFT_MARGIN, y);
    if (hasDate) {
      doc.setTextColor(...CLASSIC_ACCENT_COLOR);
      doc.text(dateText, PAGE_WIDTH - RIGHT_MARGIN - dateWidth, y);
    }
    y += titleHeight;
  } else if (hasDate) {
    // No title at all — the date renders alone, right-aligned.
    doc.setTextColor(...CLASSIC_ACCENT_COLOR);
    doc.text(dateText, PAGE_WIDTH - RIGHT_MARGIN - dateWidth, y);
    y += EXPERIENCE_TITLE_SIZE;
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
      y = checkPageBreakClassic(doc, y, BODY_LINE_HEIGHT);
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

  // Space between the previous section (Achievements) and this section.
  // This is the SAME SECTION_GAP used by all other section transitions.
  // No special Achievements→Certifications gap constant exists or is needed.
  y += SECTION_GAP;

  // Room for the heading plus at least the first entry's name line,
  // so the heading is never left alone at the bottom of a page.
  const headingSpaceNeeded = sectionHeadingToContentOffset(EXPERIENCE_TITLE_SIZE) + EXPERIENCE_TITLE_SIZE;
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
  y = checkPageBreakClassic(doc, y, minimumEntrySpaceNeeded);

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
    doc.setTextColor(...CLASSIC_ACCENT_COLOR);
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
function addProjects(doc: jsPDF, data: ClassicPdfData, startY: number): number {
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
  if (descriptionLines.length > 0) {
    // Only add the gap if there was header content before it
    if (hasHeaderContent) {
      y += EXPERIENCE_SUBTITLE_TO_DESCRIPTION_GAP;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_SIZE);

    for (const item of descriptionLines) {
      y = checkPageBreakClassic(doc, y, BODY_LINE_HEIGHT);
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
// ====================================================================
export function checkPageBreakClassic(doc: jsPDF, y: number, spaceNeeded: number): number {
  const willOverflow = y + spaceNeeded > PAGE_HEIGHT - BOTTOM_MARGIN;
  if (willOverflow) {
    doc.addPage();
    return TOP_MARGIN;
  }
  return y;
}