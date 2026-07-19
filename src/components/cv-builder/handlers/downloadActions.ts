import toast from 'react-hot-toast';

// ✅ FIXED: Sahi path for utils/
import { generateTextPDF } from '../utils/pdfGeneratorText';

// ✅ FIXED: Sahi path for services/
import { generatePlainTextCV, downloadBlob, getFileName, copyToClipboard } from '../services/cvService';

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
    template: 'modern' | 'minimal',
    profilePhoto: string | null = null  // ✅ ADDED: profilePhoto parameter
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

    const downloadTXT = () => {
        const text = getPlainTextCV();
        const fileName = getFileName(personalInfo.name || 'MyCV', 'txt');
        downloadBlob(text, fileName, 'text/plain;charset=utf-8');
        toast.success('TXT file downloaded!', {
            position: 'top-center',
            duration: 3000,
            style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid rgba(168, 85, 247, 0.3)',
            }
        });
    };

    const downloadPDF = async () => {
        toast.loading('Generating ATS-friendly PDF...', { id: 'pdf' });
        
        try {
            const pdfBlob = await generateTextPDF({
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
                profilePhoto: profilePhoto,  // ✅ FIXED: Using profilePhoto parameter instead of null
                theme: template
            });
            
            const fileName = getFileName(personalInfo.name || 'MyCV', 'pdf');
            downloadBlob(pdfBlob, fileName, 'application/pdf');
            
            toast.success('PDF ready! Text is fully selectable.', {
                id: 'pdf',
                position: 'top-center',
                duration: 3000,
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                }
            });
        } catch (err) {
            console.error('PDF Error:', err);
            toast.error('PDF generation failed. Please try again.', {
                id: 'pdf',
                position: 'top-center',
                style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }
            });
        }
    };

    const copyCV = () => {
        const text = getPlainTextCV();
        copyToClipboard(text);
        toast.success('CV copied to clipboard!', {
            position: 'top-center',
            duration: 3000,
            style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid rgba(168, 85, 247, 0.3)',
            }
        });
    };

    return {
        getPlainTextCV,
        downloadTXT,
        downloadPDF,
        copyCV
    };
};