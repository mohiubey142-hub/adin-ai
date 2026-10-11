// utils/professionDetector/detection/it.ts
// ============================================
// IT PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectIT = (t: string): Profession | null => {
    // ===== SPECIFIC IT PROFESSIONS (Pehle check) =====
    if (t.includes('software architect') || t.includes('solution architect')) return 'software-architect';
    if (t.includes('system administrator') || t.includes('sysadmin')) return 'system-administrator';
    if (t.includes('network engineer') || t.includes('network admin')) return 'network-engineer';
    if (t.includes('devops') || t.includes('ci/cd') || t.includes('jenkins') || 
        t.includes('kubernetes') || t.includes('docker')) return 'devops';
    if (t.includes('cloud') || t.includes('aws') || t.includes('azure') || t.includes('gcp')) return 'cloud';
    if (t.includes('data scientist') || t.includes('machine learning scientist')) return 'data-scientist';
    if (t.includes('data analyst') || t.includes('analytics')) return 'data-analyst';
    if (t.includes('data engineer') || t.includes('etl') || t.includes('data pipeline')) return 'data-engineer';
    if (t.includes('cybersecurity') || t.includes('security engineer') || 
        t.includes('ethical hacker') || t.includes('penetration')) return 'cybersecurity';
    if (t.includes('game developer') || t.includes('game dev') || t.includes('unity') || t.includes('unreal')) return 'game-developer';
    if (t.includes('mobile developer') || t.includes('ios') || t.includes('android') || 
        t.includes('react native') || t.includes('flutter')) return 'mobile';
    if (t.includes('ai research') || t.includes('research engineer') || t.includes('research scientist')) return 'ai-research-engineer';
    if (t.includes('ai') || t.includes('ml') || t.includes('artificial intelligence') || 
        t.includes('machine learning')) return 'ai-ml';
    if (t.includes('qa') || t.includes('quality assurance') || t.includes('testing')) return 'qa';
    if (t.includes('salesforce') || t.includes('crm')) return 'salesforce';
    if (t.includes('it support') || t.includes('helpdesk') || t.includes('desktop support')) return 'it-support';
    if (t.includes('embedded systems') || t.includes('embedded engineer') || t.includes('firmware')) return 'embedded-systems-engineer';
    if (t.includes('database administrator') || t.includes('dba') || t.includes('database admin')) return 'database-administrator';
    
    // ===== NEW IT PROFESSIONS =====
    if (t.includes('software engineer') || t.includes('software developer')) return 'software-engineer';
    
    // ===== BATCH 2 - NEW IT PROFESSIONS =====
    if (t.includes('computer hardware') || t.includes('hardware technician')) return 'computer-hardware-technician';
    if (t.includes('computer programmer') || t.includes('programmer')) return 'computer-programmer';
    if (t.includes('electronics technician') || t.includes('electronic technician')) return 'electronics-technician';
    if (t.includes('it technician') || t.includes('it tech')) return 'it-technician';
    if (t.includes('software tester') || t.includes('software testing')) return 'software-tester';
    
    // ===== GENERAL IT (Baad me check) =====
    if (t.includes('fullstack') || t.includes('full stack')) return 'full-stack';
    if (t.includes('backend') || t.includes('node') || t.includes('spring') || 
        t.includes('django') || t.includes('laravel')) return 'backend';
    if (t.includes('frontend') || t.includes('front-end') || t.includes('react') || 
        t.includes('angular') || t.includes('vue') || t.includes('ui developer')) return 'frontend';
    if (t.includes('web developer') || t.includes('web engineer') || t.includes('wordpress') ||
        t.includes('php developer') || t.includes('full stack web')) return 'web';
    if (t.includes('developer') || t.includes('engineer') || t.includes('programmer')) return 'developer';
    
    return null;
};