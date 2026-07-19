import React from 'react';
import { CertificationItem } from '../types/cvTypes';

interface CertificationsSectionProps {
    certifications: CertificationItem[];
    addCertification: () => void;
    removeCertification: (i: number) => void;
    updateCertification: (i: number, field: keyof CertificationItem, value: string) => void;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({
    certifications,
    addCertification,
    removeCertification,
    updateCertification
}) => {
    return (
        <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white mb-1">
                Certifications <span className="text-sm font-normal text-gray-400">(Optional)</span>
            </h2>
            <p className="text-xs text-gray-500 mb-2">Add your professional certificates. All fields are optional.</p>
            
            {certifications.map((cert, idx) => (
                <div key={`certification-${idx}`} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-purple-400">Certification #{idx + 1}</span>
                        {certifications.length > 1 && (
                            <button onClick={() => removeCertification(idx)} className="text-red-400 text-sm hover:text-red-300 transition">
                                Remove
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="Certification Name (e.g., AWS Certified Solutions Architect)" 
                            value={cert.name} 
                            onChange={e => updateCertification(idx, 'name', e.target.value)} 
                            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                        />
                        
                        <input 
                            type="text" 
                            placeholder="Date Earned (e.g., 2023)" 
                            value={cert.date} 
                            onChange={e => updateCertification(idx, 'date', e.target.value)} 
                            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                        />
                        
                        {/* Credential ID — Optional */}
                        <input 
                            type="text" 
                            placeholder="Credential ID (Optional)" 
                            value={cert.credentialId} 
                            onChange={e => updateCertification(idx, 'credentialId', e.target.value)} 
                            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                        />

                        {/* PREVIEW — Fixed overflow with proper text wrapping */}
                        {cert.name && (
                            <div className="mt-2 p-2 rounded-lg bg-gray-700/30 border border-gray-600/50 overflow-hidden">
                                <p className="text-xs text-gray-400 break-words whitespace-normal">
                                    Preview: <span className="text-purple-300 font-medium break-words">
                                        {cert.date ? `${cert.name} (${cert.date})` : cert.name}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            <button onClick={addCertification} className="w-full py-3 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition">
                + Add Certification
            </button>
        </div>
    );
};

export default CertificationsSection;