// utils/professionDetector/detection/officeAdmin.ts
// ============================================
// OFFICE & ADMIN PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectOfficeAdmin = (t: string): Profession | null => {
    // ===== OFFICE & ADMIN PROFESSIONS =====
    if (t.includes('office assistant') || t.includes('admin assistant')) return 'office-assistant';
    if (t.includes('data entry operator') || t.includes('data entry')) return 'data-entry-operator';
    if (t.includes('cashier') || t.includes('cash counter')) return 'cashier';
    if (t.includes('storekeeper') || t.includes('store keeper')) return 'storekeeper';
    if (t.includes('warehouse manager') || t.includes('warehouse')) return 'warehouse-manager';
    if (t.includes('warehouse supervisor')) return 'warehouse-supervisor';
    if (t.includes('logistics coordinator') || t.includes('logistics')) return 'logistics-coordinator';
    if (t.includes('freight forwarder') || t.includes('freight')) return 'freight-forwarder';
    
    return null;
};