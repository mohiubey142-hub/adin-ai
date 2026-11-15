// src/components/Onboarding.tsx (Temporary Test Code)
import { AuthScreen } from './auth/AuthScreen';

export const Onboarding = ({ onComplete }: any) => {
  return (
    <AuthScreen
      onSuccess={async () => {
        // Jab login ho jaye, toh Supabase se user nikal kar onComplete bhejo
        const { authService } = await import('../services/sync/authService');
        const user = await authService.getUser();
        onComplete({
          name: user?.user_metadata?.full_name || 'User',
          userId: user?.id || '',
        });
      }}
    />
  );
};