// utils/profession/summaries/fresher/hospitality/index.ts
// ============================================
// HOSPITALITY FRESHER TEMPLATES - Combined Exports
// ============================================

import { RENEWABLE_FRESHER } from './renewable.fresher';
import { SOLAR_FRESHER } from './solar.fresher';
import { WIND_FRESHER } from './wind.fresher';
import { ELECTRICIAN_FRESHER } from './electrician.fresher';
import { PLUMBER_FRESHER } from './plumber.fresher';

// ===== NEW IMPORT =====
import { CHEF_FRESHER } from './chef.fresher';

export const HOSPITALITY_FRESHER_TEMPLATES: Record<string, string[]> = {
    renewable: RENEWABLE_FRESHER,
    solar: SOLAR_FRESHER,
    wind: WIND_FRESHER,
    electrician: ELECTRICIAN_FRESHER,
    plumber: PLUMBER_FRESHER,
    
    // ===== NEW PROFESSION =====
    chef: CHEF_FRESHER
};