// src/utils/env.ts
export const validateEnv = () => {
  const requiredEnvVars = [
    'VITE_CLERK_PUBLISHABLE_KEY',
  ];

  const missing: string[] = [];

  requiredEnvVars.forEach((key) => {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    return false;
  }

  return true;
};

export const getEnv = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`⚠️ Environment variable ${key} is not set`);
    return '';
  }
  return value;
};

export const isDev = () => import.meta.env.DEV;
export const isProd = () => import.meta.env.PROD;