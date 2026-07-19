export const getStorageKey = (userId: string) => 
    `adin_cv_builder_data_${userId || 'anonymous_user'}`;

export const loadSavedData = (userId: string) => {
    if (!userId) return null;
    try {
        const saved = localStorage.getItem(getStorageKey(userId));
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load CV data:', e);
    }
    return null;
};

export const saveData = (userId: string, data: any) => {
    if (!userId) return;
    try {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save CV data:', e);
    }
};

export const clearStorage = (userId: string) => {
    if (!userId) return;
    try {
        localStorage.removeItem(getStorageKey(userId));
    } catch (e) {
        console.error('Failed to clear CV data:', e);
    }
};