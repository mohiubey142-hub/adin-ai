// utils/profession/summaries/templates/hospitality/index.ts
// ============================================
// HOSPITALITY TEMPLATES - Main Export
// Combines all profession templates into one object
// ============================================

import { RENEWABLE_TEMPLATES } from './renewable';
import { SOLAR_TEMPLATES } from './solar';
import { WIND_TEMPLATES } from './wind';
import { ELECTRICIAN_TEMPLATES } from './electrician';
import { PLUMBER_TEMPLATES } from './plumber';

// ===== NEW IMPORT - Chef =====
import { CHEF_TEMPLATES } from './chef';

// Recreate the exact same structure as the original HOSPITALITY_TEMPLATES
export const HOSPITALITY_TEMPLATES = {
    // ===== EXISTING =====
    renewable: RENEWABLE_TEMPLATES,
    solar: SOLAR_TEMPLATES,      // ✅ FIXED: solar ko SOLAR_TEMPLATES se map karo
    wind: WIND_TEMPLATES,
    electrician: ELECTRICIAN_TEMPLATES,
    plumber: PLUMBER_TEMPLATES,
    
    // ===== NEW PROFESSION =====
    chef: CHEF_TEMPLATES
};

// Default export to maintain compatibility with existing imports
export default HOSPITALITY_TEMPLATES;