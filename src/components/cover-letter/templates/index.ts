// src/components/cover-letter/templates/index.ts
import { PDFTemplate } from './BaseTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { ProfessionalTemplate } from './ProfessionalTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { CreativeTemplate } from './CreativeTemplate';

// Template Registry - Har template ka apna renderer
export const templateRegistry: Record<string, PDFTemplate> = {
    classic: new ClassicTemplate(),
    modern: new ModernTemplate(),
    minimal: new MinimalTemplate(),
    professional: new ProfessionalTemplate(),
    executive: new ExecutiveTemplate(),
    creative: new CreativeTemplate(),
};

// Default template - agar koi template select nahi hai
export const DEFAULT_TEMPLATE = 'classic';

// Valid template IDs
export const VALID_TEMPLATES = [
    'classic',
    'modern',
    'minimal',
    'professional',
    'executive',
    'creative',
] as const;

export type ValidTemplateId = typeof VALID_TEMPLATES[number];

// Get template with fallback
export const getTemplate = (templateId: string): PDFTemplate => {
    if (templateId && templateRegistry[templateId]) {
        return templateRegistry[templateId];
    }
    return templateRegistry[DEFAULT_TEMPLATE];
};