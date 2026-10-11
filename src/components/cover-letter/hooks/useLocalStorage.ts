// src/components/cover-letter/hooks/useLocalStorage.ts
// =====================================================
// ✅ HYBRID IMAGE STORAGE — image strip before localStorage
// ✅ Same pattern as CVBuilder
// =====================================================

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cover_letter_data';

// =====================================================
// ✅ Helper: Strip heavy image before saving to localStorage
// Image IndexedDB mein hoti hai, localStorage mein sirf flag
// =====================================================
const stripImageFromData = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  const copy = { ...data };
  if (
    copy.profilePhoto &&
    typeof copy.profilePhoto === 'string' &&
    copy.profilePhoto.length > 500
  ) {
    // Photo bari hai → strip karo, flag rakho
    copy.profilePhoto = null;
    copy.hasPhoto = true;
  }
  return copy;
};

// =====================================================
// ✅ saveToLocalStorage — strips image before saving
// =====================================================
export const saveToLocalStorage = (data: any) => {
  try {
    const stripped = stripImageFromData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

// =====================================================
// ✅ loadFromLocalStorage — returns data (image stripped)
// Photo IndexedDB se load karni hogi alag se
// =====================================================
export const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading from localStorage:', e);
  }
  return null;
};

// =====================================================
// ✅ useLocalStorage hook
// =====================================================
export const useLocalStorage = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadData = () => {
    return loadFromLocalStorage();
  };

  const saveData = (data: any) => {
    saveToLocalStorage(data);
  };

  return { loadData, saveData, isInitialLoad, setIsInitialLoad };
};