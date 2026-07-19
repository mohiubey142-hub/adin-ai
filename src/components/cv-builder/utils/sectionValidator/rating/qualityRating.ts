// utils/sectionValidator/rating/qualityRating.ts
// ============================================
// QUALITY RATING
// ============================================

export const getQualityRating = (score: number): { 
    text: string; 
    color: string; 
    icon: string; 
    bg: string 
} => {
    if (score >= 95) {
        return { 
            text: 'Excellent', 
            color: 'text-emerald-400', 
            icon: '🌟',
            bg: 'bg-emerald-500/10 border-emerald-500/20'
        };
    }
    if (score >= 85) {
        return { 
            text: 'Very Good', 
            color: 'text-blue-400', 
            icon: '⭐',
            bg: 'bg-blue-500/10 border-blue-500/20'
        };
    }
    if (score >= 70) {
        return { 
            text: 'Good', 
            color: 'text-purple-400', 
            icon: '👍',
            bg: 'bg-purple-500/10 border-purple-500/20'
        };
    }
    if (score >= 50) {
        return { 
            text: 'Fair', 
            color: 'text-yellow-400', 
            icon: '📈',
            bg: 'bg-yellow-500/10 border-yellow-500/20'
        };
    }
    return { 
        text: 'Needs Improvement', 
        color: 'text-red-400', 
        icon: '⚠️',
        bg: 'bg-red-500/10 border-red-500/20'
    };
};