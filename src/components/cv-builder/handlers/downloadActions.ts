// downloadActions.ts
import type { CVExtras } from '../types/cvExtraTypes';
import toast from 'react-hot-toast';
import { generatePlainTextCV, downloadBlob, getFileName, copyToClipboard } from '../services/cvService';
import { generateAcademicPDF } from '../utils/pdf/academicPdf';
import { generateAtsProPDF } from '../utils/pdf/atsProPdf';
import { generateClassicPDF } from '../utils/pdf/classicPdf';
import { generateMinimalPDF } from '../utils/pdf/minimalPdf';
import { generateModernPDF } from '../utils/pdf/modernPdf';
import { generateCreativePDF } from '../utils/pdf/creativePdf';
import { generateTealCurvePDF } from '../utils/pdf/tealCurvePdf';
import { generateExecutivePDF } from '../utils/pdf/executivePdf';
import { generateStandardPDF } from '../utils/pdf/standardPdf';   // ← NEW

export const createDownloadActions = (
    personalInfo: any,
    phoneNumber: string,
    selectedCountryCode: string,
    professionalSummary: string,
    experiences: any[],
    educations: any[],
    projects: any[],
    certifications: any[],
    languages: any[],
    achievements: any[],
    skills: string,
    template: any,
    profilePhoto: string | null = null,
    extras?: Partial<CVExtras>
) => {

    const getPlainTextCV = (): string => {
        return generatePlainTextCV({
            personalInfo,
            phoneNumber,
            selectedCountryCode,
            professionalSummary,
            experiences,
            educations,
            projects,
            certifications,
            languages,
            achievements,
            skills,
            template,
            ...(extras || {})
        });
    };

    const buildPdfPayload = () => ({
        personalInfo: {
            name: personalInfo.name,
            title: personalInfo.jobTitle || personalInfo.title,
            email: personalInfo.email,
            location: personalInfo.location || personalInfo.city,
            linkedin: personalInfo.linkedin,
            github: personalInfo.github,
            website: personalInfo.website || personalInfo.portfolio,
            address: personalInfo.address || personalInfo.location,
            photo: personalInfo.photo || profilePhoto || undefined,
            customFields: personalInfo.customFields
        },
        phoneNumber,
        selectedCountryCode,
        professionalSummary,
        experiences,
        educations,
        projects,
        certifications,
        languages,
        achievements,
        skills,
        template,
        ...(extras || {})
    });

    // ❌ successToast removed — success cards no longer shown

    const errorToast = (message: string, id: string) =>
        toast.error(message, {
            id,
            position: 'top-center',
            duration: 3000,
            style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid rgba(239, 68, 68, 0.3)',
            }
        });

    const downloadTXT = () => {
        const text = getPlainTextCV();
        const fileName = getFileName(personalInfo.name || 'MyCV', 'txt');
        downloadBlob(text, fileName, 'text/plain;charset=utf-8');
    };

    const downloadPDF = async () => {
        try {
            const doc = generateAtsProPDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
        } catch (error) {
            console.error('PDF generation failed:', error);
            errorToast('Something went wrong generating the PDF.', 'pdf');
        }
    };

    const downloadClassicPDF = async () => {
        try {
            const doc = generateClassicPDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
        } catch (error) {
            console.error('Classic PDF generation failed:', error);
            errorToast('Something went wrong generating the Classic PDF.', 'classic-pdf');
        }
    };

    const downloadMinimalPDF = async () => {
        try {
            const doc = generateMinimalPDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
        } catch (error) {
            console.error('Minimal PDF generation failed:', error);
            errorToast('Something went wrong generating the Minimal PDF.', 'minimal-pdf');
        }
    };

    const downloadModernPDF = async () => {
        try {
            const doc = generateModernPDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
        } catch (error) {
            console.error('Modern PDF generation failed:', error);
            errorToast('Something went wrong generating the Modern PDF.', 'modern-pdf');
        }
    };

    const downloadAcademicPDF = async () => {
        try {
            const doc = generateAcademicPDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
        } catch (error) {
            console.error('Academic PDF generation failed:', error);
            errorToast('Something went wrong generating the Academic PDF.', 'academic-pdf');
        }
    };

    const downloadCreativePDF = async () => {
        try {
            const doc = generateCreativePDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
        } catch (error) {
            console.error('Creative PDF generation failed:', error);
            errorToast('Something went wrong generating the Creative PDF.', 'creative-pdf');
        }
    };

    const downloadTealCurvePDF = async () => {
        try {
            const doc = generateTealCurvePDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
        } catch (error) {
            console.error('Teal Curve PDF generation failed:', error);
            errorToast('Something went wrong generating the Teal Curve PDF.', 'tealcurve-pdf');
        }
    };

    const downloadExecutivePDF = async () => {
        try {
            const doc = generateExecutivePDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
        } catch (error) {
            console.error('Executive PDF generation failed:', error);
            errorToast('Something went wrong generating the Executive PDF.', 'executive-pdf');
        }
    };

    const downloadStandardPDF = async () => {
        try {
            const doc = generateStandardPDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
        } catch (error) {
            console.error('Standard PDF generation failed:', error);
            errorToast('Something went wrong generating the Standard PDF.', 'standard-pdf');
        }
    };

    const copyCV = () => {
        const text = getPlainTextCV();
        copyToClipboard(text);
        // ❌ success toast removed
    };

    return {
        getPlainTextCV,
        downloadTXT,
        downloadPDF,
        downloadClassicPDF,
        downloadMinimalPDF,
        downloadModernPDF,
        downloadAcademicPDF,
        downloadCreativePDF,
        downloadTealCurvePDF,
        downloadExecutivePDF,
        downloadStandardPDF,
        copyCV
    };
};