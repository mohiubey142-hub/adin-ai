// utils/pdf/minimalPdf.ts
import { PDFGeneratorBase, ThemeConfig } from './basePdf';
import { PDFParams } from '../../types/cvTypes';
import { getFullPhoneNumber } from '../phoneValidation';

const MINIMAL_THEME: ThemeConfig = {
    name: 'minimal',
    colors: {
        primary: [40, 40, 45],
        secondary: [60, 60, 65],
        accent: [80, 80, 85],
        text: [25, 25, 30],
        textLight: [70, 70, 75],
        textLighter: [160, 160, 165],
        background: [255, 255, 255],
        border: [215, 215, 220],
        divider: [195, 195, 200],
        tagBg: [245, 245, 245],
        tagBorder: [215, 215, 220],
        link: [40, 40, 45],
    },
    headerFontSize: 28,
    sectionTitleFontSize: 13,
    nameFontSize: 22,
    jobTitleFontSize: 13,
    contactFontSize: 9,
    socialFontSize: 8,
    bodyFontSize: 10.5,
    bulletFontSize: 10,
    tagFontSize: 9,
    footerFontSize: 7.5,
    headerSpacing: 6,
    sectionSpacing: 6,
    bulletIndent: 6,
    tagPadding: 7,
    tagSpacing: 5,
    tagHeight: 8,
    lineWidth: 0.6,
    dividerLineWidth: 0.3,
    photoBorderWidth: 1,
    roundedRectRadius: 1,
    useUppercaseHeaders: false,
    useDividerLines: true,
    useTagBackgrounds: false,
    usePhotoBorder: false,
    useTwoColumnLayout: false,
};

class MinimalPDFGenerator extends PDFGeneratorBase {
    private params: PDFParams;
    private fullPhone: string;
    private timelineActive: boolean = false;
    private entryStartY: number = 0;
    private isFirstEntry: boolean = true;

    constructor(params: PDFParams) {
        super(MINIMAL_THEME);
        this.params = params;
        this.fullPhone = getFullPhoneNumber(params.phoneNumber, params.selectedCountryCode);
        this.personalInfo = params.personalInfo;
        this.marginX = 20;
        this.marginY = 18;
        this.currentY = this.marginY;
        this.maxLineWidth = this.pageWidth - (this.marginX * 2);
        this.bottomSafeZone = 22;
        this.footerSafeZone = 20;
    }

    async generate(): Promise<Blob> {
        // ✅ FIXED: Adjusted vertical offset - moved content up by ~2.5mm (7.5 points)
        // This shifts the ENTIRE printable content upward, reducing whitespace at top
        const VERTICAL_OFFSET = -7.5; // ~2.5mm at 72dpi (3 points per mm)
        
        // Apply offset to current Y position
        this.currentY += VERTICAL_OFFSET;
        
        await this.renderHeader();
        await this.renderContent();
        this.renderFooter();
        return this.pdf.output('blob');
    }

    protected renderSectionTitle(title: string): void {
        this.currentSectionName = title;
        this.timelineActive = false;
        this.isFirstEntry = true;
        
        if (this.getRemainingSpace() < 25) {
            this.addNewPage(title);
        }
        
        this.currentY += 4;
        
        const displayTitle = this.theme.useUppercaseHeaders ? this.cleanText(title).toUpperCase() : this.cleanText(title);
        this.pdf.setFontSize(this.theme.sectionTitleFontSize);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        this.pdf.text(displayTitle, this.marginX, this.currentY);
        
        this.currentY += 5;
        
        this.pdf.setDrawColor(this.colors.divider[0], this.colors.divider[1], this.colors.divider[2]);
        this.pdf.setLineWidth(0.3);
        this.pdf.line(this.marginX, this.currentY, this.pageWidth - this.marginX, this.currentY);
        
        this.currentY += 5.5;
        
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        this.pdf.setFont('helvetica', 'normal');
    }

    // ✅ FIXED: Name font size 22, Name moved 0.5 unit down (with photo)
    private async renderHeader(): Promise<void> {
        const { personalInfo, profilePhoto } = this.params;
        const photoSize = 24;

        if (profilePhoto && profilePhoto.startsWith('data:image')) {
            try {
                const circularImage = await this.makeCircularImage(profilePhoto);
                const imgX = this.marginX;
                const imgY = this.currentY;
                
                this.pdf.addImage(circularImage, 'PNG', imgX, imgY, photoSize, photoSize);
                
                const nameX = this.marginX + photoSize + 8;
                const nameMaxWidth = this.pageWidth - nameX - this.marginX;
                
                const nameFontSize = this.theme.nameFontSize;
                const titleFontSize = this.theme.jobTitleFontSize;
                
                // ✅ FIXED: Name moved 0.5 unit down (was imgY + 10.5, now imgY + 11)
                const nameY = imgY + 11;
                
                this.pdf.setFontSize(nameFontSize);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
                const name = this.cleanText(personalInfo.name.toUpperCase() || 'YOUR NAME');
                const nameLines = this.pdf.splitTextToSize(name, nameMaxWidth);
                this.pdf.text(nameLines, nameX, nameY);
                
                // Title Y - tight gap
                const nameHeight = nameLines.length * (nameFontSize * 0.35);
                const titleY = nameY + nameHeight + 0.5;
                
                this.pdf.setFontSize(titleFontSize);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
                const jobTitle = this.cleanText(personalInfo.title || 'JOB TITLE');
                const jobTitleLines = this.pdf.splitTextToSize(jobTitle, nameMaxWidth);
                this.pdf.text(jobTitleLines, nameX, titleY);
                
                this.currentY = imgY + photoSize + 8;
                
                // Contacts
                this.pdf.setFontSize(this.theme.contactFontSize);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
                const contacts: string[] = [];
                if (personalInfo.email) contacts.push(this.cleanText(personalInfo.email));
                if (this.fullPhone) contacts.push(this.cleanText(this.fullPhone));
                if (personalInfo.address) contacts.push(this.cleanText(personalInfo.address));
                if (personalInfo.linkedin) contacts.push(`LinkedIn: ${this.cleanText(personalInfo.linkedin)}`);
                if (personalInfo.github) contacts.push(`GitHub: ${this.cleanText(personalInfo.github)}`);
                if (personalInfo.portfolio) contacts.push(`Portfolio: ${this.cleanText(personalInfo.portfolio)}`);
                const contactLine = contacts.join('  |  ');
                const contactLines = this.pdf.splitTextToSize(contactLine, this.maxLineWidth);
                const contactLineHeight = 5.8;
                for (let i = 0; i < contactLines.length; i++) {
                    this.pdf.text(
                        contactLines[i],
                        this.marginX,
                        this.currentY + (i * contactLineHeight)
                    );
                }
                this.currentY += (contactLines.length * contactLineHeight) + 4;
                
                this.pdf.setDrawColor(this.colors.divider[0], this.colors.divider[1], this.colors.divider[2]);
                this.pdf.setLineWidth(0.3);
                this.pdf.line(this.marginX, this.currentY, this.pageWidth - this.marginX, this.currentY);
                this.currentY += 8;
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
            } catch (err) {
                console.error('Failed to add circular profile image to PDF:', err);
                this.renderHeaderNoPhoto();
            }
        } else {
            this.renderHeaderNoPhoto();
        }
    }

    // ✅ FIXED: Name font size 22, Name moved 0.5 unit down (no photo)
    private renderHeaderNoPhoto(): void {
        const { personalInfo } = this.params;
        
        const nameFontSize = this.theme.nameFontSize;
        const titleFontSize = this.theme.jobTitleFontSize;
        
        // ✅ FIXED: Name moved 0.5 unit down (was currentY + 4.5, now currentY + 5)
        const nameY = this.currentY + 5;
        
        this.pdf.setFontSize(nameFontSize);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
        const name = this.cleanText(personalInfo.name.toUpperCase() || 'YOUR NAME');
        const nameLines = this.pdf.splitTextToSize(name, this.maxLineWidth);
        this.pdf.text(nameLines, this.marginX, nameY);
        
        // Title Y - tight gap
        const nameHeight = nameLines.length * (nameFontSize * 0.35);
        const titleY = nameY + nameHeight + 0.5;
        
        this.pdf.setFontSize(titleFontSize);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
        const jobTitle = this.cleanText(personalInfo.title || 'JOB TITLE');
        const jobTitleLines = this.pdf.splitTextToSize(jobTitle, this.maxLineWidth);
        this.pdf.text(jobTitleLines, this.marginX, titleY);
        
        this.currentY = titleY + (jobTitleLines.length * (titleFontSize * 0.35)) + 5;
        
        this.pdf.setFontSize(this.theme.contactFontSize);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
        const contacts: string[] = [];
        if (personalInfo.email) contacts.push(this.cleanText(personalInfo.email));
        if (this.fullPhone) contacts.push(this.cleanText(this.fullPhone));
        if (personalInfo.address) contacts.push(this.cleanText(personalInfo.address));
        if (personalInfo.linkedin) contacts.push(`LinkedIn: ${this.cleanText(personalInfo.linkedin)}`);
        if (personalInfo.github) contacts.push(`GitHub: ${this.cleanText(personalInfo.github)}`);
        if (personalInfo.portfolio) contacts.push(`Portfolio: ${this.cleanText(personalInfo.portfolio)}`);
        const contactLine = contacts.join('  |  ');
        const contactLines = this.pdf.splitTextToSize(contactLine, this.maxLineWidth);
        const contactLineHeight = 5.8;
        for (let i = 0; i < contactLines.length; i++) {
            this.pdf.text(
                contactLines[i],
                this.marginX,
                this.currentY + (i * contactLineHeight)
            );
        }
        this.currentY += (contactLines.length * contactLineHeight) + 4;
        
        this.pdf.setDrawColor(this.colors.divider[0], this.colors.divider[1], this.colors.divider[2]);
        this.pdf.setLineWidth(0.3);
        this.pdf.line(this.marginX, this.currentY, this.pageWidth - this.marginX, this.currentY);
        this.currentY += 8;
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
    }

    private renderTimelineEntry(
        title: string,
        subtitle: string,
        dateRange: string,
        description: string = ''
    ): void {
        this.timelineActive = true;
        
        const startY = this.currentY;
        
        let estimatedHeight = 10;
        estimatedHeight += this.getTextHeight(title, this.maxLineWidth - 12, 11.5, true);
        estimatedHeight += 2;
        estimatedHeight += this.getTextHeight(subtitle, this.maxLineWidth - 12, 10, false);
        estimatedHeight += 2;
        estimatedHeight += this.getTextHeight(dateRange, this.maxLineWidth - 12, 9, false);
        estimatedHeight += 5;
        
        if (description) {
            const descLines = description.split('\n').filter(l => l.trim());
            for (const line of descLines) {
                let cleanedLine = this.cleanText(line.trim());
                cleanedLine = cleanedLine.replace(/^[•\-*✓✅]\s*/, '');
                estimatedHeight += this.getTextHeight(cleanedLine, this.maxLineWidth - 14, this.theme.bulletFontSize, false) + 1;
            }
            estimatedHeight += 3;
        }
        estimatedHeight += 6;

        if (!this.canFitBlock(estimatedHeight + 10)) {
            this.addNewPage(this.currentSectionName);
            this.entryStartY = this.currentY;
        } else {
            this.entryStartY = startY;
        }

        this.pdf.setFontSize(11.5);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        const titleLines = this.pdf.splitTextToSize(title, this.maxLineWidth - 12);
        this.pdf.text(titleLines, this.marginX + 10, this.currentY);
        this.currentY += titleLines.length * (11.5 * 0.38) + 2;
        
        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
        const subLines = this.pdf.splitTextToSize(subtitle, this.maxLineWidth - 12);
        this.pdf.text(subLines, this.marginX + 10, this.currentY);
        this.currentY += subLines.length * (10 * 0.38) + 2;
        
        this.pdf.setFontSize(9);
        this.pdf.setTextColor(this.colors.textLighter[0], this.colors.textLighter[1], this.colors.textLighter[2]);
        this.pdf.text(dateRange, this.marginX + 10, this.currentY);
        this.currentY += 5;
        
        const lineX = this.marginX + 3;
        this.pdf.setDrawColor(this.colors.divider[0], this.colors.divider[1], this.colors.divider[2]);
        this.pdf.setLineWidth(0.4);
        
        if (description) {
            const descLines = description.split('\n').filter(l => l.trim());
            this.pdf.setFontSize(this.theme.bulletFontSize);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
            
            const bulletX = this.marginX + 6;
            const textX = bulletX + 4;
            const maxWidth = this.pageWidth - textX - this.marginX;
            
            for (let i = 0; i < descLines.length; i++) {
                const line = descLines[i];
                let cleanedLine = this.cleanText(line.trim());
                cleanedLine = cleanedLine.replace(/^[•\-*✓✅]\s*/, '');
                const wrappedLines = this.pdf.splitTextToSize(cleanedLine, maxWidth);
                
                this.pdf.setFontSize(this.theme.bulletFontSize);
                this.pdf.setTextColor(this.colors.accent[0], this.colors.accent[1], this.colors.accent[2]);
                this.pdf.text('•', bulletX, this.currentY + 0.5);
                
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                this.pdf.text(wrappedLines, textX, this.currentY);
                
                this.currentY += wrappedLines.length * (this.theme.bulletFontSize * 0.38) + (wrappedLines.length - 1) * 0.3 + 1;
                
                if (i === descLines.length - 1) {
                    const endY = this.currentY - 2;
                    if (endY > this.entryStartY) {
                        this.pdf.line(lineX, this.entryStartY, lineX, endY);
                    }
                }
            }
            this.currentY += 2;
        } else {
            const endY = this.currentY - 2;
            if (endY > this.entryStartY) {
                this.pdf.line(lineX, this.entryStartY, lineX, endY);
            }
        }
        
        this.currentY += 4;
    }

    private async renderContent(): Promise<void> {
        const { professionalSummary, experiences, educations, projects, certifications, languages, achievements, skills } = this.params;

        if (professionalSummary) {
            this.renderSectionTitle('PROFILE');
            this.pdf.setFontSize(this.theme.bodyFontSize);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
            const summaryLines = this.pdf.splitTextToSize(
                this.cleanText(professionalSummary),
                this.maxLineWidth
            );
            this.pdf.text(summaryLines, this.marginX, this.currentY);
            this.currentY += summaryLines.length * (this.theme.bodyFontSize * 0.38) + this.theme.sectionSpacing + 2;
        }

        const validExperiences = experiences.filter(e => e.title?.trim() || e.company?.trim());
        if (validExperiences.length > 0) {
            if (this.getRemainingSpace() < 35) {
                this.addNewPage('EXPERIENCE');
            }
            this.renderSectionTitle('EXPERIENCE');
            
            for (let i = 0; i < validExperiences.length; i++) {
                const exp = validExperiences[i];
                if (this.getRemainingSpace() < 20) {
                    this.addNewPage('EXPERIENCE');
                }
                this.renderTimelineEntry(
                    this.cleanText(exp.title || 'Position'),
                    this.cleanText(exp.company || 'Company'),
                    this.formatDateRange(exp.startDate, exp.endDate),
                    exp.description || ''
                );
            }
            this.timelineActive = false;
            this.currentY += 2;
        }

        const validEducations = educations.filter(e => e.degree?.trim() || e.institution?.trim());
        if (validEducations.length > 0) {
            if (this.getRemainingSpace() < 35) {
                this.addNewPage('EDUCATION');
            }
            this.renderSectionTitle('EDUCATION');
            
            for (let i = 0; i < validEducations.length; i++) {
                const edu = validEducations[i];
                if (this.getRemainingSpace() < 15) {
                    this.addNewPage('EDUCATION');
                }
                
                this.pdf.setFontSize(11.5);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                const degreeLines = this.pdf.splitTextToSize(this.cleanText(edu.degree || 'Degree'), this.maxLineWidth);
                this.pdf.text(degreeLines, this.marginX, this.currentY);
                this.currentY += degreeLines.length * (11.5 * 0.38) + 2;
                
                this.pdf.setFontSize(10);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
                const instLines = this.pdf.splitTextToSize(this.cleanText(edu.institution || 'Institution'), this.maxLineWidth);
                this.pdf.text(instLines, this.marginX, this.currentY);
                this.currentY += instLines.length * (10 * 0.38) + 2;
                
                this.pdf.setFontSize(9);
                this.pdf.setTextColor(this.colors.textLighter[0], this.colors.textLighter[1], this.colors.textLighter[2]);
                const eduYear = edu.year || '';
                const detailsLine = eduYear + (edu.grade ? ` | Grade: ${this.cleanText(edu.grade)}` : '');
                this.pdf.text(detailsLine, this.marginX, this.currentY);
                this.currentY += 4;
                
                this.currentY += 4;
            }
            this.currentY += 2;
        }

        const validProjects = projects.filter(p => p.name?.trim());
        if (validProjects.length > 0) {
            if (this.getRemainingSpace() < 35) {
                this.addNewPage('PROJECTS');
            }
            this.renderSectionTitle('PROJECTS');
            
            for (let i = 0; i < validProjects.length; i++) {
                const proj = validProjects[i];
                if (this.getRemainingSpace() < 20) {
                    this.addNewPage('PROJECTS');
                }
                
                const projTitle = this.cleanText(proj.name) + (proj.tech ? ` (${this.cleanText(proj.tech)})` : '');
                
                this.pdf.setFontSize(11.5);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                const titleLines = this.pdf.splitTextToSize(projTitle, this.maxLineWidth);
                this.pdf.text(titleLines, this.marginX, this.currentY);
                this.currentY += titleLines.length * (11.5 * 0.38) + 2;
                
                if (proj.description) {
                    this.pdf.setFontSize(this.theme.bulletFontSize);
                    this.pdf.setFont('helvetica', 'normal');
                    this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                    const descLines = proj.description.split('\n').filter(l => l.trim());
                    
                    const bulletX = this.marginX + 2;
                    const textX = bulletX + 4;
                    const maxWidth = this.pageWidth - textX - this.marginX;
                    
                    for (const line of descLines) {
                        let cleanedLine = this.cleanText(line.trim());
                        cleanedLine = cleanedLine.replace(/^[•\-*✓✅]\s*/, '');
                        const wrappedLines = this.pdf.splitTextToSize(cleanedLine, maxWidth);
                        
                        this.pdf.setTextColor(this.colors.accent[0], this.colors.accent[1], this.colors.accent[2]);
                        this.pdf.text('•', bulletX, this.currentY + 0.5);
                        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                        this.pdf.text(wrappedLines, textX, this.currentY);
                        this.currentY += wrappedLines.length * (this.theme.bulletFontSize * 0.38) + (wrappedLines.length - 1) * 0.3 + 1;
                    }
                    this.currentY += 2;
                }
                
                if (proj.github) {
                    this.pdf.setFontSize(this.theme.socialFontSize);
                    this.pdf.setTextColor(this.colors.link[0], this.colors.link[1], this.colors.link[2]);
                    this.pdf.text(`GitHub: ${this.cleanText(proj.github)}`, this.marginX + 6, this.currentY);
                    this.currentY += 5;
                }
                
                this.currentY += 4;
            }
            this.currentY += 2;
        }

        if (skills && skills.trim()) {
            if (this.getRemainingSpace() < 25) {
                this.addNewPage('SKILLS');
            }
            this.renderSectionTitle('SKILLS');
            
            const skillItems = skills.includes(',') 
                ? skills.split(',').map(s => s.trim()).filter(s => s)
                : skills.split('\n').map(s => s.trim().replace(/^[•\-*]\s*/, '')).filter(s => s);
            
            if (skillItems.length > 0) {
                let skillLine = '';
                let lineY = this.currentY;
                
                this.pdf.setFontSize(this.theme.bulletFontSize);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                
                for (let i = 0; i < skillItems.length; i++) {
                    const skill = skillItems[i];
                    const skillText = this.cleanText(skill);
                    const separator = i > 0 ? ' • ' : '';
                    const testText = skillLine + separator + skillText;
                    const textWidth = this.pdf.getTextWidth(testText);
                    
                    if (textWidth > this.maxLineWidth) {
                        this.pdf.text(skillLine, this.marginX, lineY);
                        lineY += 6;
                        skillLine = skillText;
                    } else {
                        skillLine = testText;
                    }
                }
                
                if (skillLine) {
                    this.pdf.text(skillLine, this.marginX, lineY);
                    lineY += 6;
                }
                
                this.currentY = lineY + 4;
            }
        }

        const validLangs = languages.filter(l => l.language?.trim());
        if (validLangs.length > 0) {
            if (this.getRemainingSpace() < 25) {
                this.addNewPage('LANGUAGES');
            }
            this.renderSectionTitle('LANGUAGES');
            
            this.pdf.setFontSize(this.theme.bulletFontSize);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
            
            for (let i = 0; i < validLangs.length; i++) {
                const lang = validLangs[i];
                const langText = `${this.cleanText(lang.language)}${lang.proficiency ? `: ${lang.proficiency}` : ''}`;
                const langLines = this.pdf.splitTextToSize(langText, this.maxLineWidth);
                this.pdf.text(langLines, this.marginX, this.currentY);
                this.currentY += langLines.length * (this.theme.bulletFontSize * 0.38) + 2;
            }
            
            this.currentY += 4;
        }

        const validCerts = certifications.filter(c => c.name?.trim());
        if (validCerts.length > 0) {
            if (this.getRemainingSpace() < 25) {
                this.addNewPage('CERTIFICATIONS');
            }
            this.renderSectionTitle('CERTIFICATIONS');
            
            for (let i = 0; i < validCerts.length; i++) {
                const cert = validCerts[i];
                if (this.getRemainingSpace() < 8) {
                    this.addNewPage('CERTIFICATIONS');
                }
                
                let certText = this.cleanText(cert.name);
                if (cert.issuer) certText += ` - ${this.cleanText(cert.issuer)}`;
                if (cert.date) certText += ` (${this.cleanText(cert.date)})`;
                
                this.pdf.setFontSize(this.theme.bulletFontSize);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                const certLines = this.pdf.splitTextToSize(certText, this.maxLineWidth - 6);
                this.pdf.text(certLines, this.marginX + 2, this.currentY);
                this.currentY += certLines.length * (this.theme.bulletFontSize * 0.38) + 2;
            }
            this.currentY += 2;
        }

        const validAchievements = achievements.filter(a => a.title?.trim());
        if (validAchievements.length > 0) {
            if (this.getRemainingSpace() < 35) {
                this.addNewPage('ACHIEVEMENTS');
            }
            this.renderSectionTitle('ACHIEVEMENTS');
            
            for (let i = 0; i < validAchievements.length; i++) {
                const ach = validAchievements[i];
                if (this.getRemainingSpace() < 20) {
                    this.addNewPage('ACHIEVEMENTS');
                }
                
                const achTitle = this.cleanText(ach.title);
                const achDate = ach.date ? this.cleanText(ach.date) : '';
                const titleText = achDate ? `${achTitle} (${achDate})` : achTitle;
                
                this.pdf.setFontSize(11.5);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                const titleLines = this.pdf.splitTextToSize(titleText, this.maxLineWidth);
                this.pdf.text(titleLines, this.marginX, this.currentY);
                this.currentY += titleLines.length * (11.5 * 0.38) + 2;
                
                if (ach.description) {
                    this.pdf.setFontSize(this.theme.bulletFontSize);
                    this.pdf.setFont('helvetica', 'normal');
                    this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                    const descLines = ach.description.split('\n').filter(l => l.trim());
                    
                    const bulletX = this.marginX + 2;
                    const textX = bulletX + 4;
                    const maxWidth = this.pageWidth - textX - this.marginX;
                    
                    for (const line of descLines) {
                        let cleanedLine = this.cleanText(line.trim());
                        cleanedLine = cleanedLine.replace(/^[•\-*✓✅]\s*/, '');
                        const wrappedLines = this.pdf.splitTextToSize(cleanedLine, maxWidth);
                        
                        this.pdf.setTextColor(this.colors.accent[0], this.colors.accent[1], this.colors.accent[2]);
                        this.pdf.text('•', bulletX, this.currentY + 0.5);
                        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                        this.pdf.text(wrappedLines, textX, this.currentY);
                        this.currentY += wrappedLines.length * (this.theme.bulletFontSize * 0.38) + (wrappedLines.length - 1) * 0.3 + 1;
                    }
                    this.currentY += 2;
                }
                
                this.currentY += 4;
            }
        }
    }
}

export const generateMinimalPDF = async (params: PDFParams): Promise<Blob> => {
    const generator = new MinimalPDFGenerator(params);
    return generator.generate();
};