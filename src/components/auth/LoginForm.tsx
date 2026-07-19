// src/components/auth/LoginForm.tsx
import { useState, useEffect, useRef } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { GoogleButton } from "./GoogleButton";
import { Toast } from "../ui/Toast";

// ✅ Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("error");
  
  const { signIn, isLoaded } = useSignIn();
  
  // ✅ Auto-focus on email input
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // ✅ Real-time email validation
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("");
      return;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // ✅ Validate email before submit
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    if (!isLoaded) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        setToastMessage("Welcome back! 🎉");
        setToastType("success");
        setShowToast(true);
        
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        setError("Invalid email or password");
      }
    } catch (err: any) {
      // ✅ Better error handling with rate limiting
      const errorCode = err.errors?.[0]?.code;
      if (errorCode === "too_many_requests") {
        setError("Too many failed attempts. Please try again in a few minutes.");
      } else if (errorCode === "form_identifier_not_found") {
        setError("No account found with this email. Please sign up first.");
      } else {
        setError(err.errors?.[0]?.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={2500}
          onClose={() => {
            setShowToast(false);
            setToastMessage("");
          }}
        />
      )}

      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Sign in to Adin AI
          </h2>
          <p className="text-[#a1a1aa] text-sm mt-1">
            Welcome back! Please sign in to continue
          </p>
        </div>

        <GoogleButton onLoadingChange={setIsGoogleLoading} />

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={emailInputRef}
            type="email"
            label="Email address"
            placeholder="name@example.com"
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3 animate-fade-in">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading || isGoogleLoading}
            disabled={isLoading || isGoogleLoading || !!emailError}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#71717a] text-sm">
            Don't have an account?{" "}
            <a 
              href="/signup" 
              className="text-[#8b5cf6] hover:text-[#a78bfa] font-medium transition-colors"
            >
              Sign up
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