// utils/profession/summaries/templates/design/index.ts
// ============================================
// DESIGN TEMPLATES - Main Export
// Combines all profession templates into one object
// ============================================

import { DESIGNER_TEMPLATES } from './designer';
import { GRAPHIC_DESIGNER_TEMPLATES } from './graphicDesigner';
import { UIUX_TEMPLATES } from './uiux';
import { CONTENT_CREATOR_TEMPLATES } from './contentCreator';

// Recreate the exact same structure as the original DESIGN_TEMPLATES
export const DESIGN_TEMPLATES = {
    designer: DESIGNER_TEMPLATES,
    graphicDesigner: GRAPHIC_DESIGNER_TEMPLATES,
    uiux: UIUX_TEMPLATES,
    contentCreator: CONTENT_CREATOR_TEMPLATES
};

// Default export to maintain compatibility
export default DESIGN_TEMPLATES;