import { TemplateStyles } from '../types/previewTypes';

// MODERN TEMPLATE STYLES
export const modernStyles: TemplateStyles = {
    card: 'bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl border border-gray-800',
    heading: 'text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30',
    name: 'text-3xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent',
    title: 'text-lg mb-5 text-gray-400',
    contact: 'flex gap-4 flex-wrap mb-6 text-sm text-gray-400 max-w-full',
    photoBorder: 'border-4 border-purple-500 shadow-lg shadow-purple-500/30',
    description: 'text-gray-300 text-sm'
};

// CLASSIC TEMPLATE STYLES
export const classicStyles: TemplateStyles = {
    card: 'bg-white shadow-lg',
    heading: 'text-[11px] font-bold uppercase tracking-[0.5px] text-purple-700 border-b-2 border-purple-500 pb-1 mb-3',
    name: 'text-3xl font-bold text-gray-900 tracking-[0.3px]',
    title: 'text-base text-gray-600',
    contact: 'flex gap-4 flex-wrap text-sm text-gray-600 max-w-full',
    photoBorder: 'border-2 border-gray-300',
    description: 'text-gray-700 text-sm leading-relaxed'
};

// MINIMAL TEMPLATE STYLES
export const minimalStyles: TemplateStyles = {
    card: 'bg-white shadow-lg',
    heading: 'text-[11px] font-medium uppercase tracking-[1.5px] text-gray-800 border-b border-gray-300 pb-2 mb-4',
    name: 'text-3xl font-light text-gray-900 tracking-[0.5px]',
    title: 'text-base font-light text-gray-600 tracking-[0.3px]',
    contact: 'flex gap-4 flex-wrap text-sm text-gray-600 max-w-full',
    photoBorder: 'border-2 border-gray-300',
    description: 'text-gray-700 text-sm leading-relaxed'
};

// DEFAULT FALLBACK
export const defaultStyles: TemplateStyles = modernStyles;

// Get styles based on template
export const getTemplateStyles = (template: 'modern' | 'classic' | 'minimal'): TemplateStyles => {
    switch(template) {
        case 'modern': return modernStyles;
        case 'classic': return classicStyles;
        case 'minimal': return minimalStyles;
        default: return defaultStyles;
    }
};

// Background style (different from other styles)
export const getBackgroundStyle = (): string => {
    return '#000000';
};