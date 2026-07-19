import React from 'react';
import { EducationItem } from '../types/cvTypes';

interface EducationSectionProps {
    educations: EducationItem[];
    addEducation: () => void;
    removeEducation: (i: number) => void;
    updateEducation: (i: number, field: keyof EducationItem, value: string) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
    educations,
    addEducation,
    removeEducation,
    updateEducation
}) => {
    return (
        <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white mb-4">Education</h2>
            <p className="text-xs text-gray-500 mb-2">Degree and Institution are recommended. Add your highest education first.</p>
            
            {educations.map((edu, idx) => (
                <div key={`education-${idx}`} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-purple-400">Education #{idx + 1}</span>
                        {educations.length > 1 && <button onClick={() => removeEducation(idx)} className="text-red-400 text-sm">Remove</button>}
                    </div>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="Degree (e.g., Bachelor of Science in Computer Science)" 
                            value={edu.degree} 
                            onChange={e => updateEducation(idx, 'degree', e.target.value)} 
                            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                        />
                        
                        <input 
                            type="text" 
                            placeholder="Institution (e.g., Stanford University)" 
                            value={edu.institution} 
                            onChange={e => updateEducation(idx, 'institution', e.target.value)} 
                            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                        />
                        
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Start Year (e.g., 2020)" 
                                value={edu.year?.split(' - ')[0] || ''} 
                                onChange={e => {
                                    const start = e.target.value;
                                    const end = edu.year?.split(' - ')[1] || '';
                                    updateEducation(idx, 'year', end ? `${start} - ${end}` : start);
                                }} 
                                className="w-1/2 p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
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
                                className="w-1/2 p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                            />
                        </div>
                        
                        <input 
                            type="text" 
                            placeholder="Grade/CGPA (e.g., 3.8/4.0) - Optional" 
                            value={edu.grade} 
                            onChange={e => updateEducation(idx, 'grade', e.target.value)} 
                            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500" 
                        />
                    </div>
                </div>
            ))}
            
            <button onClick={addEducation} className="w-full py-3 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:text-white transition">
                + Add Education
            </button>
        </div>
    );
};

export default EducationSection;