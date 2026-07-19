import React from 'react';
import { wrapText } from '../utils/textHelpers';

interface ClassicPreviewProps {
  letter: string;
  photo: string | null;
  name: string;
  title: string;
  email: string;
  phone: string;
  countryCode: string;
  userAddress: string;
  linkedinUrl: string;
  companyName: string;
}

export const ClassicPreview = ({ 
  letter, 
  photo, 
  name, 
  title, 
  email: userEmail, 
  phone, 
  countryCode, 
  userAddress, 
  linkedinUrl, 
  companyName 
}: ClassicPreviewProps) => {
  const cleanName = name || 'Your Name';
  const cleanTitle = title || 'Job Title';
  const cleanCompany = companyName || '';
  
  const contactParts: string[] = [];
  if (userEmail) {
    const cleanEmailStr = userEmail.trim();
    if (cleanEmailStr) contactParts.push(cleanEmailStr);
  }
  if (phone && countryCode) {
    const cleanPhone = `${countryCode} ${phone.replace(/\D/g, '')}`;
    if (cleanPhone) contactParts.push(cleanPhone);
  }
  if (userAddress) {
    const cleanAddress = userAddress.trim();
    if (cleanAddress) contactParts.push(cleanAddress);
  }
  if (linkedinUrl) {
    const cleanLinkedinStr = linkedinUrl.trim();
    if (cleanLinkedinStr) contactParts.push(cleanLinkedinStr);
  }
  
  const contactText = contactParts.join('  |  ');

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const subject = `RE: Application for ${cleanTitle}`;

  const bodyLines = letter ? letter.split('\n').filter(line => {
    const trimmed = line.trim();
    if (trimmed.match(/^\w+ \d{1,2}, \d{4}$/)) return false;
    if (trimmed === 'Hiring Manager') return false;
    if (trimmed.includes('RE:') || trimmed.includes('Application for')) return false;
    if (trimmed === cleanCompany) return false;
    if (trimmed === cleanName) return false;
    if (trimmed === cleanTitle) return false;
    if (trimmed.toLowerCase().includes('dear hiring manager')) return false;
    if (trimmed.startsWith('Hiring Manager')) return false;
    if (trimmed.includes('@') && (trimmed.includes('|') || trimmed.includes('gmail'))) return false;
    return true;
  }) : [];

  const bodyText = bodyLines.join('\n');
  const paragraphs = bodyText.split(/\n\n+/).filter(p => p.trim());
  const wrappedContactLines = wrapText(contactText, 60);

  return (
    <div className="bg-white p-6 min-h-[400px]" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="flex items-start gap-3 mb-2">
        {photo && (
          <div className="w-[20mm] h-[20mm] rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-bold text-[#2c3e50] uppercase tracking-wide leading-tight break-words overflow-wrap-anywhere">
            {cleanName}
          </h1>
          <h2 className="text-[11px] font-bold text-[#7f8c8d] leading-tight mt-0.5 break-words overflow-wrap-anywhere">
            {cleanTitle}
          </h2>
          {contactText && (
            <div className="text-[7.5px] text-[#505050] font-normal leading-tight mt-1 max-w-full">
              {wrappedContactLines.map((line, idx) => (
                <p key={idx} className="mb-0.5 break-words overflow-wrap-anywhere last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full border-t border-[#c8cdd2] my-2" />

      <p className="text-[9.5px] text-[#646464] font-normal text-left mt-1">
        {today}
      </p>

      <p className="text-[10.5px] font-bold text-[#2c3e50] text-left mt-2 break-words overflow-wrap-anywhere">
        Hiring Manager
      </p>
      
      {cleanCompany && (
        <p className="text-[10px] text-[#505050] text-left break-words overflow-wrap-anywhere">
          {cleanCompany}
        </p>
      )}

      <div className="h-2" />

      <p className="text-[10.5px] text-[#2c3e50] text-left break-words overflow-wrap-anywhere">
        {subject}
      </p>

      <div className="h-2" />

      <p className="text-[10.5px] font-bold text-[#2c3e50] text-left">
        Dear Hiring Manager,
      </p>

      <div className="h-2" />

      <div className="text-[10px] text-[#1e1e1e] leading-[1.6] text-left max-w-full">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, index) => (
            <p key={index} className="mb-2 last:mb-0 break-words overflow-wrap-anywhere whitespace-pre-wrap">
              {para}
            </p>
          ))
        ) : (
          <p className="text-gray-400 italic">No content yet. Generate your letter to see the preview.</p>
        )}
      </div>

      <div className="h-3" />

      <p className="text-[10px] text-[#1e1e1e] text-left">
        Sincerely,
      </p>

      <div className="h-2" />

      <p className="text-[12px] font-bold text-[#2c3e50] text-left break-words overflow-wrap-anywhere">
        {cleanName}
      </p>

      <p className="text-[9px] text-[#7f8c8d] text-left break-words overflow-wrap-anywhere">
        {cleanTitle}
      </p>
    </div>
  );
};