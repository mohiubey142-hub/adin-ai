// src/components/cover-letter/templates/BaseTemplate.ts
import jsPDF from 'jspdf';

export interface CoverLetterData {
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
    selectedTemplate: string;
}

export interface PDFTemplate {
    render(data: CoverLetterData): Promise<Blob>;
}