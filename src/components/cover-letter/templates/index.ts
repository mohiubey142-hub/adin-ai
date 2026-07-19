// src/components/cover-letter/templates/index.ts
import { PDFTemplate } from './BaseTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';

// Template Registry - Har template ka apna renderer
export const templateRegistry: Record<string, PDFTemplate> = {
    classic: new ClassicTemplate(),
    modern: new ModernTemplate(),
    executive: new ExecutiveTemplate(),
};

// Default template - agar koi template select nahi hai
export const DEFAULT_TEMPLATE = 'classic';

// Valid template IDs
export const VALID_TEMPLATES = ['classic', 'modern', 'executive'];

// Get template with fallback
export const getTemplate = (templateId: string): PDFTemplate => {
    if (templateId && templateRegistry[templateId]) {
        return templateRegistry[templateId];
    }
    return templateRegistry[DEFAULT_TEMPLATE];
};