import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cover_letter_data';

export const saveToLocalStorage = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

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