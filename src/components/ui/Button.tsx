// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "google" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white shadow-lg shadow-[rgba(124,58,237,0.3)] hover:shadow-[rgba(124,58,237,0.4)] hover:-translate-y-0.5",
    secondary:
      "bg-[rgba(24,24,27,0.7)] border border-[rgba(39,39,42,0.4)] text-[#e4e4e7] hover:bg-[rgba(39,39,42,0.8)] hover:border-[rgba(63,63,70,0.6)]",
    google:
      "bg-[rgba(24,24,27,0.7)] border border-[rgba(39,39,42,0.4)] text-[#e4e4e7] hover:bg-[rgba(39,39,42,0.8)] hover:border-[rgba(63,63,70,0.6)]",
    outline:
      "border-2 border-[rgba(124,58,237,0.4)] text-[#d4d4d8] hover:bg-[rgba(124,58,237,0.05)]",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
};