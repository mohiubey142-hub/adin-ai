import React from 'react';

// Safe text rendering with overflow protection
export const safeText = (text: string): string => {
    return text || '';
};

// Remove existing bullet characters from text
export const cleanBulletText = (text: string): string => {
    return text.replace(/^[•▪◦*-]\s*/, '').trim();
};

// Render bullet points with SINGLE bullet and MINIMAL spacing
export const renderBulletPoints = (text: string, textColor: string = 'text-gray-700') => {
    if (!text) return null;
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, idx) => {
        const clean = cleanBulletText(line);
        if (!clean) return null;
        return (
            <div key={idx} className="flex items-start gap-1.5 overflow-hidden w-full">
                <span className="text-gray-400 flex-shrink-0">•</span>
                <span className={`${textColor} text-sm leading-relaxed break-words overflow-wrap-anywhere min-w-0 flex-1`}>
                    {safeText(clean)}
                </span>
            </div>
        );
    }).filter(Boolean);
};

// Render inline items (skills, languages) as dot-separated
export const renderInlineItems = (text: string, textColor: string = 'text-gray-700') => {
    if (!text) return null;
    const items = text.split('\n')
        .map(line => cleanBulletText(line))
        .filter(item => item);
    if (items.length === 0) return null;
    return (
        <div className={`${textColor} text-sm leading-relaxed break-words overflow-wrap-anywhere w-full`}>
            {items.map((item, idx) => (
                <span key={idx}>
                    {idx > 0 && <span className="mx-1.5 text-gray-400">•</span>}
                    <span>{safeText(item)}</span>
                </span>
            ))}
        </div>
    );
};

// Render languages inline
export const renderLanguagesInline = (
    languages: any[],
    textColor: string = 'text-gray-700'
) => {
    if (languages.length === 0) return null;
    const validLanguages = languages.filter(l => l.language);
    if (validLanguages.length === 0) return null;
    return (
        <div className={`${textColor} text-sm leading-relaxed break-words overflow-wrap-anywhere w-full`}>
            {validLanguages.map((l, i) => (
                <span key={i}>
                    {i > 0 && <span className="mx-1.5 text-gray-400">•</span>}
                    <span className="font-medium">{safeText(l.language)}</span> {safeText(l.proficiency)}
                </span>
            ))}
        </div>
    );
};

// Check if section has content
export const hasContent = (items: any[], checkFields: string[]): boolean => {
    return items.some(item => 
        checkFields.some(field => {
            const value = item[field];
            return value && value.trim && value.trim().length > 0;
        })
    );
};

// Check if string has content
export const hasStringContent = (str: string): boolean => {
    return str && str.trim().length > 0;
};

// Filter valid items based on fields
export const filterValidItems = <T extends Record<string, any>>(
    items: T[],
    fields: (keyof T)[]
): T[] => {
    return items.filter(item =>
        fields.some(field => {
            const value = item[field];
            return value && typeof value === 'string' && value.trim().length > 0;
        })
    );
};