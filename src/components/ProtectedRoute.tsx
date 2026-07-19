// src/components/ProtectedRoute.tsx
import { ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useUser();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-[#a1a1aa]">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in - redirect to login
  if (!isSignedIn) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Redirect to login
    window.location.href = "/login";
    return null;
  }

  // Signed in - show children
  return <>{children}</>;
};