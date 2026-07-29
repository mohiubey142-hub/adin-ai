// src/components/Onboarding.tsx
import { useState, useEffect, useRef } from "react";
import { ArrowRight, User, ChevronDown, Check, AlertCircle } from "lucide-react";

interface OnboardingProps {
  onComplete: (name: string) => void;
}

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not", label: "Prefer not to say" },
  { value: "other", label: "Other" },
];

// ✅ Complete Country List with Flags
const COUNTRIES = [
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "AD", name: "Andorra", flag: "🇦🇩" },
  { code: "AO", name: "Angola", flag: "🇦🇴" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "AM", name: "Armenia", flag: "🇦🇲" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "BB", name: "Barbados", flag: "🇧🇧" },
  { code: "BY", name: "Belarus", flag: "🇧🇾" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "BZ", name: "Belize", flag: "🇧🇿" },
  { code: "BJ", name: "Benin", flag: "🇧🇯" },
  { code: "BT", name: "Bhutan", flag: "🇧🇹" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { code: "BW", name: "Botswana", flag: "🇧🇼" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "BN", name: "Brunei", flag: "🇧🇳" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "BI", name: "Burundi", flag: "🇧🇮" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CV", name: "Cape Verde", flag: "🇨🇻" },
  { code: "CF", name: "Central African Republic", flag: "🇨🇫" },
  { code: "TD", name: "Chad", flag: "🇹🇩" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "KM", name: "Comoros", flag: "🇰🇲" },
  { code: "CG", name: "Congo", flag: "🇨🇬" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯" },
  { code: "DM", name: "Dominica", flag: "🇩🇲" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶" },
  { code: "ER", name: "Eritrea", flag: "🇪🇷" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "FJ", name: "Fiji", flag: "🇫🇯" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "GM", name: "Gambia", flag: "🇬🇲" },
  { code: "GE", name: "Georgia", flag: "🇬🇪" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "GN", name: "Guinea", flag: "🇬🇳" },
  { code: "GW", name: "Guinea-Bissau", flag: "🇬🇼" },
  { code: "GY", name: "Guyana", flag: "🇬🇾" },
  { code: "HT", name: "Haiti", flag: "🇭🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "KI", name: "Kiribati", flag: "🇰🇮" },
  { code: "KP", name: "North Korea", flag: "🇰🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬" },
  { code: "LA", name: "Laos", flag: "🇱🇦" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },
  { code: "LS", name: "Lesotho", flag: "🇱🇸" },
  { code: "LR", name: "Liberia", flag: "🇱🇷" },
  { code: "LY", name: "Libya", flag: "🇱🇾" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬" },
  { code: "MW", name: "Malawi", flag: "🇲🇼" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "MV", name: "Maldives", flag: "🇲🇻" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "MH", name: "Marshall Islands", flag: "🇲🇭" },
  { code: "MR", name: "Mauritania", flag: "🇲🇷" },
  { code: "MU", name: "Mauritius", flag: "🇲🇺" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "FM", name: "Micronesia", flag: "🇫🇲" },
  { code: "MD", name: "Moldova", flag: "🇲🇩" },
  { code: "MC", name: "Monaco", flag: "🇲🇨" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲" },
  { code: "NA", name: "Namibia", flag: "🇳🇦" },
  { code: "NR", name: "Nauru", flag: "🇳🇷" },
  { code: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "NE", name: "Niger", flag: "🇳🇪" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "PW", name: "Palau", flag: "🇵🇼" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "PG", name: "Papua New Guinea", flag: "🇵🇬" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "KN", name: "Saint Kitts and Nevis", flag: "🇰🇳" },
  { code: "LC", name: "Saint Lucia", flag: "🇱🇨" },
  { code: "VC", name: "Saint Vincent", flag: "🇻🇨" },
  { code: "WS", name: "Samoa", flag: "🇼🇸" },
  { code: "SM", name: "San Marino", flag: "🇸🇲" },
  { code: "ST", name: "Sao Tome and Principe", flag: "🇸🇹" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "SN", name: "Senegal", flag: "🇸🇳" },
  { code: "RS", name: "Serbia", flag: "🇷🇸" },
  { code: "SC", name: "Seychelles", flag: "🇸🇨" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "SB", name: "Solomon Islands", flag: "🇸🇧" },
  { code: "SO", name: "Somalia", flag: "🇸🇴" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "SS", name: "South Sudan", flag: "🇸🇸" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "SD", name: "Sudan", flag: "🇸🇩" },
  { code: "SR", name: "Suriname", flag: "🇸🇷" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "SY", name: "Syria", flag: "🇸🇾" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "TJ", name: "Tajikistan", flag: "🇹🇯" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "TL", name: "Timor-Leste", flag: "🇹🇱" },
  { code: "TG", name: "Togo", flag: "🇹🇬" },
  { code: "TO", name: "Tonga", flag: "🇹🇴" },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲" },
  { code: "TV", name: "Tuvalu", flag: "🇹🇻" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿" },
  { code: "VU", name: "Vanuatu", flag: "🇻🇺" },
  { code: "VA", name: "Vatican City", flag: "🇻🇦" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "YE", name: "Yemen", flag: "🇾🇪" },
  { code: "ZM", name: "Zambia", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼" },
];

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const YEARS = Array.from({ length: 100 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

const DAYS = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  return { value: day.toString().padStart(2, '0'), label: day.toString() };
});

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [name, setName] = useState(() => {
    const saved = localStorage.getItem("adin_onboarding_name");
    return saved || "";
  });
  const [gender, setGender] = useState(() => {
    const saved = localStorage.getItem("adin_onboarding_gender");
    return saved || "";
  });
  const [country, setCountry] = useState(() => {
    const saved = localStorage.getItem("adin_onboarding_country");
    return saved || "";
  });
  const [month, setMonth] = useState(() => {
    const saved = localStorage.getItem("adin_onboarding_month");
    return saved || "";
  });
  const [day, setDay] = useState(() => {
    const saved = localStorage.getItem("adin_onboarding_day");
    return saved || "";
  });
  const [year, setYear] = useState(() => {
    const saved = localStorage.getItem("adin_onboarding_year");
    return saved || "";
  });
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [showEnterAnimation, setShowEnterAnimation] = useState(false);
  
  // Validation error states - specific to each field
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    gender: "",
    country: "",
    dob: "",
  });

  const genderRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // ✅ Save form data to localStorage on change
  useEffect(() => {
    localStorage.setItem("adin_onboarding_name", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("adin_onboarding_gender", gender);
  }, [gender]);

  useEffect(() => {
    localStorage.setItem("adin_onboarding_country", country);
  }, [country]);

  useEffect(() => {
    localStorage.setItem("adin_onboarding_month", month);
  }, [month]);

  useEffect(() => {
    localStorage.setItem("adin_onboarding_day", day);
  }, [day]);

  useEffect(() => {
    localStorage.setItem("adin_onboarding_year", year);
  }, [year]);

  // ✅ Auto-focus on name input
  useEffect(() => {
    if (nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 300);
    }
  }, []);

  // ✅ Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genderRef.current && !genderRef.current.contains(event.target as Node)) {
        setIsGenderOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Calculate age from DOB
  useEffect(() => {
    if (month && day && year) {
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [month, day, year]);

  // ✅ Check if form is valid
  const isFormValid = () => {
    return name.trim().length > 0 && gender && country && month && day && year && age !== null && age >= 18;
  };

  // ✅ Validate specific fields on button click
  const validateForm = () => {
    const errors = {
      name: "",
      gender: "",
      country: "",
      dob: "",
    };
    let hasError = false;

    if (!name.trim()) {
      errors.name = "Please enter your full name.";
      hasError = true;
    }

    if (!gender) {
      errors.gender = "Please select your gender.";
      hasError = true;
    }

    if (!country) {
      errors.country = "Please select your country.";
      hasError = true;
    }

    if (!month || !day || !year) {
      errors.dob = "Please select your date of birth.";
      hasError = true;
    } else if (age !== null && age < 18) {
      errors.dob = "You must be at least 18 years old to continue.";
      hasError = true;
    }

    setValidationErrors(errors);
    return !hasError;
  };

  // ✅ Clear specific field error on input change
  const clearFieldError = (field: keyof typeof validationErrors) => {
    setValidationErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // ✅ Handle Continue with Enter Animation
  const handleContinue = () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError("");

    // ✅ Show enter animation overlay
    setShowEnterAnimation(true);

    // ✅ After 3.5 seconds, complete
    setTimeout(() => {
      setIsLoading(false);
      setShowEnterAnimation(false);
      // ✅ Clear onboarding data from localStorage after completion
      localStorage.removeItem("adin_onboarding_name");
      localStorage.removeItem("adin_onboarding_gender");
      localStorage.removeItem("adin_onboarding_country");
      localStorage.removeItem("adin_onboarding_month");
      localStorage.removeItem("adin_onboarding_day");
      localStorage.removeItem("adin_onboarding_year");
      onComplete(name.trim());
    }, 3500);
  };

  // ============================================
  // RENDER: Enter Animation Overlay
  // ============================================
  if (showEnterAnimation) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-8 animate-fade-in">
          {/* Logo */}
          <img 
            src="/icon-1024x1024.png" 
            alt="Adin AI" 
            className="w-24 h-24 rounded-2xl shadow-2xl shadow-purple-500/30 animate-pulse-slow"
          />
          
          {/* Loading Text */}
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Entering Adin AI
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-64 h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-progress" />
          </div>
        </div>
        
        <style>{`
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }
          .animate-progress {
            animation: progress 3s ease-in-out forwards;
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // RENDER: User Information Form
  // ============================================
  return (
    <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden bg-[#000000]">
      
      {/* ✅ Full Black Background */}
      <div className="fixed inset-0 bg-[#000000]" />
      
      {/* ✅ Subtle glow behind logo */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      
      {/* ✅ Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md mx-auto p-6 animate-fade-in">
          {/* ✅ Adin AI Icon from public folder */}
          <div className="flex justify-center mb-8">
            <img 
              src="/icon-1024x1024.png" 
              alt="Adin AI" 
              className="w-20 h-20 rounded-2xl shadow-lg shadow-purple-500/20"
            />
          </div>

          {/* Heading */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Welcome to Adin AI
            </h2>
            <p className="text-[#71717a] text-sm mt-3">
              No login • No sign up • Start in seconds • 100% Free
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]">
                  <User size={18} />
                </div>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError("name");
                  }}
                  placeholder="Enter your full name"
                  className={`w-full h-12 pl-10 pr-4 rounded-xl bg-[#050505] border ${
                    validationErrors.name 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : name.trim() 
                        ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20' 
                        : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                  } text-white placeholder-zinc-500 focus:ring-2 outline-none transition-all duration-300`}
                />
              </div>
              {validationErrors.name && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 animate-fade-in">
                  <AlertCircle size={12} />
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Gender - Premium Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Gender <span className="text-red-400">*</span>
              </label>
              <div className="relative" ref={genderRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsGenderOpen(!isGenderOpen);
                    clearFieldError("gender");
                  }}
                  className={`w-full h-12 px-4 rounded-xl bg-[#050505] border ${
                    validationErrors.gender 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : gender 
                        ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20' 
                        : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                  } text-white flex items-center justify-between transition-all duration-300 focus:ring-2 outline-none`}
                >
                  <span className={gender ? "text-white" : "text-zinc-500"}>
                    {gender ? GENDER_OPTIONS.find(g => g.value === gender)?.label || "Select gender" : "Select gender"}
                  </span>
                  <ChevronDown size={18} className={`text-zinc-400 transition-transform duration-300 ${isGenderOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Options */}
                {isGenderOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-[#050505] border border-white/10 overflow-hidden z-20 animate-slide-down max-h-48 overflow-y-auto custom-scrollbar">
                    {GENDER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setGender(option.value);
                          setIsGenderOpen(false);
                          clearFieldError("gender");
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-between"
                      >
                        {option.label}
                        {gender === option.value && <Check size={16} className="text-purple-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {validationErrors.gender && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 animate-fade-in">
                  <AlertCircle size={12} />
                  {validationErrors.gender}
                </p>
              )}
            </div>

            {/* Country - Dropdown with Flag */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Country <span className="text-red-400">*</span>
              </label>
              <div className="relative" ref={countryRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCountryOpen(!isCountryOpen);
                    clearFieldError("country");
                  }}
                  className={`w-full h-12 px-4 rounded-xl bg-[#050505] border ${
                    validationErrors.country 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : country 
                        ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20' 
                        : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                  } text-white flex items-center justify-between transition-all duration-300 focus:ring-2 outline-none`}
                >
                  <span className={country ? "text-white flex items-center gap-2" : "text-zinc-500"}>
                    {country ? (
                      <>
                        <span>{COUNTRIES.find(c => c.code === country)?.flag}</span>
                        <span>{COUNTRIES.find(c => c.code === country)?.name}</span>
                      </>
                    ) : (
                      "Select your country"
                    )}
                  </span>
                  <ChevronDown size={18} className={`text-zinc-400 transition-transform duration-300 ${isCountryOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Country Dropdown Options */}
                {isCountryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-[#050505] border border-white/10 overflow-hidden z-20 animate-slide-down max-h-48 overflow-y-auto custom-scrollbar">
                    {COUNTRIES.map((countryItem) => (
                      <button
                        key={countryItem.code}
                        type="button"
                        onClick={() => {
                          setCountry(countryItem.code);
                          setIsCountryOpen(false);
                          clearFieldError("country");
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="flex items-center gap-2">
                          <span>{countryItem.flag}</span>
                          <span>{countryItem.name}</span>
                        </span>
                        {country === countryItem.code && <Check size={16} className="text-purple-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {validationErrors.country && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 animate-fade-in">
                  <AlertCircle size={12} />
                  {validationErrors.country}
                </p>
              )}
            </div>

            {/* Date of Birth - Month/Date/Year Dropdowns */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Date of Birth <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Month */}
                <div className="relative">
                  <select
                    value={month}
                    onChange={(e) => {
                      setMonth(e.target.value);
                      clearFieldError("dob");
                    }}
                    className={`w-full h-12 px-3 rounded-xl bg-[#050505] border ${
                      validationErrors.dob 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : month 
                          ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20' 
                          : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                    } text-white appearance-none focus:ring-2 outline-none transition-all duration-300 cursor-pointer`}
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>

                {/* Day */}
                <div className="relative">
                  <select
                    value={day}
                    onChange={(e) => {
                      setDay(e.target.value);
                      clearFieldError("dob");
                    }}
                    className={`w-full h-12 px-3 rounded-xl bg-[#050505] border ${
                      validationErrors.dob 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : day 
                          ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20' 
                          : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                    } text-white appearance-none focus:ring-2 outline-none transition-all duration-300 cursor-pointer`}
                  >
                    <option value="">Day</option>
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>

                {/* Year */}
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      clearFieldError("dob");
                    }}
                    className={`w-full h-12 px-3 rounded-xl bg-[#050505] border ${
                      validationErrors.dob 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : year 
                          ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20' 
                          : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                    } text-white appearance-none focus:ring-2 outline-none transition-all duration-300 cursor-pointer`}
                  >
                    <option value="">Year</option>
                    {YEARS.map((y) => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              
              {/* Age Display - Only show when valid */}
              {age !== null && age >= 18 && month && day && year && (
                <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1.5 animate-fade-in">
                  <Check size={14} /> Age: {age} years
                </p>
              )}
              
              {/* DOB Validation Error */}
              {validationErrors.dob && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 animate-fade-in">
                  <AlertCircle size={12} />
                  {validationErrors.dob}
                </p>
              )}
            </div>

            {/* General Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm flex items-start gap-2.5 animate-fade-in">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Continue Button - Always enabled */}
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="relative w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Setting up your account...
                  </>
                ) : (
                  <>
                    Continue to Adin AI
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer" />
            </button>

            {/* ✅ Bottom Trust Section */}
            <div className="text-center mt-4">
              <p className="text-[#52525b] text-xs flex items-center justify-center gap-1.5">
                <span>🔒</span>
                <span>One-time setup • You won't see this page again</span>
              </p>
            </div>
          </div>

          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .animate-shimmer {
              animation: shimmer 2s linear infinite;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fadeIn 0.2s ease-out forwards;
            }
            .animate-slide-down {
              animation: slideDown 0.2s ease-out forwards;
            }
            
            /* ✅ Professional Scrollbar - Always Visible & Matching UI */
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }

            ::-webkit-scrollbar-track {
              background: rgba(139, 92, 246, 0.05);
              border-radius: 10px;
              border: 1px solid rgba(139, 92, 246, 0.05);
            }

            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.5));
              border-radius: 10px;
              border: 1px solid rgba(139, 92, 246, 0.1);
              transition: background 0.3s ease, border-color 0.3s ease;
              box-shadow: 0 0 10px rgba(139, 92, 246, 0.05);
            }

            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.7), rgba(59, 130, 246, 0.7));
              border-color: rgba(139, 92, 246, 0.2);
              box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
            }

            ::-webkit-scrollbar-thumb:active {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.85), rgba(59, 130, 246, 0.85));
              border-color: rgba(139, 92, 246, 0.3);
              box-shadow: 0 0 30px rgba(139, 92, 246, 0.15);
            }

            /* For Firefox */
            * {
              scrollbar-width: thin;
              scrollbar-color: rgba(139, 92, 246, 0.5) rgba(139, 92, 246, 0.05);
            }
            
            /* ✅ Custom scrollbar for dropdowns */
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(139, 92, 246, 0.04);
              border-radius: 10px;
              border: 1px solid rgba(139, 92, 246, 0.04);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.5));
              border-radius: 10px;
              border: 1px solid rgba(139, 92, 246, 0.08);
              transition: background 0.3s ease, border-color 0.3s ease;
              box-shadow: 0 0 10px rgba(139, 92, 246, 0.03);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.7), rgba(59, 130, 246, 0.7));
              border-color: rgba(139, 92, 246, 0.15);
              box-shadow: 0 0 20px rgba(139, 92, 246, 0.08);
            }
            
            /* For Firefox */
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(139, 92, 246, 0.5) rgba(139, 92, 246, 0.04);
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};