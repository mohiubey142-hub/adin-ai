// utils/pdf/classicPdf.ts
import { PDFGeneratorBase, ThemeConfig } from './basePdf';
import { PDFParams } from '../../types/cvTypes';
import { getFullPhoneNumber } from '../phoneValidation';

const CLASSIC_THEME: ThemeConfig = {
    name: 'classic',
    colors: {
        primary: [219, 112, 147],
        secondary: [219, 112, 147],
        accent: [219, 112, 147],
        text: [17, 17, 17],
        textLight: [75, 75, 75],
        textLighter: [140, 140, 150],
        background: [255, 255, 255],
        border: [200, 200, 210],
        divider: [200, 200, 210],
        tagBg: [250, 240, 245],
        tagBorder: [219, 112, 147],
        link: [219, 112, 147],
    },
    headerFontSize: 26,
    sectionTitleFontSize: 11,
    nameFontSize: 26,
    jobTitleFontSize: 13,
    contactFontSize: 8.5,
    socialFontSize: 7.5,
    bodyFontSize: 10,
    bulletFontSize: 9.5,
    tagFontSize: 8.5,
    footerFontSize: 7,
    headerSpacing: 5,
    sectionSpacing: 6,
    bulletIndent: 5,
    tagPadding: 6,
    tagSpacing: 4,
    tagHeight: 7.5,
    lineWidth: 0.8,
    dividerLineWidth: 0.5,
    photoBorderWidth: 1.2,
    roundedRectRadius: 1.5,
    useUppercaseHeaders: true,
    useDividerLines: true,
    useTagBackgrounds: true,
    usePhotoBorder: true,
    useTwoColumnLayout: false,
};

class ClassicPDFGenerator extends PDFGeneratorBase {
    private params: PDFParams;
    private fullPhone: string;
    private pageBottom: number;
    private hasPhoto: boolean = false;
    private photoSize: number = 24;
    private leftColumnX: number;
    private rightColumnX: number;
    private columnWidth: number;
    private columnGap: number;

    constructor(params: PDFParams) {
        super(CLASSIC_THEME);
        this.params = params;
        this.fullPhone = getFullPhoneNumber(params.phoneNumber, params.selectedCountryCode);
        this.personalInfo = params.personalInfo;
        
        this.marginY = 18;
        this.marginX = 18;
        this.currentY = this.marginY;
        this.maxLineWidth = this.pageWidth - (this.marginX * 2);
        this.pageBottom = this.pageHeight - this.bottomSafeZone;
        this.hasPhoto = !!(params.profilePhoto && params.profilePhoto.startsWith('data:image'));
        
        // Column setup for information area
        this.columnGap = 10;
        this.columnWidth = (this.maxLineWidth - this.columnGap) / 2;
        this.leftColumnX = this.marginX;
        this.rightColumnX = this.marginX + this.columnWidth + this.columnGap;
    }

    async generate(): Promise<Blob> {
        await this.renderHeader();
        await this.renderProfessionalSummary();
        await this.renderExperience();
        await this.renderProjects();
        await this.renderInformationArea();
        this.renderFooter();
        return this.pdf.output('blob');
    }

    private getContactInfo(): string[] {
        const contacts: string[] = [];
        const pi = this.params.personalInfo;
        if (pi.email) contacts.push(this.cleanText(pi.email));
        if (this.fullPhone) contacts.push(this.cleanText(this.fullPhone));
        if (pi.address) contacts.push(this.cleanText(pi.address));
        if (pi.linkedin) contacts.push(this.cleanText(pi.linkedin));
        if (pi.github) contacts.push(this.cleanText(pi.github));
        if (pi.portfolio) contacts.push(this.cleanText(pi.portfolio));
        return contacts;
    }

    private wrapTextToWidth(text: string, maxWidth: number): string[] {
        if (!text) return [];
        return this.pdf.splitTextToSize(this.cleanText(text), maxWidth);
    }

    private renderBulletItem(text: string, x: number, maxWidth: number): void {
        if (!text) return;
        
        const cleaned = this.cleanText(text).replace(/^[•\-*✓✅]\s*/, '');
        const bulletX = x + 2;
        const textX = x + 5.5;
        const wrappedLines = this.pdf.splitTextToSize(cleaned, maxWidth - 5.5);
        
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        
        for (let i = 0; i < wrappedLines.length; i++) {
            const lineY = this.currentY;
            const lineHeight = 9 * 0.38 + 1.2;
            
            if (this.currentY + lineHeight > this.pageBottom) {
                this.addPageSpace(15);
            }
            
            if (i === 0) {
                this.pdf.text('•', bulletX, lineY);
                this.pdf.text(wrappedLines[i], textX, lineY);
            } else {
                this.pdf.text(wrappedLines[i], textX, lineY);
            }
            this.currentY += lineHeight;
        }
    }

    private renderSectionTitle(title: string): void {
        const x = this.marginX;
        
        if (this.currentY + 20 > this.pageBottom) {
            this.addPageSpace(25);
        }
        
        this.pdf.setFontSize(this.theme.sectionTitleFontSize);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.pdf.text(title.toUpperCase(), x, this.currentY);
        this.currentY += 4;
        
        this.pdf.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.pdf.setLineWidth(0.4);
        this.pdf.line(x, this.currentY, this.pageWidth - this.marginX, this.currentY);
        this.currentY += 8;
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        this.pdf.setFont('helvetica', 'normal');
    }

    private renderSectionTitleCompact(title: string, x: number): void {
        if (this.currentY + 20 > this.pageBottom) {
            this.addPageSpace(25);
        }
        
        this.pdf.setFontSize(this.theme.sectionTitleFontSize - 1);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.pdf.text(title.toUpperCase(), x, this.currentY);
        this.currentY += 3;
        
        this.pdf.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.pdf.setLineWidth(0.3);
        this.pdf.line(x, this.currentY, x + 25, this.currentY);
        this.currentY += 5;
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        this.pdf.setFont('helvetica', 'normal');
    }

    private addPageSpace(extra: number): void {
        const newHeight = this.pageHeight + extra;
        this.pageHeight = newHeight;
        this.pageBottom = newHeight - this.bottomSafeZone;
        this.pdf.internal.pageSize.setHeight(newHeight);
    }

    private parseSkillItems(skills: string): string[] {
        if (!skills) return [];
        if (skills.includes(',')) {
            return skills.split(',').map(s => s.trim()).filter(s => s);
        } else if (skills.includes('\n')) {
            return skills.split('\n').map(s => s.trim().replace(/^[•\-*]\s*/, '')).filter(s => s);
        } else if (skills.includes('•')) {
            return skills.split('•').map(s => s.trim()).filter(s => s);
        } else {
            return [skills.trim()];
        }
    }

    // ============================================================
    // RENDER METHODS
    // ============================================================

    private renderHeader(): void {
        const { personalInfo, profilePhoto } = this.params;
        const x = this.marginX;

        if (profilePhoto && profilePhoto.startsWith('data:image')) {
            try {
                const imgX = x;
                const imgY = this.currentY;
                
                this.pdf.addImage(profilePhoto, 'PNG', imgX, imgY, this.photoSize, this.photoSize);
                
                this.pdf.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
                this.pdf.setLineWidth(0.5);
                this.pdf.circle(imgX + this.photoSize/2, imgY + this.photoSize/2, this.photoSize/2, 'S');
                
                this.currentY = imgY + this.photoSize + 8;
            } catch (err) {
                console.error('Failed to add profile image to PDF:', err);
            }
        }

        this.pdf.setFontSize(this.theme.nameFontSize);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        const name = this.cleanText(personalInfo.name.toUpperCase() || 'YOUR NAME');
        const nameLines = this.wrapTextToWidth(name, this.maxLineWidth);
        this.pdf.text(nameLines, x, this.currentY);
        this.currentY += nameLines.length * (this.theme.nameFontSize * 0.38) + 2;
        
        this.pdf.setFontSize(this.theme.jobTitleFontSize);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
        const jobTitle = this.cleanText(personalInfo.title || 'JOB TITLE');
        const jobTitleLines = this.wrapTextToWidth(jobTitle, this.maxLineWidth);
        this.pdf.text(jobTitleLines, x, this.currentY);
        this.currentY += jobTitleLines.length * (this.theme.jobTitleFontSize * 0.38) + 4;
        
        this.pdf.setFontSize(this.theme.contactFontSize);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
        const contactLine = this.getContactInfo().join('  |  ');
        const contactLines = this.wrapTextToWidth(contactLine, this.maxLineWidth);
        this.pdf.text(contactLines, x, this.currentY);
        this.currentY += contactLines.length * 4.5 + 6;
        
        this.pdf.setDrawColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.pdf.setLineWidth(0.6);
        this.pdf.line(x, this.currentY, this.pageWidth - this.marginX, this.currentY);
        this.currentY += 8;
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
    }

    private renderProfessionalSummary(): void {
        if (!this.params.professionalSummary || !this.params.professionalSummary.trim()) return;
        
        const x = this.marginX;
        this.renderSectionTitle('Professional Summary');
        
        this.pdf.setFontSize(this.theme.bodyFontSize);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        const summaryLines = this.wrapTextToWidth(this.params.professionalSummary, this.maxLineWidth);
        this.pdf.text(summaryLines, x, this.currentY);
        this.currentY += summaryLines.length * (this.theme.bodyFontSize * 0.38) + 6;
    }

    private renderExperience(): void {
        const validExperiences = this.params.experiences.filter(e => e.title?.trim() || e.company?.trim());
        if (validExperiences.length === 0) return;
        
        const x = this.marginX;
        this.renderSectionTitle('Experience');
        
        for (const exp of validExperiences) {
            this.pdf.setFontSize(10.5);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
            const jobLine = `${this.cleanText(exp.title || 'Position')} | ${this.cleanText(exp.company || 'Company')}`;
            const jobLines = this.wrapTextToWidth(jobLine, this.maxLineWidth);
            this.pdf.text(jobLines, x, this.currentY);
            this.currentY += jobLines.length * (10.5 * 0.38) + 2;
            
            const dateRange = this.formatDateRange(exp.startDate, exp.endDate);
            this.pdf.setFontSize(8.5);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.colors.textLighter[0], this.colors.textLighter[1], this.colors.textLighter[2]);
            this.pdf.text(dateRange, x, this.currentY);
            this.currentY += 4;
            
            if (exp.description) {
                const descLines = exp.description.split('\n').filter(l => l.trim());
                for (const line of descLines) {
                    this.renderBulletItem(line, x, this.maxLineWidth);
                }
            }
            this.currentY += 4;
        }
    }

    private renderProjects(): void {
        const validProjects = this.params.projects.filter(p => p.name?.trim());
        if (validProjects.length === 0) return;
        
        const x = this.marginX;
        this.renderSectionTitle('Projects');
        
        for (const proj of validProjects) {
            this.pdf.setFontSize(10.5);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
            let projTitle = this.cleanText(proj.name);
            if (proj.tech) projTitle += ` (${this.cleanText(proj.tech)})`;
            const titleLines = this.wrapTextToWidth(projTitle, this.maxLineWidth);
            this.pdf.text(titleLines, x, this.currentY);
            this.currentY += titleLines.length * (10.5 * 0.38) + 2;
            
            if (proj.description) {
                const descLines = proj.description.split('\n').filter(l => l.trim());
                for (const line of descLines) {
                    this.renderBulletItem(line, x, this.maxLineWidth);
                }
            }
            
            if (proj.github) {
                this.pdf.setFontSize(8.5);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.link[0], this.colors.link[1], this.colors.link[2]);
                const githubText = `GitHub: ${this.cleanText(proj.github)}`;
                const githubLines = this.wrapTextToWidth(githubText, this.maxLineWidth - 2);
                this.pdf.text(githubLines, x + 2, this.currentY);
                this.currentY += githubLines.length * (8.5 * 0.38) + 2;
            }
            this.currentY += 4;
        }
    }

    private renderInformationArea(): void {
        const hasEducation = this.params.educations.some(e => e.degree?.trim() || e.institution?.trim());
        const hasSkills = this.params.skills && this.params.skills.trim();
        const hasCertifications = this.params.certifications.some(c => c.name?.trim());
        const hasLanguages = this.params.languages.some(l => l.language?.trim());
        const hasAchievements = this.params.achievements.some(a => a.title?.trim());

        if (!hasEducation && !hasSkills && !hasCertifications && !hasLanguages && !hasAchievements) {
            return;
        }

        // Add a subtle divider before information area
        const x = this.marginX;
        this.pdf.setDrawColor(220, 220, 230);
        this.pdf.setLineWidth(0.3);
        this.pdf.line(x, this.currentY, this.pageWidth - this.marginX, this.currentY);
        this.currentY += 8;

        // Render two-column grid: Education | Skills
        const startY = this.currentY;
        let leftHeight = 0;
        let rightHeight = 0;

        if (hasEducation) {
            const tempY = this.currentY;
            this.renderEducationCompact();
            leftHeight = this.currentY - tempY;
            this.currentY = tempY;
        }

        if (hasSkills) {
            const tempY = this.currentY;
            this.renderSkillsCompact();
            rightHeight = this.currentY - tempY;
            this.currentY = tempY;
        }

        // If both exist, render side by side
        if (hasEducation && hasSkills) {
            this.currentY = startY;
            this.renderEducationCompact();
            const leftEndY = this.currentY;
            
            this.currentY = startY;
            this.renderSkillsCompact();
            const rightEndY = this.currentY;
            
            this.currentY = Math.max(leftEndY, rightEndY) + 6;
        } else if (hasEducation) {
            this.renderEducationCompact();
            this.currentY += 4;
        } else if (hasSkills) {
            this.renderSkillsCompact();
            this.currentY += 4;
        }

        // Render second row: Certifications | Languages
        if (hasCertifications || hasLanguages) {
            const rowStartY = this.currentY;
            let leftRowHeight = 0;
            let rightRowHeight = 0;

            if (hasCertifications) {
                const tempY = this.currentY;
                this.renderCertificationsCompact();
                leftRowHeight = this.currentY - tempY;
                this.currentY = tempY;
            }

            if (hasLanguages) {
                const tempY = this.currentY;
                this.renderLanguagesCompact();
                rightRowHeight = this.currentY - tempY;
                this.currentY = tempY;
            }

            if (hasCertifications && hasLanguages) {
                this.currentY = rowStartY;
                this.renderCertificationsCompact();
                const leftEndY = this.currentY;
                
                this.currentY = rowStartY;
                this.renderLanguagesCompact();
                const rightEndY = this.currentY;
                
                this.currentY = Math.max(leftEndY, rightEndY) + 6;
            } else if (hasCertifications) {
                this.renderCertificationsCompact();
                this.currentY += 4;
            } else if (hasLanguages) {
                this.renderLanguagesCompact();
                this.currentY += 4;
            }
        }

        // Render Achievements full width
        if (hasAchievements) {
            this.renderAchievementsCompact();
        }
    }

    private renderEducationCompact(): void {
        const validEducations = this.params.educations.filter(e => e.degree?.trim() || e.institution?.trim());
        if (validEducations.length === 0) return;
        
        const x = this.leftColumnX;
        const maxWidth = this.columnWidth;
        
        this.renderSectionTitleCompact('Education', x);
        
        for (const edu of validEducations) {
            this.pdf.setFontSize(10);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
            const degreeLines = this.wrapTextToWidth(edu.degree || 'Degree', maxWidth);
            this.pdf.text(degreeLines, x, this.currentY);
            this.currentY += degreeLines.length * (10 * 0.38) + 1;
            
            this.pdf.setFontSize(9);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
            const instLines = this.wrapTextToWidth(edu.institution || 'Institution', maxWidth);
            this.pdf.text(instLines, x, this.currentY);
            this.currentY += instLines.length * (9 * 0.38) + 1;
            
            this.pdf.setFontSize(8);
            this.pdf.setTextColor(this.colors.textLighter[0], this.colors.textLighter[1], this.colors.textLighter[2]);
            let detailsLine = edu.year || '';
            if (edu.grade) detailsLine += detailsLine ? ` | Grade: ${this.cleanText(edu.grade)}` : `Grade: ${this.cleanText(edu.grade)}`;
            if (detailsLine) {
                const detailLines = this.wrapTextToWidth(detailsLine, maxWidth);
                this.pdf.text(detailLines, x, this.currentY);
                this.currentY += detailLines.length * (8 * 0.38) + 2;
            }
            this.currentY += 3;
        }
        this.currentY += 2;
    }

    private renderSkillsCompact(): void {
        if (!this.params.skills || !this.params.skills.trim()) return;
        
        const x = this.rightColumnX;
        const maxWidth = this.columnWidth;
        
        this.renderSectionTitleCompact('Skills', x);
        
        const skillItems = this.parseSkillItems(this.params.skills);
        if (skillItems.length === 0) return;
        
        // Render as two-column skill matrix
        const col1: string[] = [];
        const col2: string[] = [];
        const half = Math.ceil(skillItems.length / 2);
        
        for (let i = 0; i < skillItems.length; i++) {
            if (i < half) {
                col1.push(skillItems[i]);
            } else {
                col2.push(skillItems[i]);
            }
        }
        
        const colWidth = (maxWidth - 4) / 2;
        const lineHeight = 9 * 0.38 + 1.5;
        const rows = Math.max(col1.length, col2.length);
        
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        
        for (let i = 0; i < rows; i++) {
            const yPos = this.currentY + (i * lineHeight);
            
            if (i < col1.length) {
                const skill = this.cleanText(col1[i]);
                const bulletX = x + 2;
                const textX = x + 5.5;
                this.pdf.text('•', bulletX, yPos);
                this.pdf.text(skill, textX, yPos);
            }
            
            if (i < col2.length) {
                const skill = this.cleanText(col2[i]);
                const col2X = x + colWidth + 2;
                const bulletX2 = col2X + 2;
                const textX2 = col2X + 5.5;
                this.pdf.text('•', bulletX2, yPos);
                this.pdf.text(skill, textX2, yPos);
            }
        }
        
        this.currentY += rows * lineHeight + 4;
    }

    private renderCertificationsCompact(): void {
        const validCerts = this.params.certifications.filter(c => c.name?.trim());
        if (validCerts.length === 0) return;
        
        const x = this.leftColumnX;
        const maxWidth = this.columnWidth;
        
        this.renderSectionTitleCompact('Certifications', x);
        
        this.pdf.setFontSize(8.5);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        
        for (const cert of validCerts) {
            let certText = this.cleanText(cert.name);
            if (cert.issuer) certText += ` - ${this.cleanText(cert.issuer)}`;
            if (cert.date) certText += ` (${this.cleanText(cert.date)})`;
            const certLines = this.wrapTextToWidth(certText, maxWidth);
            this.pdf.text(certLines, x, this.currentY);
            this.currentY += certLines.length * (8.5 * 0.38) + 2;
        }
        this.currentY += 2;
    }

    private renderLanguagesCompact(): void {
        const validLangs = this.params.languages.filter(l => l.language?.trim());
        if (validLangs.length === 0) return;
        
        const x = this.rightColumnX;
        const maxWidth = this.columnWidth;
        
        this.renderSectionTitleCompact('Languages', x);
        
        this.pdf.setFontSize(8.5);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        
        for (const lang of validLangs) {
            const langText = `${this.cleanText(lang.language)}: ${lang.proficiency || ''}`;
            const bulletX = x + 2;
            const textX = x + 5.5;
            const wrappedLines = this.pdf.splitTextToSize(langText, maxWidth - 5.5);
            
            for (let i = 0; i < wrappedLines.length; i++) {
                const lineY = this.currentY;
                const lineHeight = 8.5 * 0.38 + 1;
                
                if (i === 0) {
                    this.pdf.text('•', bulletX, lineY);
                    this.pdf.text(wrappedLines[i], textX, lineY);
                } else {
                    this.pdf.text(wrappedLines[i], textX, lineY);
                }
                this.currentY += lineHeight;
            }
        }
        this.currentY += 2;
    }

    private renderAchievementsCompact(): void {
        const validAchievements = this.params.achievements.filter(a => a.title?.trim());
        if (validAchievements.length === 0) return;
        
        const x = this.marginX;
        this.renderSectionTitle('Achievements');
        
        for (const ach of validAchievements) {
            this.pdf.setFontSize(9.5);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
            let titleText = this.cleanText(ach.title);
            if (ach.date) titleText += ` (${this.cleanText(ach.date)})`;
            const titleLines = this.wrapTextToWidth(titleText, this.maxLineWidth);
            this.pdf.text(titleLines, x, this.currentY);
            this.currentY += titleLines.length * (9.5 * 0.38) + 2;
            
            if (ach.description) {
                this.pdf.setFontSize(8.5);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
                
                const descLines = ach.description.split('\n').filter(l => l.trim());
                for (const line of descLines) {
                    const cleaned = this.cleanText(line).replace(/^[•\-*✓✅]\s*/, '');
                    const bulletX = x + 4;
                    const textX = x + 7.5;
                    const wrappedLines = this.pdf.splitTextToSize(cleaned, this.maxLineWidth - 7.5);
                    
                    for (let i = 0; i < wrappedLines.length; i++) {
                        const lineY = this.currentY;
                        const lineHeight = 8.5 * 0.38 + 1;
                        
                        if (this.currentY + lineHeight > this.pageBottom) {
                            this.addPageSpace(15);
                        }
                        
                        if (i === 0) {
                            this.pdf.text('•', bulletX, lineY);
                            this.pdf.text(wrappedLines[i], textX, lineY);
                        } else {
                            this.pdf.text(wrappedLines[i], textX, lineY);
                        }
                        this.currentY += lineHeight;
                    }
                }
            }
            this.currentY += 4;
        }
    }

    protected renderFooter(): void {
        this.pdf.setFontSize(this.theme.footerFontSize);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.textLighter[0], this.colors.textLighter[1], this.colors.textLighter[2]);
        
        const footerText = `Page 1 of 1`;
        const footerWidth = this.pdf.getTextWidth(footerText);
        const footerY = this.pageHeight - this.footerSafeZone + 6;
        this.pdf.text(footerText, this.pageWidth - this.marginX - footerWidth, footerY);
    }
}

export const generateClassicPDF = async (params: PDFParams): Promise<Blob> => {
    const generator = new ClassicPDFGenerator(params);
    return generator.generate();
};