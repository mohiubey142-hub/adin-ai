// src/components/auth/SignupForm.tsx
import { useState, useRef, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { GoogleButton } from "./GoogleButton";
import { Toast } from "../ui/Toast";
import { 
  Rocket, Sparkles, Users, Briefcase, GraduationCap, 
  CheckCircle2, XCircle, Mail, Lock, User, 
  Shield, Zap, Award, Eye, EyeOff,
  FileText, PenTool, Brain, Target, Star, TrendingUp
} from "lucide-react";

interface SignupFormProps {
  onGuestEntry?: (name: string) => void;
  isLoading?: boolean;
}

export const SignupForm = ({ onGuestEntry, isLoading: externalLoading }: SignupFormProps) => {
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // UI states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("error");
  
  // Password strength states
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | "">("");
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Step tracking: 'signup' | 'verify'
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [verificationCode, setVerificationCode] = useState("");

  // ✅ Auto-focus on name input
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  // ✅ Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength("");
      setPasswordChecks({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      return;
    }

    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordChecks(checks);

    const passed = Object.values(checks).filter(Boolean).length;
    if (passed <= 2) setPasswordStrength("weak");
    else if (passed <= 4) setPasswordStrength("medium");
    else setPasswordStrength("strong");
  }, [password]);

  // ✅ Check if form is valid
  const isFormValid = () => {
    return name.trim().length > 0 && 
           email.length > 0 && 
           password.length >= 8 && 
           password === confirmPassword &&
           termsAccepted;
  };

  // ============================================
  // GUEST ENTRY - Create Account button with name
  // ============================================
  const handleGuestSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // --- Client-side validation ---
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    // ✅ Show welcome toast with name
    setToastMessage(`Welcome, ${name.trim()}! 🎉`);
    setToastType("success");
    setShowToast(true);

    // ✅ Call parent guest entry handler after toast with name
    setTimeout(() => {
      if (onGuestEntry) {
        onGuestEntry(name.trim());
      }
    }, 600);
  };

  // ============================================
  // GUEST ENTRY - Google button with name
  // ============================================
  const handleGoogleGuestEntry = () => {
    setLoading(true);

    // ✅ Validate name before Google entry
    if (!name.trim()) {
      setError("Please enter your full name");
      setLoading(false);
      return;
    }

    // ✅ Show welcome toast with name
    setToastMessage(`Welcome, ${name.trim()}! 🎉`);
    setToastType("success");
    setShowToast(true);

    // ✅ Call parent guest entry handler after toast with name
    setTimeout(() => {
      setLoading(false);
      if (onGuestEntry) {
        onGuestEntry(name.trim());
      }
    }, 600);
  };

  const combinedLoading = loading || externalLoading || false;

  // ============================================
  // RENDER: Verification Step (Guest Mode - Direct Entry)
  // ============================================
  if (step === "verify") {
    if (onGuestEntry) {
      onGuestEntry(name.trim() || "User");
    }
    return null;
  }

  // ============================================
  // RENDER: Premium Signup Step
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

      <div className="w-full max-w-md mx-auto p-4 md:p-6">
        {/* ✅ Premium Hero Section */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 ring-2 ring-white/10 animate-pulse-slow">
            <Sparkles size={32} className="text-white" />
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent tracking-tight">
            Create your Adin AI Account
          </h2>
          <p className="text-[#a1a1aa] text-sm md:text-base mt-2 max-w-sm mx-auto">
            Start building your career with AI today.
          </p>
        </div>

        {/* ✅ Value Cards - Glassmorphism */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { icon: Brain, label: "AI Career Assistant", color: "from-purple-500/20 to-purple-600/10" },
            { icon: FileText, label: "Premium CV Builder", color: "from-blue-500/20 to-blue-600/10" },
            { icon: Target, label: "ATS Resume Scanner", color: "from-emerald-500/20 to-emerald-600/10" }
          ].map((item, idx) => (
            <div 
              key={idx}
              className={`p-2 rounded-xl bg-gradient-to-br ${item.color} border border-white/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-default group`}
            >
              <div className="flex flex-col items-center text-center">
                <item.icon size={16} className="text-purple-400 group-hover:text-purple-300 transition-colors mb-1" />
                <span className="text-[8px] md:text-[10px] text-gray-300 leading-tight">{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Google Button - "Sign up with Google" */}
        <div onClick={handleGoogleGuestEntry} className="mb-4">
          <GoogleButton onLoadingChange={setLoading}>
            Sign up with Google
          </GoogleButton>
        </div>

        {/* ✅ OR Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(63,63,70,0.3)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-[rgba(12,12,20,0.82)] text-[#71717a] tracking-wider">
              or create account with email
            </span>
          </div>
        </div>

        {/* ✅ Premium Form */}
        <form onSubmit={handleGuestSignup} className="space-y-3.5">
          {/* Full Name with Icon */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b] z-10">
              <User size={16} />
            </div>
            <Input
              ref={nameInputRef}
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="pl-10"
            />
          </div>

          {/* Email with Icon */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b] z-10">
              <Mail size={16} />
            </div>
            <Input
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
            />
          </div>

          {/* Password with Icon + Toggle */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b] z-10">
              <Lock size={16} />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-gray-300 transition-colors z-10"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      passwordStrength === "weak" ? "w-1/3 bg-red-500" :
                      passwordStrength === "medium" ? "w-2/3 bg-yellow-500" :
                      passwordStrength === "strong" ? "w-full bg-emerald-500" : "w-0"
                    }`}
                  />
                </div>
                <span className={`text-[10px] font-medium min-w-[50px] text-right ${
                  passwordStrength === "weak" ? "text-red-400" :
                  passwordStrength === "medium" ? "text-yellow-400" :
                  passwordStrength === "strong" ? "text-emerald-400" : "text-zinc-500"
                }`}>
                  {passwordStrength ? passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1) : ""}
                </span>
              </div>

              {/* Password Requirements Checklist */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
                {[
                  { key: 'length', label: '8+ characters' },
                  { key: 'uppercase', label: 'Uppercase' },
                  { key: 'lowercase', label: 'Lowercase' },
                  { key: 'number', label: 'Number' },
                  { key: 'special', label: 'Special character' }
                ].map((req) => (
                  <div key={req.key} className="flex items-center gap-1.5">
                    {passwordChecks[req.key as keyof typeof passwordChecks] ? (
                      <CheckCircle2 size={10} className="text-emerald-400" />
                    ) : (
                      <XCircle size={10} className="text-zinc-600" />
                    )}
                    <span className={passwordChecks[req.key as keyof typeof passwordChecks] ? "text-gray-300" : "text-zinc-500"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b] z-10">
              <Lock size={16} />
            </div>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-gray-300 transition-colors z-10"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password match indicator */}
          {confirmPassword && password && (
            <p className={`text-[10px] -mt-1 ${
              password === confirmPassword ? "text-emerald-400" : "text-red-400"
            }`}>
              {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3 animate-fade-in">
              {error}
            </div>
          )}

          {/* ✅ Terms Checkbox */}
          <div className="flex items-start gap-2.5 mt-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-purple-500 focus:ring-purple-500/20 focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer mt-0.5"
            />
            <label htmlFor="terms" className="text-[11px] text-[#a1a1aa] cursor-pointer select-none">
              I agree to the{" "}
              <a href="/terms-of-service" className="text-[#8b5cf6] hover:text-[#a78bfa] hover:underline transition-colors">
                Terms of Service
              </a>
              {" "}and{" "}
              <a href="/privacy-policy" className="text-[#8b5cf6] hover:text-[#a78bfa] hover:underline transition-colors">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* ✅ Premium "Create Free Account" Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={combinedLoading}
            disabled={combinedLoading || !isFormValid()}
            className="relative overflow-hidden group h-11 text-base font-semibold"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {combinedLoading ? "Creating Account..." : "Create Free Account"}
              {!combinedLoading && <Rocket size={16} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all duration-300" />}
            </span>
            {/* ✅ Premium button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-90" />
          </Button>
        </form>

        {/* ✅ Bottom: Already have an account */}
        <div className="mt-6 text-center">
          <p className="text-[#71717a] text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#8b5cf6] hover:text-[#a78bfa] font-medium transition-all hover:underline underline-offset-2 decoration-2 decoration-purple-500/30"
            >
              Sign In
            </a>
          </p>
        </div>

        {/* ✅ Trust Section - Premium Badges */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Shield, label: "Secure" },
              { icon: Lock, label: "Private" },
              { icon: Star, label: "Free Forever" },
              { icon: Zap, label: "No Spam" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                <item.icon size={10} className="text-purple-400" />
                <span className="text-[8px] md:text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Add shimmer animation to global styles */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `}</style>
    </>
  );
};