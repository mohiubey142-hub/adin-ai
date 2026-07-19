import { useMemo } from 'react';
import { getTemplateStyles, getBackgroundStyle } from '../constants/templateStyles';
import { TemplateStyles } from '../types/previewTypes';

export const useTemplateStyles = (template: 'modern' | 'classic' | 'minimal') => {
    const styles = useMemo<TemplateStyles>(() => {
        return getTemplateStyles(template);
    }, [template]);

    const backgroundStyle = useMemo(() => {
        return getBackgroundStyle();
    }, []);

    // Individual style getters for convenience
    const getCardStyle = () => styles.card;
    const getHeadingStyle = () => styles.heading;
    const getNameStyle = () => styles.name;
    const getTitleStyle = () => styles.title;
    const getContactStyle = () => styles.contact;
    const getPhotoBorderClass = () => styles.photoBorder;
    const getDescriptionStyle = () => styles.description;

    return {
        styles,
        backgroundStyle,
        getCardStyle,
        getHeadingStyle,
        getNameStyle,
        getTitleStyle,
        getContactStyle,
        getPhotoBorderClass,
        getDescriptionStyle
    };
};