// src/hooks/useAuth.ts
import { useUser, useAuth as useClerkAuth, useSignIn, useSignUp } from "@clerk/clerk-react";
import { useState, useCallback } from "react";

export const useAuth = () => {  // ← Named export
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerkAuth();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      
      if (result.status === "complete") {
        window.location.href = "/";
        return { success: true };
      } else {
        setError("Invalid email or password");
        return { success: false, error: "Invalid email or password" };
      }
    } catch (err: any) {
      const message = err.errors?.[0]?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  const signup = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });
      
      console.log("Signup result:", result);
      
      if (result.status === "complete") {
        return { success: true };
      } else if (result.status === "missing_requirements") {
        return { 
          success: true, 
          requiresVerification: true 
        };
      } else {
        setError("Signup failed");
        return { success: false, error: "Signup failed" };
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      const message = err.errors?.[0]?.message || "Signup failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [signUp]);

  const logout = useCallback(async () => {
    await signOut();
    window.location.href = "/login";
  }, [signOut]);

  const googleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      const message = err.errors?.[0]?.message || "Google login failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  return {
    isLoaded,
    isSignedIn,
    user,
    loading,
    error,
    login,
    signup,
    logout,
    googleLogin,
    setError,
  };
};

// Also export as default for flexibility
export default useAuth;