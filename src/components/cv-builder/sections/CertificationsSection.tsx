// src/components/cv-builder/sections/CertificationsSection.tsx
// Premium — transparent wrapper, nested cards white
// ZERO feature break: all handlers and fields untouched

import React from 'react';
import { Award, Trash2, Plus } from 'lucide-react';
import { CertificationItem } from '../types/cvTypes';

interface CertificationsSectionProps {
    certifications: CertificationItem[];
    addCertification: () => void;
    removeCertification: (i: number) => void;
    updateCertification: (i: number, field: keyof CertificationItem, value: string) => void;
}

const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';
const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';

const CertificationsSection: React.FC<CertificationsSectionProps> = ({
    certifications, addCertification, removeCertification, updateCertification,
}) => {
    return (
        <div className="space-y-4">
            <div className="space-y-3.5">
                {certifications.map((cert, idx) => (
                    <div
                        key={`certification-${idx}`}
                        className="rounded-xl bg-white border border-slate-200 p-4 md:p-5"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold text-slate-700">
                                Certification #{idx + 1}
                            </span>
                            {certifications.length > 1 && (
                                <button
                                    onClick={() => removeCertification(idx)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-medium transition-all duration-200"
                                >
                                    <Trash2 size={12} />
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                    Certification Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., AWS Certified Solutions Architect"
                                    value={cert.name}
                                    onChange={e => updateCertification(idx, 'name', e.target.value)}
                                    className={`${baseInput} ${normalInput}`}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                    Date Earned
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., 2023"
                                    value={cert.date}
                                    onChange={e => updateCertification(idx, 'date', e.target.value)}
                                    className={`${baseInput} ${normalInput}`}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                    Credential ID <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., ABC-123-XYZ"
                                    value={cert.credentialId}
                                    onChange={e => updateCertification(idx, 'credentialId', e.target.value)}
                                    className={`${baseInput} ${normalInput}`}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addCertification}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
            >
                <Plus size={16} />
                Add Certification
            </button>
        </div>
    );
};

export default CertificationsSection;