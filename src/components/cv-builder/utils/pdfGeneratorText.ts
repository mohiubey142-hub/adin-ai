// utils/pdfGeneratorText.ts (MODIFIED - SIRF ROUTER)
import { generateModernPDF, generateClassicPDF, generateMinimalPDF } from './pdf';
import { PDFParams } from '../types/cvTypes';

export const generateTextPDF = async (params: PDFParams): Promise<Blob> => {
    const { theme = 'modern' } = params;
    
    // ✅ DEBUG LOG ADD KARO
    console.log('🔍 PDF Generator Called with theme:', theme);
    
    switch (theme) {
        case 'classic':
            console.log('✅ Using Classic PDF Generator');
            return generateClassicPDF(params);
        case 'minimal':
            console.log('✅ Using Minimal PDF Generator');
            return generateMinimalPDF(params);
        default:
            console.log('✅ Using Modern PDF Generator (default)');
            return generateModernPDF(params);
    }
};