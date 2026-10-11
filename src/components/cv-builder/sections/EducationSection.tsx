// src/components/cv-builder/sections/EducationSection.tsx
// Premium — transparent wrapper, nested cards white with subtle border
// ZERO feature break: year split/merge logic untouched

import React from 'react';
import { GraduationCap, BookOpen, Building2, Calendar, Award, Trash2, Plus } from 'lucide-react';
import { EducationItem } from '../types/cvTypes';

interface EducationSectionProps {
    educations: EducationItem[];
    addEducation: () => void;
    removeEducation: (i: number) => void;
    updateEducation: (i: number, field: keyof EducationItem, value: string) => void;
}

const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';
const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';

const EducationSection: React.FC<EducationSectionProps> = ({
    educations, addEducation, removeEducation, updateEducation,
}) => {
    return (
        <div className="space-y-4">
            <div className="space-y-3.5">
                {educations.map((edu, idx) => (
                    <div
                        key={`education-${idx}`}
                        className="rounded-xl bg-white border border-slate-200 hover:border-purple-200 transition-all duration-200 p-4 md:p-5"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm shadow-purple-600/20">
                                    <GraduationCap size={14} className="text-white" strokeWidth={2.4} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 tracking-tight">
                                    Education #{idx + 1}
                                </span>
                            </div>
                            {educations.length > 1 && (
                                <button
                                    onClick={() => removeEducation(idx)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-600 text-xs font-semibold transition-all duration-200"
                                >
                                    <Trash2 size={12} />
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                    <BookOpen size={14} className="text-purple-600" />
                                    Degree
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Bachelor of Science in Computer Science"
                                    value={edu.degree}
                                    onChange={e => updateEducation(idx, 'degree', e.target.value)}
                                    className={`${baseInput} ${normalInput}`}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                    <Building2 size={14} className="text-purple-600" />
                                    Institution
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Stanford University"
                                    value={edu.institution}
                                    onChange={e => updateEducation(idx, 'institution', e.target.value)}
                                    className={`${baseInput} ${normalInput}`}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                    <Calendar size={14} className="text-purple-600" />
                                    Duration
                                </label>
                                <div className="flex gap-2.5">
                                    <input
                                        type="text"
                                        placeholder="Start Year (e.g., 2020)"
                                        value={edu.year?.split(' - ')[0] || ''}
                                        onChange={e => {
                                            const start = e.target.value;
                                            const end = edu.year?.split(' - ')[1] || '';
                                            updateEducation(idx, 'year', end ? `${start} - ${end}` : start);
                                        }}
                                        className={`${baseInput} w-1/2 ${normalInput}`}
                                    />
                                    <input
                                        type="text"
                                        placeholder="End Year (e.g., 2024)"
                                        value={edu.year?.split(' - ')[1] || ''}
                                        onChange={e => {
                                            const start = edu.year?.split(' - ')[0] || '';
                                            const end = e.target.value;
                                            updateEducation(idx, 'year', start ? `${start} - ${end}` : end);
                                        }}
                                        className={`${baseInput} w-1/2 ${normalInput}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                    <Award size={14} className="text-purple-600" />
                                    Grade / CGPA <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., 3.8/4.0"
                                    value={edu.grade}
                                    onChange={e => updateEducation(idx, 'grade', e.target.value)}
                                    className={`${baseInput} ${normalInput}`}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addEducation}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
            >
                <Plus size={16} />
                Add Education
            </button>
        </div>
    );
};

export default EducationSection;