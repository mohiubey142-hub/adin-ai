import { useEffect } from 'react';

export const useTemplateSync = (
  initialTemplateId: string | undefined,
  selectedTemplate: 'classic' | 'modern',
  setSelectedTemplate: (val: 'classic' | 'modern') => void,
  isInitialLoad: boolean
) => {
  // Sync from props
  useEffect(() => {
    if (initialTemplateId && (initialTemplateId === 'classic' || initialTemplateId === 'modern')) {
      console.log(`🎯 Gallery template applied on mount: ${initialTemplateId}`);
      setSelectedTemplate(initialTemplateId as 'classic' | 'modern');
    }
  }, []);

  useEffect(() => {
    if (initialTemplateId && (initialTemplateId === 'classic' || initialTemplateId === 'modern')) {
      console.log(`🎯 Gallery template applied via prop update: ${initialTemplateId}`);
      setSelectedTemplate(initialTemplateId as 'classic' | 'modern');
    }
  }, [initialTemplateId]);

  // Sync from localStorage
  useEffect(() => {
    const savedTemplate = localStorage.getItem('adin-selected-cover-template');
    if (savedTemplate && (savedTemplate === 'classic' || savedTemplate === 'modern')) {
      console.log(`🎯 Gallery template applied from localStorage: ${savedTemplate}`);
      setSelectedTemplate(savedTemplate as 'classic' | 'modern');
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('adin-selected-cover-template', selectedTemplate);
    }
  }, [selectedTemplate, isInitialLoad]);
};