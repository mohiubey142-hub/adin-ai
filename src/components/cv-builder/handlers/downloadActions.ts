// downloadActions.ts
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
    profilePhoto: string | null = null
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
            skills
        });
    };

    // ✅ Shared payload builder — every PDF generator gets identical data
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
            photo: personalInfo.photo || profilePhoto || undefined
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
        skills
    });

    const successToast = (message: string, borderColor = 'rgba(168, 85, 247, 0.3)') =>
        toast.success(message, {
            position: 'top-center',
            duration: 3000,
            style: {
                background: '#1a1a2e',
                color: '#fff',
                border: `1px solid ${borderColor}`,
            }
        });

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
        successToast('TXT file downloaded!');
    };

    const downloadPDF = async () => {
        try {
            const doc = generateAtsProPDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
            successToast('ATS Pro PDF downloaded!');
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
            successToast('Classic PDF downloaded!', 'rgba(15, 118, 110, 0.3)');
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
            successToast('Minimal PDF downloaded!', 'rgba(37, 99, 235, 0.3)');
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
            successToast('Modern PDF downloaded!', 'rgba(109, 40, 217, 0.3)');
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
            successToast('Academic PDF downloaded!', 'rgba(88, 28, 135, 0.3)');
        } catch (error) {
            console.error('Academic PDF generation failed:', error);
            errorToast('Something went wrong generating the Academic PDF.', 'academic-pdf');
        }
    };

    // ✅ CREATIVE PDF — purple heading variant (clone of minimalPdf)
    const downloadCreativePDF = async () => {
        try {
            const doc = generateCreativePDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
            successToast('Creative PDF downloaded!', 'rgba(124, 58, 237, 0.3)');
        } catch (error) {
            console.error('Creative PDF generation failed:', error);
            errorToast('Something went wrong generating the Creative PDF.', 'creative-pdf');
        }
    };

    // ✅ TEAL CURVE PDF — dark teal header band, teal section headings/dividers
    const downloadTealCurvePDF = async () => {
        try {
            const doc = generateTealCurvePDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
            successToast('Teal Curve PDF downloaded!', 'rgba(13, 43, 43, 0.4)');
        } catch (error) {
            console.error('Teal Curve PDF generation failed:', error);
            errorToast('Something went wrong generating the Teal Curve PDF.', 'tealcurve-pdf');
        }
    };

    // ✅ EXECUTIVE PDF — yellow/gold section heading variant (clone of minimalPdf)
    const downloadExecutivePDF = async () => {
        try {
            const doc = generateExecutivePDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
            successToast('Executive PDF downloaded!', 'rgba(212, 160, 23, 0.4)');
        } catch (error) {
            console.error('Executive PDF generation failed:', error);
            errorToast('Something went wrong generating the Executive PDF.', 'executive-pdf');
        }
    };

    // ✅ STANDARD PDF — minimal dark near-black/gray theme with circular profile photo support
    const downloadStandardPDF = async () => {
        try {
            const doc = generateStandardPDF(buildPdfPayload());
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            doc.save(fileName);
            successToast('Standard PDF downloaded!', 'rgba(40, 40, 45, 0.4)');
        } catch (error) {
            console.error('Standard PDF generation failed:', error);
            errorToast('Something went wrong generating the Standard PDF.', 'standard-pdf');
        }
    };

    const copyCV = () => {
        const text = getPlainTextCV();
        copyToClipboard(text);
        successToast('CV copied to clipboard!');
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
        downloadStandardPDF,   // ← NEW
        copyCV
    };
};