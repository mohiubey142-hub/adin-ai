import { useEffect, useRef, useState } from 'react';
import { saveData } from '../utils/storageUtils';

export const useAutoSave = (
    userId: string,
    data: any,
    dependencies: any[],
    delay: number = 500
) => {
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        loadedRef.current = true;
    }, []);

    useEffect(() => {
        if (!userId || !loadedRef.current) return;
        
        setSaveStatus('saving');
        
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        saveTimeoutRef.current = setTimeout(() => {
            const dataToSave = {
                ...data,
                lastUpdated: Date.now()
            };
            saveData(userId, dataToSave);
            setSaveStatus('saved');
        }, delay);
        
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [userId, ...dependencies]);

    return { saveStatus };
};