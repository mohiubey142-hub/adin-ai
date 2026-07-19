// src/components/auth/SignupForm.tsx
import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { GoogleButton } from "./GoogleButton";
import { Toast } from "../ui/Toast";

export const SignupForm = () => {
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  
  // UI states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("error");
  
  // Clerk hook - DIRECT, NO useAuth
  const { signUp, isLoaded, setActive } = useSignUp();
  
  // Step tracking: 'signup' | 'verify'
  const [step, setStep] = useState<"signup" | "verify">("signup");

  // ============================================
  // STEP 1: Create Account
  // ============================================
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- Client-side validation ---
    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!isLoaded) {
      setLoading(false);
      return;
    }

    try {
      // 1. Create the user
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      console.log("Signup result:", result);

      // 2. Check status
      if (result.status === "complete") {
        // Account created successfully - set active session
        await setActive({ session: result.createdSessionId });
        
        setToastMessage("Account created successfully! 🎉");
        setToastType("success");
        setShowToast(true);
        
        // Redirect to home
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        
      } else if (result.status === "missing_requirements") {
        // 3. Email verification required - send verification code
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        
        setStep("verify");
        setToastMessage("Verification code sent to your email! 📧");
        setToastType("info");
        setShowToast(true);
      } else {
        setError("Signup failed. Please try again.");
      }
      
    } catch (err: any) {
      console.error("Signup error:", err);
      
      // Handle specific Clerk errors
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        setError("This email is already registered. Please login instead.");
      } else if (err.errors?.[0]?.code === "form_password_pwned") {
        setError("This password is too common. Please choose a stronger password.");
      } else {
        setError(err.errors?.[0]?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // STEP 2: Verify Email with OTP
  // ============================================
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!verificationCode || verificationCode.length < 6) {
      setError("Please enter the 6-digit verification code");
      setLoading(false);
      return;
    }

    if (!isLoaded || !signUp) {
      setLoading(false);
      return;
    }

    try {
      // 1. Attempt verification
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      console.log("Verification result:", result);

      // 2. Check if verification successful
      if (result.status === "complete") {
        // 3. Set active session
        await setActive({ session: result.createdSessionId });
        
        setToastMessage("Email verified! Welcome to Adin AI 🎉");
        setToastType("success");
        setShowToast(true);
        
        // 4. Redirect to home
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        
      } else {
        setError("Invalid verification code. Please try again.");
      }
      
    } catch (err: any) {
      console.error("Verification error:", err);
      
      if (err.errors?.[0]?.code === "form_code_incorrect") {
        setError("Invalid verification code. Please check and try again.");
      } else {
        setError(err.errors?.[0]?.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Handle Google Login
  // ============================================
  const handleGoogleLogin = async () => {
    if (!isLoaded || !signUp) return;
    
    setLoading(true);
    setError("");
    
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.errors?.[0]?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Resend Verification Code
  // ============================================
  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;
    
    setLoading(true);
    setError("");
    
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      
      setToastMessage("New verification code sent! 📧");
      setToastType("info");
      setShowToast(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER: Verification Step
  // ============================================
  if (step === "verify") {
    return (
      <>
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => {
              setShowToast(false);
              setToastMessage("");
            }}
          />
        )}

        <div className="w-full max-w-md mx-auto p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Verify Your Email
            </h2>
            <p className="text-[#a1a1aa] text-sm mt-1">
              We've sent a 6-digit code to <span className="text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="text"
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              maxLength={6}
            />

            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
            >
              Verify Email
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-[#8b5cf6] hover:text-[#a78bfa] text-sm transition-colors"
                disabled={loading}
              >
                Didn't receive code? Resend
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setStep("signup");
                  setError("");
                  setVerificationCode("");
                }}
                className="text-[#71717a] hover:text-[#a1a1aa] text-sm transition-colors"
              >
                ← Back to signup
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // ============================================
  // RENDER: Signup Step
  // ============================================
  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => {
            setShowToast(false);
            setToastMessage("");
          }}
        />
      )}

      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome to Adin AI
          </h2>
          <p className="text-[#a1a1aa] text-sm mt-1">
            Create your account to get started
          </p>
        </div>

        <div onClick={handleGoogleLogin}>
          <GoogleButton />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(63,63,70,0.3)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-[rgba(12,12,20,0.82)] text-[#71717a] uppercase tracking-wider">
              OR
            </span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            type="email"
            label="Email address"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="Create a strong password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#71717a] text-sm">
            Already have an account?{" "}
            <a 
              href="/login" 
              className="text-[#8b5cf6] hover:text-[#a78bfa] font-medium transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[#52525b] text-xs">
            Secure by Clerk
          </p>
        </div>
      </div>
    </>
  );
};