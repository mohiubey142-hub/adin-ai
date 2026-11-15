// src/components/cv-builder/hooks/useCVExtras.ts
// Owns the extra CV data (custom sections, interests, references, section layout).
// `extras` is a memoised object — spread it into every save / sync / preview payload
// so these fields can never be forgotten in one place.

import { useCallback, useMemo, useState } from 'react';
import type { CustomSection, CVExtras, ReferencesData, SectionLayout } from '../types/cvExtraTypes';
import { createEmptyExtras, normalizeExtras } from '../utils/cvExtras';

export const useCVExtras = (savedData: unknown) => {
    const [initial] = useState<CVExtras>(() => normalizeExtras(savedData));

    const [customSections, setCustomSections] = useState<CustomSection[]>(initial.customSections);
    const [interests, setInterests] = useState<string[]>(initial.interests);
    const [references, setReferences] = useState<ReferencesData>(initial.references);
    const [sectionLayout, setSectionLayout] = useState<SectionLayout>(initial.sectionLayout);

    const extras: CVExtras = useMemo(
        () => ({ customSections, interests, references, sectionLayout }),
        [customSections, interests, references, sectionLayout]
    );

    /** Used by "Clear all data". */
    const resetExtras = useCallback(() => {
        const e = createEmptyExtras();
        setCustomSections(e.customSections);
        setInterests(e.interests);
        setReferences(e.references);
        setSectionLayout(e.sectionLayout);
    }, []);

    return {
        extras,
        customSections, setCustomSections,
        interests, setInterests,
        references, setReferences,
        sectionLayout, setSectionLayout,
        resetExtras,
    };
};
