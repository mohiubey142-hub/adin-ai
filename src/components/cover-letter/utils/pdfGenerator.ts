// src/components/cover-letter/utils/pdfGenerator.ts
import { getTemplate, DEFAULT_TEMPLATE } from '../templates';

interface CoverLetterPDFData {
    userName: string;
    email: string;
    phoneNumber: string;
    selectedCountryCode: string;
    address: string;
    linkedin: string;
    jobTitle: string;
    company: string;
    education: string;
    experience: string;
    skills: string;
    additionalInfo: string;
    generatedLetter: string;
    selectedStyle: string;
    profilePhoto: string | null;
    selectedTemplate?: string;
}

export const generateCoverLetterPDF = async (data: CoverLetterPDFData): Promise<Blob> => {
    const templateId = data.selectedTemplate || DEFAULT_TEMPLATE;
    const template = getTemplate(templateId);
    return await template.render(data);
};