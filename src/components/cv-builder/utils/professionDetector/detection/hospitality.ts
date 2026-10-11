// utils/professionDetector/detection/hospitality.ts
// ============================================
// HOSPITALITY PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectHospitality = (t: string): Profession | null => {
    // ===== SPECIFIC HOSPITALITY (Pehle check) =====
    if (t.includes('chef') || t.includes('cook')) return 'chef';
    if (t.includes('hotel manager') || t.includes('hotel')) return 'hotel-manager';
    if (t.includes('event planner') || t.includes('event manager')) return 'event-planner';
    
    // ===== BATCH 2 - NEW HOSPITALITY PROFESSIONS =====
    if (t.includes('hotel receptionist') || t.includes('front desk')) return 'hotel-receptionist';
    if (t.includes('housekeeping supervisor') || t.includes('housekeeping')) return 'housekeeping-supervisor';
    if (t.includes('restaurant manager') || t.includes('restaurant')) return 'restaurant-manager';
    if (t.includes('tourism officer') || t.includes('tourism')) return 'tourism-officer';
    if (t.includes('travel consultant') || t.includes('travel agent')) return 'travel-consultant';
    if (t.includes('call center agent') || t.includes('call center') || t.includes('customer service representative')) return 'call-center-agent';
    
    return null;
};