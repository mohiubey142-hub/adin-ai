// utils/pdf/modernPdf.ts
import { PDFGeneratorBase, ThemeConfig } from './basePdf';
import { PDFParams } from '../../types/cvTypes';
import { getFullPhoneNumber } from '../phoneValidation';

const MODERN_THEME: ThemeConfig = {
    name: 'modern',
    colors: {
        primary: [88, 70, 200],
        secondary: [108, 92, 231],
        accent: [130, 100, 240],
        text: [30, 30, 50],
        textLight: [80, 80, 100],
        textLighter: [150, 150, 170],
        background: [255, 255, 255],
        border: [220, 215, 235],
        divider: [200, 195, 215],
        tagBg: [232, 228, 248],
        tagBorder: [180, 170, 220],
        link: [88, 70, 200],
    },
    headerFontSize: 27,
    sectionTitleFontSize: 14,
    nameFontSize: 24,
    jobTitleFontSize: 13.5,
    contactFontSize: 8.5,
    socialFontSize: 7.5,
    bodyFontSize: 10,
    bulletFontSize: 9.5,
    tagFontSize: 9.5,
    footerFontSize: 7,
    headerSpacing: 6,
    sectionSpacing: 7,
    bulletIndent: 5,
    tagPadding: 10,
    tagSpacing: 6,
    tagHeight: 18,
    lineWidth: 0.8,
    dividerLineWidth: 0.5,
    photoBorderWidth: 1.5,
    roundedRectRadius: 3.5,
    useUppercaseHeaders: true,
    useDividerLines: true,
    useTagBackgrounds: true,
    usePhotoBorder: true,
    useTwoColumnLayout: false,
};

class ModernPDFGenerator extends PDFGeneratorBase {
    private params: PDFParams;
    private fullPhone: string;
    private FOOTER_SAFE_AREA: number = 3;
    private MIN_LINES_AFTER_HEADING: number = 2;

    constructor(params: PDFParams) {
        super(MODERN_THEME);
        this.params = params;
        this.fullPhone = getFullPhoneNumber(params.phoneNumber, params.selectedCountryCode);
        this.personalInfo = params.personalInfo;
    }

    async generate(): Promise<Blob> {
        const VERTICAL_OFFSET = -7.5;
        this.currentY += VERTICAL_OFFSET;
        
        await this.renderHeader();
        await this.renderContent();
        this.renderFooter();
        return this.pdf.output('blob');
    }

    private getAvailableHeight(): number {
        return this.pageHeight - this.marginY - this.FOOTER_SAFE_AREA;
    }

    private canFit(height: number): boolean {
        return this.currentY + height <= this.getAvailableHeight();
    }

    private canFitHeadingWithMinContent(headingHeight: number, minContentHeight: number): boolean {
        const totalNeeded = headingHeight + minContentHeight;
        return this.currentY + totalNeeded <= this.getAvailableHeight();
    }

    private calculateMinContentAfterHeading(descLines: string[], isBullet: boolean = true): number {
        let minHeight = 0;
        let lineCount = 0;
        
        for (const line of descLines) {
            if (lineCount >= this.MIN_LINES_AFTER_HEADING) break;
            let cleanedLine = this.cleanText(line.trim());
            if (isBullet) {
                cleanedLine = cleanedLine.replace(/^[•\-*✓✅]\s*/, '');
                const maxWidth = this.maxLineWidth - 7.5;
                const wrappedLines = this.pdf.splitTextToSize(cleanedLine, maxWidth);
                minHeight += wrappedLines.length * (this.theme.bulletFontSize * 0.38 + 1.5);
            } else {
                const maxWidth = this.maxLineWidth;
                const wrappedLines = this.pdf.splitTextToSize(cleanedLine, maxWidth);
                minHeight += wrappedLines.length * (this.theme.bodyFontSize * 0.38 + 1.5);
            }
            lineCount++;
        }
        
        return minHeight + 2;
    }

    // ✅ Helper to get label for contact type
    private getContactLabel(type: string): string {
        const labels: Record<string, string> = {
            email: 'Email:',
            phone: 'Phone:',
            address: 'Address:',
            linkedin: 'LinkedIn:',
            github: 'GitHub:',
            portfolio: 'Portfolio:'
        };
        return labels[type] || '';
    }

    // ✅ Render header with contact labels
    private async renderHeader(): Promise<void> {
        const { personalInfo, profilePhoto } = this.params;
        const photoSize = 28;
        let headerHandled = false;

        if (profilePhoto && profilePhoto.startsWith('data:image')) {
            try {
                const circularImage = await this.makeCircularImage(profilePhoto);
                const imgX = this.marginX;
                const imgY = this.currentY;
                
                this.pdf.addImage(circularImage, 'PNG', imgX, imgY, photoSize, photoSize);
                
                const nameX = this.marginX + photoSize + 9;
                const nameMaxWidth = this.pageWidth - nameX - this.marginX;
                
                const nameFontSize = this.theme.nameFontSize;
                const titleFontSize = this.theme.jobTitleFontSize;
                
                const nameY = imgY + 13.5;
                
                this.pdf.setFontSize(nameFontSize);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.setTextColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
                const name = this.cleanText(personalInfo.name.toUpperCase() || 'YOUR NAME');
                const nameLines = this.pdf.splitTextToSize(name, nameMaxWidth);
                this.pdf.text(nameLines, nameX, nameY);
                
                const nameHeight = nameLines.length * (nameFontSize * 0.35);
                // ✅ FIXED: Title 0.5 units up (removed +0.5)
                const titleY = nameY + nameHeight;
                
                this.pdf.setFontSize(titleFontSize);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
                const jobTitle = this.cleanText(personalInfo.title || 'JOB TITLE');
                const jobTitleLines = this.pdf.splitTextToSize(jobTitle, nameMaxWidth);
                this.pdf.text(jobTitleLines, nameX, titleY);
                
                this.currentY = imgY + photoSize + 6;
                
                // ✅ Build contact items with labels
                const contactItems: string[] = [];
                if (personalInfo.email) contactItems.push(`Email: ${this.cleanText(personalInfo.email)}`);
                if (this.fullPhone) contactItems.push(`Phone: ${this.cleanText(this.fullPhone)}`);
                if (personalInfo.address) contactItems.push(`Address: ${this.cleanText(personalInfo.address)}`);
                if (personalInfo.linkedin) contactItems.push(`LinkedIn: ${this.cleanText(personalInfo.linkedin)}`);
                if (personalInfo.github) contactItems.push(`GitHub: ${this.cleanText(personalInfo.github)}`);
                if (personalInfo.portfolio) contactItems.push(`Portfolio: ${this.cleanText(personalInfo.portfolio)}`);
                
                const contactLine = contactItems.join('  |  ');
                
                this.pdf.setFontSize(this.theme.contactFontSize);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
                
                const contactLines = this.pdf.splitTextToSize(contactLine, this.maxLineWidth);
                const contactLineHeight = 5.8;
                
                for (let i = 0; i < contactLines.length; i++) {
                    this.pdf.text(contactLines[i], this.marginX, this.currentY + (i * contactLineHeight));
                }
                this.currentY += (contactLines.length * contactLineHeight) + 4;
                
                this.pdf.setDrawColor(this.colors.divider[0], this.colors.divider[1], this.colors.divider[2]);
                this.pdf.setLineWidth(this.theme.dividerLineWidth);
                this.pdf.line(this.marginX, this.currentY, this.pageWidth - this.marginX, this.currentY);
                this.currentY += 6;
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                headerHandled = true;
            } catch (err) {
                console.error('Failed to add circular profile image to PDF:', err);
                headerHandled = false;
            }
        }

        if (!headerHandled) {
            const headerHeight = 10 + 10 + 8 + 8 + 8;
            if (this.currentY + headerHeight > this.getAvailableHeight()) {
                this.addNewPage('');
            }
            
            const nameFontSize = this.theme.nameFontSize;
            const titleFontSize = this.theme.jobTitleFontSize;
            
            // ✅ FIXED: Name 3 units down (was this.currentY, now this.currentY + 3)
            const nameY = this.currentY + 3;
            
            this.pdf.setFontSize(nameFontSize);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
            const name = this.cleanText(personalInfo.name.toUpperCase() || 'YOUR NAME');
            const nameLines = this.pdf.splitTextToSize(name, this.maxLineWidth);
            this.pdf.text(nameLines, this.marginX, nameY);
            
            const nameHeight = nameLines.length * (nameFontSize * 0.38);
            // ✅ FIXED: Title 0.5 units up (removed +1.5, now +1.0)
            const titleY = nameY + nameHeight + 1.0;
            
            this.pdf.setFontSize(titleFontSize);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
            const jobTitle = this.cleanText(personalInfo.title || 'JOB TITLE');
            const jobTitleLines = this.pdf.splitTextToSize(jobTitle, this.maxLineWidth);
            this.pdf.text(jobTitleLines, this.marginX, titleY);
            
            this.currentY = titleY + (jobTitleLines.length * (titleFontSize * 0.38)) + 2;
            
            // ✅ Build contact items with labels
            const contactItems: string[] = [];
            if (personalInfo.email) contactItems.push(`Email: ${this.cleanText(personalInfo.email)}`);
            if (this.fullPhone) contactItems.push(`Phone: ${this.cleanText(this.fullPhone)}`);
            if (personalInfo.address) contactItems.push(`Address: ${this.cleanText(personalInfo.address)}`);
            if (personalInfo.linkedin) contactItems.push(`LinkedIn: ${this.cleanText(personalInfo.linkedin)}`);
            if (personalInfo.github) contactItems.push(`GitHub: ${this.cleanText(personalInfo.github)}`);
            if (personalInfo.portfolio) contactItems.push(`Portfolio: ${this.cleanText(personalInfo.portfolio)}`);
            
            const contactLine = contactItems.join('  |  ');
            
            this.pdf.setFontSize(this.theme.contactFontSize);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
            
            const contactLines = this.pdf.splitTextToSize(contactLine, this.maxLineWidth);
            const contactLineHeight = 5.8;
            
            for (let i = 0; i < contactLines.length; i++) {
                this.pdf.text(contactLines[i], this.marginX, this.currentY + (i * contactLineHeight));
            }
            this.currentY += (contactLines.length * contactLineHeight) + 4;
            
            this.pdf.setDrawColor(this.colors.divider[0], this.colors.divider[1], this.colors.divider[2]);
            this.pdf.setLineWidth(this.theme.dividerLineWidth);
            this.pdf.line(this.marginX, this.currentY, this.pageWidth - this.marginX, this.currentY);
            this.currentY += 6;
            this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        }
    }

    private renderBulletPoint(text: string): void {
        const bulletX = this.marginX + 2;
        const textX = this.marginX + 5.5;
        const maxWidth = this.maxLineWidth - 7.5;
        
        this.pdf.setFontSize(this.theme.bulletFontSize);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
        
        const bulletSymbol = '•';
        const wrappedLines = this.pdf.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < wrappedLines.length; i++) {
            const line = wrappedLines[i];
            const lineY = this.currentY;
            const lineHeight = this.theme.bulletFontSize * 0.38 + 1.5;
            
            if (!this.canFit(lineHeight)) {
                this.addNewPage('');
            }
            
            if (i === 0) {
                this.pdf.text(bulletSymbol, bulletX, lineY);
                this.pdf.text(line, textX, lineY);
            } else {
                this.pdf.text(line, textX, lineY);
            }
            
            this.currentY += lineHeight;
        }
    }

    private renderRemainingBullets(bulletLines: string[], startIndex: number): void {
        for (let i = startIndex; i < bulletLines.length; i++) {
            this.renderBulletPoint(bulletLines[i]);
        }
    }

    private async renderContent(): Promise<void> {
        const { professionalSummary, experiences, educations, projects, certifications, languages, achievements, skills } = this.params;

        // ============================================================
        // PROFESSIONAL SUMMARY
        // ============================================================
        if (professionalSummary) {
            const headingHeight = 16;
            const minContentHeight = this.calculateMinContentAfterHeading([professionalSummary], false);
            
            if (!this.canFitHeadingWithMinContent(headingHeight, minContentHeight)) {
                this.addNewPage('');
            }
            
            this.renderSectionTitle('PROFESSIONAL SUMMARY');
            const summaryTextHeight = this.renderWrappedText(
                professionalSummary,
                this.marginX,
                this.currentY,
                this.maxLineWidth,
                this.theme.bodyFontSize,
                false
            );
            this.currentY += summaryTextHeight + this.theme.sectionSpacing;
        }

        // ============================================================
        // WORK EXPERIENCE
        // ============================================================
        const validExperiences = experiences.filter(e => e.title?.trim() || e.company?.trim());
        if (validExperiences.length > 0) {
            let headingRendered = false;
            
            for (let idx = 0; idx < validExperiences.length; idx++) {
                const exp = validExperiences[idx];
                
                const jobLine = `${this.cleanText(exp.title || 'Position')} | ${this.cleanText(exp.company || 'Company')}`;
                const dateRange = this.formatDateRange(exp.startDate, exp.endDate);
                const descLines = exp.description ? exp.description.split('\n').filter(l => l.trim()) : [];
                
                const bulletLines: string[] = [];
                for (const line of descLines) {
                    let cleanedLine = this.cleanText(line.trim());
                    cleanedLine = cleanedLine.replace(/^[•\-*✓✅]\s*/, '');
                    bulletLines.push(cleanedLine);
                }
                
                const jobLineHeight = this.getTextHeight(jobLine, this.maxLineWidth, 11.5, true);
                const dateHeight = this.getTextHeight(dateRange, this.maxLineWidth, 9, false);
                const headingHeight = 16;
                
                if (!headingRendered) {
                    const firstBulletLines = bulletLines.slice(0, this.MIN_LINES_AFTER_HEADING);
                    let minContentHeight = jobLineHeight + dateHeight + 4;
                    for (const line of firstBulletLines) {
                        minContentHeight += this.getTextHeight(line, this.maxLineWidth - 7.5, this.theme.bulletFontSize, false) + 1.5;
                    }
                    
                    if (!this.canFitHeadingWithMinContent(headingHeight, minContentHeight)) {
                        this.addNewPage('');
                    }
                    this.renderSectionTitle('WORK EXPERIENCE');
                    headingRendered = true;
                }
                
                const jobHeight = jobLineHeight + dateHeight + 4;
                if (!this.canFit(jobHeight)) {
                    this.addNewPage('');
                }
                
                this.pdf.setFontSize(11.5);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                const jobLines = this.pdf.splitTextToSize(jobLine, this.maxLineWidth);
                this.pdf.text(jobLines, this.marginX, this.currentY);
                this.currentY += jobLines.length * (11.5 * 0.38) + 1;
                
                this.pdf.setFontSize(9);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.textLighter[0], this.colors.textLighter[1], this.colors.textLighter[2]);
                this.pdf.text(dateRange, this.marginX, this.currentY);
                this.currentY += 4.5;
                
                if (bulletLines.length > 0) {
                    this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                    
                    for (let i = 0; i < bulletLines.length; i++) {
                        this.renderBulletPoint(bulletLines[i]);
                    }
                    this.currentY += 2;
                } else {
                    this.currentY += 2;
                }
                
                if (idx < validExperiences.length - 1) {
                    this.currentY += 3;
                }
            }
            this.currentY += this.theme.sectionSpacing;
        }

        // ============================================================
        // EDUCATION
        // ============================================================
        const validEducations = educations.filter(e => e.degree?.trim() || e.institution?.trim());
        if (validEducations.length > 0) {
            let headingRendered = false;
            
            for (let idx = 0; idx < validEducations.length; idx++) {
                const edu = validEducations[idx];
                
                const degreeHeight = this.getTextHeight(this.cleanText(edu.degree || 'Degree'), this.maxLineWidth, 11.5, true);
                const instHeight = this.getTextHeight(this.cleanText(edu.institution || 'Institution'), this.maxLineWidth, 10, false);
                const eduYear = edu.year || '';
                const detailsLine = eduYear + (edu.grade ? ` | Grade: ${this.cleanText(edu.grade)}` : '');
                const detailsHeight = this.getTextHeight(detailsLine, this.maxLineWidth, 8.5, false);
                const headingHeight = 16;
                
                if (!headingRendered) {
                    const minContentHeight = degreeHeight + instHeight + detailsHeight + 6;
                    if (!this.canFitHeadingWithMinContent(headingHeight, minContentHeight)) {
                        this.addNewPage('');
                    }
                    this.renderSectionTitle('EDUCATION');
                    headingRendered = true;
                }
                
                const totalHeight = degreeHeight + instHeight + detailsHeight + 6;
                if (!this.canFit(totalHeight)) {
                    this.addNewPage('');
                }
                
                this.pdf.setFontSize(11.5);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                const degreeLines = this.pdf.splitTextToSize(this.cleanText(edu.degree || 'Degree'), this.maxLineWidth);
                this.pdf.text(degreeLines, this.marginX, this.currentY);
                this.currentY += degreeLines.length * (11.5 * 0.38) + 1;
                
                this.pdf.setFontSize(10);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.secondary[0], this.colors.secondary[1], this.colors.secondary[2]);
                const instLines = this.pdf.splitTextToSize(this.cleanText(edu.institution || 'Institution'), this.maxLineWidth);
                this.pdf.text(instLines, this.marginX, this.currentY);
                this.currentY += instLines.length * (10 * 0.38) + 1;
                
                this.pdf.setFontSize(8.5);
                this.pdf.setTextColor(this.colors.textLighter[0], this.colors.textLighter[1], this.colors.textLighter[2]);
                const detailLines = this.pdf.splitTextToSize(detailsLine, this.maxLineWidth);
                this.pdf.text(detailLines, this.marginX, this.currentY);
                this.currentY += detailLines.length * (8.5 * 0.38) + 2;
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
            }
            this.currentY += this.theme.sectionSpacing;
        }

        // ============================================================
        // SKILLS
        // ============================================================
        let finalSkills = skills || this.params.skills || '';
        
        if (!finalSkills || !finalSkills.trim()) {
            const title = this.personalInfo?.title || '';
            let defaultSkills: string[] = [];
            
            if (title.toLowerCase().includes('teacher') || title.toLowerCase().includes('educator')) {
                defaultSkills = ['Teaching', 'Lesson Planning', 'Classroom Management', 'Student Assessment', 'Curriculum Development', 'Mentoring'];
            } else if (title.toLowerCase().includes('developer') || title.toLowerCase().includes('engineer')) {
                defaultSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git', 'REST APIs', 'Problem Solving'];
            } else if (title.toLowerCase().includes('designer')) {
                defaultSkills = ['Figma', 'UI/UX Design', 'Prototyping', 'Adobe Creative Suite', 'Visual Design'];
            } else if (title.toLowerCase().includes('marketing')) {
                defaultSkills = ['SEO', 'Content Strategy', 'Google Analytics', 'Social Media', 'Email Marketing'];
            } else {
                defaultSkills = ['Communication', 'Team Collaboration', 'Problem Solving', 'Time Management', 'Adaptability', 'Leadership'];
            }
            
            finalSkills = defaultSkills.join(', ');
        }
        
        if (finalSkills && finalSkills.trim()) {
            const headingHeight = 16;
            if (!this.canFitHeadingWithMinContent(headingHeight, 10)) {
                this.addNewPage('');
            }
            this.renderSectionTitle('SKILLS');
            
            let skillItems: string[] = [];
            
            if (finalSkills.includes(',')) {
                skillItems = finalSkills.split(',').map(s => s.trim()).filter(s => s);
            } else if (finalSkills.includes('\n')) {
                skillItems = finalSkills.split('\n').map(s => s.trim().replace(/^[•\-*]\s*/, '')).filter(s => s);
            } else if (finalSkills.includes('•')) {
                skillItems = finalSkills.split('•').map(s => s.trim()).filter(s => s);
            } else {
                const parts = finalSkills.split(' ');
                if (parts.length > 1 && parts.length < 10) {
                    skillItems = parts.map(s => s.trim()).filter(s => s);
                } else {
                    skillItems = [finalSkills.trim()];
                }
            }
            
            if (skillItems.length > 3) {
                const stopWords = ['the','and','for','with','from','that','this','have','are','was','were','had','has','but','not','all','any','can','her','his','our','out','use','way','who','you','your','about','after','also','because','been','before','being','both','even','every','how','into','like','more','most','much','never','now','only','over','some','such','than','then','there','these','they','through','until','very','well','what','when','where','which','while','will','without'];
                skillItems = skillItems.filter(s => !stopWords.includes(s.toLowerCase()) && s.length > 1);
            }
            
            if (skillItems.length > 0) {
                const tagHeight = 8.5;
                const tagPadding = 8.0;
                const tagSpacing = 4.5;
                const tagFontSize = 8.0;
                const radius = 2.0;
                const maxTagWidth = this.maxLineWidth;
                const lineSpacing = 5.0;
                
                let currentX = this.marginX;
                let currentY = this.currentY + 2.0;
                let lineHeight = tagHeight + lineSpacing;
                
                this.pdf.setFontSize(tagFontSize);
                this.pdf.setFont('helvetica', 'bold');
                
                const tags = skillItems.map(skill => {
                    const skillText = this.cleanText(skill);
                    const textWidth = this.pdf.getTextWidth(skillText);
                    const tagWidth = Math.ceil(textWidth + (tagPadding * 2));
                    return { text: skillText, width: tagWidth };
                });
                
                let lineWidth = 0;
                let lineTags: typeof tags = [];
                const allLines: typeof tags[] = [];
                
                for (let i = 0; i < tags.length; i++) {
                    const tag = tags[i];
                    const spacing = lineTags.length > 0 ? tagSpacing : 0;
                    
                    if (lineWidth + tag.width + spacing <= maxTagWidth) {
                        lineWidth += tag.width + spacing;
                        lineTags.push(tag);
                    } else {
                        if (lineTags.length > 0) {
                            allLines.push(lineTags);
                        }
                        lineTags = [tag];
                        lineWidth = tag.width;
                    }
                }
                
                if (lineTags.length > 0) {
                    allLines.push(lineTags);
                }
                
                if (allLines.length > 0) {
                    const firstLineHeight = lineHeight;
                    if (!this.canFit(firstLineHeight)) {
                        this.addNewPage('');
                        currentX = this.marginX;
                        currentY = this.currentY + 2.0;
                    }
                }
                
                for (let lineIndex = 0; lineIndex < allLines.length; lineIndex++) {
                    const lineTags = allLines[lineIndex];
                    currentX = this.marginX;
                    
                    const lineHeightNeeded = lineHeight;
                    if (!this.canFit(lineHeightNeeded)) {
                        this.addNewPage('');
                        currentX = this.marginX;
                        currentY = this.currentY + 2.0;
                    }
                    
                    for (let i = 0; i < lineTags.length; i++) {
                        const tag = lineTags[i];
                        const tagWidth = tag.width;
                        
                        this.pdf.setFillColor(this.colors.tagBg[0], this.colors.tagBg[1], this.colors.tagBg[2]);
                        this.pdf.rect(currentX, currentY, tagWidth, tagHeight, 'F');
                        
                        this.pdf.setLineWidth(0.08);
                        this.pdf.setDrawColor(this.colors.tagBorder[0], this.colors.tagBorder[1], this.colors.tagBorder[2]);
                        this.pdf.roundedRect(currentX, currentY, tagWidth, tagHeight, radius, radius, 'S');
                        
                        const textWidth = this.pdf.getTextWidth(tag.text);
                        const textX = currentX + (tagWidth / 2) - (textWidth / 2);
                        const baselineY = currentY + (tagHeight / 2) + (tagFontSize * 0.18);
                        
                        this.pdf.setFont('helvetica', 'bold');
                        this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                        this.pdf.text(tag.text, textX, baselineY);
                        
                        currentX += tagWidth + tagSpacing;
                    }
                    
                    currentY += lineHeight;
                }
                
                this.currentY = currentY + 4;
            } else {
                if (!this.canFit(this.theme.bodyFontSize * 0.38 + 4)) {
                    this.addNewPage('');
                }
                this.pdf.setFontSize(this.theme.bodyFontSize);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                this.pdf.text('Skills: ' + finalSkills, this.marginX, this.currentY);
                this.currentY += this.theme.bodyFontSize * 0.38 + 4;
            }
            this.currentY += this.theme.sectionSpacing;
        } else {
            const headingHeight = 16;
            if (!this.canFitHeadingWithMinContent(headingHeight, 10)) {
                this.addNewPage('');
            }
            this.renderSectionTitle('SKILLS');
            if (!this.canFit(this.theme.bodyFontSize * 0.38 + 4)) {
                this.addNewPage('');
            }
            this.pdf.setFontSize(this.theme.bodyFontSize);
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
            this.pdf.text('No skills listed', this.marginX, this.currentY);
            this.currentY += this.theme.bodyFontSize * 0.38 + 4;
            this.currentY += this.theme.sectionSpacing;
        }

        // ============================================================
        // CERTIFICATIONS
        // ============================================================
        const validCerts = certifications.filter(c => c.name?.trim());
        if (validCerts.length > 0) {
            const certItems: string[] = [];
            for (const cert of validCerts) {
                const certName = this.cleanText(cert.name);
                const certIssuer = cert.issuer ? this.cleanText(cert.issuer) : '';
                const certDate = cert.date ? this.cleanText(cert.date) : '';
                let certText = `${certName}`;
                if (certIssuer && certDate) certText += ` – ${certIssuer} (${certDate})`;
                else if (certIssuer) certText += ` – ${certIssuer}`;
                else if (certDate) certText += ` (${certDate})`;
                certItems.push(certText);
            }
            
            const headingHeight = 16;
            let firstItemsHeight = 0;
            const itemsToCheck = Math.min(2, certItems.length);
            for (let i = 0; i < itemsToCheck; i++) {
                firstItemsHeight += this.getTextHeight(certItems[i], this.maxLineWidth, this.theme.bulletFontSize, false) + 2;
            }
            
            if (!this.canFitHeadingWithMinContent(headingHeight, firstItemsHeight)) {
                this.addNewPage('');
            }
            
            this.renderSectionTitle('CERTIFICATIONS');
            
            for (let idx = 0; idx < certItems.length; idx++) {
                const certText = certItems[idx];
                const certHeight = this.getTextHeight(certText, this.maxLineWidth, this.theme.bulletFontSize, false) + 2;
                
                if (!this.canFit(certHeight)) {
                    this.addNewPage('');
                }
                
                this.pdf.setFontSize(this.theme.bulletFontSize);
                this.pdf.setFont('helvetica', 'normal');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                const certLines = this.pdf.splitTextToSize(certText, this.maxLineWidth);
                this.pdf.text(certLines, this.marginX, this.currentY);
                this.currentY += certLines.length * (this.theme.bulletFontSize * 0.38) + 1;
            }
            this.currentY += this.theme.sectionSpacing;
        }

        // ============================================================
        // LANGUAGES
        // ============================================================
        const validLangs = languages.filter(l => l.language?.trim());
        if (validLangs.length > 0) {
            const langItems: string[] = [];
            for (const lang of validLangs) {
                const langText = `${this.cleanText(lang.language)}: ${lang.proficiency || ''}`;
                langItems.push(langText);
            }
            
            const headingHeight = 16;
            let firstItemsHeight = 0;
            const itemsToCheck = Math.min(2, langItems.length);
            for (let i = 0; i < itemsToCheck; i++) {
                firstItemsHeight += this.getTextHeight(langItems[i], this.maxLineWidth - 7.5, this.theme.bulletFontSize, false) + 2;
            }
            
            if (!this.canFitHeadingWithMinContent(headingHeight, firstItemsHeight)) {
                this.addNewPage('');
            }
            
            this.renderSectionTitle('LANGUAGES');
            
            for (let idx = 0; idx < langItems.length; idx++) {
                const langText = langItems[idx];
                const langHeight = this.getTextHeight(langText, this.maxLineWidth - 7.5, this.theme.bulletFontSize, false) + 2;
                
                if (!this.canFit(langHeight)) {
                    this.addNewPage('');
                }
                
                this.renderBulletPoint(langText);
                this.currentY += 1;
            }
            this.currentY += this.theme.sectionSpacing;
        }

        // ============================================================
        // ACHIEVEMENTS
        // ============================================================
        const validAchievements = achievements.filter(a => a.title?.trim());
        if (validAchievements.length > 0) {
            const achievementData: Array<{title: string, bullets: string[]}> = [];
            
            for (let idx = 0; idx < validAchievements.length; idx++) {
                const ach = validAchievements[idx];
                const achTitle = this.cleanText(ach.title);
                const achDate = ach.date ? this.cleanText(ach.date) : '';
                const titleText = achDate ? `${achTitle} (${achDate})` : achTitle;
                
                const descLines = ach.description ? ach.description.split('\n').filter(l => l.trim()) : [];
                const bulletLines: string[] = [];
                for (const line of descLines) {
                    let cleanedLine = this.cleanText(line.trim());
                    cleanedLine = cleanedLine.replace(/^[•\-*✓✅]\s*/, '');
                    bulletLines.push(cleanedLine);
                }
                
                achievementData.push({
                    title: titleText,
                    bullets: bulletLines                });
            }
            
            const headingHeight = 16;
            let firstItemsHeight = 0;
            const itemsToCheck = Math.min(2, achievementData.length);
            for (let i = 0; i < itemsToCheck; i++) {
                const item = achievementData[i];
                firstItemsHeight += this.getTextHeight(item.title, this.maxLineWidth, 11.5, true) + 3;
                for (const bullet of item.bullets.slice(0, this.MIN_LINES_AFTER_HEADING)) {
                    firstItemsHeight += this.getTextHeight(bullet, this.maxLineWidth - 7.5, this.theme.bulletFontSize, false) + 1.5;
                }
            }
            
            if (!this.canFitHeadingWithMinContent(headingHeight, firstItemsHeight)) {
                this.addNewPage('');
            }
            
            this.renderSectionTitle('ACHIEVEMENTS');
            
            for (let idx = 0; idx < achievementData.length; idx++) {
                const item = achievementData[idx];
                const titleHeight = this.getTextHeight(item.title, this.maxLineWidth, 11.5, true);
                
                if (!this.canFit(titleHeight + 3)) {
                    this.addNewPage('');
                }
                
                this.pdf.setFontSize(11.5);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                const titleLines = this.pdf.splitTextToSize(item.title, this.maxLineWidth);
                this.pdf.text(titleLines, this.marginX, this.currentY);
                this.currentY += titleLines.length * (11.5 * 0.38) + 1;
                
                if (item.bullets.length > 0) {
                    this.pdf.setFontSize(this.theme.bulletFontSize);
                    this.pdf.setFont('helvetica', 'normal');
                    this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                    
                    for (const bullet of item.bullets) {
                        this.renderBulletPoint(bullet);
                    }
                }
                this.currentY += 3;
            }
            this.currentY += this.theme.sectionSpacing;
        }

        // ============================================================
        // PROJECTS
        // ============================================================
        const validProjects = projects.filter(p => p.name?.trim());
        if (validProjects.length > 0) {
            let headingRendered = false;
            
            for (let idx = 0; idx < validProjects.length; idx++) {
                const proj = validProjects[idx];
                
                const projTitle = this.cleanText(proj.name) + (proj.tech ? ` (${this.cleanText(proj.tech)})` : '');
                const titleHeight = this.getTextHeight(projTitle, this.maxLineWidth, 11.5, true);
                
                const descLines = proj.description ? proj.description.split('\n').filter(l => l.trim()) : [];
                const bulletLines: string[] = [];
                for (const line of descLines) {
                    let cleanedLine = this.cleanText(line.trim());
                    cleanedLine = cleanedLine.replace(/^[•\-*✓✅]\s*/, '');
                    bulletLines.push(cleanedLine);
                }
                
                const headingHeight = 16;
                
                if (!headingRendered) {
                    const firstBulletLines = bulletLines.slice(0, this.MIN_LINES_AFTER_HEADING);
                    let minContentHeight = titleHeight + 3;
                    for (const line of firstBulletLines) {
                        minContentHeight += this.getTextHeight(line, this.maxLineWidth - 7.5, this.theme.bulletFontSize, false) + 1.5;
                    }
                    if (proj.github) {
                        const githubText = `GitHub: ${this.cleanText(proj.github)}`;
                        minContentHeight += this.getTextHeight(githubText, this.maxLineWidth - 7.5, this.theme.socialFontSize, false) + 2;
                    }
                    
                    if (!this.canFitHeadingWithMinContent(headingHeight, minContentHeight)) {
                        this.addNewPage('');
                    }
                    this.renderSectionTitle('PROJECTS');
                    headingRendered = true;
                }
                
                if (!this.canFit(titleHeight + 3)) {
                    this.addNewPage('');
                }
                
                this.pdf.setFontSize(11.5);
                this.pdf.setFont('helvetica', 'bold');
                this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                const titleLines = this.pdf.splitTextToSize(projTitle, this.maxLineWidth);
                this.pdf.text(titleLines, this.marginX, this.currentY);
                this.currentY += titleLines.length * (11.5 * 0.38) + 1;
                
                if (bulletLines.length > 0) {
                    this.pdf.setFontSize(this.theme.bulletFontSize);
                    this.pdf.setFont('helvetica', 'normal');
                    this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                    
                    for (let i = 0; i < bulletLines.length; i++) {
                        this.renderBulletPoint(bulletLines[i]);
                    }
                    this.currentY += 2;
                }
                
                if (proj.github) {
                    const githubText = `GitHub: ${this.cleanText(proj.github)}`;
                    const githubMaxWidth = this.maxLineWidth - 7.5;
                    this.pdf.setFontSize(this.theme.socialFontSize);
                    const wrappedGithub = this.pdf.splitTextToSize(githubText, githubMaxWidth);
                    this.pdf.setTextColor(this.colors.link[0], this.colors.link[1], this.colors.link[2]);
                    
                    const githubHeight = wrappedGithub.length * 4.5 + 2;
                    if (!this.canFit(githubHeight)) {
                        this.addNewPage('');
                    }
                    this.pdf.text(wrappedGithub, this.marginX + 5.5, this.currentY);
                    this.currentY += githubHeight;
                    this.pdf.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
                }
                this.currentY += 3;
            }
            this.currentY += this.theme.sectionSpacing;
        }
    }
}

export const generateModernPDF = async (params: PDFParams): Promise<Blob> => {
    const generator = new ModernPDFGenerator(params);
    return generator.generate();
};