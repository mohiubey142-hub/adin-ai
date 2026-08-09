// utils/profession/summaries/fresher/design/index.ts
// ============================================
// DESIGN FRESHER TEMPLATES - Combined Exports
// ============================================

import { DESIGNER_FRESHER } from './designer.fresher';
import { GRAPHIC_DESIGNER_FRESHER } from './graphicDesigner.fresher';
import { UIUX_FRESHER } from './uiux.fresher';
import { CONTENT_CREATOR_FRESHER } from './contentCreator.fresher';

export const DESIGN_FRESHER_TEMPLATES: Record<string, string[]> = {
    designer: DESIGNER_FRESHER,
    graphicDesigner: GRAPHIC_DESIGNER_FRESHER,
    uiux: UIUX_FRESHER,
    contentCreator: CONTENT_CREATOR_FRESHER
};