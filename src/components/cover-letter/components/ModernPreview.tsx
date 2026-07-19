import React from 'react';

interface ModernPreviewProps {
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

export const ModernPreview = ({ 
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
}: ModernPreviewProps) => {
  const cleanName = name || 'Your Name';
  const cleanTitle = title || 'Job Title';
  const cleanCompany = companyName || '';
  
  const contactParts1: string[] = [];
  const contactParts2: string[] = [];

  if (userEmail) {
    const cleanEmailStr = userEmail.trim();
    if (cleanEmailStr) contactParts1.push(cleanEmailStr);
  }
  if (phone && countryCode) {
    const cleanPhone = `${countryCode} ${phone.replace(/\D/g, '')}`;
    if (cleanPhone) contactParts1.push(cleanPhone);
  }

  if (userAddress) {
    const cleanAddress = userAddress.trim();
    if (cleanAddress) contactParts2.push(cleanAddress);
  }
  if (linkedinUrl) {
    const cleanLinkedinStr = linkedinUrl.trim();
    if (cleanLinkedinStr) contactParts2.push(cleanLinkedinStr);
  }

  const contactLine1 = contactParts1.join(' • ');
  const contactLine2 = contactParts2.join(' • ');

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
    if (trimmed.includes('@') && (trimmed.includes('•') || trimmed.includes('gmail'))) return false;
    return true;
  }) : [];

  // ✅ FIX: Remove leading empty lines from bodyText
  // Find the first non-empty line index and slice from there
  let bodyText = bodyLines.join('\n');
  
  // Split by newline to check each line
  const lines = bodyText.split('\n');
  let firstNonEmptyIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '') {
      firstNonEmptyIndex = i;
      break;
    }
  }
  
  // If there are leading empty lines, remove them
  if (firstNonEmptyIndex > 0) {
    bodyText = lines.slice(firstNonEmptyIndex).join('\n');
  }

  return (
    <div className="bg-white p-8 min-h-[400px]" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {photo && (
        <div className="flex justify-center mb-1">
          <div className="w-[28mm] h-[28mm] rounded-full overflow-hidden border-2 border-purple-500/30 shadow-lg">
            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
      
      <h1 className="text-center text-[15pt] font-bold text-gray-800 mt-1 mb-1 tracking-tight break-words overflow-wrap-anywhere max-w-full">
        {cleanName}
      </h1>
      
      <h2 className="text-center text-[12pt] font-bold text-purple-600 mb-0.5 break-words overflow-wrap-anywhere max-w-full">
        {cleanTitle}
      </h2>
      
      {contactLine1 && (
        <p className="text-center text-[8.5pt] text-gray-500 mb-0.5 break-words overflow-wrap-anywhere max-w-full whitespace-pre-wrap">
          {contactLine1}
        </p>
      )}
      
      {contactLine2 && (
        <p className="text-center text-[8.5pt] text-gray-500 mb-2 break-words overflow-wrap-anywhere max-w-full whitespace-pre-wrap">
          {contactLine2}
        </p>
      )}
      
      <div className="my-2">
        <div className="w-full h-[0.8mm] bg-purple-600" />
        <div className="w-[85%] mx-auto h-[0.2mm] bg-gray-400 mt-[0.8mm]" />
      </div>
      
      <p className="text-right text-[9.5pt] text-gray-500 mb-1">
        {today}
      </p>
      
      <p className="text-[10.5pt] font-bold text-gray-800 break-words overflow-wrap-anywhere max-w-full">
        Hiring Manager
      </p>
      {cleanCompany && (
        <p className="text-[10pt] text-gray-500 break-words overflow-wrap-anywhere max-w-full">
          {cleanCompany}
        </p>
      )}
      
      <div className="mb-1" />
      
      <p className="text-[10.5pt] text-gray-800 break-words overflow-wrap-anywhere max-w-full">
        {subject}
      </p>
      
      <div className="mb-1" />
      
      <p className="text-[10.5pt] font-bold text-gray-800">
        Dear Hiring Manager,
      </p>
      
      <div className="mb-1" />
      
      <div className="text-[10.5pt] text-gray-800 leading-[1.6] whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">
        {bodyText}
      </div>
      
      <div className="mt-4">
        <div className="w-full h-[0.4mm] bg-purple-600" />
        <div className="mt-2">
          <p className="text-[10pt] text-gray-500">Sincerely,</p>
          <div className="mt-2">
            <p className="text-[14pt] font-bold text-purple-600 break-words overflow-wrap-anywhere max-w-full">
              {cleanName}
            </p>
            <p className="text-[9.5pt] text-gray-500 break-words overflow-wrap-anywhere max-w-full">
              {cleanTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};