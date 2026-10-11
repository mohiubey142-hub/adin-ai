// src/components/cv-builder/types/documentTypes.ts

import { TemplateType } from './cvTypes';

/**
 * Ek CV document ki summary (index mein store hoti hai).
 */
export interface CVDocumentMeta {
    id: string;
    title: string;
    jobTitle?: string;
    template: TemplateType;
    lastEdited: number;
    createdAt: number;
    /** ✅ NEW: Pinned flag — pinned resumes top par dikhte hain */
    pinned?: boolean;
}

export interface CVDocument extends CVDocumentMeta {
    data: CVDocumentData;
}

export interface CVDocumentData {
    personalInfo: any;
    professionalSummary: string;
    experiences: any[];
    educations: any[];
    skills: string;
    selectedCountryCode: string;
    phoneNumber: string;
    step: number;
    template: TemplateType;
    projects: any[];
    certifications: any[];
    languages: any[];
    achievements: any[];
    profilePhoto: string | null;
    hasReachedPreview: boolean;
    selectedProvider: string;
    lastUpdated?: number;
}

export interface DocumentService {
    list(userId: string): Promise<CVDocumentMeta[]>;
    get(userId: string, documentId: string): Promise<CVDocument | null>;
    create(userId: string, data: CVDocumentData, title?: string): Promise<CVDocumentMeta>;
    update(userId: string, documentId: string, data: CVDocumentData): Promise<void>;
    remove(userId: string, documentId: string): Promise<void>;
    createEmpty(userId: string): Promise<CVDocumentMeta>;
    /** ✅ NEW: Pin/unpin toggle */
    togglePin(userId: string, documentId: string): Promise<void>;
    /** ✅ NEW: Rename document */
    rename(userId: string, documentId: string, newTitle: string): Promise<void>;
}