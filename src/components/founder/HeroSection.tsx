// src/components/founder/HeroSection.tsx
import { useState, useEffect } from "react";
import { MapPin, Calendar, X, ZoomIn } from "lucide-react";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  // ✅ Body scroll lock when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // ✅ Handle outside click (click on backdrop)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6">
        {/* Background Glow */}
        <div className="absolute top-[-30%] left-[-20%] w-[600px] h-[600px] bg-[#7c3aed] opacity-[0.05] rounded-full blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[550px] h-[550px] bg-[#2563eb] opacity-[0.04] rounded-full blur-[140px] animate-pulse-slower" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* ✅ Profile Photo - Clickable with Zoom Indicator */}
            <div className="flex-shrink-0">
              <div 
                className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 p-1 shadow-2xl shadow-purple-500/30 cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
                onClick={openModal}
              >
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src="/kian-mercer-profile.png"
                    alt="Kian Mercer, Founder of Adin AI"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                {/* ✅ Zoom indicator overlay - appears on hover */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
                    <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </div>
              {/* ✅ Subtle hint text */}
              <p className="text-[10px] text-gray-500 text-center mt-2 sm:mt-3 cursor-pointer hover:text-purple-400 transition-colors" onClick={openModal}>
                Click to view full size
              </p>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Kian Mercer
              </h1>
              <p className="text-lg sm:text-xl text-purple-300/80 font-medium mt-1">
                Founder &amp; CEO of Adin AI
              </p>
              
              <p className="text-sm text-gray-400 mt-3 max-w-xl mx-auto md:mx-0">
                Building AI-powered career tools for students and freelancers.
                Pakistan's youngest AI product founder.
              </p>

              {/* Premium Badges */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-medium shadow-lg shadow-purple-500/10">
                  16 Years Old
                </span>
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/40 text-blue-300 text-sm font-medium shadow-lg shadow-blue-500/10">
                  Pakistan
                </span>
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-medium shadow-lg shadow-emerald-500/10">
                  AI Product Builder
                </span>
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-sm font-medium shadow-lg shadow-amber-500/10">
                  92% Matric
                </span>
              </div>

              {/* Location & Age */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-400 justify-center md:justify-start">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-purple-400" /> 
                  Mananwala, Sheikhupura, Pakistan
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-blue-400" /> 
                  16 (17 in progress)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ FULL-SCREEN IMAGE MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8"
          onClick={handleBackdropClick}
        >
          {/* ✅ Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white hover:scale-110"
            aria-label="Close image preview"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* ✅ Image Container - with zoom/scroll support */}
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src="/kian-mercer-profile.png"
              alt="Kian Mercer, Founder of Adin AI - Full Size Preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl shadow-purple-500/20"
              loading="lazy"
            />
          </div>

          {/* ✅ Hint text for mobile */}
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 sm:text-sm">
            Pinch to zoom • Click outside or press ESC to close
          </p>
        </div>
      )}
    </>
  );
}