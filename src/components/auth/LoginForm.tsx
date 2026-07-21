// src/components/auth/LoginForm.tsx
import { useState, useEffect, useRef } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { GoogleButton } from "./GoogleButton";
import { Toast } from "../ui/Toast";

// ✅ Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface LoginFormProps {
  onGuestEntry?: (name: string) => void;
  isLoading?: boolean;
}

export const LoginForm = ({ onGuestEntry, isLoading: externalLoading }: LoginFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("error");

  // ✅ Auto-focus on name input
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
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

  // ✅ Check if form is valid (name required + email valid + password)
  const isFormValid = () => {
    return name.trim().length > 0 && EMAIL_REGEX.test(email) && password.length > 0;
  };

  // ✅ Guest Entry Handler for "Continue" button
  const handleGuestSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ✅ Validate name
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    // ✅ Validate email before submit
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // ✅ Show welcome toast then trigger guest entry with name
    setToastMessage(`Welcome, ${name.trim()}! 🎉`);
    setToastType("success");
    setShowToast(true);

    // ✅ Call parent guest entry handler after toast
    setTimeout(() => {
      if (onGuestEntry) {
        onGuestEntry(name.trim());
      }
    }, 600);
  };

  // ✅ Guest Entry Handler for Google button
  const handleGoogleGuestEntry = () => {
    setIsGoogleLoading(true);

    // ✅ Validate name before Google entry
    if (!name.trim()) {
      setError("Please enter your name");
      setIsGoogleLoading(false);
      return;
    }

    // ✅ Show welcome toast
    setToastMessage(`Welcome, ${name.trim()}! 🎉`);
    setToastType("success");
    setShowToast(true);

    // ✅ Call parent guest entry handler after toast
    setTimeout(() => {
      setIsGoogleLoading(false);
      if (onGuestEntry) {
        onGuestEntry(name.trim());
      }
    }, 600);
  };

  const combinedLoading = isLoading || isGoogleLoading || externalLoading || false;

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
            Welcome to Adin AI
          </h2>
          <p className="text-[#a1a1aa] text-sm mt-1">
            Enter your name to get started
          </p>
        </div>

        {/* ✅ Google Button - Now triggers Guest Entry with name */}
        <div onClick={handleGoogleGuestEntry}>
          <GoogleButton onLoadingChange={setIsGoogleLoading} />
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

        {/* ✅ Sign In form - Now triggers Guest Entry with name */}
        <form onSubmit={handleGuestSignIn} className="space-y-4">
          {/* ✅ NEW: Your Name field - Required */}
          <Input
            ref={nameInputRef}
            type="text"
            label="Your Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
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
            isLoading={combinedLoading}
            disabled={combinedLoading || !isFormValid()}
          >
            Continue
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
            Secure by Adin AI
          </p>
        </div>
      </div>
    </>
  );
};